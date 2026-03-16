"use client";

import { useState } from "react";

import { Lock, Shield, ShieldCheck, User } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileTabsProps } from "@/lib/features/users/types";

import { TwoFactorSettings } from "./two-factor-settings";
import { ChangePasswordForm, ProfileForm, RolesAndPermissions } from ".";

export function ProfileTabs({ initialData, roles }: ProfileTabsProps) {
	const [activeTab, setActiveTab] = useState("profile");

	return (
		<div className="space-y-6">
			{/* Header with Title and Description */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
					{activeTab === "profile" && "Edit Profile"}
					{activeTab === "security" && "Security Settings"}
					{activeTab === "2fa" && "Two-Factor Authentication"}
					{activeTab === "permissions" && "Roles & Permissions"}
				</h1>
				<p className="text-muted-foreground text-sm lg:text-base">
					{activeTab === "profile" && "Update your personal information and profile details"}
					{activeTab === "security" && "Manage your password and security preferences"}
					{activeTab === "2fa" && "Add an extra layer of security with two-factor authentication"}
					{activeTab === "permissions" && "View and manage your assigned roles and permissions"}
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
				{/* Vertical Tabs List - Top on mobile, Left Sidebar on desktop */}
				<TabsList className="flex h-auto min-w-full basis-auto flex-row gap-2 overflow-x-auto bg-transparent p-0 lg:sticky lg:top-0 lg:min-w-48 lg:flex-col">
					<TabsTrigger
						value="profile"
						className="data-[state=active]:bg-muted w-full flex-shrink-0 justify-start text-sm lg:text-base">
						<User className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
						<span className="hidden sm:inline">Edit Profile</span>
						<span className="sm:hidden">Profile</span>
					</TabsTrigger>
					<TabsTrigger
						value="security"
						className="data-[state=active]:bg-muted w-full flex-shrink-0 justify-start text-sm lg:text-base">
						<Lock className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
						<span className="hidden sm:inline">Security</span>
						<span className="sm:hidden">Security</span>
					</TabsTrigger>
					<TabsTrigger
						value="2fa"
						className="data-[state=active]:bg-muted w-full flex-shrink-0 justify-start text-sm lg:text-base">
						<ShieldCheck className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
						<span className="hidden sm:inline">Two-Factor Auth</span>
						<span className="sm:hidden">2FA</span>
					</TabsTrigger>
					<TabsTrigger
						value="permissions"
						className="data-[state=active]:bg-muted w-full flex-shrink-0 justify-start text-sm lg:text-base">
						<Shield className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
						<span className="hidden sm:inline">Roles & Permissions</span>
						<span className="sm:hidden">Roles</span>
					</TabsTrigger>
				</TabsList>

				{/* Tabs Content - Below on mobile, Right Panel on desktop */}
				<div className="w-full flex-1">
					{/* Edit Profile Tab */}
					<TabsContent
						value="profile"
						className="mt-0 space-y-4">
						<ProfileForm initialData={initialData} />
					</TabsContent>

					{/* Security Tab */}
					<TabsContent
						value="security"
						className="mt-0 space-y-4">
						<ChangePasswordForm />
					</TabsContent>

					{/* Two-Factor Authentication Tab */}
					<TabsContent
						value="2fa"
						className="mt-0 space-y-4">
						<TwoFactorSettings />
					</TabsContent>

					{/* Roles & Permissions Tab */}
					<TabsContent
						value="permissions"
						className="mt-0 space-y-4">
						<RolesAndPermissions roles={roles} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
