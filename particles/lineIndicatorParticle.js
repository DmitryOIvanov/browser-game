import { ctx } from "../drawing.js";
import playField from "../playField.js";

const wallIntersectCache = { x: 0, y: 0 };

export default class LineIndicatorParticle {
	constructor(x1, y1, x2, y2, thick, color) {
		this.autonomous = false;
		this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
		if (x1 == x2 && y1 == y2) {
			this.x2 = x1 + 1;
		}
		this.thick = thick;
		this.color = color;
		this.retired = false;
	}

	static createRayWithTarget(x1, y1, x2, y2, thick, color) {
		const result = new LineIndicatorParticle(x1, y1, x2, y2, thick, color);
		result.updateRayWithTarget(x1, y1, x2, y2, thick, color);
		return result;
	}
	updateRayWithTarget(x1, y1, x2, y2, thick, color) {
		this.updateRayPosWithTarget(x1, y1, x2, y2);
		this.thick = thick;
		this.color = color;
	}
	updateRayPosWithTarget(x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		if (dx == 0 && dy == 0) dx = 1;
		const coeff = playField.maxDim / Math.max(Math.abs(dx), Math.abs(dy));

		this.x1 = x1; this.y1 = y1;
		this.x2 = x1 + dx * coeff;
		this.y2 = y1 + dy * coeff;
	}

	static createRayWithAngle(x1, y1, angle, thick, color) {
		const result = new LineIndicatorParticle(x1, y1, 0, 0, thick, color);
		result.updateRayWithAngle(x1, y1, angle, thick, color);
		return result;
	}
	updateRayWithAngle(x1, y1, angle, thick, color) {
		this.updateRayPosWithAngle(x1, y1, angle);
		this.thick = thick;
		this.color = color;
	}
	updateRayPosWithAngle(x1, y1, angle) {
		this.x1 = x1; this.y1 = y1;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const coeff = playField.maxDim / Math.max(Math.abs(cos), Math.abs(sin));
		this.x2 = x1 + cos * coeff;
		this.y2 = y1 + sin * coeff;
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.thick;
		ctx.beginPath();
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.closePath();
		ctx.stroke();
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
