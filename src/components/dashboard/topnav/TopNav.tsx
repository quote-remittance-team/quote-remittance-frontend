import { ACCESS_TOKEN_KEY, api } from '@/api/client';
import { navigateTo } from '@/utils/navigation';
import { useEffect, useState } from 'react';
import { FiBell, FiMenu, FiSearch } from 'react-icons/fi';

type Props = {
  onMenuClick: () => void;
};




const TopNav = ({ onMenuClick }: Props) => {
  const [user, setUser] = useState<{ email: string } | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  fetchUser();
}, []);

 const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    navigateTo('/login');
  };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
          >
            <FiMenu className="text-2xl" />
          </button>

          {/* Search */}
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 md:flex">
            <FiSearch className="text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              className="outline-none"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FiBell />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-600" />

            <div className="hidden md:block">
              <p className="font-semibold">{user?.email || 'User'}</p>
               <button
  onClick={handleLogout}
  className="text-sm text-blue-600 hover:underline"
>
  Logout
</button>
            </div>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;



