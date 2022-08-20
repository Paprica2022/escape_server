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



}

export default new RoomController;