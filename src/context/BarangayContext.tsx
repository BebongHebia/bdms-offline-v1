import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  ResidentPersonalInfo,
  Transaction,
  Payment,
  Official,
  BarangayInfo,
  TransactionStatus,
  DocumentType,
} from '../types';
import {
  initialBarangayInfo,
  initialUsers,
  initialResidents,
  initialOfficials,
  initialTransactions,
  initialPayments,
} from '../data/mockData';

interface BarangayContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  barangayInfo: BarangayInfo;
  updateBarangayInfo: (info: Partial<BarangayInfo>) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (email: string, newPass: string) => boolean;

  // Residents (personalInfos + addresses)
  residents: ResidentPersonalInfo[];
  addResident: (resident: Omit<ResidentPersonalInfo, 'id' | 'createdAt' | 'recordNo'>) => ResidentPersonalInfo;
  updateResident: (id: string, updates: Partial<ResidentPersonalInfo>) => void;
  deleteResident: (id: string) => void;
  getResidentById: (id: string) => ResidentPersonalInfo | undefined;

  // Transactions
  transactions: Transaction[];
  createTransaction: (data: {
    personId: string;
    documentType: DocumentType;
    purpose: string;
    dateSchedule: string;
    fee: number;
    cedulaNo?: string;
    cedulaDate?: string;
    cedulaPlace?: string;
    businessName?: string;
    businessNature?: string;
    monthlyIncome?: number;
    remarks?: string;
  }) => Transaction;
  updateTransactionStatus: (
    id: string,
    status: TransactionStatus,
    extra?: { rejectionReason?: string; remarks?: string; issueDate?: string }
  ) => void;
  deleteTransaction: (id: string) => void;

  // Payments
  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentCode'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;

  // Staff and Officials
  officials: Official[];
  addOfficial: (official: Omit<Official, 'id'>) => void;
  updateOfficial: (id: string, updates: Partial<Official>) => void;
  deleteOfficial: (id: string) => void;
  reorderOfficials: (newOrder: Official[]) => void;

  // Data management
  resetToDefaultData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonData: string) => boolean;
}

const STORAGE_KEYS = {
  USER: 'bdms_current_user',
  BARANGAY: 'bdms_barangay_info',
  USERS: 'bdms_users',
  RESIDENTS: 'bdms_residents',
  TRANSACTIONS: 'bdms_transactions',
  PAYMENTS: 'bdms_payments',
  OFFICIALS: 'bdms_officials',
};

const BarangayContext = createContext<BarangayContextType | undefined>(undefined);

export const BarangayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user (defaults to Admin for instant convenient access, or clerk)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers[0];
      }
    }
    return initialUsers[0]; // Hon. Danilo Santos (Admin)
  });

  const [barangayInfo, setBarangayInfo] = useState<BarangayInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BARANGAY);
    return saved ? JSON.parse(saved) : initialBarangayInfo;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [residents, setResidents] = useState<ResidentPersonalInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    return saved ? JSON.parse(saved) : initialResidents;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [officials, setOfficials] = useState<Official[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFICIALS);
    return saved ? JSON.parse(saved) : initialOfficials;
  });

  // Sync to local storage for offline capability
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BARANGAY, JSON.stringify(barangayInfo));
  }, [barangayInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(officials));
  }, [officials]);

  // Auth
  const login = (username: string, pass: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const found = users.find(
      (u) => u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser
    );
    if (!found) {
      return { success: false, message: 'Invalid username or email address.' };
    }
    if (found.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated. Contact Administrator.' };
    }
    // Allow demo convenience: standard password123 or admin/clerk shortcuts
    if (found.password && found.password !== pass && pass !== 'password123' && pass !== 'admin' && pass !== 'clerk') {
      return { success: false, message: 'Incorrect password entered.' };
    }
    const updated = { ...found, lastLogin: new Date().toISOString() };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === found.id ? updated : u)));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetUserPassword = (email: string, newPass: string) => {
    const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!target) return false;
    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, password: newPass } : u))
    );
    return true;
  };

  const updateBarangayInfo = (info: Partial<BarangayInfo>) => {
    setBarangayInfo((prev) => ({ ...prev, ...info }));
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const id = `usr-${Date.now().toString().slice(-4)}`;
    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Residents Management
  const addResident = (resData: Omit<ResidentPersonalInfo, 'id' | 'createdAt' | 'recordNo'>) => {
    const count = residents.length + 1;
    const year = new Date().getFullYear();
    const recordNo = `REC-${year}-${count.toString().padStart(4, '0')}`;
    const id = `res-${Date.now().toString().slice(-4)}`;
    const newResident: ResidentPersonalInfo = {
      ...resData,
      id,
      recordNo,
      createdAt: new Date().toISOString(),
    };
    setResidents((prev) => [newResident, ...prev]);
    return newResident;
  };

  const updateResident = (id: string, updates: Partial<ResidentPersonalInfo>) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteResident = (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
  };

  const getResidentById = (id: string) => {
    return residents.find((r) => r.id === id);
  };

  // Transactions
  const createTransaction = (data: {
    personId: string;
    documentType: DocumentType;
    purpose: string;
    dateSchedule: string;
    fee: number;
    cedulaNo?: string;
    cedulaDate?: string;
    cedulaPlace?: string;
    businessName?: string;
    businessNature?: string;
    monthlyIncome?: number;
    remarks?: string;
  }) => {
    const nextNum = transactions.length + 101;
    const year = new Date().getFullYear();
    const transactionCode = `TXN-${year}-${nextNum.toString().padStart(4, '0')}`;
    const id = `txn-${Date.now()}`;
    const newTxn: Transaction = {
      id,
      transactionCode,
      documentType: data.documentType,
      personId: data.personId,
      status: 'Pending',
      validity: data.documentType === 'Barangay Business Clearance' ? '1 Year' : '6 Months',
      dateSchedule: data.dateSchedule,
      signedBy: barangayInfo.punongBarangay,
      purpose: data.purpose,
      fee: data.fee,
      cedulaNo: data.cedulaNo,
      cedulaDate: data.cedulaDate,
      cedulaPlace: data.cedulaPlace,
      businessName: data.businessName,
      businessNature: data.businessNature,
      monthlyIncome: data.monthlyIncome,
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Create payment entry automatically
    const payCode = `PAY-${year}-${(payments.length + 1).toString().padStart(4, '0')}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentCode: payCode,
      transactionCode,
      personId: data.personId,
      amount: data.fee,
      paymentMethod: data.fee === 0 ? 'Waived (Indigent)' : 'Cash',
      orNumber: data.fee === 0 ? `OR-EXEMPT-${nextNum}` : `OR-${year}-${nextNum + 5000}`,
      status: data.fee === 0 ? 'Waived' : 'Pending',
      paymentDate: new Date().toISOString(),
      collectedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'System Office',
    };
    setPayments((prev) => [newPayment, ...prev]);

    return newTxn;
  };

  const updateTransactionStatus = (
    id: string,
    status: TransactionStatus,
    extra?: { rejectionReason?: string; remarks?: string; issueDate?: string }
  ) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated: Transaction = {
            ...t,
            status,
            updatedAt: new Date().toISOString(),
          };
          if (extra?.rejectionReason) updated.rejectionReason = extra.rejectionReason;
          if (extra?.remarks) updated.remarks = extra.remarks;
          if (status === 'Released' || status === 'Approved') {
            updated.issueDate = extra?.issueDate || t.issueDate || new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Payments
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'paymentCode'>) => {
    const year = new Date().getFullYear();
    const count = payments.length + 1;
    const paymentCode = `PAY-${year}-${count.toString().padStart(4, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentCode,
    };
    setPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Officials
  const addOfficial = (officialData: Omit<Official, 'id'>) => {
    const newOfficial: Official = {
      ...officialData,
      id: `off-${Date.now()}`,
    };
    setOfficials((prev) => [...prev, newOfficial]);
  };

  const updateOfficial = (id: string, updates: Partial<Official>) => {
    setOfficials((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOfficial = (id: string) => {
    setOfficials((prev) => prev.filter((o) => o.id !== id));
  };

  const reorderOfficials = (newOrder: Official[]) => {
    setOfficials(newOrder);
  };

  // Data Reset & Backup
  const resetToDefaultData = () => {
    localStorage.clear();
    setBarangayInfo(initialBarangayInfo);
    setUsers(initialUsers);
    setResidents(initialResidents);
    setTransactions(initialTransactions);
    setPayments(initialPayments);
    setOfficials(initialOfficials);
    setCurrentUser(initialUsers[0]);
  };

  const exportDatabaseJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      barangayInfo,
      users,
      residents,
      transactions,
      payments,
      officials,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Barangay_San_Isidro_DB_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.barangayInfo) setBarangayInfo(parsed.barangayInfo);
      if (Array.isArray(parsed.users)) setUsers(parsed.users);
      if (Array.isArray(parsed.residents)) setResidents(parsed.residents);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
      if (Array.isArray(parsed.officials)) setOfficials(parsed.officials);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <BarangayContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        barangayInfo,
        updateBarangayInfo,
        users,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        residents,
        addResident,
        updateResident,
        deleteResident,
        getResidentById,
        transactions,
        createTransaction,
        updateTransactionStatus,
        deleteTransaction,
        payments,
        recordPayment,
        updatePayment,
        officials,
        addOfficial,
        updateOfficial,
        deleteOfficial,
        reorderOfficials,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </BarangayContext.Provider>
  );
};

export const useBarangay = () => {
  const context = useContext(BarangayContext);
  if (!context) {
    throw new Error('useBarangay must be used within a BarangayProvider');
  }
  return context;
};
