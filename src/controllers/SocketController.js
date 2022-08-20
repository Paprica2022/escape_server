import crypto from "crypto";
import log from "../logger.js";

import RoomController from "./RoomController.js";
// import GameController from "./GameController.js";

import ClientEvents from "../socket/constants/ClientEvents.js";
// import AppConfig from "../configs/AppConfig.js";


class SocketController {
    //disconnect시 : 창이 꺼졌을 때
    disconnect(io, socket) {
        //만약 게임 중이었다면 게임 내부 디비에서 유저 제거 -> 유저가 없으면 리턴값이 없어서 로비
        let room_id = RoomController.quitUser(socket.id) || "lobby";

        //로비가 아니었다면 -> 게임중
        if (room_id != "lobby") {
            //해당 룸에 있던 사람들에게 이 유저가 disconnect됨을 알림
            io.in(room_id).emit(ClientEvents.COMMAND, {
                command: ClientEvents.QUITUSER,
                socket_id: socket.id,
            });

            //로비에 있는 사람들에게 현재 열려있는 룸 리스트를 업데이트하는 함수
            this.updateRoomList(io, socket);

            //해당 룸이 남아있다면 그 사람들에게 룸인포 다시한번 전송
            if (RoomController.roomExists(room_id)) {
                io.in(room_id).emit(ClientEvents.COMMAND, {
                    command: ClientEvents.ROOMINFO,
                    room_info: RoomController.getRoomInfo(room_id),
                });
            }
        }

        log.info(`User[${socket.id}] Disconnected from Room[${room_id}]`);
    }

    //해당 소켓의 유저가 들어있는 룸 아이디 리턴함수. 만약 룸에 없다면 "lobby" 리턴
    getUserRoomId(socket) {
        let temp = socket.rooms.values();
        console.log(socket.rooms.values())
        temp.next(); // socket.id
        return temp.next().value;
    }

    //룸 생성 함수 info에 input 룸 시드값이 들어 있다
    createRoom(io, socket, info) {
        // console.log(info);
        //랜덤 시드 생성 - 룸 아이디로 활용
        let room_id = crypto.randomBytes(4).toString("hex");

        
        let user_room_id = this.getUserRoomId(socket);
        //만약 룸을 생성하려는 유저가 로비에 있지 않다면(룸에 있다면) 해당 연결 종료
        if (user_room_id != "lobby") {
            this.disconnect(io, socket);
            socket.leave(user_room_id);
        } 
        // else {
        //     socket.leave("lobby");
        // }
        // socket.join(room_id);

        // 생성한 아이디와 시드값에 해당하는 룸 생성 
        RoomController.createRoomSid(room_id, info.room_sid);
        // GameController.add(room_id);

        // update local RoomInfo
        // this.updateRoomInfo(io, socket);

        // 로비에 있는 사람들에게 생성된 룸 리스트들 업데이트하는 함수
        this.updateRoomList(io, socket);
    }

    //룸 참여 -> 참여하고자 하는 룸의 아이디는 info에 담겨 있다
    join(io, socket, info) {
        // info에 참여하고자하는 룸 아이디가 담겨있지 않은 경우
        if (!info.room_id) {
            log.error(`User[${socket.id}] Join Room Failed`);
            //클라에게 에러 에밋하는거 귀찮아서 안함
            return; //have to emit error
        }

        
        let room_id = info.room_id;

        
        let user_room_id = this.getUserRoomId(socket);
        //유저가 로비에 있지 않고 게임중이라면 연결 종료 (에러)
        if (user_room_id != "lobby") {
            this.disconnect(io, socket);
            socket.leave(user_room_id);
        } else {
            socket.leave("lobby");
        }
        //유저 룸에 조인
        socket.join(room_id);

        //플레이어를 룸 데이터에 넣는 함수
        RoomController.setPlayer(room_id, socket.id); // T/F auto join as player if room less than 2

        //소켓에 해당하는 유저가 들어있는 룸에 있는 유저들에게 룸 정보 업데이트 전송
        this.updateRoomInfo(io, socket); // update local RoomInfo
    }

    //소켓에 해당하는 유저가 들어있는 룸에 있는 유저들에게 룸 정보 업데이트 전송
    updateRoomInfo(io, socket) {
        let room_id = this.getUserRoomId(socket);
        io.in(room_id).emit(ClientEvents.COMMAND, {
            command: ClientEvents.ROOMINFO,
            room_info: RoomController.getRoomInfo(room_id),
        });
    }

    //소켓에 해당하는 유저에게 그 유저가 들어있는 룸 정보 업데이트 전송
    updateRoomListSingle(io, socket) {
        socket.emit(ClientEvents.COMMAND, {
            command: ClientEvents.UPDATEROOM,
            room_list: RoomController.getRoomList(),
        });
        this.sendSocketId(io, socket);
    }

    //로비에 있는 유저들에게 룸 리스트 업데이트 전송
    updateRoomList(io, socket) {
        io.in("lobby").emit(ClientEvents.COMMAND, {
            command: ClientEvents.UPDATEROOM,
            room_list: RoomController.getRoomList(),
        });
    }

    //소켓에 해당하는 유저에게 그 유저의 유저아이디를 전송
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