import playField from "./playField.js";

export default class TaskBasedManager {
    constructor(tasks){
        this.tasks = tasks;
        this.concluded = false;
        this.nextTaskIndex = 0;
        this.curTask = null;
        this.startNextTask();

        this.playerLost = false;
    }

    onPlayfieldInit(){}

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