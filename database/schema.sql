-- ============================================================
-- BARANGAY DOCUMENT MANAGEMENT SYSTEM (BDMS)
-- Database: `barangay_db`
-- Standard MySQL Schema Definition matching System ERD
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and XAMPP phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `barangay_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `barangay_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Table: barangay_info
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `barangay_info`;
CREATE TABLE `barangay_info` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `district` varchar(100) DEFAULT '',
  `city_municipal` varchar(150) NOT NULL,
  `province` varchar(150) NOT NULL,
  `country` varchar(100) DEFAULT 'Philippines',
  `contact_number` varchar(50) DEFAULT '',
  `email` varchar(150) DEFAULT '',
  `office_hours` varchar(150) DEFAULT '',
  `punong_barangay` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: users (System Staff & Administrators)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Staff','Resident') NOT NULL DEFAULT 'Staff',
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: personal_infos (Residents & Officials)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `personal_infos`;
CREATE TABLE `personal_infos` (
  `id` varchar(50) NOT NULL,
  `record_no` varchar(50) NOT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT '',
  `last_name` varchar(100) NOT NULL,
  `suffix` varchar(20) DEFAULT NULL,
  `bday` date NOT NULL,
  `sex` enum('Male','Female') NOT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated') NOT NULL,
  `place_of_birth` varchar(150) NOT NULL,
  `citizenship` varchar(100) NOT NULL DEFAULT 'Filipino',
  `occupation` varchar(150) DEFAULT '',
  `phone` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `is_official` tinyint(1) NOT NULL DEFAULT 0,
  `is_pwd` tinyint(1) NOT NULL DEFAULT 0,
  `pwd_details` text DEFAULT NULL,
  `is_senior` tinyint(1) NOT NULL DEFAULT 0,
  `is_4ps` tinyint(1) NOT NULL DEFAULT 0,
  `is_voter` tinyint(1) NOT NULL DEFAULT 1,
  `blood_type` varchar(10) DEFAULT 'O+',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: addresses
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` varchar(50) NOT NULL,
  `person_id` varchar(50) NOT NULL,
  `bldg_no` varchar(150) NOT NULL,
  `purok` varchar(100) NOT NULL,
  `barangay` varchar(150) NOT NULL,
  `city_municipal` varchar(150) NOT NULL,
  `province` varchar(150) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Philippines',
  `status` enum('Permanent','Transient','Current') NOT NULL DEFAULT 'Permanent',
  PRIMARY KEY (`id`),
  KEY `idx_addresses_person_id` (`person_id`),
  CONSTRAINT `fk_addresses_person` FOREIGN KEY (`person_id`) REFERENCES `personal_infos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: profile_pics (Resident & Official 2x2 ID Photos)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `profile_pics`;
CREATE TABLE `profile_pics` (
  `id` varchar(50) NOT NULL,
  `person_id` varchar(50) NOT NULL,
  `file_name` varchar(255) DEFAULT '',
  `file_type` varchar(50) DEFAULT 'image/jpeg',
  `file_data` LONGTEXT NOT NULL,
  `file_size` int(11) DEFAULT 0,
  `uploaded_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_profile_pics_person_id` (`person_id`),
  CONSTRAINT `fk_profile_pics_person` FOREIGN KEY (`person_id`) REFERENCES `personal_infos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: transactions (Document Clearances & Certifications)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` varchar(50) NOT NULL,
  `transaction_code` varchar(50) NOT NULL UNIQUE,
  `document_type` varchar(100) NOT NULL,
  `person_id` varchar(50) NOT NULL,
  `status` enum('Pending','Processing','Approved','Released','Rejected') NOT NULL DEFAULT 'Pending',
  `validity` varchar(50) DEFAULT '6 Months',
  `date_schedule` date NOT NULL,
  `signed_by` varchar(150) NOT NULL,
  `purpose` text NOT NULL,
  `fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cedula_no` varchar(50) DEFAULT NULL,
  `cedula_date` date DEFAULT NULL,
  `cedula_place` varchar(150) DEFAULT NULL,
  `business_name` varchar(150) DEFAULT NULL,
  `business_nature` varchar(150) DEFAULT NULL,
  `monthly_income` decimal(10,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_person_id` (`person_id`),
  CONSTRAINT `fk_transactions_person` FOREIGN KEY (`person_id`) REFERENCES `personal_infos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: payments (Official Receipts & Barangay Treasury)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `payment_code` varchar(50) NOT NULL UNIQUE,
  `transaction_code` varchar(50) NOT NULL,
  `person_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(50) NOT NULL DEFAULT 'Cash',
  `or_number` varchar(50) NOT NULL,
  `status` enum('Paid','Pending','Waived') NOT NULL DEFAULT 'Pending',
  `payment_date` datetime NOT NULL,
  `collected_by` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payments_person_id` (`person_id`),
  CONSTRAINT `fk_payments_person` FOREIGN KEY (`person_id`) REFERENCES `personal_infos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: officials (Sangguniang Barangay Council)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `officials`;
CREATE TABLE `officials` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `position` varchar(100) NOT NULL,
  `committee` varchar(150) DEFAULT '',
  `contact` varchar(50) DEFAULT '',
  `term_start` varchar(20) DEFAULT '',
  `term_end` varchar(20) DEFAULT '',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `order_index` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
