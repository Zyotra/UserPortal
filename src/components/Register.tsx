import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import ZyotraLogo from './ZyotraLogo';

const MicrosoftLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21" className="mr-2">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#16171e] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6">
            <ZyotraLogo className="w-12 h-12 animate-[spin_10s_linear_infinite] mb-3" />
            <h2 className="text-white text-xl font-semibold tracking-wide">Zyotra</h2>
        </div>
        <h1 className="text-white text-4xl font-bold text-center mb-10 tracking-tight">Sign up</h1>
        
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
                Sign up with Google
            </button>
            
            <button className="w-full bg-[#1a1d24] border border-[#2e3036] text-gray-200 py-2.5 px-4 rounded mb-6 flex items-center justify-center hover:bg-[#23262f] transition-colors text-sm font-medium">
                <MicrosoftLogo />
                Sign up with Microsoft
            </button>

            {/* Divider */}
            <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-[#2e3036]"></div>
                <span className="px-3 text-gray-500 text-xs">or sign up with email</span>
                <div className="flex-1 border-t border-[#2e3036]"></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                Name <span className="text-gray-500 font-normal">(required)</span>
                </label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-[#1a1d24] border border-[#2e3036] text-white py-2.5 px-3 rounded mb-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder-gray-600 text-sm"
                required
                />

                <label className="block text-gray-300 text-sm mb-2 font-medium">
                Email <span className="text-gray-500 font-normal">(required)</span>
                </label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#1a1d24] border border-[#2e3036] text-white py-2.5 px-3 rounded mb-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder-gray-600 text-sm"
                required
                />

                <label className="block text-gray-300 text-sm mb-2 font-medium">
                Password <span className="text-gray-500 font-normal">(required)</span>
                </label>
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#1a1d24] border border-[#2e3036] text-white py-2.5 px-3 rounded mb-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all placeholder-gray-600 text-sm"
                required
                />

                <button
                type="submit"
                className="w-full bg-[#23262f] border border-[#2e3036] text-white py-2.5 px-4 rounded hover:bg-[#2d313a] transition-colors text-sm font-medium"
                >
                Create Account
                </button>
            </form>
            </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline hover:text-gray-300">
            Log in
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-[10px] leading-tight">
          By signing up, you agree to our{' '}
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

export default Register;
