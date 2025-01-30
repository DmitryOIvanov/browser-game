import { EquiTriangleArea } from "../areas.js";
import { isInBounds, normalizeAngle, normalizedAtan2, simpleBoundify } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

export default class AbstractBasicTriangle extends AbstractEnemy{
    constructor(x,y,evx,evy,initAngle,params){
        super();
        for(let param in params) this[param] = params[param];

        this.x = x;
        this.y = y;

        this.hitFlash = 0;
        this.angle = initAngle;
        
        let randDist = Math.sqrt(Math.random())*0.5;
        let randAngle = 2*Math.PI*Math.random();
        this.offsetX = Math.cos(randAngle)*randDist;
        this.offsetY = Math.sin(randAngle)*randDist;

        this.extraVX = evx;
        this.extraVY = evy;
        this.area = new EquiTriangleArea(this.x,this.y,this.hitRad,this.angle);
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash -= amount;
        if(this.hitFlash < 0) this.hitFlash = 0;

        let distSqr = (playField.player.x-this.x)*(playField.player.x-this.x) + (playField.player.y-this.y)*(playField.player.y-this.y);
        let dist = Math.sqrt(distSqr);
        let randDist = Math.sqrt(Math.random())*Math.sqrt(amount)*this.offsetMove;
        let randAngle = 2*Math.PI*Math.random();
        this.offsetX += Math.cos(randAngle)*randDist;
        this.offsetY += Math.sin(randAngle)*randDist;
        let offsetMag = Math.sqrt(this.offsetX*this.offsetX + this.offsetY*this.offsetY);
        let offsetCoeff = (1-this.offsetDampen*offsetMag*amount)*(1-this.offsetCloseDampen/(dist+1));
        this.offsetX *= offsetCoeff;
        this.offsetY *= offsetCoeff;
        let targetX = playField.player.x+this.inwardRadius*this.offsetX*dist;
        let targetY = playField.player.y+this.inwardRadius*this.offsetY*dist;
        let targetAngle = normalizedAtan2(targetY-this.y, targetX-this.x);
        // drawDot(targetX, targetY);
        let angleDiff = normalizeAngle(targetAngle - this.angle);
        if(angleDiff > Math.PI) angleDiff -= 2*Math.PI;
        let angleChange = amount*(angleDiff>=0?1:-1)*(this.baseTurnSpeed + this.turnSpeedBoost*angleDiff*angleDiff);
        if(Math.abs(angleChange) >= Math.abs(angleDiff)){
            this.angle = targetAngle;
        }else{
            this.angle += angleChange;
        }
        this.angle = normalizeAngle(this.angle);

        this.x += amount*this.speed * Math.cos(this.angle) + amount*this.extraVX;
        this.y += amount*this.speed * Math.sin(this.angle) + amount*this.extraVY;
        if(!isInBounds(this.x, playField.x, 0.5*this.hitRad)){
            this.x = simpleBoundify(this.x, playField.x, 0.5*this.hitRad);
            // this.angle = modAngle(Math.PI-this.angle);
            this.extraVX *= -1;
        }
        if(!isInBounds(this.y, playField.y, 0.5*this.hitRad)){
            this.y = simpleBoundify(this.y, playField.y, 0.5*this.hitRad);
            // this.angle = modAngle(-this.angle);
            this.extraVY *= -1;
        }

        let extraMagSqr = this.extraVX*this.extraVX + this.extraVY*this.extraVY;
        if(extraMagSqr <= amount*amount*this.evFriction*this.evFriction){
            this.extraVX = 0;
            this.extraVY = 0;
        }else{
            let coeff = 1 - amount*this.evFriction/Math.sqrt(extraMagSqr);
            this.extraVX *= coeff;
            this.extraVY *= coeff;
        }
        
        this.area.update(this.x,this.y,this.hitRad,this.angle);
    }
}