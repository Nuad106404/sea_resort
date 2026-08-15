import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Home, CreditCard, Building, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { settingsAPI } from '../lib/settingsAPI';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function Sidebar() {
  const location = useLocation();
  const [firstName, setFirstName] = useState('Asili');
  const [lastName, setLastName] = useState('Village');

  useDocumentTitle(`${firstName} ${lastName}`);

  useEffect(() => {
    const fetchSiteNameParts = async () => {
      const parts = await settingsAPI.getSiteNameParts();
      setFirstName(parts.firstName);
      setLastName(parts.secondPart);
    };
    fetchSiteNameParts();
  }, []);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { path: '/bookings', icon: Calendar, label: 'การจอง' },
    { path: '/rooms', icon: Building, label: 'ห้องพัก' },
    { path: '/banks', icon: CreditCard, label: 'บัญชีธนาคาร' },
    { path: '/settings', icon: Settings, label: 'การตั้งค่า' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <Home className="w-8 h-8 text-amber-500" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-light text-white">{firstName}</span>
              <span className="text-xl font-bold text-amber-400">{lastName}</span>
            </div>
            <p className="text-xs text-gray-400">แผงควบคุมผู้ดูแล</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          © {firstName} {lastName}
        </p>
      </div>
    </div>
  );
}
