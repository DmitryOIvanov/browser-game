import { CircleArea } from "../areas.js";
import { timeStepBouncyMovement } from "../extraMath.js";
import AbstractEnemy from "./abstractEnemy.js";

export default class AbstractBasicCircle extends AbstractEnemy{
    constructor(x,y,evx,evy,initAngle,params){
        super();
        for(let param in params) this[param] = params[param];

        this.x=x; this.y=y;
        this.vx = this.regularSpeed*Math.cos(initAngle);
        this.vy = this.regularSpeed*Math.sin(initAngle);
        this.area = new CircleArea(this.x, this.y, this.hitRad);

        this.hitFlash = 0;

        // Currently unused
        this.extraVX = evx;
        this.extraVY = evy;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash -= amount;
        if(this.hitFlash < 0) this.hitFlash = 0;

        timeStepBouncyMovement(this, this.hitRad, amount);

        this.area.update(this.x, this.y, this.hitRad);
    }
}