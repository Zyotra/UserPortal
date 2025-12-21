import { useState, useEffect } from "react";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiMoreHorizontal,
  FiPlus,
  FiDatabase,
  FiActivity,
  FiTrash2,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiCpu,
  FiHardDrive,
  FiX,
  FiTerminal,
  FiPlay,
  FiTable,
  FiInfo,
  FiDownload,
} from "react-icons/fi";
import { SiPostgresql, SiMysql, SiMongodb, SiRedis } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import {
  DEPLOYMENT_MANAGER_URL,
  STORAGE_LAYER_DEPOYMENT_URL,
} from "../../types";
import ConfirmationModal from "./ConfirmationModal";

interface Database {
  id: number | string;
  host: string;
  vpsId: string;
  username: string;
  dbName: string;
  password: string;
  dbType: string;
  status: string;
  createdAt: string;
}

interface Machine {
  id: string;
  vps_ip: string;
  vps_name: string;
  region?: string;
  cpu_cores?: string;
  ram?: string;
  storage?: string;
  vps_status?: string;
}

const Databases = () => {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dbToDelete, setDbToDelete] = useState<Database | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [selectedDbForDetails, setSelectedDbForDetails] =
    useState<Database | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tables" | "query">(
    "overview"
  );
  const [connectionType, setConnectionType] = useState<
    "external" | "localhost"
  >("external");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Tables and data for the selected table
  // Separate states for PostgreSQL (string[]) and MySQL (objects with name/size)
  const [tablesList, setTablesList] = useState<string[]>([]);
  const [mysqlTablesList, setMysqlTablesList] = useState<Array<{name: string, size?: number}>>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  
  const fetchTableList = async (
    databaseName: string,
    vpsId: string,
    vpsIp: string,
    dbType?: string,
    username?:string,
    password?: string
  ) => {
    setIsLoadingTables(true);
    setTablesError(null);
    setTablesList([]);
    setMysqlTablesList([]);
    
    try {
      // Use MySQL-specific endpoint if database type is MySQL
      const endpoint = dbType?.toLowerCase() === 'mysql' 
        ? `${STORAGE_LAYER_DEPOYMENT_URL}/get-mysql-table-list`
        : `${STORAGE_LAYER_DEPOYMENT_URL}/get-tables-list`;
      
      const payload: any = {
        databaseName: databaseName,
        vpsId: vpsId,
        vpsIp: vpsIp,
        username,
      };

      // Add password for MySQL
      if (dbType?.toLowerCase() === 'mysql' && password) {
        payload.password = password;
      }

      const res = await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Tables data: ", data);
      
      if (dbType?.toLowerCase() === 'mysql') {
        // MySQL returns objects with {name, size} structure
        let mysqlTables: Array<{name: string, size?: number}> = [];
        
        if (Array.isArray(data.data)) {
          // Check if items are objects or strings
          mysqlTables = data.data.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item };
            } else if (item && typeof item === 'object' && item.name) {
              return { name: item.name, size: item.size };
            } else if (item && typeof item === 'object' && item.table_name) {
              return { name: item.table_name, size: item.size };
            } else {
              return { name: String(item) };
            }
          });
        } else if (Array.isArray(data)) {
          mysqlTables = data.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item };
            } else if (item && typeof item === 'object' && item.name) {
              return { name: item.name, size: item.size };
            } else if (item && typeof item === 'object' && item.table_name) {
              return { name: item.table_name, size: item.size };
            } else {
              return { name: String(item) };
            }
          });
        } else if (data.tables && Array.isArray(data.tables)) {
          mysqlTables = data.tables.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item };
            } else if (item && typeof item === 'object' && item.name) {
              return { name: item.name, size: item.size };
            } else {
              return { name: String(item) };
            }
          });
        } else {
          console.warn("Unexpected MySQL response structure:", data);
          setTablesError("Unexpected response format from MySQL API");
        }
        
        setMysqlTablesList(Array.isArray(mysqlTables) ? mysqlTables : []);
      } else {
        // PostgreSQL returns string array
        let tables: string[] = [];
        
        if (data.data && Array.isArray(data.data)) {
          tables = data.data.map((item: any) => 
            typeof item === 'string' ? item : String(item)
          );
        } else if (Array.isArray(data)) {
          tables = data.map((item: any) => 
            typeof item === 'string' ? item : String(item)
          );
        } else {
          console.warn("Unexpected PostgreSQL response structure:", data);
          setTablesError("Unexpected response format from PostgreSQL API");
        }
        
        setTablesList(Array.isArray(tables) ? tables : []);
      }
    } catch (error) {
      console.error("Error fetching table list:", error);
      setTablesError(error instanceof Error ? error.message : "Failed to fetch tables");
      setTablesList([]);
      setMysqlTablesList([]);
    } finally {
      setIsLoadingTables(false);
    }
  };
  const handleRunQuery = async () => {
    if (!selectedDbForDetails || !query.trim()) {
      return;
    }

    setIsExecuting(true);
    setQueryResult(null);

    try {
      const dbType = selectedDbForDetails.dbType?.toLowerCase();
      const isMySQL = dbType === 'mysql';
      
      // Use MySQL-specific endpoint if database type is MySQL
      const endpoint = isMySQL
        ? `${STORAGE_LAYER_DEPOYMENT_URL}/run-mysql-query`
        : `${STORAGE_LAYER_DEPOYMENT_URL}/run-query`;
      
      // Build payload
      const payload: any = {
        databaseName: selectedDbForDetails.dbName,
        vpsId: selectedDbForDetails.vpsId,
        vpsIp: selectedDbForDetails.host,
        username: selectedDbForDetails.username,
        query: query,
      };

      // Password is required for MySQL queries
      if (isMySQL) {
        if (!selectedDbForDetails.password) {
          setQueryResult({
            status: "error",
            rows: [],
            executionTime: "0ms",
            message: "Password is required for MySQL queries",
          });
          setIsExecuting(false);
          return;
        }
        payload.password = selectedDbForDetails.password;
      }

      console.log(`Executing query for ${isMySQL ? 'MySQL' : 'PostgreSQL'}:`, {
        endpoint,
        payload: {
          databaseName: payload.databaseName,
          vpsId: payload.vpsId,
          vpsIp: payload.vpsIp,
          username: payload.username,
          query: payload.query.substring(0, 50) + '...',
          hasPassword: !!payload.password
        }
      });

      const res = await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseError) {
        // If JSON parsing fails, handle it gracefully
        console.error("Error parsing response:", parseError);
        const textResponse = await res.text();
        setQueryResult({
          status: "error",
          rows: [],
          executionTime: "0ms",
          message: `Invalid response from server: ${textResponse.substring(0, 200)}`,
        });
        setIsExecuting(false);
        return;
      }

      if (res.ok) {
        // Handle different response structures for MySQL vs PostgreSQL
        let rows: any[] = [];
        
        if (isMySQL) {
          // MySQL response structure
          if (Array.isArray(data.data)) {
            rows = data.data;
          } else if (Array.isArray(data.rows)) {
            rows = data.rows;
          } else if (Array.isArray(data)) {
            rows = data;
          } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            // If data.data is an object, try to extract rows from it
            rows = [];
          }
        } else {
          // PostgreSQL response structure
          if (Array.isArray(data.data)) {
            rows = data.data;
          } else if (Array.isArray(data.rows)) {
            rows = data.rows;
          } else if (Array.isArray(data)) {
            rows = data;
          }
        }

        // Ensure rows is always an array
        if (!Array.isArray(rows)) {
          rows = [];
        }

        // Set the query result with the API response
        setQueryResult({
          status: "success",
          rows: rows,
          executionTime: data.executionTime || data.execution_time || "0ms",
          message: data.message || "Query executed successfully",
        });
      } else {
        // Handle error response - ensure we extract error message safely
        let errorMessage = "Failed to execute query";
        
        if (data) {
          if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.error && typeof data.error === 'object') {
            errorMessage = JSON.stringify(data.error);
          }
        }

        setQueryResult({
          status: "error",
          rows: [],
          executionTime: "0ms",
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error executing query:", error);
      
      // Handle different types of errors gracefully
      let errorMessage = "Unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }

      setQueryResult({
        status: "error",
        rows: [],
        executionTime: "0ms",
        message: errorMessage,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  async function fetchDatabases() {
    try {
      const res = await apiClient(`http://localhost:5062/get-db`, {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        setDatabases(data.data);
        console.log(data.data);
      }
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  }

  async function fetchMachines() {
    try {
      const res = await apiClient(`${DEPLOYMENT_MANAGER_URL}/get-machines`, {
        method: "GET",
      });
      const data = await res.json();
      if (data.data) {
        setMachines(data.data);
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  }

  useEffect(() => {
    fetchDatabases();
    fetchMachines();
  }, []);
  const fetchTableData = async (
    databaseName: string,
    vpsIp: string,
    vpsId: string,
    tableName: string,
    username: string,
    dbType?: string,
    password?: string
  ) => {
    try {
      // Clear previous table data before fetching new one
      setTableData([]);
      
      const isMySQL = dbType?.toLowerCase() === 'mysql';
      
      // Use MySQL-specific endpoint if database type is MySQL
      const endpoint = isMySQL
        ? `${STORAGE_LAYER_DEPOYMENT_URL}/get-mysql-table-data`
        : `${STORAGE_LAYER_DEPOYMENT_URL}/get-table-data`;
      
      // Build payload - MySQL requires all fields including password
      const payload: any = {
        databaseName,
        vpsIp,
        vpsId,
        tableName,
        username,
      };

      // Password is required for MySQL requests
      if (isMySQL) {
        if (!password) {
          console.error("Password is required for MySQL table data requests");
          setTableData([]);
          return;
        }
        payload.password = password;
      }

      console.log(`Fetching table data for ${isMySQL ? 'MySQL' : 'PostgreSQL'}:`, {
        endpoint,
        payload: {
          databaseName: payload.databaseName,
          vpsId: payload.vpsId,
          vpsIp: payload.vpsIp,
          tableName: payload.tableName,
          username: payload.username,
          hasPassword: !!payload.password
        }
      });

      const res = await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const rows = await res.json();
      console.log("Response from table-data", rows);

      // Handle different response structures for MySQL vs PostgreSQL
      let tableRows: any[] = [];
      
      if (dbType?.toLowerCase() === 'mysql') {
        // MySQL response might have different structure
        if (Array.isArray(rows.data)) {
          tableRows = rows.data;
        } else if (Array.isArray(rows)) {
          tableRows = rows;
        } else if (rows.rows && Array.isArray(rows.rows)) {
          tableRows = rows.rows;
        } else if (rows.data && Array.isArray(rows.data)) {
          tableRows = rows.data;
        }
      } else {
        // PostgreSQL response structure
        if (rows && Array.isArray(rows.data)) {
          tableRows = rows.data;
        } else if (Array.isArray(rows)) {
          tableRows = rows;
        } else if (rows.rows && Array.isArray(rows.rows)) {
          tableRows = rows.rows;
        }
      }
      
      // Ensure we always set an array, even if empty
      setTableData(Array.isArray(tableRows) ? tableRows : []);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setTableData([]);
    }
  };
  const handleDelete = async () => {
    if (!dbToDelete) return;

    try {
      // Use MySQL-specific endpoint if database type is MySQL
      const endpoint = dbToDelete.dbType?.toLowerCase() === 'mysql'
        ? `${STORAGE_LAYER_DEPOYMENT_URL}/delete-mysql`
        : `${STORAGE_LAYER_DEPOYMENT_URL}/${dbToDelete.id}`;
      
      const payload: any = {
        vpsId: dbToDelete.vpsId,
        vpsIp: dbToDelete.host,
        dbName: dbToDelete.dbName,
        userName: dbToDelete.username,
      };

      // Add password for MySQL
      if (dbToDelete.dbType?.toLowerCase() === 'mysql' && dbToDelete.password) {
        payload.password = dbToDelete.password;
      }

      const res = dbToDelete.dbType?.toLowerCase() === 'mysql'
        ? await apiClient(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
          })
        : await apiClient(endpoint, {
            method: "DELETE",
          });

      if (res.ok) {
        setDatabases(databases.filter((db) => db.id !== dbToDelete.id));
        setIsDeleteModalOpen(false);
        setDbToDelete(null);
      } else {
        console.error("Failed to delete database");
      }
    } catch (error) {
      console.error("Error deleting database:", error);
    }
  };

  const handleBackupDatabase = async () => {
    if (!selectedDbForDetails) return;

    const dbType = selectedDbForDetails.dbType?.toLowerCase();
    
    if (dbType !== 'mysql' && dbType !== 'postgres' && dbType !== 'postgresql') {
      console.error("Backup is only available for MySQL and PostgreSQL databases");
      return;
    }

    setIsBackingUp(true);
    try {
      // Determine endpoint based on database type
      const endpoint = dbType === 'mysql'
        ? `${STORAGE_LAYER_DEPOYMENT_URL}/backup-mysql-db`
        : `${STORAGE_LAYER_DEPOYMENT_URL}/backup-postgres-db`;

      const payload: any = {
        vpsId: selectedDbForDetails.vpsId,
        vpsIp: selectedDbForDetails.host,
        dbName: selectedDbForDetails.dbName,
        userName: selectedDbForDetails.username,
      };

      // Add password for MySQL
      if (dbType === 'mysql' && selectedDbForDetails.password) {
        payload.password = selectedDbForDetails.password;
      }

      const res = await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Backup created successfully! ${data.message || ''}`);
      } else {
        alert(`Backup failed: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error backing up database:", error);
      alert("Failed to create backup. Please try again.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDatabaseIcon = (databaseType: string) => {
    const type = databaseType.toLowerCase();
    if (type === "postgres" || type === "postgresql")
      return <SiPostgresql className="text-blue-400" />;
    if (type === "mysql") return <SiMysql className="text-orange-400" />;
    if (type === "mongodb") return <SiMongodb className="text-green-400" />;
    if (type === "redis") return <SiRedis className="text-red-400" />;
    return <FiDatabase className="text-gray-400" />;
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

  const filteredDatabases = databases.filter(
    (db) =>
      db.dbName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.dbType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-xl w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search databases by name, type or host..."
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

      <div className="grid grid-cols-1 gap-8">
        {/* Databases Grid */}
        <div className="lg:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
              Active Databases
            </h3>
            <span className="text-xs text-gray-500">
              {filteredDatabases.length} databases found
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDatabases.length === 0 ? (
                <div className="col-span-2 text-center py-20 border border-dashed border-[#333] rounded-3xl text-gray-500">
                  <FiDatabase className="mx-auto text-4xl mb-4 opacity-20" />
                  <p>No databases found matching your search.</p>
                </div>
              ) : (
                filteredDatabases.map((database) => (
                  <div
                    key={database.id}
                    onClick={() => {
                      setSelectedDbForDetails(database);
                      setIsDetailsModalOpen(true);
                    }}
                    className="group relative border border-[#333] rounded-2xl p-6 bg-black hover:border-gray-500 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {getDatabaseIcon(database.dbType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-white mb-0.5 truncate pr-8">
                          {database.dbName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            {database.dbType}
                          </span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-500">
                            {formatDate(database.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#222] group/info">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Host</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                database.host,
                                database.id as number
                              );
                            }}
                            className="text-gray-600 hover:text-white transition-colors"
                          >
                            {copiedId === database.id ? (
                              <FiCheck className="text-green-500" />
                            ) : (
                              <FiCopy />
                            )}
                          </button>
                        </div>
                        <div className="text-xs font-mono text-gray-300 truncate">
                          {database.host}
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              database.status === "RUNNING" ||
                              database.status === "active"
                                ? "bg-green-500"
                                : database.status === "STARTING"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-green-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                            }`}
                          ></div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {database.status || "Active"}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <FiActivity className="text-gray-600" />
                          PROD
                        </div>
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
                      Database
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
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredDatabases.map((database) => (
                    <tr
                      key={database.id}
                      onClick={() => {
                        setSelectedDbForDetails(database);
                        setIsDetailsModalOpen(true);
                      }}
                      className="hover:bg-[#0A0A0A] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">
                            {getDatabaseIcon(database.dbType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {database.dbName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {formatDate(database.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 uppercase">
                          {database.dbType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-400 max-w-[200px] truncate">
                          {database.host}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              database.status === "RUNNING" ||
                              database.status === "active"
                                ? "bg-green-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-400">
                            {database.status || "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDbForDetails(database);
                            setIsDetailsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#111] border border-[#222] text-xs text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-all"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIsDetailsModalOpen(false);
          setDbToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Database"
        message={`Are you sure you want to delete the database "${dbToDelete?.dbName}"? This action cannot be undone and all data will be permanently lost.`}
        confirmText="Delete"
        isDangerous={true}
      />

      {/* Database Details Modal */}
      {isDetailsModalOpen && selectedDbForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-7xl h-[95vh] md:h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-4">
                <div className="text-3xl p-2 bg-[#111] rounded-xl border border-[#222]">
                  {getDatabaseIcon(selectedDbForDetails.dbType)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedDbForDetails.dbName}
                    <span className="text-[10px] uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {selectedDbForDetails.status || "Active"}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedDbForDetails.host}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedDbForDetails(null);
                    setSelectedTable(null);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#222] bg-black/30 px-6">
              {[
                { id: "overview", label: "Overview", icon: FiInfo },
                { id: "tables", label: "Tables", icon: FiTable },
                { id: "query", label: "Query Runner", icon: FiTerminal },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "tables") {
                      fetchTableList(
                        selectedDbForDetails.dbName,
                        selectedDbForDetails.vpsId as string,
                        selectedDbForDetails.host,
                        selectedDbForDetails.dbType,
                        selectedDbForDetails.username,
                        selectedDbForDetails.password
                      );
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent border border-blue-500/20 rounded-2xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/10">
                        {getDatabaseIcon(selectedDbForDetails.dbType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-white">
                            {selectedDbForDetails.dbName}
                          </h4>
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            {selectedDbForDetails.status || "Active"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Database Engine:{" "}
                          <span className="text-gray-200 font-semibold">
                            {selectedDbForDetails.dbType}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                        Created On
                      </p>
                      <p className="text-sm text-white font-medium">
                        {new Date(
                          selectedDbForDetails.createdAt
                        ).toLocaleDateString(undefined, { dateStyle: "long" })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Connection Details */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="p-6 bg-[#050505] border border-[#222] rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <FiActivity size={18} />
                          </div>
                          <h4 className="text-sm font-bold text-white">
                            Connection Details
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                              Host
                            </label>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-blue-400 font-mono bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 truncate max-w-full">
                                {selectedDbForDetails.host}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    selectedDbForDetails.host,
                                    selectedDbForDetails.id as number
                                  )
                                }
                                className="text-gray-500 hover:text-white transition-colors"
                              >
                                {copiedId === selectedDbForDetails.id ? (
                                  <FiCheck
                                    className="text-green-500"
                                    size={14}
                                  />
                                ) : (
                                  <FiCopy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                              Username
                            </label>
                            <p className="text-sm text-gray-200 font-medium">
                              {selectedDbForDetails.username}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                              Port
                            </label>
                            <p className="text-sm text-gray-200 font-medium">
                              {selectedDbForDetails.dbType
                                .toLowerCase()
                                .includes("postgres")
                                ? "5432"
                                : selectedDbForDetails.dbType
                                    .toLowerCase()
                                    .includes("mysql")
                                ? "3306"
                                : selectedDbForDetails.dbType
                                    .toLowerCase()
                                    .includes("mongo")
                                ? "27017"
                                : "6379"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                              Database Name
                            </label>
                            <p className="text-sm text-gray-200 font-medium">
                              {selectedDbForDetails.dbName}
                            </p>
                          </div>
                          <div className="sm:col-span-2 space-y-3 mt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                Connection String
                              </label>
                              <div className="flex bg-[#111] rounded-lg p-0.5 border border-[#222]">
                                <button
                                  onClick={() => setConnectionType("external")}
                                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
                                    connectionType === "external"
                                      ? "bg-[#222] text-white"
                                      : "text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  External
                                </button>
                                <button
                                  onClick={() => setConnectionType("localhost")}
                                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
                                    connectionType === "localhost"
                                      ? "bg-[#222] text-white"
                                      : "text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  Localhost
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-emerald-400 font-mono bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-500/10 truncate flex-1">
                                {(() => {
                                  const protocol = selectedDbForDetails.dbType
                                    .toLowerCase()
                                    .includes("postgres")
                                    ? "postgresql"
                                    : selectedDbForDetails.dbType
                                        .toLowerCase()
                                        .includes("mongo")
                                    ? "mongodb"
                                    : selectedDbForDetails.dbType.toLowerCase();
                                  const host =
                                    connectionType === "localhost"
                                      ? "localhost"
                                      : selectedDbForDetails.host;
                                  return `${protocol}://${selectedDbForDetails.username}:${selectedDbForDetails.password}@${host}/${selectedDbForDetails.dbName}`;
                                })()}
                              </code>
                              <button
                                onClick={() => {
                                  const protocol = selectedDbForDetails.dbType
                                    .toLowerCase()
                                    .includes("postgres")
                                    ? "postgresql"
                                    : selectedDbForDetails.dbType
                                        .toLowerCase()
                                        .includes("mongo")
                                    ? "mongodb"
                                    : selectedDbForDetails.dbType.toLowerCase();
                                  const host =
                                    connectionType === "localhost"
                                      ? "localhost"
                                      : selectedDbForDetails.host;
                                  const connStr = `${protocol}://${selectedDbForDetails.username}:${selectedDbForDetails.password}@${host}/${selectedDbForDetails.dbName}`;
                                  copyToClipboard(
                                    connStr,
                                    (selectedDbForDetails.id as number) + 1000
                                  );
                                }}
                                className="p-2 bg-[#111] border border-[#222] rounded-lg text-gray-500 hover:text-white transition-colors"
                              >
                                {copiedId ===
                                (selectedDbForDetails.id as number) + 1000 ? (
                                  <FiCheck
                                    className="text-green-500"
                                    size={14}
                                  />
                                ) : (
                                  <FiCopy size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Backup Section */}
                          {(selectedDbForDetails.dbType?.toLowerCase() === 'mysql' || 
                            selectedDbForDetails.dbType?.toLowerCase() === 'postgres' ||
                            selectedDbForDetails.dbType?.toLowerCase() === 'postgresql') && (
                            <div className="sm:col-span-2 mt-6 pt-6 border-t border-[#222]">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                  <FiDownload size={18} />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">
                                    Database Backup
                                  </label>
                                  <p className="text-xs text-gray-400">
                                    Manage backups for your {selectedDbForDetails.dbType?.toUpperCase()} database
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                  onClick={handleBackupDatabase}
                                  disabled={isBackingUp}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-emerald-500/5 disabled:cursor-not-allowed text-emerald-400 rounded-xl transition-all text-xs font-bold border border-emerald-500/20 hover:border-emerald-500/40 disabled:border-emerald-500/10 group"
                                >
                                  {isBackingUp ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
                                      <span>Creating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiDownload className="group-hover:scale-110 transition-transform" />
                                      <span>Create Backup</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  disabled
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500/5 cursor-not-allowed text-gray-500 rounded-xl text-xs font-bold border border-gray-500/10 opacity-50"
                                  title="Coming soon"
                                >
                                  <FiExternalLink />
                                  <span>Access Backup</span>
                                </button>
                              </div>
                              {isBackingUp && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400/80">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                  <span>Backup in progress, please wait...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional empty-filler area: Resource Usage Mockup Removed */}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                      <div className="p-6 bg-[#050505] border border-[#222] rounded-2xl h-fit">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-4">
                          Management
                        </h4>
                        <div className="space-y-3">
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] hover:bg-[#161616] border border-[#222] rounded-xl text-xs text-gray-300 transition-all group"
                            onClick={() => setActiveTab("query")}
                          >
                            <span className="flex items-center gap-2">
                              <FiTerminal className="text-blue-400" /> Open SQL
                              Shell
                            </span>
                            <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] hover:bg-[#161616] border border-[#222] rounded-xl text-xs text-gray-300 transition-all group"
                            onClick={() => {
                              setActiveTab("tables");
                              fetchTableList(
                                selectedDbForDetails.dbName,
                                selectedDbForDetails.vpsId.toString(),
                                selectedDbForDetails.host,
                                selectedDbForDetails.dbType,
                                selectedDbForDetails.username,
                                selectedDbForDetails.password
                              );
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <FiTable className="text-green-400" /> Browse
                              Tables
                            </span>
                            <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#222]">
                          <h4 className="text-[10px] uppercase tracking-wider text-red-500/70 font-bold mb-4">
                            Danger Zone
                          </h4>
                          <button
                            onClick={() => {
                              setDbToDelete(selectedDbForDetails);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500/10 transition-all text-xs font-bold border border-red-500/10"
                          >
                            <FiTrash2 /> Delete Database
                          </button>
                          <p className="mt-3 text-[10px] text-gray-500 leading-relaxed">
                            Permanently delete this database and all of its
                            data. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tables" && (
                <div className="flex flex-col md:flex-row h-full gap-6 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Table List Sidebar */}
                  <div className="w-full md:w-1/4 lg:w-1/5 bg-black border border-[#222] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#222] bg-black/50">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {selectedDbForDetails?.dbType?.toLowerCase() === 'mysql' ? 'MySQL Tables' : 'Public Tables'}
                      </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {isLoadingTables ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                          <div className="w-6 h-6 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin mb-2"></div>
                          <p className="text-xs">Loading tables...</p>
                        </div>
                      ) : tablesError ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-red-400 mb-2">{tablesError}</p>
                          <button
                            onClick={() => {
                              if (selectedDbForDetails) {
                                fetchTableList(
                                  selectedDbForDetails.dbName,
                                  selectedDbForDetails.vpsId as string,
                                  selectedDbForDetails.host,
                                  selectedDbForDetails.dbType,
                                  selectedDbForDetails.username,
                                  selectedDbForDetails.password
                                );
                              }
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Retry
                          </button>
                        </div>
                      ) : selectedDbForDetails?.dbType?.toLowerCase() === 'mysql' ? (
                        // MySQL tables rendering (objects with name/size)
                        Array.isArray(mysqlTablesList) && mysqlTablesList.length > 0 ? (
                          mysqlTablesList.map((tableObj) => {
                            const tableName = tableObj.name;
                            return (
                              <button
                                key={tableName}
                                onClick={() => {
                                  setSelectedTable(tableName);
                                  fetchTableData(
                                    selectedDbForDetails!.dbName,
                                    selectedDbForDetails!.host,
                                    selectedDbForDetails!.vpsId,
                                    tableName,
                                    selectedDbForDetails!.username,
                                    selectedDbForDetails!.dbType,
                                    selectedDbForDetails!.password
                                  );
                                }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-[#111] last:border-0 ${
                                  selectedTable === tableName
                                    ? "bg-white/5 text-white"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <FiTable
                                      className={
                                        selectedTable === tableName
                                          ? "text-blue-400 shrink-0"
                                          : "text-gray-600 shrink-0"
                                      }
                                    />
                                    <span className="truncate">{tableName}</span>
                                  </div>
                                  {tableObj.size !== undefined && (
                                    <span className="text-[10px] text-gray-500 shrink-0">
                                      {typeof tableObj.size === 'number' 
                                        ? `${(tableObj.size / 1024).toFixed(2)} KB`
                                        : tableObj.size}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <FiTable className="mx-auto mb-2 opacity-20" size={24} />
                            <p className="text-xs">No tables found</p>
                          </div>
                        )
                      ) : (
                        // PostgreSQL tables rendering (string array)
                        Array.isArray(tablesList) && tablesList.length > 0 ? (
                          tablesList.map((table) => (
                            <button
                              key={table}
                              onClick={() => {
                                setSelectedTable(table);
                                fetchTableData(
                                  selectedDbForDetails!.dbName,
                                  selectedDbForDetails!.host,
                                  selectedDbForDetails!.vpsId,
                                  table,
                                  selectedDbForDetails!.username,
                                  selectedDbForDetails!.dbType,
                                  selectedDbForDetails!.password
                                );
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-[#111] last:border-0 ${
                                selectedTable === table
                                  ? "bg-white/5 text-white"
                                  : "text-gray-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FiTable
                                  className={
                                    selectedTable === table
                                      ? "text-blue-400"
                                      : "text-gray-600"
                                  }
                                />
                                {table}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <FiTable className="mx-auto mb-2 opacity-20" size={24} />
                            <p className="text-xs">No tables found</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Table Data View */}
                  <div className="flex-1 bg-black border border-[#222] rounded-2xl overflow-hidden flex flex-col">
                    {selectedTable ? (
                      <>
                        <div className="p-4 border-b border-[#222] bg-black/50 flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Data for table:{" "}
                            <span className="text-blue-400">
                              {selectedTable}
                            </span>
                          </h4>
                          <span className="text-[10px] text-gray-500">
                            Showing first 100 rows
                          </span>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <div className="border border-[#333] rounded-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#0A0A0A]">
                                  {tableData && tableData.length > 0 ? (
                                    Object.keys(tableData[0]).map((key, idx, arr) => (
                                      <th
                                        key={key}
                                        className={`px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-r border-[#333] last:border-r-0 min-w-[120px] max-w-[300px]`}
                                      >
                                        <div className="truncate">{key}</div>
                                      </th>
                                    ))
                                  ) : (
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                      Information
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {tableData && tableData.length > 0 ? (
                                  tableData.map((row: any, i: number) => (
                                    <tr
                                      key={i}
                                      className="border-t border-[#222] hover:bg-white/5 transition-colors"
                                    >
                                      {Object.values(row).map((val: any, j) => (
                                        <td
                                          key={j}
                                          className="px-4 py-3 text-xs text-gray-300 font-mono border-r border-[#222] last:border-r-0 min-w-[120px] max-w-[300px]"
                                        >
                                          <div className="truncate" title={String(val)}>
                                            {val === null || val === undefined ? (
                                              <span className="text-gray-600 italic">NULL</span>
                                            ) : (
                                              String(val)
                                            )}
                                          </div>
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      className="py-10 text-center text-gray-500 italic text-sm"
                                      colSpan={10}
                                    >
                                      No data available in mock view for this
                                      table.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-10">
                        <FiTable size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">
                          Select a table to view its schema and data
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "query" && (
                <div className="space-y-6 h-full flex flex-col animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-black border border-[#222] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-3 bg-[#111] border-b border-[#222] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FiTerminal className="text-blue-400" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          SQL Editor
                        </span>
                      </div>
                      <button
                        onClick={handleRunQuery}
                        disabled={isExecuting || !query.trim()}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all"
                      >
                        {isExecuting ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <FiPlay />
                        )}
                        RUN QUERY
                      </button>
                    </div>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="SELECT * FROM users LIMIT 10;"
                      className="w-full h-32 bg-black text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none placeholder:text-gray-700"
                    />

                    {/* Query Output Console */}
                    <div className="border-t border-[#222] bg-[#050505] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isExecuting
                              ? "bg-yellow-500 animate-pulse"
                              : queryResult
                              ? queryResult.status === "success"
                                ? "bg-green-500"
                                : "bg-red-500"
                              : "bg-gray-700"
                          }`}
                        ></div>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Output
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-gray-400 min-h-[40px] max-h-[100px] overflow-y-auto">
                        {isExecuting ? (
                          <span className="text-yellow-500/80">
                            Executing query...
                          </span>
                        ) : queryResult ? (
                          <div>
                            <span
                              className={
                                queryResult.status === "success"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              [{new Date().toLocaleTimeString()}]{" "}
                              {queryResult.status === "success"
                                ? "Query executed successfully."
                                : "Error executing query."}
                            </span>
                            <div className="mt-1">
                              {queryResult.status === "success" ? (
                                <span>
                                  Affected rows: {queryResult.rows?.length || 0}{" "}
                                  | Time: {queryResult.executionTime}
                                </span>
                              ) : (
                                <span className="text-red-400">
                                  Error message:{" "}
                                  {queryResult.message || "Unknown error"}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">
                            No output yet. Write a query and press RUN.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {queryResult && queryResult.status === "success" && queryResult.rows && Array.isArray(queryResult.rows) && queryResult.rows.length > 0 && (
                    <div className="flex-1 bg-black border border-[#222] rounded-2xl overflow-hidden flex flex-col animate-in fade-in duration-500">
                      <div className="p-3 bg-[#111] border-b border-[#222] flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                          Query Result
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Executed in {queryResult.executionTime || "0ms"}
                        </span>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        <div className="border border-[#333] rounded-lg overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#0A0A0A]">
                                {queryResult.rows[0] && typeof queryResult.rows[0] === 'object' && !Array.isArray(queryResult.rows[0]) ? (
                                  Object.keys(queryResult.rows[0]).map((key) => (
                                    <th
                                      key={key}
                                      className="px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-r border-[#333] last:border-r-0 min-w-[120px] max-w-[300px]"
                                    >
                                      <div className="truncate">{String(key)}</div>
                                    </th>
                                  ))
                                ) : (
                                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    Result
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.rows.map((row: any, i: number) => {
                                // Safely handle different row structures
                                if (!row || typeof row !== 'object' || Array.isArray(row)) {
                                  return (
                                    <tr key={i} className="border-t border-[#222] hover:bg-white/5 transition-colors">
                                      <td className="px-4 py-3 text-xs text-gray-300 font-mono" colSpan={100}>
                                        <div className="truncate" title={String(row)}>
                                          {row === null || row === undefined ? (
                                            <span className="text-gray-600 italic">NULL</span>
                                          ) : (
                                            String(row)
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }

                                const rowValues = Object.values(row);
                                const rowKeys = Object.keys(row);
                                
                                return (
                                  <tr
                                    key={i}
                                    className="border-t border-[#222] hover:bg-white/5 transition-colors"
                                  >
                                    {rowValues.map((val: any, j) => (
                                      <td
                                        key={j}
                                        className="px-4 py-3 text-xs text-gray-300 font-mono border-r border-[#222] last:border-r-0 min-w-[120px] max-w-[300px]"
                                      >
                                        <div className="truncate" title={String(val)}>
                                          {val === null || val === undefined ? (
                                            <span className="text-gray-600 italic">NULL</span>
                                          ) : typeof val === 'object' ? (
                                            <span className="text-gray-500 italic">[Object]</span>
                                          ) : (
                                            String(val)
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Databases;
