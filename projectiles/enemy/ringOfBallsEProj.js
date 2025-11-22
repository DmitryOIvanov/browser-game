import { CircleArea, RingOfCirclesArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

export default class RingOfBallsEProj {
	constructor(numBalls, ringRadius, ballRadius, x, y, vx, vy, initAngle, rotSpeed, thick, color) {
		this.autonomous = true;

		this.numBalls = numBalls;
		this.ringRadius = ringRadius;
		this.ballRadius = ballRadius;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.angle = initAngle;
		this.rotSpeed = rotSpeed;
		this.thick = thick;
		this.color = color;
		this.area = new RingOfCirclesArea(numBalls, ringRadius, ballRadius, initAngle);
	}

	timeStep(dt) {
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.angle += this.rotSpeed * dt;
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.thick;
		for (let i = 0; i < this.area.numMembers; i++) {
			const angle = this.angle + i * 2 * Math.PI / this.numBalls;
			const x = this.x + this.ringRadius * Math.cos(angle);
			const y = this.y + this.ringRadius * Math.sin(angle);
			ctx.beginPath();
			ctx.arc(x, y, this.ballRadius, 0, 2 * Math.PI);
			ctx.stroke();
		}
	}
}


