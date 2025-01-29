import { CircleArea, PointArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { bounceBoundify, isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

const NUM_COL_SAMPLES = 15;
const BOUNDING_RADIUS_COEFF = 0.5;

export default class PointPProj{
    constructor(x,y,vx,vy,pierce,color,attackProfileGenerator){
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.boundingRad = BOUNDING_RADIUS_COEFF*Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        this.prevX=x; this.prevY=y;
        this.color = color;
        this.attackProfile = attackProfileGenerator();
        this.numColSamples = NUM_COL_SAMPLES;
        this.pierce = pierce;

        this.colSamples = Array(NUM_COL_SAMPLES).fill(null).map(()=>(new PointArea(x,y)));
        this.boundingCircle = new CircleArea(x,y,this.boundingRad);
        this.excludes = {};
        // this.reflPoints = null;
    }

    timeStep(amount){
        if(this.retired) return;
        this.prevX = this.x;
        this.prevY = this.y;
        for(let i=0; i<NUM_COL_SAMPLES; i++){
            this.x += this.vx*amount/NUM_COL_SAMPLES;
            this.y += this.vy*amount/NUM_COL_SAMPLES;
            // if(!isInBounds(this.x, playField.x, 0)){
            //     this.x = bounceBoundify(this.x, playField.x, 0);
            //     this.vx *= -1;
            // }
            // if(!isInBounds(this.y, playField.y, 0)){
            //     this.y = bounceBoundify(this.y, playField.y, 0);
            //     this.vy *= -1;
            // }
            this.colSamples[i].update(this.x,this.y);
        }
        const middleCol = (NUM_COL_SAMPLES-1)/2;
        this.boundingCircle.update(this.colSamples[middleCol].x,this.colSamples[middleCol].y,this.boundingRad);
        if(
            !isInBounds(this.x, playField.x, -this.boundingRad) ||
            !isInBounds(this.y, playField.y, -this.boundingRad)
        ){
            this.retired = true;
        }
    }

    draw(){
        if(this.retired) return;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.lineCap = "butt";
    }

    getHit(){
        if(this.attackProfile.expired) this.retired = true;
    }
}