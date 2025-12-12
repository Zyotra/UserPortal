import { useState } from 'react';
import { FiSearch, FiGrid, FiList, FiActivity, FiMoreHorizontal, FiGithub, FiChevronDown, FiPlus, FiExternalLink } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import MachineSelector from './MachineSelector';

const Overview = () => {
  const navigate = useNavigate();
  const [showMachineSelector, setShowMachineSelector] = useState(false);

  const handleMachineSelect = (machine: any) => {
    setShowMachineSelector(false);
    navigate('/new-project', { state: { vpsId: machine.id } });
  };

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

  return (
    <div className="space-y-8">
      {showMachineSelector && (
        <MachineSelector 
          onSelect={handleMachineSelect} 
          onClose={() => setShowMachineSelector(false)} 
        />
      )}
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-xl w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Projects..." 
            className="w-full bg-black border border-[#333] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-white transition-all placeholder-gray-600 text-white shadow-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex bg-black rounded-xl p-1 border border-[#333]">
            <button className="p-2 rounded-lg bg-[#222] text-white shadow-sm"><FiGrid /></button>
            <button className="p-2 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"><FiList /></button>
          </div>
          <button 
            onClick={() => setShowMachineSelector(true)}
            className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <FiPlus className="text-lg" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Usage & Alerts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Usage Card */}
          <div className="border border-[#333] rounded-2xl p-6 bg-black">
            <h3 className="text-sm font-semibold mb-6 text-white flex items-center gap-2">
              Usage Overview
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Edge Requests</span>
                  <span className="text-white font-medium">14K / 1M</span>
                </div>
                <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">

                  <div className="h-full bg-blue-500 w-[1.4%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">ISR Reads</span>
                  <span className="text-white font-medium">2.9K / 1M</span>
                </div>
                <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[0.3%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Bandwidth</span>
                  <span className="text-white font-medium">20.29 MB / 10 GB</span>
                </div>
                <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 w-[0.2%] rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Compute Time</span>
                  <span className="text-white font-medium">27s / 4h</span>
                </div>
                <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[0.2%] rounded-full"></div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 border border-[#333] text-gray-400 text-xs py-2.5 rounded-xl hover:bg-[#111] hover:text-white transition-all font-medium">
                View Full Analytics
            </button>
          </div>

          {/* Alerts Card */}
          <div className="border border-[#333] rounded-2xl p-6 bg-black">
              <h3 className="text-sm font-semibold mb-3 text-white">System Status</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">All systems operational</span>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Enable advanced monitoring to track anomalies in real-time.
              </p>
              <button className="w-full bg-[#111] hover:bg-[#222] text-white text-xs py-2.5 rounded-xl transition-all font-medium border border-[#333]">
                  Configure Alerts
              </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-white">Active Projects</h3>
             <span className="text-xs text-gray-500">Sorted by last activity</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <div key={project.name} className="group relative border border-[#333] rounded-2xl p-6 bg-black hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <FiMoreHorizontal />
                    </button>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-2xl text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {project.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-white mb-1 group-hover:text-white transition-colors">
                      {project.name}
                    </h4>
                    <a href={`https://${project.url}`} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                      {project.url} <FiExternalLink className="inline w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                        <GoGitBranch className="text-gray-500" />
                        <span className="font-mono">{project.branch}</span>
                        <span className="text-gray-600 mx-1">•</span>
                        <span className="text-gray-500">{project.time}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate font-medium">
                        {project.lastCommit}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                        <FiGithub />
                        <span>{project.repo}</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
