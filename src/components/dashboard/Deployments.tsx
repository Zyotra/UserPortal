import { useEffect, useState } from 'react';
import { FiGitCommit, FiClock, FiExternalLink, FiMoreHorizontal, FiGithub, FiServer, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';
import apiClient from '../../utils/apiClient';
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

const Deployments = () => {
  const [deployments, setDeployments] = useState<Project[]>([]);

  async function fetchProjects() {
    try {
      const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/get-projects`||"http://localhost:5053/get-projects", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        // Show all projects in deployments page
        setDeployments(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'BUILDING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'FAILED': 
      case 'ERROR': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'bg-green-500';
      case 'BUILDING': return 'bg-blue-500 animate-pulse';
      case 'PENDING': return 'bg-yellow-500';
      case 'FAILED': 
      case 'ERROR': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  const getProjectName = (domain: string) => {
    return domain.split('.')[0];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">All Deployments</h2>

      {deployments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No deployments yet. Deploy your first project!
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="border border-[#333] rounded-lg p-4 bg-black hover:border-gray-500 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(deployment.status)}`}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{getProjectName(deployment.domain)}</h3>
                      <span className="text-gray-500 text-sm">•</span>
                      <a href={`https://${deployment.domain}`} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white hover:underline flex items-center gap-1">
                        {deployment.domain} <FiExternalLink className="text-xs" />
                      </a>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {deployment.logs}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiGithub /> {getRepoName(deployment.repoUrl)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiServer /> {deployment.vpsIp}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock /> {formatDate(deployment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(deployment.status)}`}>
                    {getStatusText(deployment.status)}
                  </span>
                  <button className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                    <FiMoreHorizontal />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deployments;
