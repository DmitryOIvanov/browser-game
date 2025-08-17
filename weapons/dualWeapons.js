import { createAttackProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import controls from "../controls.js";
import Player from "../player.js";
import playField from "../playField.js";
import PointPProj from "../projectiles/player/pointPProj.js";

export class DualWeapon {
    constructor(lightComponent, heavyComponent){
        this.lightComponent = lightComponent;
        this.heavyComponent = heavyComponent;

        this.fireTimer = 0;
        this.wasRightClicking = false;

        this.color = Color.WHITE;
    }

    timeStep(dt){
        let dtAdded = false;
        let forcedHeavyShot = (this.wasRightClicking && !controls.mouse.rightHeld);
        if(this.heavyComponent.isContinuing() || controls.mouse.rightHeld || forcedHeavyShot){
            this.fireTimer += dt;
            dtAdded = true;
            while(true){
                if(!this.heavyComponent.isContinuing() && !forcedHeavyShot){
                    if(!controls.mouse.rightHeld || !controls.mouse.leftHeld) break;
                }
                if(this.fireTimer >= this.heavyComponent.getDelay()){
                    this.fireTimer -= this.heavyComponent.getDelay();
                    this.heavyComponent.fire(this.fireTimer);
                }else{
                    break;
                }
                forcedHeavyShot = false;
            }
        }

        if(!this.heavyComponent.isContinuing() && !controls.mouse.rightHeld){
            this.fireTimer = Math.min(this.fireTimer, this.lightComponent.getDelay());
            if(!dtAdded) this.fireTimer += dt;
            dtAdded = true;
            if(controls.mouse.leftHeld){
                while(this.fireTimer >= this.lightComponent.getDelay()){
                    this.fireTimer -= this.lightComponent.getDelay();
                    this.lightComponent.fire(this.fireTimer);
                }
            }
        }else if(controls.mouse.rightHeld){
            this.fireTimer = Math.min(this.fireTimer, this.heavyComponent.getDelay());
        }
        this.wasRightClicking = controls.mouse.rightHeld

        if(!dtAdded){
            console.log("[!!!] Dual weapon: dt added later than expected");
            this.fireTimer += dt;
        }
    }
}

function getFromArrayOrSingleValue(source, index){
    return Array.isArray(source) ? source[index] : source;
}

function fireProjectile(projectileGenerator, angle, speed, partialDt){
    const dx = speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);
    const newBullet = projectileGenerator(playField.player.x, playField.player.y, dx, dy, Color.WHITE);
    newBullet.timeStep(partialDt);
    playField.addPlayerProjectile(newBullet);
}

function fireProjectileWithSurfaceOffset(projectileGenerator, angle, speed, offsetAngle, partialDt){
    const x = playField.player.x + Player.IN_RAD * Math.cos(angle + offsetAngle);
    const y = playField.player.y + Player.IN_RAD * Math.sin(angle + offsetAngle);
    const dx = speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);
    const newBullet = projectileGenerator(x, y, dx, dy, Color.WHITE);
    newBullet.timeStep(partialDt);
    playField.addPlayerProjectile(newBullet);
}

function fireSpread(projectileGenerator, numShots, spread, variance, speed, partialDt){
    const dx = controls.mouse.x-playField.player.x;
    const dy = controls.mouse.y-playField.player.y;
    const baseAngle = Math.atan2(dy,dx);
    for(let i=0; i<numShots; i++){
        const angle = baseAngle + spread*(i+0.5*(1-numShots)) + variance*2*(Math.random()-0.5);
        fireProjectile(projectileGenerator, angle, speed, partialDt);
    }
}

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
        fireSpread(this.projectileGenerator, this.numShots, this.spread, this.variance, this.speed, partialDt)
    }

    getDelay(){
        return this.fireTime;
    }

    isContinuing(){
        return false;
    }
}

export class MultiDualWeaponComponent {
    constructor(numRounds, mainDelay, subDelays, projCounts, spreads, variances, speeds, projectileGenerators){
        this.numRounds = numRounds;
        this.mainDelay = mainDelay;
        this.subDelays = subDelays;
        this.projCounts = projCounts;
        this.spreads = spreads;
        this.variances = variances;
        this.speeds = speeds;
        this.projectileGenerators = projectileGenerators;

        this.roundIndex = 0;
    }

    fire(partialDt){
        fireSpread(
            getFromArrayOrSingleValue(this.projectileGenerators, this.roundIndex),
            getFromArrayOrSingleValue(this.projCounts, this.roundIndex),
            getFromArrayOrSingleValue(this.spreads, this.roundIndex),
            getFromArrayOrSingleValue(this.variances, this.roundIndex),
            getFromArrayOrSingleValue(this.speeds, this.roundIndex),
            partialDt
        );
        this.roundIndex = (this.roundIndex+1)%this.numRounds;
    }

    getDelay(){
        if(this.roundIndex == 0){
            return this.mainDelay;
        }else{
            return getFromArrayOrSingleValue(this.subDelays, this.roundIndex-1);
        }
    }

    isContinuing(){
        return this.roundIndex != 0;
    }
}

export class VolleyDualWeaponComponent {
    constructor(numRounds, mainDelay, subDelay, sideProjCount, spread, offsetSpread, speed, projectileGenerator){
        this.numRounds = numRounds;
        this.mainDelay = mainDelay;
        this.subDelay = subDelay;
        this.sideProjCount = sideProjCount;
        this.spread = spread;
        this.offsetSpread = offsetSpread;
        this.speed = speed;
        this.projectileGenerator = projectileGenerator;

        this.subRound = 0;
        this.roundIndex = 0;
    }

    fire(partialDt){
        const dx = controls.mouse.x-playField.player.x;
        const dy = controls.mouse.y-playField.player.y;
        const baseAngle = Math.atan2(dy,dx);
        if(this.subRound == 0){
            fireProjectileWithSurfaceOffset(this.projectileGenerator, baseAngle, this.speed, 0, partialDt);
        }else{
            const angleChange = this.spread * this.subRound/this.sideProjCount;
            const offset = this.offsetSpread * this.subRound/this.sideProjCount;
            fireProjectileWithSurfaceOffset(this.projectileGenerator, baseAngle+angleChange, this.speed, offset, partialDt);
            fireProjectileWithSurfaceOffset(this.projectileGenerator, baseAngle-angleChange, this.speed, -offset, partialDt);
        }

        this.subRound++;
        if(this.subRound >= this.sideProjCount){
            this.subRound = 0;
            this.roundIndex = (this.roundIndex+1)%this.numRounds;
        }
    }

    getDelay(){
        if(this.roundIndex == 0 && this.subRound == 0){
            return this.mainDelay;
        }else{
            return this.subDelay;
        }
    }

    isContinuing(){
        return !(this.roundIndex == 0 && this.subRound == 0);
    }
}

export const stockLightComponents = {
    //
};

export const stockHeavyComponents = {
    //
};