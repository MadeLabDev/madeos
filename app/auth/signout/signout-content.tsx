"use client";

import { useEffect } from "react";

import { signOut } from "next-auth/react";

import Loader from "@/components/ui/loader";

export default function SignOutContent() {
	useEffect(() => {
		signOut({ callbackUrl: "/auth/signin" });
	}, []);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Loader size="lg" />
				<p className="text-muted-foreground mt-2 text-sm">Signing out...</p>
			</div>
		</div>
	);
}
