import React, { useRef } from 'react';
import { Transaction, ResidentPersonalInfo, BarangayInfo } from '../types';
import { Printer, X, ShieldCheck, Download, Award, CheckCircle } from 'lucide-react';

interface PrintCertificateModalProps {
  transaction: Transaction;
  resident: ResidentPersonalInfo;
  barangayInfo: BarangayInfo;
  onClose: () => void;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  transaction,
  resident,
  barangayInfo,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();

  // Helper for ordinals
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getAge = (bday: string) => {
    if (!bday) return 30;
    const birth = new Date(bday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const residentAge = getAge(resident.bday);
  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName[0] + '.' : ''} ${resident.lastName} ${resident.suffix || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Top Floating Action Bar (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg shadow-lg font-medium text-sm transition-all cursor-pointer hover:shadow-emerald-900/20"
        >
          <Printer className="w-4 h-4" />
          Print Official Document
        </button>
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-lg shadow-lg transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Document Paper Sheet */}
      <div
        ref={printRef}
        id="printable-certificate"
        className="bg-white text-slate-900 w-full max-w-3xl min-h-[1050px] shadow-2xl rounded-sm p-10 sm:p-14 relative my-auto print:shadow-none print:m-0 print:w-full print:max-w-none print:min-h-screen print:p-8 border border-slate-200 print:border-none"
        style={{ fontFamily: "'Tinos', Georgia, serif" }}
      >
        {/* Decorative Government Certificate Border */}
        <div className="absolute inset-4 sm:inset-6 border-2 border-emerald-900/80 pointer-events-none" />
        <div className="absolute inset-5 sm:inset-7 border border-amber-600/50 pointer-events-none" />

        {/* Certificate Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <div className="w-96 h-96 rounded-full border-8 border-emerald-900 flex items-center justify-center font-bold text-center text-4xl uppercase p-8">
            Republic of the Philippines
            <br />
            {barangayInfo.name}
          </div>
        </div>

        {/* Header Section */}
        <div className="relative text-center border-b-2 border-emerald-900/60 pb-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            {/* Left Seal: Barangay Seal */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-emerald-800 p-1 flex items-center justify-center bg-emerald-50/50 shadow-inner">
              <div className="w-full h-full rounded-full bg-emerald-800 text-amber-300 flex flex-col items-center justify-center text-center p-1 font-sans">
                <Award className="w-8 h-8 mb-0.5 text-amber-300" />
                <span className="text-[8px] uppercase font-bold tracking-tight leading-tight">Barangay Seal</span>
              </div>
            </div>

            {/* Central Typography Header */}
            <div className="flex-1 px-4">
              <p className="text-xs uppercase tracking-widest font-sans text-slate-700 font-semibold">
                Republic of the Philippines
              </p>
              <p className="text-xs uppercase tracking-wider font-sans text-slate-700">
                {barangayInfo.province} • {barangayInfo.cityMunicipal}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-emerald-950 font-serif mt-1">
                {barangayInfo.name}
              </h1>
              <p className="text-xs font-serif italic text-emerald-900 mt-0.5">
                Office of the Punong Barangay
              </p>
              <p className="text-[10px] font-sans text-slate-500 mt-1">
                Tel: {barangayInfo.contactNumber} | Email: {barangayInfo.email}
              </p>
            </div>

            {/* Right Seal: City / Municipal Seal */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-700 p-1 flex items-center justify-center bg-amber-50/50 shadow-inner">
              <div className="w-full h-full rounded-full bg-amber-700 text-white flex flex-col items-center justify-center text-center p-1 font-sans">
                <ShieldCheck className="w-8 h-8 mb-0.5 text-amber-200" />
                <span className="text-[8px] uppercase font-bold tracking-tight leading-tight">{barangayInfo.cityMunicipal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Title Banner */}
        <div className="text-center my-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-emerald-950 border-b-2 border-emerald-800 inline-block px-8 pb-1">
            {transaction.documentType}
          </h2>
          <p className="text-xs font-sans text-slate-500 uppercase tracking-widest mt-2">
            Reference No.: <span className="font-mono font-bold text-slate-800">{transaction.transactionCode}</span>
          </p>
        </div>

        {/* To Whom It May Concern Salutation */}
        <div className="my-6">
          <p className="text-base sm:text-lg font-bold tracking-wide text-slate-900">
            TO WHOM IT MAY CONCERN:
          </p>
        </div>

        {/* Document Body depending on DocumentType */}
        <div className="text-justify text-base leading-relaxed space-y-5 text-slate-900">
          {transaction.documentType === 'Barangay Clearance' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span>,{' '}
                <span className="font-semibold">{residentAge} years old</span>,{' '}
                <span className="font-semibold">{resident.civilStatus}</span>, a Filipino citizen, is a bonafide resident of{' '}
                <span className="font-semibold">{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}, {barangayInfo.cityMunicipal}</span>.
              </p>
              <p className="indent-10">
                Based on the records available in this office, the aforementioned individual is known to be of{' '}
                <span className="font-bold">good moral character</span>, a law-abiding citizen, and has{' '}
                <span className="font-bold">NO DEROGATORY RECORD</span> nor any pending complaint or criminal charge filed against him/her before the Lupong Tagapamayapa or Barangay Council.
              </p>
              <p className="indent-10">
                This Barangay Clearance is being issued upon the request of the interested party for the purpose of:{' '}
                <span className="font-bold underline uppercase">{transaction.purpose || 'LOCAL EMPLOYMENT'}</span>.
              </p>
            </>
          )}

          {transaction.documentType === 'Certificate of Indigency' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span>,{' '}
                <span className="font-semibold">{residentAge} years old</span>,{' '}
                <span className="font-semibold">{resident.civilStatus}</span>, is a permanent resident of{' '}
                <span className="font-semibold">{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}, {barangayInfo.cityMunicipal}</span>.
              </p>
              <p className="indent-10">
                Further certifies that the above-named resident and his/her immediate family belong to the{' '}
                <span className="font-bold uppercase text-emerald-950">Indigent and Low-Income Sector</span> of this barangay, having no steady or sufficient source of income to defray required costs.
              </p>
              <p className="indent-10">
                This certification is issued upon the request of the bearer for the purpose of:{' '}
                <span className="font-bold underline uppercase">{transaction.purpose || 'FINANCIAL / MEDICAL ASSISTANCE'}</span> from DSWD, PCSO, or other charitable agencies.
              </p>
            </>
          )}

          {transaction.documentType === 'Certificate of Residency' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span>,{' '}
                of legal age, Filipino, is an authorized and documented resident of{' '}
                <span className="font-semibold">{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}, {barangayInfo.cityMunicipal}</span>.
              </p>
              <p className="indent-10">
                Records show that the subject resident has been residing continuously in this barangay in good standing and has actively complied with community regulations.
              </p>
              <p className="indent-10">
                This certification is issued upon his/her request to serve for:{' '}
                <span className="font-bold underline uppercase">{transaction.purpose || 'PROOF OF RESIDENCY'}</span>.
              </p>
            </>
          )}

          {transaction.documentType === 'Barangay Business Clearance' && (
            <>
              <p className="indent-10">
                This is to certify that the business establishment described hereunder has been granted clearance to operate within the territorial jurisdiction of Barangay San Isidro:
              </p>
              <div className="my-3 pl-8 pr-4 py-3 bg-slate-50 border-l-4 border-emerald-800 text-sm font-sans space-y-1">
                <p><span className="font-bold text-slate-700">Business / Trade Name:</span> <span className="uppercase font-bold text-emerald-950">{transaction.businessName || "Registered Enterprise"}</span></p>
                <p><span className="font-bold text-slate-700">Business Nature / Line:</span> <span className="uppercase font-semibold">{transaction.businessNature || "General Commercial"}</span></p>
                <p><span className="font-bold text-slate-700">Owner / Proprietor:</span> <span className="uppercase font-semibold">{fullName}</span></p>
                <p><span className="font-bold text-slate-700">Location:</span> <span>{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}</span></p>
              </div>
              <p className="indent-10">
                This clearance is issued in accordance with the Local Government Code of 1991 (RA 7160) upon compliance with existing barangay tax ordinances, sanitary guidelines, and safety regulations.
              </p>
            </>
          )}

          {transaction.documentType === 'First Time Jobseeker Certificate' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span>, a resident of{' '}
                <span className="font-semibold">{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}</span>, is a certified{' '}
                <span className="font-bold uppercase">First Time Jobseeker</span> seeking employment in the Philippines.
              </p>
              <p className="indent-10">
                Pursuant to <span className="font-bold">Republic Act No. 11261</span> (First Time Jobseekers Assistance Act), government agencies and instrumentalities are hereby requested not to collect any fees or charges from the bearer for documents and clearances required for employment.
              </p>
              <p className="indent-10">
                Issued for the purpose of: <span className="font-bold underline uppercase">{transaction.purpose || 'PRE-EMPLOYMENT REQUIREMENTS'}</span>.
              </p>
            </>
          )}

          {transaction.documentType === 'Certificate of Low Income' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span>, resident of{' '}
                <span className="font-semibold">{resident.address.bldgNo}, {resident.address.purok}, {barangayInfo.name}</span>, has a declared gross monthly household income not exceeding{' '}
                <span className="font-bold">PHP {transaction.monthlyIncome?.toLocaleString() || '7,000.00'}</span>.
              </p>
              <p className="indent-10">
                This certification is issued upon the request of the applicant for:{' '}
                <span className="font-bold underline uppercase">{transaction.purpose || 'EDUCATIONAL / SCHOLARSHIP SUBSIDY'}</span>.
              </p>
            </>
          )}

          {transaction.documentType === 'Certificate of Good Moral' && (
            <>
              <p className="indent-10">
                This is to certify that <span className="font-bold underline uppercase">{fullName}</span> is personally known to this office to be a person of good moral character, disciplined, and with exemplary standing in our community.
              </p>
              <p className="indent-10">
                Issued for the purpose of: <span className="font-bold underline uppercase">{transaction.purpose || 'ACADEMIC / EMPLOYMENT REQUIREMENT'}</span>.
              </p>
            </>
          )}

          {/* Date of Issue paragraph */}
          <p className="indent-10 mt-6">
            IN WITNESS WHEREOF, I have hereunto set my hand and affixed the official seal of this Barangay this{' '}
            <span className="font-bold underline">{getOrdinal(day)}</span> day of{' '}
            <span className="font-bold underline">{month}</span>, <span className="font-bold underline">{year}</span> at{' '}
            {barangayInfo.name}, {barangayInfo.cityMunicipal}, Philippines.
          </p>
        </div>

        {/* Thumbmark and Photo Boxes (Standard in Philippine Barangay Clearances) */}
        {transaction.documentType === 'Barangay Clearance' && (
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xs font-sans text-xs">
            <div className="border border-dashed border-slate-400 h-28 rounded flex flex-col items-center justify-end p-2 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Applicant 2x2 Photo</span>
            </div>
            <div className="border border-dashed border-slate-400 h-28 rounded flex flex-col items-center justify-end p-2 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Right Thumbmark</span>
            </div>
          </div>
        )}

        {/* Signatures Section */}
        <div className="mt-14 pt-4 flex justify-between items-end">
          {/* Applicant / Duty Kagawad */}
          <div className="text-left font-sans text-xs">
            <p className="text-slate-500 uppercase text-[10px] tracking-wider mb-8">Attested By (Duty Kagawad):</p>
            <div className="w-52 border-b border-slate-800 text-center pb-1">
              <span className="font-bold text-slate-900 text-sm">Hon. Elena G. Soriano</span>
            </div>
            <p className="text-slate-600 text-center mt-1">Barangay Kagawad on Duty</p>
          </div>

          {/* Punong Barangay Official Signature */}
          <div className="text-center font-sans">
            <div className="mb-2 inline-block">
              <div className="w-60 border-b-2 border-slate-900 pb-1">
                <p className="font-serif font-bold text-base text-slate-950 uppercase tracking-wide">
                  {barangayInfo.punongBarangay}
                </p>
              </div>
              <p className="text-xs uppercase font-semibold text-emerald-950 mt-1">
                Punong Barangay (Barangay Captain)
              </p>
            </div>
          </div>
        </div>

        {/* Official Metadata / Footer Section */}
        <div className="mt-12 pt-4 border-t border-slate-300 font-sans text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
          <div>
            <p>
              <span className="font-semibold text-slate-700">Cedula / CTC No.:</span>{' '}
              {transaction.cedulaNo || 'CTC-2026-N/A'}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Issued On:</span>{' '}
              {transaction.cedulaDate || `${month} ${day}, ${year}`}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Issued At:</span>{' '}
              {transaction.cedulaPlace || barangayInfo.cityMunicipal}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 border border-slate-400 rounded-sm mx-auto flex items-center justify-center p-1 bg-slate-50">
              <div className="text-[7px] text-slate-400 font-mono text-center">
                [SECURE QR]
                <br />
                {transaction.transactionCode}
              </div>
            </div>
            <span className="text-[8px] text-slate-400 mt-1 block">Scan to verify authenticity</span>
          </div>

          <div className="text-right">
            <p>
              <span className="font-semibold text-slate-700">Official Receipt No.:</span>{' '}
              {transaction.fee === 0 ? 'FEE WAIVED' : 'OR-2026-9901'}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Barangay Fee:</span>{' '}
              {transaction.fee === 0 ? 'FREE' : `₱${transaction.fee}.00`}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Validity:</span> {transaction.validity}
            </p>
            <p className="italic text-emerald-800 font-medium">Valid only with official dry seal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
