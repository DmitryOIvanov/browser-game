import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

/*
    params:

    radius
    duration
    attackProfileGenerator()
    explode(x,y,angle)
*/
export default class ExplodingBallPProj {
    static NUM_COL_SAMPLES = 5;

    constructor(x, y, vx, vy, color, params) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.color = color;
        this.params = params;

        this.remainingTime = params.duration;
        this.boundingRad = 0.5 * Math.sqrt(this.vx * this.vx + this.vy * this.vy) + params.radius;
        this.attackProfile = params.attackProfileGenerator();
        this.numColSamples = ExplodingBallPProj.NUM_COL_SAMPLES;
        this.colSamples = Array(ExplodingBallPProj.NUM_COL_SAMPLES).fill(null).map(() => (new CircleArea(x, y, params.radius)));
        this.boundingCircle = new CircleArea(x, y, this.boundingRad);
        this.excludes = {};
    }

    timestep(dt) {
        if (this.retired) return;
        this.remainingTime -= dt;
        if (this.remainingTime <= 0) {
            this.explode(this.x, this.y);
            return;
        }

        for (let i = 0; i < ExplodingBallPProj.NUM_COL_SAMPLES; i++) {
            this.x += this.vx * dt / ExplodingBallPProj.NUM_COL_SAMPLES;
            this.y += this.vy * dt / ExplodingBallPProj.NUM_COL_SAMPLES;
            if (!isInBounds(this.x, playField.x, this.params.radius) || !isInBounds(this.y, playField.y, this.params.radius)) {
                this.explode(this.x, this.y);
                return;
            }
            this.colSamples[i].update(this.x, this.y, this.params.radius);
        }
        const middleCol = (ExplodingBallPProj.NUM_COL_SAMPLES - 1) / 2;
        this.boundingCircle.update(this.colSamples[middleCol].x, this.colSamples[middleCol].y, this.boundingRad);
    }

    getHit(step) {
        const x = this.colSamples[step].x;
        const y = this.colSamples[step].y;
        this.explode(x, y);
    }

    explode() {
        if (this.retired) return;
        const angle = Math.atan2(this.vy, this.vx);
        this.params.explode(this.x, this.y, angle);
        // const randAngleOffset = 2*Math.PI*Math.random();
        // for(let i=0; i<this.fragsPerRing; i++){
        //     const angle1 = 2*Math.PI*i/this.fragsPerRing + randAngleOffset;
        //     const vx1 = this.fragSpeed1*Math.cos(angle1);
        //     const vy1 = this.fragSpeed1*Math.sin(angle1);
        //     const bullet1 = new PointPProj(x,y,vx1,vy1,this.color,this.secondaryAttackProfileGenerator);
        //     playField.addPlayerProjectile(bullet1);
        //     const angle2 = 2*Math.PI*(i+0.5)/this.fragsPerRing + randAngleOffset;
        //     const vx2 = this.fragSpeed2*Math.cos(angle2);
        //     const vy2 = this.fragSpeed2*Math.sin(angle2);
        //     const bullet2 = new PointPProj(x,y,vx2,vy2,this.color,this.secondaryAttackProfileGenerator);
        //     playField.addPlayerProjectile(bullet2);
        // }
        this.retired = true;
    }

    draw() {
        if (this.retired) return;
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.params.radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
