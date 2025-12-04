import { useEffect, useState } from 'react';
import ZyotraLogo from '../components/ZyotraLogo';
import { FiSearch, FiBell, FiActivity, FiGrid, FiList, FiGithub, FiMoreHorizontal, FiCommand, FiChevronDown } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = [
    'Overview',
    'VPS Machines',
    'Projects',
    'Domains',
    'Deployments',
    'Activity',
    'Billings',
    'Settings'
  ];

  const projects = [
    {
      name: 'chat-connect',
      url: 'chat-connect-blush.vercel.app',
      repo: 'imramkrishna/Chat-Connect',
      lastCommit: 'updated chat manager to have user search',
      time: 'Nov 26',
      branch: 'main',
      icon: '⚡'
    },
    {
      name: 'crm-system',
      url: 'crm-system-drab.vercel.app',
      repo: 'imramkrishna/MedCRM',
      lastCommit: 'updated admin orders section for solving edit order collapse is...',
      time: 'Nov 16',
      branch: 'main',
      icon: '▲'
    },
    {
      name: 'chess-online',
      url: 'chess-online-five.vercel.app',
      repo: 'imramkrishna/ChessOnline',
      lastCommit: 'updated frontend colors',
      time: 'Nov 15',
      branch: 'main',
      icon: '♟️'
    },
    {
      name: 'portfolio-rkrishna',
      url: 'www.ramkrishnacode.tech',
      repo: 'imramkrishna/ramkrishnacode',
      lastCommit: 'fixed image collapse issue',
      time: 'Nov 15',
      branch: 'main',
      icon: '⚡'
    },
    {
      name: 'x-code-gen',
      url: 'x-code-gen.vercel.app',
      repo: 'imramkrishna/XCodeGen',
      lastCommit: 'updated backend for rate limit issue',
      time: 'Nov 14',
      branch: 'main',
      icon: '✖️'
    },
    {
      name: 'warehouse-management-system',
      url: 'warehouse-management-system-lovat.ve...',
      repo: 'imramkrishna/WarehouseM...',
      lastCommit: 'updated backend - removed prisma from the db',
      time: 'Nov 9',
      branch: 'main',
      icon: '📦'
    }
  ];
  useEffect(()=>{
    const token=localStorage.getItem('accessToken');
    if(!token){
      window.location.href='/login';
    }
  },[])

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800">
      {/* Top Navigation */}
      <header className="border-b border-[#333]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ZyotraLogo className="w-8 h-8" />
            <span className="text-gray-500 text-2xl font-thin">/</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 to-purple-500"></div>
              <span className="font-medium text-sm">Workspace</span>
              <span className="bg-[#333] text-[10px] px-1.5 py-0.5 rounded text-gray-300 border border-[#444]">Hobby</span>
              <FiChevronDown className="text-gray-500 text-lg" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center">
              <FiSearch className="absolute left-3 text-gray-500" />
              <input 
                type="text" 
                placeholder="Find..." 
                className="bg-[#111] border border-[#333] rounded-md py-1.5 pl-9 pr-12 text-sm focus:outline-none focus:border-gray-500 transition-colors w-64 placeholder-gray-600"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="bg-[#222] border border-[#333] rounded px-1.5 text-[10px] text-gray-500 font-sans">F</kbd>
              </div>
            </div>
            <button className="text-sm border border-[#333] rounded-md px-3 py-1.5 hover:bg-[#111] transition-colors text-gray-300">Feedback</button>
            <button className="text-gray-400 hover:text-white transition-colors"><FiBell className="text-lg" /></button>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-orange-500"></div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex gap-6 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === item 
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
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
          <div className="relative flex-1 max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search Projects..." 
              className="w-full bg-black border border-[#333] rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-600"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex border border-[#333] rounded-md p-1 bg-black">
              <button className="p-1.5 rounded bg-[#222] text-white"><FiGrid /></button>
              <button className="p-1.5 rounded text-gray-500 hover:text-gray-300"><FiList /></button>
            </div>
            <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
              Add New... <FiChevronDown />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Usage & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Card */}
            <div className="border border-[#333] rounded-lg p-5 bg-black">
              <h3 className="text-sm font-medium mb-6">Usage</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Last 30 days</span>
                    <button className="bg-[#111] border border-[#333] px-2 py-0.5 rounded text-[10px] hover:border-gray-500 transition-colors">Upgrade</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-gray-600"></div>
                        Edge Requests
                      </span>
                      <span className="text-gray-300">14K / 1M</span>
                    </div>
                    <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[1.4%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-gray-600"></div>
                        ISR Reads
                      </span>
                      <span className="text-gray-300">2.9K / 1M</span>
                    </div>
                    <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[0.3%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-gray-600"></div>
                        Fast Origin Transfer
                      </span>
                      <span className="text-gray-300">20.29 MB / 10 GB</span>
                    </div>
                    <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 w-[0.2%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-gray-600"></div>
                        Fluid Active CPU
                      </span>
                      <span className="text-gray-300">27s / 4h</span>
                    </div>
                    <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[0.2%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                 <button className="p-1 rounded-full border border-[#333] bg-[#111] hover:bg-[#222] transition-colors">
                    <FiChevronDown className="text-gray-500" />
                 </button>
              </div>
            </div>

            {/* Alerts Card */}
            <div>
                <h3 className="text-sm font-medium mb-3">Alerts</h3>
                <div className="border border-[#333] rounded-lg p-6 bg-black text-center">
                <h4 className="text-sm font-medium mb-2">Get alerted for anomalies</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Automatically monitor your projects for anomalies and get notified.
                </p>
                <button className="w-full border border-[#333] bg-[#111] hover:bg-[#222] hover:border-gray-600 text-white text-xs py-2 rounded transition-all">
                    Upgrade to Observability Plus
                </button>
                </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium mb-4">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.name} className="border border-[#333] rounded-lg p-5 bg-black hover:border-gray-500 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-xl">
                        {project.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {project.name}
                        </h4>
                        <a href={`https://${project.url}`} className="text-xs text-gray-500 hover:underline hover:text-gray-400 transition-colors">
                          {project.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center hover:bg-[#222] transition-colors">
                            <FiActivity className="text-gray-400" />
                        </div>
                        <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center hover:bg-[#222] transition-colors">
                            <FiMoreHorizontal className="text-gray-400" />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs bg-[#111] w-fit px-2 py-1 rounded-full border border-[#222]">
                      <FiGithub className="text-gray-400" />
                      <span className="text-gray-300">{project.repo}</span>
                    </div>
                    
                    <div className="text-xs text-gray-400 truncate">
                      {project.lastCommit}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                      <span>{project.time}</span>
                      <span className="flex items-center gap-1">
                        <GoGitBranch />
                        {project.branch}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
