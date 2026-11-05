export type UserRole = 'admin' | 'clerk';

export interface User {
  id: string;
  personId: string;
  idNo: string;
  role: UserRole;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Address {
  id: string;
  personId: string;
  bldgNo: string;
  purok: string;
  barangay: string;
  cityMunicipal: string;
  province: string;
  country: string;
  status: 'Permanent' | 'Transient' | 'Current';
}

export interface ResidentPersonalInfo {
  id: string;
  recordNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  bday: string; // YYYY-MM-DD
  sex: 'Male' | 'Female';
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated';
  placeOfBirth: string;
  citizenship: string;
  occupation: string;
  phone: string;
  email?: string;
  isOfficial: boolean;
  avatarUrl?: string;
  
  // Demographics & Social Protection
  isPwd: boolean;
  pwdDetails?: string;
  isSenior: boolean;
  is4Ps: boolean;
  isVoter: boolean;
  bloodType?: string;
  
  // Relations
  address: Address;
  createdAt: string;
}

export type DocumentType =
  | 'Barangay Clearance'
  | 'Certificate of Indigency'
  | 'Certificate of Residency'
  | 'Barangay Business Clearance'
  | 'Certificate of Good Moral'
  | 'Certificate of Low Income'
  | 'First Time Jobseeker Certificate';

export type TransactionStatus =
  | 'Pending'
  | 'In Review'
  | 'Approved'
  | 'Ready for Pickup'
  | 'Released'
  | 'Rejected';

export interface Transaction {
  id: string;
  transactionCode: string;
  documentType: DocumentType;
  personId: string;
  status: TransactionStatus;
  validity: string;
  dateSchedule: string;
  issueDate?: string;
  signedBy: string;
  purpose: string;
  fee: number;
  
  // Document specific details
  cedulaNo?: string;
  cedulaDate?: string;
  cedulaPlace?: string;
  businessName?: string;
  businessNature?: string;
  monthlyIncome?: number;
  remarks?: string;
  rejectionReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentCode: string;
  transactionCode: string;
  personId: string;
  amount: number;
  paymentMethod: 'Cash' | 'GCash' | 'Maya' | 'Waived (Indigent)';
  orNumber: string; // Official Receipt #
  status: 'Paid' | 'Pending' | 'Waived';
  paymentDate: string;
  collectedBy: string;
}

export type OfficialPosition =
  | 'Punong Barangay'
  | 'Barangay Kagawad'
  | 'Barangay Secretary'
  | 'Barangay Treasurer'
  | 'SK Chairperson'
  | 'Chief Tanod'
  | 'Barangay Health Worker Head';

export interface Official {
  id: string;
  personId: string;
  position: OfficialPosition;
  committee: string;
  termStart: string;
  termEnd: string;
  order: number;
  status: 'Active' | 'On Leave' | 'Term Ended';
  customTitle?: string;
  bio?: string;
}

export interface BarangayInfo {
  name: string;
  district: string;
  cityMunicipal: string;
  province: string;
  region: string;
  contactNumber: string;
  email: string;
  officeHours: string;
  sealUrl: string;
  citySealUrl: string;
  punongBarangay: string;
}
