import crypto from "crypto";
import log from "../logger.js";

import RoomController from "./RoomController.js";
// import GameController from "./GameController.js";

import ClientEvents from "../socket/constants/ClientEvents.js";
// import AppConfig from "../configs/AppConfig.js";


class SocketController {
    disconnect(io, socket) {
        let room_id = RoomController.quitUser(socket.id) || "lobby";

        if (room_id != "lobby") {
            io.in(room_id).emit(ClientEvents.COMMAND, {
                command: ClientEvents.QUITUSER,
                socket_id: socket.id,
            });
            this.updateRoomList(io, socket);

            if (RoomController.roomExists(room_id)) {
                io.in(room_id).emit(ClientEvents.COMMAND, {
                    command: ClientEvents.ROOMINFO,
                    room_info: RoomController.getRoomInfo(room_id),
                });
            }
        }

        log.info(`User[${socket.id}] Disconnected from Room[${room_id}]`);
    }
    getUserRoomId(socket) {
        let temp = socket.rooms.values();
        console.log(socket.rooms.values())
        temp.next(); // socket.id
        return temp.next().value;
    }

    createRoom(io, socket, info) {
        // console.log(info);
        let room_id = crypto.randomBytes(4).toString("hex");

        let user_room_id = this.getUserRoomId(socket);
        if (user_room_id != "lobby") {
            this.disconnect(io, socket);
            socket.leave(user_room_id);
        } else {
            socket.leave("lobby");
        }

        socket.join(room_id);

        // Spread Created Room
        RoomController.createRoomSid(room_id,info.room_sid);
        // GameController.add(room_id);

        // update local RoomInfo
        this.updateRoomInfo(io, socket);

        // broadcast Room List to all
        this.updateRoomList(io, socket);
    }
    join(io, socket, info) {
        if (!info.room_id) {
            log.error(`User[${socket.id}] Join Room Failed`);
            return; //have to emit error
        }

        let room_id = info.room_id;

        let user_room_id = this.getUserRoomId(socket)
        if (user_room_id != "lobby") {
            this.disconnect(io, socket);
            socket.leave(user_room_id);
        } else {
            socket.leave("lobby");
        }

        socket.join(room_id);

        RoomController.setPlayer(room_id, socket.id); // T/F auto join as player if room less than 2

        this.updateRoomInfo(io, socket); // update local RoomInfo
    }

    updateRoomInfo(io, socket) {
        let room_id = this.getUserRoomId(socket);
        io.in(room_id).emit(ClientEvents.COMMAND, {
            command: ClientEvents.ROOMINFO,
            room_info: RoomController.getRoomInfo(room_id),

        });
    }

    updateRoomListSingle(io, socket) {
        socket.emit(ClientEvents.COMMAND, {
            command: ClientEvents.UPDATEROOM,
            room_list: RoomController.getRoomList(),
        });
        this.sendSocketId(io, socket);
    }

    updateRoomList(io, socket) {
        io.in("lobby").emit(ClientEvents.COMMAND, {
          command: ClientEvents.UPDATEROOM,
          room_list: RoomController.getRoomList(),
        });
      }

    sendSocketId(io, socket) {
        socket.emit(ClientEvents.COMMAND, {
            command: ClientEvents.SENDID,
            socket_id: socket.id,
        });
    }

    ready(io, socket) {
        let room_id = this.getRoomId(socket);
        // if (!RoomController.isReady(room_id)) {
        //   log.error(`User[${socket.id}] Ready Failed Room[${room_id}] is playing`);
        //   return;
        // }
        RoomController.setReady(room_id, socket.id);
    
        if (RoomController.isReady(room_id)) {
          RoomController.setStatus(room_id, "playing");
          GameController.set(room_id, RoomController.getPlayer(room_id));
          GameController.initializeStone(room_id);
        }
    
        this.updateRoomInfo(io, socket);
      }

}

export default new SocketController();