import { FiGithub, FiExternalLink, FiMoreHorizontal, FiSearch, FiPlus } from 'react-icons/fi';
import { GoGitBranch } from 'react-icons/go';

const Projects = () => {
  const projects = [
    {
      id: 'p1',
      name: 'chat-connect',
      framework: 'Next.js',
      url: 'chat-connect-blush.vercel.app',
      repo: 'imramkrishna/Chat-Connect',
      lastCommit: 'updated chat manager to have user search',
      time: '2h ago',
      branch: 'main',
      status: 'Ready',
      environment: 'Production'
    },
    {
      id: 'p2',
      name: 'crm-system',
      framework: 'React',
      url: 'crm-system-drab.vercel.app',
      repo: 'imramkrishna/MedCRM',
      lastCommit: 'updated admin orders section',
      time: '5h ago',
      branch: 'main',
      status: 'Ready',
      environment: 'Production'
    },
    {
      id: 'p3',
      name: 'chess-online',
      framework: 'Vue.js',
      url: 'chess-online-five.vercel.app',
      repo: 'imramkrishna/ChessOnline',
      lastCommit: 'updated frontend colors',
      time: '1d ago',
      branch: 'main',
      status: 'Building',
      environment: 'Preview'
    },
    {
      id: 'p4',
      name: 'portfolio-rkrishna',
      framework: 'Next.js',
      url: 'www.ramkrishnacode.tech',
      repo: 'imramkrishna/ramkrishnacode',
      lastCommit: 'fixed image collapse issue',
      time: '2d ago',
      branch: 'main',
      status: 'Ready',
      environment: 'Production'
    },
    {
      id: 'p5',
      name: 'x-code-gen',
      framework: 'Node.js',
      url: 'x-code-gen.vercel.app',
      repo: 'imramkrishna/XCodeGen',
      lastCommit: 'updated backend for rate limit issue',
      time: '3d ago',
      branch: 'main',
      status: 'Error',
      environment: 'Production'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Projects..." 
            className="w-full bg-black border border-[#333] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-600 text-white"
          />
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
          <FiPlus /> New Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border border-[#333] rounded-lg p-6 bg-black hover:border-gray-500 transition-colors group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-2xl font-bold text-white">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                    <span className="text-xs bg-[#222] text-gray-300 px-2 py-0.5 rounded border border-[#333]">{project.framework}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <a href={`https://${project.url}`} target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-1">
                      {project.url} <FiExternalLink className="text-xs" />
                    </a>
                    <span className="flex items-center gap-1">
                      <FiGithub /> {project.repo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    project.status === 'Ready' ? 'bg-green-500' : 
                    project.status === 'Building' ? 'bg-blue-500 animate-pulse' : 
                    'bg-red-500'
                  }`}></span>
                  <span className="text-sm font-medium text-gray-200">{project.status}</span>
                  <span className="text-xs text-gray-500 ml-2">{project.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <GoGitBranch /> {project.branch}
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="truncate max-w-[200px]">{project.lastCommit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
