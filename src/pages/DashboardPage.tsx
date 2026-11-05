import React, { useState } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Printer,
  Eye,
  Filter,
  DollarSign,
  HeartHandshake,
  ShieldAlert,
  Building,
  UserPlus,
  FileCheck,
} from 'lucide-react';
import { Transaction, DocumentType } from '../types';
import { PrintCertificateModal } from '../components/PrintCertificateModal';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenNewTransaction: () => void;
  onOpenNewResident: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenNewTransaction,
  onOpenNewResident,
}) => {
  const { residents, transactions, payments, barangayInfo, getResidentById, updateTransactionStatus } = useBarangay();
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);

  // Compute metrics
  const totalResidents = residents.length;
  const totalRequests = transactions.length;
  const pendingRequests = transactions.filter((t) => t.status === 'Pending');
  const inReviewRequests = transactions.filter((t) => t.status === 'In Review');
  const releasedRequests = transactions.filter((t) => t.status === 'Released');
  const readyRequests = transactions.filter((t) => t.status === 'Ready for Pickup');
  const approvedRequests = transactions.filter((t) => t.status === 'Approved');

  // Population demographics
  const maleCount = residents.filter((r) => r.sex === 'Male').length;
  const femaleCount = residents.filter((r) => r.sex === 'Female').length;
  const seniorCount = residents.filter((r) => r.isSenior).length;
  const pwdCount = residents.filter((r) => r.isPwd).length;
  const fourPsCount = residents.filter((r) => r.is4Ps).length;
  const voterCount = residents.filter((r) => r.isVoter).length;

  // Financial calculations
  const totalCollectedRevenue = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const waivedCount = payments.filter((p) => p.status === 'Waived').length;

  // Recent transactions sorted by date
  const recentTransactions = [...transactions].slice(0, 7);

  // Document types tally
  const docTypeCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    docTypeCounts[t.documentType] = (docTypeCounts[t.documentType] || 0) + 1;
  });

  // Purok breakdown
  const purokCounts: Record<string, number> = {};
  residents.forEach((r) => {
    const p = r.address.purok.split(' - ')[0] || r.address.purok;
    purokCounts[p] = (purokCounts[p] || 0) + 1;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'In Review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Ready for Pickup':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Released':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-3">
              <Building className="w-3.5 h-3.5" />
              Barangay Operations Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to {barangayInfo.name}
            </h1>
            <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
              Official Barangay Document Request and Resident Management System. Process citizen requests, issue authenticated clearances, and monitor community demographics in real-time.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer hover:shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Document Request
            </button>
            <button
              onClick={onOpenNewResident}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <UserPlus className="w-4 h-4" />
              Register Resident
            </button>
          </div>
        </div>
      </div>

      {/* Top Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Population */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Population
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {totalResidents.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">{maleCount} Male</span> •{' '}
              <span className="text-teal-700 font-semibold">{femaleCount} Female</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{voterCount} Registered Voters</span>
            <button
              onClick={() => onNavigate('residents')}
              className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-0.5"
            >
              View list <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Document Requests
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {totalRequests}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{releasedRequests.length} Released</span> •{' '}
              <span>{approvedRequests.length + readyRequests.length} Ready/Approved</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Processing efficiency 96%</span>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-blue-700 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Pending Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Processing
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {pendingRequests.length + inReviewRequests.length}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-amber-800 font-semibold">{pendingRequests.length} Needs Review</span> •{' '}
              <span>{inReviewRequests.length} In Progress</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg. wait time: 15 mins</span>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-0.5"
            >
              Process queue <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Total Revenue Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fees Collected
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              ₱{totalCollectedRevenue.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">{waivedCount} Indigent Waived</span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Official Receipts recorded</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-0.5"
            >
              Audits <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Ongoing Transactions & Demographic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ongoing Transactions Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Ongoing & Recent Transactions</h2>
              <p className="text-xs text-slate-500">
                Track active document applications submitted by residents
              </p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              View All Transactions ({transactions.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Fee / Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const resident = getResidentById(tx.personId);
                  const residentName = resident
                    ? `${resident.firstName} ${resident.lastName}`
                    : 'Unknown Resident';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {tx.transactionCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {resident?.avatarUrl ? (
                            <img
                              src={resident.avatarUrl}
                              alt={residentName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                              {residentName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {residentName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {resident?.address.purok || 'Resident'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{tx.documentType}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {tx.purpose}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadge(
                              tx.status
                            )}`}
                          >
                            {tx.status}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {tx.fee === 0 ? 'Free / Waived' : `₱${tx.fee}.00`}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {tx.status === 'Pending' && (
                            <button
                              onClick={() => updateTransactionStatus(tx.id, 'In Review')}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium text-[11px] transition-colors"
                              title="Start reviewing document"
                            >
                              Review
                            </button>
                          )}
                          {tx.status === 'In Review' && (
                            <button
                              onClick={() => updateTransactionStatus(tx.id, 'Approved')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-medium text-[11px] transition-colors"
                              title="Approve document request"
                            >
                              Approve
                            </button>
                          )}
                          {(tx.status === 'Approved' || tx.status === 'Ready for Pickup' || tx.status === 'Released') && resident && (
                            <button
                              onClick={() => setSelectedTxForPrint(tx)}
                              className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors"
                              title="Print authenticated document"
                            >
                              <Printer className="w-3 h-3" />
                              Print
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Demographics & Document Breakdowns (1/3 width) */}
        <div className="space-y-6">
          {/* Demographic Groups Highlight */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
              <span>Vulnerable & Priority Sectors</span>
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700">Senior Citizens (60+)</span>
                <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {seniorCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700">Persons with Disability (PWD)</span>
                <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {pwdCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700">4Ps Beneficiary Families</span>
                <span className="font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {fourPsCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-medium text-slate-700">Registered Voters</span>
                <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {voterCount}
                </span>
              </div>
            </div>
          </div>

          {/* Document Demand Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Document Request Types</h3>
            <div className="space-y-2">
              {Object.entries(docTypeCounts).map(([type, count]) => {
                const percent = Math.round((count / (totalRequests || 1)) * 100);
                return (
                  <div key={type} className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span className="truncate max-w-[180px]">{type}</span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Print Modal */}
      {selectedTxForPrint && (
        <PrintCertificateModal
          transaction={selectedTxForPrint}
          resident={getResidentById(selectedTxForPrint.personId)!}
          barangayInfo={barangayInfo}
          onClose={() => setSelectedTxForPrint(null)}
        />
      )}
    </div>
  );
};
