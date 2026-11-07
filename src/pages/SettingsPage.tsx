import React, { useState } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  Settings,
  HardDriveDownload,
  Upload,
  RotateCcw,
  Building,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Database,
  Server,
  Download,
  RefreshCw,
  FileCode,
  Check,
} from 'lucide-react';
import { downloadMySqlDump } from '../utils/sqlExporter';

export const SettingsPage: React.FC = () => {
  const {
    barangayInfo,
    updateBarangayInfo,
    resetToDefaultData,
    exportDatabaseJson,
    importDatabaseJson,
    residents,
    transactions,
    payments,
    users,
    officials,
  } = useBarangay();

  const [name, setName] = useState(barangayInfo.name);
  const [district, setDistrict] = useState(barangayInfo.district);
  const [cityMunicipal, setCityMunicipal] = useState(barangayInfo.cityMunicipal);
  const [province, setProvince] = useState(barangayInfo.province);
  const [contactNumber, setContactNumber] = useState(barangayInfo.contactNumber);
  const [email, setEmail] = useState(barangayInfo.email);
  const [officeHours, setOfficeHours] = useState(barangayInfo.officeHours);
  const [punongBarangay, setPunongBarangay] = useState(barangayInfo.punongBarangay);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateBarangayInfo({
      name,
      district,
      cityMunicipal,
      province,
      contactNumber,
      email,
      officeHours,
      punongBarangay,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJson(content);
        if (ok) {
          setImportStatus('Database successfully restored from JSON file!');
        } else {
          setImportStatus('Failed to import: Invalid JSON schema format.');
        }
        setTimeout(() => setImportStatus(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  // MySQL local sync & export state
  const [isExportingSql, setIsExportingSql] = useState(false);
  const [isSyncingSql, setIsSyncingSql] = useState(false);
  const [sqlMessage, setSqlMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleDownloadMySql = () => {
    setIsExportingSql(true);
    try {
      downloadMySqlDump({
        barangayInfo,
        users,
        residents,
        transactions,
        payments,
        officials,
      });
      setSqlMessage({
        type: 'success',
        text: 'MySQL database dump (.sql) generated and downloaded! Ready to import into XAMPP/phpMyAdmin.',
      });
    } catch (err: any) {
      setSqlMessage({
        type: 'error',
        text: `Export failed: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      setIsExportingSql(false);
      setTimeout(() => setSqlMessage(null), 6000);
    }
  };

  const handleSyncToLocalMySql = async () => {
    setIsSyncingSql(true);
    setSqlMessage({ type: 'info', text: 'Connecting to local MySQL server at localhost:3306...' });

    try {
      const res = await fetch('/api/mysql/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayInfo,
          users,
          residents,
          transactions,
          payments,
          officials,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSqlMessage({
          type: 'success',
          text: '✓ All records and resident pictures successfully synced to local MySQL database (barangay_db)!',
        });
      } else {
        setSqlMessage({
          type: 'error',
          text: `MySQL notice: ${data.message || 'Make sure MySQL is running via XAMPP and run "npm run dev:mysql" on your PC.'}`,
        });
      }
    } catch {
      setSqlMessage({
        type: 'info',
        text: 'Local MySQL runner is not active on this port. To run with MySQL on your PC: start XAMPP MySQL and run "npm run dev:mysql". You can also click "Download MySQL Database (.sql)" above to import directly into phpMyAdmin!',
      });
    } finally {
      setIsSyncingSql(false);
      setTimeout(() => setSqlMessage(null), 7000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Offline Database
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure official LGU details, certificate headings, and manage offline data backups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Barangay LGU Profile (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-slate-900 text-base">Barangay Information</h2>
            </div>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Updated successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Barangay Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Punong Barangay (Captain) *
                </label>
                <input
                  type="text"
                  value={punongBarangay}
                  onChange={(e) => setPunongBarangay(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City / Municipality *</label>
                <input
                  type="text"
                  value={cityMunicipal}
                  onChange={(e) => setCityMunicipal(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Province / Region *</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Hotline</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Office Hours</label>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save LGU Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Database Storage & Backup Tools */}
        <div className="space-y-6">
          {/* Storage Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Offline Storage Snapshot</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Registered Residents:</span>
                <span className="font-bold text-slate-900">{residents.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Document Transactions:</span>
                <span className="font-bold text-slate-900">{transactions.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Payment Records:</span>
                <span className="font-bold text-slate-900">{payments.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Barangay Officials:</span>
                <span className="font-bold text-slate-900">{officials.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">System Users:</span>
                <span className="font-bold text-slate-900">{users.length}</span>
              </div>
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                {importStatus}
              </div>
            )}

            {/* Backup / Export Button */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={exportDatabaseJson}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <HardDriveDownload className="w-4 h-4 text-emerald-400" />
                Export Database Backup (.JSON)
              </button>

              <label className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Restore Database from File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to reset all data to default pre-seeded records? This will clear custom changes.'
                    )
                  ) {
                    resetToDefaultData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default Seed Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MySQL Database & Local PC Setup (XAMPP / MySQL Server Integration) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>MySQL Database & Local PC Setup</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                  XAMPP / phpMyAdmin Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Use browser offline storage here, and run an authentic MySQL database on your local PC
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncToLocalMySql}
              disabled={isSyncingSql}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Test connection and sync data to local MySQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncingSql ? 'animate-spin' : ''}`} />
              <span>{isSyncingSql ? 'Syncing...' : 'Sync to Local MySQL'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMySql}
              disabled={isExportingSql}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-900/15 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Download MySQL Database (.sql)</span>
            </button>
          </div>
        </div>

        {sqlMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
              sqlMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : sqlMessage.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{sqlMessage.text}</p>
          </div>
        )}

        {/* Resident Pictures & Local PC Reliability Notice */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Why Resident Photos Now Work Reliably on Your Local PC:
            </p>
            <p className="text-amber-900/90 leading-relaxed">
              When uploading resident pictures, the system now automatically downsamples and compresses them via client-side canvas into standard 400×400 portraits (~35KB). This prevents browser <code className="font-mono font-bold text-amber-950">QuotaExceededError</code> on <code className="font-mono text-amber-950">http://localhost:3000</code>, ensuring photos persist permanently on your PC and save cleanly into MySQL's <code className="font-mono font-bold text-amber-950">profile_pics</code> table without packet limits!
            </p>
          </div>
        </div>

        {/* 4-Step XAMPP & MySQL Setup Guide */}
        <div className="space-y-3">
          <p className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-sky-600" />
            <span>4 Simple Steps to Run with MySQL in XAMPP on your PC:</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                1
              </span>
              <p className="font-bold text-slate-900">Start XAMPP</p>
              <p className="text-slate-500 leading-relaxed">
                Open XAMPP Control Panel on your PC and click <span className="font-semibold text-slate-800">Start</span> for both <span className="font-semibold text-slate-800">Apache</span> and <span className="font-semibold text-slate-800">MySQL</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                2
              </span>
              <p className="font-bold text-slate-900">Open phpMyAdmin</p>
              <p className="text-slate-500 leading-relaxed">
                Open browser and go to <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer" className="text-sky-700 underline font-mono">http://localhost/phpmyadmin</a>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                3
              </span>
              <p className="font-bold text-slate-900">Import Database</p>
              <p className="text-slate-500 leading-relaxed">
                Click <span className="font-semibold text-slate-800">Import</span> in phpMyAdmin. Choose <span className="font-mono text-slate-700">database/schema.sql</span> (or the downloaded <span className="font-mono text-slate-700">.sql</span> file) and click <span className="font-semibold text-slate-800">Go</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                4
              </span>
              <p className="font-bold text-slate-900">Start Local Server</p>
              <p className="text-slate-500 leading-relaxed">
                In your project folder, run <code className="bg-slate-900 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">npm run dev:mysql</code> or <code className="bg-slate-900 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">npm run dev</code>!
              </p>
            </div>
          </div>
        </div>

        {/* Database Tables Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">ERD Tables Generated:</span>
            <span className="font-mono text-slate-600">users, personal_infos, addresses, profile_pics, transactions, payments, officials, barangay_info</span>
          </div>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            100% ERD Project Specification Compliant
          </span>
        </div>
      </div>

      {/* Offline Deployment & Barangay Local Area Network (LAN) Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              How to Run This System Completely Offline
            </h3>
            <p className="text-xs text-slate-500">
              Run standalone on a single desktop or share across multiple staff computers in your Barangay Hall without internet
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Method 1: Single Desktop */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Standalone Desktop / Laptop</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Copy the project folder onto your office PC with Node.js installed. Open terminal/command prompt inside the folder and execute:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] space-y-1">
              <p># Install dependencies (once)</p>
              <p className="text-white font-bold">npm install</p>
              <p className="text-slate-400 mt-1"># Start local offline server</p>
              <p className="text-white font-bold">npm run dev</p>
            </div>
            <p className="text-slate-500 text-[11px]">
              Open <span className="font-mono text-emerald-800 font-semibold">http://localhost:3000</span> in Chrome, Edge, or Firefox.
            </p>
          </div>

          {/* Method 2: Barangay Hall Local Network (LAN) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Barangay Hall LAN (Multiple Clerks)</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Designate one computer as the server. Connect all office desks to the same Wi-Fi router or network switch (no internet needed!):
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 text-blue-300 font-mono text-[11px] space-y-1">
              <p># Expose to entire office network</p>
              <p className="text-white font-bold">npm run dev -- --host 0.0.0.0</p>
            </div>
            <p className="text-slate-500 text-[11px]">
              Other clerks open: <span className="font-mono text-blue-800 font-semibold">http://192.168.1.XXX:3000</span> using the server's local IP.
            </p>
          </div>

          {/* Method 3: 1-Click Windows Batch Script */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">1-Click Windows Shortcut (.bat)</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Create a text file named <span className="font-mono font-bold text-slate-800">start-barangay-system.bat</span> in the folder:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 text-purple-300 font-mono text-[10px] space-y-1">
              <p className="text-slate-400">@echo off</p>
              <p className="text-white">npm run preview -- --port 3000</p>
              <p className="text-slate-400">start http://localhost:3000</p>
            </div>
            <p className="text-slate-500 text-[11px]">
              Double-clicking this file automatically boots the system and opens the browser.
            </p>
          </div>
        </div>

        {/* Data Persistence Note */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3 text-xs text-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Offline Data Safety:</span> All transactions, resident records, official receipts, and settings are saved automatically in your browser's persistent offline storage. Use the <span className="font-bold">"Export Database Backup (.JSON)"</span> button above to regularly create external backups on a USB flash drive or office hard drive.
          </p>
        </div>
      </div>
    </div>
  );
};
