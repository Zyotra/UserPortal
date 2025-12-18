import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiServer, FiDatabase, FiTerminal, FiCheckCircle, FiXCircle, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiPostgresql, SiMysql, SiMongodb, SiRedis } from 'react-icons/si';
import apiClient from '../../utils/apiClient';

const DeployDB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDb, setSelectedDb] = useState('');

  const machineId = location.state?.vpsId || '';
  const machineIp = location.state?.vpsIp || '';
  console.log("DeployDB machineId:", machineId);
  console.log("DeployDB machineIp:", machineIp);

  useEffect(() => {
    if (!machineId) {
      console.log("redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [machineId, navigate]);

  const [formData, setFormData] = useState({
    vpsId: machineId,
    vpsIp: machineIp,
    dbName: '',
    userName: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const databases = [
    { value: 'postgres', label: 'PostgreSQL', icon: SiPostgresql, color: 'text-blue-400', description: 'Advanced open-source relational database' },
    { value: 'mysql', label: 'MySQL', icon: SiMysql, color: 'text-orange-400', description: 'Popular open-source relational database' },
    { value: 'mongodb', label: 'MongoDB', icon: SiMongodb, color: 'text-green-400', description: 'NoSQL document database' },
    { value: 'redis', label: 'Redis', icon: SiRedis, color: 'text-red-400', description: 'In-memory data structure store' },
  ];

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
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDeploymentStatus('deploying');
    const payload = {
      ...formData,
      dbType: selectedDb,
    };

    try {
      const response = await apiClient('http://localhost:5062/deploy-postgres', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(prev => [...prev, 'Database deployed successfully!', `Connection string: ${data.connectionString || 'Available in dashboard'}`]);
        setDeploymentStatus('success');
        setLoading(false);
      } else {
        console.error('Failed to deploy database');
        setLogs(prev => [...prev, `Error: ${data.message || 'Failed to deploy database'}`]);
        setDeploymentStatus('failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deploying database:', error);
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`]);
      setDeploymentStatus('failed');
      setLoading(false);
    }
  };

  if (showTerminal) {
    return (
      <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FiTerminal className="text-purple-500" />
              Database Deployment Console
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FiDatabase className="text-purple-500" />
            Deploy Database
          </h1>
          <p className="text-gray-400">Set up a new database instance on your VPS machine.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Database Selection */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiDatabase className="text-gray-400" /> Select Database Type
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {databases.map((db) => {
                const Icon = db.icon;
                return (
                  <button
                    key={db.value}
                    type="button"
                    onClick={() => setSelectedDb(db.value)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      selectedDb === db.value
                        ? 'border-white bg-white/5 shadow-lg'
                        : 'border-[#333] hover:border-gray-500 bg-black'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${
                        db.value === 'postgres' ? 'from-blue-500/20 to-blue-600/20' :
                        db.value === 'mysql' ? 'from-orange-500/20 to-orange-600/20' :
                        db.value === 'mongodb' ? 'from-green-500/20 to-green-600/20' :
                        'from-red-500/20 to-red-600/20'
                      }`}>
                        <Icon className={`text-2xl ${db.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{db.label}</h3>
                        <p className="text-xs text-gray-400">{db.description}</p>
                      </div>
                      {selectedDb === db.value && (
                        <FiCheckCircle className="text-white absolute top-4 right-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Configuration */}
          <div className="border border-[#333] rounded-2xl p-8 bg-[#111]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiServer className="text-gray-400" /> Database Configuration
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiDatabase /> Database Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dbName"
                  value={formData.dbName}
                  onChange={handleInputChange}
                  placeholder="myapp_database"
                  className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  required
                />
                <p className="text-xs text-gray-500">
                  Choose a unique name for your database
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiUser /> Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="admin"
                    className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white transition-colors text-white"
                    required
                  />
                </div>

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
                      placeholder="your password"
                      className="w-full bg-black border border-[#333] rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-white transition-colors text-white"
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
              </div>

              <div className="p-4 bg-[#0a0a0a] border border-[#222] rounded-xl">
                <div className="flex items-start gap-3">
                  <FiServer className="text-purple-400 mt-1" />
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
              disabled={loading || !selectedDb}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deploying...' : <><FiDatabase className="text-lg" /> Deploy Database</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeployDB;
