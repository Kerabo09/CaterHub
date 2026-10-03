import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/public/Home';
import { Browse } from './pages/public/Browse';
import { Directory } from './pages/public/Directory';
import { CatererProfile } from './pages/public/CatererProfile';
import { AuthPage } from './components/auth/AuthPage';
import { Legal } from './pages/public/Legal';
import { Contact } from './pages/public/Contact';
import { HowItWorks } from './pages/public/HowItWorks';
import { Dashboard } from './pages/partner/Dashboard';
import { MyInquiries } from './pages/customer/MyInquiries';
import { RequireRole } from './components/common/RequireRole';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/browse" element={<Layout><Browse /></Layout>} />
        <Route path="/caterers" element={<Layout><Directory /></Layout>} />
        <Route path="/caterers/:id" element={<Layout><CatererProfile /></Layout>} />
        <Route path="/login" element={<Layout hideFooter><AuthPage key="c-login" role="customer" initialMode="login" /></Layout>} />
        <Route path="/signup" element={<Layout hideFooter><AuthPage key="c-signup" role="customer" initialMode="signup" /></Layout>} />
        <Route path="/partner-login" element={<Layout hideFooter><AuthPage key="p-login" role="caterer" initialMode="login" /></Layout>} />
        <Route path="/partner-signup" element={<Layout hideFooter><AuthPage key="p-signup" role="caterer" initialMode="signup" /></Layout>} />
        <Route path="/privacy" element={<Layout><Legal kind="privacy" /></Layout>} />
        <Route path="/terms" element={<Layout><Legal kind="terms" /></Layout>} />
        <Route path="/dashboard" element={<Layout hideFooter><RequireRole role="caterer"><Dashboard /></RequireRole></Layout>} />
        <Route path="/my-inquiries" element={<Layout><RequireRole role="customer"><MyInquiries /></RequireRole></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/for-caterers" element={<Navigate to="/partner-login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
