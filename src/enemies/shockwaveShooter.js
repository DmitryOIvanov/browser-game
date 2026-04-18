import { CircleArea, MovableConvexPolygon } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import { FlatColor, RainbowColor } from "../color.js";
import { ctx } from "../drawing.js";
import rangerMovementPattern from "../enemyMovementPatterns/rangerMovementPattern.js";
import { bounceBoundify, getAngleToPlayer, normalizeAnglePMPI, randomAngle } from "../extraMath.js";
import ArrowIndicatorParticle from "../particles/arrowIndicatorParticle.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import ShrinkingRingParticle from "../particles/shrinkingRingParticle.js";
import playField from "../playField.js";
import ShockwaveBallEProj from "../projectiles/enemy/shockwaveBallEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const LINE_THICK = 6;
const SECONDARY_LINE_THICK = 5;
const MAX_HP = 20;
const HIT_FLASH_TIME = 2;

const BASE_VERTS = [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
];
const VERT_SCALE_FACTOR = 27;
BASE_VERTS.forEach(function (vert) {
    vert.x *= VERT_SCALE_FACTOR;
    vert.y *= VERT_SCALE_FACTOR;
});

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
const STATE_REST = 3;
const STATE_SPEEDING = 4;
const STATE_TIMES = [120, 20, 80, 20, 20];
const STATE_TIME_VAR = [60, 0, 0, 0, 0];
function getStateTime(state) {
    return STATE_TIMES[state] + STATE_TIME_VAR[state] * Math.random();
}

const SPAWN_RAD = 2 * VERT_SCALE_FACTOR;
const EYE_RAD = 12;
const EYE_OFFSET = 4;

const PROJ_SPEED = 25;
const PROJ_RAD = 10;
const SHOCK_ANGLE = Math.PI * 2 / 3;
const SHOCK_SPEED = 7;
const SHOCK_RAD = 6;
const SHOCK_PERIOD = 7;
const PROJ_THICK = 6;

const ARROW_INTERVAL = 60;
const ARROW_ANGLE = Math.PI * 0.2;
const ARROW_RADIUS = 14;
const ARROW_LINE_THICK = 2;
const ARROW_SPEED = 3;
const RING_R1 = 30;
const RING_R2 = 12;
const RING_THICK = 4;

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

        this.state = STATE_MOVING;
        this.stateDuration = getStateTime(this.state);
        this.stateProgress = 0;
        this.arrowIndicator = null;
        this.ringIndicator = null;
        this.restStartAngle = 0;
        this.angleCorrection = 0;
        this.lastTargetAngle = 0;
    }

    timestep(dt) {
        super.timestep(dt);
        this.hitFlash -= dt;
        if (this.hitFlash < 0) this.hitFlash = 0;

        this.stateProgress += dt;
        if (this.stateProgress >= this.stateDuration) {
            this.stateProgress -= this.stateDuration;
            this.state = (this.state + 1) % STATE_TIMES.length;
            this.stateDuration = getStateTime(this.state);

            if (this.state == STATE_SHOOTING) {
                this.arrowIndicator = new ArrowIndicatorParticle(
                    this.x + BASE_VERTS[0].x * Math.cos(this.bodyAngle),
                    this.y + BASE_VERTS[0].x * Math.sin(this.bodyAngle),
                    this.bodyAngle, ARROW_INTERVAL, ARROW_ANGLE, ARROW_RADIUS, ARROW_SPEED, ARROW_LINE_THICK, this.dangerColor
                );
                playField.addParticle(this.arrowIndicator);
                this.ringIndicator = new ShrinkingRingParticle(
                    this.x + EYE_OFFSET * Math.cos(this.bodyAngle),
                    this.y + EYE_OFFSET * Math.sin(this.bodyAngle),
                    RING_R1, RING_R2, RING_THICK, this.stateDuration, this.dangerColor
                );
                playField.addParticle(this.ringIndicator);
            } else if (this.state == STATE_REST) {
                this.arrowIndicator.retired = true;
                this.indicator = null;
                const proj = new ShockwaveBallEProj(this.x, this.y, this.bodyAngle, PROJ_SPEED, PROJ_RAD, SHOCK_ANGLE, SHOCK_SPEED, SHOCK_RAD, SHOCK_PERIOD, PROJ_THICK, this.dangerColor);
                proj.timestep(this.stateProgress);
                playField.addEnemyProjectile(proj);

                this.restStartAngle = this.bodyAngle;
                const targetAngle = getAngleToPlayer(this.x, this.y);
                this.lastTargetAngle = targetAngle;
                this.angleCorrection = normalizeAnglePMPI(targetAngle - this.restStartAngle);
            }
        }

        if (this.state == STATE_REST) {
            const targetAngle = getAngleToPlayer(this.x, this.y);
            this.angleCorrection += normalizeAnglePMPI(targetAngle - this.lastTargetAngle);
            this.lastTargetAngle = targetAngle;

            const t = this.stateProgress / this.stateDuration;
            this.bodyAngle = this.restStartAngle + this.angleCorrection * t * t * (3 - 2 * t);
        } else if (this.state != STATE_SHOOTING) {
            this.bodyAngle = getAngleToPlayer(this.x, this.y);
            let speedMult = 1;
            if (this.state == STATE_SLOWING) {
                speedMult = 1 - (this.stateProgress / this.stateDuration);
            } else if (this.state == STATE_SPEEDING) {
                speedMult = (this.stateProgress / this.stateDuration);
            }
            rangerMovementPattern.timestep(speedMult * dt, this, this.rangerState, RANGER_PARAMS);
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

        ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.getBaseColorStr(this.defenseProfile);
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
            if (this.arrowIndicator) this.arrowIndicator.retired = true;
            if (this.ringIndicator) this.ringIndicator.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5 * ShockwaveShooter.RAD, 2 * ShockwaveShooter.RAD, 6, FlatColor.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}
