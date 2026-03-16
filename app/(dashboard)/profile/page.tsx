import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLoading } from "@/components/ui/page-loading";
import { getProfileData } from "@/lib/features/users/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ProfileTabs } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Profile");

export const revalidate = 0;

async function ProfileContent() {
	const result = await getProfileData();

	if (!result.success || !result.data) {
		return (
			<div className="py-12 text-center">
				<p className="text-destructive">Failed to load profile</p>
			</div>
		);
	}

	const user = result.data;
	const initials =
		user.name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase() || user.email.substring(0, 2).toUpperCase();

	return (
		<div className="space-y-8">
			{/* Profile Header */}
			<div>
				<div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
					<Avatar className="mx-auto h-20 w-20 sm:mx-0 sm:h-24 sm:w-24">
						<AvatarImage src={user.image || undefined} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>

					<div className="w-full flex-1 text-center sm:text-left">
						<h1 className="text-2xl font-bold sm:text-3xl">{user.name || "User"}</h1>
						<p className="text-muted-foreground">{user.email}</p>
						{user.username && <p className="text-muted-foreground">@{user.username}</p>}

						<div className="mt-3 flex flex-col justify-center gap-2 text-sm sm:flex-row sm:justify-start sm:gap-4">
							<div>
								<span className="text-muted-foreground">Status: </span>
								<span className={user.isActive ? "font-medium text-green-600" : "font-medium text-amber-600"}>{user.isActive ? "Active" : "Inactive"}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Member since: </span>
								<span className="font-medium">
									{new Date(user.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tabs Content */}
			<ProfileTabs
				initialData={{
					name: user.name,
					username: user.username,
					email: user.email,
					image: user.image,
				}}
				roles={user.roles}
			/>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<div className="space-y-8">
			<div className="animate-pulse space-y-4">
				<div className="bg-muted h-24 w-24 rounded-full" />
				<div className="bg-muted h-8 w-48 rounded" />
				<div className="bg-muted h-4 w-64 rounded" />
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return (
		<>
			<SetBreadcrumb
				segment="profile"
				label="Profile"
			/>
			<div className="container mx-auto max-w-6xl px-4 py-4 lg:px-6 lg:py-8">
				<Suspense fallback={<PageLoading />}>
					<Suspense fallback={<ProfileSkeleton />}>
						<ProfileContent />
					</Suspense>
				</Suspense>
			</div>
		</>
	);
}
