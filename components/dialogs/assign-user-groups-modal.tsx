"use client";

import { useEffect, useState } from "react";

import { Check, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchUserGroupsAction } from "@/lib/features/user-groups/actions";

// Local type definition since UserGroup model doesn't exist in Prisma schema yet
type UserGroup = {
	id: string;
	name: string;
	description?: string | null;
	members?: any[];
};

interface SelectedGroup {
	id: string;
	name: string;
	description?: string | null;
	memberCount?: number;
}

interface AssignUserGroupsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (groups: SelectedGroup[]) => void;
	initialGroups?: SelectedGroup[];
	isLoading?: boolean;
}

export function AssignUserGroupsModal({ isOpen, onClose, onConfirm, initialGroups = [], isLoading = false }: AssignUserGroupsModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserGroup[]>([]);
	const [selectedGroups, setSelectedGroups] = useState<UserGroup[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Initialize selected groups from initialGroups prop
	useEffect(() => {
		if (isOpen && initialGroups && initialGroups.length > 0) {
			// Pre-fill selected groups when modal opens
			setSelectedGroups(
				initialGroups.map((g) => ({
					id: g.id,
					name: g.name,
					description: g.description,
				})) as UserGroup[],
			);
		}
	}, [isOpen, initialGroups]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
			setSearchResults([]);
			setSelectedGroups([]);
		}
	}, [isOpen]);

	// Search groups
	useEffect(() => {
		const searchGroups = async () => {
			if (!searchQuery.trim()) {
				setSearchResults([]);
				return;
			}

			setIsSearching(true);
			try {
				const result = await searchUserGroupsAction(searchQuery);
				if (result.success && result.data) {
					// Filter out already selected groups
					const filtered = (result.data as UserGroup[]).filter((group) => !selectedGroups.some((sg) => sg.id === group.id));
					setSearchResults(filtered);
				} else {
					setSearchResults([]);
				}
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		};

		const timer = setTimeout(searchGroups, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, selectedGroups]);

	/**
	 * Add group from search results
	 */
	const handleAddGroup = (group: UserGroup) => {
		if (!selectedGroups.some((g) => g.id === group.id)) {
			setSelectedGroups((prev) => [...prev, group]);
			setSearchQuery(""); // Clear search
		}
	};

	/**
	 * Remove group from selected list
	 */
	const handleRemoveGroup = (groupId: string) => {
		setSelectedGroups((prev) => prev.filter((g) => g.id !== groupId));
	};

	/**
	 * Confirm selection and close modal
	 */
	const handleConfirm = () => {
		const groupsToReturn = selectedGroups.map((g) => ({
			id: g.id,
			name: g.name,
			description: g.description,
			memberCount: (g as any).members?.length || 0,
		}));
		onConfirm(groupsToReturn);
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Assign To User Groups</DialogTitle>
					<DialogDescription>Search for user groups to assign access to this private article</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search Input */}
					<div className="space-y-2">
						<Label htmlFor="group-search">Search User Groups (by name)</Label>
						<Input
							id="group-search"
							placeholder="Type group name to search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							disabled={isSearching || isLoading}
							autoFocus
						/>
						{isSearching && (
							<div className="text-muted-foreground flex items-center gap-2 text-xs">
								<Loader size="sm" />
								Searching groups...
							</div>
						)}
					</div>

					{/* Search Results */}
					{searchResults.length > 0 && (
						<div className="space-y-2">
							<Label className="text-xs">Search Results</Label>
							<div className="grid max-h-[120px] grid-cols-1 gap-2 overflow-y-auto">
								{searchResults.map((group) => (
									<button
										key={group.id}
										onClick={() => handleAddGroup(group)}
										disabled={isLoading}
										className="hover:bg-accent flex items-center justify-between rounded-md border p-2 text-left text-sm disabled:opacity-50">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4 flex-shrink-0" />
												<p className="truncate font-medium">{group.name}</p>
											</div>
											{group.description && <p className="text-muted-foreground truncate text-xs">{group.description}</p>}
											{(group as any).members && <p className="text-muted-foreground text-xs">{(group as any).members.length} members</p>}
										</div>
										<Check className="ml-2 h-4 w-4 flex-shrink-0 text-green-600" />
									</button>
								))}
							</div>
						</div>
					)}

					{/* Selected Groups */}
					{selectedGroups.length > 0 && (
						<div className="space-y-2">
							<Label>Selected Groups ({selectedGroups.length})</Label>
							<ScrollArea className="max-h-[240px] w-full rounded-md border p-2">
								<div className="space-y-1">
									{selectedGroups.map((group) => (
										<div
											key={group.id}
											className="hover:bg-muted flex items-center justify-between gap-2 rounded p-2 text-sm transition-colors">
											<div className="flex min-w-0 flex-1 items-center gap-2">
												<Users className="h-4 w-4 flex-shrink-0" />
												<div className="min-w-0 flex-1">
													<span className="text-foreground truncate font-medium">{group.name}</span>
													{group.description && <p className="text-muted-foreground truncate text-xs">{group.description}</p>}
													{(group as any).members && <p className="text-muted-foreground text-xs">{(group as any).members.length} members</p>}
												</div>
											</div>
											<button
												onClick={() => handleRemoveGroup(group.id)}
												disabled={isLoading}
												className="hover:bg-destructive/10 hover:text-destructive flex-shrink-0 rounded p-1 transition-colors disabled:opacity-50"
												aria-label={`Remove ${group.name}`}>
												<X className="h-4 w-4" />
											</button>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>
					)}

					{selectedGroups.length === 0 && (
						<div className="text-muted-foreground py-6 text-center">
							<Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
							<p className="text-sm">No groups selected yet</p>
							<p className="mt-1 text-xs">Search and select user groups above</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={selectedGroups.length === 0 || isLoading}>
						{isLoading ? (
							<>
								<Loader
									size="sm"
									className="mr-2"
								/>
								Saving...
							</>
						) : (
							`Confirm (${selectedGroups.length})`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
