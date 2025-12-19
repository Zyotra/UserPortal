import { SiNodedotjs, SiExpress,SiReact,SiNextdotjs,SiVuedotjs,SiAngular,SiSvelte,SiHtml5, SiPython, SiDjango, SiFlask, SiFastapi, SiRuby, SiPhp, SiGo, SiRust, SiDocker, SiBun } from 'react-icons/si';
import { FiCode } from 'react-icons/fi';
export const AUTH_API_URL=import.meta.env.VITE_BACKEND_URL || "http://localhost:5050" as string;
export const WEB_SERVICE_DEPLOYMENT_URL=import.meta.env.VITE_WEBSERVICE_DEPLOYMENT_URL ||"http://localhost:5053" as string;
export const UI_DEPLOYMENT_URL=import.meta.env.VITE_UI_DEPLOYMENT_URL || "http://localhost:5056" as string;
export const WS_URL_WEBSERVICE=import.meta.env.VITE_WS_URL_WEBSERVICE || "ws://localhost:5053" as string;
export const WS_URL_UI=import.meta.env.VITE_WS_URL_UI || "ws://localhost:5056" as string;
export const DEPLOYMENT_MANAGER_URL=import.meta.env.VITE_DEPLOYMENT_MANAGER_URL || "http://localhost:5051" as string;
export const Frameworks = [
  { value: 'nodejs', label: 'Node.js', icon: SiNodedotjs, color: 'text-green-500' },
  { value: 'express', label: 'Express', icon: SiExpress, color: 'text-gray-300' },
  { value: 'elysia-js', label: 'Elysia JS | Bun Runtime', icon: SiBun, color: 'text-purple-500' },
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
  { value: 'react', label: 'React', icon: SiReact, color: 'text-cyan-400' },
  { value: 'nextjs', label: 'Next.js', icon: SiNextdotjs, color: 'text-white' },
  { value: 'vue', label: 'Vue.js', icon: SiVuedotjs, color: 'text-green-500' },
  { value: 'angular', label: 'Angular', icon: SiAngular, color: 'text-red-500' },
  { value: 'svelte', label: 'Svelte', icon: SiSvelte, color: 'text-orange-500' },
  { value: 'html', label: 'HTML/CSS/JS', icon: SiHtml5, color: 'text-orange-600' }
];
export const backendFrameworks = [
    { value: 'nodejs', label: 'Node.js', icon: SiNodedotjs, color: 'text-green-500' },
    { value: 'express', label: 'Express', icon: SiExpress, color: 'text-gray-300' },
    {value: 'elysia-js', label: 'Elysia JS | Bun Runtime', icon: SiBun, color: 'text-purple-500'},
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