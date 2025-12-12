import { useEffect, useState } from 'react';
import { FiServer, FiCpu, FiActivity, FiX, FiArrowRight } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';

interface MachineType {
  id: string;
  vps_ip: string;
  vps_name: string;
  vps_region?: string;
  vps_cpu?: string;
  vps_ram?: string;
  vps_status?: string;
}

interface MachineSelectorProps {
  onSelect: (machine: MachineType) => void;
  onClose: () => void;
}

const MachineSelector = ({ onSelect, onClose }: MachineSelectorProps) => {
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<MachineType | null>(null);
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

  const handleNext = () => {
    if (selectedMachine) {
      onSelect(selectedMachine);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Select a Machine</h2>
            <p className="text-sm text-gray-400 mt-1">Choose a VPS to deploy your project to</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading machines...</div>
          ) : machines.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No machines found. Please create a VPS first.</div>
          ) : (
            machines.map((machine) => (
              <button
                key={machine.id}
                onClick={() => setSelectedMachine(machine)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group text-left ${
                  selectedMachine?.id === machine.id
                    ? 'border-white bg-[#1a1a1a] shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'border-[#333] bg-black hover:border-white/20 hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    selectedMachine?.id === machine.id ? 'bg-white text-black' : 'bg-[#222] text-gray-300 group-hover:text-white'
                  }`}>
                    <FiServer size={20} />
                  </div>
                  <div>
                    <div className={`font-medium ${selectedMachine?.id === machine.id ? 'text-white' : 'text-gray-200'}`}>
                      {machine.vps_name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{machine.vps_ip}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiCpu /> {machine.vps_cpu}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiActivity /> {machine.vps_ram}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${machine.vps_status === 'Running' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {machine.vps_status}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-6 border-t border-[#333] flex justify-end bg-[#111] rounded-b-2xl">
          <button
            onClick={handleNext}
            disabled={!selectedMachine}
            className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            Next <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineSelector;
