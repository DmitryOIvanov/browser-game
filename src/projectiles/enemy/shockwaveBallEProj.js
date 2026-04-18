import { CircleArea } from "../../areas.js";
import { canv, ctx } from "../../drawing.js";
import { isInBounds, normalizeAngle } from "../../extraMath.js";
import playField from "../../playField.js";
import BallEProj from "./ballEProj.js";

const PLAYFIELD_CENTER_X = canv.width / 2;
const PLAYFIELD_CENTER_Y = canv.height / 2;
const PLAYFIELD_OUTER_RAD_SQR = PLAYFIELD_CENTER_X * PLAYFIELD_CENTER_X + PLAYFIELD_CENTER_Y * PLAYFIELD_CENTER_Y;
const PLAYFIELD_OUTER_RAD = Math.sqrt(PLAYFIELD_OUTER_RAD_SQR);
const PLAYFIELD_INNER_RAD_SQR = PLAYFIELD_CENTER_Y * PLAYFIELD_CENTER_Y;

export default class ShockwaveBallEProj {
    constructor(x, y, angle, speed, rad, shockAngle, shockSpeed, shockRad, shockPeriod, thick, color) {
        this.autonomous = true;
        this.x = x;
        this.y = y;
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);
        this.angle = angle;
        this.rad = rad;
        this.shockSpeed = shockSpeed;
        this.shockAngle = shockAngle;
        this.shockRad = shockRad;
        this.shockPeriod = shockPeriod;
        this.thick = thick;
        this.color = color;

        this.shockCountdown = shockSpeed;
        this.area = new CircleArea(this.x, this.y, this.rad);
    }

    isImpotent() {
        const dx = PLAYFIELD_CENTER_X - this.x;
        const dy = PLAYFIELD_CENTER_Y - this.y;
        const dSqr = dx * dx + dy * dy;
        if (dSqr <= PLAYFIELD_OUTER_RAD_SQR) return false;
        const angleToCenter = Math.atan2(dy, dx);
        const acceptableDeviation = Math.atan(PLAYFIELD_OUTER_RAD / Math.sqrt(dSqr));
        if (normalizeAngle(angleToCenter - this.angle) < this.shockAngle + acceptableDeviation) return false;
        if (normalizeAngle(this.angle - angleToCenter) < this.shockAngle + acceptableDeviation) return false;
        return true;
    }

    timestep(dt) {
        this.shockCountdown -= dt;
        while (this.shockCountdown <= 0) {
            const shockX = this.x - this.vx * this.shockCountdown;
            const shockY = this.y - this.vy * this.shockCountdown;
            const shockVX1 = this.shockSpeed * Math.cos(this.angle + this.shockAngle);
            const shockVY1 = this.shockSpeed * Math.sin(this.angle + this.shockAngle);
            const shockVX2 = this.shockSpeed * Math.cos(this.angle - this.shockAngle);
            const shockVY2 = this.shockSpeed * Math.sin(this.angle - this.shockAngle);
            const proj1 = new BallEProj(shockX, shockY, shockVX1, shockVY1, this.shockRad, this.thick, this.color);
            proj1.timestep(-this.shockCountdown);
            playField.addEnemyProjectile(proj1);
            const proj2 = new BallEProj(shockX, shockY, shockVX2, shockVY2, this.shockRad, this.thick, this.color);
            proj2.timestep(-this.shockCountdown);
            playField.addEnemyProjectile(proj2);
            this.shockCountdown += this.shockPeriod;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.isImpotent()) this.retired = true;
        this.area.update(this.x, this.y, this.rad);
    }

    draw() {
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = this.thick;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
