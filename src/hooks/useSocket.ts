import { useState, useEffect } from "react";
interface socketMessage {
    type: string;
    deploymentId?:string;
    message?:string;
}
export const useSocket = (machineId: string,projectType:string) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<socketMessage | null>(null);
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        let WS_URL=""
        if(projectType =="webservice"){
            WS_URL = ("ws://localhost:5053/deploy-logs") + `?machineId=${machineId}&token=${token}`;
        }else if(projectType =="ui"){
            WS_URL = ("ws://localhost:5056/deploy-logs") + `?machineId=${machineId}&token=${token}`;
        }else{
            console.error("Invalid project type for WebSocket connection");
            return;
        }
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