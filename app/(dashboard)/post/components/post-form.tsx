"use client";

import { useEffect, useRef, useState } from "react";

import type { SerializedEditorState } from "lexical";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MediaThumbnailField } from "@/components/form-fields/media-thumbnail-field";
import { ModuleFormField } from "@/components/module-form";
import { CategoryInputWithCreate } from "@/components/module-form/category-input-with-create";
import { TagsInputWithAutocomplete } from "@/components/module-form/tags-input-with-autocomplete";
import { ShadcnEditorWrapper } from "@/components/shadcn-editor-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCategoryAction, createPostAction, createTagAction, updatePostAction } from "@/lib/features/post/actions";
import type { PostCategory, PostFormProps, PostTag } from "@/lib/features/post/types";
import type { FieldDefinition } from "@/lib/features/profile/types";
import { getPostTypeLabels } from "@/lib/utils/metadata";
import { generateSlug } from "@/lib/utils/slug-generator";

type GroupedModuleFields = {
	moduleType: any;
	fields: FieldDefinition[];
};

export function PostForm({ post, categories, tags, moduleTypes, isLoading = false, hideButtons = false, type = "blog" }: PostFormProps) {
	const router = useRouter();
	const isEdit = !!post?.id;
	const labels = getPostTypeLabels(type);

	const [isSaving, setIsSaving] = useState(false);
	const [groupedMetaFields, setGroupedMetaFields] = useState<GroupedModuleFields[]>([]);
	const [activeMetaTab, setActiveMetaTab] = useState<string>("");
	const editorContentRef = useRef<SerializedEditorState | null>(null);

	const { control, reset, watch } = useForm<Record<string, any>>({
		mode: "onBlur",
		defaultValues: {},
	});

	const formValues = watch() as Record<string, any>;

	const [formData, setFormData] = useState({
		title: post?.title || "",
		slug: post?.slug || "",
		excerpt: post?.excerpt || "",
		thumbnail: post?.thumbnail || "",
		categoryIds: (post?.categories || []).map((c: PostCategory) => c.id),
		tagNames: (post?.tags || []).map((t: PostTag) => t.name),
		isPublished: post?.isPublished || false,
		publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
		metaData: post?.metaData || {},
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
			const existingMetaData = typeof post?.metaData === "object" && post?.metaData && !Array.isArray(post.metaData) ? (post.metaData as Record<string, any>) : {};
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
	}, [moduleTypes, post?.metaData, reset, activeMetaTab]);

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

	const initialEditorContent = parseContent(post?.content);

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
					type,
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
				publishedAt: formData.isPublished && formData.publishedAt ? new Date(formData.publishedAt) : undefined,
				type,
				metaData: { ...((formData.metaData as Record<string, any>) || {}), ...formValues }, // Merge existing metaData with dynamic fields
			};

			const result = isEdit && post ? await updatePostAction(post.id, submitData) : await createPostAction(submitData);

			if (result.success) {
				toast.success(result.message || (isEdit ? "Post updated" : "Post created"));

				const postData = result.data as any;
				if (!isEdit && postData?.id) {
					router.push(`/post/${postData.id}/edit${type === "blog" ? "" : `?type=${type}`}`);
				} else if (isEdit) {
					router.refresh();
				} else {
					router.push(`/post${type === "blog" ? "" : `?type=${type}`}`);
				}
			} else {
				toast.error(result.message || "Failed to save post");
			}
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<form
				onSubmit={handleSubmit}
				data-post-form
				className="space-y-6">
				<div className="grid grid-cols-7 gap-6">
					<div className="col-span-5 space-y-6">
						{/* Basic Info */}
						<Card>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										placeholder={labels.titlePlaceholder}
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="slug">Slug *</Label>
									<Input
										id="slug"
										name="slug"
										value={formData.slug}
										onChange={handleInputChange}
										placeholder="post-title (URL-friendly)"
										className="mt-1"
									/>
									<p className="text-muted-foreground mt-1 text-xs">{isEdit ? "Editable - used in the post URL" : "Auto-generated from title - edit after creation if needed"}</p>
								</div>

								<div>
									<Label htmlFor="excerpt">Excerpt</Label>
									<textarea
										id="excerpt"
										name="excerpt"
										value={formData.excerpt}
										onChange={handleInputChange}
										placeholder="Short summary of the post"
										rows={3}
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Content */}
						<div className="">
							<ShadcnEditorWrapper
								key={`editor-${post?.id || "new"}`}
								content={initialEditorContent}
								onChange={handleContentChange}
								minHeight={450}
								error={!editorContentRef.current && isSaving}
							/>
						</div>

						{/* Meta Data Fields */}
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
											type,
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
											type: "blog",
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
										{labels.publishLabel}
									</label>
								</div>

								{formData.isPublished && (
									<div>
										<Label htmlFor="publishedAt">Publish Date & Time</Label>
										<Input
											id="publishedAt"
											name="publishedAt"
											type="datetime-local"
											value={formData.publishedAt}
											onChange={handleInputChange}
											className="mt-1"
										/>
										<p className="text-muted-foreground mt-1 text-xs">Leave empty to publish immediately</p>
									</div>
								)}
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
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving || isLoading}>
							<Save className="mr-2 h-4 w-4" />
							{isSaving ? "Saving..." : isEdit ? labels.updateButton : labels.createButton}
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
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving || isLoading}>
							<Save className="mr-2 h-4 w-4" />
							{isSaving ? "Saving..." : isEdit ? labels.updateButton : labels.createButton}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
}
