import {useState, useEffect} from "react";
import {
    FiSearch,
    FiGrid,
    FiList,
    FiActivity,
    FiCopy,
    FiCheck,
    FiX,
    FiServer,
} from "react-icons/fi";
import {FaMemory} from "react-icons/fa";
import {SiRedis} from "react-icons/si";
import {MdCached} from "react-icons/md";
import apiClient from "../../utils/apiClient.ts";
import {STORAGE_LAYER_DEPOYMENT_URL} from "../../types.ts";

interface CacheServer {
    id: number | string;
    cacheName: string;
    password: string
    host: string;
    port: number;
    vpsId: string;
    cachingType: "redis" | "memcached" | string;
    status: string;
    userId: string
    createdAt: string;
}

const CacheMemory = () => {
    const [cacheServers, setCacheServers] = useState<CacheServer[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selectedCache, setSelectedCache] = useState<CacheServer | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCacheIcon = (type: string) => {
        if (type === "redis") return <SiRedis className="text-red-500"/>;
        if (type === "memcached") return <FaMemory className="text-green-400"/>;
        return <MdCached className="text-blue-400"/>;
    };

    const getStatusColor = (status: string) => {
        if (status === "active") return "bg-green-500";
        if (status === "degraded") return "bg-yellow-500";
        return "bg-gray-500";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
    };

    const filteredCacheServers = cacheServers.filter(
        (cache) =>
            cache.cacheName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cache.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cache.cachingType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    async function fetchCache(){
        setLoading(true)
        try {
            const res = await apiClient(`${STORAGE_LAYER_DEPOYMENT_URL}/get-redis-server`, {
                method: "GET",
            })
            if (res.status == 200) {
                const data = await res.json();
                const redis = data.data;
                console.log(redis)
                setCacheServers(redis);
            } else {
                console.error("Failed to fetch cache servers");
                setCacheServers([]);
            }
        } catch (error) {
            console.error("Error fetching cache servers:", error);
            setCacheServers([]);
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchCache()
    }, [])

    if (loading) {
        return(
           <div className="min-h-screen flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                   <div className="relative">
                       <div className="w-16 h-16 border-4 border-[#333] rounded-full"></div>
                       <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                           <MdCached className="text-red-500 text-xl animate-pulse" />
                       </div>
                   </div>
                   <p className="text-gray-400 text-sm">Loading cache servers...</p>
               </div>
           </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Cache Servers</h1>
                    <p className="text-sm text-gray-400">
                        Manage and monitor your caching infrastructure
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black border border-[#333] rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <FiServer className="text-blue-400"/>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                    Total Servers
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {cacheServers.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-[#333] rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <FiActivity className="text-green-400"/>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">
                                    Active
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {cacheServers.filter((c) => c.status === "active").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-xl w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input
                        type="text"
                        placeholder="Search cache servers by name, host or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black border border-[#333] rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white transition-all placeholder-gray-600 text-white shadow-sm"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex bg-black rounded-xl p-1 border border-[#333]">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === "grid"
                                    ? "bg-[#222] text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <FiGrid/>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === "list"
                                    ? "bg-[#222] text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <FiList/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cache Servers Grid/List */}
            <div className="grid grid-cols-1 gap-8">
                <div className="lg:col-span-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">
                            Cache Servers
                        </h3>
                        <span className="text-xs text-gray-500">
              {filteredCacheServers.length} servers found
            </span>
                    </div>

                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredCacheServers.length === 0 ? (
                                <div
                                    className="col-span-full text-center py-20 border border-dashed border-[#333] rounded-3xl text-gray-500">
                                    <MdCached className="mx-auto text-4xl mb-4 opacity-20"/>
                                    <p>No cache servers found matching your search.</p>
                                </div>
                            ) : (
                                filteredCacheServers.map((cache) => (
                                    <div
                                        key={cache.id}
                                        onClick={() => {
                                            setSelectedCache(cache);
                                            setIsDetailsModalOpen(true);
                                        }}
                                        className="group relative border border-[#333] rounded-2xl p-6 bg-black hover:border-gray-500 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-6">
                                            <div
                                                className="w-12 h-12 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                {getCacheIcon(cache.cachingType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base text-white mb-0.5 truncate pr-8">
                                                    {cache.cacheName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            {cache.cachingType}
                          </span>
                                                    <span className="text-[10px] text-gray-600">"</span>
                                                    <span className="text-[10px] text-gray-500">
                            {formatDate(cache.createdAt)}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Host Info */}
                                        <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#222] mb-4">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-gray-500">Host</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(
                                                            `${cache.host}:${cache.port}`,
                                                            cache.id as number
                                                        );
                                                    }}
                                                    className="text-gray-600 hover:text-white transition-colors"
                                                >
                                                    {copiedId === cache.id ? (
                                                        <FiCheck className="text-green-500"/>
                                                    ) : (
                                                        <FiCopy/>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-xs font-mono text-gray-300 truncate">
                                                {cache.host}:{cache.port}
                                            </div>
                                        </div>

                                        {/* Status Footer */}
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${getStatusColor(cache.status)} ${
                                                        cache.status === "active" ? "animate-pulse" : ""
                                                    }`}
                                                ></div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {cache.status}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="border border-[#333] rounded-2xl overflow-hidden bg-black">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-[#333] bg-[#0A0A0A]">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Server
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Host
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#222]">
                                {filteredCacheServers.map((cache) => (
                                    <tr
                                        key={cache.id}
                                        onClick={() => {
                                            setSelectedCache(cache);
                                            setIsDetailsModalOpen(true);
                                        }}
                                        className="hover:bg-[#0A0A0A] transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">
                                                    {getCacheIcon(cache.cachingType)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {cache.cacheName}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">
                                                        {formatDate(cache.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 uppercase">
                          {cache.cachingType}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono text-gray-400 max-w-[200px] truncate">
                                                {cache.host}:{cache.port}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${getStatusColor(cache.status)}`}
                                                ></div>
                                                <span className="text-xs text-gray-400">
                            {cache.status}
                          </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {isDetailsModalOpen && selectedCache && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div
                        className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-black/50">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl p-2 bg-[#111] rounded-xl border border-[#222]">
                                    {getCacheIcon(selectedCache.cachingType)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {selectedCache.cacheName}
                                        <span
                                            className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                                                selectedCache.status === "active"
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            }`}
                                        >
                      {selectedCache.status}
                    </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {selectedCache.host}:{selectedCache.port}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    setSelectedCache(null);
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <FiX size={24}/>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {/* Connection Details */}
                                <div className="p-6 bg-[#050505] border border-[#222] rounded-xl">
                                    <h4 className="text-sm font-bold text-white mb-4">
                                        Connection Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Host
                      </span>
                                            <div className="flex items-center gap-2">
                                                <code
                                                    className="text-xs text-blue-400 font-mono bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                                                    {selectedCache.host}
                                                </code>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            selectedCache.host,
                                                            (selectedCache.id as number) + 100
                                                        )
                                                    }
                                                    className="text-gray-500 hover:text-white transition-colors"
                                                >
                                                    {copiedId === (selectedCache.id as number) + 100 ? (
                                                        <FiCheck className="text-green-500" size={14}/>
                                                    ) : (
                                                        <FiCopy size={14}/>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Port
                      </span>
                                            <span className="text-sm text-gray-200 font-medium">
                        {selectedCache.port}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Type
                      </span>
                                            <span className="text-sm text-gray-200 font-medium uppercase">
                        {selectedCache.cachingType}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CacheMemory;
