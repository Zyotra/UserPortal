import { useEffect, useState } from 'react';
import { FiGithub, FiSearch, FiPlus, FiTrash2, FiClock, FiExternalLink, FiServer, FiCheckCircle, FiAlertCircle, FiLoader, FiCode, FiMoreVertical, FiEye, FiRefreshCw, FiXCircle } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import ConfirmationModal from './ConfirmationModal';
import ViewLogsModal from './ViewLogsModal';
import Loader from '../Loader';
import ZyotraLogo from '../ZyotraLogo';
import { UI_DEPLOYMENT_URL, WEB_SERVICE_DEPLOYMENT_URL } from '../../types';
import { Frameworks } from '../../types';
interface Project {
    id: number;
    vpsIp: string;
    ownerId: number;
    repoUrl: string;
    domain: string;
    projectType: string;
    logs: string;
    framework: string;
    deploymentId: string;
    status: string;
    createdAt: string;
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<{ id: number; domain: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
    const [selectedProjectForLogs, setSelectedProjectForLogs] = useState<{ deploymentId: string; domain: string } | null>(null);
    const [deployingProjectId, setDeployingProjectId] = useState<number | null>(null);
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [operationStatus, setOperationStatus] = useState<'loading' | 'success' | 'error'>('loading');

    async function fetchProjects() {
        try {
            setLoading(true);
            const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/get-projects`, {
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
        } finally {
            setLoading(false);
        }
    }

    const confirmDelete = (id: number, domain: string) => {
        setProjectToDelete({ id, domain });
        setIsDeleteModalOpen(true);
        setActiveDropdown(null);
    };

    const handleDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleteModalOpen(false);
        setShowLoadingOverlay(true);
        setLoadingMessage('Deleting project...');
        setOperationStatus('loading');

        try {
            const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/delete-project/${projectToDelete.id}` || `http://localhost:5053/delete-project/${projectToDelete.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setOperationStatus('success');
                setLoadingMessage('Project deleted successfully!');
                setProjects(projects.filter(p => p.id !== projectToDelete.id));
                setProjectToDelete(null);
                setTimeout(() => {
                    setShowLoadingOverlay(false);
                }, 1500);
            } else {
                setOperationStatus('error');
                setLoadingMessage('Failed to delete project');
                console.error('Failed to delete project');
                setTimeout(() => {
                    setShowLoadingOverlay(false);
                }, 2000);
            }
        } catch (error) {
            setOperationStatus('error');
            setLoadingMessage(error instanceof Error ? error.message : 'Failed to delete project');
            console.error('Error deleting project:', error);
            setTimeout(() => {
                setShowLoadingOverlay(false);
            }, 2000);
        }
    };

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
            case 'SUCCESS': return 'bg-teal-500';
            case 'BUILDING': return 'bg-blue-500';
            case 'PENDING': return 'bg-yellow-500';
            case 'FAILED':
            case 'ERROR': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    const getProjectIcon = (project: Project) => {
        const item = Frameworks.find(f => f.value == project.framework);
        if (item) {
            const IconComponent = item.icon;
            return <IconComponent className={`text-2xl ${item.color}`} />
        }
        return <FiCode className="text-2xl text-gray-400" />;
    }
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

    const handleDeployLatestCommit = async (deploymentId: string, projectId: number, projectType: string) => {
        if (deployingProjectId) return; // Prevent multiple simultaneous deployments

        setDeployingProjectId(projectId);
        setActiveDropdown(null);
        setShowLoadingOverlay(true);
        setLoadingMessage('Deploying latest commit...');
        setOperationStatus('loading');

        try {
            let response;
            if (projectType === "ui") {
                response = await apiClient(`${UI_DEPLOYMENT_URL}/deploy-latest-ui-commit/${deploymentId}`, {
                    method: 'GET',
                });
            } else {
                response = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/deploy-latest-commit/${deploymentId}`, {
                    method: 'GET',
                });
            }
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setOperationStatus('success');
                setLoadingMessage('Deployment successful!');
                // Refresh projects list after successful deployment
                await fetchProjects();
                // Close overlay after short delay
                setTimeout(() => {
                    setShowLoadingOverlay(false);
                }, 1500);
            } else {
                setOperationStatus('error');
                setLoadingMessage(data.message || 'Deployment failed');
                console.error('Deployment failed:', data.message);
                setTimeout(() => {
                    setShowLoadingOverlay(false);
                }, 2000);
            }
        } catch (error) {
            setOperationStatus('error');
            setLoadingMessage(error instanceof Error ? error.message : 'Failed to deploy');
            console.error('Error deploying latest commit:', error);
            setTimeout(() => {
                setShowLoadingOverlay(false);
            }, 2000);
        } finally {
            setDeployingProjectId(null);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.repoUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.vpsIp.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Loading Overlay for operations */}
            {showLoadingOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Blurred Background */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center bg-[#111] border border-[#333] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm">
                        {/* Logo with animation */}
                        <div className="relative mb-6">
                            {operationStatus === 'loading' && (
                                <>
                                    {/* Outer rotating ring */}
                                    <div className="absolute inset-0 w-24 h-24 -m-2">
                                        <div className="w-full h-full rounded-full border-2 border-transparent border-t-[#e4b2b3] border-r-[#e4b2b3]/50 animate-spin" style={{ animationDuration: '1.5s' }} />
                                    </div>
                                    {/* Inner pulsing glow */}
                                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#e4b2b3]/10 animate-pulse" />
                                </>
                            )}

                            {operationStatus === 'success' && (
                                <div className="absolute inset-0 w-20 h-20 rounded-full bg-green-500/20 animate-pulse" />
                            )}

                            {operationStatus === 'error' && (
                                <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-500/20 animate-pulse" />
                            )}

                            {/* Logo */}
                            <div className={`relative w-20 h-20 flex items-center justify-center ${operationStatus === 'loading' ? 'animate-pulse' : ''
                                }`}>
                                <ZyotraLogo className="w-14 h-14" />
                            </div>
                        </div>

                        {/* Status Icon */}
                        {(operationStatus === 'success' || operationStatus === 'error') && (
                            <div className="mb-4">
                                {operationStatus === 'success' && (
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                        <FiCheckCircle className="text-green-400 text-xl" />
                                    </div>
                                )}
                                {operationStatus === 'error' && (
                                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                                        <FiXCircle className="text-red-400 text-xl" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message */}
                        <h2 className="text-lg font-semibold text-white mb-2 text-center">
                            {loadingMessage}
                        </h2>

                        {operationStatus === 'loading' && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <span>Please wait</span>
                                <span className="flex gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                            </div>
                        )}

                        {operationStatus === 'success' && (
                            <p className="text-green-400/80 text-sm">Completed</p>
                        )}

                        {operationStatus === 'error' && (
                            <p className="text-red-400/80 text-sm">Please try again</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
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
                        <div key={project.id} className="border border-[#333] rounded-lg bg-black hover:border-gray-400 transition-all duration-200 group relative">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col gap-4 lg:gap-6">
                                    {/* Left Section - Domain & Status */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Status Indicator */}
                                            <div className="flex-shrink-0 mt-1">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-opacity-10 border border-current flex items-center justify-center text-base sm:text-lg`}>
                                                    {getProjectIcon(project)}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Domain */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                    <a
                                                        href={`https://${project.domain}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-base sm:text-lg font-semibold text-white hover:text-gray-300 transition-colors flex items-center gap-2 group/link"
                                                    >
                                                        <span className="truncate max-w-[200px] sm:max-w-none">{project.domain}</span>
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
                                                        className="hover:text-white transition-colors truncate font-mono text-xs sm:text-sm"
                                                    >
                                                        {getRepoName(project.repoUrl)}
                                                    </a>
                                                </div>

                                                {/* Logs */}
                                                <div className="bg-[#0a0a0a] border border-[#222] rounded-md p-2 sm:p-3 mb-3">
                                                    <p className="text-xs font-mono text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                                                        {project.logs}
                                                    </p>
                                                </div>

                                                {/* Bottom Info */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <FiServer className="flex-shrink-0" />
                                                        <span className="font-mono">{project.vpsIp}</span>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        <span className="bg-[#111] border border-[#333] px-2 py-0.5 rounded font-mono truncate max-w-[100px]">
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
                                    <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-auto">
                                        {/* View Logs Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProjectForLogs({ deploymentId: project.deploymentId, domain: project.domain });
                                                setIsViewLogsModalOpen(true);
                                            }}
                                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 border border-[#333] hover:border-gray-500"
                                            title="View deployment logs"
                                        >
                                            <FiEye size={14} />
                                            <span className="hidden md:inline">Logs</span>
                                        </button>

                                        {/* More Actions Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === project.id ? null : project.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-md transition-all duration-200 border border-[#333] hover:border-gray-500"
                                                title="More actions"
                                            >
                                                <FiMoreVertical size={16} />
                                            </button>

                                            {activeDropdown === project.id && (
                                                <>
                                                    {/* Backdrop */}
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdown(null);
                                                        }}
                                                    />

                                                    {/* Dropdown Menu */}
                                                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg shadow-2xl z-50 overflow-hidden max-w-[calc(100vw-2rem)]">
                                                        <div className="py-1">
                                                            {/* Deploy Latest Commit */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeployLatestCommit(project.deploymentId, project.id, project.projectType);
                                                                }}
                                                                disabled={deployingProjectId === project.id}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FiRefreshCw size={15} className={deployingProjectId === project.id ? 'animate-spin' : ''} />
                                                                <span>{deployingProjectId === project.id ? 'Deploying...' : 'Deploy Latest Commit'}</span>
                                                            </button>

                                                            <div className="my-1 border-t border-[#2a2a2a]"></div>

                                                            {/* Mobile: Show View Logs */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedProjectForLogs({ deploymentId: project.deploymentId, domain: project.domain });
                                                                    setIsViewLogsModalOpen(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="sm:hidden w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                                            >
                                                                <FiEye size={15} />
                                                                <span>View Logs</span>
                                                            </button>

                                                            {/* Visit Site */}
                                                            <a
                                                                href={`https://${project.domain}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                                            >
                                                                <FiExternalLink size={15} />
                                                                <span>Visit Site</span>
                                                            </a>

                                                            {/* GitHub Repo */}
                                                            <a
                                                                href={project.repoUrl.replace('.git', '')}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                                            >
                                                                <FiGithub size={15} />
                                                                <span>View Repository</span>
                                                            </a>

                                                            <div className="my-1 border-t border-[#2a2a2a]"></div>

                                                            {/* Delete */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    confirmDelete(project.id, project.domain);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                                            >
                                                                <FiTrash2 size={15} />
                                                                <span>Delete Deployment</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
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

            <ViewLogsModal
                isOpen={isViewLogsModalOpen}
                onClose={() => {
                    setIsViewLogsModalOpen(false);
                    setSelectedProjectForLogs(null);
                }}
                deploymentId={selectedProjectForLogs?.deploymentId || ''}
                deploymentType="webservice"
                projectName={selectedProjectForLogs?.domain}
            />
        </div>
    );
};

export default Projects;
