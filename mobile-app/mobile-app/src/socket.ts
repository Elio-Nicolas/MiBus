import { io } from "socket.io-client";

export const socket = io("http://192.168.100.4:4001", {
  transports: ["websocket"],
});
