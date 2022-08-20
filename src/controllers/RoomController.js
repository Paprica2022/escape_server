import log from "../logger.js";

class RoomController {
    /*
    room_id : {
        room_status : "waiting" or "playing",
        player : Map (),
        map : ""
    }
    */

    _room = new Map();

    createRoomSid(room_id,room_sid) {
        log.info(`created room[${room_id}]`);
        this._room.set(room_id, {
            room_status : "waiting",
            player : new Map(),
            map : room_sid
        });
        console.log(this._room);
    }

    roomExists(room_id){
        return this._room.has(room_id);
    }
    getRoomInfo(room_id) {
        if (!this._room.has(room_id)) {
            log.error(`room_id[${room_id}] Not Found`);
            return false;
        }
        return {
            room_id: room_id,
            room_status: this._room.get(room_id)["room_status"],
            player: [...this._room.get(room_id)["player"]],
            map : this._room.get(room_id)["map"],
        };
    }

    quitUser(socket_id) {
        for (let [room_id, { room_status, player, map }] of this._room) {
            let isUser = true;
            if (player.has(socket_id)) {
                player.delete(socket_id);
            }  else {
                isUser = false;
            }

            if (isUser) {
                return room_id;
            }
        }
    }

    getRoomList() {
        return [...this._room].map(([key, value]) => ({
            room_id: key,
            room_status: value["room_status"],
        }));
    }

    //룸에 플레이어를 넣는 함수
    setPlayer(room_id, socket_id) {
        //룸 아이디에 해당하는 룸이 없을 경우
        if (!this._room.has(room_id)) {
            log.error(`Room[${room_id}] Not Found`);
            return false;
        }

        // 맥스 플레이어 세팅 - 2인 경우
        // if (this._room.get(room_id)["player"].size > 1) {
        //     return false;
        // }

        log.info(`User[${socket_id}] be Player in Room[${room_id}]`);
        
        //룸 리스트에서 해당 롬 아이디에 해당하는 룸을 찾아 그 플레이어 리스트에 키:클라이언트소켓아이디, 밸류:0로 세팅 -> 밸류 0는 추후 수정 필요!!!!
        this._room.get(room_id)["player"].set(socket_id, 0);
        return true;
    }



}

export default new RoomController;