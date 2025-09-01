import { modeALevelList } from "./modeAGame.js";
import playField from "../../playField.js";

// Contains some functionality specific to mode A, has to be generalized if needed

export default class ModeATaskBasedManager {
    constructor(game){
        this.game = game;
        this.tasks = modeALevelList[game.level].tasks;
        this.concluded = false;
        this.nextTaskIndex = 0;
        this.curTask = null;
        this.startNextTask();

        this.playerLost = false;
    }

    onPlayfieldInit(){
        playField.player.weapon = this.game.weaponGenerator();
    }

    onPlayerHit(){
        if(playField.player.hp <= 0){
            this.playerLost = true;
            this.concluded = true;
        }
    }

    timeStep(amount){
        if(this.concluded) return;
        if(this.curTask.timeStep) this.curTask.timeStep(amount);
        while(this.curTask.concluded){
            if(this.nextTaskIndex<this.tasks.length){
                this.startNextTask();
                if(this.curTask.timeStep) this.curTask.timeStep(0);
            }else{
                this.concluded = true;
                return;
            }
        }
    }

    startNextTask(){
        const taskInfo = this.tasks[this.nextTaskIndex];
        this.curTask = new taskInfo.class(taskInfo);
        this.nextTaskIndex++;
    }
}

function shuffleArray(arr){
    for(let i=1; i<arr.length; i++){
        const randIndex = Math.floor(Math.random()*(i+1));
        const temp = arr[randIndex];
        arr[randIndex] = arr[i];
        arr[i] = temp;
    }
}