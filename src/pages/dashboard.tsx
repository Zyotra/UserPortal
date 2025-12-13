import { useEffect, useState, useRef } from 'react';
import ZyotraLogo from '../components/ZyotraLogo';
import { FiSearch, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import Overview from '../components/dashboard/Overview';
import VPSMachines from '../components/dashboard/VPSMachines';
import Projects from '../components/dashboard/Projects';
import Domains from '../components/dashboard/Domains';
import Deployments from '../components/dashboard/Deployments';
import Billings from '../components/dashboard/Billings';
import Settings from '../components/dashboard/Settings';
import apiClient from '../utils/apiClient';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navItems = [
    'Overview',
    'VPS Machines',
    'Projects',
    'Domains',
    'Activity',
    'Billings',
    'Settings'
  ];
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userData = await apiClient("http://localhost:5050/dashboard", {
        method: "GET",
      });
      const data = await userData.json();
      console.log(data);
      if (!data.userEmail) {
        setLoading(false);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      setUserEmail(data.userEmail);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
    }
    fetchDashboardData()
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
      case 'Activity':
        return <Deployments />;
      case 'Billings':
        return <Billings />;
      case 'Settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800">
      {/* Top Navigation */}
      <header className="border-b border-[#333] sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ZyotraLogo className="w-8 h-8" />
            <span className="text-gray-500 text-2xl font-thin">/</span>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#111] p-1 rounded transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
              <span className="font-medium text-sm">{userEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center">
              <FiSearch className="absolute left-3 text-gray-500" />
              <input
                type="text"
                placeholder="Find..."
                className="bg-[#111] border border-[#333] rounded-md py-1.5 pl-9 pr-12 text-sm focus:outline-none focus:border-gray-500 transition-colors w-64 placeholder-gray-600 text-white"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="bg-[#222] border border-[#333] rounded px-1.5 text-[10px] text-gray-500 font-sans">F</kbd>
              </div>
            </div>
            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 cursor-pointer hover:opacity-90 transition-opacity"
              ></button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-black border border-[#333] rounded-md shadow-xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-[#333]">
                    <p className="text-sm text-white font-medium">User</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111] hover:text-white flex items-center gap-2">
                      <FiUser /> Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#111] hover:text-white flex items-center gap-2">
                      <FiSettings /> Settings
                    </button>
                  </div>
                  <div className="border-t border-[#333] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#111] flex items-center gap-2"
                    >
                      <FiLogOut /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex gap-6 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === item
                  ? 'text-white border-white'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
