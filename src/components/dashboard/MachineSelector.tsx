import { useEffect, useState } from 'react';
import { FiServer, FiCpu, FiActivity, FiX, FiArrowRight, FiArrowLeft, FiCode, FiLayers, FiDatabase, FiHardDrive } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import { DEPLOYMENT_MANAGER_URL } from '../../types';

interface MachineType {
  id: string;
  vps_ip: string;
  vps_name: string;
  vps_region?: string;
  cpu_cores?: string;
  ram?: string;
  storage?: string;
  vps_status?: string;
}

interface MachineSelectorProps {
  onSelect: (machine: MachineType, serviceType: string) => void;
  onClose: () => void;
}

type ServiceType = 'webservice' | 'ui' | 'database' | 'caching';

const MachineSelector = ({ onSelect, onClose }: MachineSelectorProps) => {
  const [step, setStep] = useState<'service' | 'machine'>('service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineType | null>(null);

  const services = [
    {
      type: 'webservice' as ServiceType,
      title: 'Web Service / Backend',
      description: 'Deploy Node.js, Python, Go, or any backend application',
      icon: FiCode,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      isAvailable: true,
    },
    {
      type: 'ui' as ServiceType,
      title: 'UI Layer (Frontend)',
      description: 'Deploy HTML, CSS, JavaScript, or SPA applications',
      icon: FiLayers,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      isAvailable: true,
    },
    {
      type: 'database' as ServiceType,
      title: 'Databases',
      description: 'Deploy MySQL, PostgreSQL, MongoDB, or other databases',
      icon: FiDatabase,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      isAvailable: true,
    },
    {
      type: 'caching' as ServiceType,
      title: 'Caching',
      description: 'Deploy Redis, Memcached, or other caching solutions',
      icon: FiServer,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      isAvailable: true,
    },
  ];
  
  const fetchMachines = async () => {
    setLoading(true);
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-machines`, {
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
    if (step === 'machine') {
      fetchMachines();
    }
  }, [step]);

  const handleNext = () => {
    if (step === 'service' && selectedService) {
      setStep('machine');
    } else if (step === 'machine' && selectedMachine && selectedService) {
      onSelect(selectedMachine, selectedService);
    }
  };

  const handleBack = () => {
    setStep('service');
    setSelectedMachine(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-[#333] flex justify-between items-start gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {step === 'machine' && (
              <button onClick={handleBack} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                <FiArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {step === 'service' ? 'Select Service Type' : 'Select a Machine'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {step === 'service' 
                  ? 'Choose the type of service you want to deploy' 
                  : 'Choose a VPS to deploy your project to'
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3">
          {step === 'service' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.type}
                    disabled={!service.isAvailable}
                    onClick={() => setSelectedService(service.type)}
                    className={`p-4 sm:p-6 rounded-xl border transition-all text-left group ${service.isAvailable ? '' : 'opacity-50 cursor-not-allowed'} ${
                      selectedService === service.type
                        ? `border-white ${service.bgColor} shadow-lg`
                        : `border-[#333] bg-black hover:${service.borderColor} hover:bg-[#1a1a1a]`
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors ${
                      selectedService === service.type 
                        ? `${service.bgColor} ${service.color}` 
                        : 'bg-[#222] text-gray-400 group-hover:text-white'
                    }`}>
                      <Icon size={20} className="sm:hidden" />
                      <Icon size={24} className="hidden sm:block" />
                    </div>
                    <h3 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${selectedService === service.type ? 'text-white' : 'text-gray-200'}`}>
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">{service.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading machines...</div>
              ) : machines.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No machines found. Please create a VPS first.</div>
              ) : (
                machines.map((machine) => (
                  <button
                    key={machine.id}
                    onClick={() => setSelectedMachine(machine)}
                    className={`w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all group text-left gap-3 ${
                      selectedMachine?.id === machine.id
                        ? 'border-white bg-[#1a1a1a] shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'border-[#333] bg-black hover:border-white/20 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedMachine?.id === machine.id ? 'bg-white text-black' : 'bg-[#222] text-gray-300 group-hover:text-white'
                      }`}>
                        <FiServer size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-medium ${selectedMachine?.id === machine.id ? 'text-white' : 'text-gray-200'}`}>
                          {machine.vps_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">{machine.vps_ip}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 pl-14 sm:pl-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiCpu className="w-3 h-3 sm:w-4 sm:h-4" /> {machine.cpu_cores}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiActivity className="w-3 h-3 sm:w-4 sm:h-4" /> {machine.ram}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FiDatabase className="w-3 h-3 sm:w-4 sm:h-4" /> {machine.storage} GB
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-[#333] flex justify-end bg-[#111] rounded-b-2xl">
          <button
            onClick={handleNext}
            disabled={step === 'service' ? !selectedService : !selectedMachine}
            className="bg-white text-black px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center"
          >
            Next <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineSelector;
