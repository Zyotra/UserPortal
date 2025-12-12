import { useState, useEffect } from "react";
interface socketMessage {
    type: string;
    deploymentId?:string;
    message?:string;
}
export const useSocket = (machineId: string) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<socketMessage | null>(null);
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const WS_URL = (import.meta.env.VITE_WS_URL || "ws://localhost:5053/deploy-logs") + `?machineId=${machineId}&token=${token}`;

        console.log("Connecting to WebSocket:", WS_URL);
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        // Track incoming messages
        ws.onmessage = (event) => {
            console.log("Message from server:", event.data);
            const data: socketMessage = JSON.parse(event.data);
            setMessages(data);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        setSocket(ws);

        // Cleanup function: This runs when machineId changes or component unmounts
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                console.log("Closing old WebSocket connection");
                ws.close();
            }
        };
    }, [machineId]);

    return { socket, messages };
};