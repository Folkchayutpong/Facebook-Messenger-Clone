import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
  auth: {
    token: localStorage.getItem("token"),
  },
});

socket.on("connect", () => console.log("✅ connected:", socket.id));
socket.on("connect_error", (err) => console.log("❌ connect error:", err.message));
