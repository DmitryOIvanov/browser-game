import Color from "../color.js";
import controls from "../controls.js";
import playField from "../playField.js";
import PointPProj from "../projectiles/player/pointPProj.js";

class PointPProjWeapon {
    constructor(fireRate, numShots, spread, variance, speed, pierce, color, attackProfileGenerator){
        this.fireRate = fireRate;
        this.numShots = numShots;
        this.spread = spread;
        this.variance = variance;
        this.speed = speed;
        this.color = color;
        this.pierce = pierce;
        this.attackProfileGenerator = attackProfileGenerator;

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
                    const newBullet = new PointPProj(playField.player.x, playField.player.y, dx2, dy2, this.pierce, this.color, this.attackProfileGenerator);
                    newBullet.timeStep(-this.fireTimer);
                    playField.addPlayerProjectile(newBullet);
                }
                this.fireTimer += this.fireRate;
            }
        }
    }
}

//constructor(fireRate, numShots, spread, variance, speed){

export class MachineGunWeapon extends PointPProjWeapon {
    constructor(){
        super(2.5,1,0,0.02,20,1,new Color(false,'#0ff'), ()=>({damage:200,expired:false}) );
    }
}

export class ShotgunWeapon extends PointPProjWeapon {
    constructor(){
        super(22,9,0.1,0,20,1,new Color(false,'#ff0'));
    }
}

export class PierceWeapon extends PointPProjWeapon {
    constructor(){
        super(7,1,0,0.01,20,10,new Color(false,'#67f'));
    }
}

export class MemeWeapon1 extends PointPProjWeapon {
    constructor(){
        super(1,7,0.2,0.1,20,100,new Color(true,0));
    }
}