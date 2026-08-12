import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import Strategy from "./pages/Strategy";
import Accounting from "./pages/Accounting";
import RentTracker from "./pages/RentTracker";

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/rent" element={<RentTracker />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </LanguageProvider>
  );
}
