import { Link, useLocation } from 'react-router-dom';
import { Settings, Home, Footprints, BookOpen, Package, MapPin, Heart } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import SettingsModal from './SettingsModal';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/escape', label: '逃生演练', icon: Footprints },
  { path: '/quiz', label: '安全问答', icon: BookOpen },
  { path: '/supplies', label: '物资储备', icon: Package },
  { path: '/home-plan', label: '家庭规划', icon: MapPin },
  { path: '/home-plan/medical-card', label: '医疗卡', icon: Heart },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { setShowSettings } = useAppStore();

  return (
    <div className="min-h-screen bg-warm-white font-body">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="text-2xl">🐘</span>
              <span className="font-title text-xl text-brand-orange">安全小象</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm no-underline transition-colors ${
                      isActive
                        ? 'bg-brand-orange/10 text-brand-orange font-medium'
                        : 'text-dark-text/70 hover:bg-gray-100 hover:text-dark-text'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-dark-text/60 hover:bg-gray-100 hover:text-dark-text transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 no-underline ${
                  isActive ? 'text-brand-orange' : 'text-dark-text/50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SettingsModal />
    </div>
  );
}
