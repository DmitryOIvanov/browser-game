import { ctx } from "../drawing.js";

export default class PulsingIndicatorParticle {
    constructor(x, y, period, duration, maxRad, maxLineWidth, color) {
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.period = period;
        this.duration = duration;
        this.maxRad = maxRad;
        this.maxLineWidth = maxLineWidth;
        this.color = color;

        this.offset = 0;
        this.timeElapsed = 0;
    }

    timestep(dt) {
        this.offset = (this.offset + dt) % this.period;
        this.timeElapsed = Math.min(this.timeElapsed + dt, this.duration);
    }

    draw() {
        ctx.strokeStyle = this.color.getStr();
        for (let t = this.offset; t < this.duration && t <= this.timeElapsed; t += this.period) {
            const rad = this.maxRad * t / this.duration;
            ctx.lineWidth = this.maxLineWidth * (1 - t / this.duration);
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
}
