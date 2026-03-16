"use client";

import { useState } from "react";

import { FileText, Layers } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileBuilderTabsProps } from "@/lib/features/profile/types";

import { ModuleLayout } from "./module-layout";
import { ProfileForm } from "./profile-form";

export function ProfileTabs({ profile, onProfileUpdate }: ProfileBuilderTabsProps) {
	const [activeTab, setActiveTab] = useState("info");

	return (
		<Tabs
			value={activeTab}
			onValueChange={setActiveTab}
			className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger
					value="info"
					className="flex items-center gap-2">
					<FileText className="h-4 w-4" />
					Basic Information
				</TabsTrigger>
				<TabsTrigger
					value="modules"
					className="flex items-center gap-2">
					<Layers className="h-4 w-4" />
					Modules
				</TabsTrigger>
			</TabsList>

			<TabsContent
				value="info"
				className="space-y-4">
				<ProfileForm
					profile={profile}
					onProfileUpdate={onProfileUpdate}
				/>
			</TabsContent>

			<TabsContent
				value="modules"
				className="space-y-4">
				<ModuleLayout profile={profile} />
			</TabsContent>
		</Tabs>
	);
}
