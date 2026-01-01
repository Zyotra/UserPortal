import { useState } from 'react';
import { FiX, FiFileText, FiActivity, FiExternalLink } from 'react-icons/fi';
import { UI_DEPLOYMENT_URL, WEB_SERVICE_DEPLOYMENT_URL } from '../../types';
import LiveLogsModal from './LiveLogsModal';

interface ViewLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deploymentId: string;
    deploymentType: 'ui' | 'webservice';
    projectName?: string;
}

const ViewLogsModal = ({
    isOpen,
    onClose,
    deploymentId,
    deploymentType,
    projectName
}: ViewLogsModalProps) => {
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedLogType, setSelectedLogType] = useState<'live' | 'build'>('live');

    if (!isOpen) return null;

    const handleOpenDeploymentLogs = () => {
        setSelectedLogType('build');
        setShowLogsModal(true);
    };

    const handleOpenLiveLogs = () => {
        setSelectedLogType('live');
        setShowLogsModal(true);
    };

    if (showLogsModal) {
        return (
            <LiveLogsModal
                isOpen={true}
                onClose={() => {
                    setShowLogsModal(false);
                    // Don't close parent modal, just go back to selection
                }}
                deploymentId={deploymentId}
                deploymentType={deploymentType}
                projectName={projectName}
                logType={selectedLogType}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#333]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                            <FiFileText className="text-xl text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">View Logs</h3>
                            {projectName && (
                                <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{projectName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                    <p className="text-sm text-gray-400 mb-4">
                        Select the type of logs you want to view.
                    </p>

                    {/* Log Options - Horizontal Layout */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Deployment Logs Option */}
                        <button
                            onClick={handleOpenDeploymentLogs}
                            className="group flex flex-col items-center gap-3 p-4 bg-[#111] border border-[#333] rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <FiFileText className="text-2xl text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    Deployment
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">Build logs</p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/30">
                                Terminal
                            </span>
                        </button>

                        {/* Live Logs Option */}
                        <button
                            onClick={handleOpenLiveLogs}
                            className="group flex flex-col items-center gap-3 p-4 bg-[#111] border border-[#333] rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200"
                        >
                            <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                <FiActivity className="text-2xl text-green-400" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">
                                    Live Logs
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">Runtime logs</p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/30">
                                Terminal
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-[#111] border border-[#222] rounded-lg px-3 py-2">
                        <span className="text-gray-500">ID:</span>
                        <code className="font-mono text-gray-400 truncate">{deploymentId}</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewLogsModal;
