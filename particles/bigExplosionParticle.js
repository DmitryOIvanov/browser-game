import { ctx } from "../drawing.js";

export default class BigExplosionParticle{
    constructor(x,y,min,max,dur,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.minRad = min;
        this.maxRad = max;
        this.duration = dur;
        this.color = color;
        
        this.timeElapsed = 0;
        this.retired = false;
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.duration){
            this.retired = true;
        }
    }

    draw(){
        if(!this.retired){
            let t = this.timeElapsed/this.duration;
            if(t > 1) t = 1;
            let r = t*this.maxRad + 0.5*(1-t)*this.minRad
            ctx.strokeStyle = this.color.getStr();
            ctx.lineWidth = (1-t)*this.minRad;
            ctx.beginPath();
            ctx.arc(this.x,this.y,r,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
}