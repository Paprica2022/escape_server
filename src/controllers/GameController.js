import log from "../logger.js";
const multiply = 5;

class GameController {
    /*
    room_id : {
        player : [socket.id * usernumber]
        location : [x,y*usernumber]  -> no multi array              
    }
     */

    _game = new Map();

    createGame(room_id){
        log.info(`Created Game[${room_id}]`);
        this._game.set(room_id, {
            player : [],
            location : []
        });
    }

    set(room_id, players, locations){
        console.log(locations);
        log.info(`Setted Game[${room_id}]`);
        this._game.set(room_id, {
            player : players,
            location : Array(players.length*2).fill(6)
        });

    }
    getGameInfo(room_id) {
        console.log("room_id : ", room_id);
        console.log("_room : ", this._room); //undefined
        if (!this._room.has(room_id)) {
            log.error(`room_id[${room_id}] Not Found`);
            return false;
        }
        return {
            room_id: room_id,
            player: [...this._game.get(room_id)["player"]],
            location: [...this._game.get(room_id)["location"]]
        };
    }

    moveByDirection(socket_id, room_id, direction){
        let base_index = 0;
        let base_cal = 1;
        base_index = [...this._game.get(room_id)["player"]].indexOf(socket_id) * 2;
        if(direction ==="left"){
            base_cal = -1 * multiply;
        } else if (direction ==="right"){
            base_cal = 1 * multiply;
        } else if (direction ==="up"){
            base_index = base_index + 1
            base_cal = 1 * multiply;
        } else {
            base_index = base_index + 1
            base_cal = -1 * multiply;
        }
        let player_list = [...this._game.get(room_id)["player"]];
        player_list[base_index] = player_list[base_index] + base_cal;
        this._game.get(room_id)["player"].set(player_list);

    }

};


export default new GameController;