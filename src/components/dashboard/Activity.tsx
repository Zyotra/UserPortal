import { useEffect, useState } from 'react';
import { FiGitCommit, FiActivity, FiClock, FiExternalLink } from 'react-icons/fi';
import apiClient from '../../utils/apiClient';
import { WEB_SERVICE_DEPLOYMENT_URL } from '../../types';

interface ActivityItem {
  id: number;
  deploymentId: string;
  domain_address: string;
  userId: string;
  log: string;
  createdAt: string;
}

const Activity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await apiClient(`${WEB_SERVICE_DEPLOYMENT_URL}/get-activity-logs`|| "http://localhost:5053/get-activity-logs", {
        method: "GET",
      });
      const resData = await res.json();
      console.log('Fetched activities:', resData);
      setActivities(resData.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActivityIcon = (log: string) => {
    if (log.toLowerCase().includes('deploy')) return <FiGitCommit className="w-4 h-4" />;
    return <FiActivity className="w-4 h-4" />;
  };

  const getActivityColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-blue-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <FiActivity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Activity Logs</h2>
            <p className="text-sm text-gray-400 hidden sm:block">Track all your deployment activities</p>
          </div>
        </div>
        <button
          onClick={fetchActivities}
          className="p-2 rounded-lg bg-[#111] border border-[#333] hover:border-[#444] hover:bg-[#1a1a1a] transition-all duration-200 group"
          title="Refresh"
        >
          <FiClock className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="border border-[#333] rounded-xl bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-[#111] border border-[#333]">
              <FiActivity className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">No activities yet</p>
              <p className="text-sm text-gray-500">Your deployment activities will appear here</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="relative border-l-2 border-[#222] ml-3 sm:ml-4 space-y-6 sm:space-y-8">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative pl-6 sm:pl-10 group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] sm:-left-[10px] top-0">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${getActivityColor(index)} p-[2px] shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white">
                          {getActivityIcon(activity.log)}
                        </div>
                      </div>
                      <div className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${getActivityColor(index)} opacity-20 blur-md`}></div>
                    </div>

                    {/* Activity Card */}
                    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-[#333] hover:bg-[#111] transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-500/5">
                      <div className="flex flex-col space-y-2 sm:space-y-3">
                        {/* Top Row - Domain & Time */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getActivityColor(index)} flex-shrink-0`}></div>
                            <a
                              href={`https://${activity.domain_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-white hover:text-blue-400 transition-colors truncate flex items-center gap-1.5 group/link"
                            >
                              <span className="truncate">{activity.domain_address}</span>
                              <FiExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                            <FiClock className="w-3 h-3" />
                            <span>{formatDate(activity.createdAt)}</span>
                          </div>
                        </div>

                        {/* Activity Description */}
                        <p className="text-sm text-gray-300 leading-relaxed break-words">
                          {activity.log}
                        </p>

                        {/* Bottom Row - Metadata */}
                        <div className="flex items-center gap-3 sm:gap-4 pt-2 border-t border-[#1a1a1a]">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">Deploy ID:</span>
                            <code className="px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#333] text-gray-400 font-mono">
                              {activity.deploymentId}
                            </code>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500"></span>
                            <span className="text-gray-400 font-mono">{activity.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Button */}
            <div className="border-t border-[#222] p-4">
              <button className="w-full py-3 text-sm font-medium text-gray-400 hover:text-white bg-[#0a0a0a] hover:bg-[#111] border border-[#333] rounded-lg hover:border-[#444] transition-all duration-200 flex items-center justify-center gap-2 group">
                <span>View All Activity</span>
                <FiExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default Activity;
