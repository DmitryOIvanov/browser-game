import { CircleArea } from "./areas.js";
import Color from "./color.js";
import controls from "./controls.js";
import { ctx } from "./drawing.js";
import { decToZero } from "./extraMath.js";
import ShrinkingCircleParticle from "./particles/shrinkingCircleParticle.js";
import playField from "./playField.js";

const HIT_RAD = 10;
const ROT_SPEED = 0.01;
const OUT_RAD = 20;
const IN_RAD = 12;
const OUT_THICK = 5;
const IN_THICK = 2;

const MOVE_SPEED = 5;

const SLOWMO_SPEED = 0.2;
const SLOWMO_FULL_CHARGE = 450;
const SLOWMO_DRAIN_RATE = 1;
const SLOWMO_CHARGE_RATE = 1;
const SLOWMO_COOLDOWN = 60;

const HIT_SLOW_MAG = 0.1;
const HIT_SLOW_DUR = 50;
const HIT_COOLDOWN_DUR = 120;

export default class Player{
    static SLOWMO_SPEED = SLOWMO_SPEED;

    constructor(x,y){
        this.x = x;
        this.y = y;
        this.rot = 0;
        this.cursor = {
            rot: 0,
            speed: 0.0173
        };
        this.area = new CircleArea(this.x, this.y, HIT_RAD);
        this.hitCooldown = 0;
        this.hitSlowCooldown = 0;
        this.hitSlowFactor = 1;

        this.inSlowMo = false;
        this.slowMeterDir = 0;
        this.slowMoCharge = SLOWMO_FULL_CHARGE;
        this.slowMoCoolDown = 0;

        this.weapon = null;
        this.exp = 0;
    }

    getColor(){return this.weapon==null?Color.WHITE:this.weapon.color;}

    draw(){
        ctx.strokeStyle = this.getColor().getStr();
        ctx.lineWidth = OUT_THICK;
        ctx.beginPath();
        ctx.moveTo(this.x + OUT_RAD*Math.cos(2*Math.PI*this.rot), this.y + OUT_RAD*Math.sin(2*Math.PI*this.rot));
        for(let i=1; i<=4; i++){
            ctx.lineTo(this.x + OUT_RAD*Math.cos(2*Math.PI*(this.rot+0.2*i)), this.y + OUT_RAD*Math.sin(2*Math.PI*(this.rot+0.2*i)));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = IN_THICK;
        ctx.beginPath();
        ctx.moveTo(this.x + IN_RAD*Math.cos(2*Math.PI*this.rot), this.y - IN_RAD*Math.sin(2*Math.PI*this.rot));
        for(let i=1; i<=4; i++){
            ctx.lineTo(this.x + IN_RAD*Math.cos(2*Math.PI*(this.rot+0.2*i)), this.y - IN_RAD*Math.sin(2*Math.PI*(this.rot+0.2*i)));
        }
        ctx.closePath();
        ctx.stroke();
        
        if(this.hitCooldown > 0){
            ctx.lineWidth = 5*this.hitCooldown/HIT_COOLDOWN_DUR;
            ctx.beginPath();
            ctx.arc(this.x,this.y,35,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }

        if(this.slowMoCharge >= SLOWMO_FULL_CHARGE) this.slowMeterDir = 0;
        if(this.slowMoCharge > 0 && this.slowMoCharge < SLOWMO_FULL_CHARGE){
            if(this.slowMeterDir == 0){
                this.slowMeterDir = this.x <= 0.5*playField.x ? 1 : -1;
            }else if(this.slowMeterDir*(this.x/playField.x-0.5) > 0.4){
                this.slowMeterDir = -this.slowMeterDir;
            }
            const vertCorrection = 1.2*(this.y/playField.y-0.5);
            const portion = this.slowMoCharge/SLOWMO_FULL_CHARGE;
            
            //Deciding color
            const margin = 0.2;
            let marginedPortion = (portion-margin)/(1-2*margin);
            if(marginedPortion < 0) marginedPortion = 0;
            if(marginedPortion > 1) marginedPortion = 1;
            const col = Math.floor(marginedPortion*255);
            ctx.strokeStyle = `rgb(255 ${col} ${col})`
            ctx.lineWidth = 7;
            ctx.beginPath();
            const angle1 = -this.slowMeterDir*vertCorrection + Math.PI*(this.slowMeterDir>=0 ? 0.25-0.5*portion : 0.75);
            const angle2 = -this.slowMeterDir*vertCorrection + Math.PI*(this.slowMeterDir>=0 ? 0.25 : 0.75+0.5*portion);
            ctx.arc(this.x,this.y,30,angle1,angle2);
            ctx.stroke();
        }
    }

    drawCursor(){
        if(!controls.mouse.inBounds) return;
        const mouse = controls.mouse;
        ctx.strokeStyle = this.getColor().getStr();
        ctx.lineWidth = 5;
        for(let i=0; i<3; i++){
            let startAngle = 2*Math.PI*(this.cursor.rot + i/3);
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 15, startAngle, startAngle+0.4*Math.PI);
            ctx.stroke();
        }
        ctx.fillStyle = this.getColor().getStr();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, 2*Math.PI);
        ctx.fill();
    }

    updateSlowmoStatus(){
        const keyHeld = (controls.held["ShiftLeft"] || controls.held["ShiftRight"] || controls.held["Space"]);
        this.inSlowMo = keyHeld && (this.slowMoCharge > 0);
    }

    timeStep(amount){
        this.hitCooldown = decToZero(this.hitCooldown, amount);
        this.hitSlowCooldown = decToZero(this.hitSlowCooldown, 1);
        if(this.hitSlowCooldown == 0){
            this.hitSlowFactor = 1;
        }else{
            const t = 1 - this.hitSlowCooldown/HIT_SLOW_DUR;
            this.hitSlowFactor = HIT_SLOW_MAG + (1-HIT_SLOW_MAG)*t*t*t;
        }
        if(this.inSlowMo){
            this.slowMoCharge -= SLOWMO_DRAIN_RATE;
            if(this.slowMoCharge < 0) this.slowMoCharge = 0;
            this.slowMoCoolDown = SLOWMO_COOLDOWN;
        }else{
            if(this.slowMoCoolDown == 0){
                this.slowMoCharge += SLOWMO_CHARGE_RATE;
                if(this.slowMoCharge > SLOWMO_FULL_CHARGE) this.slowMoCharge = SLOWMO_FULL_CHARGE;
            }else{
                this.slowMoCoolDown -= 1;
            }
        }

        this.rot += amount*ROT_SPEED;
        if(this.rot > 1) this.rot -= 1;
        this.cursor.rot += amount*this.cursor.speed;
        if(this.cursor.rot > 1) this.cursor.rot -= 1;

        let rightHeld = controls.held["KeyD"] || controls.held["ArrowRight"];
        let leftHeld = controls.held["KeyA"] || controls.held["ArrowLeft"];
        let downHeld = controls.held["KeyS"] || controls.held["ArrowDown"];
        let upHeld = controls.held["KeyW"] || controls.held["ArrowUp"];
        let vx = (rightHeld?1:0) - (leftHeld?1:0);
        let vy = (downHeld?1:0) - (upHeld?1:0);
        if(vx*vx > 0.01 && vy*vy > 0.01){
            vx /= Math.sqrt(2);
            vy /= Math.sqrt(2);
        }
        this.x += amount*MOVE_SPEED*vx;
        if(this.x < HIT_RAD) this.x = HIT_RAD;
        if(this.x > playField.x - HIT_RAD) this.x = playField.x - HIT_RAD;
        this.y += amount*MOVE_SPEED*vy;
        if(this.y < HIT_RAD) this.y = HIT_RAD;
        if(this.y > playField.y - HIT_RAD) this.y = playField.y - HIT_RAD;

        this.area.x = this.x;
        this.area.y = this.y;

        if(this.weapon != null){
            this.weapon.timeStep(amount);
        }
    }

    getHit(){
        if(this.hitCooldown == 0){
            for(let i=0; i<50; i++){
                const randAngle = 2*Math.PI*Math.random();
                let randSpeed = Math.random();
                randSpeed = randSpeed*randSpeed*30;
                const vx = randSpeed * Math.cos(randAngle);
                const vy = randSpeed * Math.sin(randAngle);
                const r = 5+5*Math.random();
                const dur = 5 + (5+randSpeed)*Math.random();
                playField.addParticle(new ShrinkingCircleParticle(this.x,this.y,vx,vy,r,dur,this.getColor()));
            }
            this.hitCooldown = HIT_COOLDOWN_DUR;
            this.hitSlowCooldown = HIT_SLOW_DUR;
        }
    }
}