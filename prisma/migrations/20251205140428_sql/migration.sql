-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'INTAKE', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED', 'ARCHIVED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WITH_SESSIONS', 'LANDING_ONLY');

-- CreateEnum
CREATE TYPE "TicketingMode" AS ENUM ('INTERNAL', 'EXTERNAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('SOLD', 'USED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('INTERNAL', 'EXTERNAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('DESIGN', 'TESTING', 'TRAINING', 'EVENT');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('MEETING', 'CALL', 'EMAIL', 'NOTE');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('RECEIVED', 'IN_PROCESSING', 'PROCESSED', 'RETURNED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('INSTRUCTOR_LED', 'SELF_PACED', 'BLENDED', 'WORKSHOP', 'MENTORING', 'CERTIFICATION_PREP');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID', 'ASYNCHRONOUS', 'RECORDED');

-- CreateEnum
CREATE TYPE "TrainingPhase" AS ENUM ('DISCOVERY', 'DESIGN', 'DEVELOPMENT', 'DELIVERY', 'ASSESSMENT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('NONE', 'COMPLETION', 'COMPETENCY', 'EXTERNAL_ALIGNED');

-- CreateEnum
CREATE TYPE "CompetencyLevel" AS ENUM ('NOVICE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'PRACTICAL', 'CERTIFICATION', 'SURVEY', 'SELF_ASSESSMENT');

-- CreateEnum
CREATE TYPE "TimingType" AS ENUM ('PRE', 'MID', 'POST');

-- CreateEnum
CREATE TYPE "DesignProjectStatus" AS ENUM ('DRAFT', 'INTAKE', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REVISION', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DesignBriefStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductDesignStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'FINALIZED', 'CANCELLED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TechPackStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'FINALIZED', 'CANCELLED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DesignDeckStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DesignReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "TestOrderStatus" AS ENUM ('DRAFT', 'INTAKE', 'IN_PROGRESS', 'REVIEW', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('DRAFT', 'INTAKE', 'IN_PROGRESS', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PLANNING', 'DISCOVERY', 'DESIGN', 'SCHEDULED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PASSED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('COMPLETION', 'COMPETENCY', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "SOPStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('DRAFT', 'INTAKE', 'IN_PROGRESS', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EMAIL', 'SOCIAL', 'WEBINAR', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('GENERAL', 'EVENT_INVITATION', 'EVENT_REMINDER', 'NEWSLETTER', 'SPONSOR_UPDATE');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('ASSET', 'LOGO', 'BANNER', 'PRESENTATION', 'CONTRACT', 'REPORT');

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "activationToken" TEXT,
    "activationTokenExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "UserGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "contactName" TEXT NOT NULL,
    "contactTitle" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'customer',
    "taxId" TEXT,
    "parentId" TEXT,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "creditLimit" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT 'profile',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fieldSchema" JSONB NOT NULL,
    "lockedFields" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ModuleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleInstance" (
    "id" TEXT NOT NULL,
    "moduleTypeId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "fieldValues" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ModuleInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormData" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metaData" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfileModules" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "moduleTypeId" TEXT,
    "data" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "column" INTEGER NOT NULL DEFAULT 1,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfileModules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#000000',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeTags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT DEFAULT '#666666',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeArticles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "type" TEXT NOT NULL DEFAULT 'knowledge',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaData" JSONB,

    CONSTRAINT "KnowledgeArticles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCategoriesOnKnowledge" (
    "knowledgeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeCategoriesOnKnowledge_pkey" PRIMARY KEY ("knowledgeId","categoryId")
);

-- CreateTable
CREATE TABLE "KnowledgeTagsOnKnowledge" (
    "knowledgeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeTagsOnKnowledge_pkey" PRIMARY KEY ("knowledgeId","tagId")
);

-- CreateTable
CREATE TABLE "KnowledgeEventsOnKnowledge" (
    "knowledgeId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeEventsOnKnowledge_pkey" PRIMARY KEY ("knowledgeId","eventId")
);

-- CreateTable
CREATE TABLE "KnowledgeAssignedUsers" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "KnowledgeAssignedUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeAssignedGroups" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "KnowledgeAssignedGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeModuleTypes" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT 'knowledge',
    "description" TEXT,
    "icon" TEXT,
    "fieldSchema" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeModuleTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeEmailLogs" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeEmailLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'blog',
    "color" TEXT DEFAULT '#000000',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'blog',
    "color" TEXT DEFAULT '#666666',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "type" TEXT NOT NULL DEFAULT 'blog',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaData" JSONB NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategoriesOnPost" (
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostCategoriesOnPost_pkey" PRIMARY KEY ("postId","categoryId")
);

-- CreateTable
CREATE TABLE "PostTagsOnPost" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTagsOnPost_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "BackupRecords" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileSize" BIGINT NOT NULL DEFAULT 0,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "r2Url" VARCHAR(500),
    "backupType" "BackupType" NOT NULL DEFAULT 'MANUAL',
    "retentionDays" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "BackupRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupStats" (
    "id" TEXT NOT NULL,
    "totalBackups" INTEGER NOT NULL DEFAULT 0,
    "successfulBackups" INTEGER NOT NULL DEFAULT 0,
    "failedBackups" INTEGER NOT NULL DEFAULT 0,
    "totalSize" BIGINT NOT NULL DEFAULT 0,
    "lastBackupDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupSettings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "capacity" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "eventType" "EventType" NOT NULL DEFAULT 'WITH_SESSIONS',
    "ticketingMode" "TicketingMode" NOT NULL DEFAULT 'INTERNAL',
    "externalTicketUrl" TEXT,
    "externalTicketProvider" TEXT,
    "thumbnailId" TEXT,
    "enableCheckIn" BOOLEAN NOT NULL DEFAULT true,
    "metaData" JSONB,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSession" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "speaker" TEXT,
    "capacity" INTEGER,
    "room" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "maxPerUser" INTEGER NOT NULL DEFAULT 1,
    "saleStart" TIMESTAMP(3),
    "saleEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'SOLD',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "registrationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "ticketSource" "TicketSource" NOT NULL DEFAULT 'INTERNAL',
    "externalTicketId" TEXT,
    "customData" JSONB,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "checkedInById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInById" TEXT NOT NULL,
    "location" TEXT,
    "deviceInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'PROSPECTING',
    "probability" INTEGER DEFAULT 0,
    "expectedClose" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "source" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EngagementType" NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "description" TEXT,
    "assignedTo" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "contactId" TEXT,
    "testOrderId" TEXT,
    "type" "InteractionType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "participants" TEXT,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "taskType" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "parentTaskId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestOrder" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TestOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "requestedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "contactId" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "notes" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SampleType" NOT NULL DEFAULT 'PHYSICAL',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "receivedDate" TIMESTAMP(3),
    "receivedFrom" TEXT,
    "storageLocation" TEXT,
    "condition" TEXT,
    "status" "SampleStatus" NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "mediaIds" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSuite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedHours" DOUBLE PRECISION,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TestSuite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSuiteOnOrder" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "testSuiteId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "TestSuiteOnOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT,
    "testSuiteId" TEXT,
    "sampleId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "method" TEXT,
    "parameters" JSONB,
    "expectedResult" TEXT,
    "actualResult" TEXT,
    "status" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "performedBy" TEXT,
    "notes" TEXT,
    "data" JSONB,
    "mediaIds" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestReport" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "mediaId" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TestReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignProject" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DesignProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "requestedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "DesignProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignBrief" (
    "id" TEXT NOT NULL,
    "designProjectId" TEXT NOT NULL,
    "brandAssets" TEXT,
    "targetAudience" TEXT,
    "constraints" TEXT,
    "inspirations" TEXT,
    "deliverables" TEXT,
    "budget" DOUBLE PRECISION,
    "timeline" TEXT,
    "notes" TEXT,
    "mediaIds" TEXT,
    "status" "DesignBriefStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "DesignBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDesign" (
    "id" TEXT NOT NULL,
    "designProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "designType" TEXT NOT NULL DEFAULT 'GRAPHIC',
    "productType" TEXT,
    "mockupUrl" TEXT,
    "graphicSpecsFile" TEXT,
    "layerInfo" JSONB,
    "colorSeparations" TEXT,
    "status" "ProductDesignStatus" NOT NULL DEFAULT 'DRAFT',
    "feasibilityNotes" TEXT,
    "compatibilityCheck" BOOLEAN NOT NULL DEFAULT false,
    "decorationDetails" JSONB,
    "mediaIds" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDesignId" TEXT,
    "assignedTo" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ProductDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechPack" (
    "id" TEXT NOT NULL,
    "productDesignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sizing" JSONB,
    "materials" JSONB,
    "colors" JSONB,
    "decorationMethod" TEXT NOT NULL,
    "productionNotes" TEXT,
    "qualitySpecs" JSONB,
    "outputFiles" TEXT,
    "status" "TechPackStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TechPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignDeck" (
    "id" TEXT NOT NULL,
    "designProjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "designIds" TEXT,
    "deckUrl" TEXT,
    "mediaIds" TEXT,
    "status" "DesignDeckStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "DesignDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingEngagement" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trainingType" "TrainingType" NOT NULL DEFAULT 'INSTRUCTOR_LED',
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'HYBRID',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalDurationHours" DOUBLE PRECISION,
    "targetAudience" TEXT,
    "maxParticipants" INTEGER,
    "minParticipants" INTEGER,
    "status" "TrainingStatus" NOT NULL DEFAULT 'DRAFT',
    "phase" "TrainingPhase" NOT NULL DEFAULT 'DISCOVERY',
    "certificationLevel" "CertificationLevel" NOT NULL DEFAULT 'NONE',
    "requestedBy" TEXT NOT NULL,
    "requestedByUserId" TEXT,
    "instructorId" TEXT,
    "coordinatorId" TEXT,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "TrainingEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRegistration" (
    "id" TEXT NOT NULL,
    "trainingEngagementId" TEXT NOT NULL,
    "userId" TEXT,
    "contactId" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registrationSource" "TicketSource" NOT NULL DEFAULT 'INTERNAL',
    "externalRegistrationId" TEXT,
    "customData" JSONB,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "checkedInById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCheckIn" (
    "id" TEXT NOT NULL,
    "trainingRegistrationId" TEXT NOT NULL,
    "trainingSessionId" TEXT,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInById" TEXT NOT NULL,
    "location" TEXT,
    "deviceInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "trainingEngagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionNumber" INTEGER NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'HYBRID',
    "duration" DOUBLE PRECISION NOT NULL,
    "contentUrl" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "instructorId" TEXT,
    "maxCapacity" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "sopLibraryIds" TEXT,
    "hasPreAssessment" BOOLEAN NOT NULL DEFAULT false,
    "hasPostAssessment" BOOLEAN NOT NULL DEFAULT false,
    "preRequisiteLevel" "CompetencyLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordedUrl" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "trainingEngagementId" TEXT NOT NULL,
    "trainingSessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assessmentType" "AssessmentType" NOT NULL DEFAULT 'QUIZ',
    "administrationTiming" "TimingType" NOT NULL DEFAULT 'POST',
    "dueDate" TIMESTAMP(3),
    "questions" TEXT,
    "passingScore" DOUBLE PRECISION,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'PENDING',
    "score" DOUBLE PRECISION,
    "competencyLevel" "CompetencyLevel",
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "attachmentIds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationPlan" (
    "id" TEXT NOT NULL,
    "trainingEngagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "estimatedDurationDays" INTEGER,
    "goals" TEXT,
    "successCriteria" TEXT,
    "applicableDepartments" TEXT,
    "applicableRoles" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerUserId" TEXT,
    "supportContactId" TEXT,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "progressPercentage" DOUBLE PRECISION,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "ImplementationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOPLibrary" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "versionNotes" TEXT,
    "applicableDepartments" TEXT,
    "applicableRoles" TEXT,
    "requiredCertifications" TEXT,
    "status" "SOPStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3),
    "sunsetDate" TIMESTAMP(3),
    "attachmentIds" TEXT,
    "coverImageId" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedBy" TEXT,
    "reviewCycleMonths" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "SOPLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingReport" (
    "id" TEXT NOT NULL,
    "trainingEngagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reportType" "ReportType" NOT NULL DEFAULT 'COMPLETION',
    "totalParticipants" INTEGER,
    "totalAttended" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "averageScore" DOUBLE PRECISION,
    "overallCompetency" "CompetencyLevel",
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "averageAttendance" DOUBLE PRECISION,
    "certificationsIssued" INTEGER NOT NULL DEFAULT 0,
    "certificationTemplate" TEXT,
    "keyFindings" TEXT,
    "recommendations" TEXT,
    "successMetrics" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "reportFileId" TEXT,
    "certificatesFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "metaData" JSONB,

    CONSTRAINT "TrainingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignReview" (
    "id" TEXT NOT NULL,
    "productDesignId" TEXT,
    "designProjectId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerEmail" TEXT,
    "feedback" TEXT,
    "approvalStatus" "DesignReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "requestedAt" TIMESTAMP(3),
    "requestedBy" TEXT,
    "notes" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "DesignReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL DEFAULT 'EMAIL',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAudience" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignEmail" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "error" TEXT,
    "sentById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL DEFAULT 'GENERAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMicrosite" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "heroImageId" TEXT,
    "description" TEXT NOT NULL,
    "agenda" TEXT,
    "speakers" TEXT,
    "sponsors" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMicrosite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorMaterial" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MaterialType" NOT NULL DEFAULT 'ASSET',
    "fileId" TEXT,
    "url" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "MaterialStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CampaignTemplateToMarketingCampaign" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignTemplateToMarketingCampaign_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_activationToken_key" ON "User"("activationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_name_key" ON "UserGroup"("name");

-- CreateIndex
CREATE INDEX "UserGroup_name_idx" ON "UserGroup"("name");

-- CreateIndex
CREATE INDEX "UserGroup_createdAt_idx" ON "UserGroup"("createdAt");

-- CreateIndex
CREATE INDEX "UserGroupMember_userId_idx" ON "UserGroupMember"("userId");

-- CreateIndex
CREATE INDEX "UserGroupMember_groupId_idx" ON "UserGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "UserGroupMember_assignedAt_idx" ON "UserGroupMember"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroupMember_userId_groupId_key" ON "UserGroupMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE INDEX "Module_name_idx" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_key" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_moduleId_idx" ON "RolePermission"("moduleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_moduleId_permissionId_key" ON "RolePermission"("roleId", "moduleId", "permissionId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Media_uploadedById_idx" ON "Media"("uploadedById");

-- CreateIndex
CREATE INDEX "Media_visibility_idx" ON "Media"("visibility");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_entityType_entityId_idx" ON "Media"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- CreateIndex
CREATE INDEX "Settings_key_idx" ON "Settings"("key");

-- CreateIndex
CREATE INDEX "Settings_createdAt_idx" ON "Settings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_parentId_idx" ON "Customer"("parentId");

-- CreateIndex
CREATE INDEX "Customer_companyName_idx" ON "Customer"("companyName");

-- CreateIndex
CREATE INDEX "Customer_isActive_idx" ON "Customer"("isActive");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleType_key_key" ON "ModuleType"("key");

-- CreateIndex
CREATE INDEX "ModuleType_system_idx" ON "ModuleType"("system");

-- CreateIndex
CREATE INDEX "ModuleType_key_idx" ON "ModuleType"("key");

-- CreateIndex
CREATE INDEX "ModuleType_isEnabled_idx" ON "ModuleType"("isEnabled");

-- CreateIndex
CREATE INDEX "ModuleType_createdAt_idx" ON "ModuleType"("createdAt");

-- CreateIndex
CREATE INDEX "ModuleInstance_moduleTypeId_idx" ON "ModuleInstance"("moduleTypeId");

-- CreateIndex
CREATE INDEX "ModuleInstance_entityId_idx" ON "ModuleInstance"("entityId");

-- CreateIndex
CREATE INDEX "ModuleInstance_entityName_idx" ON "ModuleInstance"("entityName");

-- CreateIndex
CREATE INDEX "ModuleInstance_isActive_idx" ON "ModuleInstance"("isActive");

-- CreateIndex
CREATE INDEX "ModuleInstance_createdAt_idx" ON "ModuleInstance"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleInstance_moduleTypeId_entityId_key" ON "ModuleInstance"("moduleTypeId", "entityId");

-- CreateIndex
CREATE INDEX "FormData_key_idx" ON "FormData"("key");

-- CreateIndex
CREATE INDEX "FormData_createdAt_idx" ON "FormData"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_userId_key" ON "UserProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfiles_slug_key" ON "UserProfiles"("slug");

-- CreateIndex
CREATE INDEX "UserProfiles_userId_idx" ON "UserProfiles"("userId");

-- CreateIndex
CREATE INDEX "UserProfiles_slug_idx" ON "UserProfiles"("slug");

-- CreateIndex
CREATE INDEX "UserProfiles_isPublic_idx" ON "UserProfiles"("isPublic");

-- CreateIndex
CREATE INDEX "UserProfiles_createdAt_idx" ON "UserProfiles"("createdAt");

-- CreateIndex
CREATE INDEX "UserProfileModules_profileId_idx" ON "UserProfileModules"("profileId");

-- CreateIndex
CREATE INDEX "UserProfileModules_order_idx" ON "UserProfileModules"("order");

-- CreateIndex
CREATE INDEX "UserProfileModules_column_idx" ON "UserProfileModules"("column");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeCategories_name_key" ON "KnowledgeCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeCategories_slug_key" ON "KnowledgeCategories"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeCategories_slug_idx" ON "KnowledgeCategories"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeCategories_order_idx" ON "KnowledgeCategories"("order");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeTags_name_key" ON "KnowledgeTags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeTags_slug_key" ON "KnowledgeTags"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeTags_slug_idx" ON "KnowledgeTags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticles_slug_key" ON "KnowledgeArticles"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_slug_idx" ON "KnowledgeArticles"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_isPublished_idx" ON "KnowledgeArticles"("isPublished");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_publishedAt_idx" ON "KnowledgeArticles"("publishedAt");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_type_idx" ON "KnowledgeArticles"("type");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_visibility_idx" ON "KnowledgeArticles"("visibility");

-- CreateIndex
CREATE INDEX "KnowledgeArticles_createdAt_idx" ON "KnowledgeArticles"("createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeCategoriesOnKnowledge_categoryId_idx" ON "KnowledgeCategoriesOnKnowledge"("categoryId");

-- CreateIndex
CREATE INDEX "KnowledgeTagsOnKnowledge_tagId_idx" ON "KnowledgeTagsOnKnowledge"("tagId");

-- CreateIndex
CREATE INDEX "KnowledgeEventsOnKnowledge_eventId_idx" ON "KnowledgeEventsOnKnowledge"("eventId");

-- CreateIndex
CREATE INDEX "KnowledgeAssignedUsers_userId_idx" ON "KnowledgeAssignedUsers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeAssignedUsers_knowledgeId_userId_key" ON "KnowledgeAssignedUsers"("knowledgeId", "userId");

-- CreateIndex
CREATE INDEX "KnowledgeAssignedGroup_groupId_idx" ON "KnowledgeAssignedGroups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeAssignedGroup_knowledgeId_groupId_key" ON "KnowledgeAssignedGroups"("knowledgeId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeModuleTypes_key_key" ON "KnowledgeModuleTypes"("key");

-- CreateIndex
CREATE INDEX "KnowledgeModuleTypes_system_idx" ON "KnowledgeModuleTypes"("system");

-- CreateIndex
CREATE INDEX "KnowledgeModuleTypes_key_idx" ON "KnowledgeModuleTypes"("key");

-- CreateIndex
CREATE INDEX "KnowledgeEmailLogs_knowledgeId_idx" ON "KnowledgeEmailLogs"("knowledgeId");

-- CreateIndex
CREATE INDEX "KnowledgeEmailLogs_recipientId_idx" ON "KnowledgeEmailLogs"("recipientId");

-- CreateIndex
CREATE INDEX "KnowledgeEmailLogs_status_idx" ON "KnowledgeEmailLogs"("status");

-- CreateIndex
CREATE INDEX "KnowledgeEmailLogs_sentAt_idx" ON "KnowledgeEmailLogs"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeEmailLogs_knowledgeId_recipientId_sentAt_key" ON "KnowledgeEmailLogs"("knowledgeId", "recipientId", "sentAt");

-- CreateIndex
CREATE INDEX "PostCategories_slug_idx" ON "PostCategories"("slug");

-- CreateIndex
CREATE INDEX "PostCategories_order_idx" ON "PostCategories"("order");

-- CreateIndex
CREATE INDEX "PostCategories_type_idx" ON "PostCategories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategories_name_type_key" ON "PostCategories"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategories_slug_type_key" ON "PostCategories"("slug", "type");

-- CreateIndex
CREATE INDEX "PostTags_slug_idx" ON "PostTags"("slug");

-- CreateIndex
CREATE INDEX "PostTags_type_idx" ON "PostTags"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PostTags_name_type_key" ON "PostTags"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PostTags_slug_type_key" ON "PostTags"("slug", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Posts_slug_key" ON "Posts"("slug");

-- CreateIndex
CREATE INDEX "Posts_slug_idx" ON "Posts"("slug");

-- CreateIndex
CREATE INDEX "Posts_isPublished_idx" ON "Posts"("isPublished");

-- CreateIndex
CREATE INDEX "Posts_publishedAt_idx" ON "Posts"("publishedAt");

-- CreateIndex
CREATE INDEX "Posts_type_idx" ON "Posts"("type");

-- CreateIndex
CREATE INDEX "Posts_visibility_idx" ON "Posts"("visibility");

-- CreateIndex
CREATE INDEX "Posts_createdAt_idx" ON "Posts"("createdAt");

-- CreateIndex
CREATE INDEX "PostCategoriesOnPost_categoryId_idx" ON "PostCategoriesOnPost"("categoryId");

-- CreateIndex
CREATE INDEX "PostTagsOnPost_tagId_idx" ON "PostTagsOnPost"("tagId");

-- CreateIndex
CREATE INDEX "BackupRecords_backupType_idx" ON "BackupRecords"("backupType");

-- CreateIndex
CREATE INDEX "BackupRecords_createdAt_idx" ON "BackupRecords"("createdAt");

-- CreateIndex
CREATE INDEX "BackupRecords_status_idx" ON "BackupRecords"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BackupSettings_key_key" ON "BackupSettings"("key");

-- CreateIndex
CREATE INDEX "BackupSettings_key_idx" ON "BackupSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_ticketingMode_idx" ON "Event"("ticketingMode");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "EventSession_eventId_idx" ON "EventSession"("eventId");

-- CreateIndex
CREATE INDEX "EventSession_startTime_idx" ON "EventSession"("startTime");

-- CreateIndex
CREATE INDEX "TicketType_eventId_idx" ON "TicketType"("eventId");

-- CreateIndex
CREATE INDEX "TicketType_isActive_idx" ON "TicketType"("isActive");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrCode_key" ON "Ticket"("qrCode");

-- CreateIndex
CREATE INDEX "Ticket_ticketTypeId_idx" ON "Ticket"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_qrCode_idx" ON "Ticket"("qrCode");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE INDEX "Registration_registeredAt_idx" ON "Registration"("registeredAt");

-- CreateIndex
CREATE INDEX "CheckIn_registrationId_idx" ON "CheckIn"("registrationId");

-- CreateIndex
CREATE INDEX "CheckIn_checkedInAt_idx" ON "CheckIn"("checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_customerId_idx" ON "Contact"("customerId");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Opportunity_customerId_idx" ON "Opportunity"("customerId");

-- CreateIndex
CREATE INDEX "Opportunity_stage_idx" ON "Opportunity"("stage");

-- CreateIndex
CREATE INDEX "Opportunity_ownerId_idx" ON "Opportunity"("ownerId");

-- CreateIndex
CREATE INDEX "Engagement_customerId_idx" ON "Engagement"("customerId");

-- CreateIndex
CREATE INDEX "Engagement_type_idx" ON "Engagement"("type");

-- CreateIndex
CREATE INDEX "Engagement_status_idx" ON "Engagement"("status");

-- CreateIndex
CREATE INDEX "Engagement_assignedTo_idx" ON "Engagement"("assignedTo");

-- CreateIndex
CREATE INDEX "Interaction_customerId_idx" ON "Interaction"("customerId");

-- CreateIndex
CREATE INDEX "Interaction_contactId_idx" ON "Interaction"("contactId");

-- CreateIndex
CREATE INDEX "Interaction_testOrderId_idx" ON "Interaction"("testOrderId");

-- CreateIndex
CREATE INDEX "Interaction_type_idx" ON "Interaction"("type");

-- CreateIndex
CREATE INDEX "Interaction_date_idx" ON "Interaction"("date");

-- CreateIndex
CREATE INDEX "Task_entityType_entityId_idx" ON "Task"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_taskType_idx" ON "Task"("taskType");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "TestOrder_engagementId_idx" ON "TestOrder"("engagementId");

-- CreateIndex
CREATE INDEX "TestOrder_status_idx" ON "TestOrder"("status");

-- CreateIndex
CREATE INDEX "TestOrder_assignedTo_idx" ON "TestOrder"("assignedTo");

-- CreateIndex
CREATE INDEX "TestOrder_contactId_idx" ON "TestOrder"("contactId");

-- CreateIndex
CREATE INDEX "TestOrder_dueDate_idx" ON "TestOrder"("dueDate");

-- CreateIndex
CREATE INDEX "Sample_testOrderId_idx" ON "Sample"("testOrderId");

-- CreateIndex
CREATE INDEX "Sample_status_idx" ON "Sample"("status");

-- CreateIndex
CREATE INDEX "TestSuite_category_idx" ON "TestSuite"("category");

-- CreateIndex
CREATE INDEX "TestSuite_isActive_idx" ON "TestSuite"("isActive");

-- CreateIndex
CREATE INDEX "TestSuiteOnOrder_testOrderId_idx" ON "TestSuiteOnOrder"("testOrderId");

-- CreateIndex
CREATE INDEX "TestSuiteOnOrder_testSuiteId_idx" ON "TestSuiteOnOrder"("testSuiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TestSuiteOnOrder_testOrderId_testSuiteId_key" ON "TestSuiteOnOrder"("testOrderId", "testSuiteId");

-- CreateIndex
CREATE INDEX "Test_testOrderId_idx" ON "Test"("testOrderId");

-- CreateIndex
CREATE INDEX "Test_status_idx" ON "Test"("status");

-- CreateIndex
CREATE INDEX "Test_performedBy_idx" ON "Test"("performedBy");

-- CreateIndex
CREATE INDEX "TestReport_testOrderId_idx" ON "TestReport"("testOrderId");

-- CreateIndex
CREATE INDEX "TestReport_status_idx" ON "TestReport"("status");

-- CreateIndex
CREATE INDEX "TestReport_publishedAt_idx" ON "TestReport"("publishedAt");

-- CreateIndex
CREATE INDEX "DesignProject_engagementId_idx" ON "DesignProject"("engagementId");

-- CreateIndex
CREATE INDEX "DesignProject_customerId_idx" ON "DesignProject"("customerId");

-- CreateIndex
CREATE INDEX "DesignProject_status_idx" ON "DesignProject"("status");

-- CreateIndex
CREATE INDEX "DesignProject_assignedTo_idx" ON "DesignProject"("assignedTo");

-- CreateIndex
CREATE INDEX "DesignProject_dueDate_idx" ON "DesignProject"("dueDate");

-- CreateIndex
CREATE INDEX "DesignProject_createdAt_idx" ON "DesignProject"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DesignBrief_designProjectId_key" ON "DesignBrief"("designProjectId");

-- CreateIndex
CREATE INDEX "DesignBrief_designProjectId_idx" ON "DesignBrief"("designProjectId");

-- CreateIndex
CREATE INDEX "DesignBrief_status_idx" ON "DesignBrief"("status");

-- CreateIndex
CREATE INDEX "DesignBrief_createdAt_idx" ON "DesignBrief"("createdAt");

-- CreateIndex
CREATE INDEX "ProductDesign_designProjectId_idx" ON "ProductDesign"("designProjectId");

-- CreateIndex
CREATE INDEX "ProductDesign_status_idx" ON "ProductDesign"("status");

-- CreateIndex
CREATE INDEX "ProductDesign_designType_idx" ON "ProductDesign"("designType");

-- CreateIndex
CREATE INDEX "ProductDesign_productType_idx" ON "ProductDesign"("productType");

-- CreateIndex
CREATE INDEX "ProductDesign_assignedTo_idx" ON "ProductDesign"("assignedTo");

-- CreateIndex
CREATE INDEX "ProductDesign_parentDesignId_idx" ON "ProductDesign"("parentDesignId");

-- CreateIndex
CREATE INDEX "ProductDesign_createdAt_idx" ON "ProductDesign"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TechPack_productDesignId_key" ON "TechPack"("productDesignId");

-- CreateIndex
CREATE INDEX "TechPack_productDesignId_idx" ON "TechPack"("productDesignId");

-- CreateIndex
CREATE INDEX "TechPack_status_idx" ON "TechPack"("status");

-- CreateIndex
CREATE INDEX "TechPack_decorationMethod_idx" ON "TechPack"("decorationMethod");

-- CreateIndex
CREATE INDEX "TechPack_approvedAt_idx" ON "TechPack"("approvedAt");

-- CreateIndex
CREATE INDEX "TechPack_createdAt_idx" ON "TechPack"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DesignDeck_designProjectId_key" ON "DesignDeck"("designProjectId");

-- CreateIndex
CREATE INDEX "DesignDeck_designProjectId_idx" ON "DesignDeck"("designProjectId");

-- CreateIndex
CREATE INDEX "DesignDeck_status_idx" ON "DesignDeck"("status");

-- CreateIndex
CREATE INDEX "DesignDeck_publishedAt_idx" ON "DesignDeck"("publishedAt");

-- CreateIndex
CREATE INDEX "DesignDeck_createdAt_idx" ON "DesignDeck"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEngagement_engagementId_key" ON "TrainingEngagement"("engagementId");

-- CreateIndex
CREATE INDEX "TrainingEngagement_engagementId_idx" ON "TrainingEngagement"("engagementId");

-- CreateIndex
CREATE INDEX "TrainingEngagement_customerId_idx" ON "TrainingEngagement"("customerId");

-- CreateIndex
CREATE INDEX "TrainingEngagement_status_idx" ON "TrainingEngagement"("status");

-- CreateIndex
CREATE INDEX "TrainingEngagement_phase_idx" ON "TrainingEngagement"("phase");

-- CreateIndex
CREATE INDEX "TrainingEngagement_instructorId_idx" ON "TrainingEngagement"("instructorId");

-- CreateIndex
CREATE INDEX "TrainingEngagement_startDate_idx" ON "TrainingEngagement"("startDate");

-- CreateIndex
CREATE INDEX "TrainingEngagement_completedAt_idx" ON "TrainingEngagement"("completedAt");

-- CreateIndex
CREATE INDEX "TrainingRegistration_trainingEngagementId_idx" ON "TrainingRegistration"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "TrainingRegistration_userId_idx" ON "TrainingRegistration"("userId");

-- CreateIndex
CREATE INDEX "TrainingRegistration_contactId_idx" ON "TrainingRegistration"("contactId");

-- CreateIndex
CREATE INDEX "TrainingRegistration_status_idx" ON "TrainingRegistration"("status");

-- CreateIndex
CREATE INDEX "TrainingRegistration_registeredAt_idx" ON "TrainingRegistration"("registeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRegistration_trainingEngagementId_userId_key" ON "TrainingRegistration"("trainingEngagementId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRegistration_trainingEngagementId_contactId_key" ON "TrainingRegistration"("trainingEngagementId", "contactId");

-- CreateIndex
CREATE INDEX "TrainingCheckIn_trainingRegistrationId_idx" ON "TrainingCheckIn"("trainingRegistrationId");

-- CreateIndex
CREATE INDEX "TrainingCheckIn_trainingSessionId_idx" ON "TrainingCheckIn"("trainingSessionId");

-- CreateIndex
CREATE INDEX "TrainingCheckIn_checkedInAt_idx" ON "TrainingCheckIn"("checkedInAt");

-- CreateIndex
CREATE INDEX "TrainingSession_trainingEngagementId_idx" ON "TrainingSession"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "TrainingSession_startDate_idx" ON "TrainingSession"("startDate");

-- CreateIndex
CREATE INDEX "TrainingSession_status_idx" ON "TrainingSession"("status");

-- CreateIndex
CREATE INDEX "TrainingSession_instructorId_idx" ON "TrainingSession"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_trainingEngagementId_sessionNumber_key" ON "TrainingSession"("trainingEngagementId", "sessionNumber");

-- CreateIndex
CREATE INDEX "Assessment_trainingEngagementId_idx" ON "Assessment"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_competencyLevel_idx" ON "Assessment"("competencyLevel");

-- CreateIndex
CREATE INDEX "Assessment_takenAt_idx" ON "Assessment"("takenAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImplementationPlan_trainingEngagementId_key" ON "ImplementationPlan"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "ImplementationPlan_trainingEngagementId_idx" ON "ImplementationPlan"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "ImplementationPlan_status_idx" ON "ImplementationPlan"("status");

-- CreateIndex
CREATE INDEX "ImplementationPlan_endDate_idx" ON "ImplementationPlan"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SOPLibrary_slug_key" ON "SOPLibrary"("slug");

-- CreateIndex
CREATE INDEX "SOPLibrary_slug_idx" ON "SOPLibrary"("slug");

-- CreateIndex
CREATE INDEX "SOPLibrary_category_idx" ON "SOPLibrary"("category");

-- CreateIndex
CREATE INDEX "SOPLibrary_status_idx" ON "SOPLibrary"("status");

-- CreateIndex
CREATE INDEX "SOPLibrary_createdAt_idx" ON "SOPLibrary"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingReport_trainingEngagementId_key" ON "TrainingReport"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "TrainingReport_trainingEngagementId_idx" ON "TrainingReport"("trainingEngagementId");

-- CreateIndex
CREATE INDEX "DesignReview_productDesignId_idx" ON "DesignReview"("productDesignId");

-- CreateIndex
CREATE INDEX "DesignReview_designProjectId_idx" ON "DesignReview"("designProjectId");

-- CreateIndex
CREATE INDEX "DesignReview_approvalStatus_idx" ON "DesignReview"("approvalStatus");

-- CreateIndex
CREATE INDEX "DesignReview_reviewerEmail_idx" ON "DesignReview"("reviewerEmail");

-- CreateIndex
CREATE INDEX "DesignReview_requestedAt_idx" ON "DesignReview"("requestedAt");

-- CreateIndex
CREATE INDEX "DesignReview_createdAt_idx" ON "DesignReview"("createdAt");

-- CreateIndex
CREATE INDEX "MarketingCampaign_status_idx" ON "MarketingCampaign"("status");

-- CreateIndex
CREATE INDEX "MarketingCampaign_type_idx" ON "MarketingCampaign"("type");

-- CreateIndex
CREATE INDEX "MarketingCampaign_scheduledAt_idx" ON "MarketingCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "CampaignEmail_campaignId_idx" ON "CampaignEmail"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignEmail_recipientEmail_idx" ON "CampaignEmail"("recipientEmail");

-- CreateIndex
CREATE INDEX "CampaignEmail_status_idx" ON "CampaignEmail"("status");

-- CreateIndex
CREATE INDEX "CampaignTemplate_type_idx" ON "CampaignTemplate"("type");

-- CreateIndex
CREATE INDEX "CampaignTemplate_isActive_idx" ON "CampaignTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EventMicrosite_eventId_key" ON "EventMicrosite"("eventId");

-- CreateIndex
CREATE INDEX "EventMicrosite_eventId_idx" ON "EventMicrosite"("eventId");

-- CreateIndex
CREATE INDEX "EventMicrosite_isPublished_idx" ON "EventMicrosite"("isPublished");

-- CreateIndex
CREATE INDEX "SponsorMaterial_eventId_idx" ON "SponsorMaterial"("eventId");

-- CreateIndex
CREATE INDEX "SponsorMaterial_sponsorId_idx" ON "SponsorMaterial"("sponsorId");

-- CreateIndex
CREATE INDEX "SponsorMaterial_status_idx" ON "SponsorMaterial"("status");

-- CreateIndex
CREATE INDEX "SponsorMaterial_dueDate_idx" ON "SponsorMaterial"("dueDate");

-- CreateIndex
CREATE INDEX "_CampaignTemplateToMarketingCampaign_B_index" ON "_CampaignTemplateToMarketingCampaign"("B");

-- AddForeignKey
ALTER TABLE "UserGroupMember" ADD CONSTRAINT "UserGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupMember" ADD CONSTRAINT "UserGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleInstance" ADD CONSTRAINT "ModuleInstance_moduleTypeId_fkey" FOREIGN KEY ("moduleTypeId") REFERENCES "ModuleType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfiles" ADD CONSTRAINT "UserProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileModules" ADD CONSTRAINT "UserProfileModules_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCategoriesOnKnowledge" ADD CONSTRAINT "KnowledgeCategoriesOnKnowledge_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KnowledgeCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCategoriesOnKnowledge" ADD CONSTRAINT "KnowledgeCategoriesOnKnowledge_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeTagsOnKnowledge" ADD CONSTRAINT "KnowledgeTagsOnKnowledge_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeTagsOnKnowledge" ADD CONSTRAINT "KnowledgeTagsOnKnowledge_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "KnowledgeTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeEventsOnKnowledge" ADD CONSTRAINT "KnowledgeEventsOnKnowledge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeEventsOnKnowledge" ADD CONSTRAINT "KnowledgeEventsOnKnowledge_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAssignedUsers" ADD CONSTRAINT "KnowledgeAssignedUsers_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAssignedUsers" ADD CONSTRAINT "KnowledgeAssignedUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAssignedGroups" ADD CONSTRAINT "KnowledgeAssignedGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UserGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAssignedGroups" ADD CONSTRAINT "KnowledgeAssignedGroup_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeEmailLogs" ADD CONSTRAINT "KnowledgeEmailLogs_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeArticles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeEmailLogs" ADD CONSTRAINT "KnowledgeEmailLogs_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategoriesOnPost" ADD CONSTRAINT "PostCategoriesOnPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategoriesOnPost" ADD CONSTRAINT "PostCategoriesOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagsOnPost" ADD CONSTRAINT "PostTagsOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagsOnPost" ADD CONSTRAINT "PostTagsOnPost_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PostTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuiteOnOrder" ADD CONSTRAINT "TestSuiteOnOrder_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuiteOnOrder" ADD CONSTRAINT "TestSuiteOnOrder_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_testSuiteId_fkey" FOREIGN KEY ("testSuiteId") REFERENCES "TestSuite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignProject" ADD CONSTRAINT "DesignProject_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignBrief" ADD CONSTRAINT "DesignBrief_designProjectId_fkey" FOREIGN KEY ("designProjectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDesign" ADD CONSTRAINT "ProductDesign_designProjectId_fkey" FOREIGN KEY ("designProjectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDesign" ADD CONSTRAINT "ProductDesign_parentDesignId_fkey" FOREIGN KEY ("parentDesignId") REFERENCES "ProductDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechPack" ADD CONSTRAINT "TechPack_productDesignId_fkey" FOREIGN KEY ("productDesignId") REFERENCES "ProductDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignDeck" ADD CONSTRAINT "DesignDeck_designProjectId_fkey" FOREIGN KEY ("designProjectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEngagement" ADD CONSTRAINT "TrainingEngagement_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRegistration" ADD CONSTRAINT "TrainingRegistration_trainingEngagementId_fkey" FOREIGN KEY ("trainingEngagementId") REFERENCES "TrainingEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRegistration" ADD CONSTRAINT "TrainingRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRegistration" ADD CONSTRAINT "TrainingRegistration_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRegistration" ADD CONSTRAINT "TrainingRegistration_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCheckIn" ADD CONSTRAINT "TrainingCheckIn_trainingRegistrationId_fkey" FOREIGN KEY ("trainingRegistrationId") REFERENCES "TrainingRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCheckIn" ADD CONSTRAINT "TrainingCheckIn_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCheckIn" ADD CONSTRAINT "TrainingCheckIn_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_trainingEngagementId_fkey" FOREIGN KEY ("trainingEngagementId") REFERENCES "TrainingEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_trainingEngagementId_fkey" FOREIGN KEY ("trainingEngagementId") REFERENCES "TrainingEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationPlan" ADD CONSTRAINT "ImplementationPlan_trainingEngagementId_fkey" FOREIGN KEY ("trainingEngagementId") REFERENCES "TrainingEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingReport" ADD CONSTRAINT "TrainingReport_trainingEngagementId_fkey" FOREIGN KEY ("trainingEngagementId") REFERENCES "TrainingEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_productDesignId_fkey" FOREIGN KEY ("productDesignId") REFERENCES "ProductDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignReview" ADD CONSTRAINT "DesignReview_designProjectId_fkey" FOREIGN KEY ("designProjectId") REFERENCES "DesignProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEmail" ADD CONSTRAINT "CampaignEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEmail" ADD CONSTRAINT "CampaignEmail_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTemplate" ADD CONSTRAINT "CampaignTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTemplate" ADD CONSTRAINT "CampaignTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMicrosite" ADD CONSTRAINT "EventMicrosite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMicrosite" ADD CONSTRAINT "EventMicrosite_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMicrosite" ADD CONSTRAINT "EventMicrosite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMicrosite" ADD CONSTRAINT "EventMicrosite_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorMaterial" ADD CONSTRAINT "SponsorMaterial_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorMaterial" ADD CONSTRAINT "SponsorMaterial_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorMaterial" ADD CONSTRAINT "SponsorMaterial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorMaterial" ADD CONSTRAINT "SponsorMaterial_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorMaterial" ADD CONSTRAINT "SponsorMaterial_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignTemplateToMarketingCampaign" ADD CONSTRAINT "_CampaignTemplateToMarketingCampaign_A_fkey" FOREIGN KEY ("A") REFERENCES "CampaignTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignTemplateToMarketingCampaign" ADD CONSTRAINT "_CampaignTemplateToMarketingCampaign_B_fkey" FOREIGN KEY ("B") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
