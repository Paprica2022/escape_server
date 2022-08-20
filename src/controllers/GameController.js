import log from "../logger.js";

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
        log.info(`Setted Game[${room_id}]`);
        this._game.set(room_id, {
            player : players,
            location : locations
        });

    }

};


export default GameController;