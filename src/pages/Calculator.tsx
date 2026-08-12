import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useData } from "../context/DataContext";
import { Card, PageHeader, SectionTitle, Field, Input, Select, Button, Badge } from "../components/ui";
import { LAND_UNITS, convertUnit, type LandUnit } from "../lib/units";
import { formatCurrency, formatDecimal } from "../lib/format";
import { Save, Trash2 } from "lucide-react";

export default function Calculator() {
  const { t } = useLanguage();
  const { valuations, addValuation, deleteValuation } = useData();

  const [propertyName, setPropertyName] = useState("");
  const [landUnit, setLandUnit] = useState<LandUnit>("aana");
  const [landSize, setLandSize] = useState<number>(4);
  const [landRate, setLandRate] = useState<number>(2500000);

  const [builtUpArea, setBuiltUpArea] = useState<number>(1200);
  const [constructionRate, setConstructionRate] = useState<number>(2200);
  const [buildingAge, setBuildingAge] = useState<number>(0);
  const [depreciationRate, setDepreciationRate] = useState<number>(2);

  const [purchasePrice, setPurchasePrice] = useState<number>(9000000);
  const [extraCosts, setExtraCosts] = useState<number>(200000);
  const [sellingPrice, setSellingPrice] = useState<number>(11000000);
  const [useEstimate, setUseEstimate] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [saleDate, setSaleDate] = useState<string>("");

  const landValue = (landSize || 0) * (landRate || 0);
  const buildingRaw = (builtUpArea || 0) * (constructionRate || 0);
  const depreciation = buildingRaw * ((depreciationRate || 0) / 100) * (buildingAge || 0);
  const buildingValue = Math.max(buildingRaw - depreciation, 0);
  const totalValue = landValue + buildingValue;

  const effectiveSellingPrice = useEstimate ? totalValue : sellingPrice || 0;
  const totalCost = (purchasePrice || 0) + (extraCosts || 0);
  const netResult = effectiveSellingPrice - totalCost;
  const returnPct = totalCost > 0 ? (netResult / totalCost) * 100 : 0;

  const holding = useMemo(() => {
    if (!purchaseDate) return null;
    const start = new Date(purchaseDate);
    const end = saleDate ? new Date(saleDate) : new Date();
    const days = Math.max((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24), 0);
    const years = days / 365;
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    let annualized = 0;
    if (years >= 1 / 12) {
      annualized = (Math.pow(1 + returnPct / 100, 1 / years) - 1) * 100;
    }
    return { years: wholeYears, months, annualized };
  }, [purchaseDate, saleDate, returnPct]);

  const conversions = useMemo(
    () => LAND_UNITS.filter((u) => u !== landUnit).map((u) => ({ unit: u, value: convertUnit(landSize || 0, landUnit, u) })),
    [landSize, landUnit]
  );

  const isProfit = netResult >= 0;

  const handleSave = () => {
    addValuation({
      propertyName: propertyName || "-",
      landSize: landSize || 0,
      landUnit,
      landRate: landRate || 0,
      landValue,
      builtUpArea: builtUpArea || 0,
      constructionRate: constructionRate || 0,
      buildingAge: buildingAge || 0,
      depreciationRate: depreciationRate || 0,
      buildingValue,
      totalValue,
      purchasePrice: purchasePrice || 0,
      extraCosts: extraCosts || 0,
      sellingPrice: effectiveSellingPrice,
      netResult,
      returnPct,
    });
    setPropertyName("");
  };

  return (
    <div>
      <PageHeader title={t.calculator.title} subtitle={t.calculator.subtitle} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>{t.calculator.landSection}</SectionTitle>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.calculator.propertyName}>
              <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="e.g. Budhanilkantha Plot" />
            </Field>
            <Field label={t.calculator.unit}>
              <Select value={landUnit} onChange={(e) => setLandUnit(e.target.value as LandUnit)}>
                {LAND_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t.calculator[u]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.calculator.size}>
              <Input type="number" min={0} value={landSize} onChange={(e) => setLandSize(Number(e.target.value))} />
            </Field>
            <Field label={t.calculator.ratePerUnit}>
              <Input type="number" min={0} value={landRate} onChange={(e) => setLandRate(Number(e.target.value))} />
            </Field>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-800">{t.calculator.landValue}</p>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(landValue)}</p>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              {t.calculator.unitConverter}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {conversions.map(({ unit, value }) => (
                <div key={unit} className="flex justify-between rounded-lg bg-stone-50 px-2.5 py-1.5">
                  <span className="text-stone-500">{t.calculator[unit]}</span>
                  <span className="font-medium text-stone-800">{formatDecimal(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>{t.calculator.buildingSection}</SectionTitle>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.calculator.builtUpArea}>
              <Input type="number" min={0} value={builtUpArea} onChange={(e) => setBuiltUpArea(Number(e.target.value))} />
            </Field>
            <Field label={t.calculator.constructionRate}>
              <Input type="number" min={0} value={constructionRate} onChange={(e) => setConstructionRate(Number(e.target.value))} />
            </Field>
            <Field label={t.calculator.buildingAge}>
              <Input type="number" min={0} value={buildingAge} onChange={(e) => setBuildingAge(Number(e.target.value))} />
            </Field>
            <Field label={t.calculator.depreciationRate}>
              <Input type="number" min={0} step={0.5} value={depreciationRate} onChange={(e) => setDepreciationRate(Number(e.target.value))} />
            </Field>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 p-4">
            <p className="text-sm text-amber-800">{t.calculator.buildingValue}</p>
            <p className="text-2xl font-bold text-amber-900">{formatCurrency(buildingValue)}</p>
          </div>

          <div className="mt-4 rounded-xl bg-stone-800 p-4">
            <p className="text-sm text-stone-300">{t.calculator.totalPropertyValue}</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle>{t.calculator.profitLossSection}</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t.calculator.purchasePrice}>
            <Input type="number" min={0} value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
          </Field>
          <Field label={t.calculator.extraCosts}>
            <Input type="number" min={0} value={extraCosts} onChange={(e) => setExtraCosts(Number(e.target.value))} />
          </Field>
          <Field label={t.calculator.sellingPrice}>
            <Input
              type="number"
              min={0}
              value={useEstimate ? Math.round(totalValue) : sellingPrice}
              disabled={useEstimate}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={useEstimate} onChange={(e) => setUseEstimate(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-emerald-700" />
              {t.calculator.useEstimate}
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.calculator.purchasePrice + " " + t.common.date}>
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </Field>
          <Field label={t.calculator.sellingPrice + " " + t.common.date}>
            <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`rounded-xl p-4 ${isProfit ? "bg-emerald-50" : "bg-rose-50"}`}>
            <p className={`text-sm ${isProfit ? "text-emerald-800" : "text-rose-800"}`}>{t.calculator.netResult}</p>
            <p className={`text-2xl font-bold ${isProfit ? "text-emerald-900" : "text-rose-900"}`}>
              {isProfit ? "+" : ""}
              {formatCurrency(netResult)}
            </p>
            <Badge tone={isProfit ? "positive" : "negative"}>{isProfit ? t.common.profit : t.common.loss}</Badge>
          </div>
          <div className="rounded-xl bg-stone-100 p-4">
            <p className="text-sm text-stone-600">{t.calculator.returnPct}</p>
            <p className={`text-2xl font-bold ${isProfit ? "text-emerald-900" : "text-rose-900"}`}>
              {formatDecimal(returnPct)}%
            </p>
          </div>
          {holding && (
            <div className="rounded-xl bg-stone-100 p-4">
              <p className="text-sm text-stone-600">{t.calculator.holdingPeriod}</p>
              <p className="text-lg font-bold text-stone-900">
                {holding.years} {t.calculator.years} {holding.months} {t.calculator.months}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {t.calculator.annualizedReturn}: {formatDecimal(holding.annualized)}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <Button onClick={handleSave}>
            <Save size={16} /> {t.calculator.saveValuation}
          </Button>
        </div>
      </Card>

      {valuations.length > 0 && (
        <Card className="mt-6">
          <SectionTitle>{t.calculator.savedList}</SectionTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3 font-medium">{t.calculator.propertyName}</th>
                  <th className="pb-2 pr-3 font-medium">{t.calculator.totalPropertyValue}</th>
                  <th className="pb-2 pr-3 font-medium">{t.calculator.netResult}</th>
                  <th className="pb-2 pr-3 font-medium">{t.calculator.returnPct}</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {valuations.map((v) => (
                  <tr key={v.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-stone-800">{v.propertyName}</td>
                    <td className="py-2.5 pr-3 text-stone-700">{formatCurrency(v.totalValue)}</td>
                    <td className={`py-2.5 pr-3 font-semibold ${v.netResult >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {v.netResult >= 0 ? "+" : ""}
                      {formatCurrency(v.netResult)}
                    </td>
                    <td className={`py-2.5 pr-3 ${v.netResult >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatDecimal(v.returnPct)}%
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => deleteValuation(v.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
