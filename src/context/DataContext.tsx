import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage, makeId } from "../lib/useLocalStorage";
import type { RentPayment, RentProperty, Transaction, Valuation } from "../lib/types";

interface DataContextValue {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => Transaction;
  deleteTransaction: (id: string) => void;

  valuations: Valuation[];
  addValuation: (v: Omit<Valuation, "id" | "createdAt">) => void;
  deleteValuation: (id: string) => void;

  rentProperties: RentProperty[];
  addRentProperty: (p: Omit<RentProperty, "id" | "createdAt">) => void;
  deleteRentProperty: (id: string) => void;

  rentPayments: RentPayment[];
  addRentPayment: (p: Omit<RentPayment, "id" | "addedToLedger">) => void;
  deleteRentPayment: (id: string) => void;
  markPaymentAddedToLedger: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("skre_transactions", []);
  const [valuations, setValuations] = useLocalStorage<Valuation[]>("skre_valuations", []);
  const [rentProperties, setRentProperties] = useLocalStorage<RentProperty[]>("skre_rent_properties", []);
  const [rentPayments, setRentPayments] = useLocalStorage<RentPayment[]>("skre_rent_payments", []);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...t, id: makeId() };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addValuation = (v: Omit<Valuation, "id" | "createdAt">) => {
    const newV: Valuation = { ...v, id: makeId(), createdAt: new Date().toISOString() };
    setValuations((prev) => [newV, ...prev]);
  };

  const deleteValuation = (id: string) => {
    setValuations((prev) => prev.filter((v) => v.id !== id));
  };

  const addRentProperty = (p: Omit<RentProperty, "id" | "createdAt">) => {
    const newP: RentProperty = { ...p, id: makeId(), createdAt: new Date().toISOString() };
    setRentProperties((prev) => [newP, ...prev]);
  };

  const deleteRentProperty = (id: string) => {
    setRentProperties((prev) => prev.filter((p) => p.id !== id));
    setRentPayments((prev) => prev.filter((p) => p.propertyId !== id));
  };

  const addRentPayment = (p: Omit<RentPayment, "id" | "addedToLedger">) => {
    const newP: RentPayment = { ...p, id: makeId(), addedToLedger: false };
    setRentPayments((prev) => [newP, ...prev]);
  };

  const deleteRentPayment = (id: string) => {
    setRentPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const markPaymentAddedToLedger = (id: string) => {
    setRentPayments((prev) => prev.map((p) => (p.id === id ? { ...p, addedToLedger: true } : p)));
  };

  const value = useMemo<DataContextValue>(
    () => ({
      transactions,
      addTransaction,
      deleteTransaction,
      valuations,
      addValuation,
      deleteValuation,
      rentProperties,
      addRentProperty,
      deleteRentProperty,
      rentPayments,
      addRentPayment,
      deleteRentPayment,
      markPaymentAddedToLedger,
    }),
    [transactions, valuations, rentProperties, rentPayments]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
