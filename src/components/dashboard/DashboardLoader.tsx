import ZyotraLogo from '../ZyotraLogo';

interface DashboardLoaderProps {
  message?: string;
  mode?: 'full-screen' | 'inline' | 'overlay';
  className?: string;
}

const DashboardLoader = ({
  message = 'Loading Dashboard',
  mode = 'full-screen',
  className = ''
}: DashboardLoaderProps) => {
  const containerClassName = {
    'full-screen': 'min-h-screen bg-[#0a0a0a] flex items-center justify-center',
    inline: 'flex items-center justify-center py-20',
    overlay:
      'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
  }[mode];

  return (
    <div className={`${containerClassName} ${className}`.trim()}>
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ZyotraLogo className="w-8 h-8" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-white/90 font-medium">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
