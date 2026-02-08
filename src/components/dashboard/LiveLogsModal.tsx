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
    const [isLive, setIsLive] = useState(logType === 'live');
    const logsEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastLogCountRef = useRef<number>(0); // Track last log count to deduplicate

    const baseUrl = deploymentType === 'ui' ? UI_DEPLOYMENT_URL : WEB_SERVICE_DEPLOYMENT_URL;

    const fetchLogs = async () => {
        try {
            setError(null);

            // Create new AbortController
            const controller = new AbortController();
            abortControllerRef.current = controller;

            // Determine endpoint based on logType
            const endpoint = logType === 'live'
                ? `${baseUrl}/live-logs/${deploymentId}`
                : `${baseUrl}/get-deployment-log/${deploymentId}`;

            const response = await apiClient(endpoint, {
                method: 'GET',
                signal: controller.signal,
            });

            if (response.ok) {
                setLoading(false);

                const contentType = response.headers.get("content-type");

                // Check if it's a streaming response (SSE) - only for live logs
                const isStreaming = logType === 'live' && response.body;

                if (isStreaming) {
                    // Handle streaming response (SSE)
                    const reader = response.body!.getReader();
                    const decoder = new TextDecoder();
                    let accumulatedText = '';

                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            accumulatedText += decoder.decode(value, { stream: true });

                            // Process complete SSE messages
                            const lines = accumulatedText.split('\n');

                            // Keep the last incomplete line in accumulator
                            accumulatedText = lines[lines.length - 1];

                            // Process all complete lines
                            for (let i = 0; i < lines.length - 1; i++) {
                                const line = lines[i].trim();

                                if (line.startsWith('data: ')) {
                                    try {
                                        const jsonStr = line.substring(6); // Remove "data: " prefix
                                        const parsed = JSON.parse(jsonStr);

                                        // Format the log entry
                                        let formattedLog = '';

                                        if (parsed.type === 'connected') {
                                            formattedLog = `[CONNECTED] Deployment: ${parsed.deploymentId}`;
                                        } else if (parsed.type === 'closed') {
                                            formattedLog = `[CLOSED] Connection ended`;
                                        } else if (parsed.type === 'log' || parsed.type === 'error') {
                                            const timestamp = parsed.timestamp ? new Date(parsed.timestamp).toLocaleTimeString() : '';
                                            const logData = parsed.data || '';

                                            // Split multi-line logs
                                            const logLines = logData.split('\n').filter((l: string) => l.trim());

                                            logLines.forEach((logLine: string, idx: number) => {
                                                let formattedLine = logLine;

                                                // Try to detect and format JSON
                                                const jsonMatch = logLine.match(/\{.*\}|\[.*\]/);
                                                if (jsonMatch) {
                                                    try {
                                                        const jsonObj = JSON.parse(jsonMatch[0]);
                                                        formattedLine = logLine.replace(jsonMatch[0], JSON.stringify(jsonObj, null, 2));
                                                    } catch (e) {
                                                        // Not valid JSON, keep original
                                                    }
                                                }

                                                if (idx === 0 && timestamp) {
                                                    formattedLog = `[${timestamp}] ${formattedLine}`;
                                                } else {
                                                    formattedLog = formattedLine;
                                                }

                                                setLogs(prev => {
                                                    // Avoid duplicates
                                                    if (!prev.includes(formattedLog)) {
                                                        return [...prev, formattedLog];
                                                    }
                                                    return prev;
                                                });
                                            });
                                        }

                                        if (formattedLog && parsed.type !== 'log' && parsed.type !== 'error') {
                                            setLogs(prev => [...prev, formattedLog]);
                                        }
                                    } catch (parseErr) {
                                        console.error('Failed to parse SSE message:', line);
                                    }
                                }
                            }
                        }

                        // Process any remaining accumulated text
                        if (accumulatedText.trim().startsWith('data: ')) {
                            try {
                                const jsonStr = accumulatedText.trim().substring(6);
                                const parsed = JSON.parse(jsonStr);
                                setLogs(prev => [...prev, JSON.stringify(parsed)]);
                            } catch (parseErr) {
                                console.error('Failed to parse final SSE message');
                            }
                        }
                    } catch (streamErr) {
                        if (streamErr instanceof Error && streamErr.name === 'AbortError') {
                            console.log('Stream aborted');
                            return;
                        }
                        console.error('Error reading stream:', streamErr);
                    }
                } else if (contentType && contentType.includes("application/json")) {
                    // Handle JSON responses
                    const data = await response.json();
                    let newLogLines: string[] = [];

                    if (data.logs) {
                        newLogLines = Array.isArray(data.logs)
                            ? data.logs
                            : data.logs.split('\n').filter((line: string) => line.trim());
                    } else if (data.data) {
                        newLogLines = Array.isArray(data.data)
                            ? data.data
                            : data.data.split('\n').filter((line: string) => line.trim());
                    } else if (data.log) {
                        newLogLines = Array.isArray(data.log)
                            ? data.log
                            : data.log.split('\n').filter((line: string) => line.trim());
                    }

                    setLogs(prev => [...prev, ...newLogLines]);
                } else {
                    // Handle plain text responses
                    const text = await response.text();
                    const textLogs = text.split('\n').filter(line => line.trim());
                    setLogs(prev => [...prev, ...textLogs]);
                }
            } else {
                setError(`Failed to fetch logs: ${response.statusText}`);
                setLoading(false);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Request aborted');
                return;
            }
            setError('Error connecting to log server');
            console.error('Error fetching logs:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isOpen && deploymentId) {
            setLogs([]); // Clear logs only when opening new deployment
            setLoading(true);
            fetchLogs();

            // Poll only for live logs every 3 seconds
            // For build logs, fetch once and don't poll
            if (isLive && logType === 'live') {
                intervalRef.current = setInterval(fetchLogs, 3000);
            }
        }

        return () => {
            // Abort the fetch request when component unmounts or modal closes
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Clear the interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isOpen, deploymentId, isLive, logType]);

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
                            {logs.map((log, index) => {
                                // Determine log type and color
                                const logLower = log.toLowerCase();
                                let textColor = 'text-gray-300';
                                let bgColor = '';
                                let icon = '';

                                if (logLower.includes('[error]') || logLower.includes('error')) {
                                    textColor = 'text-red-400';
                                    bgColor = 'group-hover:bg-red-950/20';
                                    icon = '❌';
                                } else if (logLower.includes('[warn]') || logLower.includes('warning')) {
                                    textColor = 'text-yellow-400';
                                    bgColor = 'group-hover:bg-yellow-950/20';
                                    icon = '⚠️';
                                } else if (logLower.includes('[success]') || logLower.includes('deployed successfully') || logLower.includes('success')) {
                                    textColor = 'text-green-400';
                                    bgColor = 'group-hover:bg-green-950/20';
                                    icon = '✅';
                                } else if (logLower.includes('[connected]') || logLower.includes('[closed]')) {
                                    textColor = 'text-cyan-400';
                                    bgColor = 'group-hover:bg-cyan-950/20';
                                    icon = '🔗';
                                } else if (logLower.includes('[info]') || logLower.includes('info')) {
                                    textColor = 'text-blue-400';
                                    bgColor = 'group-hover:bg-blue-950/20';
                                    icon = 'ℹ️';
                                }

                                // Handle multi-line logs (JSON formatted)
                                const logLines = log.split('\n');
                                const isMultiLine = logLines.length > 1;

                                return (
                                    <div key={index} className={`flex flex-col group rounded -mx-2 transition-colors ${bgColor}`}>
                                        <div className={`flex hover:bg-[#111] rounded px-2 py-0.5 transition-colors`}>
                                            <span className="text-gray-600 select-none w-12 flex-shrink-0 text-right pr-4 text-xs">
                                                {index + 1}
                                            </span>
                                            <span className={`break-all font-mono text-xs leading-relaxed ${textColor}`}>
                                                {icon && <span className="mr-2">{icon}</span>}
                                                {logLines[0]}
                                            </span>
                                        </div>
                                        {/* Display additional lines with indentation */}
                                        {isMultiLine && logLines.slice(1).map((line, lineIdx) => (
                                            <div
                                                key={`${index}-${lineIdx}`}
                                                className="flex hover:bg-[#111] rounded px-2 py-0.5 transition-colors ml-2"
                                            >
                                                <span className="text-gray-700 select-none w-12 flex-shrink-0 text-right pr-4 text-xs" />
                                                <span className={`break-all font-mono text-xs leading-relaxed ${textColor}`}>
                                                    {line}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
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
