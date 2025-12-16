  import { SiNodedotjs, SiExpress, SiPython, SiDjango, SiFlask, SiFastapi, SiRuby, SiPhp, SiGo, SiRust, SiDocker } from 'react-icons/si';
  import { FiCode } from 'react-icons/fi';
  export const backendFrameworks = [
    { value: 'nodejs', label: 'Node.js', icon: SiNodedotjs, color: 'text-green-500' },
    { value: 'express', label: 'Express', icon: SiExpress, color: 'text-gray-300' },
    {value:'elysia-js' , label:'Elysia JS', icon:SiNodedotjs, color:'text-purple-500'},
    { value: 'python', label: 'Python', icon: SiPython, color: 'text-blue-400' },
    { value: 'django', label: 'Django', icon: SiDjango, color: 'text-green-600' },
    { value: 'flask', label: 'Flask', icon: SiFlask, color: 'text-gray-300' },
    { value: 'fastapi', label: 'FastAPI', icon: SiFastapi, color: 'text-teal-500' },
    { value: 'ruby', label: 'Ruby', icon: SiRuby, color: 'text-red-500' },
    { value: 'php', label: 'PHP', icon: SiPhp, color: 'text-indigo-400' },
    { value: 'go', label: 'Go', icon: SiGo, color: 'text-cyan-500' },
    { value: 'rust', label: 'Rust', icon: SiRust, color: 'text-orange-500' },
    { value: 'docker', label: 'Docker', icon: SiDocker, color: 'text-blue-500' },
    { value: 'other', label: 'Other', icon: FiCode, color: 'text-gray-400' },
  ];