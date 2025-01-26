import { ctx } from "../drawing.js";
import playField from "../playField.js";
import BoilingBallEProj from "../projectiles/enemy/boilingBallEProj.js";
import TowerBase from "./towerBase.js";

const MAX_HP = 75;
const HOLE_RAD = 48;
const PROJ_RAD = 50;
const PROJ_SPEED = 5;

const STATE_IDLE = 0;
const STATE_OPENING = 1;
const STATE_CHARGING = 2;
const STATE_SHOOTING = 3;
const STATE_CLOSING = 4;
const TIME_BASES = [40,20,60,10,20];
const TIME_VARS = [20,0,0,0,0];

const COS_PI8 = 0.5*Math.sqrt(2+Math.sqrt(2));
const SIN_PI8 = 0.5*Math.sqrt(2-Math.sqrt(2));

export default class HeavyTower extends TowerBase{
    constructor(x,y){
        super(x,y,MAX_HP);
        this.stateTimer = 0;
        this.curStateDuration = 0;
        this.state = STATE_CLOSING;
        this.proj = null;
        this.apertureDir = Math.random()<0.5 ? 1:-1;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.stateTimer += amount;
        if(this.stateTimer >= this.curStateDuration){
            this.state = (this.state+1)%5;
            this.stateTimer -= this.curStateDuration;
            this.curStateDuration = TIME_BASES[this.state] + Math.random()*TIME_VARS[this.state];
        
            if(this.state == STATE_CHARGING){
                this.proj = new BoilingBallEProj(this.x,this.y,0,0,0,6,this.dangerColor,2,3,40);
                playField.addEnemyProjectile(this.proj);
            }else if(this.state == STATE_SHOOTING){
                let dx = playField.player.x - this.x;
                const dy = playField.player.y - this.y;
                if(dx==0 && dy==0) dx=1;
                const dist = Math.sqrt(dx*dx + dy*dy);
                this.proj.vx = PROJ_SPEED*dx/dist;
                this.proj.vy = PROJ_SPEED*dy/dist;
                this.proj.timeStep(this.stateTimer);
                this.proj = null;
            }
        }

        if(this.state == STATE_CHARGING){
            this.proj.radius = PROJ_RAD*this.stateTimer/this.curStateDuration;
        }
    }

    draw(){
        super.draw();
        ctx.lineWidth = 6;
        ctx.beginPath();
        for(let i=0; i<8; i++){
            const angle = 2*Math.PI*i/8 + Math.PI/8;
            ctx.lineTo(this.x+HOLE_RAD*Math.cos(angle), this.y+HOLE_RAD*Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();

        // Draw aperture (state-dependent)
        ctx.lineWidth = 4;
        if(this.state == STATE_IDLE){
            this.drawClosedAperture();
        }else if(this.state == STATE_OPENING){
            const t = 1-this.stateTimer/this.curStateDuration
            this.drawOpenAperture(t);
        }else if(this.state == STATE_CLOSING){
            const t = this.stateTimer/this.curStateDuration;
            this.drawOpenAperture(t);
        }
    }

    drawClosedAperture(){
        for(let i=0; i<4; i++){
            const angle = 2*Math.PI*i/8 + Math.PI/8;
            ctx.beginPath();
            ctx.moveTo(this.x+HOLE_RAD*Math.cos(angle), this.y+HOLE_RAD*Math.sin(angle));
            ctx.lineTo(this.x-HOLE_RAD*Math.cos(angle), this.y-HOLE_RAD*Math.sin(angle));
            ctx.stroke();
        }
    }

    drawOpenAperture(t){
        const baseX1 = HOLE_RAD*COS_PI8;
        const baseY1 = -HOLE_RAD*SIN_PI8;
        const bladeAngle = 0.375*Math.PI*t;
        const sinBA = Math.sin(bladeAngle);
        const cosBA = Math.cos(bladeAngle);
        const baseX2 = baseX1+2*baseY1*(sinBA+cosBA)*sinBA;
        const baseY2 = -2*baseY1*((sinBA+cosBA)*cosBA - 0.5);
        for(let i=0; i<8; i++){
            const angle = 0.25*Math.PI*i;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x1 = cos*baseX1 - this.apertureDir*sin*baseY1;
            const y1 = sin*baseX1 + this.apertureDir*cos*baseY1;
            const x2 = cos*baseX2 - this.apertureDir*sin*baseY2;
            const y2 = sin*baseX2 + this.apertureDir*cos*baseY2;
            ctx.beginPath();
            ctx.moveTo(this.x+x1, this.y+y1);
            ctx.lineTo(this.x+x2, this.y+y2);
            ctx.stroke();
        }
    }

    getHit(proj){
        super.getHit(proj);
        if(this.retired && this.proj != null){
            this.proj.retired = true;
        }
    }
}