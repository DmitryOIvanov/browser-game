import playField from "./playField.js";

export class TaskPerformer {
    constructor(tasks) {
        this.tasks = tasks;
        this.concluded = false;
        this.nextTaskIndex = 0;
        this.curTask = null;

        this.playerLost = false;
    }

    timestep(amount) {
        if (this.concluded) return;
        if (!this.curTask) this.startNextTask();
        if (this.curTask.timestep) this.curTask.timestep(amount);
        while (this.curTask.concluded) {
            if (this.nextTaskIndex < this.tasks.length) {
                this.startNextTask();
                if (this.curTask.timestep) this.curTask.timestep(0);
            } else {
                this.concluded = true;
                return;
            }
        }
    }

    startNextTask() {
        const taskInfo = this.tasks[this.nextTaskIndex];
        this.curTask = new taskInfo.class(taskInfo);
        this.nextTaskIndex++;
    }
}

export default class TaskBasedManager {
    constructor(tasks) {
        this.concluded = false;
        this.performer = new TaskPerformer(tasks);
    }

    onPlayfieldInit() { }

    onPlayerHit() {
        if (playField.player.hp <= 0) {
            this.playerLost = true;
            this.concluded = true;
        }
    }

    timestep(dt) {
        if (this.concluded) return;
        this.performer.timestep(dt);
        if (this.performer.concluded) this.concluded = true;
    }
}
