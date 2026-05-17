import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import DashboardLayout from './components/dashboard/layouts/DashboardLayout';
import LoginForm from './components/LoginForm';
import QuoteRequestForm from './components/QuoteRequestForm';
import UserRegistrationForm from './components/UserRegistrationForm';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import QuotesPage from './pages/dashboard/QuotesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import WalletPage from './pages/dashboard/WalletPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import { setNavigator } from './utils/navigation';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHomePage />} />

        <Route path="wallet" element={<WalletPage />} />

        <Route path="transactions" element={<TransactionsPage />} />

        <Route path="quotes" element={<QuotesPage />} />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/request-quote" element={<QuoteRequestForm />} />
      <Route path="/register" element={<UserRegistrationForm />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
