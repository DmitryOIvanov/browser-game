import { ctx } from "../drawing.js";

export default class BasicSpawnerParticle{
    constructor(x,y,r,halfTime,color,spawnFunction){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.r = r;
        this.halfTime = halfTime;
        this.color = color;
        this.spawnFunction = spawnFunction;
        
        this.timeElapsed = 0;
        this.hasSpawned = false;
        this.retired = false;

        this.enemyRef = {enemy:null};
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.halfTime && !this.hasSpawned){
            this.enemyRef.enemy = this.spawnFunction();
            this.hasSpawned = true;
        }
        if(this.timeElapsed >= 2*this.halfTime){
            this.retired = true;
        }
    }

    draw(){
        if(!this.retired){
            let t = this.timeElapsed/this.halfTime - 1;
            if(t > 1) t = 1;
            let rad = (1-t*t)*this.r;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x,this.y,rad,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }

    getEnemyRef(){
        return this.enemyRef;
    }
}