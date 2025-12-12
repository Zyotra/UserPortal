import { useEffect, useState } from 'react';
import { FiServer, FiMoreHorizontal, FiCpu, FiActivity } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
interface MachineType{
  id:string,
  vps_ip:string,
  vps_name:string,
  vps_region?:string,
  vps_cpu?:string,
  vps_ram?:string,
  vps_status?:string,
}
const VPSMachines = () => {
  const [machines, setMachines] = useState<MachineType[]>([])
  const fetchMachines = async () => {
    const res=await apiClient("http://localhost:5051/get-machines",{
      method:"GET",
    });
    const data=await res.json();
    console.log(data);
    setMachines(data.data);
  }
  useEffect(()=>{
    fetchMachines();
  },[])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">VPS Machines</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
          Create Instance
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
                        <div className="text-xs text-gray-500">{machine.vps_cpu} uptime</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${machine.vps_status === 'Running' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className={machine.vps_status === 'Running' ? 'text-green-500' : 'text-gray-500'}>{machine.vps_status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-300">
                    {machine.vps_ip}
                  </td>
                  <td className="px-6 py-4">
                    {machine.vps_region}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1"><FiCpu /> {machine.vps_cpu}</span>
                      <span className="flex items-center gap-1"><FiActivity /> {machine.vps_ram}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                      <FiMoreHorizontal />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VPSMachines;
