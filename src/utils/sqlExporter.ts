import {
  BarangayInfo,
  User,
  ResidentPersonalInfo,
  Transaction,
  Payment,
  Official,
} from '../types';

/**
 * Escapes single quotes for SQL string literals
 */
function escapeSql(str: string | undefined | null): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

/**
 * Generates an all-in-one MySQL database export (.sql)
 * Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, XAMPP, phpMyAdmin, and MySQL Workbench
 */
export function generateMySqlDump(data: {
  barangayInfo: BarangayInfo;
  users: User[];
  residents: ResidentPersonalInfo[];
  transactions: Transaction[];
  payments: Payment[];
  officials: Official[];
}): string {
  const timestamp = new Date().toISOString();

  let sql = `-- ============================================================
-- BARANGAY DOCUMENT MANAGEMENT SYSTEM (BDMS)
-- Complete MySQL Database Dump & Schema
-- Generated: ${timestamp}
-- Compatible with XAMPP, phpMyAdmin, MySQL 5.7 / 8.0, MariaDB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00";

CREATE DATABASE IF NOT EXISTS \`barangay_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`barangay_db\`;

-- ------------------------------------------------------------
-- Table structure for: barangay_info
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`barangay_info\`;
CREATE TABLE \`barangay_info\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`district\` varchar(100) DEFAULT '',
  \`city_municipal\` varchar(150) NOT NULL,
  \`province\` varchar(150) NOT NULL,
  \`country\` varchar(100) DEFAULT 'Philippines',
  \`contact_number\` varchar(50) DEFAULT '',
  \`email\` varchar(150) DEFAULT '',
  \`office_hours\` varchar(150) DEFAULT '',
  \`punong_barangay\` varchar(150) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` varchar(50) NOT NULL,
  \`username\` varchar(100) NOT NULL UNIQUE,
  \`password\` varchar(255) NOT NULL,
  \`role\` enum('Admin','Staff','Resident') NOT NULL DEFAULT 'Staff',
  \`full_name\` varchar(150) NOT NULL,
  \`email\` varchar(150) NOT NULL,
  \`status\` enum('active','inactive') NOT NULL DEFAULT 'active',
  \`created_at\` datetime NOT NULL,
  \`last_login\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: personal_infos (Residents)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`personal_infos\`;
CREATE TABLE \`personal_infos\` (
  \`id\` varchar(50) NOT NULL,
  \`record_no\` varchar(50) NOT NULL UNIQUE,
  \`first_name\` varchar(100) NOT NULL,
  \`middle_name\` varchar(100) DEFAULT '',
  \`last_name\` varchar(100) NOT NULL,
  \`suffix\` varchar(20) DEFAULT NULL,
  \`bday\` date NOT NULL,
  \`sex\` enum('Male','Female') NOT NULL,
  \`civil_status\` enum('Single','Married','Widowed','Separated') NOT NULL,
  \`place_of_birth\` varchar(150) NOT NULL,
  \`citizenship\` varchar(100) NOT NULL DEFAULT 'Filipino',
  \`occupation\` varchar(150) DEFAULT '',
  \`phone\` varchar(50) NOT NULL,
  \`email\` varchar(150) DEFAULT NULL,
  \`is_official\` tinyint(1) NOT NULL DEFAULT 0,
  \`is_pwd\` tinyint(1) NOT NULL DEFAULT 0,
  \`pwd_details\` text DEFAULT NULL,
  \`is_senior\` tinyint(1) NOT NULL DEFAULT 0,
  \`is_4ps\` tinyint(1) NOT NULL DEFAULT 0,
  \`is_voter\` tinyint(1) NOT NULL DEFAULT 1,
  \`blood_type\` varchar(10) DEFAULT 'O+',
  \`created_at\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: addresses
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`addresses\`;
CREATE TABLE \`addresses\` (
  \`id\` varchar(50) NOT NULL,
  \`person_id\` varchar(50) NOT NULL,
  \`bldg_no\` varchar(150) NOT NULL,
  \`purok\` varchar(100) NOT NULL,
  \`barangay\` varchar(150) NOT NULL,
  \`city_municipal\` varchar(150) NOT NULL,
  \`province\` varchar(150) NOT NULL,
  \`country\` varchar(100) NOT NULL DEFAULT 'Philippines',
  \`status\` enum('Permanent','Transient','Current') NOT NULL DEFAULT 'Permanent',
  PRIMARY KEY (\`id\`),
  KEY \`idx_addr_person\` (\`person_id\`),
  CONSTRAINT \`fk_addr_person\` FOREIGN KEY (\`person_id\`) REFERENCES \`personal_infos\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: profile_pics
-- Stores 2x2 ID photos as optimized base64 Data URLs or blobs
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`profile_pics\`;
CREATE TABLE \`profile_pics\` (
  \`id\` varchar(50) NOT NULL,
  \`person_id\` varchar(50) NOT NULL,
  \`file_name\` varchar(255) DEFAULT '',
  \`file_type\` varchar(50) DEFAULT 'image/jpeg',
  \`file_data\` LONGTEXT NOT NULL,
  \`file_size\` int(11) DEFAULT 0,
  \`uploaded_at\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_pic_person\` (\`person_id\`),
  CONSTRAINT \`fk_pic_person\` FOREIGN KEY (\`person_id\`) REFERENCES \`personal_infos\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: transactions
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`transactions\`;
CREATE TABLE \`transactions\` (
  \`id\` varchar(50) NOT NULL,
  \`transaction_code\` varchar(50) NOT NULL UNIQUE,
  \`document_type\` varchar(100) NOT NULL,
  \`person_id\` varchar(50) NOT NULL,
  \`status\` enum('Pending','Processing','Approved','Released','Rejected') NOT NULL DEFAULT 'Pending',
  \`validity\` varchar(50) DEFAULT '6 Months',
  \`date_schedule\` date NOT NULL,
  \`signed_by\` varchar(150) NOT NULL,
  \`purpose\` text NOT NULL,
  \`fee\` decimal(10,2) NOT NULL DEFAULT 0.00,
  \`cedula_no\` varchar(50) DEFAULT NULL,
  \`cedula_date\` date DEFAULT NULL,
  \`cedula_place\` varchar(150) DEFAULT NULL,
  \`business_name\` varchar(150) DEFAULT NULL,
  \`business_nature\` varchar(150) DEFAULT NULL,
  \`monthly_income\` decimal(10,2) DEFAULT NULL,
  \`remarks\` text DEFAULT NULL,
  \`rejection_reason\` text DEFAULT NULL,
  \`issue_date\` date DEFAULT NULL,
  \`created_at\` datetime NOT NULL,
  \`updated_at\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_txn_person\` (\`person_id\`),
  CONSTRAINT \`fk_txn_person\` FOREIGN KEY (\`person_id\`) REFERENCES \`personal_infos\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: payments
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`payments\`;
CREATE TABLE \`payments\` (
  \`id\` varchar(50) NOT NULL,
  \`payment_code\` varchar(50) NOT NULL UNIQUE,
  \`transaction_code\` varchar(50) NOT NULL,
  \`person_id\` varchar(50) NOT NULL,
  \`amount\` decimal(10,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` varchar(50) NOT NULL DEFAULT 'Cash',
  \`or_number\` varchar(50) NOT NULL,
  \`status\` enum('Paid','Pending','Waived') NOT NULL DEFAULT 'Pending',
  \`payment_date\` datetime NOT NULL,
  \`collected_by\` varchar(150) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_pay_person\` (\`person_id\`),
  CONSTRAINT \`fk_pay_person\` FOREIGN KEY (\`person_id\`) REFERENCES \`personal_infos\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for: officials
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`officials\`;
CREATE TABLE \`officials\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`position\` varchar(100) NOT NULL,
  \`committee\` varchar(150) DEFAULT '',
  \`contact\` varchar(50) DEFAULT '',
  \`term_start\` varchar(20) DEFAULT '',
  \`term_end\` varchar(20) DEFAULT '',
  \`status\` enum('active','inactive') NOT NULL DEFAULT 'active',
  \`order_index\` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- DATA INSERTIONS
-- ------------------------------------------------------------

-- Barangay Information
INSERT INTO \`barangay_info\` (\`id\`, \`name\`, \`district\`, \`city_municipal\`, \`province\`, \`country\`, \`contact_number\`, \`email\`, \`office_hours\`, \`punong_barangay\`)
VALUES ('brgy-01', ${escapeSql(data.barangayInfo.name)}, ${escapeSql(data.barangayInfo.district)}, ${escapeSql(data.barangayInfo.cityMunicipal)}, ${escapeSql(data.barangayInfo.province)}, 'Philippines', ${escapeSql(data.barangayInfo.contactNumber)}, ${escapeSql(data.barangayInfo.email)}, ${escapeSql(data.barangayInfo.officeHours)}, ${escapeSql(data.barangayInfo.punongBarangay)});

-- Users
`;

  // Users insert
  if (data.users.length > 0) {
    sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`role\`, \`full_name\`, \`email\`, \`status\`, \`created_at\`, \`last_login\`) VALUES\n`;
    const userRows = data.users.map((u) => {
      return `(${escapeSql(u.id)}, ${escapeSql(u.username)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.fullName)}, ${escapeSql(u.email)}, ${escapeSql(u.status)}, ${escapeSql(u.createdAt.replace('T', ' ').substring(0, 19))}, ${u.lastLogin ? escapeSql(u.lastLogin.replace('T', ' ').substring(0, 19)) : 'NULL'})`;
    });
    sql += userRows.join(',\n') + ';\n\n';
  }

  // Residents & Addresses & Profile Pics
  if (data.residents.length > 0) {
    sql += `-- Personal Infos (Residents)\n`;
    sql += `INSERT INTO \`personal_infos\` (\`id\`, \`record_no\`, \`first_name\`, \`middle_name\`, \`last_name\`, \`suffix\`, \`bday\`, \`sex\`, \`civil_status\`, \`place_of_birth\`, \`citizenship\`, \`occupation\`, \`phone\`, \`email\`, \`is_official\`, \`is_pwd\`, \`pwd_details\`, \`is_senior\`, \`is_4ps\`, \`is_voter\`, \`blood_type\`, \`created_at\`) VALUES\n`;
    const resRows = data.residents.map((r) => {
      return `(${escapeSql(r.id)}, ${escapeSql(r.recordNo)}, ${escapeSql(r.firstName)}, ${escapeSql(r.middleName)}, ${escapeSql(r.lastName)}, ${escapeSql(r.suffix)}, ${escapeSql(r.bday)}, ${escapeSql(r.sex)}, ${escapeSql(r.civilStatus)}, ${escapeSql(r.placeOfBirth)}, ${escapeSql(r.citizenship)}, ${escapeSql(r.occupation)}, ${escapeSql(r.phone)}, ${escapeSql(r.email)}, ${r.isOfficial ? 1 : 0}, ${r.isPwd ? 1 : 0}, ${escapeSql(r.pwdDetails)}, ${r.isSenior ? 1 : 0}, ${r.is4Ps ? 1 : 0}, ${r.isVoter ? 1 : 0}, ${escapeSql(r.bloodType || 'O+')}, ${escapeSql(r.createdAt.replace('T', ' ').substring(0, 19))})`;
    });
    sql += resRows.join(',\n') + ';\n\n';

    sql += `-- Addresses\n`;
    sql += `INSERT INTO \`addresses\` (\`id\`, \`person_id\`, \`bldg_no\`, \`purok\`, \`barangay\`, \`city_municipal\`, \`province\`, \`country\`, \`status\`) VALUES\n`;
    const addrRows = data.residents.map((r) => {
      const a = r.address;
      return `(${escapeSql(a.id || `addr-${r.id}`)}, ${escapeSql(r.id)}, ${escapeSql(a.bldgNo)}, ${escapeSql(a.purok)}, ${escapeSql(a.barangay)}, ${escapeSql(a.cityMunicipal)}, ${escapeSql(a.province)}, ${escapeSql(a.country || 'Philippines')}, ${escapeSql(a.status || 'Permanent')})`;
    });
    sql += addrRows.join(',\n') + ';\n\n';

    // Profile pics
    const residentsWithPics = data.residents.filter((r) => r.avatarUrl && r.avatarUrl.trim().length > 0);
    if (residentsWithPics.length > 0) {
      sql += `-- Resident Profile Pictures (profile_pics)\n`;
      sql += `INSERT INTO \`profile_pics\` (\`id\`, \`person_id\`, \`file_name\`, \`file_type\`, \`file_data\`, \`file_size\`, \`uploaded_at\`) VALUES\n`;
      const picRows = residentsWithPics.map((r, i) => {
        const picId = `pic-${r.id}-${i + 1}`;
        const picData = r.avatarUrl!;
        return `(${escapeSql(picId)}, ${escapeSql(r.id)}, ${escapeSql(`${r.recordNo}_photo.jpg`)}, 'image/jpeg', ${escapeSql(picData)}, ${picData.length}, NOW())`;
      });
      sql += picRows.join(',\n') + ';\n\n';
    }
  }

  // Transactions
  if (data.transactions.length > 0) {
    sql += `-- Transactions\n`;
    sql += `INSERT INTO \`transactions\` (\`id\`, \`transaction_code\`, \`document_type\`, \`person_id\`, \`status\`, \`validity\`, \`date_schedule\`, \`signed_by\`, \`purpose\`, \`fee\`, \`cedula_no\`, \`cedula_date\`, \`cedula_place\`, \`business_name\`, \`business_nature\`, \`monthly_income\`, \`remarks\`, \`rejection_reason\`, \`issue_date\`, \`created_at\`, \`updated_at\`) VALUES\n`;
    const txnRows = data.transactions.map((t) => {
      return `(${escapeSql(t.id)}, ${escapeSql(t.transactionCode)}, ${escapeSql(t.documentType)}, ${escapeSql(t.personId)}, ${escapeSql(t.status)}, ${escapeSql(t.validity)}, ${escapeSql(t.dateSchedule)}, ${escapeSql(t.signedBy)}, ${escapeSql(t.purpose)}, ${t.fee}, ${escapeSql(t.cedulaNo)}, ${escapeSql(t.cedulaDate)}, ${escapeSql(t.cedulaPlace)}, ${escapeSql(t.businessName)}, ${escapeSql(t.businessNature)}, ${t.monthlyIncome || 'NULL'}, ${escapeSql(t.remarks)}, ${escapeSql(t.rejectionReason)}, ${escapeSql(t.issueDate)}, ${escapeSql(t.createdAt.replace('T', ' ').substring(0, 19))}, ${escapeSql(t.updatedAt.replace('T', ' ').substring(0, 19))})`;
    });
    sql += txnRows.join(',\n') + ';\n\n';
  }

  // Payments
  if (data.payments.length > 0) {
    sql += `-- Payments\n`;
    sql += `INSERT INTO \`payments\` (\`id\`, \`payment_code\`, \`transaction_code\`, \`person_id\`, \`amount\`, \`payment_method\`, \`or_number\`, \`status\`, \`payment_date\`, \`collected_by\`) VALUES\n`;
    const payRows = data.payments.map((p) => {
      return `(${escapeSql(p.id)}, ${escapeSql(p.paymentCode)}, ${escapeSql(p.transactionCode)}, ${escapeSql(p.personId)}, ${p.amount}, ${escapeSql(p.paymentMethod)}, ${escapeSql(p.orNumber)}, ${escapeSql(p.status)}, ${escapeSql(p.paymentDate.replace('T', ' ').substring(0, 19))}, ${escapeSql(p.collectedBy)})`;
    });
    sql += payRows.join(',\n') + ';\n\n';
  }

  // Officials
  if (data.officials.length > 0) {
    sql += `-- Officials\n`;
    sql += `INSERT INTO \`officials\` (\`id\`, \`name\`, \`position\`, \`committee\`, \`contact\`, \`term_start\`, \`term_end\`, \`status\`, \`order_index\`) VALUES\n`;
    const offRows = data.officials.map((o, idx) => {
      const person = data.residents.find((r) => r.id === o.personId);
      const officialName = person ? `${person.firstName} ${person.lastName}` : o.position;
      const officialContact = person?.phone || '';
      return `(${escapeSql(o.id)}, ${escapeSql(officialName)}, ${escapeSql(o.position)}, ${escapeSql(o.committee)}, ${escapeSql(officialContact)}, ${escapeSql(o.termStart)}, ${escapeSql(o.termEnd)}, ${escapeSql(o.status)}, ${o.order || idx + 1})`;
    });
    sql += offRows.join(',\n') + ';\n\n';
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
-- ============================================================
-- End of BDMS MySQL Dump
-- ============================================================
`;

  return sql;
}

/**
 * Initiates browser download of the generated SQL dump file
 */
export function downloadMySqlDump(data: Parameters<typeof generateMySqlDump>[0]) {
  const sqlContent = generateMySqlDump(data);
  const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `barangay_db_mysql_${new Date().toISOString().split('T')[0]}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
