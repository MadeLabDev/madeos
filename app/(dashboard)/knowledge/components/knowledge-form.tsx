"use client";

import { useEffect, useRef, useState } from "react";

import type { SerializedEditorState } from "lexical";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AssignUserGroupsModal } from "@/components/dialogs/assign-user-groups-modal";
import { AssignUsersModal } from "@/components/dialogs/assign-users-modal";
import { MediaThumbnailField } from "@/components/form-fields/media-thumbnail-field";
import { ModuleFormField } from "@/components/module-form";
import { CategoryInputWithCreate } from "@/components/module-form/category-input-with-create";
import { EventsInputWithAutocomplete } from "@/components/module-form/events-input-with-autocomplete";
import { TagsInputWithAutocomplete } from "@/components/module-form/tags-input-with-autocomplete";
import { ShadcnEditorWrapper } from "@/components/shadcn-editor-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KNOWLEDGE_TYPE_OPTIONS } from "@/lib/config/module-types";
import type { KnowledgeFormProps } from "@/lib/features/knowledge";
import { createArticleAction, createCategoryAction, createTagAction, updateArticleAction } from "@/lib/features/knowledge/actions";
import { assignKnowledgeToGroups, assignKnowledgeToUsers, assignKnowledgeToUsersByEmails, resendKnowledgeAssignmentEmail } from "@/lib/features/knowledge/actions/knowledge-assignment-actions";
import type { FieldDefinition } from "@/lib/features/profile/types";
import { generateSlug } from "@/lib/utils/slug-generator";

type GroupedModuleFields = {
	moduleType: any;
	fields: FieldDefinition[];
};

export function KnowledgeForm({ article, categories, tags, isLoading = false, hideButtons = false, moduleTypes }: KnowledgeFormProps) {
	const router = useRouter();
	const isEdit = !!article?.id;
	const [isSaving, setIsSaving] = useState(false);
	const [isAssignUsersGroupModalOpen, setIsAssignUsersGroupModalOpen] = useState(false);
	const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
	const [emailResults, setEmailResults] = useState<any[]>([]);
	const editorContentRef = useRef<SerializedEditorState | null>(null);

	// Additional Fields state
	const [groupedMetaFields, setGroupedMetaFields] = useState<GroupedModuleFields[]>([]);
	const [activeMetaTab, setActiveMetaTab] = useState<string>("");

	// React Hook Form for dynamic fields
	const { control, reset, watch } = useForm<Record<string, any>>({
		mode: "onBlur",
		defaultValues: {},
	});

	const formValues = watch() as Record<string, any>;

	const [formData, setFormData] = useState({
		title: article?.title || "",
		slug: article?.slug || "",
		excerpt: article?.excerpt || "",
		thumbnail: article?.thumbnail || "",
		eventIds: (article?.events || []).map((e) => e.id),
		categoryIds: (article?.categories || []).map((c) => c.id),
		tagNames: (article?.tags || []).map((t) => t.name),
		type: article?.type || "knowledge",
		visibility: article?.visibility || "public",
		assignedUserIds: (article?.assignedUsers || []).map((u) => u.userId),
		assignedGroupIds: (article?.assignedGroups || []).map((g) => g.groupId),
		isPublished: article?.isPublished || false,
		metaData: article?.metaData || {},
	});

	// Extract dynamic fields from moduleTypes
	useEffect(() => {
		if (moduleTypes && moduleTypes.length > 0) {
			// Sort module types by order first
			const sortedModuleTypes = [...moduleTypes].sort((a, b) => (a.order || 0) - (b.order || 0));

			const groupedFields: GroupedModuleFields[] = [];

			// Process all module types in order
			for (const moduleType of sortedModuleTypes) {
				if (moduleType.fieldSchema && "fields" in moduleType.fieldSchema) {
					// Normalize field orders for fields
					let fieldsWithOrder = (moduleType.fieldSchema.fields as any[]).map((field, idx) => {
						if (!field.order || field.order <= 0) {
							return { ...field, order: idx + 1 };
						}
						return field;
					});

					const fields = fieldsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0));

					// Add to grouped fields
					groupedFields.push({
						moduleType,
						fields,
					});
				}
			}

			setGroupedMetaFields(groupedFields);

			// Set first tab as active if available
			if (groupedFields.length > 0 && groupedFields[0]?.moduleType?.id && !activeMetaTab) {
				setActiveMetaTab(groupedFields[0].moduleType.id);
			}

			// Set default values for dynamic fields
			const existingMetaData = typeof article?.metaData === "object" && article?.metaData && !Array.isArray(article.metaData) ? (article.metaData as Record<string, any>) : {};
			const defaultValues: Record<string, any> = {};

			// Collect all fields from grouped fields
			const allFields = groupedFields.flatMap((group) => group.fields);

			allFields.forEach((field) => {
				const currentValue = existingMetaData[field.name];
				if (currentValue !== undefined && currentValue !== null) {
					defaultValues[field.name] = currentValue;
				} else {
					if (["tags", "multiselect", "checkbox"].includes(field.type)) {
						defaultValues[field.name] = [];
					} else if (["file", "image"].includes(field.type)) {
						defaultValues[field.name] = null;
					} else {
						defaultValues[field.name] = "";
					}
				}
			});

			reset(defaultValues, { keepValues: false });
		}
	}, [moduleTypes, article?.metaData, reset, activeMetaTab]);

	// Track assigned groups for display
	const [assignedGroups, setAssignedGroups] = useState<Array<{ id: string; name: string; description?: string | null; memberCount?: number }>>(
		(article?.assignedGroups || []).map((ag) => ({
			id: ag.groupId,
			name: ag.group?.name || "",
			description: ag.group?.description,
			memberCount: ag.group?.members?.length || 0,
		})),
	);

	// Track assigned users for display
	const [assignedUsers, setAssignedUsers] = useState<Array<{ id: string; email: string; name?: string | null }>>(
		(article?.assignedUsers || []).map((au) => ({
			id: au.userId,
			email: au.user?.email || "",
			name: au.user?.name,
		})),
	);

	const parseContent = (content: any): SerializedEditorState | undefined => {
		if (!content) return undefined;
		if (typeof content === "string") {
			try {
				return JSON.parse(content);
			} catch {
				return undefined;
			}
		}
		return content;
	};

	const initialEditorContent = parseContent(article?.content);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		if (name === "title" && !isEdit) {
			setFormData((prev) => ({ ...prev, title: value, slug: generateSlug(value) }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleContentChange = (serialized: SerializedEditorState) => {
		editorContentRef.current = serialized;
	};

	const handleResendEmail = async (userId: string, email: string) => {
		try {
			const result = await resendKnowledgeAssignmentEmail(article?.id || "", userId);

			if (result.success) {
				toast.success(`Email resent to ${email}`);

				// Update the email results to reflect the resend
				setEmailResults((prev) => prev.map((r) => (r.userId === userId ? { ...r, sent: true, reason: "resent" } : r)));
			} else {
				toast.error(result.message || `Failed to resend email to ${email}`);
			}
		} catch (error) {
			console.error("Error resending email:", error);
			toast.error(`Failed to resend email to ${email}`);
		}
	};

	const validateForm = () => {
		if (!formData.title.trim()) return "Title is required";
		if (!formData.slug.trim()) return "Slug is required";
		if (!editorContentRef.current) return "Content is required";

		const { root } = editorContentRef.current;
		const isEmpty = !root.children?.length || root.children.every((node: any) => !node.children || node.children.every((child: any) => child.type === "text" && (!child.text || !child.text.trim())));

		if (isEmpty) return "Content is required";
		if (formData.categoryIds.length === 0) return "At least one category is required";
		return null;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const error = validateForm();
		if (error) {
			toast.error(error);
			return;
		}

		setIsSaving(true);

		try {
			const tagIds: string[] = [];

			for (const tagName of formData.tagNames) {
				const existingTag = tags.find((t) => t.name === tagName);
				if (existingTag) {
					tagIds.push(existingTag.id);
					continue;
				}

				const result = await createTagAction({
					name: tagName,
					slug: tagName.toLowerCase().replace(/\s+/g, "-"),
				});

				const tagData = result.data as any;
				if (result.success && tagData?.id) {
					tagIds.push(tagData.id);
				} else if (result.message?.includes("already exists")) {
					toast.warning(`Tag "${tagName}" already exists`);
				} else {
					toast.error(`Failed to create tag "${tagName}"`);
					setIsSaving(false);
					return;
				}
			}

			const submitData = {
				...formData,
				content: JSON.stringify(editorContentRef.current),
				tagIds,
				metaData: { ...((formData.metaData as Record<string, any>) || {}), ...formValues }, // Merge existing metaData with dynamic fields
				// Only send assignedGroupIds if visibility is private
				assignedGroupIds: formData.visibility === "private" ? formData.assignedGroupIds : [],
				// Only send assignedUserIds if visibility is private
				assignedUserIds: formData.visibility === "private" ? formData.assignedUserIds : [],
			};

			const result = isEdit && article ? await updateArticleAction(article.id, submitData) : await createArticleAction(submitData);

			if (result.success) {
				toast.success(result.message || (isEdit ? "Article updated" : "Article created"));

				// Get the article ID (either from edit or create result)
				const articleData = result.data as any;
				const articleId = article?.id || articleData?.id;

				// Send emails if users or groups are assigned and visibility is private
				if (articleId && formData.visibility === "private") {
					const emailLog: any[] = [];

					// Send to assigned users
					if (formData.assignedUserIds && formData.assignedUserIds.length > 0) {
						try {
							const userEmailResult = await assignKnowledgeToUsers(articleId, formData.assignedUserIds);
							if (userEmailResult.success && userEmailResult.emailResults) {
								emailLog.push(...userEmailResult.emailResults);
								toast.success(`Emails sent to ${userEmailResult.emailResults.filter((r) => r.sent).length} user(s)`);
							}
						} catch (error) {
							console.error("Failed to send emails to users:", error);
							toast.error("Failed to send emails to some users");
						}
					}

					// Send to assigned groups
					if (formData.assignedGroupIds && formData.assignedGroupIds.length > 0) {
						try {
							const groupEmailResult = await assignKnowledgeToGroups(articleId, formData.assignedGroupIds);
							if (groupEmailResult.success && groupEmailResult.emailResults) {
								emailLog.push(...groupEmailResult.emailResults);
								toast.success(`Emails sent to ${groupEmailResult.emailResults.filter((r) => r.sent).length} group members`);
							}
						} catch (error) {
							console.error("Failed to send emails to groups:", error);
							toast.error("Failed to send emails to some group members");
						}
					}

					// Store email results for display
					if (emailLog.length > 0) {
						setEmailResults(emailLog);
					}
				}

				if (!isEdit && articleData?.id) {
					router.push(`/knowledge/${articleData.id}/edit`);
				} else if (isEdit) {
					router.refresh();
				} else {
					router.push("/knowledge");
				}
			} else {
				toast.error(result.message || "Failed to save article");
			}
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<form
				onSubmit={handleSubmit}
				data-knowledge-form
				className="space-y-6">
				<div className="grid grid-cols-7 gap-6">
					<div className="col-span-5 space-y-6">
						{/* Basic Info */}
						<Card>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										placeholder="Article title"
										className="mt-1"
									/>
									<p className="text-muted-foreground mt-1 text-xs">{isEdit ? "Editable - used in the article URL" : "Auto-generated from title - edit after creation if needed"}</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="slug">Slug *</Label>
									<Input
										id="slug"
										name="slug"
										value={formData.slug}
										onChange={handleInputChange}
										placeholder="article-title (URL-friendly)"
										className="mt-1"
									/>
									<p className="text-muted-foreground mt-1 text-xs">{isEdit ? "Editable - used in the article URL" : "Auto-generated from title - edit after creation if needed"}</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="excerpt">Excerpt</Label>
									<textarea
										id="excerpt"
										name="excerpt"
										value={formData.excerpt}
										onChange={handleInputChange}
										placeholder="Short summary of the article"
										rows={3}
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="eventIds">Associated Events</Label>
									<EventsInputWithAutocomplete
										selectedEventIds={formData.eventIds}
										onChange={(eventIds) => setFormData((prev) => ({ ...prev, eventIds }))}
										placeholder="Search and select events..."
									/>
									<p className="text-muted-foreground mt-1 text-xs">Optionally associate this article with multiple events for attendees.</p>
								</div>
							</CardContent>
						</Card>

						{/* Content */}
						<div className="">
							<ShadcnEditorWrapper
								key={`editor-${article?.id || "new"}`}
								content={initialEditorContent}
								onChange={handleContentChange}
								minHeight={450}
								error={!editorContentRef.current && isSaving}
							/>
						</div>

						{/* Visibility */}
						<Card>
							<CardHeader>
								<h2 className="text-lg font-semibold">Visibility</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="visibility">Access Level</Label>
									<select
										id="visibility"
										value={formData.visibility}
										onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value as any }))}
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
										<option value="public">Public - Everyone can view</option>
										<option value="private">Private - Only assigned users</option>
									</select>
									<p className="text-muted-foreground mt-2 text-xs">{formData.visibility === "public" ? "All users can view this article" : "Only users assigned below can view"}</p>
								</div>
							</CardContent>
						</Card>

						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-2">
								{/* Assign User Groups (show only for private) */}
								{formData.visibility === "private" && (
									<Card>
										<CardHeader>
											<h2 className="text-lg font-semibold">Assign To User Groups</h2>
										</CardHeader>
										<CardContent className="space-y-4">
											<p className="text-muted-foreground mb-3 text-xs">Select which user groups can access this private article</p>

											{/* Selected Groups Display */}
											{assignedGroups.length > 0 && (
												<div className="mb-4 space-y-2">
													<Label className="text-xs">Selected Groups ({assignedGroups.length})</Label>
													<div className="flex flex-wrap gap-2">
														{assignedGroups.map((group) => (
															<Badge
																key={group.id}
																variant="secondary"
																className="pr-1">
																<span className="max-w-[150px] truncate">{group.name}</span>
																<button
																	onClick={() => {
																		setAssignedGroups((prev) => prev.filter((g) => g.id !== group.id));
																		setFormData((prev) => ({
																			...prev,
																			assignedGroupIds: prev.assignedGroupIds.filter((id) => id !== group.id),
																		}));
																	}}
																	className="ml-1.5 hover:opacity-70"
																	aria-label={`Remove ${group.name}`}>
																	<X className="h-3 w-3" />
																</button>
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* Open Modal Button */}
											<Button
												variant="outline"
												onClick={() => setIsAssignUsersGroupModalOpen(true)}
												disabled={isSaving}
												type="button"
												className="w-full">
												{assignedGroups.length > 0 ? "Edit Groups" : "Add Groups"}
											</Button>

											{assignedGroups.length === 0 && <p className="text-muted-foreground text-xs italic">No groups assigned yet</p>}
										</CardContent>
									</Card>
								)}

								{/* Assign User Groups Modal */}
								<AssignUserGroupsModal
									isOpen={isAssignUsersGroupModalOpen}
									onClose={() => setIsAssignUsersGroupModalOpen(false)}
									onConfirm={(selectedGroups: Array<{ id: string; name: string; description?: string | null; memberCount?: number }>) => {
										// selectedGroups is array of { id, name, description, memberCount }
										setAssignedGroups(selectedGroups);
										setFormData((prev) => ({
											...prev,
											assignedGroupIds: selectedGroups.map((g) => g.id),
										}));
									}}
									isLoading={isSaving}
									initialGroups={assignedGroups}
								/>
							</div>

							<div className="space-y-2">
								{/* Assign Users (show only for private) */}
								{formData.visibility === "private" && (
									<Card>
										<CardHeader>
											<h2 className="text-lg font-semibold">Assign To Users</h2>
										</CardHeader>
										<CardContent className="space-y-4">
											<p className="text-muted-foreground mb-3 text-xs">Select which users can access this private article</p>

											{/* Selected Users Display */}
											{assignedUsers.length > 0 && (
												<div className="mb-4 space-y-2">
													<Label className="text-xs">Selected Users ({assignedUsers.length})</Label>
													<div className="flex flex-wrap gap-2">
														{assignedUsers.map((user) => (
															<Badge
																key={user.id}
																variant="secondary"
																className="pr-1">
																<span className="max-w-[150px] truncate">{user.email}</span>
																<button
																	onClick={() => {
																		setAssignedUsers((prev) => prev.filter((u) => u.id !== user.id));
																		setFormData((prev) => ({
																			...prev,
																			assignedUserIds: prev.assignedUserIds.filter((id) => id !== user.id),
																		}));
																	}}
																	className="ml-1.5 hover:opacity-70"
																	aria-label={`Remove ${user.email}`}>
																	<X className="h-3 w-3" />
																</button>
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* Open Modal Button */}
											<Button
												variant="outline"
												onClick={() => setIsAssignUsersModalOpen(true)}
												disabled={isSaving}
												type="button"
												className="w-full">
												{assignedUsers.length > 0 ? "Edit Users" : "Add Users"}
											</Button>

											{assignedUsers.length === 0 && <p className="text-muted-foreground text-xs italic">No users assigned yet</p>}
										</CardContent>
									</Card>
								)}

								{/* Assign Users Modal */}
								<AssignUsersModal
									isOpen={isAssignUsersModalOpen}
									onClose={() => setIsAssignUsersModalOpen(false)}
									onConfirm={async (emails: string[]) => {
										try {
											setIsSaving(true);
											const result = await assignKnowledgeToUsersByEmails(article?.id || "", emails);

											if (result.success && result.assignedUsers) {
												// Find the user objects for the assigned users
												const newAssignedUsers = result.assignedUsers.map((assigned) => {
													return {
														id: assigned.userId,
														email: assigned.email,
														name: null, // We don't have name from the result
													};
												});

												// Merge with existing users (avoid duplicates)
												const existingUserIds = new Set(assignedUsers.map((u) => u.id));
												const uniqueNewUsers = newAssignedUsers.filter((u) => !existingUserIds.has(u.id));

												setAssignedUsers((prev) => [...prev, ...uniqueNewUsers]);
												setFormData((prev) => ({
													...prev,
													assignedUserIds: [...prev.assignedUserIds, ...uniqueNewUsers.map((u) => u.id)],
												}));

												setEmailResults(result.emailResults || []);
												toast.success(result.message);
											} else {
												toast.error(result.message);
											}
										} catch (error) {
											console.error("Error assigning users:", error);
											toast.error("Failed to assign users");
										} finally {
											setIsSaving(false);
											setIsAssignUsersModalOpen(false);
										}
									}}
									isLoading={isSaving}
								/>
							</div>
						</div>

						{/* Email History - Show after assignment on recent edits/updates */}
						{emailResults && emailResults.length > 0 && (
							<div className="col-span-full">
								<Card>
									<CardHeader>
										<h2 className="text-lg font-semibold">Email Delivery History</h2>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											{emailResults.map((result, idx) => (
												<div
													key={idx}
													className="bg-muted/30 flex items-center justify-between rounded-md border p-3">
													<div className="space-y-1">
														<p className="text-sm font-medium">{result.email}</p>
														<p className="text-muted-foreground text-xs">{result.name || "User"}</p>
													</div>
													<div className="flex items-center gap-2">
														{result.sent ? (
															<Badge
																variant="outline"
																className="border-green-300 bg-green-100 text-green-800">
																Sent
															</Badge>
														) : (
															<>
																<Badge
																	variant="outline"
																	className={result.reason === "already_sent" ? "border-blue-300 bg-blue-100 text-blue-800" : "border-red-300 bg-red-100 text-red-800"}>
																	{result.reason === "already_sent" ? "Already Sent" : "Failed"}
																</Badge>
																{result.reason === "error" && (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleResendEmail(result.userId, result.email)}
																		disabled={isSaving}
																		className="text-xs">
																		Resend
																	</Button>
																)}
															</>
														)}
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Additional Fields */}
						{groupedMetaFields.length > 0 && (
							<Card>
								<CardHeader>
									<h2 className="text-lg font-semibold">Additional Fields</h2>
								</CardHeader>
								<CardContent>
									<Tabs
										value={activeMetaTab}
										onValueChange={setActiveMetaTab}
										className="w-full">
										<TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
											{groupedMetaFields.map((group) => (
												<TabsTrigger
													key={group.moduleType.id}
													value={group.moduleType.id}
													className="text-xs sm:text-sm">
													{group.moduleType.name}
												</TabsTrigger>
											))}
										</TabsList>

										{groupedMetaFields.map((group) => (
											<TabsContent
												key={group.moduleType.id}
												value={group.moduleType.id}
												className="mt-0 space-y-4">
												{group.moduleType.description && <p className="text-muted-foreground text-sm">{group.moduleType.description}</p>}
												{group.fields.map((field) => (
													<ModuleFormField
														key={field.id}
														field={field}
														control={control}
														name={field.name as any}
													/>
												))}
											</TabsContent>
										))}
									</Tabs>
								</CardContent>
							</Card>
						)}
					</div>
					<div className="col-span-2 space-y-6">
						{/* Categorization - Multiple Select with Quick Create */}
						<Card className="gap-1">
							<CardHeader>
								<h2 className="text-lg font-semibold">Categorization *</h2>
							</CardHeader>
							<CardContent className="mb-0 space-y-4">
								<CategoryInputWithCreate
									value={formData.categoryIds}
									onChange={(categoryIds) => setFormData((prev) => ({ ...prev, categoryIds }))}
									categories={categories}
									disabled={isSaving}
									onCreateNew={async (categoryName) => {
										const result = await createCategoryAction({
											name: categoryName,
											slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
										});
										if (result.success && result.data) {
											toast.success(`Category "${categoryName}" created`);
											return result.data as any;
										}
										toast.error(result.message || "Failed to create category");
										return null;
									}}
								/>
							</CardContent>
						</Card>

						{/* Tags - TagsInput Style with Autocomplete */}
						<Card className="gap-1">
							<CardHeader>
								<h2 className="text-lg font-semibold">Tags</h2>
							</CardHeader>
							<CardContent className="mb-0 space-y-4">
								<TagsInputWithAutocomplete
									value={formData.tagNames}
									onChange={(tagNames) => setFormData((prev) => ({ ...prev, tagNames }))}
									availableTags={tags.map((t) => t.name)}
									placeholder="Type to search or create tags..."
									disabled={isSaving}
									onCreateNewTag={async (tagName) => {
										await createTagAction({
											name: tagName,
											slug: tagName.toLowerCase().replace(/\s+/g, "-"),
										}).catch(console.error);
									}}
								/>
								<p className="text-muted-foreground text-xs">Search existing tags or type to create new ones. Press Enter to add.</p>
							</CardContent>
						</Card>

						{/* Media */}
						<Card className="gap-0">
							<CardHeader>
								<h2 className="text-lg font-semibold">Media</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<MediaThumbnailField
									label=""
									value={formData.thumbnail}
									onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url || "" }))}
									placeholder="No image selected"
									description="Click the image to select or upload a thumbnail"
									disabled={isSaving}
									pickerTitle="Select Thumbnail"
									pickerDescription="Choose an image from your media library or upload a new one"
								/>
							</CardContent>
						</Card>

						{/* Publication */}
						<Card>
							<CardHeader>
								<h2 className="text-lg font-semibold">Publication</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch
										id="isPublished"
										checked={formData.isPublished}
										onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked as boolean }))}
									/>
									<label
										htmlFor="isPublished"
										className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
										Publish this article
									</label>
								</div>
							</CardContent>
						</Card>

						{/* Type */}
						<Card>
							<CardHeader>
								<h2 className="text-lg font-semibold">Type</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="type">Article Type</Label>
									<select
										id="type"
										value={formData.type}
										onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
										{KNOWLEDGE_TYPE_OPTIONS.map((type) => (
											<option
												key={type.value}
												value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Actions */}
				{!hideButtons && (
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => router.back()}
							disabled={isSaving}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving || isLoading}>
							{isSaving ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
						</Button>
					</div>
				)}

				{/* Hidden buttons for wrapper to trigger */}
				{hideButtons && (
					<div className="hidden">
						<Button
							variant="outline"
							onClick={() => router.back()}
							disabled={isSaving}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving || isLoading}>
							{isSaving ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
}
