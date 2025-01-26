import { ctx } from "../../drawing.js";
import { posMod } from "../../extraMath.js";
import BallEProj from "./ballEProj.js";

export default class BoilingBallEProj extends BallEProj{
    constructor(x,y,vx,vy,rad,thick,color,numRings,ringThick,period){
        super(x,y,vx,vy,rad,thick,color);
        this.numRings = numRings;
        this.ringThick = ringThick;
        this.period = period;

        this.phase = 0;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.phase = posMod(this.phase+amount/this.period, 1);
    }

    draw(){
        super.draw();
        ctx.lineWidth = this.ringThick;
        for(let i=0; i<this.numRings; i++){
            const rad = this.radius*(this.phase+i)/this.numRings;
            ctx.beginPath();
            ctx.arc(this.x,this.y,rad,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
}