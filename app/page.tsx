import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { generatePageMetadata } from "@/lib/utils/metadata";

export const metadata = generatePageMetadata("Welcome", "Welcome to MADE Laboratory - your business management system");

export default async function Home() {
	const session = await auth();

	if (!session) {
		redirect("/auth/signin");
	}

	return (
		<main className="bg-background min-h-screen p-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="text-foreground mb-6 text-3xl font-bold">MADE Laboratory</h1>

				<div className="bg-card border-border mb-6 rounded-lg border p-6 shadow-md">
					<h2 className="text-card-foreground mb-4 text-xl font-semibold">Welcome, {session.user?.name || session.user?.email}</h2>

					<div className="space-y-4">
						<div>
							<h3 className="text-foreground mb-2 font-medium">Your Roles:</h3>
							<div className="flex flex-wrap gap-2">
								{session.user?.roles?.map((role) => (
									<span
										key={role.id}
										className="bg-muted text-foreground border-border rounded-full border px-3 py-1 text-sm">
										{role.displayName}
									</span>
								))}
							</div>
						</div>

						<div>
							<h3 className="text-foreground mb-2 font-medium">Your Permissions:</h3>
							<div className="space-y-2">
								{session.user?.permissions &&
									Object.entries(session.user.permissions).map(([module, actions]) => (
										<div
											key={module}
											className="text-sm">
											<span className="text-foreground font-medium capitalize">{module}:</span> <span className="text-muted-foreground">{actions.join(", ")}</span>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-4">
					<a
						href="/auth/signout"
						className="bg-destructive text-destructive-foreground rounded px-4 py-2 transition hover:opacity-90">
						Sign Out
					</a>

					<a
						href="/users"
						className="bg-primary text-primary-foreground rounded px-4 py-2 transition hover:opacity-90">
						Manage Users
					</a>

					<a
						href="/roles"
						className="bg-secondary text-secondary-foreground border-border rounded border px-4 py-2 transition hover:opacity-90">
						Manage Roles
					</a>
				</div>
			</div>
		</main>
	);
}
