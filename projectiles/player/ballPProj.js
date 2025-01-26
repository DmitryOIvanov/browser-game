import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { bounceBoundify, isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

const NUM_COL_SAMPLES = 5;

export default class BallPProj{
    constructor(x,y,vx,vy,rad,pierce,dur,color){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.radius = rad;
        this.boundingRad = 0.5*Math.sqrt(this.vx*this.vx + this.vy*this.vy) + this.radius;
        this.color = color;
        this.pierce = pierce;
        this.remainingTime = dur;
        this.numColSamples = NUM_COL_SAMPLES;

        this.colSamples = Array(NUM_COL_SAMPLES).fill(null).map(()=>(new CircleArea(x,y,rad)));
        this.boundingCircle = new CircleArea(x,y,this.boundingRad);
        this.excludes = {};
    }

    timeStep(amount){
        if(this.retired) return;
        this.remainingTime -= amount;
        if(this.remainingTime <= 0){
            this.retired = true;
            return;
        }

        for(let i=0; i<NUM_COL_SAMPLES; i++){
            this.x += this.vx*amount/NUM_COL_SAMPLES;
            this.y += this.vy*amount/NUM_COL_SAMPLES;
            if(!isInBounds(this.x, playField.x, this.radius)){
                this.x = bounceBoundify(this.x, playField.x, this.radius);
                this.vx *= -1;
                this.excludes = {};
            }
            if(!isInBounds(this.y, playField.y, this.radius)){
                this.y = bounceBoundify(this.y, playField.y, this.radius);
                this.vy *= -1;
                this.excludes = {};
            }
            this.colSamples[i].update(this.x,this.y,this.radius);
        }
        const middleCol = (NUM_COL_SAMPLES-1)/2;
        this.boundingCircle.update(this.colSamples[middleCol].x,this.colSamples[middleCol].y,this.boundingRad);
    }

    draw(){
        if(this.retired) return;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
        ctx.stroke();
    }

    getHit(){
        this.pierce -= 1;
        if(this.pierce <= 0) this.retired = true;
    }
}