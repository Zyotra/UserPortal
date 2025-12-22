import { useState, useEffect } from "react";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiActivity,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiX,
  FiZap,
  FiCpu,
  FiHardDrive,
  FiRefreshCw,
  FiServer,
} from "react-icons/fi";
import {FaMemory} from "react-icons/fa";
import { SiRedis } from "react-icons/si";
import { MdCached } from "react-icons/md";

interface CacheServer {
  id: number | string;
  name: string;
  host: string;
  port: number;
  type: "redis" | "memcached";
  status: "active" | "inactive" | "degraded";
  memoryUsed: number;
  memoryTotal: number;
  connections: number;
  uptime: string;
  hitRate: number;
  createdAt: string;
}

const CacheMemory = () => {
  const [cacheServers, setCacheServers] = useState<CacheServer[]>([
    {
      id: 1,
      name: "Production Redis",
      host: "cache-prod-01.example.com",
      port: 6379,
      type: "redis",
      status: "active",
      memoryUsed: 2.4,
      memoryTotal: 8,
      connections: 145,
      uptime: "12d 5h",
      hitRate: 98.5,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Session Cache",
      host: "cache-session.example.com",
      port: 6379,
      type: "redis",
      status: "active",
      memoryUsed: 1.2,
      memoryTotal: 4,
      connections: 89,
      uptime: "7d 3h",
      hitRate: 95.2,
      createdAt: "2024-02-01T14:20:00Z",
    },
    {
      id: 3,
      name: "API Cache",
      host: "cache-api.example.com",
      port: 11211,
      type: "memcached",
      status: "active",
      memoryUsed: 3.1,
      memoryTotal: 8,
      connections: 234,
      uptime: "20d 11h",
      hitRate: 92.8,
      createdAt: "2024-01-10T08:15:00Z",
    },
    {
      id: 4,
      name: "Dev Redis",
      host: "cache-dev.example.com",
      port: 6379,
      type: "redis",
      status: "degraded",
      memoryUsed: 0.8,
      memoryTotal: 2,
      connections: 12,
      uptime: "2d 8h",
      hitRate: 87.3,
      createdAt: "2024-03-01T09:00:00Z",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedCache, setSelectedCache] = useState<CacheServer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCacheIcon = (type: string) => {
    if (type === "redis") return <SiRedis className="text-red-500" />;
    if (type === "memcached") return <FaMemory className="text-green-400" />;
    return <MdCached className="text-blue-400" />;
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredCacheServers = cacheServers.filter(
    (cache) =>
      cache.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cache.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cache.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black border border-[#333] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FiServer className="text-blue-400" />
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
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <FiActivity className="text-green-400" />
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

          <div className="bg-black border border-[#333] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <FiZap className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Avg Hit Rate
                </p>
                <p className="text-2xl font-bold text-white">
                  {(
                    cacheServers.reduce((acc, c) => acc + c.hitRate, 0) /
                    cacheServers.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black border border-[#333] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <FiCpu className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Connections
                </p>
                <p className="text-2xl font-bold text-white">
                  {cacheServers.reduce((acc, c) => acc + c.connections, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-xl w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
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
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[#222] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <FiList />
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
                <div className="col-span-full text-center py-20 border border-dashed border-[#333] rounded-3xl text-gray-500">
                  <MdCached className="mx-auto text-4xl mb-4 opacity-20" />
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
                      <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {getCacheIcon(cache.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-white mb-0.5 truncate pr-8">
                          {cache.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            {cache.type}
                          </span>
                          <span className="text-[10px] text-gray-600">"</span>
                          <span className="text-[10px] text-gray-500">
                            {formatDate(cache.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                        <div className="flex items-center gap-2 mb-1">
                          <FiHardDrive className="text-gray-500 text-xs" />
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Memory
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">
                          {cache.memoryUsed}GB / {cache.memoryTotal}GB
                        </div>
                        <div className="w-full bg-[#111] rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                            style={{
                              width: `${(cache.memoryUsed / cache.memoryTotal) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                        <div className="flex items-center gap-2 mb-1">
                          <FiZap className="text-gray-500 text-xs" />
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Hit Rate
                          </span>
                        </div>
                        <div className="text-sm font-bold text-emerald-400">
                          {cache.hitRate}%
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          {cache.connections} connections
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
                            <FiCheck className="text-green-500" />
                          ) : (
                            <FiCopy />
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
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <FiRefreshCw className="text-gray-600" />
                        {cache.uptime}
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
                      Memory
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Hit Rate
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
                            {getCacheIcon(cache.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {cache.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {formatDate(cache.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 uppercase">
                          {cache.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-400 max-w-[200px] truncate">
                          {cache.host}:{cache.port}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-300">
                          {cache.memoryUsed}GB / {cache.memoryTotal}GB
                        </div>
                        <div className="w-24 bg-[#111] rounded-full h-1 mt-1">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                            style={{
                              width: `${(cache.memoryUsed / cache.memoryTotal) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-emerald-400 font-bold">
                          {cache.hitRate}%
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-4">
                <div className="text-3xl p-2 bg-[#111] rounded-xl border border-[#222]">
                  {getCacheIcon(selectedCache.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedCache.name}
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
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#050505] border border-[#222] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiZap className="text-emerald-400" />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Cache Hit Rate
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {selectedCache.hitRate}%
                    </div>
                  </div>

                  <div className="p-4 bg-[#050505] border border-[#222] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiActivity className="text-blue-400" />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Active Connections
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                      {selectedCache.connections}
                    </div>
                  </div>

                  <div className="p-4 bg-[#050505] border border-[#222] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiRefreshCw className="text-purple-400" />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Uptime
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">
                      {selectedCache.uptime}
                    </div>
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="p-6 bg-[#050505] border border-[#222] rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-4">
                    Memory Usage
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Used: {selectedCache.memoryUsed}GB
                      </span>
                      <span className="text-gray-400">
                        Total: {selectedCache.memoryTotal}GB
                      </span>
                    </div>
                    <div className="w-full bg-[#111] rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(selectedCache.memoryUsed / selectedCache.memoryTotal) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {((selectedCache.memoryUsed / selectedCache.memoryTotal) * 100).toFixed(1)}% utilized
                    </div>
                  </div>
                </div>

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
                        <code className="text-xs text-blue-400 font-mono bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
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
                            <FiCheck className="text-green-500" size={14} />
                          ) : (
                            <FiCopy size={14} />
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
                        {selectedCache.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all text-sm font-bold border border-blue-500/20">
                    <FiRefreshCw /> Refresh Stats
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-bold border border-red-500/20">
                    <FiTrash2 /> Remove Server
                  </button>
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
