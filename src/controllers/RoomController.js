import log from "../logger.js";
const player_max = 10;

class RoomController {
    /*
    room_id : {
        room_status : "waiting" or "playing",
        player : Map (),
        map : ""
    }
    */

    //룸들을 담는 맵
    _room = new Map();

    //룸 아이디와 룸 시드로 새로운 룸 생성하는 함수
    createRoomSid(room_id,room_sid) {
        log.info(`created room[${room_id}]`);
        this._room.set(room_id, {
            room_status : "waiting",
            player : new Map(),
            map : room_sid
        });
        console.log(this._room);
    }
    //해당 룸이 있나요?
    roomExists(room_id){
        return this._room.has(room_id);
    }
    //룸 아이디에 해당하는 룸 정보 리턴
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
    //해당 소켓 아이디의 유저를 그 유저가 들어있는 방에서 제거하는 함수
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
    //현재 생성된 룸 리스트 리턴
    getRoomList() {
        return [...this._room].map(([key, value]) => ({
            room_id: key,
            room_status: value["room_status"],
        }));
    }
    setRoomStatus(room_id, status) {
        log.info(`Room[${room_id}] set Status[${status}]`);
        this._room.get(room_id)["room_status"] = status; // modified room
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
        
        //룸 리스트에서 해당 롬 아이디에 해당하는 룸을 찾아 그 플레이어 리스트에 키:클라이언트소켓아이디, 밸류:0 레디 전 /  밸류:1 레디
        this._room.get(room_id)["player"].set(socket_id, 0);
        return true;
    }
    //룸 리스트에 해당하는 플레이어 리스트 리턴
    getPlayerList(room_id) {
        // use before game start
        if (!this._room.has(room_id)) {
            log.error(`Room[${room_id}] Not Found`);
            return false;
        }
        return [...this._room.get(room_id)["player"].keys()];
    }

    isRoomReady(room_id) {
        if (!this._room.has(room_id)) {
            log.error(`Room[${room_id}] Not Found`);
            return false;
        }
        const player_value = [...this._room.get(room_id)["player"].values()]
        return (
            player_value.filter((i) => i === 1).length === player_value.length
        );
    }

    
    setReady(room_id, socket_id) {
        if (!this._room.has(room_id)) {
            log.error(`Room[${room_id}] Not Found`);
            return false;
        }

        if (
            !this._room.get(room_id)["player"].has(socket_id) &&
            this._room.get(room_id)["player"].size >= player_max
        ) {
            log.error(`Room[${room_id}] player is Full`);
            return false;
        }

        log.info(`User[${socket_id}] ready in Room[${room_id}]`);
        this._room.get(room_id)["player"].set(socket_id, 1);
        return true;
    }




}

export default new RoomController;