import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useData } from "../context/DataContext";
import { Card, PageHeader, SectionTitle, StatCard, Badge } from "../components/ui";
import { formatCurrency } from "../lib/format";
import { Wallet, TrendingDown, PiggyBank, Home, FileStack, Calculator, BookOpen, ArrowRight, Newspaper, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { currentBsMonthKey } from "../lib/bs";

export default function Dashboard() {
  const { t } = useLanguage();
  const { transactions, valuations, rentProperties, rentPayments } = useData();

  const totals = useMemo(() => {
    const income = transactions.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const expense = transactions.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    return { income, expense, savings: income - expense };
  }, [transactions]);

  const rentStats = useMemo(() => {
    const thisMonth = currentBsMonthKey();
    let due = 0;
    let collected = 0;
    for (const prop of rentProperties) {
      const paid = rentPayments
        .filter((p) => p.propertyId === prop.id && p.month === thisMonth)
        .reduce((s, p) => s + p.amountPaid, 0);
      collected += paid;
      due += Math.max(prop.monthlyRent - paid, 0);
    }
    return { due, collected };
  }, [rentProperties, rentPayments]);

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

  const recent = transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const quickLinks = [
    { to: "/calculator", label: t.dashboard.goCalc, icon: Calculator },
    { to: "/accounting", label: t.dashboard.goAccounting, icon: BookOpen },
    { to: "/rent", label: t.dashboard.goRent, icon: Home },
  ];

  return (
    <div>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.dashboard.totalIncome} value={formatCurrency(totals.income)} tone="positive" icon={<Wallet size={20} />} />
        <StatCard label={t.dashboard.totalExpense} value={formatCurrency(totals.expense)} tone="negative" icon={<TrendingDown size={20} />} />
        <StatCard label={t.dashboard.netSavings} value={formatCurrency(totals.savings)} tone="accent" icon={<PiggyBank size={20} />} />
        <StatCard label={t.dashboard.savedValuations} value={String(valuations.length)} icon={<FileStack size={20} />} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label={t.dashboard.rentCollected} value={formatCurrency(rentStats.collected)} tone="positive" icon={<Home size={20} />} />
        <StatCard label={t.dashboard.rentDue} value={formatCurrency(rentStats.due)} tone={rentStats.due > 0 ? "negative" : "default"} icon={<Home size={20} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>{t.dashboard.incomeVsExpense}</SectionTitle>
          <div className="mt-4 h-64 w-full">
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

        <div className="flex flex-col gap-6">
          <Card>
            <SectionTitle>{t.dashboard.quickLinks}</SectionTitle>
            <div className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="text-emerald-700" />
                    {label}
                  </span>
                  <ArrowRight size={15} className="text-stone-400" />
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Newspaper size={18} />
              </div>
              <div className="min-w-0">
                <SectionTitle>{t.dashboard.newsTitle}</SectionTitle>
                <p className="mt-1 text-sm text-stone-500">{t.dashboard.newsSubtitle}</p>
              </div>
            </div>
            <a
              href="https://ekantipur.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
              {t.dashboard.newsButton} <ExternalLink size={15} />
            </a>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <SectionTitle>{t.dashboard.recentTransactions}</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">{t.common.noData}</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3 font-medium">{t.common.date}</th>
                  <th className="pb-2 pr-3 font-medium">{t.accounting.category}</th>
                  <th className="pb-2 font-medium">{t.common.amount}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-2.5 pr-3 whitespace-nowrap text-stone-600">{tx.date}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={tx.type === "income" ? "positive" : "negative"}>
                        {t.accounting.categories[tx.category as keyof typeof t.accounting.categories] ?? tx.category}
                      </Badge>
                    </td>
                    <td className={`py-2.5 font-semibold ${tx.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
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
