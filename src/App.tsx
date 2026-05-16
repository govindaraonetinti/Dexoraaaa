import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { Toaster } from "react-hot-toast";

import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import Swap from './pages/Swap';
import Portfolio from './pages/portfolio';
import AirdropPage from './pages/AirdropPage';
import { Referral } from './pages/Referral';
import { Staking } from './pages/Staking';
import { AboutUs } from './pages/About';
import ScrollToTop from './lib/ScrollToTop';
import { Products } from './pages/Products';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQPage from './pages/FAQ';
import ContactForm from './pages/Contact';
import CrossChainSwapAPI from './pages/cross_chain_swap_api';
import Trade from './pages/Trade';
import HomePage from './pages/Home';
import AirdropDetails from './components/Airdrop/AirdropDetails';

import StarfieldBackground from './components/StarfieldBackground';

function AppContent() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className="app-bg">
      {isHome && <StarfieldBackground />}

      <div className="content-layer">
        <Toaster position="bottom-right" />

        <ScrollToTop />
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/swap/" element={<Swap />} />
          <Route path="/trade/:market" element={<Trade />} />
          <Route path="/trade/:market/:vendor" element={<Trade />} />
          <Route path="/crosschain" element={<CrossChainSwapAPI />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/airdrop" element={<AirdropPage />} />
          <Route path="/airdrop-details/:id" element={<AirdropDetails />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;