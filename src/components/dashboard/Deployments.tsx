import { FiGitCommit, FiClock, FiExternalLink, FiMoreHorizontal } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';

const Deployments = () => {
  const deployments = [
    {
      id: 'dep-1',
      project: 'chat-connect',
      commit: 'updated chat manager to have user search',
      branch: 'main',
      status: 'Ready',
      time: '2m ago',
      author: 'ramkrishna',
      url: 'chat-connect-blush.vercel.app'
    },
    {
      id: 'dep-2',
      project: 'crm-system',
      commit: 'fix: order collapse issue',
      branch: 'main',
      status: 'Ready',
      time: '15m ago',
      author: 'ramkrishna',
      url: 'crm-system-drab.vercel.app'
    },
    {
      id: 'dep-3',
      project: 'chess-online',
      commit: 'feat: add new game mode',
      branch: 'feature/new-mode',
      status: 'Building',
      time: '1m ago',
      author: 'ramkrishna',
      url: 'chess-online-git-feature-new-mode.vercel.app'
    },
    {
      id: 'dep-4',
      project: 'portfolio-rkrishna',
      commit: 'style: update hero section',
      branch: 'main',
      status: 'Error',
      time: '1h ago',
      author: 'ramkrishna',
      url: 'ramkrishnacode.tech'
    },
    {
      id: 'dep-5',
      project: 'x-code-gen',
      commit: 'chore: update dependencies',
      branch: 'main',
      status: 'Ready',
      time: '3h ago',
      author: 'ramkrishna',
      url: 'x-code-gen.vercel.app'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Recent Deployments</h2>

      <div className="space-y-4">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="border border-[#333] rounded-lg p-4 bg-black hover:border-gray-500 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    deployment.status === 'Ready' ? 'bg-green-500' : 
                    deployment.status === 'Building' ? 'bg-blue-500 animate-pulse' : 
                    'bg-red-500'
                  }`}></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{deployment.project}</h3>
                    <span className="text-gray-500 text-sm">•</span>
                    <a href={`https://${deployment.url}`} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white hover:underline flex items-center gap-1">
                      {deployment.url} <FiExternalLink className="text-xs" />
                    </a>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {deployment.commit}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <GoGitBranch /> {deployment.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiGitCommit /> {deployment.id.substring(0, 7)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock /> {deployment.time} by {deployment.author}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs border ${
                  deployment.status === 'Ready' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  deployment.status === 'Building' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {deployment.status}
                </span>
                <button className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                  <FiMoreHorizontal />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deployments;
