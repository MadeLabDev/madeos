"use client";

import { useEffect, useRef, useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllUserGroupsAction } from "@/lib/features/user-groups/actions";
import { createUserAction } from "@/lib/features/users/actions";
import { NewUserFormProps } from "@/lib/features/users/types";

import { MassCreateUserForm, UserForm } from "../components";

export function NewUserForm({ roles }: NewUserFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState("basic");
	const [userGroups, setUserGroups] = useState<any[]>([]);
	const [loadingGroups, setLoadingGroups] = useState(true);
	const massCreateSubmitRef = useRef<(() => void) | null>(null);
	const massCreateClearRef = useRef<(() => void) | null>(null);

	// Load user groups on mount
	useEffect(() => {
		const loadGroups = async () => {
			try {
				const result = await getAllUserGroupsAction();
				if (result.success && result.data) {
					setUserGroups(result.data as any[]);
				}
			} catch (error) {
				console.error("Failed to load user groups:", error);
			} finally {
				setLoadingGroups(false);
			}
		};
		loadGroups();
	}, []);

	async function handleCreateUser(data: { email: string; username?: string; name?: string; password?: string; roleIds: string[]; groupId?: string }) {
		setIsSubmitting(true);
		try {
			// Password is now optional - if empty, activation email will be sent
			// Clean up password field - if empty string, convert to undefined
			const cleanData = {
				...data,
				username: data.username && data.username.trim() !== "" ? data.username : undefined,
				password: data.password && data.password.trim() !== "" ? data.password : undefined,
			};

			const result = await createUserAction(cleanData);

			if (result.success) {
				toast.success(result.message);
				router.push("/users");
			}
			return result;
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		router.push("/users");
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		// Trigger form submit by finding and clicking the submit button inside form
		const submitBtn = document.querySelector('form[data-user-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	// Handle mass create submit
	const handleMassCreateSubmit = () => {
		if (massCreateSubmitRef.current) {
			massCreateSubmitRef.current();
		}
	};

	const handleMassCreateClear = () => {
		if (massCreateClearRef.current) {
			massCreateClearRef.current();
		}
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
					<p className="text-muted-foreground">{activeTab === "basic" ? "Add a new user to the system" : "Add multiple users at once from an email list"}</p>
				</div>
				{activeTab === "basic" && (
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleHeaderSubmit}
							disabled={isSubmitting}>
							{isSubmitting ? (
								<Loader
									size="sm"
									className="mr-2"
								/>
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Create User
						</Button>
					</div>
				)}
				{activeTab === "mass" && (
					<div className="flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleMassCreateClear}
							disabled={isSubmitting}>
							<X className="mr-2 h-4 w-4" />
							Clear Form
						</Button>
						<Button
							type="button"
							onClick={handleMassCreateSubmit}
							disabled={isSubmitting}>
							{isSubmitting ? (
								<Loader
									size="sm"
									className="mr-2"
								/>
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Create Users
						</Button>
					</div>
				)}
			</div>

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="basic">Basic Information</TabsTrigger>
					<TabsTrigger value="mass">Mass Create</TabsTrigger>
				</TabsList>

				{/* Tab Content - Basic Information */}
				<TabsContent
					value="basic"
					className="space-y-6">
					{!loadingGroups && (
						<UserForm
							roles={roles}
							userGroups={userGroups}
							onSubmit={handleCreateUser}
							onCancel={handleCancel}
							hideButtons
						/>
					)}
				</TabsContent>

				{/* Tab Content - Mass Create */}
				<TabsContent
					value="mass"
					className="space-y-6">
					{!loadingGroups && (
						<MassCreateUserForm
							roles={roles}
							onSubmitRef={(handler) => {
								massCreateSubmitRef.current = handler;
							}}
							onClearRef={(handler) => {
								massCreateClearRef.current = handler;
							}}
							onSuccess={() => {
								// Optionally redirect after successful mass creation
								setTimeout(() => {
									router.push("/users");
								}, 2000);
							}}
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
