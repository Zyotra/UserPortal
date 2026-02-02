import { useEffect, useState } from 'react';
import { FiClock, FiExternalLink, FiGithub, FiServer, FiEye, FiGlobe, FiActivity, FiCheckCircle, FiAlertCircle, FiLoader, FiMoreVertical } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import ViewLogsModal from './ViewLogsModal';
import Loader from '../Loader';
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
    const [loading, setLoading] = useState(true);
    const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
    const [selectedDeployment, setSelectedDeployment] = useState<{ deploymentId: string; domain: string } | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    async function fetchProjects() {
        try {
            setLoading(true);
            const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/get-projects` || "http://localhost:5053/get-projects", {
                method: "GET",
            });
            const data = await res.json();
            if (data.data) {
                // Show all projects in deployments page
                setDeployments(data.data);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader size="lg" />
            </div>
        );
    }

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
                        <div key={deployment.id} className="border border-[#333] rounded-lg p-3 sm:p-4 bg-black hover:border-gray-500 transition-colors">
                            <div className="flex flex-col gap-4">
                                {/* Header with status */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="mt-1.5 flex-shrink-0">
                                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(deployment.status)}`}></div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                                <h3 className="font-medium text-white">{getProjectName(deployment.domain)}</h3>
                                                <span className="text-gray-500 text-sm hidden sm:inline">•</span>
                                                <a href={`https://${deployment.domain}`} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white hover:underline flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                                                    <span className="truncate">{deployment.domain}</span> <FiExternalLink className="text-xs flex-shrink-0" />
                                                </a>
                                            </div>
                                            <div className="text-sm text-gray-300 mb-2 line-clamp-2 sm:line-clamp-1">
                                                {deployment.logs}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2 py-0.5 rounded text-xs border whitespace-nowrap ${getStatusColor(deployment.status)}`}>
                                            {getStatusText(deployment.status)}
                                        </span>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === deployment.id ? null : deployment.id);
                                                }}
                                                className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors"
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {activeDropdown === deployment.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-[#111] border border-[#333] rounded-lg shadow-xl z-10 overflow-hidden">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedDeployment({ deploymentId: deployment.deploymentId, domain: deployment.domain });
                                                            setIsViewLogsModalOpen(true);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors"
                                                    >
                                                        <FiEye size={14} />
                                                        View Logs
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pl-5 sm:pl-6">
                                    <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                                        <FiGithub className="flex-shrink-0" /> <span className="truncate">{getRepoName(deployment.repoUrl)}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiServer className="flex-shrink-0" /> {deployment.vpsIp}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiClock className="flex-shrink-0" /> {formatDate(deployment.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ViewLogsModal
                isOpen={isViewLogsModalOpen}
                onClose={() => {
                    setIsViewLogsModalOpen(false);
                    setSelectedDeployment(null);
                }}
                deploymentId={selectedDeployment?.deploymentId || ''}
                deploymentType="webservice"
                projectName={selectedDeployment?.domain}
            />
        </div>
    );
};

export default Deployments;
