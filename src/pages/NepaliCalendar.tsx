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

const AD_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function daysInAdMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
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
  const weekdayLabels = lang === "ne" ? WEEKDAYS_NP : WEEKDAYS_EN;

  const todayBs = useMemo(() => NepaliDate.now(), []);
  const todayAd = useMemo(() => new Date(), []);

  // ---- B.S. (Nepali) calendar state ----
  const [bsViewYear, setBsViewYear] = useState(todayBs.getYear());
  const [bsViewMonth, setBsViewMonth] = useState(todayBs.getMonth());

  const bsGoPrev = () => {
    if (bsViewMonth === 0) {
      if (bsViewYear <= MIN_YEAR) return;
      setBsViewYear(bsViewYear - 1);
      setBsViewMonth(11);
    } else {
      setBsViewMonth(bsViewMonth - 1);
    }
  };
  const bsGoNext = () => {
    if (bsViewMonth === 11) {
      if (bsViewYear >= MAX_YEAR) return;
      setBsViewYear(bsViewYear + 1);
      setBsViewMonth(0);
    } else {
      setBsViewMonth(bsViewMonth + 1);
    }
  };
  const bsGoToday = () => {
    setBsViewYear(todayBs.getYear());
    setBsViewMonth(todayBs.getMonth());
  };

  const bsMonthTitle = new NepaliDate(bsViewYear, bsViewMonth, 1).format("MMMM YYYY", fmtLang);
  const bsFirstWeekday = new NepaliDate(bsViewYear, bsViewMonth, 1).getDay();
  const bsTotalDays = daysInBsMonth(bsViewYear, bsViewMonth);
  const bsCells: (number | null)[] = [
    ...Array(bsFirstWeekday).fill(null),
    ...Array.from({ length: bsTotalDays }, (_, i) => i + 1),
  ];

  // ---- A.D. (English) calendar state ----
  const [adViewYear, setAdViewYear] = useState(todayAd.getFullYear());
  const [adViewMonth, setAdViewMonth] = useState(todayAd.getMonth());

  const adGoPrev = () => {
    if (adViewMonth === 0) {
      setAdViewYear(adViewYear - 1);
      setAdViewMonth(11);
    } else {
      setAdViewMonth(adViewMonth - 1);
    }
  };
  const adGoNext = () => {
    if (adViewMonth === 11) {
      setAdViewYear(adViewYear + 1);
      setAdViewMonth(0);
    } else {
      setAdViewMonth(adViewMonth + 1);
    }
  };
  const adGoToday = () => {
    setAdViewYear(todayAd.getFullYear());
    setAdViewMonth(todayAd.getMonth());
  };

  const adMonthTitle = `${AD_MONTH_NAMES[adViewMonth]} ${adViewYear}`;
  const adFirstWeekday = new Date(adViewYear, adViewMonth, 1).getDay();
  const adTotalDays = daysInAdMonth(adViewYear, adViewMonth);
  const adCells: (number | null)[] = [
    ...Array(adFirstWeekday).fill(null),
    ...Array.from({ length: adTotalDays }, (_, i) => i + 1),
  ];

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

      <Card>
        <SectionTitle>{t.calendar.today}</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-700 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">{t.calendar.bsCalendar}</p>
            <p className="mt-1 text-3xl font-bold">{todayBs.format("DD MMMM YYYY", fmtLang)}</p>
            <p className="mt-1 text-emerald-100">{todayBs.format("ddd", fmtLang)}</p>
          </div>
          <div className="rounded-xl bg-stone-800 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-300">{t.calendar.adCalendar}</p>
            <p className="mt-1 text-3xl font-bold">
              {todayAd.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="mt-1 text-stone-300">
              {todayAd.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", { weekday: "long" })}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <button onClick={bsGoPrev} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Previous B.S. month">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.calendar.bsCalendar}</p>
              <h2 className="text-lg font-bold text-stone-900">{bsMonthTitle}</h2>
            </div>
            <button onClick={bsGoNext} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Next B.S. month">
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
            {bsCells.map((day, idx) => {
              if (day === null) return <div key={`bs-blank-${idx}`} />;
              const isToday =
                day === todayBs.getDate() && bsViewMonth === todayBs.getMonth() && bsViewYear === todayBs.getYear();
              const isSaturday = idx % 7 === 6;
              const ad = new NepaliDate(bsViewYear, bsViewMonth, day).getAD();
              return (
                <div
                  key={day}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-sm ${
                    isToday ? "border-emerald-700 bg-emerald-700 text-white" : "border-transparent hover:bg-stone-50"
                  }`}
                >
                  <span className={`font-semibold ${!isToday && isSaturday ? "text-rose-600" : ""}`}>
                    {lang === "ne" ? new NepaliDate(bsViewYear, bsViewMonth, day).format("D", "np") : day}
                  </span>
                  <span className={`text-[10px] ${isToday ? "text-emerald-100" : "text-stone-400"}`}>{ad.date}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={bsGoToday}>
              <CalendarDays size={15} /> {t.calendar.goToday}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <button onClick={adGoPrev} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Previous A.D. month">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.calendar.adCalendar}</p>
              <h2 className="text-lg font-bold text-stone-900">{adMonthTitle}</h2>
            </div>
            <button onClick={adGoNext} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Next A.D. month">
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
            {adCells.map((day, idx) => {
              if (day === null) return <div key={`ad-blank-${idx}`} />;
              const isToday =
                day === todayAd.getDate() && adViewMonth === todayAd.getMonth() && adViewYear === todayAd.getFullYear();
              const isSaturday = idx % 7 === 6;
              const bs = NepaliDate.fromAD(new Date(adViewYear, adViewMonth, day)).getBS();
              return (
                <div
                  key={day}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-sm ${
                    isToday ? "border-stone-800 bg-stone-800 text-white" : "border-transparent hover:bg-stone-50"
                  }`}
                >
                  <span className={`font-semibold ${!isToday && isSaturday ? "text-rose-600" : ""}`}>{day}</span>
                  <span className={`text-[10px] ${isToday ? "text-stone-300" : "text-stone-400"}`}>
                    {lang === "ne" ? new NepaliDate(bs.year, bs.month, bs.date).format("D", "np") : bs.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={adGoToday}>
              <CalendarDays size={15} /> {t.calendar.goToday}
            </Button>
          </div>
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
