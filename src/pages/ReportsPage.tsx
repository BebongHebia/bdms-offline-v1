import React, { useState, useMemo, useRef } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  BarChart3,
  Printer,
  Download,
  Filter,
  Users,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Award,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { ResidentPersonalInfo, Transaction, Payment } from '../types';

export const ReportsPage: React.FC = () => {
  const { residents, transactions, payments, barangayInfo } = useBarangay();
  const [activeTab, setActiveTab] = useState<'demographics' | 'transactions'>('demographics');

  // Demographic Filters
  const [selectedSex, setSelectedSex] = useState<string>('All');
  const [selectedPurok, setSelectedPurok] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');

  // Transaction Filters
  const [dateRange, setDateRange] = useState<'All' | 'Today' | 'This Month'>('All');
  const [selectedDocType, setSelectedDocType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const printReportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Filtered residents
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const matchSex = selectedSex === 'All' || r.sex === selectedSex;
      const matchPurok = selectedPurok === 'All' || r.address.purok === selectedPurok;
      let matchSector = true;
      if (selectedSector === 'Senior') matchSector = r.isSenior;
      else if (selectedSector === 'PWD') matchSector = r.isPwd;
      else if (selectedSector === '4Ps') matchSector = r.is4Ps;
      else if (selectedSector === 'Voters') matchSector = r.isVoter;

      return matchSex && matchPurok && matchSector;
    });
  }, [residents, selectedSex, selectedPurok, selectedSector]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchDocType = selectedDocType === 'All' || t.documentType === selectedDocType;
      const matchStatus = selectedStatus === 'All' || t.status === selectedStatus;
      return matchDocType && matchStatus;
    });
  }, [transactions, selectedDocType, selectedStatus]);

  // Total collected revenue in filtered set
  const filteredRevenue = useMemo(() => {
    const codes = new Set(filteredTransactions.map((t) => t.transactionCode));
    return payments
      .filter((p) => codes.has(p.transactionCode) && p.status === 'Paid')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [filteredTransactions, payments]);

  const purokList = [
    'Purok 1 - Sampaguita',
    'Purok 2 - Ilang-Ilang',
    'Purok 3 - Camia',
    'Purok 4 - Bougainvillea',
    'Purok 5 - Jasmin',
    'Purok 6 - Waling-Waling',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Barangay Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export demographic profiles, sector listings, and document issuance audits
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Official Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 print:hidden">
        <button
          onClick={() => setActiveTab('demographics')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'demographics'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Population & Demographics Report
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Transactions & Revenue Audit
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs print:hidden space-y-3">
        {activeTab === 'demographics' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Filter by Sex</label>
              <select
                value={selectedSex}
                onChange={(e) => setSelectedSex(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Genders (Male & Female)</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Filter by Purok / Zone</label>
              <select
                value={selectedPurok}
                onChange={(e) => setSelectedPurok(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Puroks / Entire Barangay</option>
                {purokList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority / Welfare Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Sectors</option>
                <option value="Senior">Senior Citizens (60+)</option>
                <option value="PWD">Persons with Disability (PWD)</option>
                <option value="4Ps">4Ps Beneficiaries</option>
                <option value="Voters">Registered Voters</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document Type</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Document Types</option>
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Certificate of Indigency">Certificate of Indigency</option>
                <option value="Certificate of Residency">Certificate of Residency</option>
                <option value="Barangay Business Clearance">Barangay Business Clearance</option>
                <option value="First Time Jobseeker Certificate">First Time Jobseeker</option>
                <option value="Certificate of Low Income">Certificate of Low Income</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Processing Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Released">Released</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 w-full flex items-center justify-between">
                <span className="text-emerald-900 font-bold">Total Fees Collected:</span>
                <span className="font-black text-emerald-900 text-sm">₱{filteredRevenue.toLocaleString()}.00</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Report Document Sheet */}
      <div
        ref={printReportRef}
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none"
      >
        {/* Printable Official Header */}
        <div className="text-center pb-6 mb-6 border-b-2 border-emerald-900/60">
          <p className="text-xs uppercase font-semibold text-slate-600 tracking-wider">
            Republic of the Philippines • {barangayInfo.province} • {barangayInfo.cityMunicipal}
          </p>
          <h2 className="text-2xl font-extrabold uppercase text-emerald-950 font-serif mt-1">
            {barangayInfo.name}
          </h2>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mt-1">
            {activeTab === 'demographics'
              ? 'Comprehensive Barangay Population & Demographic Census Report'
              : 'Official Document Issuance & Revenue Audit Report'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Report Generated on: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
          </p>
        </div>

        {/* Content depending on tab */}
        {activeTab === 'demographics' ? (
          <div>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Filtered Count</span>
                <span className="text-xl font-black text-slate-900">{filteredResidents.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Senior Citizens</span>
                <span className="text-xl font-black text-amber-700">
                  {filteredResidents.filter((r) => r.isSenior).length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">PWDs</span>
                <span className="text-xl font-black text-blue-700">
                  {filteredResidents.filter((r) => r.isPwd).length}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">4Ps Families</span>
                <span className="text-xl font-black text-purple-700">
                  {filteredResidents.filter((r) => r.is4Ps).length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Record ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Sex / Age</th>
                    <th className="py-2.5 px-3">Address (Purok)</th>
                    <th className="py-2.5 px-3">Occupation</th>
                    <th className="py-2.5 px-3">Voter Status</th>
                    <th className="py-2.5 px-3">Sectors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResidents.map((r) => {
                    const age = new Date().getFullYear() - new Date(r.bday).getFullYear();
                    return (
                      <tr key={r.id}>
                        <td className="py-2 px-3 font-mono font-semibold">{r.recordNo}</td>
                        <td className="py-2 px-3 font-bold">
                          {r.firstName} {r.middleName ? `${r.middleName[0]}.` : ''} {r.lastName} {r.suffix || ''}
                        </td>
                        <td className="py-2 px-3">
                          {r.sex} • {age} yrs
                        </td>
                        <td className="py-2 px-3">{r.address.purok}</td>
                        <td className="py-2 px-3">{r.occupation}</td>
                        <td className="py-2 px-3">
                          <span className={r.isVoter ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            {r.isVoter ? 'Registered' : 'Non-Voter'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {[
                            r.isSenior ? 'Senior' : '',
                            r.isPwd ? 'PWD' : '',
                            r.is4Ps ? '4Ps' : '',
                          ]
                            .filter(Boolean)
                            .join(', ') || 'General'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {/* Transactions Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tracking Code</th>
                    <th className="py-2.5 px-3">Document Certification</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Date Applied</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Official Receipt</th>
                    <th className="py-2.5 px-3 text-right">Fee (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const payment = payments.find((p) => p.transactionCode === tx.transactionCode);
                    return (
                      <tr key={tx.id}>
                        <td className="py-2 px-3 font-mono font-bold">{tx.transactionCode}</td>
                        <td className="py-2 px-3 font-semibold">{tx.documentType}</td>
                        <td className="py-2 px-3">{tx.purpose}</td>
                        <td className="py-2 px-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-3 font-medium">{tx.status}</td>
                        <td className="py-2 px-3 font-mono">{payment?.orNumber || 'N/A'}</td>
                        <td className="py-2 px-3 text-right font-bold">
                          {tx.fee === 0 ? 'WAIVED' : `₱${tx.fee}.00`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase">
                      Total Revenue Collected:
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-900 font-black">
                      ₱{filteredRevenue.toLocaleString()}.00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Attestation & Signature Lines */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-700">
          <div>
            <p className="font-medium text-slate-500">Prepared by:</p>
            <p className="mt-8 font-bold text-slate-900 underline uppercase">
              Rosa M. Villanueva
            </p>
            <p className="text-[11px] text-slate-500">Barangay Records Officer / Secretary</p>
          </div>

          <div className="text-right">
            <p className="font-medium text-slate-500">Attested & Verified by:</p>
            <p className="mt-8 font-bold text-slate-900 underline uppercase">
              {barangayInfo.punongBarangay}
            </p>
            <p className="text-[11px] text-slate-500">Punong Barangay (Barangay Captain)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
