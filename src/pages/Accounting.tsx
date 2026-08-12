import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useData } from "../context/DataContext";
import { Card, PageHeader, SectionTitle, Field, Input, Select, Button, Badge } from "../components/ui";
import { formatCurrency } from "../lib/format";
import type { TransactionType } from "../lib/types";
import { Plus, Trash2, Wallet, TrendingDown, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const INCOME_CATEGORIES = ["landSale", "commission", "rentIncome", "otherIncome"] as const;
const EXPENSE_CATEGORIES = [
  "brokerageFee",
  "registrationFee",
  "officeExpense",
  "travel",
  "salary",
  "tax",
  "renovation",
  "otherExpense",
] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Accounting() {
  const { t } = useLanguage();
  const { transactions, addTransaction, deleteTransaction } = useData();

  const [type, setType] = useState<TransactionType>("income");
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    setCategory(next === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleAdd = () => {
    if (!amount) return;
    addTransaction({ type, category, date, amount, note: note || undefined });
    setAmount(0);
    setNote("");
  };

  const totals = useMemo(() => {
    const income = transactions.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const expense = transactions.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    return { income, expense, savings: income - expense };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString(undefined, { month: "short" }), income: 0, expense: 0 });
    }
    for (const tx of transactions) {
      const key = tx.date.slice(0, 7);
      const bucket = months.find((m) => m.key === key);
      if (bucket) {
        if (tx.type === "income") bucket.income += tx.amount;
        else bucket.expense += tx.amount;
      }
    }
    return months;
  }, [transactions]);

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter]
  );

  return (
    <div>
      <PageHeader title={t.accounting.title} subtitle={t.accounting.subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.accounting.summaryIncome}</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totals.income)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown size={18} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.accounting.summaryExpense}</p>
              <p className="text-xl font-bold text-rose-700">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <PiggyBank size={18} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.accounting.summarySavings}</p>
              <p className={`text-xl font-bold ${totals.savings >= 0 ? "text-stone-900" : "text-rose-700"}`}>
                {formatCurrency(totals.savings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <SectionTitle>{t.accounting.addTransaction}</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label={t.accounting.type}>
            <Select value={type} onChange={(e) => handleTypeChange(e.target.value as TransactionType)}>
              <option value="income">{t.accounting.income}</option>
              <option value="expense">{t.accounting.expense}</option>
            </Select>
          </Field>
          <Field label={t.accounting.category}>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {t.accounting.categories[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.common.date}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={t.common.amount}>
            <Input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          <Field label={t.common.note}>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={handleAdd}>
            <Plus size={16} /> {t.common.add}
          </Button>
        </div>
      </Card>

      <Card className="mt-6">
        <SectionTitle>{t.accounting.chartTitle}</SectionTitle>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#78716c" }} />
              <YAxis tick={{ fontSize: 12, fill: "#78716c" }} width={70} tickFormatter={(v) => new Intl.NumberFormat("en", { notation: "compact" }).format(Number(v))} />
              <Tooltip formatter={(v: unknown) => formatCurrency(Number(v) || 0)} />
              <Legend formatter={(v) => (v === "income" ? t.accounting.income : t.accounting.expense)} />
              <Bar dataKey="income" fill="#047857" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#be123c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>{t.accounting.history}</SectionTitle>
          <div className="flex gap-1.5 rounded-lg bg-stone-100 p-1">
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
                }`}
              >
                {f === "all" ? t.accounting.filterAll : f === "income" ? t.accounting.filterIncome : t.accounting.filterExpense}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">{t.common.noData}</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3 font-medium">{t.common.date}</th>
                  <th className="pb-2 pr-3 font-medium">{t.accounting.category}</th>
                  <th className="pb-2 pr-3 font-medium">{t.common.note}</th>
                  <th className="pb-2 pr-3 font-medium">{t.common.amount}</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((tx) => (
                    <tr key={tx.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap text-stone-600">{tx.date}</td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={tx.type === "income" ? "positive" : "negative"}>
                          {t.accounting.categories[tx.category as keyof typeof t.accounting.categories] ?? tx.category}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-stone-500">{tx.note || "-"}</td>
                      <td className={`py-2.5 pr-3 font-semibold ${tx.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => deleteTransaction(tx.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
