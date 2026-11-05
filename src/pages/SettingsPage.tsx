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
} from 'lucide-react';

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
