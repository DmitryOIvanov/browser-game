import Color from "../color.js";
import controls from "../controls.js";
import playField from "../playField.js";
import FireworkProj from "../projectiles/player/fireworkProj.js";

class GeneralFireworkWeapon {
    constructor(fireRate, numShots, spread, variance, speed1, frags, speed2, speed3, radius, duration, color){
        this.fireRate = fireRate;
        this.numShots = numShots;
        this.spread = spread;
        this.variance = variance;
        this.speed1 = speed1;
        this.frags = frags;
        this.speed2 = speed2;
        this.speed3 = speed3;
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
                let coeff = this.speed1/Math.sqrt(dx*dx + dy*dy);
                for(let i=0; i<this.numShots; i++){
                    let theta = this.spread*(i+0.5*(1-this.numShots)) + this.variance*2*(Math.random()-0.5);
                    let dx2 = coeff*(dx*Math.cos(theta) + dy*Math.sin(theta));
                    let dy2 = coeff*(dy*Math.cos(theta) - dx*Math.sin(theta));
                    let newBullet = new FireworkProj(
                        playField.player.x, playField.player.y, dx2, dy2,
                        this.radius, this.duration, this.frags, this.speed2, this.speed3, this.color);
                    newBullet.timeStep(-this.fireTimer);
                    playField.addPlayerProjectile(newBullet);
                }
                this.fireTimer += this.fireRate;
            }
        }
    }
}

export class FireworkWeapon extends GeneralFireworkWeapon {
    constructor(){
        super(
            50, // fireRate
            1, // numShots
            0, // spread
            0, // variance
            12, // main speed
            16, // Frags per ring (2 rings)
            25, // speed of ring 1
            20, // speed of ring 2
            10, // radius
            50, // duration
            new Color(false,'#f5f') // color
        );
    }
}

export class MemeWeapon2 extends GeneralFireworkWeapon {
    constructor(){
        super(
            500, // fireRate
            1, // numShots
            0, // spread
            0, // variance
            12, // main speed
            1600, // Frags per ring (2 rings)
            25, // speed of ring 1
            20, // speed of ring 2
            10, // radius
            50, // duration
            new Color(true, 0) // color
        );
    }
}