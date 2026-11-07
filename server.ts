import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MySQL Connection Configuration
// Defaults match XAMPP / WampServer / local standard installations:
// Host: localhost:3306, User: root, Password: '', Database: barangay_db
const mysqlConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'barangay_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;
let isMySqlAvailable = false;
let lastMySqlError = '';

// Initialize MySQL pool asynchronously without crashing if MySQL is not running
async function initMySqlConnection() {
  try {
    const testPool = mysql.createPool(mysqlConfig);
    const conn = await testPool.getConnection();
    await conn.ping();
    conn.release();
    pool = testPool;
    isMySqlAvailable = true;
    lastMySqlError = '';
    console.log(`[BDMS MySQL] Successfully connected to MySQL database "${mysqlConfig.database}" at ${mysqlConfig.host}:${mysqlConfig.port}`);
  } catch (err: any) {
    isMySqlAvailable = false;
    lastMySqlError = err?.message || 'Connection refused';
    console.log(`[BDMS MySQL] Notice: Local MySQL service not detected (${lastMySqlError}).`);
    console.log(`[BDMS MySQL] The system is operating seamlessly with client-side & offline storage.`);
    console.log(`[BDMS MySQL] To use MySQL on your PC: Start Apache & MySQL in XAMPP and import database/schema.sql.`);
  }
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: isMySqlAvailable ? 'full-stack-mysql' : 'browser-storage',
    mysql: {
      connected: isMySqlAvailable,
      host: mysqlConfig.host,
      database: mysqlConfig.database,
      user: mysqlConfig.user,
      error: lastMySqlError || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// Check or test MySQL connection from UI
app.get('/api/mysql/status', async (req: Request, res: Response) => {
  await initMySqlConnection();
  res.json({
    connected: isMySqlAvailable,
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    error: lastMySqlError || null,
  });
});

// Sync data from browser into MySQL database
app.post('/api/mysql/sync', async (req: Request, res: Response) => {
  if (!isMySqlAvailable || !pool) {
    return res.status(503).json({
      success: false,
      message: 'MySQL is not currently connected. Please ensure MySQL is running on your PC (e.g., via XAMPP).',
    });
  }

  const { residents, transactions, payments, users, officials, barangayInfo } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Update barangay_info
    if (barangayInfo) {
      await connection.query(
        `INSERT INTO barangay_info (id, name, district, city_municipal, province, country, contact_number, email, office_hours, punong_barangay)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), district=VALUES(district), city_municipal=VALUES(city_municipal), province=VALUES(province), contact_number=VALUES(contact_number), email=VALUES(email), office_hours=VALUES(office_hours), punong_barangay=VALUES(punong_barangay)`,
        [
          'brgy-01',
          barangayInfo.name,
          barangayInfo.district || '',
          barangayInfo.cityMunicipal,
          barangayInfo.province,
          barangayInfo.country || 'Philippines',
          barangayInfo.contactNumber || '',
          barangayInfo.email || '',
          barangayInfo.officeHours || '',
          barangayInfo.punongBarangay,
        ]
      );
    }

    // 2. Sync Residents & Addresses & Profile Pics
    if (Array.isArray(residents)) {
      for (const r of residents) {
        await connection.query(
          `INSERT INTO personal_infos (id, record_no, first_name, middle_name, last_name, suffix, bday, sex, civil_status, place_of_birth, citizenship, occupation, phone, email, is_official, is_pwd, pwd_details, is_senior, is_4ps, is_voter, blood_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), middle_name=VALUES(middle_name), last_name=VALUES(last_name), suffix=VALUES(suffix), bday=VALUES(bday), sex=VALUES(sex), civil_status=VALUES(civil_status), occupation=VALUES(occupation), phone=VALUES(phone), email=VALUES(email), is_pwd=VALUES(is_pwd), pwd_details=VALUES(pwd_details), is_senior=VALUES(is_senior), is_4ps=VALUES(is_4ps), is_voter=VALUES(is_voter), blood_type=VALUES(blood_type)`,
          [
            r.id,
            r.recordNo,
            r.firstName,
            r.middleName || '',
            r.lastName,
            r.suffix || null,
            r.bday,
            r.sex,
            r.civilStatus,
            r.placeOfBirth,
            r.citizenship || 'Filipino',
            r.occupation || '',
            r.phone,
            r.email || null,
            r.isOfficial ? 1 : 0,
            r.isPwd ? 1 : 0,
            r.pwdDetails || null,
            r.isSenior ? 1 : 0,
            r.is4Ps ? 1 : 0,
            r.isVoter ? 1 : 0,
            r.bloodType || 'O+',
            r.createdAt ? r.createdAt.replace('T', ' ').substring(0, 19) : new Date(),
          ]
        );

        if (r.address) {
          await connection.query(
            `INSERT INTO addresses (id, person_id, bldg_no, purok, barangay, city_municipal, province, country, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE bldg_no=VALUES(bldg_no), purok=VALUES(purok), status=VALUES(status)`,
            [
              r.address.id || `addr-${r.id}`,
              r.id,
              r.address.bldgNo,
              r.address.purok,
              r.address.barangay,
              r.address.cityMunicipal,
              r.address.province,
              r.address.country || 'Philippines',
              r.address.status || 'Permanent',
            ]
          );
        }

        // Store profile pic if provided
        if (r.avatarUrl) {
          await connection.query(
            `INSERT INTO profile_pics (id, person_id, file_name, file_type, file_data, file_size, uploaded_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE file_data=VALUES(file_data), file_size=VALUES(file_size), uploaded_at=NOW()`,
            [
              `pic-${r.id}`,
              r.id,
              `${r.recordNo}.jpg`,
              'image/jpeg',
              r.avatarUrl,
              r.avatarUrl.length,
            ]
          );
        }
      }
    }

    // 3. Sync Transactions
    if (Array.isArray(transactions)) {
      for (const t of transactions) {
        await connection.query(
          `INSERT INTO transactions (id, transaction_code, document_type, person_id, status, validity, date_schedule, signed_by, purpose, fee, cedula_no, cedula_date, cedula_place, business_name, business_nature, monthly_income, remarks, rejection_reason, issue_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), remarks=VALUES(remarks), rejection_reason=VALUES(rejection_reason), issue_date=VALUES(issue_date), updated_at=NOW()`,
          [
            t.id,
            t.transactionCode,
            t.documentType,
            t.personId,
            t.status,
            t.validity || '6 Months',
            t.dateSchedule,
            t.signedBy,
            t.purpose,
            t.fee || 0,
            t.cedulaNo || null,
            t.cedulaDate || null,
            t.cedulaPlace || null,
            t.businessName || null,
            t.businessNature || null,
            t.monthlyIncome || null,
            t.remarks || null,
            t.rejectionReason || null,
            t.issueDate || null,
            t.createdAt ? t.createdAt.replace('T', ' ').substring(0, 19) : new Date(),
            t.updatedAt ? t.updatedAt.replace('T', ' ').substring(0, 19) : new Date(),
          ]
        );
      }
    }

    // 4. Sync Payments
    if (Array.isArray(payments)) {
      for (const p of payments) {
        await connection.query(
          `INSERT INTO payments (id, payment_code, transaction_code, person_id, amount, payment_method, or_number, status, payment_date, collected_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), or_number=VALUES(or_number)`,
          [
            p.id,
            p.paymentCode,
            p.transactionCode,
            p.personId,
            p.amount || 0,
            p.paymentMethod || 'Cash',
            p.orNumber,
            p.status,
            p.paymentDate ? p.paymentDate.replace('T', ' ').substring(0, 19) : new Date(),
            p.collectedBy,
          ]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'All records synced into MySQL database successfully!' });
  } catch (err: any) {
    await connection.rollback();
    console.error('MySQL Sync error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

// Setup server and Vite middleware
async function startServer() {
  await initMySqlConnection();

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[BDMS] Application running at http://localhost:${PORT}`);
  });
}

startServer();
