import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_API_URL } from '../types';
import apiClient from '../utils/apiClient';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const res = await apiClient(`${AUTH_API_URL}/dashboard`, { method: "GET" });
                setIsAuthenticated(res.status === 200);
            } catch (err) {
                console.error(err);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading spinner while checking auth
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                        <p className="text-white/90 font-medium">Authenticating...</p>
                        <div className="flex items-center justify-center gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
