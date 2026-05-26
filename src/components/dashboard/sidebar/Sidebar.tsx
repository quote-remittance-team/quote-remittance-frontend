import { FiDollarSign, FiHome, FiRepeat, FiSettings, FiPlusCircle } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const links = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: FiHome,
  },
  {
    label: 'Transactions',
    path: '/dashboard/transactions',
    icon: FiRepeat,
  },
  {
    label: 'Quotes',
    path: '/dashboard/quotes',
    icon: FiDollarSign,
  },
  {
    label: 'Settings',
    path: '/dashboard/settings',
    icon: FiSettings,
  },
  {
    label: 'Request Quote',
    path: '/request-quote',
    icon: FiPlusCircle,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="h-full w-72 border-r border-slate-200 bg-white">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-blue-600">QuoteRemit</h2>
      </div>

      <nav className="space-y-2 px-4">
        {links.map((link) => {
          const isActive =
            link.path === '/dashboard'
              ? location.pathname === link.path
              : location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <link.icon className="text-xl" />

              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
