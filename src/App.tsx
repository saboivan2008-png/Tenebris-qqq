import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import USWShop from './pages/USWShop';
import AuruTrinity from './pages/AuruTrinity';
import PlaceholderPage from './pages/PlaceholderPage';
import PromoDrop from './pages/PromoDrop';
import USCSolidarity from './pages/USCSolidarity';
import USCRent from './pages/USCRent';
import USCWork from './pages/USCWork';
import USCTrade from './pages/USCTrade';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import Ritual369Page from './pages/Ritual369Page';
import GlobalCopilotChat from './components/ai/GlobalCopilotChat';
import AnalyticsTracker from './components/AnalyticsTracker';
import { AuthProvider } from './contexts/AuthContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - React Router v6 Routes component doesn't type the key prop but React requires it for AnimatePresence */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/promo" element={<PageTransition><PromoDrop /></PageTransition>} />
        <Route path="/auru-trinity" element={<PageTransition><AuruTrinity /></PageTransition>} />
        <Route path="/usw" element={<PageTransition><USWShop /></PageTransition>} />
        <Route path="/usc-solidarity" element={<PageTransition><USCSolidarity /></PageTransition>} />
        <Route path="/rent-a-wheel" element={<PageTransition><USCRent /></PageTransition>} />
        <Route path="/usc-work" element={<PageTransition><USCWork /></PageTransition>} />
        <Route path="/trade" element={<PageTransition><USCTrade /></PageTransition>} />
        <Route 
          path="/ritual-369" 
          element={
            <ProtectedRoute>
              <PageTransition><Ritual369Page /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/369-ritual" 
          element={
            <ProtectedRoute>
              <PageTransition><Ritual369Page /></PageTransition>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/:pillar" element={<PageTransition><PlaceholderPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <AnimatedRoutes />
        <GlobalCopilotChat />
      </BrowserRouter>
    </AuthProvider>
  );
}
