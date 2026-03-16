import type { Metadata } from "next";

import NotFound from "@/components/notfound";

export const metadata: Metadata = {
	title: {
		template: "%s | Page Not Found",
		default: "Page Not Found",
	},
	description: "The page you are looking for does not exist.",
};

export default async function Index() {
	return <NotFound />;
}
