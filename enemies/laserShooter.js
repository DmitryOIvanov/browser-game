import { RegularPolygonArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, decToZero, isInBounds, normalizeAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import LineIndicatorParticle from "../particles/lineIndicatorParticle.js";
import ShrinkingRingParticle from "../particles/shrinkingRingParticle.js";
import playField from "../playField.js";
import LaserEProj from "../projectiles/enemy/laserEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const RAD = 25;
const LINE_THICK = 6;
const MAX_HP = 10;

const SPEED = 4;
const TURN_SPEED = 0.1;
const ROT_SPEED = 0.03;
const VERTS = 6;

const STATE_MOVING = 0;
const STATE_SLOWING = 1;
const STATE_SHOOTING = 2;
const STATE_SPEEDING = 3;
const ACC_TIME = 15;
const SHOOT_WINDUP = 45;
const SHOOT_WINDDOWN = 20;
const ROT_INTENSITY_COEFF = 2.2;
const HIT_FLASH_TIME = 2;

export default class LaserShooter extends AbstractEnemy{
    static RAD = RAD;

    constructor(x,y){
        super();
        this.x=x; this.y=y;
        this.hitFlash = 0;
        this.rot = 2*Math.PI*Math.random();
        this.area = new RegularPolygonArea(this.x,this.y,RAD,this.rot,VERTS);
        this.moveAngle = 2*Math.PI*Math.random();
        this.rotAmount = ROT_SPEED*(Math.random()>=0.5 ? 1:-1);
        this.turnAmount = TURN_SPEED*(Math.random()>=0.5 ? 1:-1);
        this.turnChangeCooldown = 0;
        this.stateCooldown = 0;
        this.state = STATE_SPEEDING;
        this.shrinkingRing = null;
        this.lineIndicator = null;
        this.laserDX = 0; this.laserDY = 0;
        this.shotLaser = false;
        this.laserProj = null;
        this.defenseProfile = createDefenseProfile(MAX_HP);
    }

    retireSelf(){
        if(this.shrinkingRing != null) this.shrinkingRing.retired = true;
        if(this.lineIndicator != null) this.lineIndicator.retired = true;
        if(this.laserProj != null) this.laserProj.retired = true;
        this.retired = true;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash = decToZero(this.hitFlash, amount);

        this.stateCooldown -= amount;
        if(this.stateCooldown <= 0){
            switch(this.state){
                case STATE_MOVING:
                    this.state = STATE_SLOWING;
                    this.stateCooldown = ACC_TIME;
                    break;
                case STATE_SLOWING:
                    this.state = STATE_SHOOTING;
                    this.stateCooldown = SHOOT_WINDUP + SHOOT_WINDDOWN;
                    this.shrinkingRing = new ShrinkingRingParticle(this.x,this.y,22,3,5,SHOOT_WINDUP,this.dangerColor);
                    this.lineIndicator = LineIndicatorParticle.createRayWithTarget(this.x,this.y,playField.player.x,playField.player.y,0.5,this.dangerColor);
                    playField.particles.push(this.shrinkingRing);
                    playField.particles.push(this.lineIndicator);
                    this.laserDX = playField.player.x-this.x;
                    this.laserDY = playField.player.y-this.y;
                    this.shotLaser = false;
                    break;
                case STATE_SHOOTING:
                    this.state = STATE_SPEEDING;
                    this.stateCooldown = ACC_TIME;
                    break;
                case STATE_SPEEDING:
                    this.state = STATE_MOVING;
                    this.stateCooldown = 60+30*Math.random();
                    break;
            }
        }
        if(this.state == STATE_SHOOTING && this.stateCooldown<SHOOT_WINDDOWN && !this.shotLaser){
            this.shotLaser = true;
            if(this.lineIndicator != null) this.lineIndicator.retired = true;
            this.laserProj = new LaserEProj(this.x,this.y,this.laserDX,this.laserDY,15,this.dangerColor);
            this.laserProj.startAutoDecay(15,15);
            playField.addEnemyProjectile(this.laserProj);
        }
        if(this.state != STATE_SHOOTING){
            let speedCoeff = 1;
            if(this.state == STATE_SLOWING) speedCoeff = this.stateCooldown/ACC_TIME;
            if(this.state == STATE_SPEEDING) speedCoeff = 1-this.stateCooldown/ACC_TIME;

            this.moveAngle = normalizeAngle(this.moveAngle + this.turnAmount*amount*speedCoeff);
            this.x += amount*SPEED*speedCoeff*Math.cos(this.moveAngle);
            this.y += amount*SPEED*speedCoeff*Math.sin(this.moveAngle);
            if(!isInBounds(this.x, playField.x, RAD)){
                this.x = bounceBoundify(this.x, playField.x, RAD);
                this.moveAngle = normalizeAngle(Math.PI-this.moveAngle);
            }
            if(!isInBounds(this.y, playField.y, RAD)){
                this.y = bounceBoundify(this.y, playField.y, RAD);
                this.moveAngle = 2*Math.PI-this.moveAngle;
            }
        }
        let rotIntensity = 1;
        if(this.state == STATE_SHOOTING){
            if(this.stateCooldown >= SHOOT_WINDDOWN){
                rotIntensity = Math.exp(ROT_INTENSITY_COEFF*(1-(this.stateCooldown-SHOOT_WINDDOWN)/SHOOT_WINDUP));
            }else{
                rotIntensity = Math.exp(ROT_INTENSITY_COEFF*this.stateCooldown/SHOOT_WINDDOWN);
            }
        }
        this.rot = normalizeAngle(this.rot+amount*this.rotAmount*rotIntensity);
        this.turnChangeCooldown -= amount;
        if(this.turnChangeCooldown <= 0){
            this.turnAmount *= -1;
            this.turnChangeCooldown = 20 + 60*Math.random();
        }

        this.area.update(this.x,this.y,RAD,this.rot,VERTS);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        for(let i=0; i<VERTS; i++){
            const angle = 2*Math.PI*i/VERTS + this.rot;
            ctx.lineTo(this.x+RAD*Math.cos(angle), this.y+RAD*Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.beginPath();
        ctx.arc(this.x,this.y,3,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }

    getHit(){
        if(this.defenseProfile.expired){
            this.retireSelf();
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*RAD, 2*RAD, 6, Color.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}