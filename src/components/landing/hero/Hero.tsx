import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import HeroDashboardMockup from './HeroDashboardMockup';

import Container from '@/components/common/Container';

const Hero = () => {
  return (
    <section className="bg-linear-to-b overflow-hidden from-blue-50 to-white py-24">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              Fast & Secure Global Transfers
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 lg:text-6xl">
              Send Money Internationally With Real-Time Quotes
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Transparent exchange rates, secure transfers, and lightning-fast settlements for
              international payments.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
              >
                Get Started
              </Link>

              <Link
                to="/request-quote"
                className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold"
              >
                View Live Quotes
              </Link>
            </div>
          </motion.div>

          <HeroDashboardMockup />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
