import Color from "../color.js";
import { ctx } from "../drawing.js";
import playField from "../playField.js";

class SubRing{
    constructor(x,y,vx,vy,motionDecay,rad,radSpeed,radSpeedDecay,dur,StableDur,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.motionDecay = motionDecay;
        this.rad = rad;
        this.radSpeed = radSpeed;
        this.radSpeedDecay = radSpeedDecay;
        this.dur = dur;
        this.StableDur = StableDur;
        this.color = color;
        
        this.timeElapsed = 0;
        this.retired = false;
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.dur){
            this.retired = true;
            return;
        }
    }

    draw(){
        if(this.retired) return;
        let portion = (this.dur-this.timeElapsed)/(this.dur-this.StableDur);
        if(portion > 1) portion = 1;
        let radGrowthFactor = this.timeElapsed;
        if(this.radSpeedDecay != 0) radGrowthFactor = (1-Math.exp(-this.radSpeedDecay*this.timeElapsed))/this.radSpeedDecay;
        const r = this.rad + this.radSpeed*radGrowthFactor;
        let motionFactor = this.timeElapsed;
        if(this.motionDecay != 0) motionFactor = (1-Math.exp(-this.motionDecay*this.timeElapsed))/this.motionDecay;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = portion*r;
        ctx.beginPath();
        ctx.arc(this.x+motionFactor*this.vx,this.y+motionFactor*this.vy,r*(1-0.5*portion),0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }
}

export default class BigExplosionParticle{
    constructor(x,y,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.color = color;

        this.duration = 60;
        
        this.timeElapsed = 0;
        this.retired = false;

        // Main big bubble
        playField.addParticle(new SubRing(this.x,this.y,0,0,0,65,14,0.14,10,0,Color.WHITE));
        // Medium bubbles
        for(let i=0; i<8; i++){
            const angle = 2*Math.PI*(i+Math.random())/8;
            const vx = 12*Math.cos(angle);
            const vy = 12*Math.sin(angle);
            playField.addParticle(new SubRing(this.x,this.y,vx,vy,0.05,15+10*Math.random(),8+4*Math.random(),0.2,10+4*Math.random(),3+Math.random(),Color.WHITE));
        }
        // Small bubbles
        for(let i=0; i<16; i++){
            const angle = 2*Math.PI*(i+1.5*Math.random())/16;
            const speed = 12+2*Math.random();
            const vx = speed*Math.cos(angle);
            const vy = speed*Math.sin(angle);
            playField.addParticle(new SubRing(this.x,this.y,vx,vy,0.025,5+10*Math.random(),3+2*Math.random(),0.1,10+6*Math.random(),5+Math.random(),Color.WHITE));
        }
        // Shockwave
        playField.addParticle(new SubRing(this.x,this.y,0,0,0,50,50,0,8,-400,Color.WHITE));
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.duration){
            this.retired = true;
        }
    }

    draw(){
        // if(!this.retired){
        //     let t = this.timeElapsed/this.duration;
        //     if(t > 1) t = 1;
        //     let r = t*300 + 0.5*(1-t)*100
        //     ctx.strokeStyle = this.color.getStr();
        //     ctx.lineWidth = (1-t)*100;
        //     ctx.beginPath();
        //     ctx.arc(this.x,this.y,r,0,2*Math.PI);
        //     ctx.closePath();
        //     ctx.stroke();
        // }
    }
}