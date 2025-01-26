import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";
import PointPProj from "./pointPProj.js";

export default class FireworkProj{
    static NUM_COL_SAMPLES = 5;

    constructor(x,y,vx,vy,rad,dur,fragsPerRing,fragSpeed1,fragSpeed2,color){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.radius = rad;
        this.boundingRad = 0.5*Math.sqrt(this.vx*this.vx + this.vy*this.vy) + this.radius;
        this.color = color;
        this.remainingTime = dur;
        this.fragsPerRing = fragsPerRing;
        this.fragSpeed1 = fragSpeed1;
        this.fragSpeed2 = fragSpeed2;
        this.numColSamples = FireworkProj.NUM_COL_SAMPLES;

        this.colSamples = Array(FireworkProj.NUM_COL_SAMPLES).fill(null).map(()=>(new CircleArea(x,y,rad)));
        this.boundingCircle = new CircleArea(x,y,this.boundingRad);
        this.excludes = {};
    }

    timeStep(amount){
        if(this.retired) return;
        this.remainingTime -= amount;
        if(this.remainingTime <= 0){
            this.explode(this.x, this.y);
            this.retired = true;
            return;
        }

        for(let i=0; i<FireworkProj.NUM_COL_SAMPLES; i++){
            this.x += this.vx*amount/FireworkProj.NUM_COL_SAMPLES;
            this.y += this.vy*amount/FireworkProj.NUM_COL_SAMPLES;
            if(!isInBounds(this.x, playField.x, this.radius) || !isInBounds(this.y, playField.y, this.radius)){
                this.explode(this.x, this.y);
                this.retired = true;
                return;
            }
            this.colSamples[i].update(this.x,this.y,this.radius);
        }
        const middleCol = (FireworkProj.NUM_COL_SAMPLES-1)/2;
        this.boundingCircle.update(this.colSamples[middleCol].x,this.colSamples[middleCol].y,this.boundingRad);
    }

    getHit(step){
        const x = this.colSamples[step].x;
        const y = this.colSamples[step].y;
        this.explode(x,y);
        this.retired = true;
    }

    explode(x,y){
        const randAngleOffset = 2*Math.PI*Math.random();
        for(let i=0; i<this.fragsPerRing; i++){
            const angle1 = 2*Math.PI*i/this.fragsPerRing + randAngleOffset;
            const vx1 = this.fragSpeed1*Math.cos(angle1);
            const vy1 = this.fragSpeed1*Math.sin(angle1);
            const bullet1 = new PointPProj(x,y,vx1,vy1,1,this.color);
            playField.addPlayerProjectile(bullet1);
            const angle2 = 2*Math.PI*(i+0.5)/this.fragsPerRing + randAngleOffset;
            const vx2 = this.fragSpeed2*Math.cos(angle2);
            const vy2 = this.fragSpeed2*Math.sin(angle2);
            const bullet2 = new PointPProj(x,y,vx2,vy2,1,this.color);
            playField.addPlayerProjectile(bullet2);
        }
    }

    draw(){
        if(this.retired) return;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
        ctx.stroke();
    }
}