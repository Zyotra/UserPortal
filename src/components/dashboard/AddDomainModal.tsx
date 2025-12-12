import { useEffect, useState } from 'react';
import { FiServer, FiX, FiInfo, FiCopy, FiCheck } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';

interface MachineType {
  id: string;
  vps_ip: string;
  vps_name: string;
  vps_status?: string;
}

interface AddDomainModalProps {
  onClose: () => void;
  onAdd: (domain: string, machineId: string) => void;
}

const AddDomainModal = ({ onClose, onAdd }: AddDomainModalProps) => {
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<MachineType | null>(null);
  const [domainName, setDomainName] = useState('');
  const [copiedIp, setCopiedIp] = useState(false);

  const fetchMachines = async () => {
    try {
      const res = await apiClient("http://localhost:5051/get-machines", {
        method: "GET",
      });
      const data = await res.json();
      setMachines(data.data || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleSubmit = () => {
    if (domainName && selectedMachine) {
      onAdd(domainName, selectedMachine.vps_ip);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Connect Domain</h2>
            <p className="text-sm text-gray-400 mt-1">Link a custom domain to your VPS</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="mt-1 text-blue-400">
                <FiInfo size={20} />
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="font-medium text-blue-400">DNS Configuration Required</p>
                <p>Before adding your domain, you must configure your DNS records with your provider (e.g., GoDaddy, Cloudflare):</p>
                <ul className="list-disc list-inside space-y-1 ml-1 text-gray-400">
                  <li>Type: <span className="text-white font-mono bg-[#222] px-1.5 py-0.5 rounded">A Record</span></li>
                  <li>Host: <span className="text-white font-mono bg-[#222] px-1.5 py-0.5 rounded">@</span> (for root) or <span className="text-white font-mono bg-[#222] px-1.5 py-0.5 rounded">subdomain</span></li>
                  <li>Value: <span className="text-white font-mono bg-[#222] px-1.5 py-0.5 rounded">Your Machine IP</span> (Select a machine below to copy IP)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Domain Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Domain Name</label>
            <input
              type="text"
              placeholder="e.g. example.com or app.example.com"
              value={domainName}
              onChange={(e) => {
                // Remove http:// or https:// if user tries to paste or type it
                const value = e.target.value.replace(/^https?:\/\//, '');
                setDomainName(value);
              }}
              className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
            />
            <p className="text-xs text-gray-500">Enter domain without http:// or https://</p>
          </div>

          {/* Machine Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Select Target Machine</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading machines...</div>
              ) : machines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No machines found. Please create a VPS first.</div>
              ) : (
                machines.map((machine) => (
                  <div
                    key={machine.id}
                    onClick={() => setSelectedMachine(machine)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all group ${
                      selectedMachine?.id === machine.id
                        ? 'border-white bg-[#1a1a1a] shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'border-[#333] bg-black hover:border-white/20 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        selectedMachine?.id === machine.id ? 'bg-white text-black' : 'bg-[#222] text-gray-300'
                      }`}>
                        <FiServer size={20} />
                      </div>
                      <div>
                        <div className={`font-medium ${selectedMachine?.id === machine.id ? 'text-white' : 'text-gray-200'}`}>
                          {machine.vps_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-gray-400 bg-[#222] px-1.5 py-0.5 rounded font-mono">
                            {machine.vps_ip}
                          </code>
                          <button
                            onClick={(e) => handleCopyIp(machine.vps_ip, e)}
                            className="text-gray-500 hover:text-white transition-colors"
                            title="Copy IP"
                          >
                            {copiedIp && selectedMachine?.id === machine.id ? <FiCheck size={12} /> : <FiCopy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMachine?.id === machine.id ? 'border-white bg-white' : 'border-gray-600'
                    }`}>
                      {selectedMachine?.id === machine.id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#333] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!domainName || !selectedMachine}
            className="px-6 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Domain
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDomainModal;
