import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";
import BallEProj from "./ballEProj.js";

export default class ShockwaveBallEProj {
	constructor(x, y, angle, speed, rad, shockAngle, shockSpeed, shockRad, shockPeriod, thick, color) {
		this.autonomous = true;
		this.x = x;
		this.y = y;
		this.vx = speed * Math.cos(angle);
		this.vy = speed * Math.sin(angle);
		this.angle = angle;
		this.rad = rad;
		this.shockVX1 = shockSpeed * Math.cos(angle + shockAngle);
		this.shockVY1 = shockSpeed * Math.sin(angle + shockAngle);
		this.shockVX2 = shockSpeed * Math.cos(angle - shockAngle);
		this.shockVY2 = shockSpeed * Math.sin(angle - shockAngle);
		this.shockRad = shockRad;
		this.shockPeriod = shockPeriod;
		this.thick = thick;
		this.color = color;

		this.shockCountdown = shockSpeed;
		this.area = new CircleArea(this.x, this.y, this.rad);
	}

	timeStep(dt) {
		this.shockCountdown -= dt;
		while (this.shockCountdown <= 0) {
			const shockX = this.x - this.vx * this.shockCountdown;
			const shockY = this.y - this.vy * this.shockCountdown;
			const proj1 = new BallEProj(shockX, shockY, this.shockVX1, this.shockVY1, this.shockRad, this.thick, this.color);
			proj1.timeStep(-this.shockCountdown);
			playField.addEnemyProjectile(proj1);
			const proj2 = new BallEProj(shockX, shockY, this.shockVX2, this.shockVY2, this.shockRad, this.thick, this.color);
			proj2.timeStep(-this.shockCountdown);
			playField.addEnemyProjectile(proj2);
			this.shockCountdown += this.shockPeriod;
		}

		this.x += this.vx * dt;
		this.y += this.vy * dt;
		if (
			!isInBounds(this.x, playField.x, -this.rad) ||
			!isInBounds(this.y, playField.y, -this.rad)
		) {
			this.retired = true;
		}
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
