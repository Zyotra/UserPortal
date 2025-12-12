import { useState } from 'react';
import { FiX, FiServer, FiLock, FiGlobe, FiCpu, FiHardDrive, FiKey, FiCalendar } from 'react-icons/fi';

interface AddMachineModalProps {
  onClose: () => void;
  onAdd: (machineData: any) => void;
}

const AddMachineModal = ({ onClose, onAdd }: AddMachineModalProps) => {
  const [formData, setFormData] = useState({
    vpsIP: '',
    vpsName: '',
    vpsPassword: '',
    region: '',
    ram: '',
    storage: '',
    sshKey: '',
    expiryDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert RAM and Storage to numbers if needed by backend, or keep as strings if that's what is expected.
    // Based on request "RAM: number in gb", "Storage: number in gb", I'll convert them.
    const payload = {
      ...formData,
      ram: Number(formData.ram),
      storage: Number(formData.storage)
    };
    onAdd(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Add New Machine</h2>
            <p className="text-sm text-gray-400 mt-1">Enter the details of your new VPS instance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="add-machine-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VPS Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiServer /> VPS Name
                </label>
                <input
                  type="text"
                  name="vpsName"
                  required
                  value={formData.vpsName}
                  onChange={handleChange}
                  placeholder="e.g. Production-Web-01"
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {/* VPS IP */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiGlobe /> IP Address
                </label>
                <input
                  type="text"
                  name="vpsIP"
                  required
                  value={formData.vpsIP}
                  onChange={handleChange}
                  placeholder="e.g. 192.168.1.1"
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiGlobe /> Region
                </label>
                <input
                  type="text"
                  name="region"
                  required
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g. us-east-1"
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiCalendar /> Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  required
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RAM */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiCpu /> RAM (GB)
                </label>
                <input
                  type="number"
                  name="ram"
                  required
                  min="1"
                  value={formData.ram}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {/* Storage */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiHardDrive /> Storage (GB)
                </label>
                <input
                  type="number"
                  name="storage"
                  required
                  min="1"
                  value={formData.storage}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FiLock /> Root Password
              </label>
              <input
                type="password"
                name="vpsPassword"
                required
                value={formData.vpsPassword}
                onChange={handleChange}
                placeholder="Enter root password"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* SSH Key (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FiKey /> SSH Key (Optional)
              </label>
              <textarea
                name="sshKey"
                value={formData.sshKey}
                onChange={(e: any) => handleChange(e)}
                placeholder="ssh-rsa AAAAB3NzaC1yc2E..."
                rows={3}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 transition-colors resize-none"
              />
            </div>

          </form>
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
            type="submit"
            form="add-machine-form"
            className="px-6 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            Add Machine
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMachineModal;
