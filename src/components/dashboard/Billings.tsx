import { FiCreditCard, FiDownload, FiCheck } from 'react-icons/fi';
import { useState } from 'react';
const Billings = () => {
  const invoices = [
    { id: 'inv-001', date: 'Nov 01, 2025', amount: '$20.00', status: 'Paid' },
    { id: 'inv-002', date: 'Oct 01, 2025', amount: '$20.00', status: 'Paid' },
    { id: 'inv-003', date: 'Sep 01, 2025', amount: '$20.00', status: 'Paid' },
  ];
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  if(!showBillingDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h2 className="text-2xl font-semibold text-white">Manage Your Billing</h2>
        <p className="text-gray-400 text-center max-w-md">
          View and manage your subscription plan, payment methods, and invoices all in one place.
        </p>
        <button
          className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          View Billing Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="md:col-span-2 border border-[#333] rounded-lg p-6 bg-black">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Pro Plan</h3>
              <p className="text-sm text-gray-400">$20 per month / member</p>
            </div>
            <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded">CURRENT</span>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <FiCheck className="text-white" /> <span>Unlimited Projects</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <FiCheck className="text-white" /> <span>1TB Bandwidth</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <FiCheck className="text-white" /> <span>Unlimited Serverless Functions</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Manage Subscription
            </button>
            <button className="text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-[#333] rounded-lg p-6 bg-black">
          <h3 className="text-lg font-medium text-white mb-6">Payment Method</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-8 bg-[#222] rounded border border-[#333] flex items-center justify-center">
              <FiCreditCard className="text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Visa ending in 4242</div>
              <div className="text-xs text-gray-500">Expires 12/2028</div>
            </div>
          </div>
          <button className="w-full border border-[#333] bg-[#111] hover:bg-[#222] text-white text-sm py-2 rounded transition-colors">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Invoices</h3>
        <div className="border border-[#333] rounded-lg overflow-hidden bg-black">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111] text-gray-200 border-b border-[#333]">
              <tr>
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{invoice.id}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                      <FiDownload />
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

export default Billings;
