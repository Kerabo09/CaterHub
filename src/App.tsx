import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Directory } from './pages/Directory';
import { CatererProfile } from './pages/CatererProfile';
import { AuthPage } from './components/auth/AuthPage';
import { Contact } from './pages/Contact';
import { HowItWorks } from './pages/HowItWorks';
import { Dashboard } from './pages/Dashboard';
import { MyInquiries } from './pages/MyInquiries';
import { RequireRole } from './components/RequireRole';
import { AuthProvider } from './lib/AuthContext';

function Layout({ children, hideFooter }: { children: React.ReactNode; hideFooter?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/browse" element={<Layout><Browse /></Layout>} />
        <Route path="/caterers" element={<Layout><Directory /></Layout>} />
        <Route path="/caterers/:id" element={<Layout><CatererProfile /></Layout>} />
        <Route path="/login" element={<AuthPage key="c-login" role="customer" initialMode="login" />} />
        <Route path="/signup" element={<AuthPage key="c-signup" role="customer" initialMode="signup" />} />
        <Route path="/partner-login" element={<AuthPage key="p-login" role="caterer" initialMode="login" />} />
        <Route path="/partner-signup" element={<AuthPage key="p-signup" role="caterer" initialMode="signup" />} />
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
