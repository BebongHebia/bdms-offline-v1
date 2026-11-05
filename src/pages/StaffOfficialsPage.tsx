import React, { useState } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Award,
  GitFork,
  Search,
  CheckCircle,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Official, OfficialPosition } from '../types';

interface StaffOfficialsPageProps {
  onNavigateToOrgChart: () => void;
}

export const StaffOfficialsPage: React.FC<StaffOfficialsPageProps> = ({ onNavigateToOrgChart }) => {
  const { officials, residents, currentUser, addOfficial, updateOfficial, deleteOfficial, getResidentById } = useBarangay();
  const isAdmin = currentUser?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);

  // Form states
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [position, setPosition] = useState<OfficialPosition>('Barangay Kagawad');
  const [committee, setCommittee] = useState('Committee on Peace and Order & Public Safety');
  const [termStart, setTermStart] = useState('2023-11-01');
  const [termEnd, setTermEnd] = useState('2026-11-01');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Term Ended'>('Active');
  const [bio, setBio] = useState('');

  const openAddModal = () => {
    setEditingOfficial(null);
    setSelectedPersonId(residents[0]?.id || '');
    setPosition('Barangay Kagawad');
    setCommittee('Committee on Peace and Order & Public Safety');
    setTermStart('2023-11-01');
    setTermEnd('2026-11-01');
    setStatus('Active');
    setBio('');
    setIsModalOpen(true);
  };

  const openEditModal = (off: Official) => {
    setEditingOfficial(off);
    setSelectedPersonId(off.personId);
    setPosition(off.position);
    setCommittee(off.committee);
    setTermStart(off.termStart);
    setTermEnd(off.termEnd);
    setStatus(off.status);
    setBio(off.bio || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOfficial) {
      updateOfficial(editingOfficial.id, {
        personId: selectedPersonId,
        position,
        committee,
        termStart,
        termEnd,
        status,
        bio,
      });
    } else {
      addOfficial({
        personId: selectedPersonId,
        position,
        committee,
        termStart,
        termEnd,
        order: officials.length + 1,
        status,
        bio,
      });
    }
    setIsModalOpen(false);
  };

  const filteredOfficials = officials.filter((off) => {
    const resident = getResidentById(off.personId);
    const fullName = resident ? `${resident.firstName} ${resident.lastName}`.toLowerCase() : '';
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      off.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.committee.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Barangay Staff & Officials Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized directory of elected barangay council members, appointed officers, and designated committee chairs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToOrgChart}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-emerald-700" />
            View Org Chart
          </button>

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Official
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search official by name, position, or designated committee..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Officials Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOfficials.map((off) => {
          const resident = getResidentById(off.personId);
          const fullName = resident
            ? `${resident.firstName} ${resident.middleName ? resident.middleName[0] + '.' : ''} ${resident.lastName} ${resident.suffix || ''}`
            : 'Unassigned Person';

          const isCaptain = off.position === 'Punong Barangay';

          return (
            <div
              key={off.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCaptain
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/30 to-white'
                  : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top header badge */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${
                      isCaptain
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {off.position}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      off.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {off.status}
                  </span>
                </div>

                {/* Profile photo and Name */}
                <div className="flex items-center gap-3 mb-4">
                  {resident?.avatarUrl ? (
                    <img
                      src={resident.avatarUrl}
                      alt={fullName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xl shrink-0">
                      {fullName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {fullName}
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      {off.position}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Term: {new Date(off.termStart).getFullYear()} - {new Date(off.termEnd).getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Committee Assignment */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Designated Committee:
                  </span>
                  <p className="font-semibold text-slate-800">{off.committee}</p>
                </div>

                {off.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic mb-3">
                    "{off.bio}"
                  </p>
                )}

                {/* Contact info */}
                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{resident?.phone || 'No direct phone'}</span>
                  </div>
                  {resident?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{resident.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons (Admin only) */}
              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(off)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {!isCaptain && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${fullName} from official council roster?`)) {
                          deleteOfficial(off.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Add / Edit Official */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingOfficial ? 'Edit Official Information' : 'Add Barangay Official'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Person (Resident) *</label>
                <select
                  value={selectedPersonId}
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.firstName} {r.lastName} ({r.occupation || 'Resident'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Position *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as OfficialPosition)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Punong Barangay">Punong Barangay (Captain)</option>
                  <option value="Barangay Secretary">Barangay Secretary</option>
                  <option value="Barangay Treasurer">Barangay Treasurer</option>
                  <option value="Barangay Kagawad">Barangay Kagawad (Councilor)</option>
                  <option value="SK Chairperson">SK Chairperson</option>
                  <option value="Chief Tanod">Chief Tanod (Executive Officer)</option>
                  <option value="Barangay Health Worker Head">Barangay Health Worker Head</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Designated Committee / Department *
                </label>
                <input
                  type="text"
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                  placeholder="e.g. Committee on Peace and Order, Ways and Means"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Term Start</label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Term End</label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Council Bio / Notes</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Public service record, advocacy, or focal responsibilities..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Save Official
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
