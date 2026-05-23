import { io } from "socket.io-client";

export const socket = io("https://mibus-backend-1.onrender.com", {
  transports: ["websocket"],
  //autoConnect: false,
});
