import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
	trustHost: true,
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				emailOrUsername: { label: "Email or Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.emailOrUsername || !credentials?.password) {
					return null;
				}

				const emailOrUsername = credentials.emailOrUsername as string;

				// Try to find user by email or username
				const user = await prisma.user.findFirst({
					where: {
						OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
					},
					include: {
						userRoles: {
							include: {
								role: {
									include: {
										rolePermissions: {
											include: {
												module: true,
												permission: true,
											},
											take: 1000,
										},
									},
								},
							},
							take: 100,
						},
					},
				});

				if (!user || !user.password) {
					return null;
				}

				const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			},
		}),
		GoogleProvider({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "select_account",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			// Allow credentials provider (email/password login)
			if (account?.provider === "credentials") {
				return true;
			}

			// Handle Google OAuth
			if (account?.provider === "google" && profile?.email) {
				try {
					// Check if user exists
					const existingUser = await prisma.user.findUnique({
						where: { email: profile.email },
						include: {
							userRoles: {
								include: {
									role: true,
								},
							},
						},
					});

					// If user exists, allow sign in
					if (existingUser) {
						// Update last login info
						await prisma.user.update({
							where: { id: existingUser.id },
							data: {
								name: profile.name || existingUser.name,
								image: (profile as any).picture || existingUser.image,
								emailVerified: new Date(),
							},
						});
						return true;
					}

					// User doesn't exist - check if we should auto-create
					// For security, only allow Google OAuth for existing users
					// Admins must create user accounts first
					console.warn(`Google sign-in attempted for non-existent user: ${profile.email}`);
					return false;
				} catch (error) {
					console.error("Error in signIn callback:", error);
					return false;
				}
			}

			return true;
		},
		async jwt({ token, user, trigger, session, account }) {
			if (user && user.id) {
				token.id = user.id;
			}

			// For OAuth users, ensure we have the user ID from database
			if (account?.provider === "google" && user?.email) {
				const dbUser = await prisma.user.findUnique({
					where: { email: user.email },
					select: { id: true },
				});
				if (dbUser) {
					token.id = dbUser.id;
				}
			}

			// Load user roles and permissions
			if (token.id) {
				const dbUser = await prisma.user.findUnique({
					where: { id: token.id as string },
					include: {
						userRoles: {
							include: {
								role: true,
							},
							take: 100,
						},
					},
				});

				if (dbUser) {
					// Extract roles
					token.roles = dbUser.userRoles.map((ur) => ({
						id: ur.role.id,
						name: ur.role.name,
						displayName: ur.role.displayName,
					}));

					// Get all role IDs
					const roleIds = dbUser.userRoles.map((ur) => ur.role.id);

					if (roleIds.length > 0) {
						// Query all permissions for these roles directly - use findMany without limit
						const allPermissions = await prisma.rolePermission.findMany({
							where: {
								roleId: { in: roleIds },
							},
							include: {
								module: true,
								permission: true,
							},
						});

						// Merge permissions from all roles (union)
						const permissionsMap = new Map<string, Set<string>>();

						allPermissions.forEach((rp) => {
							const moduleName = rp.module.name;
							if (!permissionsMap.has(moduleName)) {
								permissionsMap.set(moduleName, new Set());
							}
							permissionsMap.get(moduleName)!.add(rp.permission.action);
						});

						// Convert to object format
						const permissions: Record<string, string[]> = {};
						permissionsMap.forEach((actions, module) => {
							permissions[module] = Array.from(actions);
						});

						token.permissions = permissions;
					}
				}
			}

			// Update session
			if (trigger === "update" && session) {
				token = { ...token, ...session };
			}

			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.roles = token.roles as any;
				session.user.permissions = token.permissions as any;
			}
			return session;
		},
	},
});
