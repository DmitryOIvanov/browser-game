import { CircleArea, RegularPolygonArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, normalizedAtan2, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicCircle from "./abstractBasicCircle.js";
import AbstractEnemy from "./abstractEnemy.js";

const BODY_RAD = 32;
const EYE_RAD = 18;
const EYE_LINE_WIDTH = 5;
const PUPIL_RAD = 8;
const PUPIL_MAX_OFFSET = 9;
const NUM_SIDES = 5;
const ROT_SPEED = 0.03;
const LOOK_BASE_TIME = 5;
const LOOK_TIME_VAR = 20;
const LOOK_RANGE = 0.5 * Math.PI;
const DIRECT_LOOK_CHANCE = 0.7;
const LOOK_SWITCH_TIME = 5;

const LINE_THICK = 6;
const MAX_HP = 20;
const HIT_FLASH_TIME = 2;

export default class RingShooter extends AbstractEnemy {
	static RAD = BODY_RAD;

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;

		this.bodyRot = randomAngle();
		this.rotDir = Math.random() > 0.5 ? 1 : -1;
		this.area = new RegularPolygonArea(x, y, BODY_RAD, this.bodyRot, NUM_SIDES);
		this.defenseProfile = createDefenseProfile(MAX_HP);
		this.lookCountdown = 0;
		this.look = {
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0
		};
		this.lookSwitch = 1;
		this.directLook = true;
	}

	timeStep(dt) {
		super.timeStep(dt);
		this.hitFlash -= dt;
		if (this.hitFlash < 0) this.hitFlash = 0;

		this.bodyRot += ROT_SPEED * this.rotDir * dt;
		this.lookSwitch += dt / LOOK_SWITCH_TIME;

		this.lookCountdown -= dt;
		while (this.lookCountdown <= 0) {
			this.look.x1 = this.look.x2;
			this.look.y1 = this.look.y2;
			this.directLook = (Math.random() <= DIRECT_LOOK_CHANCE);

			if (!this.directLook) {
				let angle = Math.atan2(playField.player.y - this.y, playField.player.x - this.x);
				angle += (2 * Math.random() - 1) * LOOK_RANGE;
				this.look.x2 = PUPIL_MAX_OFFSET * Math.cos(angle);
				this.look.y2 = PUPIL_MAX_OFFSET * Math.sin(angle);
			}

			this.lookSwitch = -this.lookCountdown;
			this.lookCountdown += LOOK_BASE_TIME + LOOK_TIME_VAR * Math.random();
		}
		if (this.lookSwitch > 1) this.lookSwitch = 1;
		if (this.directLook) {
			const angle = Math.atan2(playField.player.y - this.y, playField.player.x - this.x);
			this.look.x2 = PUPIL_MAX_OFFSET * Math.cos(angle);
			this.look.y2 = PUPIL_MAX_OFFSET * Math.sin(angle);
		}

		this.area.update(this.x, this.y, BODY_RAD, this.bodyRot, NUM_SIDES);
	}

	draw() {
		ctx.lineWidth = LINE_THICK;
		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.baseColor.getStr();
		ctx.beginPath();
		for (let i = 0; i < NUM_SIDES; i++) {
			const x = this.x + BODY_RAD * Math.cos(this.bodyRot + 2 * Math.PI * i / NUM_SIDES);
			const y = this.y + BODY_RAD * Math.sin(this.bodyRot + 2 * Math.PI * i / NUM_SIDES);
			if (i == 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.closePath();
		ctx.stroke();

		ctx.lineWidth = EYE_LINE_WIDTH;
		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.dangerColor.getStr();
		ctx.beginPath();
		ctx.arc(this.x, this.y, EYE_RAD, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.stroke();

		ctx.fillStyle = ctx.strokeStyle;
		const pupilX = this.x + this.look.x1 + this.lookSwitch * (this.look.x2 - this.look.x1);
		const pupilY = this.y + this.look.y1 + this.lookSwitch * (this.look.y2 - this.look.y1);
		ctx.beginPath();
		ctx.arc(pupilX, pupilY, PUPIL_RAD, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	}

	getHit() {
		if (this.defenseProfile.expired) {
			this.retired = true;
			playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5 * RingShooter.RAD, 2 * RingShooter.RAD, 6, Color.WHITE));
			return;
		}
		this.hitFlash = HIT_FLASH_TIME;
	}
}
