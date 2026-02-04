import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiServer, FiTerminal, FiCheckCircle, FiXCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiRedis } from 'react-icons/si';
import { MdCached } from 'react-icons/md';
import apiClient from '../../utils/apiClient';
import { STORAGE_LAYER_DEPOYMENT_URL } from '../../types';

const DeployCaching = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [usedPorts, setUsedPorts] = useState<number[]>([]);
  const [portError, setPortError] = useState<string>('');

  const machineId = location.state?.vpsId || '';
  const machineIp = location.state?.vpsIp || '';

  useEffect(() => {
    if (!machineId) {
      navigate('/dashboard');
    }
  }, [machineId, navigate]);

  async function fetchUsedPorts(){
    try {
      const res = await apiClient(`${STORAGE_LAYER_DEPOYMENT_URL}/get-port/${machineId}`, {
        method: "GET",
      });
      const data = await res.json();
      console.log(data)
      if (data.data) {
        setUsedPorts(data.data.usedPorts);
      }
    } catch (error) {
      console.error("Error fetching used ports:", error);
    }
  }

  const [formData, setFormData] = useState({
    vpsId: machineId,
    vpsIp: machineIp,
    name: '',
    password: '',
    port: '6379',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'port') {
      if (usedPorts.includes(Number(value))) {
        setPortError(`Port ${value} is already in use. Please choose a different port.`);
      } else {
        setPortError('');
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, showTerminal]);

  useEffect(() => {
    if (location.state?.vpsId) {
      setFormData(prev => ({ ...prev, vpsId: location.state.vpsId }));
    }
    if (location.state?.vpsIp) {
      setFormData(prev => ({ ...prev, vpsIp: location.state.vpsIp }));
    }
    fetchUsedPorts();
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if port is already in use
    if (usedPorts.includes(Number(formData.port))) {
      setPortError(`Port ${formData.port} is already in use. Please choose a different port.`);
      return;
    }
    
    setLoading(true);
    setDeploymentStatus('deploying');
    setResponseMessage(null);
    setLoadingMessage('Initializing Redis server deployment...');

    const payload = {
      name: formData.name,
      password: formData.password,
      vpsId: formData.vpsId,
      vpsIp: formData.vpsIp,
      port: formData.port,
    };

    try {
      // Simulate progress updates
      setTimeout(() => setLoadingMessage('Connecting to VPS machine...'), 500);
      setTimeout(() => setLoadingMessage('Installing Redis server...'), 1500);
      setTimeout(() => setLoadingMessage('Configuring cache settings...'), 2500);
      setTimeout(() => setLoadingMessage('Setting up authentication...'), 3500);
      setTimeout(() => setLoadingMessage('Starting Redis service...'), 4500);
      setTimeout(() => setLoadingMessage('Finalizing deployment...'), 5500);

      const response = await apiClient(`${STORAGE_LAYER_DEPOYMENT_URL}/deploy-redis`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Failed to parse server response. Please try again.');
      }

      if (response.ok) {
        setLoadingMessage('Redis server deployed successfully!');
        setResponseMessage({
          type: 'success',
          message: data.message || 'Redis server has been deployed successfully and is now running. You can use it for caching in your applications.'
        });
        setLogs(prev => [...prev, 
          '✓ Redis server deployed successfully!', 
          `✓ Host: ${formData.vpsIp}:${formData.port}`,
          `✓ Server Name: ${formData.name}`,
          '✓ Redis service is up and running',
          '---',
          'Connection String: redis://[password]@' + formData.vpsIp + ':' + formData.port
        ]);
        setDeploymentStatus('success');
      } else {
        setLoadingMessage('Redis deployment failed');
        let errorMsg = data?.message || data?.error || 'Failed to deploy Redis server.';
        
        // Add specific error guidance
        if (errorMsg.toLowerCase().includes('port') || errorMsg.toLowerCase().includes('address already in use')) {
          errorMsg += ' The port might already be in use. Please check if Redis is already running on this port or try a different port.';
        } else if (errorMsg.toLowerCase().includes('connection')) {
          errorMsg += ' Please verify your VPS connection and credentials.';
        } else {
          errorMsg += ' Please check your port configuration (it might already be deployed), VPS connection, and try again.';
        }
        
        setResponseMessage({
          type: 'error',
          message: errorMsg
        });
        setLogs(prev => [...prev, `❌ Error: ${errorMsg}`]);
        setDeploymentStatus('failed');
      }
    } catch (error) {
      console.error('Error deploying Redis:', error);
      setLoadingMessage('Redis deployment failed');
      let errorMsg = error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

      // Provide specific guidance based on error type
      if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('fetch')) {
        errorMsg = `Network error: ${errorMsg}. Please check your VPS connection and try again.`;
      } else if (errorMsg.toLowerCase().includes('timeout')) {
        errorMsg = `Connection timeout: ${errorMsg}. The VPS might be unreachable or slow. Please verify the IP address and network.`;
      } else {
        errorMsg = `Deployment failed: ${errorMsg}. Please check your port (it might already be deployed), VPS settings, and connection.`;
      }

      setResponseMessage({
        type: 'error',
        message: errorMsg
      });
      setLogs(prev => [...prev, `❌ Error: ${errorMsg}`]);
      setDeploymentStatus('failed');
    }
  };

  if (showTerminal) {
    return (
      <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FiTerminal className="text-red-500" />
              Redis Deployment Console
            </h1>
            <div className="flex items-center gap-3">
              {deploymentStatus === 'deploying' && (
                <span className="flex items-center gap-2 text-yellow-500 text-sm font-mono animate-pulse">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Deploying...
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
      {/* Loading/Response Modal */}
      {(loading || responseMessage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              {/* Animated Spinner */}
              <div className="relative mb-6">
                {deploymentStatus !== 'success' ? (
                  <>
                    <div className="w-20 h-20 border-4 border-[#333] rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <SiRedis className="text-red-500 text-2xl animate-pulse" />
                    </div>
                  </>
                ) : (
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500 animate-in zoom-in duration-500">
                    <FiCheckCircle className="text-green-500 text-3xl" />
                  </div>
                )}
              </div>

              {/* Loading Message */}
              <h3 className="text-xl font-bold text-white mb-2">
                {deploymentStatus === 'deploying' ? 'Deploying Redis Server' :
                 deploymentStatus === 'success' ? '✓ Redis Deployed Successfully!' :
                 'Deployment Failed'}
              </h3>

              <p className={`text-sm mb-6 min-h-[20px] ${deploymentStatus === 'success' ? 'text-green-400 font-medium' : 'text-gray-400'}`}>
                {loadingMessage}
              </p>

              {/* Progress Indicator */}
              {deploymentStatus === 'deploying' && (
                <div className="w-full bg-[#222] rounded-full h-2 mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              )}

              {/* Response Message */}
              {responseMessage && (
                <div className={`w-full p-4 rounded-xl mb-6 border ${
                  responseMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                } animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className="flex items-start gap-3">
                    {responseMessage.type === 'success' ? (
                      <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                    ) : (
                      <FiXCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`text-sm text-left ${
                      responseMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {responseMessage.type === 'success' ? (
                        <div className="space-y-2">
                          <p className="font-semibold">🎉 {responseMessage.message}</p>
                          <div className="text-xs space-y-1 pt-2 border-t border-green-500/20">
                            <p>✓ Server: <span className="font-mono">{formData.name}</span></p>
                            <p>✓ Host: <span className="font-mono">{formData.vpsIp}:{formData.port}</span></p>
                            <p>✓ Status: <span className="text-green-300">Running</span></p>
                          </div>
                        </div>
                      ) : (
                        <p>{responseMessage.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {responseMessage && (
                <div className="flex gap-3 w-full">
                  {responseMessage.type === 'success' ? (
                    <>
                      <button
                        onClick={() => {
                          setLoading(false);
                          setResponseMessage(null);
                          setLoadingMessage('');
                          setShowTerminal(true);
                        }}
                        className="flex-1 bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setLoading(false);
                          setResponseMessage(null);
                          setLoadingMessage('');
                          navigate('/dashboard');
                        }}
                        className="flex-1 bg-[#333] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#444] transition-all"
                      >
                        Go to Dashboard
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setLoading(false);
                        setResponseMessage(null);
                        setLoadingMessage('');
                        setDeploymentStatus('idle');
                      }}
                      className="flex-1 bg-[#333] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#444] transition-all"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MdCached className="text-red-500" />
            Deploy Redis Cache Server
          </h1>
          <p className="text-gray-400">Set up a new Redis cache server on your VPS machine.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Redis Server Type Display */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MdCached className="text-gray-400" /> Cache Server Type
            </h2>

            <div className="relative p-6 rounded-xl border-2 border-white bg-white/5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20">
                  <SiRedis className="text-2xl text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Redis</h3>
                  <p className="text-xs text-gray-400">In-memory data structure store, cache, and message broker</p>
                </div>
                <FiCheckCircle className="text-white" />
              </div>
            </div>
          </div>

          {/* Redis Configuration */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiServer className="text-gray-400" /> Redis Configuration
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MdCached /> Cache Server Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="my-redis-cache"
                  disabled={loading}
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <p className="text-xs text-gray-500">
                  Choose a unique name for your Redis cache server
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiLock /> Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Strong password"
                      disabled={loading}
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-white transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use a strong password for security
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiServer /> Port <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="port"
                    value={formData.port}
                    onChange={handleInputChange}
                    placeholder="6379"
                    disabled={loading}
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  {portError && (
                    <div className="mt-2 text-sm text-red-500 text-left">
                      {portError}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Default Redis port is 6379
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#0a0a0a] border border-[#222] rounded-xl">
                <div className="flex items-start gap-3">
                  <FiServer className="text-red-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white mb-1">VPS Configuration</h4>
                    <div className="space-y-1 text-xs text-gray-400 font-mono">
                      <p>Machine ID: <span className="text-gray-300">{formData.vpsId}</span></p>
                      <p>IP Address: <span className="text-gray-300">{formData.vpsIp || 'Not specified'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deploying...' : <><SiRedis className="text-lg" /> Deploy Redis Server</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeployCaching;
