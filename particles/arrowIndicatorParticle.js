import { ctx } from "../drawing.js";
import { isInBounds } from "../extraMath.js";
import playField from "../playField.js";

export default class ArrowIndicatorParticle {
	constructor(x, y, angle, arrowInterval, arrowAngle, arrowRadius, arrowSpeed, lineThick, color) {
		this.autonomous = true;
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.arrowInterval = arrowInterval;
		this.arrowAngle = arrowAngle;
		this.arrowRadius = arrowRadius;
		this.arrowSpeed = arrowSpeed;
		this.lineThick = lineThick;
		this.color = color;

		this.offset = 0;
	}

	timeStep(dt) {
		this.offset = (this.offset + dt * this.arrowSpeed) % this.arrowInterval;
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.lineThick;
		let totalOffset = this.offset;
		while (true) {
			const pointX = this.x + totalOffset * Math.cos(this.angle);
			const pointY = this.y + totalOffset * Math.sin(this.angle);
			if (!isInBounds(pointX, playField.x, -(this.arrowRadius + this.lineThick))) return;
			if (!isInBounds(pointY, playField.y, -(this.arrowRadius + this.lineThick))) return;
			ctx.beginPath();
			ctx.moveTo(
				pointX - this.arrowRadius * Math.cos(this.angle - this.arrowAngle),
				pointY - this.arrowRadius * Math.sin(this.angle - this.arrowAngle),
			);
			ctx.lineTo(pointX, pointY);
			ctx.lineTo(
				pointX - this.arrowRadius * Math.cos(this.angle + this.arrowAngle),
				pointY - this.arrowRadius * Math.sin(this.angle + this.arrowAngle),
			);
			// ctx.arc(pointX, pointY, this.arrowRadius, 0, 2 * Math.PI);
			ctx.stroke();
			totalOffset += this.arrowInterval;
		}
	}
}
