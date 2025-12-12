export function parseMemory(raw: string) {
  const lines = raw.trim().split('\n');
  const memLine = lines[1].split(/\s+/);
  const swapLine = lines[2].split(/\s+/);
  return {
    memory: {
      total: Number(memLine[1]),
      used: Number(memLine[2]),
      free: Number(memLine[3]),
      shared: Number(memLine[4]),
      buff_cache: Number(memLine[5]),
      available: Number(memLine[6]),
    },
    swap: {
      total: Number(swapLine[1]),
      used: Number(swapLine[2]),
      free: Number(swapLine[3]),
    }
  };
}
export function parseDisk(raw: string) {
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(/\s+/);

  return lines.slice(1).map(line => {
    const cols = line.split(/\s+/);
    return {
      filesystem: cols[0],
      size: cols[1],
      used: cols[2],
      avail: cols[3],
      usePercent: cols[4],
      mountedOn: cols[5],
    };
  });
}
export function parseCPU(raw: string) {
  const line = raw.split(":");
  return { model: line[1].trim() };
}
export function parseOS(raw: string) {
  return raw.replace("Operating System:", "").trim();
}
export function parseProcesses(raw: string) {
  const lines = raw.split("\n");

  // Find the header line
  const headerIndex = lines.findIndex(l => l.trim().startsWith("PID"));
  if (headerIndex === -1) return [];

  const header = lines[headerIndex].trim().split(/\s+/);

  const processLines = lines.slice(headerIndex + 1);

  return processLines
    .filter(l => l.trim().length > 0)
    .map(line => {
      const cols = line.trim().split(/\s+/);

      return {
        pid: cols[0],
        user: cols[1],
        pr: cols[2],
        ni: cols[3],
        virt: cols[4],
        res: cols[5],
        shr: cols[6],
        status: cols[7],
        cpu: cols[8],
        mem: cols[9],
        time: cols[10],
        command: cols.slice(11).join(" ")
      };
    });
}
export function parseSystemData(data: {memory:string, disk:string, cpu:string, os:string, processes:string}) {
  return {
    memory: parseMemory(data.memory),
    disk: parseDisk(data.disk),
    cpu: parseCPU(data.cpu),
    os: parseOS(data.os),
    processes: parseProcesses(data.processes)
  };
}
export default parseSystemData