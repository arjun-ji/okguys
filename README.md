# Sunil Khadka Real Estate | सुनिल खड्का घरजग्गा

A bilingual (English / Nepali) web app for a Nepal-based real estate agent to:

- **Price & Profit Calculator** — estimate land value using Nepali land units (Ropani, Aana, Paisa, Daam, Bigha, Kattha, Dhur, sq. ft., sq. m.), estimate building value with construction rate and depreciation, and work out profit/loss, ROI, and annualized return on a deal.
- **Investment Strategy** — bilingual tips and a due-diligence checklist for buying/selling profitably in Nepal.
- **Accounting Ledger** — record income and expenses by category, see total income/expense/net savings, and view a monthly income vs. expense chart.
- **House Rent Tracker** — manage rental properties and tenants, record monthly rent payments, track outstanding dues, and push collected rent straight into the accounting ledger.

All data is stored locally in the browser (`localStorage`) — nothing leaves the device.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Recharts (charts)

## Development

```bash
npm install
npm run dev       # start dev server
npm run build      # production build
npm run preview    # preview the production build
```

## Language

Toggle between English and Nepali (नेपाली) using the button in the top navigation bar. The choice is remembered on the device.
