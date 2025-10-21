import { SnakeArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import controls from "../controls.js";
import { ctx } from "../drawing.js";
import { isInBounds, normalizeAngle, normalizeAnglePMPI } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 18;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 15;
const TURN_TIME_VAR = 10;
const TURN_RAD = 54;
const TURN_SPEED = 0.07;
const SEG_TIME_DIFF = 10;
const EYE_RAD = 7;
const EYE_OFFSET = 8;

const LINE_THICK = 6;
const HIT_FLASH_TIME = 2;

const DIRECTION_TOWARDS_PLAYER = 0;

const movePositionCache = {};
function getPositionInMove(move, time) {
	const arcAngle = move.initArcAngle + TURN_SPEED * move.dir * time;
	movePositionCache.x = move.centerX + TURN_RAD * Math.cos(arcAngle);
	movePositionCache.y = move.centerY + TURN_RAD * Math.sin(arcAngle);
	movePositionCache.tangentAngle = arcAngle + move.dir * 0.5 * Math.PI;
	return movePositionCache;
}

export default class Snake extends AbstractEnemy {
	static RAD = SEG_RAD;
	static DEFAULT_NUM_SEGS = 30;

	constructor(x, y, angle, numSegs) {
		super();

		this.numSegs = numSegs;
		this.segArr = new Array(numSegs).fill(null).map(() => ({
			defenseProfile: createDefenseProfile(SEG_MAX_HP),
			hitFlash: 0,
			tangentAngle: 0
		}));
		this.segArr[0].moves = [
			{
				centerX: x + TURN_RAD * Math.cos(angle + 0.5 * Math.PI),
				centerY: y + TURN_RAD * Math.sin(angle + 0.5 * Math.PI),
				dir: 1,
				initArcAngle: angle - 0.5 * Math.PI,
				time: 0
			}
		];
		this.segArr[0].timeOffset = 0;
		this.area = new SnakeArea(numSegs, SEG_RAD);
		this.numSegsAlive = numSegs;

		console.log(this.getNextMove({
			dir: 1,
			initArcAngle: 0.5 * Math.PI,
			centerX: 100,
			centerY: 70,
			time: 0
		}));
	}

	getNextMoveTemplateForDirection(lastMove, direction) {
		const lastMoveEndArcAngle = lastMove.initArcAngle + lastMove.dir * TURN_SPEED * lastMove.time;
		const correctionCoeff = lastMove.dir == direction ? 0 : 1;
		const move = {
			dir: direction,
			initArcAngle: normalizeAngle(lastMoveEndArcAngle + correctionCoeff * Math.PI),
			centerX: lastMove.centerX + correctionCoeff * 2 * TURN_RAD * Math.cos(lastMoveEndArcAngle),
			centerY: lastMove.centerY + correctionCoeff * 2 * TURN_RAD * Math.sin(lastMoveEndArcAngle),
			time: 0
		}
		return move;
	}

	getNextMove(lastMove) {
		const lastMoveEndArcAngle = lastMove.initArcAngle + lastMove.dir * TURN_SPEED * lastMove.time;
		const lastX = lastMove.centerX + TURN_RAD * Math.cos(lastMoveEndArcAngle);
		const lastY = lastMove.centerY + TURN_RAD * Math.sin(lastMoveEndArcAngle);
		const lastAngle = lastMoveEndArcAngle + lastMove.dir * 0.5 * Math.PI;

		const dx = playField.player.x - lastX;
		const dy = playField.player.y - lastY;
		const newDir = normalizeAnglePMPI(Math.atan2(dy, dx) - lastAngle) >= 0 ? 1 : -1;

		let move = this.getNextMoveTemplateForDirection(lastMove, newDir);
		move.time = TURN_BASE_TIME + TURN_TIME_VAR * Math.random();
		console.log("analyzing:");
		console.log(move);
		for (let i = 0; i < 4; i++) {
			let wallDistance = 0;
			switch (i) {
				case 0: wallDistance = playField.x - move.centerX - SEG_RAD; break;
				case 1: wallDistance = playField.y - move.centerY - SEG_RAD; break;
				case 2: wallDistance = move.centerX - SEG_RAD; break;
				case 3: wallDistance = move.centerY - SEG_RAD; break;
			}
			if (wallDistance >= TURN_RAD) continue;
			console.log(`danger distance ${wallDistance} to ${i}`);
			let curAngle = normalizeAngle(move.initArcAngle - i * 0.5 * Math.PI);
			if (lastMove.dir == 1) curAngle = 2 * Math.PI - curAngle;
			console.log(`curAngle ${curAngle}`);
			let okayRange = curAngle - 0.5 * Math.PI - Math.asin(0.5 * (1 - wallDistance / TURN_RAD));
			console.log(`okay angular ${okayRange}`);
			okayRange /= TURN_SPEED;
			console.log(`okay time ${okayRange}`);
			if (move.time > okayRange) {
				move.time = okayRange;
				//console.log(`Danger ${i}`);
			}
		}
		if (move.time < 0.01) {
			console.log("move discarded");
			move = this.getNextMoveTemplateForDirection(lastMove, -newDir);
			move.time = TURN_BASE_TIME + TURN_TIME_VAR * Math.random();
		}
		console.log('result:');
		console.log(move);
		return move;
		//const dx = playField.player.x - lastX;
		//const dy = playField.player.y - lastY;
		//const newDir = normalizeAnglePMPI(Math.atan2(dy, dx) - lastAngle) >= 0 ? 1 : -1;
		// const initArcAngle = normalizeAngle(lastAngle - newDir * Math.PI * 0.5);
		// const move = {
		// 	dir: newDir,
		// 	initArcAngle: initArcAngle,
		// 	centerX: lastX - TURN_RAD * Math.cos(initArcAngle),
		// 	centerY: lastY - TURN_RAD * Math.sin(initArcAngle),
		// 	time: moveTime
		// }
		// return move;
	}

	timeStep(dt) {
		super.timeStep(dt);

		let head = null;
		let timeOffset = 0;
		let moveIndex = 0;
		for (let segIndex = 0; segIndex < this.numSegs; segIndex++) {
			const entry = this.segArr[segIndex];
			if (entry.defenseProfile.hp > SEG_MAX_HP) console.log(`HEALING -> ${entry.defenseProfile.hp}`);

			if (entry.defenseProfile.expired) {
				if (head) {
					for (let i = 0; i < moveIndex; i++) head.moves.shift();
				}
				head = null;
				continue;
			}
			if (!head) {
				head = entry;
				head.timeOffset += dt;
				while (head.timeOffset >= head.moves.at(-1).time) {
					head.timeOffset -= head.moves.at(-1).time;
					head.moves.push(this.getNextMove(head.moves.at(-1)));
				}
				timeOffset = head.timeOffset;
				moveIndex = head.moves.length - 1;
			} else {
				timeOffset -= SEG_TIME_DIFF;
			}
			while (timeOffset < 0) {
				moveIndex--;
				if (moveIndex < 0) return;
				timeOffset += head.moves[moveIndex].time;
			}
			this.area.arr[segIndex].exists = true;
			const pos = getPositionInMove(head.moves[moveIndex], timeOffset);
			this.area.arr[segIndex].x = pos.x;
			this.area.arr[segIndex].y = pos.y;
			entry.tangentAngle = pos.tangentAngle;

			entry.hitFlash -= dt;
			if (entry.hitFlash < 0) entry.hitFlash = 0;
		}
		if (head) {
			for (let i = 0; i < moveIndex; i++) head.moves.shift();
		}
	}

	draw() {
		ctx.lineWidth = LINE_THICK;
		let prevExists = false;
		for (let i = 0; i < this.numSegs; i++) {
			const exists = this.area.arr[i].exists;
			if (exists) {
				const x = this.area.arr[i].x;
				const y = this.area.arr[i].y;
				ctx.strokeStyle = (this.segArr[i].hitFlash > 0) ? '#fff' : this.baseColor.getStr();
				ctx.beginPath();
				ctx.arc(x, y, SEG_RAD, 0, 2 * Math.PI);
				ctx.closePath();
				ctx.stroke();

				if (!prevExists && exists) {
					const tangentAngle = this.segArr[i].tangentAngle;
					ctx.fillStyle = (this.segArr[i].hitFlash > 0) ? '#fff' : this.baseColor.getStr();
					ctx.beginPath();
					ctx.arc(x + EYE_OFFSET * Math.cos(tangentAngle), y + EYE_OFFSET * Math.sin(tangentAngle), EYE_RAD, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.fill();
				}
			}
			prevExists = exists;
		}
	}

	getDefenseProfile(segID) {
		return this.segArr[segID].defenseProfile;
	}

	getHit(segID) {
		if (this.retired) return;
		this.segArr[segID].hitFlash = HIT_FLASH_TIME;
		if (this.segArr[segID].defenseProfile.expired) {
			playField.addParticle(new ExplodingRingParticle(this.area.arr[segID].x, this.area.arr[segID].y, 24, 36, 6, Color.WHITE));
			this.numSegsAlive--;
			if (this.numSegsAlive <= 0) {
				this.retired = true;
				return;
			}
			this.area.arr[segID].exists = false;

			if (segID + 1 < this.numSegs && !this.segArr[segID + 1].defenseProfile.expired) {
				const entry = this.segArr[segID + 1];
				let headIndex = segID;
				while (headIndex - 1 >= 0 && !this.segArr[headIndex - 1].defenseProfile.expired) headIndex--;
				const head = this.segArr[headIndex];
				let lastMoveIndex = head.moves.length - 1;
				let timeOffset = head.timeOffset - (segID + 1 - headIndex) * SEG_TIME_DIFF;
				while (timeOffset < 0 && lastMoveIndex > 0) {
					lastMoveIndex--;
					timeOffset += head.moves[lastMoveIndex].time;
				}
				entry.moves = head.moves.slice(0, lastMoveIndex + 1);
				entry.moves[entry.moves.length - 1] = structuredClone(entry.moves.at(-1));
				entry.moves[entry.moves.length - 1].time = timeOffset;
				entry.timeOffset = timeOffset;
			}
		}
	}
}
