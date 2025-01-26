import Color from "../color.js";
import controls from "../controls.js";
import playField from "../playField.js";
import BallPProj from "../projectiles/player/ballPProj.js";

class BallPProjWeapon {
    constructor(fireRate, numShots, spread, variance, speed, pierce, radius, duration, color){
        this.fireRate = fireRate;
        this.numShots = numShots;
        this.spread = spread;
        this.variance = variance;
        this.speed = speed;
        this.pierce = pierce;
        this.radius = radius;
        this.duration = duration;
        this.color = color;

        this.fireTimer = 0;
    }

    timeStep(amount){
        this.fireTimer -= amount;
        if(this.fireTimer <= 0){
            if(!controls.mouse.leftHeld){
                this.fireTimer = 0;
                return;
            }
            while(this.fireTimer <= 0){
                let dx = controls.mouse.x-playField.player.x;
                let dy = controls.mouse.y-playField.player.y;
                if(dx==0 && dy==0) dx = 1;
                let coeff = this.speed/Math.sqrt(dx*dx + dy*dy);
                for(let i=0; i<this.numShots; i++){
                    let theta = this.spread*(i+0.5*(1-this.numShots)) + this.variance*2*(Math.random()-0.5);
                    let dx2 = coeff*(dx*Math.cos(theta) + dy*Math.sin(theta));
                    let dy2 = coeff*(dy*Math.cos(theta) - dx*Math.sin(theta));
                    let newBullet = new BallPProj(
                        playField.player.x, playField.player.y, dx2, dy2,
                        this.radius, this.pierce, this.duration, this.color);
                    newBullet.timeStep(-this.fireTimer);
                    playField.addPlayerProjectile(newBullet);
                }
                this.fireTimer += this.fireRate;
            }
        }
    }
}

export class BouncyWeapon extends BallPProjWeapon {
    constructor(){
        super(
            12, // fireRate
            1, // numShots
            0.01, // spread
            0, // variance
            15, // speed
            4, // pierce
            10, // radius
            150, // duration
            new Color(false,'#0f0') // color
        );
    }
}

export class MemeWeapon3 extends BallPProjWeapon {
    constructor(){
        super(
            5, // fireRate
            5, // numShots
            0.3, // spread
            0.2, // variance
            20, // speed
            100, // pierce
            15, // radius
            500, // duration
            new Color(true,0) // color
        );
    }
}