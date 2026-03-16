import { Suspense } from "react";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLoading from "@/components/ui/page-loading";
import { getModules, getPermissions, getRoleByIdAction } from "@/lib/features/roles/actions";
import type { RoleDetailPageProps } from "@/lib/features/roles/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { RolePermissionsManager } from "./role-permissions-manager";

export const metadata = generateCrudMetadata("Roles");

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
	const { id } = await params;

	const [roleResult, modulesResult, permissionsResult] = await Promise.all([getRoleByIdAction(id), getModules(), getPermissions()]);

	if (!roleResult.success) {
		return (
			<div className="p-8 text-center">
				<p className="text-red-500">{roleResult.message}</p>
				<Link
					href="/roles"
					className="mt-4">
					<Button variant="outline">
						<ArrowLeft className="h-4 w-4" />
						Back to Roles
					</Button>
				</Link>
			</div>
		);
	}

	const role = roleResult.data;

	if (!role) {
		return (
			<div className="p-8 text-center">
				<p className="text-red-500">Role data is missing</p>
				<Link
					href="/roles"
					className="mt-4">
					<Button variant="outline">
						<ArrowLeft className="h-4 w-4" />
						Back to Roles
					</Button>
				</Link>
			</div>
		);
	}

	const isSystemRole = ["admin", "manager", "user"].includes(role.name);

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={role.displayName}
				/>
				<div className="space-y-6">
					{/* Header Section */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">{role.displayName}</h1>
							<p className="text-muted-foreground">{role.name}</p>
							{isSystemRole && (
								<Badge
									variant="secondary"
									className="mt-2">
									System Role
								</Badge>
							)}
						</div>
						{!isSystemRole && (
							<Link href={`/roles/${id}/edit`}>
								<Button>
									<Pencil className="h-4 w-4" />
									Edit Role
								</Button>
							</Link>
						)}
					</div>
					{/* Role Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Role Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div>
									<p className="text-muted-foreground text-sm font-medium">Internal Name</p>
									<p className="mt-1 font-mono text-sm">{role.name}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Display Name</p>
									<p className="mt-1 text-sm">{role.displayName}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-muted-foreground text-sm font-medium">Description</p>
									<p className="text-muted-foreground mt-1 text-sm">{role.description || "No description provided"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Created</p>
									<p className="mt-1 text-sm">{new Date(role.createdAt).toLocaleDateString()}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">Last Updated</p>
									<p className="mt-1 text-sm">{new Date(role.updatedAt).toLocaleDateString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Role Permissions */}
					{modulesResult.success && permissionsResult.success && (
						<RolePermissionsManager
							roleId={id}
							roleName={role.name}
							currentPermissions={role.permissions}
							modules={modulesResult.data || []}
							permissions={permissionsResult.data || []}
							isSystemRole={isSystemRole}
						/>
					)}
				</div>
			</>
		</Suspense>
	);
}
