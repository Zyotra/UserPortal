import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiGithub, FiServer, FiBox, FiCommand, FiGlobe, FiCpu, FiTerminal, FiCheckCircle, FiXCircle, FiCode, FiSearch } from 'react-icons/fi';
import { backendFrameworks } from '../../types';
import apiClient from '../../utils/apiClient';
import { useSocket } from '../../hooks/useSocket';
const AddProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [availableDomains, setAvailableDomains] = useState<{ domain_address: string; id: number }[]>([]);
  const [projectTypeSearch, setProjectTypeSearch] = useState('');
  const [showProjectTypeDropdown, setShowProjectTypeDropdown] = useState(false);

  const machineId = location.state?.vpsId || '';
  
  useEffect(() => {
    if (!machineId) {
      console.log("redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [machineId, navigate]);

  const { socket, messages } = useSocket(machineId,"webservice") as { socket: WebSocket | null; messages: { type: string; deploymentId?: string; message?: string; log?: string; status?: string } };
  
  const [formData, setFormData] = useState({
    vpsId: machineId,
    repoUrl: '',
    deploymentId: '',
    framework: '',
    packageInstallerCommand: 'npm install',
    buildCommand: 'npm run build',
    serverFilePath: '',
    domain: '',
  });

  useEffect(() => {
    if (messages) {
      if (messages.deploymentId && !formData.deploymentId) {
        setFormData(prev => ({ ...prev, deploymentId: messages.deploymentId || '' }));
      }
      
      if (messages.message || messages.log) {
        setLogs(prev => [...prev, (messages.message || messages.log)!]);
      }

      // Check for completion status if your socket sends it
      if (messages.status === 'completed' || messages.message?.includes('Deployment successful') || messages.log?.includes('Deployment successful')) {
        setDeploymentStatus('success');
        setLoading(false);
        if (socket) socket.close();
      } else if (messages.status === 'failed' || messages.message?.includes('Deployment failed') || messages.log?.includes('Deployment failed')) {
        setDeploymentStatus('failed');
        setLoading(false);
        if (socket) socket.close();
      }
    }
  }, [messages, formData.deploymentId, socket]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, showTerminal]);

  // Fetch available domains with pending deployment status
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await apiClient('http://localhost:5051/get-domains', {
          method: 'GET',
        });
        const data = await res.json();
        console.log('Fetched domains:', data);
        if (data.data) {
          // Filter only pending deployment domains
          const pendingDomains = data.data.filter((d: any) => d.isDeployed == '0');
          console.log("Pending domains:", pendingDomains)
          setAvailableDomains(pendingDomains);
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
      }
    };
    
    fetchDomains();
  }, []);

  console.log("Machine ID from state:", machineId);
  useEffect(() => {
    if (location.state?.vpsId) {
      setFormData(prev => ({ ...prev, vpsId: location.state.vpsId }));
    }
  }, [location.state]);

  const [envVars, setEnvVars] = useState<{ key: string; value: string; required?: boolean }[]>([
    { key: 'PORT', value: '', required: true },
    { key: '', value: '' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleEnvChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    // Prevent removing required env vars
    if (envVars[index].required) return;
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowTerminal(true);
    setDeploymentStatus('deploying');
    setLogs(['Initializing deployment...', 'Connecting to build server...']);

    const env: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key) env[key] = value;
    });

    const payload = {
      ...formData,
      env,
    };

    try {
      // Updated endpoint to port 5053
      const response = await apiClient('http://localhost:5053/deploy-webservice', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'success') {
             setDeploymentStatus('success');
             setLoading(false);
             if(socket) socket.close();
        }
      } else {
        console.error('Failed to initiate deployment');
        setLogs(prev => [...prev, `Error: ${data.message || 'Failed to start deployment'}`]);
        setDeploymentStatus('failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setDeploymentStatus('failed');
      setLoading(false);
    }
  };
  // Terminal Overlay Component
  if (showTerminal) {
    return (
      <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FiTerminal className="text-blue-500" /> 
              Deployment Console
            </h1>
            <div className="flex items-center gap-3">
              {deploymentStatus === 'deploying' && (
                <span className="flex items-center gap-2 text-yellow-500 text-sm font-mono animate-pulse">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Building...
                </span>
              )}
              {deploymentStatus === 'success' && (
                <span className="flex items-center gap-2 text-green-500 text-sm font-bold">
                  <FiCheckCircle /> Deployed
                </span>
              )}
              {deploymentStatus === 'failed' && (
                <span className="flex items-center gap-2 text-red-500 text-sm font-bold">
                  <FiXCircle /> Failed
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-xl p-6 font-mono text-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className="break-all text-gray-300 border-l-2 border-transparent hover:border-[#333] pl-2">
                  <span className="text-gray-600 mr-3 select-none">$</span>
                  {log}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            {deploymentStatus === 'success' && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            )}
            {deploymentStatus === 'failed' && (
              <button 
                onClick={() => {
                  setShowTerminal(false);
                  setLogs([]);
                  setDeploymentStatus('idle');
                }}
                className="bg-[#333] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#444] transition-colors"
              >
                Close & Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-gray-400">Deploy a new project from your Git repository.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details Section */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiBox className="text-gray-400" /> Project Details
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Project Type Selection */}
              <div className="space-y-3 project-type-dropdown">
                <label className="text-sm font-medium text-gray-300">Project Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div 
                    onClick={() => setShowProjectTypeDropdown(!showProjectTypeDropdown)}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus-within:border-white transition-colors text-white cursor-pointer flex items-center justify-between"
                  >
                    {formData.framework ? (
                      <div className="flex items-center gap-3">
                        {(() => {
                          const selected = backendFrameworks.find(t => t.value === formData.framework);
                          if (selected) {
                            const Icon = selected.icon;
                            return (
                              <>
                                <Icon className={`text-xl ${selected.color}`} />
                                <span>{selected.label}</span>
                              </>
                            );
                          }
                          return <span className="text-gray-500">Select project type...</span>;
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-500">Select project type...</span>
                    )}
                  </div>

                  {showProjectTypeDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-[#333]">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            value={projectTypeSearch}
                            onChange={(e) => setProjectTypeSearch(e.target.value)}
                            placeholder="Search frameworks..."
                            className="w-full bg-black border border-[#333] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {backendFrameworks
                          .filter(type => 
                            type.label.toLowerCase().includes(projectTypeSearch.toLowerCase()) ||
                            type.value.toLowerCase().includes(projectTypeSearch.toLowerCase())
                          )
                          .map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, framework: type.value }));
                                  setShowProjectTypeDropdown(false);
                                  setProjectTypeSearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  formData.framework === type.value
                                    ? 'bg-white/10 border-l-2 border-white'
                                    : 'hover:bg-white/5'
                                }`}
                              >
                                <Icon className={`text-2xl ${type.color}`} />
                                <span className="text-sm font-medium">{type.label}</span>
                                {formData.framework === type.value && (
                                  <FiCheckCircle className="ml-auto text-white" />
                                )}
                              </button>
                            );
                          })}
                        {backendFrameworks.filter(type => 
                          type.label.toLowerCase().includes(projectTypeSearch.toLowerCase()) ||
                          type.value.toLowerCase().includes(projectTypeSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No frameworks found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Deployment ID / Name</label>
                  <input
                    type="text"
                    name="deploymentId"
                    value={formData.deploymentId}
                    disabled={true}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                    required
                  />
                </div> 
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiGithub /> Git Repository URL
                </label>
                <input
                  type="url"
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Build & Output Settings */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiCommand className="text-gray-400" /> Build & Output Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Package Installer Command</label>
                <input
                  type="text"
                  name="packageInstallerCommand"
                  value={formData.packageInstallerCommand}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Build Command</label>
                <input
                  type="text"
                  name="buildCommand"
                  value={formData.buildCommand}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Server File Path / Output Dir</label>
                <input
                  type="text"
                  name="serverFilePath"
                  value={formData.serverFilePath}
                  onChange={handleInputChange}
                  placeholder="dist/ or index.js"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Deployment Configuration */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiServer className="text-gray-400" /> Deployment Configuration
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiGlobe /> Domain <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white appearance-none"
                    required
                  >
                    <option value="">Select a domain...</option>
                    {availableDomains.map((domain) => (
                      <option key={domain.id} value={domain.domain_address}>
                        {domain.domain_address}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <FiChevronDown />
                  </div>
                </div>
                {availableDomains.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No domains available for deployment. Please add a domain first.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiSettings className="text-gray-400" /> Environment Variables
              </h2>
            </div>

            <div className="space-y-4">
              {envVars.map((env, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="KEY"
                      value={env.key}
                      onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                      disabled={env.required}
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                      required={env.required}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={env.required ? "VALUE (Required)" : "VALUE"}
                      value={env.value}
                      onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                      required={env.required}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className={`p-3 transition-colors ${env.required ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-red-500'}`}
                    disabled={env.required}
                    title={env.required ? 'This variable is required' : 'Remove variable'}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addEnvVar}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors mt-2"
              >
                <FiPlus /> Add Another
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deploying...' : <><FiSave className="text-lg" /> Deploy Project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper component for the select icon
const FiChevronDown = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const FiSettings = ({ className }: { className?: string }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

export default AddProject;
