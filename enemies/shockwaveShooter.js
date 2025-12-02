import { CircleArea, MovableConvexPolygon } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import rangerMovementPattern from "../enemyMovementPatterns/rangerMovementPattern.js";
import { bounceBoundify, getAngleToPlayer, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const LINE_THICK = 6;
const MAX_HP = 50;
const HIT_FLASH_TIME = 2;

const BASE_VERTS = [
	{ x: 2, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 },
	{ x: 0, y: -1 },
];
const VERT_SCALE_FACTOR = 25;
BASE_VERTS.forEach(function(vert) {
	vert.x *= VERT_SCALE_FACTOR;
	vert.y *= VERT_SCALE_FACTOR;
});

const SPAWN_RAD = 2 * VERT_SCALE_FACTOR;

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

export default class ShockwaveShooter extends AbstractEnemy {
	static RAD = SPAWN_RAD;

	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.bodyAngle = getAngleToPlayer(x, y);
		this.defenseProfile = createDefenseProfile(MAX_HP);
		this.area = new MovableConvexPolygon(this.x, this.y, this.bodyAngle, BASE_VERTS);

		this.rangerState = rangerMovementPattern.getNewState();
	}

	timeStep(dt) {
		super.timeStep(dt);
		this.hitFlash -= dt;
		if (this.hitFlash < 0) this.hitFlash = 0;

		this.bodyAngle = getAngleToPlayer(this.x, this.y);

		rangerMovementPattern.timeStep(dt, this, this.rangerState, RANGER_PARAMS);

		this.area.x = this.x;
		this.area.y = this.y;
		this.area.setAngle(this.bodyAngle);
	}

	draw() {
		ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.baseColor.getStr();
		ctx.lineWidth = LINE_THICK;
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
