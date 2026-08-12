import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useData } from "../context/DataContext";
import { Card, PageHeader, SectionTitle, Field, Input, Select, Button, Badge } from "../components/ui";
import { formatCurrency } from "../lib/format";
import type { RentPaymentStatus } from "../lib/types";
import { Plus, Trash2, BookPlus, CheckCircle2, Wallet, AlertCircle } from "lucide-react";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export default function RentTracker() {
  const { t } = useLanguage();
  const {
    rentProperties,
    addRentProperty,
    deleteRentProperty,
    rentPayments,
    addRentPayment,
    deleteRentPayment,
    markPaymentAddedToLedger,
    addTransaction,
  } = useData();

  const [propertyName, setPropertyName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [dueDay, setDueDay] = useState<number>(5);

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [month, setMonth] = useState(currentMonthKey());
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [datePaid, setDatePaid] = useState(todayISO());
  const [status, setStatus] = useState<RentPaymentStatus>("paid");

  const handleAddProperty = () => {
    if (!propertyName || !tenantName || !monthlyRent) return;
    addRentProperty({ propertyName, tenantName, tenantContact: tenantContact || undefined, monthlyRent, dueDay });
    setPropertyName("");
    setTenantName("");
    setTenantContact("");
    setMonthlyRent(0);
    setDueDay(5);
  };

  const handleAddPayment = () => {
    if (!selectedProperty || !amountPaid) return;
    addRentPayment({ propertyId: selectedProperty, month, amountPaid, datePaid, status });
    setAmountPaid(0);
  };

  const handleAddToLedger = (paymentId: string, amount: number, propName: string, monthLabel: string) => {
    addTransaction({
      type: "income",
      category: "rentIncome",
      date: todayISO(),
      amount,
      note: `${propName} - ${monthLabel}`,
    });
    markPaymentAddedToLedger(paymentId);
  };

  const propertyMap = useMemo(() => new Map(rentProperties.map((p) => [p.id, p])), [rentProperties]);

  const totals = useMemo(() => {
    const totalCollected = rentPayments.reduce((s, p) => s + p.amountPaid, 0);
    const thisMonth = currentMonthKey();
    let outstanding = 0;
    for (const prop of rentProperties) {
      const paidThisMonth = rentPayments
        .filter((p) => p.propertyId === prop.id && p.month === thisMonth)
        .reduce((s, p) => s + p.amountPaid, 0);
      outstanding += Math.max(prop.monthlyRent - paidThisMonth, 0);
    }
    return { totalCollected, outstanding };
  }, [rentPayments, rentProperties]);

  const statusTone: Record<RentPaymentStatus, "positive" | "accent" | "negative"> = {
    paid: "positive",
    partial: "accent",
    pending: "negative",
  };

  return (
    <div>
      <PageHeader title={t.rent.title} subtitle={t.rent.subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.rent.totalCollected}</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totals.totalCollected)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.rent.outstanding}</p>
              <p className="text-xl font-bold text-rose-700">{formatCurrency(totals.outstanding)}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <SectionTitle>{t.rent.addProperty}</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label={t.rent.propertyName}>
            <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
          </Field>
          <Field label={t.rent.tenantName}>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
          </Field>
          <Field label={t.rent.tenantContact}>
            <Input value={tenantContact} onChange={(e) => setTenantContact(e.target.value)} />
          </Field>
          <Field label={t.rent.monthlyRent}>
            <Input type="number" min={0} value={monthlyRent || ""} onChange={(e) => setMonthlyRent(Number(e.target.value))} />
          </Field>
          <Field label={t.rent.dueDay}>
            <Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))} />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={handleAddProperty}>
            <Plus size={16} /> {t.common.add}
          </Button>
        </div>
      </Card>

      <Card className="mt-6">
        <SectionTitle>{t.rent.properties}</SectionTitle>
        {rentProperties.length === 0 ? (
          <p className="mt-4 py-4 text-center text-sm text-stone-400">{t.rent.noProperties}</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rentProperties.map((p) => (
              <div key={p.id} className="rounded-xl border border-stone-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">{p.propertyName}</p>
                    <p className="text-sm text-stone-500">{p.tenantName}</p>
                  </div>
                  <button onClick={() => deleteRentProperty(p.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="mt-2 text-lg font-bold text-emerald-700">
                  {formatCurrency(p.monthlyRent)}
                  <span className="text-sm font-normal text-stone-400">{t.common.perMonth}</span>
                </p>
                {p.tenantContact && <p className="mt-1 text-xs text-stone-400">{p.tenantContact}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <SectionTitle>{t.rent.recordPayment}</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label={t.rent.property}>
            <Select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
              <option value="">-</option>
              {rentProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.rent.month}>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </Field>
          <Field label={t.rent.amountPaid}>
            <Input type="number" min={0} value={amountPaid || ""} onChange={(e) => setAmountPaid(Number(e.target.value))} />
          </Field>
          <Field label={t.rent.status}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as RentPaymentStatus)}>
              <option value="paid">{t.rent.paid}</option>
              <option value="partial">{t.rent.partial}</option>
              <option value="pending">{t.rent.pending}</option>
            </Select>
          </Field>
          <Field label={t.common.date}>
            <Input type="date" value={datePaid} onChange={(e) => setDatePaid(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={handleAddPayment} disabled={!rentProperties.length}>
            <Plus size={16} /> {t.common.add}
          </Button>
        </div>
      </Card>

      <Card className="mt-6">
        <SectionTitle>{t.rent.paymentHistory}</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          {rentPayments.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">{t.common.noData}</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3 font-medium">{t.rent.property}</th>
                  <th className="pb-2 pr-3 font-medium">{t.rent.month}</th>
                  <th className="pb-2 pr-3 font-medium">{t.rent.amountPaid}</th>
                  <th className="pb-2 pr-3 font-medium">{t.rent.status}</th>
                  <th className="pb-2 pr-3 font-medium">{t.common.date}</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rentPayments
                  .slice()
                  .sort((a, b) => (a.datePaid < b.datePaid ? 1 : -1))
                  .map((p) => {
                    const prop = propertyMap.get(p.propertyId);
                    return (
                      <tr key={p.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-stone-800">{prop?.propertyName ?? "-"}</td>
                        <td className="py-2.5 pr-3 text-stone-600">{p.month}</td>
                        <td className="py-2.5 pr-3 font-semibold text-emerald-700">{formatCurrency(p.amountPaid)}</td>
                        <td className="py-2.5 pr-3">
                          <Badge tone={statusTone[p.status]}>
                            {p.status === "paid" ? t.rent.paid : p.status === "partial" ? t.rent.partial : t.rent.pending}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-stone-500">{p.datePaid}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {p.addedToLedger ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <CheckCircle2 size={14} /> {t.rent.addedToLedger}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAddToLedger(p.id, p.amountPaid, prop?.propertyName ?? "", p.month)}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 hover:bg-emerald-50 hover:text-emerald-700"
                                title={t.rent.addToLedger}
                              >
                                <BookPlus size={14} /> {t.rent.addToLedger}
                              </button>
                            )}
                            <button onClick={() => deleteRentPayment(p.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
