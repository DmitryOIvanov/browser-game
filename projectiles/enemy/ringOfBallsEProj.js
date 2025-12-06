import { CircleArea, RingOfCirclesArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

export default class RingOfBallsEProj {
	constructor(numBalls, ringRadius, ballRadius, x, y, vx, vy, initAngle, rotSpeed, growthRate, cullDelay, thick, color) {
		this.autonomous = true;

		this.vx = vx;
		this.vy = vy;
		this.rotSpeed = rotSpeed;
		this.growthRate = growthRate;
		this.thick = thick;
		this.color = color;
		this.area = new RingOfCirclesArea(x, y, numBalls, ringRadius, ballRadius, initAngle);
		this.ballAppearance = new Array(numBalls).fill(false);
		this.cullDelay = cullDelay;
	}

	timeStep(dt) {
		this.area.x += this.vx * dt;
		this.area.y += this.vy * dt;
		this.area.angle += this.rotSpeed * dt;
		this.area.ringRadius += dt * this.growthRate;

		if (this.cullDelay <= 0) {
			this.area.updateExistence();
		} else {
			this.cullDelay -= dt;
		}

		const checkRad = -(this.area.ringRadius + this.area.memberRadius + this.thick);
		if (
			!isInBounds(this.area.x, playField.x, checkRad) ||
			!isInBounds(this.area.y, playField.y, checkRad)
		) {
			this.retired = true;
		}
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.thick;
		for (let i = 0; i < this.area.numMembers; i++) {
			if (this.area.memberExists[i]) {
				const angle = this.area.angle + i * 2 * Math.PI / this.area.numMembers;
				const x = this.area.x + this.area.ringRadius * Math.cos(angle);
				const y = this.area.y + this.area.ringRadius * Math.sin(angle);
				ctx.beginPath();
				ctx.arc(x, y, this.area.memberRadius, 0, 2 * Math.PI);
				ctx.stroke();
			}
		}
	}
}


