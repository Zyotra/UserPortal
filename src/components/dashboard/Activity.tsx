import { FiGitCommit, FiPlus, FiTrash2, FiSettings, FiUser } from 'react-icons/fi';

const Activity = () => {
  const activities = [
    {
      id: 'a1',
      user: 'ramkrishna',
      action: 'deployed',
      target: 'chat-connect',
      time: '2m ago',
      icon: <FiGitCommit />,
      type: 'deployment'
    },
    {
      id: 'a2',
      user: 'ramkrishna',
      action: 'created project',
      target: 'new-marketing-site',
      time: '1h ago',
      icon: <FiPlus />,
      type: 'creation'
    },
    {
      id: 'a3',
      user: 'ramkrishna',
      action: 'updated environment variables',
      target: 'crm-system',
      time: '3h ago',
      icon: <FiSettings />,
      type: 'settings'
    },
    {
      id: 'a4',
      user: 'ramkrishna',
      action: 'deleted domain',
      target: 'old-blog.com',
      time: '1d ago',
      icon: <FiTrash2 />,
      type: 'deletion'
    },
    {
      id: 'a5',
      user: 'ramkrishna',
      action: 'invited member',
      target: 'john.doe@example.com',
      time: '2d ago',
      icon: <FiUser />,
      type: 'team'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Activity Log</h2>

      <div className="border border-[#333] rounded-lg bg-black p-6">
        <div className="relative border-l border-[#333] ml-3 space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-8">
              <div className="absolute -left-3 top-1 bg-black p-1">
                <div className="w-4 h-4 rounded-full border border-[#444] bg-[#222] flex items-center justify-center text-[10px] text-gray-400">
                  {activity.icon}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                  <span className="font-medium text-white">{activity.user}</span>
                </div>
                <span className="text-gray-400">{activity.action}</span>
                <span className="font-medium text-white">{activity.target}</span>
                <span className="text-gray-500 text-xs sm:ml-auto">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-2 text-sm text-gray-400 hover:text-white border border-[#333] rounded hover:bg-[#111] transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default Activity;
