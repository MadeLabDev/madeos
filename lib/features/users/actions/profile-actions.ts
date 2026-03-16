"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { invalidateUserCache, invalidateUserProfileCache } from "@/lib/cache/cache-invalidate";
import { prisma } from "@/lib/prisma";

/**
 * Get current user profile data
 */
export async function getProfileData() {
	const session = await auth();

	if (!session?.user?.id) {
		return { success: false, message: "Not authenticated" };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
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
								},
							},
						},
					},
				},
			},
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		return {
			success: true,
			data: {
				id: user.id,
				email: user.email,
				username: user.username,
				name: user.name,
				image: user.image,
				emailVerified: user.emailVerified,
				isActive: user.isActive,
				createdAt: user.createdAt,
				roles: user.userRoles.map((ur) => ({
					id: ur.role.id,
					name: ur.role.name,
					displayName: ur.role.displayName,
					permissions: ur.role.rolePermissions.map((rp) => ({
						moduleId: rp.module.id,
						moduleName: rp.module.name,
						moduleDisplayName: rp.module.displayName,
						permissionId: rp.permission.id,
						permissionAction: rp.permission.action,
						permissionDisplayName: rp.permission.displayName,
					})),
				})),
			},
		};
	} catch (error) {
		console.error("Error fetching profile:", error);
		return { success: false, message: "Failed to fetch profile" };
	}
}

/**
 * Update current user profile
 */
export async function updateProfile(data: { name?: string; username?: string; image?: string }) {
	const session = await auth();

	if (!session?.user?.id) {
		return { success: false, message: "Not authenticated" };
	}

	try {
		// Check username uniqueness if updating username
		if (data.username) {
			const existingUser = await prisma.user.findUnique({
				where: { username: data.username },
			});

			if (existingUser && existingUser.id !== session.user.id) {
				return { success: false, message: "Username already taken" };
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: data.name,
				username: data.username,
				image: data.image,
				updatedAt: new Date(),
			},
		});

		revalidatePath("/profile");
		revalidatePath("/(dashboard)");

		// Invalidate user caches
		await invalidateUserCache(session.user.id);
		await invalidateUserProfileCache(session.user.id);

		return {
			success: true,
			message: "Profile updated successfully",
			data: {
				name: updatedUser.name,
				username: updatedUser.username,
				image: updatedUser.image,
			},
		};
	} catch (error) {
		console.error("Error updating profile:", error);
		return { success: false, message: "Failed to update profile" };
	}
}

/**
 * Change password for current user
 */
export async function changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
	const session = await auth();

	if (!session?.user?.id) {
		return { success: false, message: "Not authenticated" };
	}

	// Validate input
	if (data.newPassword !== data.confirmPassword) {
		return { success: false, message: "Passwords do not match" };
	}

	if (data.newPassword.length < 8) {
		return { success: false, message: "Password must be at least 8 characters" };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!user || !user.password) {
			return { success: false, message: "User not found or password login not enabled" };
		}

		// Verify current password
		const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

		if (!isPasswordValid) {
			return { success: false, message: "Current password is incorrect" };
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(data.newPassword, 10);

		// Update password
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				password: hashedPassword,
				updatedAt: new Date(),
			},
		});

		return { success: true, message: "Password changed successfully" };
	} catch (error) {
		console.error("Error changing password:", error);
		return { success: false, message: "Failed to change password" };
	}
}
