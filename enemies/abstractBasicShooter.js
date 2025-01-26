import { CircleArea } from "../areas.js";
import { bounceBoundify, convergeToAngle, decToZero, isInBounds, normalizeAngle, normalizeAnglePMPI, normalizedAtan2 } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const MOOD_ORBIT = 0;
const MOOD_CHASE = 1;
const MOOD_FLEE = 2;

export default class AbstractBasicShooter extends AbstractEnemy{
    constructor(x,y,params){
        super();
        this.absParams = params;

        this.x=x; this.y=y;

        this.updateFacingAngle();
        this.movingAngle = 2*Math.PI*Math.random();
        this.area = new CircleArea(this.x,this.y,this.hitRad);
        this.mood = MOOD_ORBIT;
        this.moodCountdown = 0;
        this.resetFireCountdown();
    }

    updateFacingAngle(){
        let dx = playField.player.x - this.x;
        let dy = playField.player.y - this.y;
        this.facingAngle = normalizedAtan2(dy, dx);
    }

    resetFireCountdown(){
        this.fireCountdown = this.absParams.fireTimeBase + this.absParams.fireTimeVar*Math.random();
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash = decToZero(this.hitFlash, amount);

        this.moodCountdown -= amount;
        if(this.moodCountdown <= 0){
            this.moodCountdown = this.absParams.moodTimeBase + this.absParams.moodTimeVar*Math.random();
            const randNum = Math.random();
            const dx = playField.player.x - this.x;
            const dy = playField.player.y - this.y;
            const distSqr = dx*dx + dy*dy;
            const innerRSqr = this.absParams.innerOrbit*this.absParams.innerOrbit;
            const outerRSqr = this.absParams.outerOrbit*this.absParams.outerOrbit;
            if(randNum < 0.5){
                this.mood = MOOD_ORBIT;
            }else if(distSqr>outerRSqr || (randNum<0.75 && distSqr<innerRSqr)){
                this.mood = MOOD_CHASE;
            }else{
                this.mood = MOOD_FLEE;
            }
        }

        this.updateFacingAngle();
        let targetAngle = 0; // Dummy value
        if(this.mood == MOOD_CHASE){
            targetAngle = this.facingAngle;
        }else if(this.mood == MOOD_FLEE){
            targetAngle = this.facingAngle+Math.PI;
        }else{ // MOOD_ORBIT
            if(normalizeAnglePMPI(this.movingAngle-this.facingAngle)>=0){
                targetAngle = this.facingAngle+0.5*Math.PI;
            }else{
                targetAngle = this.facingAngle-0.5*Math.PI;
            }
        }
        this.movingAngle = convergeToAngle(this.movingAngle, targetAngle, this.absParams.turnSpeed*amount);

        this.x += amount*this.absParams.moveSpeed*Math.cos(this.movingAngle);
        this.y += amount*this.absParams.moveSpeed*Math.sin(this.movingAngle);
        if(!isInBounds(this.x, playField.x, this.absParams.hitRad)){
            this.x = bounceBoundify(this.x, playField.x, this.absParams.hitRad);
            this.movingAngle = normalizeAngle(Math.PI-this.movingAngle);
        }
        if(!isInBounds(this.y, playField.y, this.absParams.hitRad)){
            this.y = bounceBoundify(this.y, playField.y, this.absParams.hitRad);
            this.movingAngle = 2*Math.PI-this.movingAngle;
        }

        this.updateFacingAngle();
        this.area.update(this.x,this.y,this.absParams.hitRad);

        this.fireCountdown -= amount;
        if(this.fireCountdown <= 0){
            this.resetFireCountdown();
            this.shoot();
        }
    }
}