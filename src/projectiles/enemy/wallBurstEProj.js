import { CircleArea } from "../../areas.js";
import { canv, ctx } from "../../drawing.js";
import { isInBounds, normalizeAngle } from "../../extraMath.js";
import playField from "../../playField.js";
import BallEProj from "./ballEProj.js";

export default class WallBurstEProj {
    constructor(x, y, angle, speed, mainRadius, numBursts, burstRadius, burstSpeed, lineWidth, color) {
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);
        this.mainRadius = mainRadius;
        this.numBursts = numBursts;
        this.burstRadius = burstRadius;
        this.burstSpeed = burstSpeed;
        this.lineWidth = lineWidth;
        this.color = color;

        this.area = new CircleArea(this.x, this.y, this.mainRadius);
    }

    timestep(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        let overStep = 0;
        overStep = Math.max(overStep, (-this.x) / Math.abs(this.vx));
        overStep = Math.max(overStep, (this.x - playField.x) / Math.abs(this.vx));
        overStep = Math.max(overStep, (-this.y) / Math.abs(this.vy));
        overStep = Math.max(overStep, (this.y - playField.y) / Math.abs(this.vy));
        if (overStep > 0) {
            const hitX = this.x - this.vx * overStep;
            const hitY = this.y - this.vy * overStep;
            for (let i = 0; i < this.numBursts; i++) {
                const subAngle = -this.angle + (2 * i + 1) / this.numBursts * Math.PI;
                const projVX = this.burstSpeed * Math.cos(subAngle);
                const projVY = this.burstSpeed * Math.sin(subAngle);
                const proj = new BallEProj(hitX, hitY, projVX, projVY, this.burstRadius, this.lineWidth, this.color);
                proj.timestep(overStep);
                playField.addEnemyProjectile(proj);
            }
            this.retired = true;
        }

        this.area.update(this.x, this.y, this.mainRadius);
    }

    draw() {
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.mainRadius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
