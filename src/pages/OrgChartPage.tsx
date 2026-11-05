import React, { useRef } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  GitFork,
  Printer,
  Award,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { Official } from '../types';

export const OrgChartPage: React.FC = () => {
  const { officials, barangayInfo, getResidentById } = useBarangay();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Group officials by hierarchical tiers
  const captain = officials.find((o) => o.position === 'Punong Barangay');
  const secretary = officials.find((o) => o.position === 'Barangay Secretary');
  const treasurer = officials.find((o) => o.position === 'Barangay Treasurer');
  const kagawads = officials.filter((o) => o.position === 'Barangay Kagawad');
  const skChair = officials.find((o) => o.position === 'SK Chairperson');
  const tanodOrOthers = officials.filter(
    (o) =>
      o.position !== 'Punong Barangay' &&
      o.position !== 'Barangay Secretary' &&
      o.position !== 'Barangay Treasurer' &&
      o.position !== 'Barangay Kagawad' &&
      o.position !== 'SK Chairperson'
  );

  const renderOfficialCard = (off?: Official, size: 'large' | 'medium' | 'small' = 'medium') => {
    if (!off) return null;
    const resident = getResidentById(off.personId);
    const fullName = resident
      ? `${resident.firstName} ${resident.middleName ? resident.middleName[0] + '.' : ''} ${resident.lastName} ${resident.suffix || ''}`
      : 'Elected Official';

    const isCaptain = off.position === 'Punong Barangay';

    return (
      <div
        className={`bg-white rounded-2xl border transition-all shadow-xs text-center flex flex-col items-center relative overflow-hidden group ${
          isCaptain
            ? 'w-80 p-5 border-emerald-600 ring-4 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/40 to-white'
            : size === 'medium'
            ? 'w-64 p-4 border-slate-200/90 hover:border-emerald-400 hover:shadow-md'
            : 'w-56 p-3 border-slate-200 hover:border-emerald-300'
        }`}
      >
        {/* Ribbon for top tier */}
        {isCaptain && (
          <div className="absolute top-0 right-0 left-0 bg-emerald-800 text-amber-300 text-[10px] font-bold uppercase tracking-widest py-0.5">
            Barangay Chief Executive
          </div>
        )}

        <div className={`mt-1 mb-2 ${isCaptain ? 'pt-2' : ''}`}>
          {resident?.avatarUrl ? (
            <img
              src={resident.avatarUrl}
              alt={fullName}
              className={`rounded-2xl object-cover mx-auto ring-2 ${
                isCaptain ? 'w-20 h-20 ring-emerald-600' : 'w-14 h-14 ring-slate-200'
              }`}
            />
          ) : (
            <div
              className={`rounded-2xl bg-emerald-100 text-emerald-800 font-bold mx-auto flex items-center justify-center ${
                isCaptain ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg'
              }`}
            >
              {fullName[0]}
            </div>
          )}
        </div>

        <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-emerald-800">
          {fullName}
        </h4>
        <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-tight block mt-0.5">
          {off.position}
        </span>
        <span className="text-[10px] text-slate-500 font-medium block mt-1 line-clamp-2 px-1">
          {off.committee}
        </span>

        {resident?.phone && (
          <div className="mt-2 pt-2 border-t border-slate-100 w-full text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{resident.phone}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Barangay Organizational Chart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official hierarchical governance chart for {barangayInfo.name}, {barangayInfo.cityMunicipal}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Official Chart
        </button>
      </div>

      {/* Main Chart Canvas Paper */}
      <div
        ref={printRef}
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none min-h-[850px] overflow-x-auto"
      >
        {/* Printable Official Letterhead */}
        <div className="text-center pb-6 mb-8 border-b-2 border-emerald-900/60 max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Republic of the Philippines • {barangayInfo.province} • {barangayInfo.cityMunicipal}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-emerald-950 font-serif mt-1">
            {barangayInfo.name}
          </h2>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 mt-1">
            Sangguniang Barangay Organizational Structure
          </p>
          <p className="text-xs text-slate-500">Tenure: 2023 - 2026</p>
        </div>

        {/* Hierarchical Tree Container */}
        <div className="flex flex-col items-center space-y-8 min-w-[760px] pb-8">
          {/* Level 1: Punong Barangay */}
          <div className="flex flex-col items-center relative">
            {renderOfficialCard(captain, 'large')}
            {/* Downward line */}
            <div className="w-0.5 h-8 bg-emerald-700 mt-0" />
          </div>

          {/* Level 2: Executive Staff (Secretary & Treasurer) */}
          <div className="flex flex-col items-center relative w-full">
            <div className="flex justify-center gap-12 sm:gap-24 relative">
              {/* Connector line between secretary and treasurer */}
              <div className="absolute -top-4 left-1/4 right-1/4 h-4 border-t-2 border-x-2 border-emerald-700" />
              <div className="flex flex-col items-center">
                {renderOfficialCard(secretary, 'medium')}
              </div>
              <div className="flex flex-col items-center">
                {renderOfficialCard(treasurer, 'medium')}
              </div>
            </div>
            {/* Center spine downward */}
            <div className="w-0.5 h-8 bg-emerald-700 mt-0" />
          </div>

          {/* Level 3: Sangguniang Barangay Kagawads Header & Grid */}
          <div className="w-full flex flex-col items-center">
            <div className="px-4 py-1.5 bg-emerald-800 text-amber-200 text-xs font-bold uppercase rounded-full shadow-xs tracking-wider mb-6">
              Barangay Kagawads (Councilors & Committee Chairs)
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl">
              {kagawads.map((k) => (
                <div key={k.id}>{renderOfficialCard(k, 'medium')}</div>
              ))}
            </div>
          </div>

          {/* Level 4: SK Chairperson & Youth Council */}
          <div className="w-full flex flex-col items-center pt-4 border-t border-dashed border-slate-200">
            <div className="px-4 py-1 bg-teal-800 text-teal-100 text-xs font-bold uppercase rounded-full tracking-wider mb-5">
              Sangguniang Kabataan (Youth Council)
            </div>
            <div>{renderOfficialCard(skChair, 'medium')}</div>
          </div>

          {/* Level 5: Tanod & Health Workers */}
          {tanodOrOthers.length > 0 && (
            <div className="w-full flex flex-col items-center pt-4 border-t border-dashed border-slate-200">
              <div className="px-4 py-1 bg-slate-800 text-slate-100 text-xs font-bold uppercase rounded-full tracking-wider mb-5">
                Appointed Auxiliary & Field Officers
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {tanodOrOthers.map((o) => (
                  <div key={o.id}>{renderOfficialCard(o, 'small')}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attestation footer for official prints */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-semibold">Certified True and Correct:</p>
            <p className="mt-8 font-bold text-slate-900 underline uppercase">
              Rosa M. Villanueva
            </p>
            <p className="text-[11px] text-slate-500">Barangay Secretary</p>
          </div>

          <div className="text-right">
            <p className="font-semibold">Approved by:</p>
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
