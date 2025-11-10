import { RegularPolygonArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, normalizedAtan2, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const BODY_RAD = 32;
const EYE_RAD = 18;
const EYE_LINE_WIDTH = 5;
const PUPIL_RAD = 8;
const PUPIL_MAX_OFFSET = 9;
const NUM_SIDES = 5;
const ROT_SPEED = 0.03;

const BULLET_RAD = 6;
const BULLET_LINE_THICK = 6;
const NUM_BULLETS = 10;
const BULLET_SKIP = 3;
const BULLET_CREATE_TIME = 10;
const RING_ROT_SPEED = 0.02;

const STATE_IDLE = 0;
const STATE_BUILD = 1;
const STATE_SHOOT = 2;
const STATE_BASE_TIMES = [60, 60, 30];
const STATE_TIME_VARS = [0, 0, 0];

const LINE_THICK = 6;
const MAX_HP = 20;
const HIT_FLASH_TIME = 2;

const dummyProjectile = new BallEProj(0, 0, 0, 0, BULLET_RAD, BULLET_LINE_THICK);

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
		this.state = STATE_IDLE;
		this.stateProgress = 0;
		this.stateDuration = 0;

		this.bulletProgress = new Array(NUM_BULLETS).fill(-1);
	}

	timeStep(dt) {
		super.timeStep(dt);
		this.hitFlash -= dt;
		if (this.hitFlash < 0) this.hitFlash = 0;

		this.bodyRot += ROT_SPEED * this.rotDir * dt;

		this.stateProgress += dt;
		while (true) {
			if (this.state == STATE_IDLE) {
				if (this.stateProgress >= this.stateDuration) {
					this.stateProgress -= this.stateDuration;
					this.state = STATE_BUILD;
					this.stateDuration = getStateDuration(this.state);
					continue;
				}
			} else if (this.state == STATE_BUILD) {

			} else if (this.state == STATE_SHOOT) {
			}
			break;
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
		const playerAngle = Math.atan2(playField.player.y - this.y, playField.player.x - this.x);
		const pupilX = this.x + PUPIL_MAX_OFFSET * Math.cos(playerAngle);
		const pupilY = this.y + PUPIL_MAX_OFFSET * Math.sin(playerAngle);
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
