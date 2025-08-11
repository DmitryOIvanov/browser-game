import { createAttackProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import controls from "../controls.js";
import playField from "../playField.js";
import PointPProj from "../projectiles/player/pointPProj.js";

export class BasicDualWeaponComponent {
    constructor(fireTime, numShots, spread, variance, speed, projectileGenerator){
        this.fireTime = fireTime;
        this.numShots = numShots;
        this.spread = spread;
        this.variance = variance;
        this.speed = speed;
        this.projectileGenerator = projectileGenerator;
    }

    fire(partialDt){
        let dx = controls.mouse.x-playField.player.x;
        let dy = controls.mouse.y-playField.player.y;
        if(dx==0 && dy==0) dx = 1;
        const baseAngle = Math.atan2(dy,dx);
        for(let i=0; i<this.numShots; i++){
            let angle = baseAngle + this.spread*(i+0.5*(1-this.numShots)) + this.variance*2*(Math.random()-0.5);
            let dx = this.speed * Math.cos(angle);
            let dy = this.speed * Math.sin(angle);
            const newBullet = this.projectileGenerator(playField.player.x, playField.player.y, dx, dy, Color.WHITE);
            newBullet.timeStep(partialDt);
            playField.addPlayerProjectile(newBullet);
        }
    }
}

export class DualWeapon {
    constructor(lightComponent, heavyComponent){
        this.lightComponent = lightComponent;
        this.heavyComponent = heavyComponent;

        this.isShootingHeavy = false;
        this.isManuallyFiring = false;
        this.lightTimer = 0;
        this.heavyTimer = 0;

        this.color = Color.WHITE;
    }

    timeStep(dt){
        this.isManuallyFiring = !!controls.mouse.leftHeld;
        this.isShootingHeavy = !!controls.mouse.rightHeld;

        this.lightTimer += dt;
        if(!this.isShootingHeavy){
            if(this.heavyTimer >= this.heavyComponent.fireTime) this.heavyComponent.fire(dt);
            this.heavyTimer = 0;
            
            if(this.isManuallyFiring){
                while(this.lightTimer >= this.lightComponent.fireTime){
                    this.lightTimer -= this.lightComponent.fireTime;
                    this.lightComponent.fire(this.lightTimer);
                }
            }
        }else{
            this.heavyTimer += dt;
            if(this.isManuallyFiring){
                while(this.heavyTimer >= this.heavyComponent.fireTime){
                    this.heavyTimer -= this.heavyComponent.fireTime;
                    this.heavyComponent.fire(this.heavyTimer);
                }
            }
            if(this.heavyTimer > this.heavyComponent.fireTime) this.heavyTimer = this.heavyComponent.fireTime;
        }
        if(this.lightTimer > this.lightComponent.fireTime) this.lightTimer = this.lightComponent.fireTime;
    }
}