import { io } from "socket.io-client";

const url = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const socket = io(url, { withCredentials: true });

socket.on("connect", () => {
  socket.emit("join-feed");
});
