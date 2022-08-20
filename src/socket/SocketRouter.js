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

    // socket disconnect`  
    socket.on(ServerEvents.DISCONNECT, ()=> {
        SocketController.disconnect(io, socket)
    });

    //클라이언트로부터 룸 생성 req가 왔을 때
    socket.on(ServerEvents.CREATEROOM, (info) => {
        // console.log(info);
        //소켓 컨트롤러 룸 생성 함수 - io는 서버 오브젝트, socket은 각 클라이언트 연결정보, info는 추가 데이터
        SocketController.createRoom(io,socket,info);
    });

    //클라이언트로부터 룸 참가 req가 왔을 때
    socket.on(ServerEvents.JOINROOM, (info) => {
        // console.log("Socket On ", info);
        SocketController.join(io, socket, info);
    });
});


export default io;
