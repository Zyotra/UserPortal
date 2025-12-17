import { useEffect, useState } from 'react';
import { FiX, FiServer, FiCpu, FiHardDrive, FiActivity, FiMonitor, FiLoader } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import parseSystemData from '../../Parser/machineDataParser';
import { DEPLOYMENT_MANAGER_URL } from '../../types';

interface MachineAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
  machineIp: string;
}

interface SystemData {
  memory: {
    memory: {
      total: number;
      used: number;
      free: number;
      shared: number;
      buff_cache: number;
      available: number;
    };
    swap: {
      total: number;
      used: number;
      free: number;
    };
  };
  disk: Array<{
    filesystem: string;
    size: string;
    used: string;
    avail: string;
    usePercent: string;
    mountedOn: string;
  }>;
  cpu: {
    model: string;
  };
  os: string;
  processes: Array<{
    pid: string;
    user: string;
    pr: string;
    ni: string;
    virt: string;
    res: string;
    shr: string;
    status: string;
    cpu: string;
    mem: string;
    time: string;
    command: string;
  }>;
}

const MachineAnalyticsModal = ({ isOpen, onClose, machineId, machineName, machineIp }: MachineAnalyticsModalProps) => {
  const [loading, setLoading] = useState(true);
  const [systemData, setSystemData] = useState<SystemData | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMachineAnalytics();
    }
  }, [isOpen, machineId]);

  const fetchMachineAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-machine-analytics/${machineId}`||`http://localhost:5051/get-machine-analytics/${machineId}`, {
        method: 'GET',
      });
      const data = await res.json();
      if (data.data) {
        const parsed = parseSystemData(data.data);
        setSystemData(parsed);
      }
    } catch (error) {
      console.error('Error fetching machine analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const ProgressBar = ({ used, total, color }: { used: number; total: number; color: string }) => {
    const percentage = total > 0 ? (used / total) * 100 : 0;
    return (
      <div className="relative">
        <div className="h-3 w-full bg-[#111] rounded-full overflow-hidden border border-[#333]">
          <div
            className={`h-full ${color} transition-all duration-500 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 mt-1 block">{percentage.toFixed(1)}% Used</span>
      </div>
    );
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333] bg-[#111]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              <FiServer className="text-2xl text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{machineName}</h2>
              <p className="text-sm text-gray-400 font-mono">{machineIp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FiLoader className="text-4xl text-blue-500 animate-spin" />
            </div>
          ) : systemData ? (
            <div className="p-6 space-y-6">
              {/* System Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#333] rounded-xl p-5 bg-black">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCpu className="text-xl text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">CPU Information</h3>
                  </div>
                  <p className="text-sm text-gray-300 font-mono leading-relaxed">{systemData.cpu.model}</p>
                </div>

                <div className="border border-[#333] rounded-xl p-5 bg-black">
                  <div className="flex items-center gap-3 mb-3">
                    <FiMonitor className="text-xl text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Operating System</h3>
                  </div>
                  <p className="text-sm text-gray-300 font-mono">{systemData.os}</p>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="border border-[#333] rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <FiActivity className="text-2xl text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Memory Usage</h3>
                </div>

                <div className="space-y-6">
                  {/* RAM */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">RAM</span>
                      <span className="text-sm font-mono text-gray-400">
                        {formatBytes(systemData.memory.memory.used)} / {formatBytes(systemData.memory.memory.total)}
                      </span>
                    </div>
                    <ProgressBar
                      used={systemData.memory.memory.used}
                      total={systemData.memory.memory.total}
                      color="bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                    <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                      <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
                        <div className="text-gray-500 mb-1">Free</div>
                        <div className="text-white font-semibold">{formatBytes(systemData.memory.memory.free)}</div>
                      </div>
                      <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
                        <div className="text-gray-500 mb-1">Buff/Cache</div>
                        <div className="text-white font-semibold">{formatBytes(systemData.memory.memory.buff_cache)}</div>
                      </div>
                      <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
                        <div className="text-gray-500 mb-1">Available</div>
                        <div className="text-white font-semibold">{formatBytes(systemData.memory.memory.available)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Swap */}
                  {systemData.memory.swap.total > 0 && (
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Swap</span>
                        <span className="text-sm font-mono text-gray-400">
                          {formatBytes(systemData.memory.swap.used)} / {formatBytes(systemData.memory.swap.total)}
                        </span>
                      </div>
                      <ProgressBar
                        used={systemData.memory.swap.used}
                        total={systemData.memory.swap.total}
                        color="bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Disk Usage */}
              <div className="border border-[#333] rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <FiHardDrive className="text-2xl text-green-400" />
                  <h3 className="text-xl font-bold text-white">Disk Usage</h3>
                </div>

                <div className="space-y-4">
                  {systemData.disk.map((disk, index) => (
                    <div key={index} className="bg-[#111] rounded-lg p-4 border border-[#222]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white font-mono">{disk.filesystem}</div>
                          <div className="text-xs text-gray-500 mt-1">{disk.mountedOn}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-gray-300">{disk.used} / {disk.size}</div>
                          <div className="text-xs text-gray-500 mt-1">{disk.avail} available</div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-2 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-[#333]">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: disk.usePercent }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">{disk.usePercent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Processes */}
              <div className="border border-[#333] rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <FiActivity className="text-2xl text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Top Processes</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-[#333]">
                      <tr className="text-left text-gray-400">
                        <th className="pb-3 pr-4 font-medium">PID</th>
                        <th className="pb-3 pr-4 font-medium">USER</th>
                        <th className="pb-3 pr-4 font-medium">CPU%</th>
                        <th className="pb-3 pr-4 font-medium">MEM%</th>
                        <th className="pb-3 pr-4 font-medium">STATUS</th>
                        <th className="pb-3 font-medium">COMMAND</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {systemData.processes.slice(0, 15).map((process, index) => (
                        <tr key={index} className="hover:bg-[#111] transition-colors">
                          <td className="py-2 pr-4 text-gray-300 font-mono">{process.pid}</td>
                          <td className="py-2 pr-4 text-gray-400">{process.user}</td>
                          <td className="py-2 pr-4">
                            <span className={`${parseFloat(process.cpu) > 50 ? 'text-red-400' : parseFloat(process.cpu) > 20 ? 'text-yellow-400' : 'text-gray-300'}`}>
                              {process.cpu}%
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`${parseFloat(process.mem) > 10 ? 'text-red-400' : 'text-gray-300'}`}>
                              {process.mem}%
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              process.status === 'R' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {process.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-300 font-mono truncate max-w-xs">{process.command}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Failed to load analytics data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineAnalyticsModal;
