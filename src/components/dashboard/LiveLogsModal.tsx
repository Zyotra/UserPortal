import { useEffect, useState, useRef } from 'react';
import { FiX, FiTerminal, FiDownload, FiRefreshCw, FiCircle, FiFileText } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import Loader from '../Loader';
import { UI_DEPLOYMENT_URL, WEB_SERVICE_DEPLOYMENT_URL } from '../../types';

interface LiveLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deploymentId: string;
    deploymentType: 'ui' | 'webservice';
    projectName?: string;
    logType: 'live' | 'build'; // New prop to distinguish between live runtime logs and build/deployment logs
}

const LiveLogsModal = ({
    isOpen,
    onClose,
    deploymentId,
    deploymentType,
    projectName,
    logType
}: LiveLogsModalProps) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Default to live mode only if logType is 'live'
    const [isLive, setIsLive] = useState(logType === 'live');
    const logsEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);

    const baseUrl = deploymentType === 'ui' ? UI_DEPLOYMENT_URL : WEB_SERVICE_DEPLOYMENT_URL;

    const fetchLogs = async () => {
        try {
            setError(null);
            // Determine endpoint based on logType
            const endpoint = logType === 'live'
                ? `${baseUrl}/live-logs/${deploymentId}`
                : `${baseUrl}/get-deployment-log/${deploymentId}`;

            const response = await apiClient(endpoint, {
                method: 'GET',
            });

            if (response.ok) {
                // Try to parse as JSON first, if fails treat as text
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    if (data.logs) {
                        const logLines = Array.isArray(data.logs)
                            ? data.logs
                            : data.logs.split('\n').filter((line: string) => line.trim());
                        setLogs(logLines);
                    } else if (data.data) {
                        const logLines = Array.isArray(data.data)
                            ? data.data
                            : data.data.split('\n').filter((line: string) => line.trim());
                        setLogs(logLines);
                    } else if (data.log) {
                        const logLines = Array.isArray(data.log)
                            ? data.log
                            : data.log.split('\n').filter((line: string) => line.trim());
                        setLogs(logLines);
                    } else {
                        // Fallback if structure is different
                        setLogs([JSON.stringify(data, null, 2)]);
                    }
                } else {
                    // Text response
                    const text = await response.text();
                    setLogs(text.split('\n').filter(line => line.trim()));
                }
            } else {
                setError(`Failed to fetch logs: ${response.statusText}`);
            }
        } catch (err) {
            setError('Error connecting to log server');
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && deploymentId) {
            setLogs([]);
            setLoading(true);
            fetchLogs();

            // Poll for live logs every 3 seconds if live mode is enabled
            // For build logs, we might not want auto-polling by default, but user can enable it
            if (isLive) {
                intervalRef.current = setInterval(fetchLogs, 3000);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isOpen, deploymentId, isLive, logType]); // Added logType dependency

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleDownload = () => {
        const logContent = logs.join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName || deploymentId}-${logType}-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleLiveMode = () => {
        setIsLive(!isLive);
        if (!isLive) {
            fetchLogs();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-5xl h-[80vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#333] bg-[#111]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <div className="ml-2">
                            <div className="flex items-center gap-2">
                                {logType === 'live' ? <FiTerminal className="text-green-400" /> : <FiFileText className="text-blue-400" />}
                                <h3 className="text-sm font-semibold text-white">
                                    {logType === 'live' ? 'Live Runtime Logs' : 'Build / Deployment Logs'}
                                </h3>
                                {isLive && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                                        <FiCircle className="w-2 h-2 fill-current animate-pulse" />
                                        Live
                                    </span>
                                )}
                            </div>
                            {projectName && (
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{projectName}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLiveMode}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${isLive
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                                : 'bg-[#222] text-gray-400 border border-[#333] hover:bg-[#333]'
                                }`}
                            title={isLive ? 'Pause updates' : 'Resume updates'}
                        >
                            <FiRefreshCw className={isLive ? 'animate-spin' : ''} size={12} />
                            {isLive ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={logs.length === 0}
                            className="px-3 py-1.5 bg-[#222] text-gray-300 border border-[#333] rounded-lg hover:bg-[#333] hover:text-white transition-colors text-xs font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download logs"
                        >
                            <FiDownload size={12} />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <FiX className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 overflow-y-auto bg-[#0a0a0a] font-mono text-sm custom-scrollbar">
                    {loading && logs.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader size="md" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-red-400 mb-2">{error}</p>
                                <button
                                    onClick={fetchLogs}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No logs available...</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-0.5">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className="flex group hover:bg-[#111] rounded px-2 py-0.5 -mx-2 transition-colors"
                                >
                                    <span className="text-gray-600 select-none w-12 flex-shrink-0 text-right pr-4 text-xs">
                                        {index + 1}
                                    </span>
                                    <span className={`break-all ${log.toLowerCase().includes('error') ? 'text-red-400' :
                                        log.toLowerCase().includes('warn') ? 'text-yellow-400' :
                                            log.toLowerCase().includes('success') ? 'text-green-400' :
                                                log.toLowerCase().includes('info') ? 'text-blue-400' :
                                                    'text-gray-300'
                                        }`}>
                                        {log}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#333] bg-[#111] flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{logs.length} lines</span>
                        <span className="text-[#333]">|</span>
                        <code className="font-mono text-gray-400">{deploymentId}</code>
                    </div>
                    <div className="text-xs text-gray-600">
                        {isLive ? 'Auto-refreshing' : 'Paused'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveLogsModal;
