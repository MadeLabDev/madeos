"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProfileRolesAndPermissionsProps } from "@/lib/features/users/types";

export function RolesAndPermissions({ roles }: ProfileRolesAndPermissionsProps) {
	// Group permissions by module
	const permissionsByModule = new Map<string, { displayName: string; actions: string[] }>();

	// Only include roles that are actually assigned
	const assignedRoles = Array.isArray(roles) ? roles : [];

	assignedRoles.forEach((role) => {
		if (role.permissions && Array.isArray(role.permissions)) {
			role.permissions.forEach((perm) => {
				const moduleKey = perm.moduleName;
				if (!permissionsByModule.has(moduleKey)) {
					permissionsByModule.set(moduleKey, {
						displayName: perm.moduleDisplayName,
						actions: [],
					});
				}
				const modulePerm = permissionsByModule.get(moduleKey)!;
				if (!modulePerm.actions.includes(perm.permissionAction)) {
					modulePerm.actions.push(perm.permissionAction);
				}
			});
		}
	});

	// Sort modules alphabetically
	const sortedModules = Array.from(permissionsByModule.entries()).sort((a, b) => a[1].displayName.localeCompare(b[1].displayName));

	return (
		<div className="space-y-6">
			{/* Roles */}
			<Card className="p-6">
				<div className="mb-4">
					<h3 className="text-lg font-semibold">Your Roles</h3>
					<p className="text-muted-foreground text-sm">Roles assigned to your account</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{assignedRoles.length > 0 ? (
						assignedRoles.map((role) => (
							<Badge
								key={role.id}
								variant="outline"
								className="px-3 py-2 text-sm">
								{role.displayName}
							</Badge>
						))
					) : (
						<p className="text-muted-foreground text-sm">No roles assigned</p>
					)}
				</div>
			</Card>

			{/* Permissions */}
			<Card className="p-6">
				<div className="mb-4">
					<h3 className="text-lg font-semibold">Your Permissions</h3>
					<p className="text-muted-foreground text-sm">Permissions merged from all your roles</p>
				</div>

				{sortedModules.length > 0 ? (
					<div className="space-y-0">
						{sortedModules.map(([moduleName, moduleData], index) => (
							<div key={moduleName}>
								<div className="flex items-center justify-between gap-4 py-3">
									<span className="flex-1 text-sm font-semibold">{moduleData.displayName}</span>
									<div className="flex flex-wrap justify-end gap-2">
										{moduleData.actions.sort().map((action) => (
											<Badge
												key={`${moduleName}-${action}`}
												variant="secondary"
												className="px-2 py-1 text-xs capitalize">
												{action}
											</Badge>
										))}
									</div>
								</div>
								{index < sortedModules.length - 1 && <Separator />}
							</div>
						))}
					</div>
				) : assignedRoles.length > 0 ? (
					<div className="py-8 text-center">
						<p className="text-muted-foreground text-sm">No permissions assigned to your roles</p>
					</div>
				) : (
					<div className="py-8 text-center">
						<p className="text-muted-foreground text-sm">No roles or permissions assigned</p>
					</div>
				)}
			</Card>
		</div>
	);
}
