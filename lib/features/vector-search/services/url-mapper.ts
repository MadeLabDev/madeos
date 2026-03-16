export function getEntityUrl(module: string | undefined, type: string | undefined, id: string | number | undefined): string | undefined {
	if (!module || !id) return undefined;
	const entityId = String(id);

	switch (module) {
		case "knowledge":
			return `/knowledge/${entityId}`;
		case "events":
			if (type === "event") return `/events/${entityId}`;
			if (type === "session") return `/events/sessions/${entityId}`;
			return `/events/${entityId}`;
		case "testing":
			if (type === "testOrder") return `/testing/orders/${entityId}`;
			if (type === "testReport") return `/testing/reports/${entityId}`;
			return `/testing/${entityId}`;
		case "design":
			if (type === "designProject") return `/design-projects/${entityId}`;
			if (type === "techPack") return `/design-projects/tech-packs/${entityId}`;
			return `/design-projects/${entityId}`;
		case "training":
			return `/training-support/${entityId}`;
		case "customers":
			return `/customers/${entityId}`;
		case "users":
			return `/users/${entityId}`;
		default:
			return undefined;
	}
}
