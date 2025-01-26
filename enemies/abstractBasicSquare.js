import { OrthoRectArea } from "../areas.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

export default class AbstractBasicSquare extends AbstractEnemy{
    constructor(x,y,evx,evy,initDelay,params){
        super();
        for(let param in params) this[param] = params[param];

        this.x = x;
        this.y = y;
        this.area = new OrthoRectArea(this.x-this.hitRad, this.y-this.hitRad, this.x+this.hitRad, this.y+this.hitRad);
        
        this.stateTimer = 0;
        this.stateDuration = initDelay;
        this.isResting = true;
        this.moveDirIsX = true;
        this.moveLen = 1;
        this.movedPortion = 0;

        this.hp = this.maxHP;
        this.hitFlash = 0;

        this.extraVX = evx;
        this.extraVY = evy;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash -= amount;
        if(this.hitFlash < 0) this.hitFlash = 0;

        this.stateTimer += amount;
        while(this.stateTimer >= this.stateDuration){
            this.stateTimer -= this.stateDuration;
            this.isResting = !this.isResting;
            if(!this.isResting){
                let xAcceptable = (Math.abs(playField.player.x - this.x) <= this.targetTolerance);
                let yAcceptable = (Math.abs(playField.player.y - this.y) <= this.targetTolerance);
                if(xAcceptable && yAcceptable){
                    this.isResting = true;
                    this.stateDuration = this.baseRestTime + this.restTimeVariance*Math.random();
                }else{
                    this.moveDirIsX = yAcceptable || (!xAcceptable && (Math.random()>=0.5));
                    let initPos = this.x;
                    let playerPos = playField.player.x;
                    let scrSize = playField.x;
                    if(!this.moveDirIsX){
                        initPos = this.y;
                        playerPos = playField.player.y;
                        scrSize = playField.y;
                    }
                    this.moveLen = this.baseMoveLen + this.moveLenVariance*Math.random();
                    if(this.moveLen > Math.abs(playerPos - initPos) + this.targetTolerance){
                        this.moveLen = Math.abs(playerPos - initPos) + this.targetTolerance*(1-2*Math.random());
                    }
                    let targetPos = initPos + this.moveLen*((playerPos>=initPos)?1:-1);
                    if(targetPos < this.hitRad){
                        this.moveLen -= this.hitRad-targetPos;
                    }else if(targetPos > scrSize-this.hitRad){
                        this.moveLen -= targetPos+this.hitRad-scrSize;
                    }
                    this.stateDuration = Math.sqrt(this.moveLen)*this.accelCoeff;
                    this.moveLen *= ((playerPos>=initPos)?1:-1);
                    this.movedPortion = 0;
                }
            }else{
                this.stateDuration = this.baseRestTime + this.restTimeVariance*Math.random();
                let sinValue = Math.sin(0.5*Math.PI*this.movedPortion);
                if(this.moveDirIsX){
                    this.x += this.moveLen*(1 - sinValue*sinValue);
                }else{
                    this.y += this.moveLen*(1 - sinValue*sinValue);
                }
            }
        }
        if(!this.isResting){
            let sinValue1 = Math.sin(0.5*Math.PI*this.movedPortion);
            this.movedPortion = this.stateTimer/this.stateDuration;
            let sinValue2 = Math.sin(0.5*Math.PI*this.movedPortion); 
            let coeff = sinValue2*sinValue2 - sinValue1*sinValue1;
            if(this.moveDirIsX){
                this.x += coeff * this.moveLen;
            }else{
                this.y += coeff * this.moveLen;
            }
        }
        this.x += amount*this.extraVX;
        this.y += amount*this.extraVY;
        if(this.x < this.hitRad){
            this.x = 2*this.hitRad - this.x;
            this.extraVX *= -1;
        }else if(this.x > playField.x-this.hitRad){
            this.x = 2*(playField.x-this.hitRad) - this.x;
            this.extraVX *= -1;
        }
        if(this.y < this.hitRad){
            this.y = 2*this.hitRad - this.y;
            this.extraVY *= -1;
        }else if(this.y > playField.y-this.hitRad){
            this.y = 2*(playField.y-this.hitRad) - this.y;
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

        this.area.x1 = this.x - this.hitRad;
        this.area.y1 = this.y - this.hitRad;
        this.area.x2 = this.x + this.hitRad;
        this.area.y2 = this.y + this.hitRad;
    }
}