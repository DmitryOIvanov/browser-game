import { ctx } from "../drawing.js";

export default class ShrinkingRingParticle{
    constructor(x,y,r1,r2,thick,dur,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.r1 = r1;
        this.dr = r2-r1;
        this.thick = thick;
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
        let t = this.timeElapsed/this.duration;
        if(t < 0) t = 0;
        const r = this.r1 + t*this.dr;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.thick;
        ctx.beginPath();
        ctx.arc(this.x,this.y,r,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }
}