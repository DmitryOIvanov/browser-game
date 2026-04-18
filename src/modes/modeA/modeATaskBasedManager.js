import { modeALevelList } from "./modeAGame.js";
import playField from "../../playField.js";
import TaskBasedManager from "../../taskBasedManager.js";

export default class ModeATaskBasedManager extends TaskBasedManager{
    constructor(game){
        super(modeALevelList[game.level].tasks);
        this.game = game;
    }

    onPlayfieldInit(){
        playField.player.weapon = this.game.weaponGenerator();
    }
}