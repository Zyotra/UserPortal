import { FiGlobe, FiMoreHorizontal, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Domains = () => {
  const domains = [
    {
      id: 'd1',
      name: 'ramkrishnacode.tech',
      status: 'Active',
      expires: 'Nov 15, 2026',
      autoRenewal: true,
      nameservers: 'Vercel',
      project: 'portfolio-rkrishna'
    },
    {
      id: 'd2',
      name: 'zyotra.com',
      status: 'Active',
      expires: 'Dec 01, 2025',
      autoRenewal: true,
      nameservers: 'Cloudflare',
      project: 'zyotra-main'
    },
    {
      id: 'd3',
      name: 'chat-connect.io',
      status: 'Expiring Soon',
      expires: 'Jan 10, 2026',
      autoRenewal: false,
      nameservers: 'Vercel',
      project: 'chat-connect'
    },
    {
      id: 'd4',
      name: 'medcrm.org',
      status: 'Active',
      expires: 'Mar 22, 2026',
      autoRenewal: true,
      nameservers: 'Vercel',
      project: 'crm-system'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Domains</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
          Buy Domain
        </button>
      </div>

      <div className="border border-[#333] rounded-lg overflow-hidden bg-black">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#111] text-gray-200 border-b border-[#333]">
            <tr>
              <th className="px-6 py-3 font-medium">Domain</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Project</th>
              <th className="px-6 py-3 font-medium">Nameservers</th>
              <th className="px-6 py-3 font-medium">Expires</th>
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
                    <span className="font-medium text-white">{domain.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {domain.status === 'Active' ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiAlertCircle className="text-yellow-500" />
                    )}
                    <span className={domain.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}>
                      {domain.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {domain.project}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {domain.nameservers}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-300">{domain.expires}</span>
                    <span className="text-xs text-gray-500">
                      {domain.autoRenewal ? 'Auto-renewal on' : 'Auto-renewal off'}
                    </span>
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
  );
};

export default Domains;
