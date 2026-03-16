import { redirect } from "next/navigation";

import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Marketing");

export default function MarketingPage() {
	redirect("/marketing/campaigns");
}
