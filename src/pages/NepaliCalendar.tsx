import { useMemo, useState } from "react";
import NepaliDate, { dateConfigMap } from "nepali-date-converter";
import { useLanguage } from "../i18n/LanguageContext";
import { Card, PageHeader, SectionTitle, Field, Input, Select, Button } from "../components/ui";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MONTH_KEYS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

const AVAILABLE_YEARS = Object.keys(dateConfigMap)
  .map(Number)
  .sort((a, b) => a - b);
const MIN_YEAR = AVAILABLE_YEARS[0];
const MAX_YEAR = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];

function daysInBsMonth(year: number, monthIndex: number): number {
  return dateConfigMap[String(year)]?.[MONTH_KEYS[monthIndex]] ?? 30;
}

function parseAdInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NepaliCalendar() {
  const { t, lang } = useLanguage();
  const fmtLang = lang === "ne" ? "np" : "en";

  const todayBs = useMemo(() => NepaliDate.now(), []);
  const [viewYear, setViewYear] = useState(todayBs.getYear());
  const [viewMonth, setViewMonth] = useState(todayBs.getMonth());

  const goPrev = () => {
    if (viewMonth === 0) {
      if (viewYear <= MIN_YEAR) return;
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      if (viewYear >= MAX_YEAR) return;
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    setViewYear(todayBs.getYear());
    setViewMonth(todayBs.getMonth());
  };

  const monthTitle = new NepaliDate(viewYear, viewMonth, 1).format("MMMM YYYY", fmtLang);
  const firstWeekday = new NepaliDate(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInBsMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const weekdayLabels = lang === "ne" ? WEEKDAYS_NP : WEEKDAYS_EN;

  // AD -> BS converter
  const [adInput, setAdInput] = useState(todayISO());
  const adToBsResult = useMemo(() => {
    const parsed = parseAdInput(adInput);
    if (!parsed) return null;
    return NepaliDate.fromAD(parsed).format("ddd DD, MMMM YYYY", fmtLang);
  }, [adInput, fmtLang]);

  // BS -> AD converter
  const [bsYear, setBsYear] = useState(todayBs.getYear());
  const [bsMonth, setBsMonth] = useState(todayBs.getMonth());
  const [bsDay, setBsDay] = useState(todayBs.getDate());
  const bsDaysInSelectedMonth = daysInBsMonth(bsYear, bsMonth);
  const bsToAdResult = useMemo(() => {
    const safeDay = Math.min(bsDay, bsDaysInSelectedMonth);
    const jsDate = new NepaliDate(bsYear, bsMonth, safeDay).toJsDate();
    return jsDate.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [bsYear, bsMonth, bsDay, bsDaysInSelectedMonth, lang]);

  return (
    <div>
      <PageHeader title={t.calendar.title} subtitle={t.calendar.subtitle} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <button onClick={goPrev} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-stone-900">{monthTitle}</h2>
            <button onClick={goNext} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide">
            {weekdayLabels.map((w, i) => (
              <div key={w} className={i === 6 ? "py-1.5 text-rose-600" : "py-1.5 text-stone-400"}>
                {w}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} />;
              const isToday =
                day === todayBs.getDate() && viewMonth === todayBs.getMonth() && viewYear === todayBs.getYear();
              const isSaturday = idx % 7 === 6;
              const ad = new NepaliDate(viewYear, viewMonth, day).getAD();
              return (
                <div
                  key={day}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-sm ${
                    isToday
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-transparent hover:bg-stone-50"
                  }`}
                >
                  <span className={`font-semibold ${!isToday && isSaturday ? "text-rose-600" : ""}`}>
                    {lang === "ne" ? new NepaliDate(viewYear, viewMonth, day).format("D", "np") : day}
                  </span>
                  <span className={`text-[10px] ${isToday ? "text-emerald-100" : "text-stone-400"}`}>{ad.date}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={goToday}>
              <CalendarDays size={15} /> {t.calendar.goToday}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle>{t.calendar.today}</SectionTitle>
          <div className="mt-4 rounded-xl bg-emerald-700 p-5 text-white">
            <p className="text-3xl font-bold">{todayBs.format("DD MMMM YYYY", fmtLang)}</p>
            <p className="mt-1 text-emerald-100">{todayBs.format("ddd", fmtLang)}</p>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            {t.calendar.adEquivalent}:{" "}
            <span className="font-medium text-stone-700">
              {new Date().toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>{t.calendar.adToBs}</SectionTitle>
          <div className="mt-4">
            <Field label={t.calendar.adDate}>
              <Input type="date" value={adInput} onChange={(e) => setAdInput(e.target.value)} />
            </Field>
          </div>
          {adToBsResult && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{t.calendar.result}</p>
              <p className="text-lg font-bold text-amber-900">{adToBsResult}</p>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>{t.calendar.bsToAd}</SectionTitle>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label={t.calendar.bsYear}>
              <Select value={bsYear} onChange={(e) => setBsYear(Number(e.target.value))}>
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.calendar.bsMonth}>
              <Select value={bsMonth} onChange={(e) => setBsMonth(Number(e.target.value))}>
                {MONTH_KEYS.map((_, i) => (
                  <option key={i} value={i}>
                    {new NepaliDate(bsYear, i, 1).format("MMMM", fmtLang)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.calendar.bsDay}>
              <Select value={Math.min(bsDay, bsDaysInSelectedMonth)} onChange={(e) => setBsDay(Number(e.target.value))}>
                {Array.from({ length: bsDaysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-800">{t.calendar.result}</p>
            <p className="text-lg font-bold text-emerald-900">{bsToAdResult}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
