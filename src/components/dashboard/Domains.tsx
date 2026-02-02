import { useEffect, useState } from 'react';
import { FiGlobe, FiMoreHorizontal, FiCheckCircle, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AddDomainModal from './AddDomainModal';
import ConfirmationModal from './ConfirmationModal';
import apiClient from '../../utils/apiClient';
import { DEPLOYMENT_MANAGER_URL } from '../../types';

interface Domain {
  id: string;
  domain_address: string;
  vps_ip: string;
  added_at: string;
  isDeployed: boolean;
}

const Domains = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-domains`||"http://localhost:5051/get-domains", {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
         setDomains(data.data);
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast.error("Failed to fetch domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (domain: string, machineIp: string) => {
    const loadingToast = toast.loading("Adding domain...");
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/add-domain`||"http://localhost:5051/add-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domainAddress: domain, vpsIp: machineIp }),
      });
      
      if (!res.ok) throw new Error("Failed to add domain");
      
      const data = await res.json();
      toast.success("Domain added successfully", { id: loadingToast });
      setShowAddModal(false);
      fetchDomains(); // Refresh list
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Failed to add domain", { id: loadingToast });
    }
  };

  const confirmDeleteDomain = async () => {
    if (!deleteId) return;

    const loadingToast = toast.loading("Removing domain...");
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/delete-domain/${deleteId}`||`http://localhost:5051/delete-domain/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove domain");

      toast.success("Domain removed successfully", { id: loadingToast });
      fetchDomains(); // Refresh list
    } catch (error) {
      console.error("Error removing domain:", error);
      toast.error("Failed to remove domain", { id: loadingToast });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading domains...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Domains</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-white text-black px-4 py-2 gap-2 rounded-md text-sm font-medium hover:bg-gray-200 flex transition-colors w-full sm:w-auto justify-center"
        >
          Add Domain or Subdomain
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {domains.map((domain) => (
          <div key={domain.id} className="border border-[#333] rounded-lg p-4 bg-black">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#222] text-gray-300">
                  <FiGlobe />
                </div>
                <span className="font-medium text-white text-sm break-all">{domain.domain_address}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center gap-2">
                  {domain.isDeployed ? (
                    <FiCheckCircle className="text-green-500" />
                  ) : (
                    <FiAlertCircle className="text-yellow-500" />
                  )}
                  <span className={domain.isDeployed ? 'text-green-500' : 'text-yellow-500'}>
                    {domain.isDeployed ? 'Deployed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Linked VPS</span>
                <span className="font-mono text-gray-300 text-xs">{domain.vps_ip}</span>
              </div>
            </div>
            
            <div className="flex justify-end pt-3 border-t border-[#333]">
              <button 
                onClick={() => setDeleteId(domain.id)}
                disabled={domain.isDeployed}
                className={"p-2 hover:bg-[#222] border-2 rounded-md text-gray-400 hover:text-red-500 transition-colors" + (domain.isDeployed ? " opacity-50 cursor-not-allowed" : "")}
                title="Delete Domain"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-[#333] rounded-lg overflow-hidden bg-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111] text-gray-200 border-b border-[#333]">
              <tr>
                <th className="px-6 py-3 font-medium">Domain</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Linked VPS</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-[#222] text-gray-300">
                        <FiGlobe />
                      </div>
                      <span className="font-medium text-white">{domain.domain_address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {domain.isDeployed ? (
                        <FiCheckCircle className="text-green-500" />
                      ) : (
                        <FiAlertCircle className="text-yellow-500" />
                      )}
                      <span className={domain.isDeployed ? 'text-green-500' : 'text-yellow-500'}>
                        {domain.isDeployed ? 'Deployed' : 'Pending Deployment'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-gray-300">{domain.vps_ip}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setDeleteId(domain.id)}
                      disabled={domain.isDeployed}
                      className={"p-2 hover:bg-[#222] border-2 rounded-md text-gray-400 hover:text-red-500 transition-colors" + (domain.isDeployed ? " opacity-50 cursor-not-allowed" : "")}
                      title="Delete Domain"
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

      {showAddModal && (
        <AddDomainModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddDomain} 
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteDomain}
        title="Remove Domain"
        message="Are you sure you want to remove this domain? This action cannot be undone and will disconnect the domain from your VPS."
        confirmText="Remove"
        isDangerous={true}
      />
    </div>
  );
};

export default Domains;
