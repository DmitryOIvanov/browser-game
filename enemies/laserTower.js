import { ctx } from "../drawing.js";
import { convergeToAngle, normalizeAngle, normalizedAtan2, randomAngle } from "../extraMath.js";
import LineIndicatorParticle from "../particles/lineIndicatorParticle.js";
import ShrinkingRingParticle from "../particles/shrinkingRingParticle.js";
import playField from "../playField.js";
import LaserEProj from "../projectiles/enemy/laserEProj.js";
import TowerBase from "./towerBase.js";

const MAX_HP = 75;

const EYE_RAD = 40;
const SPIKE_RAD = 10;
const SPIKE_CONNECT_OFFSET = Math.sqrt(EYE_RAD*EYE_RAD - SPIKE_RAD*SPIKE_RAD);
const SPIKE_HEIGHT = 18;
const NUM_SPIKES = 3;
const SPIKE_BASE_POINTS = [
    {x:SPIKE_CONNECT_OFFSET, y:SPIKE_RAD},
    {x:EYE_RAD-SPIKE_HEIGHT, y:0},
    {x:SPIKE_CONNECT_OFFSET, y:-SPIKE_RAD}
];
const SPIKE_ROT_SPEED = 0.02;
const ROT_INTENSITY_COEFF = 2.4;

const PROJ_RAD = 30;
const PROJ_DECAY_TIME = 20;

const STATE_IDLE = 0;
const STATE_CHARGING = 1;
const STATE_SHOOTING = 2;
const STATE_WINDDOWN = 3;
const TIME_BASES = [60,120,120,60];
const TIME_VARS = [60,0,0,0];

export default class LaserTower extends TowerBase{
    constructor(x,y){
        super(x,y,MAX_HP);
        this.stateTimer = 0;
        this.curStateDuration = 0;
        this.state = STATE_WINDDOWN;
        // this.proj = null;
        this.rot = randomAngle();
        this.rotIncrement = SPIKE_ROT_SPEED*(Math.random()<0.5 ? 1:-1);
        this.firingAngle = 0;
        this.lineIndicator = null;
        this.shrinkingRing = null;
        this.proj = null;
    }

    getIdealFiringAngle(){
        return normalizedAtan2(playField.player.y - this.y, playField.player.x-this.x);
    }

    retireSelf(){
        if(this.lineIndicator != null) this.lineIndicator.retired = true;
        if(this.shrinkingRing != null) this.shrinkingRing.retired = true;
        if(this.proj != null) this.proj.retired = true;
    }

    timeStep(amount){
        super.timeStep(amount);

        this.stateTimer += amount;
        if(this.stateTimer >= this.curStateDuration){
            this.state = (this.state+1)%4;
            this.stateTimer -= this.curStateDuration;
            this.curStateDuration = TIME_BASES[this.state] + Math.random()*TIME_VARS[this.state];
            
            // Code run once at the start of a state
            if(this.state == STATE_CHARGING){
                this.firingAngle = this.getIdealFiringAngle();
                this.lineIndicator = LineIndicatorParticle.createRayWithAngle(
                    this.x,this.y,this.firingAngle,0.5,this.dangerColor);
                this.shrinkingRing = new ShrinkingRingParticle(this.x,this.y,EYE_RAD,3,5,this.curStateDuration,this.dangerColor);
                playField.addParticle(this.lineIndicator);
                playField.addParticle(this.shrinkingRing);
            }else if(this.state == STATE_SHOOTING){
                this.lineIndicator.retired = true;
                this.proj = LaserEProj.createWithAngle(this.x,this.y,this.firingAngle,PROJ_RAD,this.dangerColor);
                playField.addEnemyProjectile(this.proj);
            }else if(this.state == STATE_WINDDOWN){
                this.proj.startAutoDecay(PROJ_RAD,PROJ_DECAY_TIME);
            }
        }

        // Code run every frame
        if(this.state != STATE_IDLE){
            const dx = playField.player.x - this.x;
            const dy = playField.player.y - this.y;
            const turnAmount = amount*(0.003+0.3/Math.sqrt(dx*dx + dy*dy + 400));
            this.firingAngle = convergeToAngle(this.firingAngle, this.getIdealFiringAngle(), turnAmount);
            this.lineIndicator.updateRayWithAngle(this.x,this.y,this.firingAngle,1.5,this.dangerColor);
        }
        if(this.state == STATE_SHOOTING || this.state == STATE_WINDDOWN){
            this.proj.updatePosWithAngle(this.x,this.y,this.firingAngle);
        }

        let rotIntensity = 1;
        if(this.state == STATE_SHOOTING){
            rotIntensity = Math.exp(ROT_INTENSITY_COEFF);
        }else if(this.state == STATE_CHARGING){
            const t = this.stateTimer/this.curStateDuration;
            rotIntensity = Math.exp(ROT_INTENSITY_COEFF*t);
        }else if(this.state == STATE_WINDDOWN){
            const t = this.stateTimer/this.curStateDuration;
            rotIntensity = Math.exp(ROT_INTENSITY_COEFF*(1-t));
        }
        this.rot = normalizeAngle(this.rot + this.rotIncrement*rotIntensity*amount);
    }

    draw(){
        super.draw();
        ctx.beginPath();
        ctx.arc(this.x,this.y,EYE_RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 5;
        for(let i=0; i<NUM_SPIKES; i++){
            const angle = this.rot + 2*Math.PI*i/NUM_SPIKES;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            ctx.beginPath();
            for(let j=0; j<3; j++){
                const baseX = SPIKE_BASE_POINTS[j].x;
                const baseY = SPIKE_BASE_POINTS[j].y;
                const x = this.x + baseX*cos - baseY*sin;
                const y = this.y + baseX*sin + baseY*cos;
                if(j==0){
                    ctx.moveTo(x,y);
                }else{
                    ctx.lineTo(x,y)
                }
            }
            ctx.stroke();
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.beginPath();
        ctx.arc(this.x,this.y,12,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.beginPath();
        ctx.arc(this.x,this.y,5,0,2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    getHit(proj){
        super.getHit(proj);
        if(this.retired) this.retireSelf();
    }
}