import { useEffect, useState } from 'react';
import { FiServer, FiMoreHorizontal, FiCpu, FiActivity, FiTrash2, FiEye, FiGithub } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import apiClient from '../../utils/apiClient';
import ConfirmationModal from './ConfirmationModal';
import AddMachineModal from './AddMachineModal';
import MachineAnalyticsModal from './MachineAnalyticsModal';
import Loader from '../Loader';
import { DEPLOYMENT_MANAGER_URL } from '../../types';

interface MachineType {
  id: string,
  vps_ip: string,
  vps_name: string,
  region?: string,
  cpu_cores?: string,
  ram?: string,
  storage?: string,
  vps_status?: string,
}

const VPSMachines = () => {
  const [machines, setMachines] = useState<MachineType[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState<{ isOpen: boolean; machineId: string; machineName: string; machineIp: string }>({
    isOpen: false,
    machineId: '',
    machineName: '',
    machineIp: ''
  });
  const [githubModal, setGithubModal] = useState<{ isOpen: boolean; machineId: string; machineName: string }>({
    isOpen: false,
    machineId: '',
    machineName: ''
  });
  const [githubStatus, setGithubStatus] = useState<{ username: string } | null>(null);
  const [githubForm, setGithubForm] = useState({ username: '', token: '' });
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [showTokenSteps, setShowTokenSteps] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-machines` || "http://localhost:5051/get-machines", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        setMachines(data.data);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
      toast.error("Failed to fetch machines");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMachines();
  }, [])

  const handleAddMachine = async (machineData: any) => {
    const loadingToast = toast.loading("Adding machine...");
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/add-machine` || "http://localhost:5051/add-machine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(machineData),
      });

      if (!res.ok) throw new Error("Failed to add machine");

      toast.success("Machine added successfully", { id: loadingToast });
      setShowAddModal(false);
      fetchMachines(); // Refresh list
    } catch (error) {
      console.error("Error adding machine:", error);
      toast.error("Failed to add machine", { id: loadingToast });
    }
  };

  const confirmDeleteMachine = async () => {
    if (!deleteId) return;

    const loadingToast = toast.loading("Deleting machine...");
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/delete-machine/${deleteId}` || `http://localhost:5051/delete-machine/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete machine");

      toast.success("Machine deleted successfully", { id: loadingToast });
      fetchMachines(); // Refresh list
    } catch (error) {
      console.error("Error deleting machine:", error);
      toast.error("Failed to delete machine", { id: loadingToast });
    } finally {
      setDeleteId(null);
    }
  };

  const handleGithubClick = async (machineId: string, machineName: string) => {
    setGithubModal({ isOpen: true, machineId, machineName });
    setLoadingGithub(true);

    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-github-auths/${machineId}`, {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.github_username) {
          setGithubStatus({ username: data.data.github_username });
        } else {
          setGithubStatus(null);
        }
      } else {
        setGithubStatus(null);
      }
    } catch (error) {
      console.error("Error fetching GitHub status:", error);
      setGithubStatus(null);
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleAuthenticateGithub = async () => {
    if (!githubForm.username || !githubForm.token) {
      toast.error("Please enter both username and personal access token");
      return;
    }

    const loadingToast = toast.loading("Authenticating GitHub...");
    setLoadingGithub(true);

    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/authenticate-github/${githubModal.machineId}`, {
        method: "POST",
        body: JSON.stringify({
          githubUsername: githubForm.username,
          githubToken: githubForm.token,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Use username from API response to ensure consistency
        if (data.data && data.data.github_username) {
          setGithubStatus({ username: data.data.github_username });
        } else {
          // Fallback to form value if API doesn't return username
          setGithubStatus({ username: githubForm.username });
        }
        toast.success("GitHub authenticated successfully", { id: loadingToast });
        setGithubForm({ username: '', token: '' });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to authenticate GitHub. Check your username or personal access token", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error authenticating GitHub:", error);
      toast.error("Failed to authenticate GitHub", { id: loadingToast });
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleUnauthenticateGithub = async () => {
    const loadingToast = toast.loading("Removing GitHub authentication...");
    setLoadingGithub(true);

    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/unauthenticate-github/${githubModal.machineId}`, {
        method: "GET",
      });

      if (res.ok) {
        toast.success("GitHub authentication removed successfully", { id: loadingToast });
        setGithubStatus(null);
        setGithubForm({ username: '', token: '' });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to remove GitHub authentication", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error removing GitHub authentication:", error);
      toast.error("Failed to remove GitHub authentication", { id: loadingToast });
    } finally {
      setLoadingGithub(false);
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">VPS Machines</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Add New Machine
        </button>
      </div>

      <div className="border border-[#333] rounded-lg overflow-hidden bg-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111] text-gray-200 border-b border-[#333]">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Region</th>
                <th className="px-6 py-3 font-medium">Specs</th>
                <th className="px-6 py-3 font-medium">Storage</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-[#111] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-[#222] text-gray-300">
                        <FiServer />
                      </div>
                      <div>
                        <div className="font-medium text-white">{machine.vps_name}</div>
                        <div className="text-xs text-gray-500">{machine.cpu_cores} uptime</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${machine.vps_status === 'Running' ? 'bg-green-500' : 'bg-green-500'}`}></div>
                      <span className={machine.vps_status === 'Running' ? 'text-green-500' : 'text-green-500'}>{machine.vps_status || "Running"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-300">
                    {machine.vps_ip}
                  </td>
                  <td className="px-6 py-4">
                    {machine.region || "us-east-1"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1"><FiCpu /> {machine.cpu_cores}</span>
                      <span className="flex items-center gap-1"><FiActivity /> {machine.ram + "GB"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {machine.storage + "GB"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleGithubClick(machine.id, machine.vps_name)}
                        className="p-2 hover:bg-purple-500/10 rounded-md text-gray-400 hover:text-purple-400 transition-all border border-[#333] hover:border-purple-500/50"
                        title="GitHub Authentication"
                      >
                        <FiGithub />
                      </button>
                      <button
                        onClick={() => setAnalyticsModal({
                          isOpen: true,
                          machineId: machine.id,
                          machineName: machine.vps_name,
                          machineIp: machine.vps_ip
                        })}
                        className="p-2 hover:bg-blue-500/10 rounded-md text-gray-400 hover:text-blue-400 transition-all border border-[#333] hover:border-blue-500/50"
                        title="View Analytics"
                      >
                        <FiEye />
                      </button>
                      <button
                        disabled={true}
                        onClick={() => setDeleteId(machine.id)}
                        className="p-2 hover:bg-red-500/10 rounded-md text-gray-400 hover:text-red-500 transition-all border border-[#333] hover:border-red-500/50"
                        title="Delete Machine"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteMachine}
        title="Delete Machine"
        message="Are you sure you want to delete this machine? This action cannot be undone and all data on the VPS will be lost."
        confirmText="Delete"
        isDangerous={true}
      />

      {showAddModal && (
        <AddMachineModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMachine}
        />
      )}

      <MachineAnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, machineId: '', machineName: '', machineIp: '' })}
        machineId={analyticsModal.machineId}
        machineName={analyticsModal.machineName}
        machineIp={analyticsModal.machineIp}
      />

      {/* GitHub Authentication Modal */}
      {githubModal.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <FiGithub size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">GitHub Authentication</h3>
              </div>
              <button
                onClick={() => {
                  setGithubModal({ isOpen: false, machineId: '', machineName: '' });
                  setGithubStatus(null);
                  setGithubForm({ username: '', token: '' });
                  setShowTokenSteps(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Machine: <span className="text-white font-medium">{githubModal.machineName}</span>
            </p>

            {loadingGithub ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : githubStatus ? (
              <div className="space-y-4">
                <div className="bg-[#222] border border-[#333] rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Authenticated as:</div>
                  <div className="text-white font-medium">{githubStatus.username}</div>
                </div>
                <button
                  onClick={handleUnauthenticateGithub}
                  disabled={loadingGithub}
                  className="w-full px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unauthenticate GitHub
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Token Generation Steps */}
                <div className="bg-[#222] border border-[#333] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTokenSteps(!showTokenSteps)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FiGithub className="text-purple-400" size={16} />
                      <span className="text-sm font-medium text-white">
                        How to generate Personal Access Token
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {showTokenSteps ? '▼' : '▶'}
                    </span>
                  </button>

                  {showTokenSteps && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[#333] pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                            1
                          </div>
                          <div className="flex-1 text-gray-300">
                            Go to{' '}
                            <a
                              href="https://github.com/settings/tokens/new"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 underline"
                            >
                              GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                            2
                          </div>
                          <div className="flex-1 text-gray-300">
                            Click <span className="text-white font-medium">"Generate new token (classic)"</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                            3
                          </div>
                          <div className="flex-1 text-gray-300">
                            Give it a descriptive name (e.g., "VPS Machine Access")
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                            4
                          </div>
                          <div className="flex-1 text-gray-300">
                            Select the scopes you need (at minimum: <span className="text-white font-medium">repo</span>)
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium">
                            5
                          </div>
                          <div className="flex-1 text-gray-300">
                            Click <span className="text-white font-medium">"Generate token"</span> and copy the token immediately
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                        ⚠️ Note: The token will only be shown once. Make sure to copy it before closing the page.
                      </div>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuthenticateGithub();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={githubForm.username}
                      onChange={(e) => setGithubForm({ ...githubForm, username: e.target.value })}
                      className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      placeholder="Enter GitHub username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Personal Access Token <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={githubForm.token}
                      onChange={(e) => setGithubForm({ ...githubForm, token: e.target.value })}
                      className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      placeholder="Enter personal access token (not password)"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Only personal access tokens are accepted. Passwords will not work.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGithubModal({ isOpen: false, machineId: '', machineName: '' });
                        setGithubStatus(null);
                        setGithubForm({ username: '', token: '' });
                        setShowTokenSteps(false);
                      }}
                      className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingGithub}
                      className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Authenticate
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VPSMachines;
