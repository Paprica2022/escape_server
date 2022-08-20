import { Server } from "socket.io";

import logger from "../logger.js";
import SocketController from "../controllers/SocketController.js";
import ServerEvents from "./constants/ServerEvents.js";
// import GameEvents from "./constants/GameEvents.js";
// import AppConfig from "../configs/AppConfig.js";


const port = process.env.PORT || 4000;

console.log(port);

const io = new Server(port,{
  cors:{
    origin:"*",
    methods:["GET","POST"],
  }
});


io.of("/").on(ServerEvents.CONNECTION, (socket) => {
    //socket connect
    logger.info(`User[${socket.id}] Connected at /`);
    socket.join("lobby");
    SocketController.updateRoomListSingle(io, socket);

    // socket disconnect
    socket.on(ServerEvents.DISCONNECT, ()=> {
        SocketController.disconnect(io, socket)
    });

    socket.on(ServerEvents.CREATEROOM, (info) => {
        // console.log(info);
        SocketController.createRoom(io,socket,info);
    });
});


export default io;
