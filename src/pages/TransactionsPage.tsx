import React, { useState, useMemo } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  AlertCircle,
  Calendar,
  Building,
  CreditCard,
  UserCheck,
  Send,
  MoreVertical,
  Trash2,
  Check,
} from 'lucide-react';
import { Transaction, DocumentType, TransactionStatus, ResidentPersonalInfo, Payment } from '../types';
import { PrintCertificateModal } from '../components/PrintCertificateModal';

interface TransactionsPageProps {
  onOpenNewResident?: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onOpenNewResident }) => {
  const {
    transactions,
    residents,
    payments,
    barangayInfo,
    currentUser,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction,
    deleteTransactions,
    getResidentById,
    recordPayment,
    updatePayment,
  } = useBarangay();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('All');

  // Multi-select & Deletion state
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<Transaction | null>(null);
  const [selectedTxForStatus, setSelectedTxForStatus] = useState<Transaction | null>(null);
  const [selectedTxForPayment, setSelectedTxForPayment] = useState<Transaction | null>(null);

  // New Request Form State
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Barangay Clearance');
  const [purpose, setPurpose] = useState('');
  const [dateSchedule, setDateSchedule] = useState(() => new Date().toISOString().split('T')[0]);
  const [cedulaNo, setCedulaNo] = useState('');
  const [cedulaDate, setCedulaDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cedulaPlace, setCedulaPlace] = useState(barangayInfo.cityMunicipal);
  const [businessName, setBusinessName] = useState('');
  const [businessNature, setBusinessNature] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(8000);
  const [remarks, setRemarks] = useState('');

  // Status Change State
  const [targetStatus, setTargetStatus] = useState<TransactionStatus>('In Review');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusRemark, setStatusRemark] = useState('');

  // Payment update state
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Maya' | 'Waived (Indigent)'>('Cash');
  const [orNumber, setOrNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(100);

  // Auto fee calculation based on DocumentType
  const getStandardFee = (type: DocumentType): number => {
    switch (type) {
      case 'Barangay Clearance':
        return 100;
      case 'Certificate of Residency':
        return 50;
      case 'Barangay Business Clearance':
        return 350;
      case 'Certificate of Good Moral':
        return 75;
      case 'Certificate of Indigency':
      case 'First Time Jobseeker Certificate':
      case 'Certificate of Low Income':
        return 0; // Mandated free by Philippine laws (RA 11261 / Social Welfare)
      default:
        return 50;
    }
  };

  const handleDocTypeChange = (type: DocumentType) => {
    setSelectedDocType(type);
    if (type === 'Barangay Clearance') {
      setPurpose('Local Employment');
    } else if (type === 'Certificate of Indigency') {
      setPurpose('Medical Assistance / Financial Aid');
    } else if (type === 'Certificate of Residency') {
      setPurpose('School Enrollment / Proof of Residence');
    } else if (type === 'Barangay Business Clearance') {
      setPurpose('New Business Permit / Renewal');
    } else if (type === 'First Time Jobseeker Certificate') {
      setPurpose('First Time Jobseeker Act (RA 11261)');
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) {
      alert('Please select a resident.');
      return;
    }

    const fee = getStandardFee(selectedDocType);
    createTransaction({
      personId: selectedResidentId,
      documentType: selectedDocType,
      purpose: purpose || 'Official Barangay Certification',
      dateSchedule,
      fee,
      cedulaNo: cedulaNo || undefined,
      cedulaDate: cedulaDate || undefined,
      cedulaPlace: cedulaPlace || undefined,
      businessName: businessName || undefined,
      businessNature: businessNature || undefined,
      monthlyIncome: selectedDocType === 'Certificate of Low Income' ? Number(monthlyIncome) : undefined,
      remarks: remarks || undefined,
    });

    setIsNewTxModalOpen(false);
    // Reset form
    setSelectedResidentId('');
    setPurpose('');
    setRemarks('');
    setBusinessName('');
    setBusinessNature('');
  };

  const handleApplyStatusChange = () => {
    if (!selectedTxForStatus) return;
    updateTransactionStatus(selectedTxForStatus.id, targetStatus, {
      rejectionReason: targetStatus === 'Rejected' ? rejectionReason : undefined,
      remarks: statusRemark || undefined,
    });
    setSelectedTxForStatus(null);
    setRejectionReason('');
    setStatusRemark('');
  };

  const handleSavePayment = () => {
    if (!selectedTxForPayment) return;
    const existing = payments.find((p) => p.transactionCode === selectedTxForPayment.transactionCode);
    if (existing) {
      updatePayment(existing.id, {
        paymentMethod,
        orNumber: orNumber || existing.orNumber,
        amount: paymentAmount,
        status: paymentAmount === 0 ? 'Waived' : 'Paid',
        paymentDate: new Date().toISOString(),
      });
    } else {
      recordPayment({
        transactionCode: selectedTxForPayment.transactionCode,
        personId: selectedTxForPayment.personId,
        amount: paymentAmount,
        paymentMethod,
        orNumber: orNumber || `OR-${Date.now().toString().slice(-6)}`,
        status: paymentAmount === 0 ? 'Waived' : 'Paid',
        paymentDate: new Date().toISOString(),
        collectedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Clerk',
      });
    }
    setSelectedTxForPayment(null);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const resident = getResidentById(t.personId);
      const fullName = resident
        ? `${resident.firstName} ${resident.lastName}`.toLowerCase()
        : '';
      const matchesSearch =
        t.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesDocType = docTypeFilter === 'All' || t.documentType === docTypeFilter;

      return matchesSearch && matchesStatus && matchesDocType;
    });
  }, [transactions, searchTerm, statusFilter, docTypeFilter, residents]);

  const getStatusBadge = (status: TransactionStatus) => {
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: transactions.length };
    transactions.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [transactions]);

  // Selection calculations
  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedTxIds.includes(tx.id));

  const isSomeSelected =
    filteredTransactions.some((tx) => selectedTxIds.includes(tx.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all displayed
      const filteredIdSet = new Set(filteredTransactions.map((tx) => tx.id));
      setSelectedTxIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Select all displayed
      const filteredIds = filteredTransactions.map((tx) => tx.id);
      setSelectedTxIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleRowSelect = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteSingleDelete = () => {
    if (!txToDelete) return;
    deleteTransaction(txToDelete.id);
    setSelectedTxIds((prev) => prev.filter((id) => id !== txToDelete.id));
    setTxToDelete(null);
  };

  const handleExecuteBulkDelete = () => {
    if (selectedTxIds.length === 0) return;
    deleteTransactions(selectedTxIds);
    setSelectedTxIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Document Transactions & Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, verify, and issue authenticated certifications for barangay residents
          </p>
        </div>

        <button
          onClick={() => {
            if (residents.length > 0) {
              setSelectedResidentId(residents[0].id);
            }
            setIsNewTxModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Document Request
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Pending', 'In Review', 'Approved', 'Ready for Pickup', 'Released', 'Rejected'].map(
            (status) => {
              const count = statusCounts[status] || 0;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search & Document Type Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tracking code (TXN-...), resident name, or purpose..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
        </div>
      </div>

      {/* Bulk Action Toolbar (Appears when 1 or more items are selected) */}
      {selectedTxIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              {selectedTxIds.length}
            </span>
            <div>
              <p className="font-bold text-rose-950 text-sm">
                {selectedTxIds.length} Transaction{selectedTxIds.length > 1 ? 's' : ''} Selected
              </p>
              <p className="text-[11px] text-rose-700">
                You can delete all selected data in a single action
              </p>
            </div>
            <button
              onClick={() => setSelectedTxIds([])}
              className="text-slate-500 hover:text-slate-800 underline ml-2 font-medium cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isAllSelected && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-900 font-semibold cursor-pointer transition-colors"
              >
                Select All ({filteredTransactions.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedTxIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    title={isAllSelected ? 'Deselect All' : 'Select All Data in Table'}
                  />
                </th>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Resident Applicant</th>
                <th className="py-3.5 px-4">Document Type</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Fee / Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search filters or click "New Document Request".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const resident = getResidentById(tx.personId);
                  const residentName = resident
                    ? `${resident.firstName} ${resident.lastName}`
                    : 'Unknown Resident';

                  const payment = payments.find((p) => p.transactionCode === tx.transactionCode);
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-rose-50/60 hover:bg-rose-50/80'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRowSelect(tx.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          title="Select row"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{tx.transactionCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {resident?.avatarUrl ? (
                            <img
                              src={resident.avatarUrl}
                              alt={residentName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                              {residentName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {residentName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {resident?.address.purok || 'Resident'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 block">{tx.documentType}</span>
                        <span className="text-[10px] text-slate-400">Validity: {tx.validity}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 max-w-xs truncate font-medium">{tx.purpose}</p>
                        {tx.remarks && (
                          <p className="text-[10px] text-slate-400 truncate max-w-xs italic">
                            Note: {tx.remarks}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">
                            {tx.fee === 0 ? 'Free / Waived' : `₱${tx.fee}.00`}
                          </p>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              payment?.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : payment?.status === 'Waived'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {payment?.status === 'Paid'
                              ? `Paid (${payment.paymentMethod})`
                              : payment?.status === 'Waived'
                              ? 'Waived (Exempt)'
                              : 'Unpaid / Pending'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Status workflow button */}
                          <button
                            onClick={() => {
                              setSelectedTxForStatus(tx);
                              setTargetStatus(
                                tx.status === 'Pending'
                                  ? 'In Review'
                                  : tx.status === 'In Review'
                                  ? 'Approved'
                                  : tx.status === 'Approved'
                                  ? 'Ready for Pickup'
                                  : 'Released'
                              );
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Update processing status"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          {/* Payment button */}
                          <button
                            onClick={() => {
                              setSelectedTxForPayment(tx);
                              const existingPayment = payments.find(
                                (p) => p.transactionCode === tx.transactionCode
                              );
                              setPaymentAmount(existingPayment?.amount ?? tx.fee);
                              setPaymentMethod(existingPayment?.paymentMethod ?? 'Cash');
                              setOrNumber(existingPayment?.orNumber ?? '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Record or verify payment"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          {/* Print certificate button */}
                          {resident && (
                            <button
                              onClick={() => setSelectedTxForPrint(tx)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Print Authenticated Document"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          )}

                          {/* Details button */}
                          <button
                            onClick={() => setSelectedTxForDetails(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="View full request details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete this transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: New Document Request Wizard */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">New Document Request</h3>
                <p className="text-xs text-slate-500">
                  Select resident applicant and document certification type
                </p>
              </div>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4 text-xs">
              {/* Select Resident */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Resident Applicant *</label>
                  {onOpenNewResident && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewTxModalOpen(false);
                        onOpenNewResident();
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      + Register New Resident
                    </button>
                  )}
                </div>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="" disabled>
                    -- Select Resident from Directory --
                  </option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.recordNo} - {r.firstName} {r.lastName} ({r.address.purok})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Barangay Clearance',
                    'Certificate of Indigency',
                    'Certificate of Residency',
                    'Barangay Business Clearance',
                    'First Time Jobseeker Certificate',
                    'Certificate of Low Income',
                  ].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => handleDocTypeChange(type as DocumentType)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedDocType === type
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block leading-snug">{type}</span>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                        Fee: ₱{getStandardFee(type as DocumentType)}.00
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purpose of Request *</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  placeholder="e.g., Local Employment, Scholarship, Medical Assistance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Dynamic inputs for Business Clearance */}
              {selectedDocType === 'Barangay Business Clearance' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <p className="font-bold text-slate-800">Business Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Business / Trade Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., Aling Nena Store"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium">Business Nature</label>
                      <input
                        type="text"
                        value={businessNature}
                        onChange={(e) => setBusinessNature(e.target.value)}
                        placeholder="e.g., Retail / Eatery"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic input for Low Income */}
              {selectedDocType === 'Certificate of Low Income' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Gross Monthly Family Income (PHP)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}

              {/* Cedula details for Clearance */}
              {selectedDocType === 'Barangay Clearance' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800">Community Tax Certificate (Cedula)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600">CTC No.</label>
                      <input
                        type="text"
                        value={cedulaNo}
                        onChange={(e) => setCedulaNo(e.target.value)}
                        placeholder="CTC-2026-..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600">Date Issued</label>
                      <input
                        type="date"
                        value={cedulaDate}
                        onChange={(e) => setCedulaDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600">Place Issued</label>
                      <input
                        type="text"
                        value={cedulaPlace}
                        onChange={(e) => setCedulaPlace(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule and Remarks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Schedule Date</label>
                  <input
                    type="date"
                    value={dateSchedule}
                    onChange={(e) => setDateSchedule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Office Remarks (Optional)</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Blotter checked clean"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Fee notice */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Total Document Fee:</span>
                  <span className="text-[11px] text-emerald-700">
                    {getStandardFee(selectedDocType) === 0
                      ? 'Waived / Free by Philippine Social Protections'
                      : 'Payable at Barangay Cashier'}
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-900">
                  ₱{getStandardFee(selectedDocType)}.00
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save & Queue Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Process / Change Status */}
      {selectedTxForStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg">Update Processing Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Transaction: <span className="font-mono font-semibold">{selectedTxForStatus.transactionCode}</span>
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select New Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['In Review', 'Approved', 'Ready for Pickup', 'Released', 'Rejected'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setTargetStatus(status as TransactionStatus)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                        targetStatus === status
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {targetStatus === 'Rejected' && (
                <div>
                  <label className="font-semibold text-rose-700 block mb-1">Reason for Rejection *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Incomplete requirements, pending blotter settlement..."
                    className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Internal Note (Optional)</label>
                <input
                  type="text"
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  placeholder="e.g. Signatures verified by Duty Officer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxForStatus(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyStatusChange}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Payment */}
      {selectedTxForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Record / Update Payment
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Issue Official Receipt for {selectedTxForPayment.transactionCode}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cash', 'GCash', 'Maya', 'Waived (Indigent)'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method);
                        if (method === 'Waived (Indigent)') {
                          setPaymentAmount(0);
                        } else if (paymentAmount === 0) {
                          setPaymentAmount(selectedTxForPayment.fee);
                        }
                      }}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount (PHP)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Official Receipt (OR) Number
                </label>
                <input
                  type="text"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
                  placeholder="e.g. OR-2026-9812"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxForPayment(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Save Payment & Issue OR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Transaction Details Inspector */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Transaction Audit File
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedTxForDetails.transactionCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxForDetails(null)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const resident = getResidentById(selectedTxForDetails.personId);
              const payment = payments.find(
                (p) => p.transactionCode === selectedTxForDetails.transactionCode
              );

              return (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <p className="font-bold text-slate-800">Resident Information</p>
                    <p>
                      <span className="text-slate-500">Name:</span>{' '}
                      <span className="font-semibold text-slate-900">
                        {resident?.firstName} {resident?.lastName}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Address:</span>{' '}
                      <span>
                        {resident?.address.bldgNo}, {resident?.address.purok}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Phone:</span> <span>{resident?.phone}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 block">Document Type</span>
                      <span className="font-bold text-slate-900">{selectedTxForDetails.documentType}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 block">Status</span>
                      <span className="font-bold text-emerald-700">{selectedTxForDetails.status}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <p className="font-bold text-slate-800">Financial & Audit Trail</p>
                    <p>
                      <span className="text-slate-500">Official Receipt:</span>{' '}
                      <span className="font-mono font-semibold">{payment?.orNumber || 'None'}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Payment Status:</span>{' '}
                      <span className="font-semibold">{payment?.status || 'Pending'}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Collected By:</span>{' '}
                      <span>{payment?.collectedBy || 'Not yet collected'}</span>
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    {resident && (
                      <button
                        onClick={() => {
                          setSelectedTxForDetails(null);
                          setSelectedTxForPrint(selectedTxForDetails);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Document
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTxForDetails(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Print Certificate Modal */}
      {selectedTxForPrint && (
        <PrintCertificateModal
          transaction={selectedTxForPrint}
          resident={getResidentById(selectedTxForPrint.personId)!}
          barangayInfo={barangayInfo}
          onClose={() => setSelectedTxForPrint(null)}
        />
      )}

      {/* MODAL 5: Single Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Delete Transaction?</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {txToDelete.transactionCode}
                </p>
              </div>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-semibold text-slate-900">{txToDelete.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">
                  {(() => {
                    const r = getResidentById(txToDelete.personId);
                    return r ? `${r.firstName} ${r.lastName}` : 'Resident';
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="text-slate-700 truncate max-w-[200px]">{txToDelete.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-800">{txToDelete.status}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 mb-5 leading-relaxed">
              Are you sure you want to delete this document request? This will permanently remove the record and any linked official receipt from the offline database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 cursor-pointer transition-all"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Bulk Delete Confirmation Modal (Single action to delete multiple records) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Delete {selectedTxIds.length} Selected Transactions?
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  Single Action Batch Deletion
                </p>
              </div>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                You are about to permanently delete the following <span className="font-bold text-slate-900">{selectedTxIds.length} transaction(s)</span> in a single action:
              </p>

              {/* Preview of items to be deleted */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {selectedTxIds.slice(0, 8).map((id) => {
                  const tx = transactions.find((t) => t.id === id);
                  const resident = tx ? getResidentById(tx.personId) : null;
                  return (
                    <div key={id} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <span className="font-bold text-slate-800">{tx?.transactionCode || id}</span>
                      <span className="text-slate-500 truncate max-w-[180px]">
                        {tx?.documentType} ({resident?.lastName || 'Resident'})
                      </span>
                    </div>
                  );
                })}
                {selectedTxIds.length > 8 && (
                  <p className="text-slate-400 font-sans italic text-[10px] text-center pt-1">
                    ... and {selectedTxIds.length - 8} more transaction(s)
                  </p>
                )}
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <p className="leading-snug text-[11px]">
                  <span className="font-bold">Warning:</span> This operation cannot be undone. All selected document requests, audit histories, and corresponding official payment receipts will be erased.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete All {selectedTxIds.length} Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
