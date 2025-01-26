import { ctx } from "../drawing.js";

export default class ShrinkingCircleParticle{
    constructor(x,y,vx,vy,r,dur,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.r = r;
        this.duration = dur;
        this.color = color;
        
        this.timeElapsed = 0;
        this.retired = false;
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.duration){
            this.retired = true;
            return;
        }
        this.x += this.vx*amount;
        this.y += this.vy*amount;
    }

    draw(){
        if(this.retired) return;
        const t = 1 - this.timeElapsed/this.duration;
        ctx.fillStyle = this.color.getStr();
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r*t,0,2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}