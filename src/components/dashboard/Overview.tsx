import { useState, useEffect } from 'react';
import { FiSearch, FiGrid, FiList, FiActivity, FiMoreHorizontal, FiGithub, FiChevronDown, FiPlus, FiExternalLink, FiServer, FiEye } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import MachineSelector from './MachineSelector';
import MachineAnalyticsModal from './MachineAnalyticsModal';
import apiClient from '../../utils/apiClient';

interface Project {
  id: number;
  vpsIp: string;
  ownerId: number;
  repoUrl: string;
  domain: string;
  logs: string;
  deploymentId: string;
  status: string;
  createdAt: string;
}

interface Machine {
  id: string;
  vps_ip: string;
  vps_name: string;
  region?: string;
  cpu_cores?: string;
  ram?: string;
  storage?: string;
  vps_status?: string;
}

const Overview = () => {
  const navigate = useNavigate();
  const [showMachineSelector, setShowMachineSelector] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [analyticsModal, setAnalyticsModal] = useState<{ isOpen: boolean; machineId: string; machineName: string; machineIp: string }>({
    isOpen: false,
    machineId: '',
    machineName: '',
    machineIp: ''
  });

  const handleMachineSelect = (machine: any, serviceType: string) => {
    setShowMachineSelector(false);
    if (serviceType === 'webservice') {
      navigate('/new-project', { state: { vpsId: machine.id } });
    } else if (serviceType === 'ui') {
      navigate('/deploy-ui', { state: { vpsId: machine.id } });
    } else {
      // For database and caching, show a coming soon message or handle accordingly
      alert(`${serviceType} deployment coming soon!`);
    }
  };

  async function fetchProjects() {
    try {
      const res = await apiClient("http://localhost:5053/get-projects", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        // Filter only successful projects
        const successfulProjects = data.data.filter((project: Project) => project.status === 'SUCCESS');
        setProjects(successfulProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function fetchMachines() {
    try {
      const res = await apiClient("http://localhost:5051/get-machines", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        setMachines(data.data);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  }

  useEffect(() => {
    fetchProjects();
    fetchMachines();
  }, []);

  const getRepoName = (repoUrl: string) => {
    try {
      const match = repoUrl.match(/github\.com\/(.+?)\.git$/);
      return match ? match[1] : repoUrl;
    } catch {
      return repoUrl;
    }
  };

  const getProjectName = (domain: string) => {
    return domain.split('.')[0];
  };

  const getProjectIcon = (index: number) => {
    const icons = ['⚡', '▲', '♟️', '🚀', '✖️', '📦', '🎯', '💎', '🔥', '⭐'];
    return icons[index % icons.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
        {/* Sidebar - Machines */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-semibold text-white">VPS Machines</h3>
          
          {machines.length === 0 ? (
            <div className="border border-[#333] rounded-2xl p-6 bg-black">
              <p className="text-xs text-gray-500 text-center">No machines available</p>
            </div>
          ) : (
            machines.map((machine) => (
              <div key={machine.id} className="border border-[#333] rounded-2xl p-5 bg-black hover:border-gray-500 transition-all group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <FiServer className="text-lg text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1 truncate">{machine.vps_name}</h4>
                    <p className="text-xs text-gray-500 font-mono">{machine.vps_ip}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      machine.vps_status?.toLowerCase() === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">{machine.storage +"GB Storage"}</span>
                  </div>
                  {machine.region && (
                    <span className="text-xs text-gray-400">{machine.region}</span>
                  )}
                </div>

                {(machine.cpu_cores || machine.ram) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-[#222]">
                    {machine.cpu_cores && (
                      <span className="flex items-center gap-1">
                        <FiActivity className="text-gray-600" /> {machine.cpu_cores}
                      </span>
                    )}
                    {machine.ram && (
                      <span>{machine.ram} GB RAM</span>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setAnalyticsModal({
                    isOpen: true,
                    machineId: machine.id,
                    machineName: machine.vps_name,
                    machineIp: machine.vps_ip
                  })}
                  className="w-full bg-[#111] hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 text-xs py-2.5 rounded-lg transition-all font-medium border border-[#333] hover:border-blue-500/50 flex items-center justify-center gap-2"
                >
                  <FiEye /> View Analytics
                </button>
              </div>
            ))
          )}
        </div>

        {/* Projects Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-white">Active Projects</h3>
             <span className="text-xs text-gray-500">Sorted by last activity</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-500">
                No projects yet. Deploy your first project!
              </div>
            ) : (
              projects.map((project, index) => (
                <div key={project.id} className="group relative border border-[#333] rounded-2xl p-6 bg-black hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
                          <FiMoreHorizontal />
                      </button>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-2xl text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {getProjectIcon(index)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base text-white mb-1 group-hover:text-white transition-colors">
                        {getProjectName(project.domain)}
                      </h4>
                      <a href={`https://${project.domain}`} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                        {project.domain} <FiExternalLink className="inline w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
                      <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                          <GoGitBranch className="text-gray-500" />
                          <span className="font-mono">main</span>
                          <span className="text-gray-600 mx-1">•</span>
                          <span className="text-gray-500">{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate font-medium">
                          {project.logs}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                          <FiGithub />
                          <span className="truncate">{getRepoName(project.repoUrl)}</span>
                      </div>
                      <div className="flex gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            project.status === 'SUCCESS' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                            project.status === 'BUILDING' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] animate-pulse' :
                            'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                          }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MachineAnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, machineId: '', machineName: '', machineIp: '' })}
        machineId={analyticsModal.machineId}
        machineName={analyticsModal.machineName}
        machineIp={analyticsModal.machineIp}
      />
    </div>
  );
};

export default Overview;
