import { RayArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import playField from "../../playField.js";

export default class LaserEProj{
    constructor(x,y,dx,dy,thick,color){
        this.autonomous = false;
        this.thick = thick;
        this.color = color;
        this.area = new RayArea(0,0,0,0,0);
        this.updatePosWithDelta(x,y,dx,dy);

        this.retired = false;
    }

    updatePosWithDelta(x,y,dx,dy){
        this.x1=x; this.y1=y;
        if(dx == 0 && dy == 0) dx = 1;
        this.dx=dx; this.dy=dy;
        const coeff = playField.maxDim/Math.max(Math.abs(this.dx),Math.abs(this.dy));
        this.x2 = x+coeff*dx;
        this.y2 = y+coeff*dy;
        this.area.update(this.x1,this.y1,this.dx,this.dy,this.thick);
    }
    static createWithAngle(x,y,angle,thick,color){
        const result = new LaserEProj(0,0,0,0,thick,color);
        result.updatePosWithAngle(x,y,angle);
        return result;
    }
    updatePosWithAngle(x,y,angle){
        this.x1=x; this.y1=y;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        const coeff = playField.maxDim/Math.max(Math.abs(this.dx),Math.abs(this.dy));
        this.x2 = x+coeff*this.dx;
        this.y2 = y+coeff*this.dy;
        this.area.update(this.x1,this.y1,this.dx,this.dy,this.thick);
    }

    startAutoDecay(thick,dur){
        this.autonomous = true;
        this.originalThick = thick;
        this.dur = dur;
        this.timeElapsed = 0;
        this.timeStep = this.timeStepDecay;
    }

    timeStepDecay(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.dur){
            this.retired = true;
        }
        this.thick = this.originalThick * (1-this.timeElapsed/this.dur);
    }

    draw(){
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.thick;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2);
        ctx.stroke();
        ctx.lineCap = "butt";
    }
}