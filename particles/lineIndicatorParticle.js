import { ctx } from "../drawing.js";
import playField from "../playField.js";

export default class LineIndicatorParticle{
    constructor(x1,y1,x2,y2,thick,color){
        this.autonomous = false;
        this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2;
        this.thick = thick;
        this.color = color;
        this.retired = false;
    }

    static createRayWithTarget(x1,y1,x2,y2,thick,color){
        const result = new LineIndicatorParticle(x1,y1,x2,y2,thick,color);
        result.updateRayWithTarget(x1,y1,x2,y2,thick,color);
        return result;
    }
    updateRayWithTarget(x1,y1,x2,y2,thick,color){
        this.updateRayPosWithTarget(x1,y1,x2,y2);
        this.thick = thick;
        this.color = color;
    }
    updateRayPosWithTarget(x1,y1,x2,y2){
        const dx = x2-x1;
        const dy = y2-y1;
        if(dx == 0 && dy == 0) dx = 1;
        const coeff = playField.maxDim/Math.max(Math.abs(dx),Math.abs(dy));

        this.x1=x1; this.y1=y1;
        this.x2=x1+dx*coeff;
        this.y2=y1+dy*coeff;
    }

    static createRayWithAngle(x1,y1,angle,thick,color){
        const result = new LineIndicatorParticle(x1,y1,0,0,thick,color);
        result.updateRayWithAngle(x1,y1,angle,thick,color);
        return result;
    }
    updateRayWithAngle(x1,y1,angle,thick,color){
        this.updateRayPosWithAngle(x1,y1,angle);
        this.thick = thick;
        this.color = color;
    }
    updateRayPosWithAngle(x1,y1,angle){
        this.x1=x1; this.y1=y1;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const coeff = playField.maxDim/Math.max(Math.abs(cos),Math.abs(sin));
        this.x2 = x1+cos*coeff;
        this.y2 = y1+sin*coeff;
    }
    

    draw(){
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.thick;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.closePath();
        ctx.stroke();
    }
}