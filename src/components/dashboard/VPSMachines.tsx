import { useEffect, useState } from 'react';
import { FiServer, FiMoreHorizontal, FiCpu, FiActivity, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import apiClient from '../../utils/apiClient';
import ConfirmationModal from './ConfirmationModal';
import AddMachineModal from './AddMachineModal';

interface MachineType{
  id:string,
  vps_ip:string,
  vps_name:string,
  region?:string,
  cpu_cores?:string,
  ram?:string,
  storage?:string,
  vps_status?:string,
}

const VPSMachines = () => {
  const [machines, setMachines] = useState<MachineType[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMachines = async () => {
    try {
      const res = await apiClient("http://localhost:5051/get-machines", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        setMachines(data.data);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
      toast.error("Failed to fetch machines");
    }
  }

  useEffect(()=>{
    fetchMachines();
  },[])

  const handleAddMachine = async (machineData: any) => {
    const loadingToast = toast.loading("Adding machine...");
    try {
      const res = await apiClient("http://localhost:5051/add-machine", {
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
      const res = await apiClient(`http://localhost:5051/delete-machine/${deleteId}`, {
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
                      <span className={machine.vps_status === 'Running' ? 'text-green-500' : 'text-green-500'}>{machine.vps_status || "running"}</span>
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
                      <span className="flex items-center gap-1"><FiActivity /> {machine.ram+"GB"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {machine.storage+"GB"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setDeleteId(machine.id)}
                      className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Machine"
                    >
                      <FiTrash2 />
                    </button>
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
    </div>
  );
};

export default VPSMachines;
