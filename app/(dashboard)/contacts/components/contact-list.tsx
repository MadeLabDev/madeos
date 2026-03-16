"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkDeleteContactsAction, deleteContactAction, getContactsAction } from "@/lib/features/contacts/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface ContactListProps {
	page: number;
	search: string;
	pageSize: number;
	customerId?: string;
}

export function ContactList({ page, search, pageSize, customerId }: ContactListProps) {
	const [contacts, setContacts] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [contactToDelete, setContactToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load contacts function
	const loadContacts = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getContactsAction({ page, search, pageSize, customerId });
			if (result.success && result.data) {
				const data = result.data as any;
				setContacts(data.contacts || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load contacts");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize, customerId]);

	// Load on mount and when filters change
	useEffect(() => {
		loadContacts();
		setSelectedContactIds([]);
	}, [loadContacts]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleContactUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "contact_created") {
				setContacts((prev) => {
					if (prev.find((c) => c.id === data.contact.id)) return prev;
					return page === 1 ? [data.contact, ...prev] : prev;
				});
			} else if (data.action === "contact_updated") {
				setContacts((prev) => prev.map((c) => (c.id === data.contact.id ? { ...c, ...data.contact } : c)));
			} else if (data.action === "contact_deleted") {
				setContacts((prev) => prev.filter((c) => c.id !== data.contactId));
			} else {
				loadContacts();
			}
		},
		[page, loadContacts],
	);

	useChannelEvent("private-global", "contact_update", handleContactUpdate);

	async function handleDeleteContact() {
		if (!contactToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteContactAction(contactToDelete.id);
			if (result.success) {
				toast.success("Contact deleted");
				setContactToDelete(null);
				await loadContacts();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete contact");
		} finally {
			setDeleting(false);
		}
	}

	async function handleBulkDelete() {
		if (selectedContactIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteContactsAction(selectedContactIds);
			if (result.success) {
				toast.success(`${selectedContactIds.length} contacts deleted`);
				setSelectedContactIds([]);
				await loadContacts();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete contacts");
		} finally {
			setBulkActionLoading(false);
		}
	}

	function handleSelectAll(checked: boolean) {
		if (checked) {
			setSelectedContactIds(contacts.map((c) => c.id));
		} else {
			setSelectedContactIds([]);
		}
	}

	function handleSelectContact(id: string, checked: boolean) {
		if (checked) {
			setSelectedContactIds((prev) => [...prev, id]);
		} else {
			setSelectedContactIds((prev) => prev.filter((cid) => cid !== id));
		}
	}

	if (loading) {
		return <PageLoading />;
	}

	if (contacts.length === 0) {
		return (
			<NoItemFound
				icon={User}
				title="No contacts found"
				description={search ? "Try adjusting your search criteria" : "Get started by adding your first contact"}
				action={
					<Button asChild>
						<Link href="/contacts/new">Add Contact</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions */}
			<BulkActionsBar
				selectedCount={selectedContactIds.length}
				itemName="contact"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedContactIds([])}
			/>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedContactIds.length === contacts.length && contacts.length > 0}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contacts.map((contact) => (
							<TableRow key={contact.id}>
								<TableCell>
									<Checkbox
										checked={selectedContactIds.includes(contact.id)}
										onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
									/>
								</TableCell>
								<TableCell className="font-medium">
									<Link
										href={`/contacts/${contact.id}`}
										className="hover:underline">
										{contact.firstName} {contact.lastName}
									</Link>
								</TableCell>
								<TableCell>{contact.email}</TableCell>
								<TableCell>{contact.phone || "-"}</TableCell>
								<TableCell>{contact.title || "-"}</TableCell>
								<TableCell>
									<Link
										href={`/customers/${contact.customer.id}`}
										className="hover:underline">
										{contact.customer.companyName}
									</Link>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem asChild>
												<Link href={`/contacts/${contact.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/contacts/${contact.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setContactToDelete(contact)}
												className="text-destructive">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="contacts"
					baseUrl="/contacts"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={!!contactToDelete}
				onOpenChange={() => setContactToDelete(null)}
				onConfirm={handleDeleteContact}
				isDeleting={deleting}
				title="Delete Contact"
				description={`Are you sure you want to delete "${contactToDelete?.firstName} ${contactToDelete?.lastName}"? This action cannot be undone.`}
			/>
		</div>
	);
}
