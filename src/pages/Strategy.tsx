import { useLanguage } from "../i18n/LanguageContext";
import { Card, PageHeader, SectionTitle } from "../components/ui";
import { CheckCircle2, Lightbulb } from "lucide-react";

export default function Strategy() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.strategy.title} subtitle={t.strategy.subtitle} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {t.strategy.tips.map((tip, i) => (
          <Card key={i} className="flex gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">{tip.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{tip.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <SectionTitle>{t.strategy.checklistTitle}</SectionTitle>
        <ul className="mt-4 space-y-3">
          {t.strategy.checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
