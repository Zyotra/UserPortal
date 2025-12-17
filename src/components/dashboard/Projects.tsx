import { useEffect, useState } from 'react';
import { FiGithub, FiSearch, FiPlus, FiTrash2, FiClock, FiExternalLink, FiServer, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import ConfirmationModal from './ConfirmationModal';
import { WEB_SERVICE_DEPLOYMENT_URL } from '../../types';

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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; domain: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const confirmDelete = (id: number, domain: string) => {
    setProjectToDelete({ id, domain });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/delete-project/${projectToDelete.id}`||`http://localhost:5053/delete-project/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== projectToDelete.id));
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'bg-teal-500';
      case 'BUILDING': return 'bg-blue-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'FAILED': 
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return <FiCheckCircle />;
      case 'BUILDING': return <FiLoader className="animate-spin" />;
      case 'FAILED': 
      case 'ERROR': return <FiAlertCircle />;
      default: return <FiLoader />;
    }
  };

  const getStatusText = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRepoName = (repoUrl: string) => {
    try {
      const match = repoUrl.match(/github\.com\/(.+?)\.git$/);
      return match ? match[1] : repoUrl;
    } catch {
      return repoUrl;
    }
  };

  const filteredProjects = projects.filter(project => 
    project.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.repoUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.vpsIp.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-600 text-white"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No projects found matching your search.' : 'No projects yet. Deploy your first project!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="border border-[#333] rounded-lg bg-black hover:border-gray-400 transition-all duration-200 group overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Section - Domain & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-lg ${getStatusColor(project.status)} bg-opacity-10 border border-current flex items-center justify-center text-lg`}>
                          {getStatusIcon(project.status)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Domain */}
                        <div className="flex items-center gap-3 mb-2">
                          <a 
                            href={`https://${project.domain}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-lg font-semibold text-white hover:text-gray-300 transition-colors flex items-center gap-2 group/link"
                          >
                            <span className="truncate">{project.domain}</span>
                            <FiExternalLink className="text-sm flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </a>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(project.status)} ${project.status === 'BUILDING' ? 'animate-pulse' : ''}`} />
                            <span className="text-xs font-medium text-gray-400">{getStatusText(project.status)}</span>
                          </div>
                        </div>

                        {/* Repository */}
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <FiGithub className="flex-shrink-0" />
                          <a 
                            href={project.repoUrl.replace('.git', '')} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:text-white transition-colors truncate font-mono"
                          >
                            {getRepoName(project.repoUrl)}
                          </a>
                        </div>

                        {/* Logs */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-md p-3 mb-3">
                          <p className="text-xs font-mono text-gray-400 leading-relaxed">
                            {project.logs}
                          </p>
                        </div>

                        {/* Bottom Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FiServer className="flex-shrink-0" />
                            <span className="font-mono">{project.vpsIp}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#111] border border-[#333] px-2 py-0.5 rounded font-mono">
                              {project.deploymentId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiClock className="flex-shrink-0" />
                            <span>{formatDate(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <button 
                      onClick={() => confirmDelete(project.id, project.domain)}
                      className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all text-sm flex items-center gap-2 border border-[#333] hover:border-red-500/50"
                      title="Delete Deployment"
                    >
                      <FiTrash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Deployment"
        message={`Are you sure you want to delete the deployment for "${projectToDelete?.domain}"? This action cannot be undone and will permanently remove this deployment.`}
        confirmText="Delete Deployment"
        isDangerous={true}
      />
    </div>
  );
};

export default Projects;
