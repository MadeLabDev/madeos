"use client";

import { useState } from "react";

import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createProfileAction } from "@/lib/features/profile/actions";
import type { ProfileBuilderProps, UserProfileWithModules } from "@/lib/features/profile/types";

import { ProfileTabs } from "./profile-tabs";

export function ProfileBuilder({ profile }: ProfileBuilderProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [currentProfile, setCurrentProfile] = useState<UserProfileWithModules | null>(profile);

	const handleCreateProfile = async () => {
		setIsCreating(true);
		try {
			const result = await createProfileAction({
				displayName: "My Profile",
				headline: "",
				bio: "",
			});

			if (result.success && result.data) {
				toast.success("Profile created successfully!");
				setCurrentProfile(result.data as UserProfileWithModules);
			} else {
				toast.error(result.message || "Failed to create profile");
			}
		} catch (error) {
			toast.error("An error occurred while creating the profile");
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	};

	if (!currentProfile) {
		return (
			<Card className="p-12 text-center">
				<h2 className="mb-2 text-2xl font-bold">Welcome to Profile Builder</h2>
				<p className="text-muted-foreground mx-auto mb-8 max-w-md">Create your professional profile to showcase your experience, skills, education, and projects.</p>
				<Button
					size="lg"
					onClick={handleCreateProfile}
					disabled={isCreating}>
					{isCreating ? (
						"Creating Profile..."
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Create Your Profile
						</>
					)}
				</Button>
			</Card>
		);
	}

	return (
		<ProfileTabs
			profile={currentProfile}
			onProfileUpdate={setCurrentProfile}
		/>
	);
}
