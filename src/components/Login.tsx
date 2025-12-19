import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import ZyotraLogo from './ZyotraLogo';
import { useNavigate } from 'react-router-dom';
import { AUTH_API_URL} from '../types';
const MicrosoftLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21" className="mr-2">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const Login = () => {
  const navigate=useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const handleContinue = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      credentials: "include", // must include cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || 'Invalid email or password.');
      return;
    }

    // No need to store token in localStorage
    // Cookie is already set by backend
    navigate('/dashboard');

  } catch (err) {
    console.error(err);
    setError('Failed to connect to server. Please check your connection.');
  }
};

  useEffect(() => {
    const token=localStorage.getItem('accessToken');
    if(token){
      window.location.href='/dashboard';
    }
  },[])

  return (
    <div className="min-h-screen bg-[#16171e] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6">
            <ZyotraLogo className="w-12 h-12 animate-[spin_10s_linear_infinite] mb-3" />
            <h2 className="text-white text-xl font-semibold tracking-wide">Zyotra</h2>
        </div>
        <h1 className="text-white text-4xl font-bold text-center mb-10 tracking-tight">Log in</h1>
        
        <div className="relative">
            {/* Corner accents */}
            <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-gray-500/50 rounded-tl-sm"></div>
            <div className="absolute -top-px -right-px w-3 h-3 border-t border-r border-gray-500/50 rounded-tr-sm"></div>
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-gray-500/50 rounded-bl-sm"></div>
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-gray-500/50 rounded-br-sm"></div>

            <div className="border border-[#2e3036] bg-[#16181d]/50 rounded p-8 backdrop-blur-sm">
            {/* OAuth Buttons */}
            <button className="w-full bg-[#1a1d24] border border-[#2e3036] text-gray-200 py-2.5 px-4 rounded mb-3 flex items-center justify-center hover:bg-[#23262f] transition-colors text-sm font-medium">
                <FcGoogle className="mr-2 text-lg" />
                Log in with Google
            </button>
            
            <button className="w-full bg-[#1a1d24] border border-[#2e3036] text-gray-200 py-2.5 px-4 rounded mb-6 flex items-center justify-center hover:bg-[#23262f] transition-colors text-sm font-medium">
                <MicrosoftLogo />
                Log in with Microsoft
            </button>

            {/* Divider */}
            <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-[#2e3036]"></div>
                <span className="px-3 text-gray-500 text-xs">or log in with email</span>
                <div className="flex-1 border-t border-[#2e3036]"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleContinue}>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                Email <span className="text-gray-500 font-normal">(required)</span>
                </label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1a1d24] border border-[#2e3036] text-white py-2.5 px-3 rounded mb-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder-gray-600 text-sm"
                required
                />

                <label className="block text-gray-300 text-sm mb-2 font-medium">
                Password <span className="text-gray-500 font-normal">(required)</span>
                </label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1d24] border border-[#2e3036] text-white py-2.5 px-3 rounded mb-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder-gray-600 text-sm"
                required
                />

                <button
                type="submit"
                className="w-full bg-[#23262f] border border-[#2e3036] text-white py-2.5 px-4 rounded hover:bg-[#2d313a] transition-colors text-sm font-medium"
                >
                Continue
                </button>
            </form>

            {/* Info Text */}
            </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <Link to="/register" className="text-[#d4a373] underline hover:text-[#e0b484] text-sm transition-colors">
            Sign up for Zyotra
          </Link>
           
            i
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-[10px] leading-tight">
          By logging in, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-400">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-gray-400">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default Login;
