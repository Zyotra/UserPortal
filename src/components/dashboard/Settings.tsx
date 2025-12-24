import { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { AUTH_API_URL } from '../../types';

const Settings = () => {
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  async function getDashboardDetails() {
    const res = await apiClient(`${AUTH_API_URL}/dashboard`, {
      method: "GET",
    })
    const resp = await res.json();
    if (resp.userEmail && resp.userName) {
      setEmail(resp.userEmail);
      setName(resp.userName);
    }
  }
  useEffect(() => {
    getDashboardDetails()
  })
  return (
    <div className="max-w-4xl space-y-8">
      <h2 className="text-xl font-semibold text-white">General Settings</h2>

      {/* Team Name */}
      <div className="border border-[#333] rounded-lg p-6 bg-black">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <h3 className="text-sm font-medium text-white mb-1">User Name</h3>
            <p className="text-xs text-gray-500">This is your user's visible name within Zyotra.</p>
          </div>
          <div className="md:w-2/3 space-y-4">
            <input
              type="text"
              value={name}
              className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
            <div className="flex justify-end">
              <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors opacity-35">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Slug */}
      <div className="border border-[#333] rounded-lg p-6 bg-black">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <h3 className="text-sm font-medium text-white mb-1">User Email</h3>
            <p className="text-xs text-gray-500">This is your User Email on Zyotra.</p>
          </div>
          <div className="md:w-2/3 space-y-4">
            <div className="flex items-center">
              <input
                type="text"
                value={email}
                className="flex-1 bg-[#111] border border-[#333] rounded-r-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div className="flex justify-end">
              <button
                disabled={true}
                className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition- opacity-35">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Team */}
      <div className="border border-red-900/30 rounded-lg p-6 bg-black">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <h3 className="text-sm font-medium text-red-500 mb-1">Delete User</h3>
            <p className="text-xs text-gray-500">Permanently remove your team and all of its contents from the Zyotra platform. This action is not reversible, so please continue with caution.</p>
          </div>
          <div className="md:w-2/3 flex justify-end items-center">
            <button
            disabled={true}
             className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-500 hover:text-white transition-colors">
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
