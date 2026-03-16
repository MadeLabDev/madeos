import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { mediaService } from "@/lib/features/media/services/media-service";
import { uploadFile } from "@/lib/features/upload/services";

export async function POST(request: NextRequest) {
	try {
		// Get session
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
		}

		// Check permission: user must have media_write role/permission
		const userRoles = session.user.roles?.map((r: any) => r.name) || [];
		const userPermissions = session.user.permissions || {};
		const hasMediaWrite = userRoles.includes("admin") || userRoles.includes("manager") || userPermissions.media?.includes("create");

		if (!hasMediaWrite) {
			return NextResponse.json({ success: false, message: "You do not have permission to upload media files" }, { status: 403 });
		}

		const formData = await request.formData();
		const files = formData.getAll("files") as File[];

		if (!files || files.length === 0) {
			return NextResponse.json({ success: false, message: "No files provided" }, { status: 400 });
		}

		const visibility = (formData.get("visibility") as string) || "PRIVATE";

		const uploadedFiles = [];
		const errors = [];

		for (const file of files) {
			try {
				// Validate file
				const validation = mediaService.validateFile(file);
				if (!validation.valid) {
					errors.push({ filename: file.name, error: validation.error });
					continue;
				}

				// Upload using storage service (routes to R2 or local based on settings)
				const uploadResult = await uploadFile(file, "media");

				if (!uploadResult.success) {
					errors.push({
						filename: file.name,
						error: uploadResult.error || "Upload failed",
					});
					continue;
				}

				// Create media record in database with URL from storage service
				const media = await mediaService.create({
					name: file.name,
					url: uploadResult.url!,
					type: file.type,
					size: file.size,
					visibility: visibility as "PUBLIC" | "PRIVATE",
					uploadedById: session.user.id,
				});

				uploadedFiles.push(media);
			} catch (error) {
				errors.push({
					filename: file.name,
					error: error instanceof Error ? error.message : "Upload failed",
				});
			}
		}

		if (uploadedFiles.length === 0 && errors.length > 0) {
			return NextResponse.json({ success: false, message: "All uploads failed", errors }, { status: 400 });
		}

		return NextResponse.json({
			success: true,
			data: uploadedFiles,
			errors: errors.length > 0 ? errors : undefined,
			message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : "Upload failed",
			},
			{ status: 500 },
		);
	}
}
