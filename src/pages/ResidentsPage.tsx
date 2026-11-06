import React, { useState, useMemo } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  FileText,
  HeartHandshake,
  ShieldCheck,
  CheckCircle,
  Plus,
  Printer,
  ChevronRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { ResidentPersonalInfo } from '../types';

interface ResidentsPageProps {
  onOpenNewTransactionForResident?: (residentId: string) => void;
}

export const ResidentsPage: React.FC<ResidentsPageProps> = ({ onOpenNewTransactionForResident }) => {
  const {
    residents,
    addResident,
    updateResident,
    deleteResident,
    deleteResidents,
    transactions,
    barangayInfo,
  } = useBarangay();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [purokFilter, setPurokFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  // Multi-select & Deletion state
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [residentToDelete, setResidentToDelete] = useState<ResidentPersonalInfo | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentPersonalInfo | null>(null);
  const [viewingResident, setViewingResident] = useState<ResidentPersonalInfo | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [bday, setBday] = useState('1990-01-01');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [civilStatus, setCivilStatus] = useState<'Single' | 'Married' | 'Widowed' | 'Separated'>('Single');
  const [placeOfBirth, setPlaceOfBirth] = useState(barangayInfo.cityMunicipal);
  const [citizenship, setCitizenship] = useState('Filipino');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('09');
  const [email, setEmail] = useState('');
  const [bldgNo, setBldgNo] = useState('');
  const [purok, setPurok] = useState('Purok 1 - Sampaguita');
  const [addressStatus, setAddressStatus] = useState<'Permanent' | 'Transient' | 'Current'>('Permanent');
  const [isPwd, setIsPwd] = useState(false);
  const [pwdDetails, setPwdDetails] = useState('');
  const [isSenior, setIsSenior] = useState(false);
  const [is4Ps, setIs4Ps] = useState(false);
  const [isVoter, setIsVoter] = useState(true);
  const [bloodType, setBloodType] = useState('O+');

  const openRegisterModal = () => {
    setEditingResident(null);
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setSuffix('');
    setBday('1990-01-01');
    setSex('Male');
    setCivilStatus('Single');
    setPlaceOfBirth(barangayInfo.cityMunicipal);
    setCitizenship('Filipino');
    setOccupation('');
    setPhone('09');
    setEmail('');
    setBldgNo('');
    setPurok('Purok 1 - Sampaguita');
    setAddressStatus('Permanent');
    setIsPwd(false);
    setPwdDetails('');
    setIsSenior(false);
    setIs4Ps(false);
    setIsVoter(true);
    setBloodType('O+');
    setIsRegisterModalOpen(true);
  };

  const openEditModal = (res: ResidentPersonalInfo) => {
    setEditingResident(res);
    setFirstName(res.firstName);
    setMiddleName(res.middleName);
    setLastName(res.lastName);
    setSuffix(res.suffix || '');
    setBday(res.bday);
    setSex(res.sex);
    setCivilStatus(res.civilStatus);
    setPlaceOfBirth(res.placeOfBirth);
    setCitizenship(res.citizenship);
    setOccupation(res.occupation);
    setPhone(res.phone);
    setEmail(res.email || '');
    setBldgNo(res.address.bldgNo);
    setPurok(res.address.purok);
    setAddressStatus(res.address.status);
    setIsPwd(res.isPwd);
    setPwdDetails(res.pwdDetails || '');
    setIsSenior(res.isSenior);
    setIs4Ps(res.is4Ps);
    setIsVoter(res.isVoter);
    setBloodType(res.bloodType || 'O+');
    setIsRegisterModalOpen(true);
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();

    const addressData = {
      id: editingResident?.address.id || `addr-${Date.now()}`,
      personId: editingResident?.id || '',
      bldgNo,
      purok,
      barangay: barangayInfo.name,
      cityMunicipal: barangayInfo.cityMunicipal,
      province: barangayInfo.province,
      country: 'Philippines',
      status: addressStatus,
    };

    if (editingResident) {
      updateResident(editingResident.id, {
        firstName,
        middleName,
        lastName,
        suffix: suffix || undefined,
        bday,
        sex,
        civilStatus,
        placeOfBirth,
        citizenship,
        occupation,
        phone,
        email: email || undefined,
        isPwd,
        pwdDetails: isPwd ? pwdDetails : undefined,
        isSenior,
        is4Ps,
        isVoter,
        bloodType,
        address: { ...addressData, personId: editingResident.id },
      });
    } else {
      addResident({
        firstName,
        middleName,
        lastName,
        suffix: suffix || undefined,
        bday,
        sex,
        civilStatus,
        placeOfBirth,
        citizenship,
        occupation: occupation || 'Unspecified',
        phone: phone || 'N/A',
        email: email || undefined,
        isOfficial: false,
        isPwd,
        pwdDetails: isPwd ? pwdDetails : undefined,
        isSenior,
        is4Ps,
        isVoter,
        bloodType,
        address: addressData,
      });
    }

    setIsRegisterModalOpen(false);
  };

  // Purok unique options
  const purokOptions = [
    'Purok 1 - Sampaguita',
    'Purok 2 - Ilang-Ilang',
    'Purok 3 - Camia',
    'Purok 4 - Bougainvillea',
    'Purok 5 - Jasmin',
    'Purok 6 - Waling-Waling',
  ];

  // Filtered residents
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const full = `${r.firstName} ${r.middleName} ${r.lastName} ${r.recordNo} ${r.phone}`.toLowerCase();
      const matchesSearch = full.includes(searchTerm.toLowerCase());
      const matchesPurok = purokFilter === 'All' || r.address.purok === purokFilter;

      let matchesTag = true;
      if (tagFilter === 'Senior') matchesTag = r.isSenior;
      else if (tagFilter === 'PWD') matchesTag = r.isPwd;
      else if (tagFilter === '4Ps') matchesTag = r.is4Ps;
      else if (tagFilter === 'Voters') matchesTag = r.isVoter;

      return matchesSearch && matchesPurok && matchesTag;
    });
  }, [residents, searchTerm, purokFilter, tagFilter]);

  // Selection calculations
  const isAllSelected =
    filteredResidents.length > 0 &&
    filteredResidents.every((r) => selectedResidentIds.includes(r.id));

  const isSomeSelected =
    filteredResidents.some((r) => selectedResidentIds.includes(r.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIdSet = new Set(filteredResidents.map((r) => r.id));
      setSelectedResidentIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const filteredIds = filteredResidents.map((r) => r.id);
      setSelectedResidentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleRowSelect = (id: string) => {
    setSelectedResidentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteSingleDelete = () => {
    if (!residentToDelete) return;
    deleteResident(residentToDelete.id);
    setSelectedResidentIds((prev) => prev.filter((id) => id !== residentToDelete.id));
    setResidentToDelete(null);
  };

  const handleExecuteBulkDelete = () => {
    if (selectedResidentIds.length === 0) return;
    deleteResidents(selectedResidentIds);
    setSelectedResidentIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Barangay Residents Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official population database of personal records, addresses, and demographic sectors
          </p>
        </div>

        <button
          onClick={openRegisterModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Register New Resident
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resident by name, record ID (REC-...), or mobile #..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <select
              value={purokFilter}
              onChange={(e) => setPurokFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="All">All Puroks / Zones</option>
              {purokOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="All">All Demographic Sectors</option>
              <option value="Senior">Senior Citizens (60+)</option>
              <option value="PWD">Persons with Disability (PWD)</option>
              <option value="4Ps">4Ps Beneficiaries</option>
              <option value="Voters">Registered Voters Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar (Appears when 1 or more residents are selected) */}
      {selectedResidentIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              {selectedResidentIds.length}
            </span>
            <div>
              <p className="font-bold text-rose-950 text-sm">
                {selectedResidentIds.length} Resident{selectedResidentIds.length > 1 ? 's' : ''} Selected
              </p>
              <p className="text-[11px] text-rose-700">
                You can delete all selected data in a single action
              </p>
            </div>
            <button
              onClick={() => setSelectedResidentIds([])}
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
                Select All ({filteredResidents.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedResidentIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Residents Table */}
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
                    title={isAllSelected ? 'Deselect All' : 'Select All Residents in Table'}
                  />
                </th>
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Sex / Age</th>
                <th className="py-3.5 px-4">Address / Purok</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Demographics</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No resident records found. Click "Register New Resident" to add one.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => {
                  const birthYear = new Date(res.bday).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  const isSelected = selectedResidentIds.includes(res.id);

                  return (
                    <tr
                      key={res.id}
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
                          onChange={() => handleToggleRowSelect(res.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          title="Select row"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {res.recordNo}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {res.avatarUrl ? (
                            <img
                              src={res.avatarUrl}
                              alt={res.firstName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                              {res.firstName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {res.firstName} {res.middleName ? `${res.middleName[0]}.` : ''} {res.lastName} {res.suffix || ''}
                            </p>
                            <p className="text-[10px] text-slate-400">{res.occupation || 'Resident'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{res.sex}</span>
                        <p className="text-[10px] text-slate-400">
                          {age} yrs old • {res.civilStatus}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                          {res.address.purok}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">
                          {res.address.bldgNo}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700">{res.phone}</span>
                        {res.email && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {res.email}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {res.isSenior && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Senior
                            </span>
                          )}
                          {res.isPwd && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              PWD
                            </span>
                          )}
                          {res.is4Ps && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              4Ps
                            </span>
                          )}
                          {res.isVoter && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Voter
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Request document shortcut */}
                          {onOpenNewTransactionForResident && (
                            <button
                              onClick={() => onOpenNewTransactionForResident(res.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="Issue Document for this resident"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => setViewingResident(res)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="View Resident Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(res)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Resident Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setResidentToDelete(res)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Record"
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

      {/* MODAL: Register / Edit Resident */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingResident ? 'Update Resident Profile' : 'Register New Barangay Resident'}
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="mt-4 space-y-4 text-xs">
              {/* Personal Info Grid */}
              <div className="space-y-3">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  1. Personal Information (personalInfos)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="e.g. Juan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Mercado"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="e.g. Dela Cruz"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Suffix</label>
                    <input
                      type="text"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="Jr., III, Sr."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      value={bday}
                      onChange={(e) => {
                        setBday(e.target.value);
                        const birth = new Date(e.target.value);
                        const age = new Date().getFullYear() - birth.getFullYear();
                        if (age >= 60) setIsSenior(true);
                      }}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Sex *</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Civil Status *</label>
                    <select
                      value={civilStatus}
                      onChange={(e) => setCivilStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Blood Type</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Occupation</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Sales Associate / Driver"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0917-..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="resident@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Grid */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  2. Residential Address (addresses)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-medium text-slate-700 block mb-1">
                      House / Building / Street Address *
                    </label>
                    <input
                      type="text"
                      value={bldgNo}
                      onChange={(e) => setBldgNo(e.target.value)}
                      required
                      placeholder="e.g. #24 Mabini St., Block 5 Lot 2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Purok / Zone *</label>
                    <select
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {purokOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Demographics & Social Protection Flags */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  3. Demographics & Special Sector Protection
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isSenior}
                      onChange={(e) => setIsSenior(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">Senior Citizen (60+)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isPwd}
                      onChange={(e) => setIsPwd(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">PWD (Disability)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={is4Ps}
                      onChange={(e) => setIs4Ps(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">4Ps Beneficiary</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={isVoter}
                      onChange={(e) => setIsVoter(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">Registered Voter</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingResident ? 'Update Resident Record' : 'Save & Register Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Resident Details & Transaction History */}
      {viewingResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {viewingResident.avatarUrl ? (
                  <img
                    src={viewingResident.avatarUrl}
                    alt={viewingResident.firstName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                    {viewingResident.firstName[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {viewingResident.firstName} {viewingResident.middleName} {viewingResident.lastName} {viewingResident.suffix || ''}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Record ID: {viewingResident.recordNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingResident(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Address:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingResident.address.bldgNo}, {viewingResident.address.purok}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span className="font-semibold text-slate-800">{viewingResident.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Birthday / Age:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingResident.bday} ({new Date().getFullYear() - new Date(viewingResident.bday).getFullYear()} yrs old)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Civil Status:</span>
                  <span className="font-semibold text-slate-800">{viewingResident.civilStatus}</span>
                </div>
              </div>

              {/* Transactions by this resident */}
              <div>
                <p className="font-bold text-slate-800 mb-2">Document Request History</p>
                {(() => {
                  const residentTxs = transactions.filter((t) => t.personId === viewingResident.id);
                  if (residentTxs.length === 0) {
                    return (
                      <p className="text-slate-400 italic">No document requests recorded yet.</p>
                    );
                  }
                  return (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {residentTxs.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{t.documentType}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {t.transactionCode} • {t.purpose}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => setViewingResident(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Resident Delete Confirmation */}
      {residentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Delete Resident Record?</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {residentToDelete.recordNo}
                </p>
              </div>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">
                  {residentToDelete.firstName} {residentToDelete.middleName ? `${residentToDelete.middleName[0]}.` : ''} {residentToDelete.lastName} {residentToDelete.suffix || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purok / Address:</span>
                <span className="text-slate-800 truncate max-w-[200px]">
                  {residentToDelete.address.purok}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="text-slate-700 font-mono">{residentToDelete.phone}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this resident profile? Any past document requests associated with this resident will also be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResidentToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 cursor-pointer transition-all"
              >
                Yes, Delete Resident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Delete Confirmation Modal (Single action to delete multiple residents) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Delete {selectedResidentIds.length} Selected Residents?
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  Single Action Batch Deletion
                </p>
              </div>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                You are about to permanently delete the following <span className="font-bold text-slate-900">{selectedResidentIds.length} resident profile(s)</span> in a single action:
              </p>

              {/* Preview of residents to be deleted */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {selectedResidentIds.slice(0, 8).map((id) => {
                  const res = residents.find((r) => r.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <span className="font-bold text-slate-800">{res?.recordNo || id}</span>
                      <span className="text-slate-600 truncate max-w-[200px]">
                        {res ? `${res.firstName} ${res.lastName}` : 'Resident'} ({res?.address.purok.split(' - ')[0] || ''})
                      </span>
                    </div>
                  );
                })}
                {selectedResidentIds.length > 8 && (
                  <p className="text-slate-400 font-sans italic text-[10px] text-center pt-1">
                    ... and {selectedResidentIds.length - 8} more resident profile(s)
                  </p>
                )}
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <p className="leading-snug text-[11px]">
                  <span className="font-bold">Warning:</span> This operation cannot be undone. All selected resident records, personal addresses, and their corresponding transaction histories will be permanently deleted.
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
                <span>Yes, Delete All {selectedResidentIds.length} Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
