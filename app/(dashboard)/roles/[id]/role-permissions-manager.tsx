"use client";

import { useState } from "react";

import { Shield } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assignPermissionToRole, removePermissionFromRole } from "@/lib/features/roles/actions";
import type { RolePermission, RolePermissionsManagerProps } from "@/lib/features/roles/types";

export function RolePermissionsManager({ roleId, roleName, currentPermissions, modules, permissions, isSystemRole }: RolePermissionsManagerProps) {
	const [loading, setLoading] = useState(false);
	const [permissionsList, setPermissionsList] = useState<RolePermission[]>(currentPermissions);

	const handleAssignPermission = async (moduleId: string, permissionId: string) => {
		setLoading(true);
		try {
			const result = await assignPermissionToRole(roleId, moduleId, permissionId);
			if (result.success) {
				// Add permission to local state
				const moduleData = modules.find((m) => m.id === moduleId);
				const permission = permissions.find((p) => p.id === permissionId);

				if (moduleData && permission) {
					const newPermission: RolePermission = {
						id: permissionId,
						module: {
							id: moduleData.id,
							name: moduleData.name,
							displayName: moduleData.displayName,
						},
						action: permission.action,
						displayName: permission.displayName,
					};
					setPermissionsList([...permissionsList, newPermission]);
				}
				toast.success("Permission assigned");
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Error assigning permission");
		} finally {
			setLoading(false);
		}
	};

	const handleRemovePermission = async (moduleId: string, permissionId: string) => {
		setLoading(true);
		try {
			const result = await removePermissionFromRole(roleId, moduleId, permissionId);
			if (result.success) {
				// Remove permission from local state
				const permission = permissions.find((p) => p.id === permissionId);
				if (permission) {
					setPermissionsList(permissionsList.filter((p) => !(p.module.id === moduleId && p.action === permission.action)));
				}
				toast.success("Permission removed");
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Error removing permission");
		} finally {
			setLoading(false);
		}
	};

	const hasPermission = (moduleId: string, permissionId: string) => {
		// Find the permission details to get its action
		const permission = permissions.find((p) => p.id === permissionId);
		if (!permission) return false;

		// Check if role has this module + action combination
		return permissionsList.some((p) => p.module.id === moduleId && p.action === permission.action);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Permissions Matrix</CardTitle>
						<p className="text-muted-foreground mt-1 text-sm">Manage module and action permissions for "{roleName}"</p>
					</div>
					{isSystemRole && <Badge variant="secondary">System Role</Badge>}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{isSystemRole && (
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
						<p className="text-sm text-yellow-800">System roles cannot have permissions modified. Create a custom role to test permission assignment.</p>
					</div>
				)}

				<div className="overflow-x-auto rounded-lg border">
					<Table className="bg-white dark:bg-black">
						<TableHeader className="bg-slate-50 dark:bg-black">
							<TableRow className="border-b-2">
								<TableHead className="text-foreground px-4 py-2 font-bold">Module</TableHead>
								{permissions.map((permission) => (
									<TableHead
										key={permission.id}
										className="text-foreground py-2 font-bold">
										<span className="text-sm">{permission.displayName}</span>
										<span className="text-muted-foreground ml-1 text-xs font-normal">({permission.action})</span>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{modules.map((module, moduleIndex) => (
								<TableRow
									key={module.id}
									className={`border-b transition-colors ${moduleIndex % 2 === 0 ? "bg-white dark:bg-black" : "bg-slate-50 dark:bg-black/80"} hover:bg-blue-50 dark:hover:bg-white/10`}>
									<TableCell className="px-4 py-2 font-medium">
										<div className="flex items-center space-x-2">
											<Shield />
											<div>
												<div className="text-sm font-semibold">{module.displayName}</div>
												<div className="text-muted-foreground text-xs">{module.name}</div>
											</div>
										</div>
									</TableCell>
									{permissions.map((permission) => {
										const hasIt = hasPermission(module.id, permission.id);
										return (
											<TableCell
												key={permission.id}
												className="py-1">
												<button
													onClick={() => {
														if (hasIt) {
															handleRemovePermission(module.id, permission.id);
														} else {
															handleAssignPermission(module.id, permission.id);
														}
													}}
													disabled={isSystemRole || loading}
													className={`inline-block ${isSystemRole || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
													title={isSystemRole ? "Cannot modify system role permissions" : `Click to ${hasIt ? "revoke" : "grant"} ${permission.displayName}`}>
													<Badge
														variant={hasIt ? "default" : "outline"}
														className={hasIt ? "" : "opacity-50"}>
														{hasIt ? "✓ Granted" : "Not Granted"}
													</Badge>
												</button>
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
