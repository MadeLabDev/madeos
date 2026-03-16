# CampaignTemplate Implementation Plan

## Overview
Triển khai hoàn chỉnh feature quản lý **Mẫu Email (CampaignTemplate)** trong module Marketing.

## Architecture

### 1. Database Structure (✅ Already exists in schema)

```prisma
model CampaignTemplate {
  id          String       @id @default(cuid())
  name        String
  subject     String
  content     String       @db.Text
  type        TemplateType @default(GENERAL)
  isActive    Boolean      @default(true)
  createdById String
  updatedById String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  createdBy User                @relation("CampaignTemplateCreatedBy", fields: [createdById], references: [id])
  updatedBy User                @relation("CampaignTemplateUpdatedBy", fields: [updatedById], references: [id])
  campaigns MarketingCampaign[]
}

enum TemplateType {
  GENERAL
  EVENT_INVITATION
  EVENT_REMINDER
  NEWSLETTER
  SPONSOR_UPDATE
}
```

### 2. Backend Implementation Plan

#### A. Types (`lib/features/marketing/types.ts`)
✅ Already defined:
```typescript
export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: TemplateType;
  isActive: boolean;
  createdById: string;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
  updatedBy?: User;
}

export type CreateCampaignTemplateInput = {
  name: string;
  subject: string;
  content: string;
  type?: TemplateType;
};

export type UpdateCampaignTemplateInput = Partial<CreateCampaignTemplateInput> & {
  isActive?: boolean;
};

export interface CampaignTemplateFilters {
  search?: string;
  type?: TemplateType;
  isActive?: boolean;
}
```

#### B. Repository (`lib/features/marketing/repositories/campaign-template-repository.ts`)
```typescript
import { prisma } from "@/lib/prisma";
import { CreateCampaignTemplateInput, CampaignTemplate, UpdateCampaignTemplateInput } from "../types";

export class CampaignTemplateRepository {
  // Create
  async createTemplate(data: CreateCampaignTemplateInput & { createdById: string; updatedById: string }): Promise<CampaignTemplate> {
    return prisma.campaignTemplate.create({
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Read
  async getTemplateById(id: string): Promise<CampaignTemplate | null> {
    return prisma.campaignTemplate.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        campaigns: { select: { id: true, title: true, status: true } },
      },
    });
  }

  async getTemplates(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ templates: CampaignTemplate[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = buildTemplateWhereClause(filters);

    const [templates, total] = await Promise.all([
      prisma.campaignTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          updatedBy: { select: { id: true, name: true, email: true } },
          campaigns: { select: { id: true }, take: 5 },
        },
      }),
      prisma.campaignTemplate.count({ where }),
    ]);

    return { templates, total };
  }

  async getActiveTemplates(): Promise<CampaignTemplate[]> {
    return prisma.campaignTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
  }

  async getTemplatesByType(type: string): Promise<CampaignTemplate[]> {
    return prisma.campaignTemplate.findMany({
      where: { type, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  // Update
  async updateTemplate(id: string, data: UpdateCampaignTemplateInput & { updatedById: string }): Promise<CampaignTemplate> {
    return prisma.campaignTemplate.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async toggleActive(id: string, isActive: boolean, updatedById: string): Promise<CampaignTemplate> {
    return prisma.campaignTemplate.update({
      where: { id },
      data: { isActive, updatedById, updatedAt: new Date() },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
  }

  // Delete
  async deleteTemplate(id: string): Promise<CampaignTemplate> {
    return prisma.campaignTemplate.delete({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
  }
}

// Helper: Build where clause for filters
function buildTemplateWhereClause(filters: any) {
  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
      { content: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return where;
}
```

#### C. Service (`lib/features/marketing/services/campaign-template-service.ts`)
```typescript
import { prisma } from "@/lib/prisma";
import { CampaignTemplateRepository } from "../repositories";
import { ActionResult, CreateCampaignTemplateInput, CampaignTemplate, UpdateCampaignTemplateInput, CampaignTemplateFilters } from "../types";

export class CampaignTemplateService {
  private repository = new CampaignTemplateRepository();

  async createTemplate(data: CreateCampaignTemplateInput, userId: string): Promise<ActionResult<CampaignTemplate>> {
    try {
      // Validation
      if (!data.name?.trim()) {
        return { success: false, message: "Template name is required" };
      }
      if (!data.subject?.trim()) {
        return { success: false, message: "Template subject is required" };
      }
      if (!data.content?.trim()) {
        return { success: false, message: "Template content is required" };
      }

      // Check if name already exists
      const existing = await prisma.campaignTemplate.findFirst({
        where: { name: data.name.trim() },
      });
      if (existing) {
        return { success: false, message: "Template with this name already exists" };
      }

      const template = await this.repository.createTemplate({
        ...data,
        createdById: userId,
        updatedById: userId,
      });

      return { success: true, message: "Template created successfully", data: template };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create template";
      return { success: false, message };
    }
  }

  async updateTemplate(id: string, data: UpdateCampaignTemplateInput, userId: string): Promise<ActionResult<CampaignTemplate>> {
    try {
      // Verify exists
      const existing = await this.repository.getTemplateById(id);
      if (!existing) {
        return { success: false, message: "Template not found" };
      }

      // Check name uniqueness if changing
      if (data.name && data.name.trim() !== existing.name) {
        const duplicate = await prisma.campaignTemplate.findFirst({
          where: { name: data.name.trim(), id: { not: id } },
        });
        if (duplicate) {
          return { success: false, message: "Template with this name already exists" };
        }
      }

      const template = await this.repository.updateTemplate(id, { ...data, updatedById: userId });
      return { success: true, message: "Template updated successfully", data: template };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update template";
      return { success: false, message };
    }
  }

  async deleteTemplate(id: string): Promise<ActionResult<CampaignTemplate>> {
    try {
      const existing = await this.repository.getTemplateById(id);
      if (!existing) {
        return { success: false, message: "Template not found" };
      }

      // Check if template is used in any campaigns
      const campaigns = await prisma.campaignTemplate.findUnique({
        where: { id },
        select: { _count: { select: { campaigns: true } } },
      });

      if (campaigns?._count?.campaigns ?? 0 > 0) {
        return { success: false, message: "Cannot delete template that is being used in campaigns" };
      }

      const template = await this.repository.deleteTemplate(id);
      return { success: true, message: "Template deleted successfully", data: template };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete template";
      return { success: false, message };
    }
  }

  async getTemplateById(id: string): Promise<ActionResult<CampaignTemplate | null>> {
    try {
      const template = await this.repository.getTemplateById(id);
      return { success: true, message: "", data: template };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch template";
      return { success: false, message };
    }
  }

  async getTemplates(filters: CampaignTemplateFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ templates: CampaignTemplate[]; total: number }>> {
    try {
      const result = await this.repository.getTemplates(filters, page, limit);
      return { success: true, message: "", data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch templates";
      return { success: false, message };
    }
  }

  async getActiveTemplates(): Promise<ActionResult<CampaignTemplate[]>> {
    try {
      const templates = await this.repository.getActiveTemplates();
      return { success: true, message: "", data: templates };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch active templates";
      return { success: false, message };
    }
  }

  async toggleActive(id: string, isActive: boolean, userId: string): Promise<ActionResult<CampaignTemplate>> {
    try {
      const existing = await this.repository.getTemplateById(id);
      if (!existing) {
        return { success: false, message: "Template not found" };
      }

      const template = await this.repository.toggleActive(id, isActive, userId);
      return { success: true, message: `Template ${isActive ? "activated" : "deactivated"} successfully`, data: template };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle template status";
      return { success: false, message };
    }
  }
}
```

#### D. Server Actions (`lib/features/marketing/actions/campaign-template-actions.ts`)
```typescript
"use server";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getCacheTag, revalidateTag } from "next/cache";
import { getPusher } from "@/lib/realtime";
import { CampaignTemplateService } from "../services";
import { ActionResult, CreateCampaignTemplateInput, CampaignTemplate, UpdateCampaignTemplateInput, CampaignTemplateFilters } from "../types";

const templateService = new CampaignTemplateService();

// CREATE
export async function createCampaignTemplateAction(data: CreateCampaignTemplateInput): Promise<ActionResult<CampaignTemplate>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Check permission
    await requirePermission("marketing", "create");

    const result = await templateService.createTemplate(data, session.user.id);

    if (result.success) {
      // Pusher notification
      await getPusher().trigger("private-global", "template_update", {
        action: "template_created",
        template: result.data,
      });

      // Revalidate cache
      revalidateTag("campaign-templates");
      revalidateTag("campaign-templates-list");
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create template";
    return { success: false, message };
  }
}

// READ - By ID
export async function getCampaignTemplateByIdAction(id: string): Promise<ActionResult<CampaignTemplate | null>> {
  try {
    const result = await templateService.getTemplateById(id);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch template";
    return { success: false, message };
  }
}

// READ - List
export async function getCampaignTemplatesAction(filters: CampaignTemplateFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ templates: CampaignTemplate[]; total: number }>> {
  try {
    const result = await templateService.getTemplates(filters, page, limit);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch templates";
    return { success: false, message };
  }
}

// READ - Active only
export async function getActiveCampaignTemplatesAction(): Promise<ActionResult<CampaignTemplate[]>> {
  try {
    const result = await templateService.getActiveTemplates();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch active templates";
    return { success: false, message };
  }
}

// UPDATE
export async function updateCampaignTemplateAction(id: string, data: UpdateCampaignTemplateInput): Promise<ActionResult<CampaignTemplate>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Check permission
    await requirePermission("marketing", "update");

    const result = await templateService.updateTemplate(id, data, session.user.id);

    if (result.success) {
      // Pusher notification
      await getPusher().trigger("private-global", "template_update", {
        action: "template_updated",
        template: result.data,
      });

      // Revalidate cache
      revalidateTag("campaign-templates");
      revalidateTag("campaign-templates-list");
      revalidateTag(`campaign-template-${id}`);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update template";
    return { success: false, message };
  }
}

// TOGGLE ACTIVE
export async function toggleCampaignTemplateActiveAction(id: string, isActive: boolean): Promise<ActionResult<CampaignTemplate>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Check permission
    await requirePermission("marketing", "update");

    const result = await templateService.toggleActive(id, isActive, session.user.id);

    if (result.success) {
      // Pusher notification
      await getPusher().trigger("private-global", "template_update", {
        action: "template_toggled",
        templateId: id,
        isActive,
      });

      // Revalidate cache
      revalidateTag("campaign-templates");
      revalidateTag("campaign-templates-list");
      revalidateTag(`campaign-template-${id}`);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle template status";
    return { success: false, message };
  }
}

// DELETE
export async function deleteCampaignTemplateAction(id: string): Promise<ActionResult<CampaignTemplate>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Check permission
    await requirePermission("marketing", "delete");

    const result = await templateService.deleteTemplate(id);

    if (result.success) {
      // Pusher notification
      await getPusher().trigger("private-global", "template_update", {
        action: "template_deleted",
        templateId: id,
      });

      // Revalidate cache
      revalidateTag("campaign-templates");
      revalidateTag("campaign-templates-list");
      revalidateTag(`campaign-template-${id}`);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete template";
    return { success: false, message };
  }
}
```

### 3. Frontend Implementation Plan

#### A. Components

**campaign-template-form.tsx**
```typescript
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CampaignTemplate, TemplateType } from "@/lib/features/marketing/types";
import { updateCampaignTemplateAction, createCampaignTemplateAction } from "@/lib/features/marketing/actions";

const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["GENERAL", "EVENT_INVITATION", "EVENT_REMINDER", "NEWSLETTER", "SPONSOR_UPDATE"]),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface CampaignTemplateFormProps {
  template?: CampaignTemplate;
  isEditing?: boolean;
  hideButtons?: boolean;
  onSubmit?: () => void;
}

export function CampaignTemplateForm({ template, isEditing = false, hideButtons = false, onSubmit }: CampaignTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || "",
      subject: template?.subject || "",
      content: template?.content || "",
      type: (template?.type || "GENERAL") as TemplateType,
    },
  });

  const handleFormSubmit = async (data: TemplateFormData) => {
    setLoading(true);
    try {
      if (isEditing && template?.id) {
        const result = await updateCampaignTemplateAction(template.id, data);
        if (result.success) {
          toast.success("Template updated successfully");
          router.refresh();
          onSubmit?.();
        } else {
          toast.error(result.message || "Failed to update template");
        }
      } else {
        const result = await createCampaignTemplateAction(data);
        if (result.success) {
          toast.success("Template created successfully");
          router.push(`/marketing/templates`);
          onSubmit?.();
        } else {
          toast.error(result.message || "Failed to create template");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Campaign Template" : "Create Campaign Template"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Template Name */}
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Welcome Email, Event Reminder"
                className="mt-2"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Template Type */}
            <div>
              <Label htmlFor="type">Template Type *</Label>
              <Select 
                defaultValue={watch("type")}
                onValueChange={(value) => setValue("type", value as TemplateType)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="EVENT_INVITATION">Event Invitation</SelectItem>
                  <SelectItem value="EVENT_REMINDER">Event Reminder</SelectItem>
                  <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                  <SelectItem value="SPONSOR_UPDATE">Sponsor Update</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-destructive text-sm mt-1">{errors.type.message}</p>}
            </div>

            {/* Email Subject */}
            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="e.g., You're invited to our event!"
                className="mt-2"
              />
              {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>}
            </div>

            {/* Email Content */}
            <div>
              <Label htmlFor="content">Email Content *</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Enter the email template content here..."
                rows={8}
                className="mt-2 font-mono text-sm"
              />
              {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
              <p className="text-muted-foreground text-xs mt-2">Supports HTML and template variables like {{customerName}}, {{eventDate}}, etc.</p>
            </div>

            {/* Buttons */}
            {!hideButtons && (
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**campaign-template-list.tsx**
```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { Pagination } from "@/components/pagination";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { CampaignTemplate, CampaignTemplateFilters } from "@/lib/features/marketing/types";
import {
  getCampaignTemplatesAction,
  deleteCampaignTemplateAction,
  toggleCampaignTemplateActiveAction,
} from "@/lib/features/marketing/actions";

interface CampaignTemplateListProps {
  initialFilters?: CampaignTemplateFilters;
}

const ITEMS_PER_PAGE = 20;

export function CampaignTemplateList({ initialFilters = {} }: CampaignTemplateListProps) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialFilters.search || "");
  const [type, setType] = useState(initialFilters.type || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const filters: CampaignTemplateFilters = {
        search: search || undefined,
        type: type || undefined,
      };
      const result = await getCampaignTemplatesAction(filters, page, ITEMS_PER_PAGE);
      if (result.success && result.data) {
        setTemplates(result.data.templates);
        setTotal(result.data.total);
      } else {
        toast.error(result.message || "Failed to load templates");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, type]);

  useEffect(() => {
    fetchTemplates();
  }, [page, search, type]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setDeleting(id);
    try {
      const result = await deleteCampaignTemplateAction(id);
      if (result.success) {
        toast.success("Template deleted successfully");
        fetchTemplates();
      } else {
        toast.error(result.message || "Failed to delete template");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleCampaignTemplateActiveAction(id, !isActive);
      if (result.success) {
        toast.success(`Template ${!isActive ? "activated" : "deactivated"}`);
        fetchTemplates();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && templates.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaign Templates</h1>
        <Link href="/marketing/templates/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="EVENT_INVITATION">Event Invitation</option>
              <option value="EVENT_REMINDER">Event Reminder</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="SPONSOR_UPDATE">Sponsor Update</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaign templates found. Create one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                  <div className="flex-1">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">{template.type}</Badge>
                      {!template.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(template.id, template.isActive)}
                      title={template.isActive ? "Deactivate" : "Activate"}
                    >
                      {template.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Link href={`/marketing/templates/${template.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={deleting === template.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

#### B. Page Routes

**app/(dashboard)/marketing/templates/page.tsx**
```typescript
import { CampaignTemplateList } from "../components/campaign-template-list";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Campaign Templates | Marketing",
};

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return <CampaignTemplateList />;
}
```

**app/(dashboard)/marketing/templates/new/page.tsx**
```typescript
import { CampaignTemplateForm } from "../../components/campaign-template-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "New Template | Marketing",
};

export default async function NewTemplatePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return <CampaignTemplateForm />;
}
```

**app/(dashboard)/marketing/templates/[id]/page.tsx**
```typescript
import { CampaignTemplateForm } from "../../components/campaign-template-form";
import { getCampaignTemplateByIdAction } from "@/lib/features/marketing/actions";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

interface TemplateDetailPageProps {
  params: { id: string };
}

export const metadata = {
  title: "Edit Template | Marketing",
};

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const result = await getCampaignTemplateByIdAction(params.id);
  if (!result.success || !result.data) {
    notFound();
  }

  return <CampaignTemplateForm template={result.data} isEditing />;
}
```

### 4. Export from Index Files

**lib/features/marketing/index.ts**
```typescript
// Services
export { CampaignTemplateService } from "./services/campaign-template-service";

// Repositories
export { CampaignTemplateRepository } from "./repositories/campaign-template-repository";

// Actions
export {
  createCampaignTemplateAction,
  getCampaignTemplateByIdAction,
  getCampaignTemplatesAction,
  getActiveCampaignTemplatesAction,
  updateCampaignTemplateAction,
  toggleCampaignTemplateActiveAction,
  deleteCampaignTemplateAction,
} from "./actions/campaign-template-actions";

// Types (already exported)
```

---

## Testing Checklist

### Unit Tests
- [ ] CampaignTemplateRepository - All CRUD operations
- [ ] CampaignTemplateService - Validation & business logic
- [ ] Permission checks in actions

### Integration Tests
- [ ] Create template with validation
- [ ] Update template (name uniqueness)
- [ ] Delete template (check if used in campaigns)
- [ ] Toggle active status
- [ ] Pagination & filtering

### E2E Tests (Playwright)
- [ ] Create template flow
- [ ] Edit template flow
- [ ] Delete template flow
- [ ] Navigate between pages
- [ ] Form validation

---

## Completion Criteria

✅ All CRUD operations working
✅ Permission checks in place
✅ Pagination implemented
✅ Search/filter functionality
✅ Real-time updates (Pusher)
✅ Cache invalidation
✅ Error handling
✅ Form validation
✅ UI responsive
✅ Tests passing

---

## Notes
- Follow the same patterns as Events, Contacts, Knowledge modules
- Use existing UI components (Button, Input, Card, etc.)
- Ensure all permission checks use "marketing" module
- Test with real data before going live
- Add to sidebar menu under Marketing
