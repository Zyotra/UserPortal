import { useEffect, useState, useRef } from 'react';
import ZyotraLogo from '../components/ZyotraLogo';
import { FiChevronDown, FiLogOut, FiUser, FiSettings, FiGrid, FiServer, FiFolder, FiGlobe, FiPackage, FiActivity, FiCreditCard, FiSliders, FiCommand } from 'react-icons/fi';
import Overview from '../components/dashboard/Overview';
import VPSMachines from '../components/dashboard/VPSMachines';
import Projects from '../components/dashboard/Projects';
import Domains from '../components/dashboard/Domains';
import Deployments from '../components/dashboard/Deployments';
import Activity from '../components/dashboard/Activity';
import Billings from '../components/dashboard/Billings';
import Settings from '../components/dashboard/Settings';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Overview', icon: FiGrid },
    { name: 'VPS Machines', icon: FiServer },
    { name: 'Projects', icon: FiFolder },
    { name: 'Domains', icon: FiGlobe },
    { name: 'Deployments', icon: FiPackage },
    { name: 'Activity', icon: FiActivity },
    { name: 'Billings', icon: FiCreditCard },
    { name: 'Settings', icon: FiSliders }
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'VPS Machines':
        return <VPSMachines />;
      case 'Projects':
        return <Projects />;
      case 'Domains':
        return <Domains />;
      case 'Deployments':
        return <Deployments />;
      case 'Activity':
        return <Activity />;
      case 'Billings':
        return <Billings />;
      case 'Settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-900/30">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <ZyotraLogo className="w-7 h-7" />
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2 cursor-pointer group">              
              <span className="font-medium text-sm text-white/90">Zyotra</span>
            </div>
          </div>

          {/* Center Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all">
                <FiCommand className="absolute left-3 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search or jump to..."
                  className="bg-transparent py-2 pl-9 pr-20 text-sm focus:outline-none w-full placeholder-gray-500 text-white"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <kbd className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">⌘</kbd>
                  <kbd className="bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">K</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Profile Menu */}
            <div className="relative ml-2" ref={profileMenuRef}>

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 cursor-pointer hover:shadow-lg hover:shadow-orange-500/30 transition-all ring-2 ring-white/10"
              ></button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                    <p className="text-sm text-white font-semibold">Ramkrishna</p>
                    <p className="text-xs text-gray-400 truncate mt-1">ramkrishna@zyotra.com</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-all">
                      <FiUser className="text-base" /> Profile
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-all">
                      <FiSettings className="text-base" /> Settings
                    </button>
                  </div>
                  <div className="border-t border-white/10 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-all"
                    >
                      <FiLogOut className="text-base" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-14 bottom-0 bg-black/20 backdrop-blur-sm border-r border-white/5 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="h-full flex flex-col py-6">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <FiChevronDown className={`text-xs transform transition-transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                  )}
                  <Icon className={`text-lg flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          {!sidebarCollapsed && (
            <div className="px-3 pt-4 border-t border-white/5">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg p-4">
                <p className="text-xs font-semibold text-white mb-1">Upgrade to Pro</p>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Unlock advanced features and priority support</p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium py-1.5 rounded-md hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
