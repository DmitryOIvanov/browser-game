import { CircleArea } from "../../areas.js";
import { ctx } from "../../drawing.js";
import { isInBounds } from "../../extraMath.js";
import playField from "../../playField.js";

export default class BallCollectionEProj {
	constructor(area, thick, color) {
		this.autonomous = false;

		this.thick = thick;
		this.color = color;
		this.area = area;
	}

	timeStep(amount) {
		// Nothing
	}

	draw() {
		ctx.strokeStyle = this.color.getStr();
		ctx.lineWidth = this.thick;
		for (let i = 0; i < this.area.numMembers; i++) {
			const member = this.area.members[i];
			if (member.exists) {
				ctx.beginPath();
				ctx.arc(member.x, member.y, this.area.memberRadius, 0, 2 * Math.PI);
				ctx.stroke();
			}
		}
	}
}

