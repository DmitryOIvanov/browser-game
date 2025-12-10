import { ctx } from "../drawing.js";
import { isInBounds } from "../extraMath.js";
import playField from "../playField.js";

const wallIntersectCache = { x: 0, y: 0 };

export default class DashedLineIndicatorParticle {
	constructor(x, y, angle, dashLength, gapLength, speed, lineWidth, color) {
		this.autonomous = true;
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.dashLength = dashLength;
		this.gapLength = gapLength;
		this.speed = speed;
		this.lineWidth = lineWidth;
		this.color = color;

		this.bothLength = dashLength + gapLength;
		this.period = this.bothLength / speed;
		this.offset = 0;
	}

	timeStep(dt) {
		this.offset = (this.offset + this.speed * dt) % this.bothLength;
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.lineWidth;
		let totalOffset = this.offset - this.bothLength;
		const cos = Math.cos(this.angle);
		const sin = Math.sin(this.angle);
		while (true) {
			if (totalOffset <= -this.dashLength) {
				totalOffset += this.bothLength;
				continue;
			}
			let length = totalOffset >= 0 ? this.dashLength : this.dashLength + totalOffset;
			const x2 = this.x + (totalOffset + this.dashLength) * cos;
			const y2 = this.y + (totalOffset + this.dashLength) * sin;
			const x1 = x2 - length * cos;
			const y1 = y2 - length * sin;
			if (!isInBounds(x1, playField.x, 0) && !isInBounds(x2, playField.x, 0)) return;
			if (!isInBounds(y1, playField.y, 0) && !isInBounds(y2, playField.y, 0)) return;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			totalOffset += this.bothLength;
		}
	}

	getIntersectionWithWall() {
		const dx = this.x2 - this.x1;
		const wallX = dx >= 0 ? playField.x : 0;
		const dy = this.y2 - this.y1;
		const wallY = dy >= 0 ? playField.y : 0;
		if (Math.abs(dy * (this.x1 - wallX)) <= Math.abs(dx * (this.y1 - wallY))) {
			wallIntersectCache.x = wallX;
			wallIntersectCache.y = this.y1 + dy * Math.abs((this.x1 - wallX) / dx);
		} else {
			wallIntersectCache.x = this.x1 + dx * Math.abs((this.y1 - wallY) / dy);
			wallIntersectCache.y = wallY;
		}
		return wallIntersectCache;
	}
}
