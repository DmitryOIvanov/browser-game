import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

export default class BallEProj{
    constructor(x,y,vx,vy,rad,thick,color){
        this.autonomous = true;
        this.x=x; this.y=y; this.vx=vx; this.vy=vy;
        this.radius = rad;
        this.thick = thick;
        this.color = color;
        this.area = new CircleArea(this.x, this.y, this.radius);
    }

    timeStep(amount){
        this.x += this.vx*amount;
        this.y += this.vy*amount;
        if(
            !isInBounds(this.x, playField.x, -this.radius) ||
            !isInBounds(this.y, playField.y, -this.radius)
        ){
            this.retired = true;
        }
        this.area.update(this.x, this.y, this.radius);
    }

    draw(){
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.thick;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
        ctx.stroke();
    }
}