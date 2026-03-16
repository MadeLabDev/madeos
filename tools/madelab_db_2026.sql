-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 16, 2025 at 08:08 PM
-- Server version: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- PHP Version: 8.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `madelab_db_2026`
--

-- --------------------------------------------------------

--
-- Table structure for table `Account`
--

CREATE TABLE `Account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` varchar(191) DEFAULT NULL,
  `access_token` varchar(191) DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` varchar(191) DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ActivityLog`
--

CREATE TABLE `ActivityLog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `details` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BackupRecords`
--

CREATE TABLE `BackupRecords` (
  `id` varchar(191) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileSize` bigint(20) NOT NULL DEFAULT 0,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL,
  `errorMessage` text DEFAULT NULL,
  `uploadedBy` varchar(191) NOT NULL,
  `r2Url` varchar(500) DEFAULT NULL,
  `backupType` enum('MANUAL','SCHEDULED') NOT NULL DEFAULT 'MANUAL',
  `retentionDays` int(11) NOT NULL DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `BackupRecords`
--

INSERT INTO `BackupRecords` (`id`, `fileName`, `fileSize`, `status`, `createdAt`, `completedAt`, `errorMessage`, `uploadedBy`, `r2Url`, `backupType`, `retentionDays`) VALUES
('cmhzsd5nf0000dr07i0pt8smk', 'backup-manual-2025-11-15T04-27-48-699Z.sql', 0, 'FAILED', '2025-11-15 04:27:48.894', '2025-11-15 04:27:49.915', 'mysqldump error: mysqldump: Got error: 2059: Authentication plugin \'mysql_native_password\' cannot be loaded: dlopen(/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so, 0x0002): tried: \'/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file), \'/System/Volumes/Preboot/Cryptexes/OS/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file), \'/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file) when trying to connect', 'system', NULL, 'MANUAL', 30),
('cmhzsedt90002dr07qrsyhtbd', 'backup-manual-2025-11-15T04-28-46-317Z.sql', 0, 'FAILED', '2025-11-15 04:28:46.318', '2025-11-15 04:28:47.055', 'mysqldump error: mysqldump: Got error: 2059: Authentication plugin \'mysql_native_password\' cannot be loaded: dlopen(/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so, 0x0002): tried: \'/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file), \'/System/Volumes/Preboot/Cryptexes/OS/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file), \'/usr/local/Cellar/mysql/9.5.0_2/lib/plugin/mysql_native_password.so\' (no such file) when trying to connect', 'system', NULL, 'MANUAL', 30),
('cmhztmr6g0000md0r3uf7gh51', 'backup-manual-2025-11-15T05-03-16-503Z.sql', 0, 'COMPLETED', '2025-11-15 05:03:16.504', '2025-11-15 05:03:17.351', NULL, 'system', 'https://53840984f0bc763624aedc9ccb98e01c.r2.cloudflarestorage.com/madelab-r2/backups/database/backup-manual-2025-11-15T05-03-16-503Z.sql', 'MANUAL', 30),
('cmi2546b30000jj0row5lxqvb', 'backup-manual-2025-11-16T20-00-17-390Z.sql', 0, 'FAILED', '2025-11-16 20:00:17.391', '2025-11-16 20:00:18.123', 'write EPROTO C0CCE9E3C27E0000:error:0A000410:SSL routines:ssl3_read_bytes:sslv3 alert handshake failure:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:1605:SSL alert number 40\n', 'system', NULL, 'MANUAL', 30),
('cmi254lq60001jj0rkbh68xvq', 'backup-manual-2025-11-16T20-00-37-373Z.sql', 0, 'FAILED', '2025-11-16 20:00:37.375', '2025-11-16 20:00:37.779', 'write EPROTO C0CCE9E3C27E0000:error:0A000410:SSL routines:ssl3_read_bytes:sslv3 alert handshake failure:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:1605:SSL alert number 40\n', 'system', NULL, 'MANUAL', 30);

-- --------------------------------------------------------

--
-- Table structure for table `BackupSettings`
--

CREATE TABLE `BackupSettings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `BackupSettings`
--

INSERT INTO `BackupSettings` (`id`, `key`, `value`, `description`, `createdAt`, `updatedAt`) VALUES
('enabled', 'enabled', 'true', 'Enable/disable scheduled backups', '2025-11-15 03:39:50.611', '2025-11-15 03:39:50.611'),
('max_concurrent_backups', 'max_concurrent_backups', '1', 'Maximum concurrent backup operations', '2025-11-15 03:39:50.611', '2025-11-15 03:39:50.611'),
('notification_email', 'notification_email', '', 'Email to send backup notifications (optional)', '2025-11-15 03:39:50.611', '2025-11-15 03:39:50.611'),
('retention_days', 'retention_days', '30', 'Number of days to keep backups', '2025-11-15 03:39:50.611', '2025-11-15 03:39:50.611'),
('schedule_hour', 'schedule_hour', '2', 'Hour of day to run scheduled backup (0-23)', '2025-11-15 03:39:50.611', '2025-11-15 03:39:50.611');

-- --------------------------------------------------------

--
-- Table structure for table `BackupStats`
--

CREATE TABLE `BackupStats` (
  `id` varchar(191) NOT NULL,
  `totalBackups` int(11) NOT NULL DEFAULT 0,
  `successfulBackups` int(11) NOT NULL DEFAULT 0,
  `failedBackups` int(11) NOT NULL DEFAULT 0,
  `totalSize` bigint(20) NOT NULL DEFAULT 0,
  `lastBackupDate` datetime(3) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `BackupStats`
--

INSERT INTO `BackupStats` (`id`, `totalBackups`, `successfulBackups`, `failedBackups`, `totalSize`, `lastBackupDate`, `updatedAt`) VALUES
('default', 5, 1, 4, 0, '2025-11-15 05:03:17.351', '2025-11-16 20:00:38.377');

-- --------------------------------------------------------

--
-- Table structure for table `Customer`
--

CREATE TABLE `Customer` (
  `id` varchar(191) NOT NULL,
  `companyName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `address` varchar(191) NOT NULL,
  `city` varchar(191) NOT NULL,
  `state` varchar(191) NOT NULL,
  `zipCode` varchar(191) NOT NULL,
  `country` varchar(191) NOT NULL DEFAULT 'USA',
  `contactName` varchar(191) NOT NULL,
  `contactTitle` varchar(191) DEFAULT NULL,
  `contactEmail` varchar(191) DEFAULT NULL,
  `contactPhone` varchar(191) DEFAULT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'STANDARD',
  `taxId` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `discountPercent` double NOT NULL DEFAULT 0,
  `paymentTermsDays` int(11) NOT NULL DEFAULT 30,
  `creditLimit` double DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `updatedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FormData`
--

CREATE TABLE `FormData` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `referer` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeArticles`
--

CREATE TABLE `KnowledgeArticles` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `content` longtext NOT NULL,
  `excerpt` text DEFAULT NULL,
  `thumbnail` text DEFAULT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'knowledge',
  `visibility` varchar(191) NOT NULL DEFAULT 'public',
  `viewCount` int(11) NOT NULL DEFAULT 0,
  `isPublished` tinyint(1) NOT NULL DEFAULT 0,
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `KnowledgeArticles`
--

INSERT INTO `KnowledgeArticles` (`id`, `title`, `slug`, `content`, `excerpt`, `thumbnail`, `type`, `visibility`, `viewCount`, `isPublished`, `publishedAt`, `createdAt`, `updatedAt`) VALUES
('cmhz2i5br0001lo0rictoqumh', 'Print Hustlers 2025', 'print-hustlers-2025', '{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"This is your exclusive hub for every session, workshop, and resource from this year’s event at The Second City in Chicago. Inside, you’ll find full-length presentation videos, downloadable speaker materials, and bonus insights to help you implement what you learned. Join our exclusive Google Chat to ask questions and interact. \",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1,\"textFormat\":0,\"textStyle\":\"\"}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}', 'This is your exclusive hub for every session, workshop, and resource from this year’s event at The Second City in Chicago. Inside, you’ll find full-length presentation videos, downloadable speaker materials, and bonus insights to help you implement what you learned. Join our exclusive Google Chat to ask questions and interact. ', 'https://pub-d404c3e8309d449483f8e66fea8de769.r2.dev/media/1763137570625-4udi2u.jpg', 'event', 'private', 214, 1, NULL, '2025-11-14 16:23:51.928', '2025-11-16 20:08:22.017');

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeAssignedGroups`
--

CREATE TABLE `KnowledgeAssignedGroups` (
  `id` varchar(191) NOT NULL,
  `knowledgeId` varchar(191) NOT NULL,
  `groupId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `assignedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `KnowledgeAssignedGroups`
--

INSERT INTO `KnowledgeAssignedGroups` (`id`, `knowledgeId`, `groupId`, `assignedAt`, `assignedBy`) VALUES
('cmhzanr6x000pjh0r51x6eeea', 'cmhz2i5br0001lo0rictoqumh', 'cmhz2xnsy0009lo0rz0law09l', '2025-11-14 20:12:10.474', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeAssignedUsers`
--

CREATE TABLE `KnowledgeAssignedUsers` (
  `id` varchar(191) NOT NULL,
  `knowledgeId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `assignedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeCategories`
--

CREATE TABLE `KnowledgeCategories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT '#000000',
  `icon` varchar(191) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `KnowledgeCategories`
--

INSERT INTO `KnowledgeCategories` (`id`, `name`, `slug`, `description`, `color`, `icon`, `order`, `createdAt`, `updatedAt`) VALUES
('cmhz2hze20000lo0r3e6oetau', 'Print Hustlers 2025', 'print-hustlers-2025', NULL, '#000000', NULL, 0, '2025-11-14 16:23:44.234', '2025-11-14 16:23:44.234');

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeCategoriesOnKnowledge`
--

CREATE TABLE `KnowledgeCategoriesOnKnowledge` (
  `knowledgeId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `KnowledgeCategoriesOnKnowledge`
--

INSERT INTO `KnowledgeCategoriesOnKnowledge` (`knowledgeId`, `categoryId`, `assignedAt`) VALUES
('cmhz2i5br0001lo0rictoqumh', 'cmhz2hze20000lo0r3e6oetau', '2025-11-14 20:12:09.278');

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeEmailLogs`
--

CREATE TABLE `KnowledgeEmailLogs` (
  `id` varchar(191) NOT NULL,
  `knowledgeId` varchar(191) NOT NULL,
  `recipientId` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `recipient_email` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `sentAt` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL,
  `errorMessage` varchar(191) DEFAULT NULL,
  `triggeredBy` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `KnowledgeEmailLogs`
--

INSERT INTO `KnowledgeEmailLogs` (`id`, `knowledgeId`, `recipientId`, `subject`, `recipient_email`, `type`, `sentAt`, `status`, `errorMessage`, `triggeredBy`, `createdAt`, `updatedAt`) VALUES
('cmhzantyb000tjh0rnjp3fknm', 'cmhz2i5br0001lo0rictoqumh', 'cmhzajomd000ljh0r4zgp7u8b', 'New article assigned: Print Hustlers 2025', 'test@madelab.io', 'assignment', '2025-11-14 20:12:14.052', 'sent', NULL, 'cmhz2h33i008gnlln44m6in1y', '2025-11-14 20:12:14.052', '2025-11-14 20:12:14.052'),
('cmhzhvzs40005ok0quanl4txd', 'cmhz2i5br0001lo0rictoqumh', 'cmhzhvwoh0000ok0q2o2zq0vs', 'New article assigned: Print Hustlers 2025', 'tom@madelab.io', 'assignment', '2025-11-14 23:34:32.164', 'sent', NULL, '', '2025-11-14 23:34:32.164', '2025-11-14 23:34:32.164'),
('cmhzhxvcb000bok0qdi7lo61c', 'cmhz2i5br0001lo0rictoqumh', 'cmhzhxsku0006ok0q7jj4x6js', 'New article assigned: Print Hustlers 2025', 'ryan@madelab.io', 'assignment', '2025-11-14 23:35:59.723', 'sent', NULL, '', '2025-11-14 23:35:59.723', '2025-11-14 23:35:59.723'),
('cmhzibbdg000hok0q0o5fai5u', 'cmhz2i5br0001lo0rictoqumh', 'cmhzib8nn000cok0qo8glkbia', 'New article assigned: Print Hustlers 2025', 'brett@madelab.io', 'assignment', '2025-11-14 23:46:27.028', 'sent', NULL, '', '2025-11-14 23:46:27.028', '2025-11-14 23:46:27.028'),
('cmi24lcxf0008ll0rgmylpw02', 'cmhz2i5br0001lo0rictoqumh', 'cmi24l9tn0003ll0r3vgqekak', 'New article assigned: Print Hustlers 2025', 'demo@madelab.io', 'assignment', '2025-11-16 19:45:39.507', 'sent', NULL, '', '2025-11-16 19:45:39.507', '2025-11-16 19:45:39.507');

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeModuleTypes`
--

CREATE TABLE `KnowledgeModuleTypes` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `system` varchar(191) NOT NULL DEFAULT 'knowledge',
  `description` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `fieldSchema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeTags`
--

CREATE TABLE `KnowledgeTags` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT '#666666',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeTagsOnKnowledge`
--

CREATE TABLE `KnowledgeTagsOnKnowledge` (
  `knowledgeId` varchar(191) NOT NULL,
  `tagId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Media`
--

CREATE TABLE `Media` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `size` int(11) NOT NULL,
  `visibility` varchar(191) NOT NULL DEFAULT 'PRIVATE',
  `uploadedById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Media`
--

INSERT INTO `Media` (`id`, `name`, `url`, `type`, `size`, `visibility`, `uploadedById`, `createdAt`, `updatedAt`) VALUES
('cmhz2l4xw0008lo0rmoeij9fg', 'Print-Hustlers-2025-118.jpg', 'https://pub-d404c3e8309d449483f8e66fea8de769.r2.dev/media/1763137570625-4udi2u.jpg', 'image/jpeg', 249456, 'PRIVATE', 'cmhz2h2uh008fnllnxk9vrx3k', '2025-11-14 16:26:11.396', '2025-11-14 16:26:11.396');

-- --------------------------------------------------------

--
-- Table structure for table `Module`
--

CREATE TABLE `Module` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `displayName` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Module`
--

INSERT INTO `Module` (`id`, `name`, `displayName`, `description`, `createdAt`, `updatedAt`) VALUES
('backup_module_id', 'backup', 'Backup Management', 'Database backup and restore operations', '2025-11-15 03:39:50.000', '2025-11-15 03:39:50.000'),
('cmhz2gdpv0005nlln3z622cgk', 'users', 'User Management', 'Manage system users', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdpv0006nllnefb0q7cf', 'customers', 'Customer Management', 'Manage customers', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdpv0009nllnrf5ngx9s', 'reports', 'Reports', 'View and export reports', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdvy000anllnmp24zgdg', 'settings', 'Settings', 'System settings', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdw3000bnllnu9nmv6eh', 'media', 'Media Management', 'Manage media files, uploads', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdw6000cnllnn8uo37gp', 'meta', 'Meta', 'Manage meta configurations and module types', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdw6000fnlln72o6zn9j', 'knowledge', 'Knowledge Base', 'Manage knowledge articles and documentation', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492'),
('cmhz2gdw8000hnlln57tmpbgd', 'roles', 'Roles', 'Manage user roles and permissions', '2025-11-14 16:22:29.492', '2025-11-14 16:22:29.492');

-- --------------------------------------------------------

--
-- Table structure for table `ModuleInstance`
--

CREATE TABLE `ModuleInstance` (
  `id` varchar(191) NOT NULL,
  `moduleTypeId` varchar(191) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `entityName` varchar(191) NOT NULL,
  `fieldValues` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `updatedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ModuleType`
--

CREATE TABLE `ModuleType` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `system` varchar(191) NOT NULL DEFAULT 'profile',
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `fieldSchema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lockedFields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `updatedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ModuleType`
--

INSERT INTO `ModuleType` (`id`, `key`, `system`, `name`, `description`, `fieldSchema`, `lockedFields`, `isEnabled`, `order`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`) VALUES
('cmhz2h4eu0090nllnsfdenefq', 'knowngle', 'knowngle', 'Knowledge Meta', 'Metadata schema for knowledge base articles', '{\"fields\":[{\"id\":\"knowngle-meta-title\",\"name\":\"metaTitle\",\"label\":\"Meta Title\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Enter meta title\",\"order\":1},{\"id\":\"knowngle-meta-description\",\"name\":\"metaDescription\",\"label\":\"Meta Description\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"Enter meta description\",\"order\":2}]}', '[\"knowngle-meta-title\",\"knowngle-meta-description\"]', 1, 2, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h4l60091nlln1lvg4u12', 'product', 'product', 'Product Meta', 'Metadata schema for product catalog', '{\"fields\":[{\"id\":\"product-meta-title\",\"name\":\"metaTitle\",\"label\":\"Meta Title\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Enter product meta title\",\"order\":1},{\"id\":\"product-meta-description\",\"name\":\"metaDescription\",\"label\":\"Meta Description\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"Enter product meta description\",\"order\":2},{\"id\":\"product-sku\",\"name\":\"sku\",\"label\":\"Product SKU\",\"type\":\"text\",\"required\":true,\"placeholder\":\"PROD-001\",\"order\":3}]}', '[\"product-meta-title\",\"product-sku\",\"product-meta-description\"]', 1, 3, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h4l60092nlln75oc895g', 'profile-addons', 'meta', 'Profile Addons', 'Optional SEO and social media fields for profile', '{\"fields\":[{\"id\":\"profile-meta-title\",\"name\":\"metaTitle\",\"label\":\"Profile Meta Title\",\"type\":\"text\",\"required\":false,\"placeholder\":\"SEO meta title (50-60 characters)\",\"order\":1},{\"id\":\"profile-meta-description\",\"name\":\"metaDescription\",\"label\":\"Profile Meta Description\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"SEO meta description (150-160 characters)\",\"order\":2},{\"id\":\"profile-meta-keywords\",\"name\":\"metaKeywords\",\"label\":\"Meta Keywords\",\"type\":\"text\",\"required\":false,\"placeholder\":\"Keywords separated by commas\",\"order\":3},{\"id\":\"profile-og-image\",\"name\":\"ogImage\",\"label\":\"OG Image URL\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://example.com/image.jpg\",\"order\":4},{\"id\":\"profile-twitter-handle\",\"name\":\"twitterHandle\",\"label\":\"Twitter Handle\",\"type\":\"text\",\"required\":false,\"placeholder\":\"@yourhandle\",\"order\":5},{\"id\":\"profile-github-url\",\"name\":\"githubUrl\",\"label\":\"GitHub Profile\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://github.com/username\",\"order\":6},{\"id\":\"profile-linkedin-url\",\"name\":\"linkedinUrl\",\"label\":\"LinkedIn Profile\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://linkedin.com/in/username\",\"order\":7}]}', '[]', 1, 6, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h4l60093nllngnswv7j4', 'blog', 'blog', 'Blog Meta', 'Metadata schema for blog posts', '{\"fields\":[{\"id\":\"blog-meta-title\",\"name\":\"metaTitle\",\"label\":\"Meta Title\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Enter meta title (50-60 characters)\",\"order\":1},{\"id\":\"blog-meta-description\",\"name\":\"metaDescription\",\"label\":\"Meta Description\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"Enter meta description (150-160 characters)\",\"order\":2},{\"id\":\"blog-meta-keywords\",\"name\":\"metaKeywords\",\"label\":\"Meta Keywords\",\"type\":\"text\",\"required\":false,\"placeholder\":\"Enter keywords separated by commas\",\"order\":3},{\"id\":\"blog-og-image\",\"name\":\"ogImage\",\"label\":\"OG Image URL\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://example.com/image.jpg\",\"order\":4},{\"id\":\"blog-canonical-url\",\"name\":\"canonicalUrl\",\"label\":\"Canonical URL\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://example.com/blog/post-slug\",\"order\":5}]}', '[\"blog-meta-title\",\"blog-meta-description\",\"blog-meta-keywords\",\"blog-og-image\",\"blog-canonical-url\"]', 1, 1, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h4l60094nlln587i80pp', 'order', 'order', 'Order Meta', 'Metadata schema for orders', '{\"fields\":[{\"id\":\"order-priority\",\"name\":\"priority\",\"label\":\"Order Priority\",\"type\":\"select\",\"required\":true,\"order\":1,\"options\":[{\"value\":\"low\",\"label\":\"Low\"},{\"value\":\"normal\",\"label\":\"Normal\"},{\"value\":\"high\",\"label\":\"High\"},{\"value\":\"urgent\",\"label\":\"Urgent\"}]},{\"id\":\"order-notes\",\"name\":\"internalNotes\",\"label\":\"Internal Notes\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"Internal notes for staff\",\"order\":2}]}', '[\"order-priority\",\"order-notes\"]', 1, 4, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h4l60095nlln49x23fyw', 'meta', 'meta', 'Profile Meta', 'Metadata schema for profile', '{\"fields\":[{\"id\":\"profile-full-name\",\"name\":\"fullName\",\"label\":\"Full Name\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Enter full name\",\"order\":1},{\"id\":\"profile-bio\",\"name\":\"bio\",\"label\":\"Bio\",\"type\":\"richtext\",\"required\":false,\"placeholder\":\"Brief biography or description\",\"order\":2},{\"id\":\"profile-avatar-url\",\"name\":\"avatarUrl\",\"label\":\"Avatar URL\",\"type\":\"image\",\"required\":false,\"placeholder\":\"Upload Image\",\"order\":3},{\"id\":\"profile-cover-url\",\"name\":\"coverURL\",\"label\":\"Cover URL\",\"type\":\"image\",\"required\":false,\"placeholder\":\"Upload Image\",\"order\":4},{\"id\":\"profile-phone\",\"name\":\"phone\",\"label\":\"Phone Number\",\"type\":\"text\",\"required\":false,\"placeholder\":\"+1 (555) 000-0000\",\"order\":5},{\"id\":\"profile-location\",\"name\":\"location\",\"label\":\"Location\",\"type\":\"text\",\"required\":false,\"placeholder\":\"City, Country\",\"order\":6},{\"id\":\"profile-company\",\"name\":\"company\",\"label\":\"Company Name\",\"type\":\"text\",\"required\":false,\"placeholder\":\"Company or organization name\",\"order\":7},{\"id\":\"profile-website\",\"name\":\"website\",\"label\":\"Website/Portfolio\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://example.com\",\"order\":8},{\"id\":\"profile-social-media\",\"name\":\"socialMedia\",\"label\":\"Social Media Links\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"\",\"order\":9},{\"id\":\"profile-preferences\",\"name\":\"preferences\",\"label\":\"User Preferences\",\"type\":\"tags\",\"required\":false,\"placeholder\":\"\",\"order\":10}]}', '[\"profile-full-name\",\"profile-bio\",\"profile-avatar-url\",\"profile-cover-url\",\"profile-phone\",\"profile-location\",\"profile-company\",\"profile-website\",\"profile-social-media\",\"profile-preferences\"]', 1, 5, '2025-11-14 16:23:04.087', '2025-11-14 16:23:04.087', NULL, NULL),
('cmhz2h53k0096nlln2mnj7an5', 'work_experience', 'profile', 'Work Experience', 'Add your work experience and employment history', '{\"fields\":[{\"id\":\"company\",\"name\":\"company\",\"label\":\"Company\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Company name\",\"order\":1},{\"id\":\"role\",\"name\":\"role\",\"label\":\"Job Title\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., Senior Developer\",\"order\":2},{\"id\":\"location\",\"name\":\"location\",\"label\":\"Location\",\"type\":\"text\",\"required\":false,\"placeholder\":\"City, Country\",\"order\":3},{\"id\":\"startDate\",\"name\":\"startDate\",\"label\":\"Start Date\",\"type\":\"date\",\"required\":true,\"order\":4},{\"id\":\"endDate\",\"name\":\"endDate\",\"label\":\"End Date (leave empty if current)\",\"type\":\"date\",\"required\":false,\"order\":5},{\"id\":\"isCurrentRole\",\"name\":\"isCurrentRole\",\"label\":\"Currently working here\",\"type\":\"boolean\",\"required\":false,\"order\":6},{\"id\":\"description\",\"name\":\"description\",\"label\":\"Description\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"Describe your responsibilities and achievements\",\"rows\":4,\"order\":7},{\"id\":\"skills\",\"name\":\"skills\",\"label\":\"Skills Used (comma-separated)\",\"type\":\"text\",\"required\":false,\"placeholder\":\"e.g., React, TypeScript, Node.js\",\"order\":8}]}', '[]', 1, 1, '2025-11-14 16:23:04.976', '2025-11-14 16:23:04.976', NULL, NULL),
('cmhz2h5e90097nllngpp126rw', 'education', 'profile', 'Education', 'Add your educational background', '{\"fields\":[{\"id\":\"school\",\"name\":\"school\",\"label\":\"School / University\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Institution name\",\"order\":1},{\"id\":\"degree\",\"name\":\"degree\",\"label\":\"Degree\",\"type\":\"select\",\"required\":true,\"options\":[{\"value\":\"high_school\",\"label\":\"High School\"},{\"value\":\"associate\",\"label\":\"Associate Degree\"},{\"value\":\"bachelor\",\"label\":\"Bachelor\"},{\"value\":\"master\",\"label\":\"Master\"},{\"value\":\"phd\",\"label\":\"PhD\"},{\"value\":\"certificate\",\"label\":\"Certificate\"},{\"value\":\"bootcamp\",\"label\":\"Bootcamp\"},{\"value\":\"other\",\"label\":\"Other\"}],\"order\":2},{\"id\":\"field\",\"name\":\"field\",\"label\":\"Field of Study\",\"type\":\"text\",\"required\":false,\"placeholder\":\"e.g., Computer Science\",\"order\":3},{\"id\":\"startDate\",\"name\":\"startDate\",\"label\":\"Start Date\",\"type\":\"date\",\"required\":true,\"order\":4},{\"id\":\"endDate\",\"name\":\"endDate\",\"label\":\"End Date (leave empty if still studying)\",\"type\":\"date\",\"required\":false,\"order\":5},{\"id\":\"grade\",\"name\":\"grade\",\"label\":\"Grade / GPA\",\"type\":\"text\",\"required\":false,\"placeholder\":\"3.8 GPA\",\"order\":6},{\"id\":\"description\",\"name\":\"description\",\"label\":\"Description\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"e.g., Activities, notable achievements\",\"rows\":4,\"order\":7}]}', '[]', 1, 2, '2025-11-14 16:23:05.362', '2025-11-14 16:23:05.362', NULL, NULL),
('cmhz2h5lz0098nlln1bhwpk6m', 'skills', 'profile', 'Skills', 'List your professional skills', '{\"fields\":[{\"id\":\"name\",\"name\":\"name\",\"label\":\"Skill Name\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., React, Project Management\",\"order\":1},{\"id\":\"level\",\"name\":\"level\",\"label\":\"Proficiency Level\",\"type\":\"select\",\"required\":true,\"options\":[{\"value\":\"beginner\",\"label\":\"Beginner\"},{\"value\":\"intermediate\",\"label\":\"Intermediate\"},{\"value\":\"advanced\",\"label\":\"Advanced\"},{\"value\":\"expert\",\"label\":\"Expert\"}],\"order\":2},{\"id\":\"yearsOfExperience\",\"name\":\"yearsOfExperience\",\"label\":\"Years of Experience\",\"type\":\"number\",\"required\":false,\"order\":3},{\"id\":\"endorsements\",\"name\":\"endorsements\",\"label\":\"Endorsements\",\"type\":\"number\",\"required\":false,\"order\":4}]}', '[]', 1, 3, '2025-11-14 16:23:05.639', '2025-11-14 16:23:05.639', NULL, NULL),
('cmhz2h5tj0099nlln815sh2d4', 'certification', 'profile', 'Certification', 'Add your professional certifications', '{\"fields\":[{\"id\":\"name\",\"name\":\"name\",\"label\":\"Certification Name\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., AWS Certified Solutions Architect\",\"order\":1},{\"id\":\"issuer\",\"name\":\"issuer\",\"label\":\"Issuing Organization\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., Amazon\",\"order\":2},{\"id\":\"issueDate\",\"name\":\"issueDate\",\"label\":\"Issue Date\",\"type\":\"date\",\"required\":true,\"order\":3},{\"id\":\"expiryDate\",\"name\":\"expiryDate\",\"label\":\"Expiry Date (leave empty if no expiry)\",\"type\":\"date\",\"required\":false,\"order\":4},{\"id\":\"credentialUrl\",\"name\":\"credentialUrl\",\"label\":\"Credential URL\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://credentials.example.com/xxx\",\"order\":5},{\"id\":\"description\",\"name\":\"description\",\"label\":\"Description\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"Describe the certification\",\"rows\":3,\"order\":6}]}', '[]', 1, 4, '2025-11-14 16:23:05.911', '2025-11-14 16:23:05.911', NULL, NULL),
('cmhz2h617009anllnm9ztpz7c', 'project', 'profile', 'Project', 'Showcase your projects and portfolio work', '{\"fields\":[{\"id\":\"name\",\"name\":\"name\",\"label\":\"Project Name\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., E-commerce Platform\",\"order\":1},{\"id\":\"description\",\"name\":\"description\",\"label\":\"Description\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"Describe the project and your role\",\"rows\":4,\"order\":2},{\"id\":\"url\",\"name\":\"url\",\"label\":\"Project URL\",\"type\":\"url\",\"required\":false,\"placeholder\":\"https://project.example.com\",\"order\":3},{\"id\":\"startDate\",\"name\":\"startDate\",\"label\":\"Start Date\",\"type\":\"date\",\"required\":true,\"order\":4},{\"id\":\"endDate\",\"name\":\"endDate\",\"label\":\"End Date (leave empty if ongoing)\",\"type\":\"date\",\"required\":false,\"order\":5},{\"id\":\"technologies\",\"name\":\"technologies\",\"label\":\"Technologies Used (comma-separated)\",\"type\":\"text\",\"required\":false,\"placeholder\":\"e.g., React, Node.js, PostgreSQL\",\"order\":6}]}', '[]', 1, 5, '2025-11-14 16:23:06.187', '2025-11-14 16:23:06.187', NULL, NULL),
('cmhz2h68v009bnllnyi9rk9nb', 'volunteer', 'profile', 'Volunteer Experience', 'Share your volunteer and community work', '{\"fields\":[{\"id\":\"organization\",\"name\":\"organization\",\"label\":\"Organization\",\"type\":\"text\",\"required\":true,\"placeholder\":\"Organization name\",\"order\":1},{\"id\":\"role\",\"name\":\"role\",\"label\":\"Volunteer Role\",\"type\":\"text\",\"required\":true,\"placeholder\":\"e.g., Technical Mentor\",\"order\":2},{\"id\":\"location\",\"name\":\"location\",\"label\":\"Location\",\"type\":\"text\",\"required\":false,\"placeholder\":\"City, Country\",\"order\":3},{\"id\":\"startDate\",\"name\":\"startDate\",\"label\":\"Start Date\",\"type\":\"date\",\"required\":true,\"order\":4},{\"id\":\"endDate\",\"name\":\"endDate\",\"label\":\"End Date (leave empty if still volunteering)\",\"type\":\"date\",\"required\":false,\"order\":5},{\"id\":\"description\",\"name\":\"description\",\"label\":\"Description\",\"type\":\"textarea\",\"required\":false,\"placeholder\":\"Describe your volunteer work and impact\",\"rows\":4,\"order\":6},{\"id\":\"skills\",\"name\":\"skills\",\"label\":\"Skills Used (comma-separated)\",\"type\":\"text\",\"required\":false,\"placeholder\":\"e.g., Teaching, Mentoring\",\"order\":7}]}', '[]', 1, 6, '2025-11-14 16:23:06.463', '2025-11-14 16:23:06.463', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Permission`
--

CREATE TABLE `Permission` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `displayName` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Permission`
--

INSERT INTO `Permission` (`id`, `action`, `displayName`, `description`, `createdAt`) VALUES
('cmhz2gda30000nllnabvv1oax', 'read', 'View', 'Can view records', '2025-11-14 16:22:28.923'),
('cmhz2gdg50001nllnq6osyp7i', 'update', 'Edit', 'Can edit existing records', '2025-11-14 16:22:28.923'),
('cmhz2gdg60002nllnr14htiy8', 'delete', 'Delete', 'Can delete records', '2025-11-14 16:22:28.923'),
('cmhz2gdg80003nlln4wazaijw', 'create', 'Create', 'Can create new records', '2025-11-14 16:22:28.923'),
('cmhz2gdg80004nllnnd111d0z', 'approve', 'Approve', 'Can approve/reject records', '2025-11-14 16:22:28.923');

-- --------------------------------------------------------

--
-- Table structure for table `Role`
--

CREATE TABLE `Role` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `displayName` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Role`
--

INSERT INTO `Role` (`id`, `name`, `displayName`, `description`, `createdAt`, `updatedAt`) VALUES
('cmhz2ge71000knllnnbw43cgf', 'admin', 'Administrator', 'Full system access', '2025-11-14 16:22:30.110', '2025-11-14 16:22:30.110'),
('cmhz2geg2000lnllna5tnsekq', 'manager', 'Manager', 'Manage multiple departments', '2025-11-14 16:22:30.434', '2025-11-14 16:22:30.434'),
('cmhz2gema000mnllnfke7xno0', 'user', 'User', 'Limited access - can only login and change password', '2025-11-14 16:22:30.658', '2025-11-14 16:22:30.658');

-- --------------------------------------------------------

--
-- Table structure for table `RolePermission`
--

CREATE TABLE `RolePermission` (
  `id` varchar(191) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  `moduleId` varchar(191) NOT NULL,
  `permissionId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RolePermission`
--

INSERT INTO `RolePermission` (`id`, `roleId`, `moduleId`, `permissionId`, `createdAt`) VALUES
('cmhz2gesd000onllnhjslmbqo', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:30.878'),
('cmhz2gf1m000qnlln2w6kdoid', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:31.210'),
('cmhz2gf7p000snllns47pcqp1', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:31.429'),
('cmhz2gfdq000unllnft9yvk51', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:31.647'),
('cmhz2gfju000wnllnfiqlh0ar', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:31.867'),
('cmhz2ggk90018nlln68nryp8d', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:33.177'),
('cmhz2ggqg001anllntk6wkh2k', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:33.400'),
('cmhz2ggws001cnllnumovzo0f', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:33.628'),
('cmhz2gh31001enllna8mh3h7d', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:33.853'),
('cmhz2gh91001gnllnldnxzdot', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:34.069'),
('cmhz2gi9n001snllnk3euscxa', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:35.387'),
('cmhz2giic001unlln22xx19oh', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:35.700'),
('cmhz2gioe001wnllnmal2twhw', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:35.918'),
('cmhz2giuh001ynllnl9mvjgvc', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:36.138'),
('cmhz2gj0k0020nlln4ijbn51b', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:36.357'),
('cmhz2gj6m0022nlln16sk0qh4', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:36.574'),
('cmhz2gjcl0024nllnw755qxwf', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:36.790'),
('cmhz2gjin0026nlln8jl7xpak', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:37.008'),
('cmhz2gjop0028nllnevhw7ow1', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:37.225'),
('cmhz2gjv1002anllnytnl1wyl', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:37.453'),
('cmhz2go9j003qnlln582wouk0', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:43.160'),
('cmhz2gofp003snlln40n78cm0', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:43.382'),
('cmhz2golq003unlln8clghmqt', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:43.598'),
('cmhz2gos3003wnllnomh1y77w', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:43.828'),
('cmhz2goyb003ynlln58mv0d48', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:44.051'),
('cmhz2gp4d0040nllnr96vpsh0', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000cnllnn8uo37gp', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:44.269'),
('cmhz2gpar0042nlln3kim8vvw', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000cnllnn8uo37gp', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:44.500'),
('cmhz2gpgs0044nllnpagcgfez', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000cnllnn8uo37gp', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:44.716'),
('cmhz2gpon0046nllnconzpb45', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000cnllnn8uo37gp', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:44.932'),
('cmhz2gpur0048nlln0ps8ngan', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000cnllnn8uo37gp', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:45.219'),
('cmhz2gq0r004anlln5abif53p', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw8000hnlln57tmpbgd', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:45.435'),
('cmhz2gq7l004cnllntf9z66ck', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw8000hnlln57tmpbgd', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:45.681'),
('cmhz2gqdk004enlln3miu6r6b', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw8000hnlln57tmpbgd', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:45.896'),
('cmhz2gqjp004gnllnd1xrih5x', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw8000hnlln57tmpbgd', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:46.118'),
('cmhz2gqpv004inllnch5r5fzv', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw8000hnlln57tmpbgd', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:46.339'),
('cmhz2gqvx004knllnvpcvu1a7', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:46.557'),
('cmhz2gr1z004mnllnu1zdef56', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:46.775'),
('cmhz2gr8q004onllnnz7jfk25', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:47.018'),
('cmhz2gret004qnllnj7z879rx', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:47.238'),
('cmhz2grkw004snllnjja8t70h', 'cmhz2ge71000knllnnbw43cgf', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:47.457'),
('cmhz2grqz004unllnxl58zd7f', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:47.675'),
('cmhz2grx8004wnlln4ffdebwa', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:47.900'),
('cmhz2gs3h004ynllnod9yefwy', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:48.125'),
('cmhz2gs9j0050nlln8oqkwg3p', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:48.343'),
('cmhz2gsfj0052nlln2vn5zm3z', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0005nlln3z622cgk', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:48.560'),
('cmhz2gtfp005enlln1ayuwwls', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:49.861'),
('cmhz2gtlp005gnllnzao8yuin', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:50.077'),
('cmhz2gtrp005inllnskol7loh', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:50.293'),
('cmhz2gtxs005knllnwnryephc', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:50.512'),
('cmhz2gu3s005mnlln9i14s4jq', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0006nllnefb0q7cf', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:50.728'),
('cmhz2gv3v005ynllnxzc65xt1', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:52.027'),
('cmhz2gv9v0060nllnwmt3305p', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:52.244'),
('cmhz2gvg00062nllnf88jcuaw', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:52.464'),
('cmhz2gvm10064nllnvu6fp7u7', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:52.681'),
('cmhz2gvtp0066nlln1iseir8h', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdpv0009nllnrf5ngx9s', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:52.957'),
('cmhz2gvzo0068nlln0814dix1', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:53.173'),
('cmhz2gw5o006anlln3ce2q3d5', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:53.389'),
('cmhz2gwbp006cnlln2zyewg6j', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:22:53.606'),
('cmhz2gwhs006enlln82jx399l', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:22:53.824'),
('cmhz2gwns006gnllnpptd3u5p', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdvy000anllnmp24zgdg', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:22:54.041'),
('cmhz2h10x007wnllnnxamti0y', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:22:59.697'),
('cmhz2h16x007ynllnmcb1ptli', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:22:59.914'),
('cmhz2h1ei0080nllnncfo5y0l', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:23:00.131'),
('cmhz2h1lv0082nllni8yjnvwb', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:23:00.451'),
('cmhz2h1rw0084nllnve34llwv', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw3000bnllnu9nmv6eh', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:23:00.668'),
('cmhz2h1xw0086nllnppud5n66', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gda30000nllnabvv1oax', '2025-11-14 16:23:00.884'),
('cmhz2h23w0088nlln2y4fj2rm', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg80003nlln4wazaijw', '2025-11-14 16:23:01.100'),
('cmhz2h29y008anllnzg532ahy', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-14 16:23:01.318'),
('cmhz2h2fy008cnllnzelv5phq', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg60002nllnr14htiy8', '2025-11-14 16:23:01.535'),
('cmhz2h2lz008enllnoriufllt', 'cmhz2geg2000lnllna5tnsekq', 'cmhz2gdw6000fnlln72o6zn9j', 'cmhz2gdg80004nllnnd111d0z', '2025-11-14 16:23:01.751'),
('cmhztm7790000drh03cd9q3uz', 'cmhz2ge71000knllnnbw43cgf', 'backup_module_id', 'cmhz2gda30000nllnabvv1oax', '2025-11-15 05:02:50.613'),
('cmhztm7790001drh07imbq6ol', 'cmhz2ge71000knllnnbw43cgf', 'backup_module_id', 'cmhz2gdg50001nllnq6osyp7i', '2025-11-15 05:02:50.613'),
('cmhztm7790002drh0h7wnvg65', 'cmhz2ge71000knllnnbw43cgf', 'backup_module_id', 'cmhz2gdg60002nllnr14htiy8', '2025-11-15 05:02:50.613'),
('cmhztm7790003drh0a97fubmh', 'cmhz2ge71000knllnnbw43cgf', 'backup_module_id', 'cmhz2gdg80003nlln4wazaijw', '2025-11-15 05:02:50.613'),
('cmhztm7790004drh0dox92g2p', 'cmhz2ge71000knllnnbw43cgf', 'backup_module_id', 'cmhz2gdg80004nllnnd111d0z', '2025-11-15 05:02:50.613');

-- --------------------------------------------------------

--
-- Table structure for table `Session`
--

CREATE TABLE `Session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Settings`
--

CREATE TABLE `Settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Settings`
--

INSERT INTO `Settings` (`id`, `key`, `value`, `description`, `createdAt`, `updatedAt`) VALUES
('cmhz2h3lt008lnlln9jlphuwb', 'company_address', '123 Main Street, City, Country', 'Company Address', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3na008mnllnze8gbwcm', 'datetime_format', 'DD/MM/YYYY HH:mm:ss', 'Date and time format (e.g., DD/MM/YYYY HH:mm:ss)', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3na008nnllnmv262prx', 'media_allowed_types', 'images,documents,videos,archives', 'Comma-separated list of allowed media types', '2025-11-14 16:23:03.041', '2025-11-14 16:24:18.603'),
('cmhz2h3nb008onllnh62qlhb4', 'media_max_file_size_mb', '10', 'Maximum file size in MB for media uploads', '2025-11-14 16:23:03.041', '2025-11-14 16:24:18.603'),
('cmhz2h3nb008pnllnugeypi5s', 'pagesize', '20', 'Default page size for lists and tables', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3nb008qnllnirycmzto', 'company_name', 'MADE Laboratory', 'Company Name', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3nb008rnlln9cmywuaf', 'media_pagesize', '12', 'Page size for media gallery', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3nc008snlln0c9uujk6', 'company_email', 'info@madelab.io', 'Company Email Address', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2h3nc008tnllni66dchmh', 'company_phone', '+1-234-567-8900', 'Company Phone Number', '2025-11-14 16:23:03.041', '2025-11-14 16:23:03.041'),
('cmhz2iory0002lo0r0ne6iu46', 'upload_storage_provider', 'r2', 'File upload storage provider (local or R2)', '2025-11-14 16:24:17.135', '2025-11-14 16:24:17.135');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `username` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `activationToken` varchar(191) DEFAULT NULL,
  `activationTokenExpiry` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `resetToken` varchar(191) DEFAULT NULL,
  `resetTokenExpiry` datetime(3) DEFAULT NULL,
  `twoFactorEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `twoFactorSecret` varchar(191) DEFAULT NULL,
  `backupCodes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `updatedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `email`, `username`, `name`, `password`, `image`, `emailVerified`, `activationToken`, `activationTokenExpiry`, `isActive`, `resetToken`, `resetTokenExpiry`, `twoFactorEnabled`, `twoFactorSecret`, `backupCodes`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`) VALUES
('cmhz2h2uh008fnllnxk9vrx3k', 'baonguyenyam@gmail.com', 'admin', 'Admin User', '$2b$10$jyhqmjtll31DT/vdBmceTe.k9o7iX2MfSmFzaCGyp7qI2cNw.OIY2', NULL, '2025-11-14 16:23:02.055', NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 16:23:02.057', '2025-11-15 00:07:49.812', NULL, 'cmhz2h33i008gnlln44m6in1y'),
('cmhz2h33i008gnlln44m6in1y', 'manager@madelab.io', 'manager', 'Manager User', '$2b$10$LqPJA.MZen3upGbkk8HXN.AYrkBrQvJjXagk/.XG3tga7aW/.Pfsa', NULL, '2025-11-14 16:23:02.382', NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 16:23:02.383', '2025-11-14 16:23:02.383', NULL, NULL),
('cmhzajomd000ljh0r4zgp7u8b', 'test@madelab.io', 'testmadelab', '', '$2b$10$ilNf8.gGciDNTlZnsa0JJO6/K44sjaXqHbTTJ4s55dmzUrN7fBwrO', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 20:09:00.517', '2025-11-14 20:09:00.517', 'cmhz2h2uh008fnllnxk9vrx3k', NULL),
('cmhzhvwoh0000ok0q2o2zq0vs', 'tom@madelab.io', 'Tom', 'Tom Davenport', '$2b$10$EqPI1iMcSsptz3Gwb81PEOSaqbH54Su3uJnsQyJ0dgt72w6StVlk2', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 23:34:28.146', '2025-11-14 23:34:28.146', 'cmhz2h33i008gnlln44m6in1y', NULL),
('cmhzhxsku0006ok0q7jj4x6js', 'ryan@madelab.io', 'RyanMoor', 'Ryan Moor', '$2b$10$B3MpRWyrzvNd2IvDveX.gu9s4vCVGClQVSgZekOiCq7XqyVNOAAxq', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 23:35:56.143', '2025-11-16 19:44:46.325', 'cmhz2h33i008gnlln44m6in1y', 'cmhz2h33i008gnlln44m6in1y'),
('cmhzib8nn000cok0qo8glkbia', 'brett@madelab.io', 'BrettBowden', 'Brett Bowden', '$2b$10$5K40MWjpaJuFAv6Bwlu7Ye0ZJMnn9XwUMbgo6aPOVJ9PVtTfbkpTu', NULL, NULL, NULL, NULL, 1, NULL, NULL, 0, NULL, NULL, '2025-11-14 23:46:23.507', '2025-11-15 00:03:50.539', 'cmhz2h33i008gnlln44m6in1y', NULL),
('cmi24l9tn0003ll0r3vgqekak', 'demo@madelab.io', 'demomade', 'Demo ', NULL, NULL, NULL, '4741677f03237f57e11e3f7ade4e4cd74d17c64b02fdcbb9e92df48b01d50f65', '2025-11-17 19:45:35.481', 0, NULL, NULL, 0, NULL, NULL, '2025-11-16 19:45:35.483', '2025-11-16 19:45:35.483', 'cmhz2h33i008gnlln44m6in1y', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `UserGroup`
--

CREATE TABLE `UserGroup` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) DEFAULT NULL,
  `updatedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserGroup`
--

INSERT INTO `UserGroup` (`id`, `name`, `description`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`) VALUES
('cmhz2xnsy0009lo0rz0law09l', 'Print Hustlers 2025', NULL, '2025-11-14 16:35:55.715', '2025-11-14 16:35:55.715', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `UserGroupMember`
--

CREATE TABLE `UserGroupMember` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `groupId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `assignedBy` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserGroupMember`
--

INSERT INTO `UserGroupMember` (`id`, `userId`, `groupId`, `assignedAt`, `assignedBy`) VALUES
('cmi24lb940006ll0r56jfcfqm', 'cmi24l9tn0003ll0r3vgqekak', 'cmhz2xnsy0009lo0rz0law09l', '2025-11-16 19:45:37.336', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `UserProfileModules`
--

CREATE TABLE `UserProfileModules` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `moduleTypeId` varchar(191) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `column` int(11) NOT NULL DEFAULT 1,
  `isVisible` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserProfiles`
--

CREATE TABLE `UserProfiles` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `metaData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 0,
  `slug` varchar(191) DEFAULT NULL,
  `metaTitle` varchar(191) DEFAULT NULL,
  `metaDescription` varchar(191) DEFAULT NULL,
  `viewCount` int(11) NOT NULL DEFAULT 0,
  `lastViewedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserProfiles`
--

INSERT INTO `UserProfiles` (`id`, `userId`, `metaData`, `isPublic`, `slug`, `metaTitle`, `metaDescription`, `viewCount`, `lastViewedAt`, `createdAt`, `updatedAt`) VALUES
('cmhz2h3wh008xnllnfs2jpawc', 'cmhz2h2uh008fnllnxk9vrx3k', '\"{}\"', 0, NULL, NULL, NULL, 0, NULL, '2025-11-14 16:23:03.425', '2025-11-14 16:23:03.425'),
('cmhz2h3wh008znllnvwqk7ail', 'cmhz2h33i008gnlln44m6in1y', '\"{}\"', 0, NULL, NULL, NULL, 0, NULL, '2025-11-14 16:23:03.425', '2025-11-14 16:23:03.425');

-- --------------------------------------------------------

--
-- Table structure for table `UserRole`
--

CREATE TABLE `UserRole` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserRole`
--

INSERT INTO `UserRole` (`id`, `userId`, `roleId`, `createdAt`) VALUES
('cmhz2h3fl008jnlln99db25gw', 'cmhz2h33i008gnlln44m6in1y', 'cmhz2geg2000lnllna5tnsekq', '2025-11-14 16:23:02.817'),
('cmhzajp3o000mjh0r2coyp2lv', 'cmhzajomd000ljh0r4zgp7u8b', 'cmhz2gema000mnllnfke7xno0', '2025-11-14 20:09:01.141'),
('cmhzhvx640001ok0qjxzprfqm', 'cmhzhvwoh0000ok0q2o2zq0vs', 'cmhz2gema000mnllnfke7xno0', '2025-11-14 23:34:28.780'),
('cmhzib93g000dok0qovq61y8a', 'cmhzib8nn000cok0qo8glkbia', 'cmhz2gema000mnllnfke7xno0', '2025-11-14 23:46:24.075'),
('cmhzj2wbe000iok0qt396v22k', 'cmhz2h2uh008fnllnxk9vrx3k', 'cmhz2ge71000knllnnbw43cgf', '2025-11-15 00:07:53.883'),
('cmi24ka8c0002ll0r1yjc9evh', 'cmhzhxsku0006ok0q7jj4x6js', 'cmhz2ge71000knllnnbw43cgf', '2025-11-16 19:44:49.357'),
('cmi24la8u0004ll0rmvm5ilhb', 'cmi24l9tn0003ll0r3vgqekak', 'cmhz2gema000mnllnfke7xno0', '2025-11-16 19:45:35.954');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0d5b4082-5e80-4ade-a332-244440799d1e', '8babe95af3279b8a5035c6d00b35e47e48c425c268115b14e98d79469270576f', '2025-11-14 16:22:24.058', '20251114095811_add_knowledge_email_logs', NULL, NULL, '2025-11-14 16:22:23.825', 1),
('1a7142c6-49b2-419c-b6a6-6377e5c4b3aa', '1b408cd67c51a75d8d067576491d24b78d1e31202d38162edcb33084c49ce3d1', '2025-11-14 16:22:23.715', '20251114095711_app_init', NULL, NULL, '2025-11-14 16:22:22.553', 1),
('589f92d1-c9a6-4fd5-9713-7ef500abc6d9', 'a6e14a0813cbfa0b3ae3d36ca12f3dd958734f65be4e3a1f4acddc84dd5cc81a', '2025-11-16 04:08:13.898', '20251115120100_remove_workflow', NULL, NULL, '2025-11-16 04:08:13.357', 1),
('83fee48f-6113-4228-b2e5-21217278a6c7', '6c30a05336dcd9fb4bfb1cde33b9b18f098898b9171f98a294db7f4a12dacd18', '2025-11-16 04:08:14.140', '20251115215208_drop_stock_alert', NULL, NULL, '2025-11-16 04:08:13.992', 1),
('c966f202-7d83-4523-9d0e-4dca154d8499', '41dc973200930bd3b5fad4bfcddd5c6d8a33d8c0f352276ee39820da4c1b8214', '2025-11-15 03:39:50.643', '20251114205728_add_backup_system', NULL, NULL, '2025-11-15 03:39:50.370', 1),
('f3da1571-3f54-4a1d-b21a-80884a7b7cbd', '1dfb9e864144330f0905847098d4d72083f9653f789276dbea4bce18c078d8ab', '2025-11-15 04:16:51.583', '20251114210000_fix_backup_enum_values', NULL, NULL, '2025-11-15 04:16:51.329', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Account`
--
ALTER TABLE `Account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  ADD KEY `Account_userId_idx` (`userId`);

--
-- Indexes for table `ActivityLog`
--
ALTER TABLE `ActivityLog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ActivityLog_userId_idx` (`userId`),
  ADD KEY `ActivityLog_entity_entityId_idx` (`entity`,`entityId`),
  ADD KEY `ActivityLog_createdAt_idx` (`createdAt`);

--
-- Indexes for table `BackupRecords`
--
ALTER TABLE `BackupRecords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BackupRecords_status_idx` (`status`),
  ADD KEY `BackupRecords_createdAt_idx` (`createdAt`),
  ADD KEY `BackupRecords_backupType_idx` (`backupType`);

--
-- Indexes for table `BackupSettings`
--
ALTER TABLE `BackupSettings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `BackupSettings_key_key` (`key`),
  ADD KEY `BackupSettings_key_idx` (`key`);

--
-- Indexes for table `BackupStats`
--
ALTER TABLE `BackupStats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Customer`
--
ALTER TABLE `Customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Customer_email_key` (`email`),
  ADD KEY `Customer_email_idx` (`email`),
  ADD KEY `Customer_phone_idx` (`phone`),
  ADD KEY `Customer_parentId_idx` (`parentId`),
  ADD KEY `Customer_companyName_idx` (`companyName`),
  ADD KEY `Customer_isActive_idx` (`isActive`),
  ADD KEY `Customer_createdAt_idx` (`createdAt`);

--
-- Indexes for table `FormData`
--
ALTER TABLE `FormData`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FormData_key_idx` (`key`),
  ADD KEY `FormData_createdAt_idx` (`createdAt`);

--
-- Indexes for table `KnowledgeArticles`
--
ALTER TABLE `KnowledgeArticles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeArticles_slug_key` (`slug`),
  ADD KEY `KnowledgeArticles_slug_idx` (`slug`),
  ADD KEY `KnowledgeArticles_isPublished_idx` (`isPublished`),
  ADD KEY `KnowledgeArticles_publishedAt_idx` (`publishedAt`),
  ADD KEY `KnowledgeArticles_type_idx` (`type`),
  ADD KEY `KnowledgeArticles_visibility_idx` (`visibility`),
  ADD KEY `KnowledgeArticles_createdAt_idx` (`createdAt`);

--
-- Indexes for table `KnowledgeAssignedGroups`
--
ALTER TABLE `KnowledgeAssignedGroups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeAssignedGroup_knowledgeId_groupId_key` (`knowledgeId`,`groupId`),
  ADD KEY `KnowledgeAssignedGroup_groupId_fkey` (`groupId`);

--
-- Indexes for table `KnowledgeAssignedUsers`
--
ALTER TABLE `KnowledgeAssignedUsers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeAssignedUsers_knowledgeId_userId_key` (`knowledgeId`,`userId`),
  ADD KEY `KnowledgeAssignedUsers_userId_fkey` (`userId`);

--
-- Indexes for table `KnowledgeCategories`
--
ALTER TABLE `KnowledgeCategories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeCategories_name_key` (`name`),
  ADD UNIQUE KEY `KnowledgeCategories_slug_key` (`slug`),
  ADD KEY `KnowledgeCategories_slug_idx` (`slug`),
  ADD KEY `KnowledgeCategories_order_idx` (`order`);

--
-- Indexes for table `KnowledgeCategoriesOnKnowledge`
--
ALTER TABLE `KnowledgeCategoriesOnKnowledge`
  ADD PRIMARY KEY (`knowledgeId`,`categoryId`),
  ADD KEY `KnowledgeCategoriesOnKnowledge_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `KnowledgeEmailLogs`
--
ALTER TABLE `KnowledgeEmailLogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeEmailLogs_knowledgeId_recipientId_sentAt_key` (`knowledgeId`,`recipientId`,`sentAt`),
  ADD KEY `KnowledgeEmailLogs_knowledgeId_idx` (`knowledgeId`),
  ADD KEY `KnowledgeEmailLogs_recipientId_idx` (`recipientId`),
  ADD KEY `KnowledgeEmailLogs_status_idx` (`status`),
  ADD KEY `KnowledgeEmailLogs_sentAt_idx` (`sentAt`);

--
-- Indexes for table `KnowledgeModuleTypes`
--
ALTER TABLE `KnowledgeModuleTypes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeModuleTypes_key_key` (`key`),
  ADD KEY `KnowledgeModuleTypes_system_idx` (`system`),
  ADD KEY `KnowledgeModuleTypes_key_idx` (`key`);

--
-- Indexes for table `KnowledgeTags`
--
ALTER TABLE `KnowledgeTags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KnowledgeTags_name_key` (`name`),
  ADD UNIQUE KEY `KnowledgeTags_slug_key` (`slug`),
  ADD KEY `KnowledgeTags_slug_idx` (`slug`);

--
-- Indexes for table `KnowledgeTagsOnKnowledge`
--
ALTER TABLE `KnowledgeTagsOnKnowledge`
  ADD PRIMARY KEY (`knowledgeId`,`tagId`),
  ADD KEY `KnowledgeTagsOnKnowledge_tagId_fkey` (`tagId`);

--
-- Indexes for table `Media`
--
ALTER TABLE `Media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Media_uploadedById_idx` (`uploadedById`),
  ADD KEY `Media_visibility_idx` (`visibility`),
  ADD KEY `Media_createdAt_idx` (`createdAt`);

--
-- Indexes for table `Module`
--
ALTER TABLE `Module`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Module_name_key` (`name`),
  ADD KEY `Module_name_idx` (`name`);

--
-- Indexes for table `ModuleInstance`
--
ALTER TABLE `ModuleInstance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ModuleInstance_moduleTypeId_entityId_key` (`moduleTypeId`,`entityId`),
  ADD KEY `ModuleInstance_moduleTypeId_idx` (`moduleTypeId`),
  ADD KEY `ModuleInstance_entityId_idx` (`entityId`),
  ADD KEY `ModuleInstance_entityName_idx` (`entityName`),
  ADD KEY `ModuleInstance_isActive_idx` (`isActive`),
  ADD KEY `ModuleInstance_createdAt_idx` (`createdAt`);

--
-- Indexes for table `ModuleType`
--
ALTER TABLE `ModuleType`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ModuleType_key_key` (`key`),
  ADD KEY `ModuleType_system_idx` (`system`),
  ADD KEY `ModuleType_key_idx` (`key`),
  ADD KEY `ModuleType_isEnabled_idx` (`isEnabled`),
  ADD KEY `ModuleType_createdAt_idx` (`createdAt`);

--
-- Indexes for table `Permission`
--
ALTER TABLE `Permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Permission_action_key` (`action`),
  ADD KEY `Permission_action_idx` (`action`);

--
-- Indexes for table `Role`
--
ALTER TABLE `Role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`),
  ADD KEY `Role_name_idx` (`name`);

--
-- Indexes for table `RolePermission`
--
ALTER TABLE `RolePermission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RolePermission_roleId_moduleId_permissionId_key` (`roleId`,`moduleId`,`permissionId`),
  ADD KEY `RolePermission_roleId_idx` (`roleId`),
  ADD KEY `RolePermission_moduleId_idx` (`moduleId`),
  ADD KEY `RolePermission_permissionId_idx` (`permissionId`);

--
-- Indexes for table `Session`
--
ALTER TABLE `Session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  ADD KEY `Session_userId_idx` (`userId`);

--
-- Indexes for table `Settings`
--
ALTER TABLE `Settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Settings_key_key` (`key`),
  ADD KEY `Settings_key_idx` (`key`),
  ADD KEY `Settings_createdAt_idx` (`createdAt`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_username_key` (`username`),
  ADD UNIQUE KEY `User_activationToken_key` (`activationToken`),
  ADD UNIQUE KEY `User_resetToken_key` (`resetToken`),
  ADD KEY `User_email_idx` (`email`),
  ADD KEY `User_username_idx` (`username`);

--
-- Indexes for table `UserGroup`
--
ALTER TABLE `UserGroup`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserGroup_name_key` (`name`),
  ADD KEY `UserGroup_name_idx` (`name`),
  ADD KEY `UserGroup_createdAt_idx` (`createdAt`);

--
-- Indexes for table `UserGroupMember`
--
ALTER TABLE `UserGroupMember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserGroupMember_userId_groupId_key` (`userId`,`groupId`),
  ADD KEY `UserGroupMember_userId_idx` (`userId`),
  ADD KEY `UserGroupMember_groupId_idx` (`groupId`),
  ADD KEY `UserGroupMember_assignedAt_idx` (`assignedAt`);

--
-- Indexes for table `UserProfileModules`
--
ALTER TABLE `UserProfileModules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UserProfileModules_profileId_idx` (`profileId`),
  ADD KEY `UserProfileModules_order_idx` (`order`),
  ADD KEY `UserProfileModules_column_idx` (`column`);

--
-- Indexes for table `UserProfiles`
--
ALTER TABLE `UserProfiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserProfiles_userId_key` (`userId`),
  ADD UNIQUE KEY `UserProfiles_slug_key` (`slug`),
  ADD KEY `UserProfiles_userId_idx` (`userId`),
  ADD KEY `UserProfiles_slug_idx` (`slug`),
  ADD KEY `UserProfiles_isPublic_idx` (`isPublic`),
  ADD KEY `UserProfiles_createdAt_idx` (`createdAt`);

--
-- Indexes for table `UserRole`
--
ALTER TABLE `UserRole`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserRole_userId_roleId_key` (`userId`,`roleId`),
  ADD KEY `UserRole_userId_idx` (`userId`),
  ADD KEY `UserRole_roleId_idx` (`roleId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Account`
--
ALTER TABLE `Account`
  ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Customer`
--
ALTER TABLE `Customer`
  ADD CONSTRAINT `Customer_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `KnowledgeAssignedGroups`
--
ALTER TABLE `KnowledgeAssignedGroups`
  ADD CONSTRAINT `KnowledgeAssignedGroup_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `UserGroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KnowledgeAssignedGroup_knowledgeId_fkey` FOREIGN KEY (`knowledgeId`) REFERENCES `KnowledgeArticles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `KnowledgeAssignedUsers`
--
ALTER TABLE `KnowledgeAssignedUsers`
  ADD CONSTRAINT `KnowledgeAssignedUsers_knowledgeId_fkey` FOREIGN KEY (`knowledgeId`) REFERENCES `KnowledgeArticles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KnowledgeAssignedUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `KnowledgeCategoriesOnKnowledge`
--
ALTER TABLE `KnowledgeCategoriesOnKnowledge`
  ADD CONSTRAINT `KnowledgeCategoriesOnKnowledge_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `KnowledgeCategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KnowledgeCategoriesOnKnowledge_knowledgeId_fkey` FOREIGN KEY (`knowledgeId`) REFERENCES `KnowledgeArticles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `KnowledgeEmailLogs`
--
ALTER TABLE `KnowledgeEmailLogs`
  ADD CONSTRAINT `KnowledgeEmailLogs_knowledgeId_fkey` FOREIGN KEY (`knowledgeId`) REFERENCES `KnowledgeArticles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KnowledgeEmailLogs_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `KnowledgeTagsOnKnowledge`
--
ALTER TABLE `KnowledgeTagsOnKnowledge`
  ADD CONSTRAINT `KnowledgeTagsOnKnowledge_knowledgeId_fkey` FOREIGN KEY (`knowledgeId`) REFERENCES `KnowledgeArticles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KnowledgeTagsOnKnowledge_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `KnowledgeTags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Media`
--
ALTER TABLE `Media`
  ADD CONSTRAINT `Media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ModuleInstance`
--
ALTER TABLE `ModuleInstance`
  ADD CONSTRAINT `ModuleInstance_moduleTypeId_fkey` FOREIGN KEY (`moduleTypeId`) REFERENCES `ModuleType` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RolePermission`
--
ALTER TABLE `RolePermission`
  ADD CONSTRAINT `RolePermission_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Session`
--
ALTER TABLE `Session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserGroupMember`
--
ALTER TABLE `UserGroupMember`
  ADD CONSTRAINT `UserGroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `UserGroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UserGroupMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserProfileModules`
--
ALTER TABLE `UserProfileModules`
  ADD CONSTRAINT `UserProfileModules_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `UserProfiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserProfiles`
--
ALTER TABLE `UserProfiles`
  ADD CONSTRAINT `UserProfiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserRole`
--
ALTER TABLE `UserRole`
  ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
