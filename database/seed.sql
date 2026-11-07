-- ============================================================
-- BARANGAY DOCUMENT MANAGEMENT SYSTEM (BDMS)
-- Seed Data for MySQL Database (`barangay_db`)
-- ============================================================

USE `barangay_db`;

-- 1. Barangay Info
INSERT INTO `barangay_info` (`id`, `name`, `district`, `city_municipal`, `province`, `country`, `contact_number`, `email`, `office_hours`, `punong_barangay`)
VALUES
('brgy-01', 'Barangay San Isidro', 'District 1', 'Makati City', 'Metro Manila', 'Philippines', '(02) 8870-1400', 'sanisidro.makati@gov.ph', 'Mon - Fri, 8:00 AM - 5:00 PM', 'Hon. Danilo Santos')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Users (Admin and Staff accounts)
INSERT INTO `users` (`id`, `username`, `password`, `role`, `full_name`, `email`, `status`, `created_at`, `last_login`)
VALUES
('usr-001', 'admin', 'password123', 'Admin', 'Hon. Danilo Santos', 'danilo.santos@sanisidro.gov.ph', 'active', '2025-01-01 08:00:00', NOW()),
('usr-002', 'clerk1', 'password123', 'Staff', 'Maria Clara Santos', 'maria.clara@sanisidro.gov.ph', 'active', '2025-01-02 08:30:00', NOW()),
('usr-003', 'officer1', 'password123', 'Staff', 'Antonio Luna Jr.', 'antonio.luna@sanisidro.gov.ph', 'active', '2025-01-05 09:00:00', NULL)
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

-- 3. Officials
INSERT INTO `officials` (`id`, `name`, `position`, `committee`, `contact`, `term_start`, `term_end`, `status`, `order_index`)
VALUES
('off-1', 'Hon. Danilo Santos', 'Punong Barangay (Barangay Captain)', 'Executive Committee & Peace and Order', '0917-111-2222', '2023', '2026', 'active', 1),
('off-2', 'Hon. Roberto Gomez', 'Barangay Kagawad', 'Ways and Means / Finance', '0918-222-3333', '2023', '2026', 'active', 2),
('off-3', 'Hon. Elena Ramos', 'Barangay Kagawad', 'Health and Sanitation / Social Welfare', '0919-333-4444', '2023', '2026', 'active', 3),
('off-4', 'Hon. Juan Miguel Cruz', 'Barangay Kagawad', 'Infrastructure & Public Works', '0920-444-5555', '2023', '2026', 'active', 4),
('off-5', 'Hon. Grace Hernandez', 'Barangay Kagawad', 'Education, Culture & Family Life', '0921-555-6666', '2023', '2026', 'active', 5),
('off-6', 'Hon. Ferdinand Roxas', 'Barangay Kagawad', 'Environmental Protection & Agriculture', '0922-666-7777', '2023', '2026', 'active', 6),
('off-7', 'Hon. Teresa Villanueva', 'Barangay Kagawad', 'Livelihood & Cooperative Development', '0923-777-8888', '2023', '2026', 'active', 7),
('off-8', 'Hon. Carlos Mendoza', 'Barangay Kagawad', 'Human Rights, Law and Rules', '0924-888-9999', '2023', '2026', 'active', 8),
('off-9', 'Hon. Patricia Morales', 'SK Chairperson', 'Youth and Sports Development', '0925-999-0000', '2023', '2026', 'active', 9),
('off-10', 'Atty. Victoriano Lim', 'Barangay Secretary', 'Records & Administration', '0926-111-0000', '2023', '2026', 'active', 10),
('off-11', 'Lourdes Bautista, CPA', 'Barangay Treasurer', 'Treasury & Revenue Collection', '0927-222-1111', '2023', '2026', 'active', 11)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. Residents (personal_infos)
INSERT INTO `personal_infos` (`id`, `record_no`, `first_name`, `middle_name`, `last_name`, `suffix`, `bday`, `sex`, `civil_status`, `place_of_birth`, `citizenship`, `occupation`, `phone`, `email`, `is_official`, `is_pwd`, `pwd_details`, `is_senior`, `is_4ps`, `is_voter`, `blood_type`, `created_at`)
VALUES
('res-001', 'REC-2025-0001', 'Juan', 'Mercado', 'Dela Cruz', NULL, '1988-06-12', 'Male', 'Married', 'Makati City', 'Filipino', 'Graphic Designer', '0917-888-1234', 'juan.delacruz@example.com', 0, 0, NULL, 0, 0, 1, 'O+', '2025-01-10 10:00:00'),
('res-002', 'REC-2025-0002', 'Maria', 'Santos', 'Reyes', NULL, '1962-09-24', 'Female', 'Widowed', 'Batangas City', 'Filipino', 'Retired Public Teacher', '0918-999-5678', 'maria.reyes@example.com', 0, 0, NULL, 1, 0, 1, 'A+', '2025-01-12 11:30:00'),
('res-003', 'REC-2025-0003', 'Christian', 'Dizon', 'Alvarez', 'Jr.', '1996-03-15', 'Male', 'Single', 'Pasay City', 'Filipino', 'IT Support Specialist', '0922-333-8899', 'christian.alvarez@example.com', 0, 0, NULL, 0, 0, 1, 'B+', '2025-01-15 14:15:00'),
('res-004', 'REC-2025-0004', 'Rosalinda', 'Gutierrez', 'Bautista', NULL, '1979-11-04', 'Female', 'Married', 'Manila', 'Filipino', 'Small Sari-sari Store Owner', '0927-444-1122', 'rosalinda.bautista@example.com', 0, 0, NULL, 0, 1, 1, 'O+', '2025-01-20 09:45:00'),
('res-005', 'REC-2025-0005', 'Emilio', 'Aquino', 'Vergara', NULL, '1954-01-28', 'Male', 'Married', 'Cavite', 'Filipino', 'Retired Carpenter', '0915-555-7788', NULL, 0, 1, 'Visually Impaired', 1, 0, 1, 'AB+', '2025-01-22 13:00:00')
ON DUPLICATE KEY UPDATE `record_no`=VALUES(`record_no`);

-- 5. Addresses
INSERT INTO `addresses` (`id`, `person_id`, `bldg_no`, `purok`, `barangay`, `city_municipal`, `province`, `country`, `status`)
VALUES
('addr-001', 'res-001', '#142 Sampaguita St.', 'Purok 1 - Sampaguita', 'Barangay San Isidro', 'Makati City', 'Metro Manila', 'Philippines', 'Permanent'),
('addr-002', 'res-002', '#58 Ilang-Ilang Blvd.', 'Purok 2 - Ilang-Ilang', 'Barangay San Isidro', 'Makati City', 'Metro Manila', 'Philippines', 'Permanent'),
('addr-003', 'res-003', 'Unit 302 Camia Residences', 'Purok 3 - Camia', 'Barangay San Isidro', 'Makati City', 'Metro Manila', 'Philippines', 'Permanent'),
('addr-004', 'res-004', 'Blk 4 Lot 9 Bougainvillea Lane', 'Purok 4 - Bougainvillea', 'Barangay San Isidro', 'Makati City', 'Metro Manila', 'Philippines', 'Permanent'),
('addr-005', 'res-005', '#12 Jasmin Compound', 'Purok 5 - Jasmin', 'Barangay San Isidro', 'Makati City', 'Metro Manila', 'Philippines', 'Permanent')
ON DUPLICATE KEY UPDATE `person_id`=VALUES(`person_id`);

-- 6. Transactions
INSERT INTO `transactions` (`id`, `transaction_code`, `document_type`, `person_id`, `status`, `validity`, `date_schedule`, `signed_by`, `purpose`, `fee`, `cedula_no`, `cedula_date`, `cedula_place`, `business_name`, `business_nature`, `monthly_income`, `remarks`, `rejection_reason`, `issue_date`, `created_at`, `updated_at`)
VALUES
('txn-001', 'TXN-2025-0101', 'Barangay Clearance', 'res-001', 'Released', '6 Months', '2025-01-10', 'Hon. Danilo Santos', 'Local Employment Application', 50.00, 'CCI-2025-108291', '2025-01-05', 'Makati City', NULL, NULL, NULL, 'Standard employment clearance issued', NULL, '2025-01-10', '2025-01-10 10:15:00', '2025-01-10 10:30:00'),
('txn-002', 'TXN-2025-0102', 'Certificate of Indigency', 'res-002', 'Released', '6 Months', '2025-01-12', 'Hon. Danilo Santos', 'Medical & Hospitalization Financial Assistance', 0.00, NULL, NULL, NULL, NULL, NULL, 5000.00, 'Fee waived under Republic Act No. 11261 / Senior Indigent protection', NULL, '2025-01-12', '2025-01-12 11:45:00', '2025-01-12 12:00:00'),
('txn-003', 'TXN-2025-0103', 'Certificate of Residency', 'res-003', 'Approved', '6 Months', '2025-01-16', 'Hon. Danilo Santos', 'Bank Account Opening (ATM Salary Card)', 50.00, 'CCI-2025-392019', '2025-01-14', 'Makati City', NULL, NULL, NULL, 'Approved, ready for clerk release', NULL, NULL, '2025-01-15 14:30:00', '2025-01-15 15:00:00'),
('txn-004', 'TXN-2025-0104', 'Barangay Business Clearance', 'res-004', 'Pending', '1 Year', '2025-01-21', 'Hon. Danilo Santos', 'Barangay Micro Business Enterprise Permit Renewal', 200.00, 'CCI-2025-882710', '2025-01-18', 'Makati City', 'Rosalinda Variety & Sari-sari Store', 'Retail of Food and Groceries', 18000.00, 'Under zoning and fire safety verification', NULL, NULL, '2025-01-20 10:00:00', '2025-01-20 10:00:00')
ON DUPLICATE KEY UPDATE `transaction_code`=VALUES(`transaction_code`);

-- 7. Payments
INSERT INTO `payments` (`id`, `payment_code`, `transaction_code`, `person_id`, `amount`, `payment_method`, `or_number`, `status`, `payment_date`, `collected_by`)
VALUES
('pay-001', 'PAY-2025-0001', 'TXN-2025-0101', 'res-001', 50.00, 'Cash', 'OR-2025-5101', 'Paid', '2025-01-10 10:20:00', 'Maria Clara Santos (Staff)'),
('pay-002', 'PAY-2025-0002', 'TXN-2025-0102', 'res-002', 0.00, 'Waived (Indigent)', 'OR-EXEMPT-0102', 'Waived', '2025-01-12 11:50:00', 'Maria Clara Santos (Staff)'),
('pay-003', 'PAY-2025-0003', 'TXN-2025-0103', 'res-003', 50.00, 'Cash', 'OR-2025-5103', 'Paid', '2025-01-15 14:40:00', 'Hon. Danilo Santos (Admin)'),
('pay-004', 'PAY-2025-0004', 'TXN-2025-0104', 'res-004', 200.00, 'Cash', 'OR-2025-5104', 'Pending', '2025-01-20 10:05:00', 'Maria Clara Santos (Staff)')
ON DUPLICATE KEY UPDATE `payment_code`=VALUES(`payment_code`);
