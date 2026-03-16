"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EditUserGroupPageClientProps } from "@/lib/features/user-groups/types";

export function EditUserGroupPageClient({ userGroup }: EditUserGroupPageClientProps) {
	return (
		<div className="flex gap-2">
			<Link href={`/user-groups/${userGroup.id}`}>
				<Button variant="outline">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
			</Link>
			<Button
				type="button"
				onClick={() => {
					const submitBtn = document.querySelector('form[data-user-group-form] button[type="submit"]') as HTMLButtonElement;
					submitBtn?.click();
				}}>
				<Save className="mr-2 h-4 w-4" />
				Update Group
			</Button>
		</div>
	);
}
