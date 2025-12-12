import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiGithub, FiServer, FiBox, FiCommand, FiGlobe, FiCpu } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import { useSocket } from '../../hooks/useSocket';

const AddProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const machineId = location.state?.vpsId || '';
  if (!machineId) {
    console.log("redirecting to dashboard");
    navigate('/dashboard');
  }
  const { socket, messages } = useSocket(machineId) as { socket: WebSocket | null; messages: { type: string; deploymentId?: string; message?: string } };
  const [formData, setFormData] = useState({
    vpsId: machineId,
    repoUrl: '',
    deploymentId: '',
    packageInstallerCommand: 'npm install',
    buildCommand: 'npm run build',
    serverFilePath: 'index.js',
    domain: '',
    webServiceType: 'static', // static, nodejs, docker, etc.
  });

  useEffect(() => {
    if (messages?.deploymentId) {
      setFormData(prev => ({ ...prev, deploymentId: messages.deploymentId || '' }));
    }
  }, [messages]);

  console.log("Machine ID from state:", machineId);
  useEffect(() => {
    if (location.state?.vpsId) {
      setFormData(prev => ({ ...prev, vpsId: location.state.vpsId }));
    }
  }, [location.state]);

  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

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
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const env: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key) env[key] = value;
    });

    const payload = {
      ...formData,
      env,
    };

    try {
      // Replace with your actual API endpoint
      const response = await apiClient('http://localhost:5050/projects/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{

  })
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Web Service Type</label>
                <div className="relative">
                  <select
                    name="webServiceType"
                    value={formData.webServiceType}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white appearance-none"
                  >
                    <option value="static">Static Site</option>
                    <option value="nodejs">Node.js</option>
                    <option value="python">Python</option>
                    <option value="docker">Docker</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <FiChevronDown />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
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
                <label className="text-sm font-medium text-gray-300">Install Command</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiCpu /> VPS ID
                </label>
                <input
                  type="text"
                  name="vpsId"
                  value={formData.vpsId}
                  disabled={true}
                  onChange={handleInputChange}
                  placeholder="vps-123456"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiGlobe /> Domain
                </label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="example.com"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                />
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
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="VALUE"
                      value={env.value}
                      onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="p-3 text-gray-500 hover:text-red-500 transition-colors"
                    disabled={envVars.length === 1 && !envVars[0].key && !envVars[0].value}
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
