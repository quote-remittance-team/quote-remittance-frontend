import { Link } from 'react-router-dom';

import Container from '@/components/common/Container';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-2xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            QuoteRemit
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-slate-600 hover:text-blue-600">
              Features
            </a>

            <a href="#security" className="text-slate-600 hover:text-blue-600">
              Security
            </a>

            <a href="#faq" className="text-slate-600 hover:text-blue-600">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-slate-700 md:block">
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
