import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-stone-900 ${className}`}>{children}</h2>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-stone-500 sm:text-base">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "accent";
  icon?: ReactNode;
}) {
  const toneClasses: Record<string, string> = {
    default: "text-stone-900",
    positive: "text-emerald-700",
    negative: "text-rose-700",
    accent: "text-amber-700",
  };
  return (
    <Card className="flex items-center gap-4">
      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-stone-500">{label}</p>
        <p className={`truncate text-xl font-bold ${toneClasses[tone]}`}>{value}</p>
      </div>
    </Card>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const variants: Record<string, string> = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "positive" | "negative" | "accent" }) {
  const tones: Record<string, string> = {
    default: "bg-stone-100 text-stone-700",
    positive: "bg-emerald-100 text-emerald-800",
    negative: "bg-rose-100 text-rose-800",
    accent: "bg-amber-100 text-amber-800",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
