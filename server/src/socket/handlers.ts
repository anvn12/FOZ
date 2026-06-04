import type { Server } from "socket.io";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket) => {
    socket.on("join-feed", () => {
      socket.join("global-feed");
    });
  });
}
