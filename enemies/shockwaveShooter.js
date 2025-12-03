import { CircleArea, MovableConvexPolygon } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import rangerMovementPattern from "../enemyMovementPatterns/rangerMovementPattern.js";
import { bounceBoundify, getAngleToPlayer, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import ShockwaveBallEProj from "../projectiles/enemy/shockwaveBallEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const LINE_THICK = 6;
const SECONDARY_LINE_THICK = 5;
const MAX_HP = 50;
const HIT_FLASH_TIME = 2;

const BASE_VERTS = [
	{ x: 2, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 },
	{ x: 0, y: -1 },
];
const VERT_SCALE_FACTOR = 27;
BASE_VERTS.forEach(function(vert) {
	vert.x *= VERT_SCALE_FACTOR;
	vert.y *= VERT_SCALE_FACTOR;
});

const SPAWN_RAD = 2 * VERT_SCALE_FACTOR;
const EYE_RAD = 12;
const EYE_OFFSET = 4;

const RANGER_PARAMS = {
	moodTime: 20,
	moodTimeVar: 40,
	turnSpeed: 0.035,
	moveSpeed: 2.1,
	outerOrbit: 400,
	innerOrbit: 200,
	orbitChance: 0.5,
	chaseChance: 0.25,
	bounceRad: 0.8 * VERT_SCALE_FACTOR,
};

const STATE_MOVING = 0;
const STATE_SLOWING = 1;
const STATE_SHOOTING = 2;
const STATE_SPEEDING = 3;

const PROJ_SPEED = 20;
const PROJ_RAD = 10;
const SHOCK_ANGLE = Math.PI / 2;
const SHOCK_SPEED = 5;
const SHOCK_RAD = 6;
const SHOCK_PERIOD = 8;
const PROJ_THICK = 6;

export default class ShockwaveShooter extends AbstractEnemy {
	static RAD = SPAWN_RAD;

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.bodyAngle = getAngleToPlayer(x, y);
		this.defenseProfile = createDefenseProfile(MAX_HP);
		this.area = new MovableConvexPolygon(this.x, this.y, this.bodyAngle, BASE_VERTS);
		this.shootCountdown = 180;

		this.rangerState = rangerMovementPattern.getNewState();
	}

	timeStep(dt) {
		super.timeStep(dt);
		this.hitFlash -= dt;
		if (this.hitFlash < 0) this.hitFlash = 0;

		this.bodyAngle = getAngleToPlayer(this.x, this.y);

		rangerMovementPattern.timeStep(dt, this, this.rangerState, RANGER_PARAMS);

		this.shootCountdown -= dt;
		if (this.shootCountdown <= 0) {
			const proj = new ShockwaveBallEProj(this.x, this.y, this.bodyAngle, PROJ_SPEED, PROJ_RAD, SHOCK_ANGLE, SHOCK_SPEED, SHOCK_RAD, SHOCK_PERIOD, PROJ_THICK, this.dangerColor);
			playField.addEnemyProjectile(proj);
			this.shootCountdown += 180;
		}

		this.area.x = this.x;
		this.area.y = this.y;
		this.area.setAngle(this.bodyAngle);
	}

	draw() {
		ctx.lineWidth = LINE_THICK;
		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.dangerColor.getStr();
		ctx.beginPath();
		ctx.arc(
			this.x + this.area.cos * EYE_OFFSET,
			this.y + this.area.sin * EYE_OFFSET,
			EYE_RAD, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.stroke();

		ctx.lineWidth = SECONDARY_LINE_THICK;
		ctx.beginPath();
		ctx.moveTo(
			this.x + this.area.cos * (EYE_RAD + EYE_OFFSET),
			this.y + this.area.sin * (EYE_RAD + EYE_OFFSET),
		);
		ctx.lineTo(
			this.x + this.area.cos * BASE_VERTS[0].x,
			this.y + this.area.sin * BASE_VERTS[0].x,
		);
		ctx.stroke();

		// ctx.beginPath();
		// ctx.moveTo(
		// 	this.x - this.area.cos * (EYE_RAD - EYE_OFFSET),
		// 	this.y - this.area.sin * (EYE_RAD - EYE_OFFSET),
		// );
		// ctx.lineTo(
		// 	this.x + this.area.cos * BASE_VERTS[2].x,
		// 	this.y + this.area.sin * BASE_VERTS[2].x,
		// );
		// ctx.stroke();

		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.baseColor.getStr();
		ctx.beginPath();
		for (let i = 0; i < BASE_VERTS.length; i++) {
			const x = this.x + this.area.cos * BASE_VERTS[i].x - this.area.sin * BASE_VERTS[i].y;
			const y = this.y + this.area.cos * BASE_VERTS[i].y + this.area.sin * BASE_VERTS[i].x;
			if (i == 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
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
