import Color from "../color.js";
import { ctx } from "../drawing.js";
import playField from "../playField.js";

class SubRing{
    constructor(x,y,vx,vy,rad,radSpeed,radSpeedDecay,dur,StableDur,color){
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
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
        const r = this.rad + this.radSpeed*(1-Math.exp(-this.radSpeedDecay*this.timeElapsed))/this.radSpeedDecay;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = portion*r;
        ctx.beginPath();
        ctx.arc(this.x+this.timeElapsed*this.vx,this.y+this.timeElapsed*this.vy,r*0.5,0,2*Math.PI);
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

        playField.addParticle(new SubRing(300,300,2,3,100,10,1,60,20,Color.WHITE));
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