import { CircleArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const LINE_THICK = 6;
const MAX_HP = 10;
const HIT_FLASH_TIME = 2;

export default class ShockwaveShooter extends AbstractEnemy {
	static RAD = 20;

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.defenseProfile = createDefenseProfile(MAX_HP);
		this.area = new CircleArea(this.x, this.y, ShockwaveShooter.RAD);
	}

	timeStep(dt) {
		super.timeStep(dt);
		this.hitFlash -= dt;
		if (this.hitFlash < 0) this.hitFlash = 0;

		this.area.update(this.x, this.y, ShockwaveShooter.RAD);
	}

	draw() {
		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.baseColor.getStr();
		ctx.lineWidth = LINE_THICK;
		ctx.beginPath();
		ctx.arc(this.x, this.y, ShockwaveShooter.RAD, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.stroke();
	}

	getHit() {
		if (this.defenseProfile.expired) {
			this.retired = true;
			playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5 * ShockwaveShooter.RAD, 2 * ShockwaveShooter.RAD, 6, Color.WHITE));
			return;
		}
		this.hitFlash = HIT_FLASH_TIME;
	}
}
