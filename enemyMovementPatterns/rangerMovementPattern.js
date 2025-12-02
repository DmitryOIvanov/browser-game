import { bounceBoundify, convergeToAngle, getAngleToPlayer, normalizeAnglePMPI, randomAngle } from "../extraMath.js";
import playField from "../playField.js";

const rangerMovementPattern = {};

const MOOD_ORBIT = 0;
const MOOD_CHASE = 1;
const MOOD_FLEE = 2;

rangerMovementPattern.getNewState = function() {
	return {
		mood: MOOD_ORBIT,
		moodCountdown: 0,
		moveAngle: randomAngle()
	};
}

const movementCache = { x: 0, y: 0 };
rangerMovementPattern.timeStep = function(dt, mainObject, state, params) {
	state.moodCountdown -= dt;
	if (state.moodCountdown <= 0) {
		state.moodCountdown += params.moodTime + params.moodTimeVar * Math.random();
		const randNum = Math.random();
		const dx = playField.player.x - mainObject.x;
		const dy = playField.player.y - mainObject.y;
		const distSqr = dx * dx + dy * dy;
		const innerRSqr = params.innerOrbit * params.innerOrbit;
		const outerRSqr = params.outerOrbit * params.outerOrbit;
		if (randNum < params.orbitChance) {
			state.mood = MOOD_ORBIT;
		} else if (distSqr > outerRSqr || (1 - randNum < params.chaseChance && distSqr > innerRSqr)) {
			state.mood = MOOD_CHASE;
		} else {
			state.mood = MOOD_FLEE;
		}
	}

	const angleToPlayer = getAngleToPlayer(mainObject.x, mainObject.y);
	let targetAngle = 0; // Dummy value
	if (state.mood == MOOD_CHASE) {
		targetAngle = angleToPlayer;
	} else if (state.mood == MOOD_FLEE) {
		targetAngle = angleToPlayer + Math.PI;
	} else { // MOOD_ORBIT
		if (normalizeAnglePMPI(state.moveAngle - angleToPlayer) >= 0) {
			targetAngle = angleToPlayer + 0.5 * Math.PI;
		} else {
			targetAngle = angleToPlayer - 0.5 * Math.PI;
		}
	}
	state.moveAngle = convergeToAngle(state.moveAngle, targetAngle, params.turnSpeed * dt);

	mainObject.x += params.moveSpeed * Math.cos(state.moveAngle) * dt;
	const newX = bounceBoundify(mainObject.x, playField.x, params.bounceRad);
	if (newX != mainObject.x) {
		mainObject.x = newX;
		state.moveAngle = Math.PI - state.moveAngle;
	}
	mainObject.y += params.moveSpeed * Math.sin(state.moveAngle) * dt;
	const newY = bounceBoundify(mainObject.y, playField.y, params.bounceRad);
	if (newY != mainObject.y) {
		mainObject.y = newY;
		state.moveAngle = - state.moveAngle;
	}
}

export default rangerMovementPattern;
