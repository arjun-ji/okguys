import type { LandUnit } from "./units";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type: TransactionType;
  category: string;
  amount: number;
  note?: string;
}

export interface Valuation {
  id: string;
  createdAt: string;
  propertyName: string;
  landSize: number;
  landUnit: LandUnit;
  landRate: number;
  landValue: number;
  builtUpArea: number;
  constructionRate: number;
  buildingAge: number;
  depreciationRate: number;
  buildingValue: number;
  totalValue: number;
  purchasePrice: number;
  extraCosts: number;
  sellingPrice: number;
  netResult: number;
  returnPct: number;
}

export type RentPaymentStatus = "paid" | "partial" | "pending";

export interface RentProperty {
  id: string;
  propertyName: string;
  tenantName: string;
  tenantContact?: string;
  monthlyRent: number;
  dueDay: number;
  createdAt: string;
}

export interface RentPayment {
  id: string;
  propertyId: string;
  month: string; // yyyy-mm
  amountPaid: number;
  datePaid: string;
  status: RentPaymentStatus;
  addedToLedger: boolean;
}
