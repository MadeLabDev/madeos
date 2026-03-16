"use client";

import { useCallback, useState } from "react";

import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteModuleAction, reorderModulesAction, toggleModuleVisibilityAction } from "@/lib/features/profile/actions";
import type { ColumnDropZoneProps, ModuleLayoutProps, SortableModuleItemProps, UserProfileModule } from "@/lib/features/profile/types";

import { AddModuleDialog } from "./add-module-dialog";
import { EditModuleDialog } from "./edit-module-dialog";

/**
 * Get module title from its data
 * Derives title based on common fields in module data
 */
function getModuleTitle(module: UserProfileModule): string {
	const data = module.data || {};

	// Try common title fields in order
	if (data.role && data.company) return `${data.role} at ${data.company}`;
	if (data.role) return data.role;
	if (data.name) return data.name;
	if (data.school) return data.school;
	if (data.degree) return data.degree;
	if (data.organization) return data.organization;

	// Fallback
	return "Module";
}

function SortableModuleItem({ module, profileId, onModuleDeleted, onModuleUpdated }: SortableModuleItemProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: module.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this module?")) return;

		const result = await deleteModuleAction(profileId, module.id);
		if (result.success) {
			toast.success("Module deleted");
			onModuleDeleted?.(module.id);
		} else {
			toast.error(result.message || "Failed to delete module");
		}
	};

	const handleToggleVisibility = async () => {
		const result = await toggleModuleVisibilityAction(profileId, module.id, !module.isVisible);
		if (result.success) {
			toast.success(module.isVisible ? "Module hidden" : "Module shown");
			onModuleUpdated?.(module.id, { isVisible: !module.isVisible });
		} else {
			toast.error(result.message || "Failed to update visibility");
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="space-y-3 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<button
						{...listeners}
						{...attributes}
						className="text-muted-foreground hover:text-foreground flex-shrink-0 cursor-grab active:cursor-grabbing"
						title="Drag to reorder">
						<GripVertical className="h-4 w-4" />
					</button>
					<div className="min-w-0 flex-1">
						<h4 className="truncate text-sm font-medium">{getModuleTitle(module)}</h4>
						<p className="text-muted-foreground text-xs">Column {module.column}</p>
					</div>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-48">
						<DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Module
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleToggleVisibility}>
							{module.isVisible ? (
								<>
									<EyeOff className="mr-2 h-4 w-4" />
									Hide Module
								</>
							) : (
								<>
									<Eye className="mr-2 h-4 w-4" />
									Show Module
								</>
							)}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-destructive focus:text-destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{!module.isVisible && (
				<Badge
					variant="outline"
					className="bg-muted text-xs">
					Hidden
				</Badge>
			)}

			<EditModuleDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				module={module}
				profileId={profileId}
				onModuleUpdated={onModuleUpdated}
			/>
		</div>
	);
}

function ColumnDropZone({ columnNumber, isEmpty, children }: ColumnDropZoneProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${columnNumber}-drop-zone`,
	});

	return (
		<div
			ref={setNodeRef}
			className={`min-h-[200px] space-y-3 rounded-lg border-2 border-dashed p-4 transition-all ${isOver ? "border-primary bg-primary/10 shadow-md" : isEmpty ? "border-muted-foreground/20 hover:border-primary/50" : "border-muted-foreground/20"}`}>
			{children}
		</div>
	);
}

export function ModuleLayout({ profile }: ModuleLayoutProps) {
	const [modules, setModules] = useState<UserProfileModule[]>(profile.modules || []);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const columnOneModules = modules.filter((m: UserProfileModule) => m.column === 1).sort((a, b) => a.order - b.order);
	const columnTwoModules = modules.filter((m: UserProfileModule) => m.column === 2).sort((a, b) => a.order - b.order);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);

			if (!over) return;

			const activeModule = modules.find((m) => m.id === active.id);
			if (!activeModule) return;

			let targetColumn = activeModule.column;

			// Determine target column based on what we're dropping over
			if (over.id === "column-1-drop-zone") {
				targetColumn = 1;
			} else if (over.id === "column-2-drop-zone") {
				targetColumn = 2;
			} else {
				// Dropping over another module
				const overModule = modules.find((m) => m.id === over.id);
				if (!overModule) return;

				targetColumn = overModule.column;
			}

			// If already in same column and position, don't do anything
			if (activeModule.column === targetColumn && over.id !== `column-${targetColumn}-drop-zone`) {
				const overModule = modules.find((m) => m.id === over.id);
				if (overModule && activeModule.id === overModule.id) return;
			}

			// Update module's column if different
			let newModules = modules;
			if (activeModule.column !== targetColumn) {
				newModules = modules.map((m) => (m.id === activeModule.id ? { ...m, column: targetColumn, order: 0 } : m));
			}

			// Reorder within target column
			const columnModules = newModules.filter((m) => m.column === targetColumn);
			const activeIdx = columnModules.findIndex((m) => m.id === activeModule.id);

			// If dropping on a module (not drop-zone), reorder
			if (over.id !== `column-${targetColumn}-drop-zone`) {
				const overModule = modules.find((m) => m.id === over.id);
				if (overModule) {
					const overIdx = columnModules.findIndex((m) => m.id === overModule.id);
					if (activeIdx !== -1 && overIdx !== -1) {
						const reordered = arrayMove(columnModules, activeIdx, overIdx);
						reordered.forEach((m, index) => {
							m.order = index;
						});

						const otherModules = newModules.filter((m) => m.column !== targetColumn);
						newModules = [...otherModules, ...reordered];
					}
				}
			} else {
				// Dropping on empty drop-zone
				columnModules.forEach((m, index) => {
					m.order = index;
				});
			}

			setModules(newModules);

			// Persist to server
			const updates = newModules.map((m) => ({
				moduleId: m.id,
				order: m.order,
				column: m.column,
			}));

			const result = await reorderModulesAction(profile.id, updates);
			if (!result.success) {
				setModules(modules);
				toast.error(result.message || "Failed to reorder modules");
			}
		},
		[modules, profile.id],
	);

	return (
		<div className="space-y-6">
			<div className="mt-5 flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Manage Your Modules</h3>
					<p className="text-muted-foreground text-sm">Drag modules to reorder them across columns</p>
				</div>
				<Button
					className="gap-2"
					onClick={() => setIsAddModuleDialogOpen(true)}>
					<Plus className="h-4 w-4" />
					Add Module
				</Button>
			</div>

			<AddModuleDialog
				open={isAddModuleDialogOpen}
				onOpenChange={setIsAddModuleDialogOpen}
				profileId={profile.id}
				onModuleAdded={(newModule) => {
					setModules([...modules, newModule]);
					toast.success("Module added to profile");
				}}
			/>

			<DndContext
				sensors={sensors}
				onDragStart={(event) => setActiveId(event.active.id as string)}
				onDragEnd={handleDragEnd}>
				<SortableContext
					items={modules.map((m) => m.id)}
					strategy={verticalListSortingStrategy}>
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<Card className="p-6">
							<h3 className="mb-4 text-base font-semibold">Column 1</h3>
							<ColumnDropZone
								columnNumber={1}
								isEmpty={columnOneModules.length === 0}>
								{columnOneModules.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
										<p className="text-muted-foreground text-sm font-medium">Drop modules here</p>
										<p className="text-muted-foreground text-xs">Drag modules from Column 2 or add new ones</p>
									</div>
								) : (
									columnOneModules.map((module: UserProfileModule) => (
										<SortableModuleItem
											key={module.id}
											module={module}
											profileId={profile.id}
											onModuleDeleted={(moduleId) => {
												setModules(modules.filter((m) => m.id !== moduleId));
											}}
											onModuleUpdated={(moduleId, data) => {
												setModules(modules.map((m) => (m.id === moduleId ? { ...m, ...data } : m)));
											}}
										/>
									))
								)}
							</ColumnDropZone>
						</Card>

						<Card className="p-6">
							<h3 className="mb-4 text-base font-semibold">Column 2</h3>
							<ColumnDropZone
								columnNumber={2}
								isEmpty={columnTwoModules.length === 0}>
								{columnTwoModules.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
										<p className="text-muted-foreground text-sm font-medium">Drop modules here</p>
										<p className="text-muted-foreground text-xs">Drag modules from Column 1 or add new ones</p>
									</div>
								) : (
									columnTwoModules.map((module: UserProfileModule) => (
										<SortableModuleItem
											key={module.id}
											module={module}
											profileId={profile.id}
											onModuleDeleted={(moduleId) => {
												setModules(modules.filter((m) => m.id !== moduleId));
											}}
											onModuleUpdated={(moduleId, data) => {
												setModules(modules.map((m) => (m.id === moduleId ? { ...m, ...data } : m)));
											}}
										/>
									))
								)}
							</ColumnDropZone>
						</Card>
					</div>
				</SortableContext>

				<DragOverlay>
					{activeId ? (
						<div className="rounded-lg border bg-white p-4 shadow-xl">
							<div className="flex items-center gap-2">
								<GripVertical className="text-muted-foreground h-4 w-4" />
								<span className="text-sm font-medium">Moving module...</span>
							</div>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
