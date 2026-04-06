import { CircleArea, IdenticalCircleCollectionArea, RegularPolygonArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import { FlatColor, RainbowColor } from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, getAngleToPlayer, isInBounds, normalizeAngle, normalizedAtan2, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import BallCollectionEProj from "../projectiles/enemy/ballCollectionEProj.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import RingOfBallsEProj from "../projectiles/enemy/ringOfBallsEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const BODY_RAD = 32;
const EYE_RAD = 18;
const EYE_LINE_WIDTH = 5;
const PUPIL_RAD = 8;
const PUPIL_OFFSET = 9;
const NUM_SIDES = 5;
const ROT_SPEED = 0.03;

const BULLET_RAD = 6;
const BULLET_LINE_THICK = 6;
const NUM_BULLETS = 8;
const BULLET_SKIP = 3;
const BULLET_CREATE_TIME = 6;
const RING_ROT_SPEED = 0.016;
const RING_RAD = 50;
const ADDITIONAL_PUPIL_SPEED = 2 * Math.PI * BULLET_SKIP / NUM_BULLETS / BULLET_CREATE_TIME;
const PUPIL_LERP_TIME = 3;
const SHOOT_TIME = 30;
const IDLE_TIME = 80;
const IDLE_TIME_VAR = 40;
const RING_MOVE_SPEED = 3;
const RING_GROWTH = 0.7;
const CULL_DELAY = 70;

const TURN_TIME = 30;
const TURN_TIME_VAR = 100;
const TURN_SPEED = 0.018
const MOVE_SPEED = 1.5;
const BOUNCE_RAD = 0.58778 * BODY_RAD;

const STATE_IDLE = 0;
const STATE_BUILD = 1;
const STATE_SHOOT = 2;

const LINE_THICK = 6;
const MAX_HP = 20;
const HIT_FLASH_TIME = 2;

export default class RingShooter extends AbstractEnemy {
    static RAD = BODY_RAD;

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.moveAngle = randomAngle();
        this.turnCountdown = TURN_TIME + TURN_TIME_VAR * Math.random();
        this.turnDir = Math.random() > 0.5 ? 1 : -1;

        this.bodyRot = randomAngle();
        this.rotDir = Math.random() > 0.5 ? 1 : -1;
        this.area = new RegularPolygonArea(x, y, BODY_RAD, this.bodyRot, NUM_SIDES);
        this.defenseProfile = createDefenseProfile(MAX_HP);
        this.state = STATE_IDLE;
        this.stateDuration = IDLE_TIME + IDLE_TIME_VAR * Math.random();
        this.stateProgress = 0;

        this.ringAngle = 0;
        this.bulletsSpawned = 0;
        this.bulletProgress = new Array(NUM_BULLETS).fill(-1);
        this.partialArea = new IdenticalCircleCollectionArea(NUM_BULLETS, BULLET_RAD, false);
        this.partialRing = new BallCollectionEProj(this.partialArea, BULLET_LINE_THICK, this.dangerColor);
        this.partialRing.bound = new CircleArea(x, y, RING_RAD + BULLET_RAD);
        this.fullRing = null;

        this.lastPupilX = 0;
        this.lastPupilY = 0;
        this.pupilLerp = 1;
    }

    timestep(dt) {
        super.timestep(dt);
        this.hitFlash -= dt;
        if (this.hitFlash < 0) this.hitFlash = 0;

        this.x += MOVE_SPEED * Math.cos(this.moveAngle) * dt;
        if (!isInBounds(this.x, playField.x, BOUNCE_RAD)) {
            this.x = bounceBoundify(this.x, playField.x, BOUNCE_RAD);
            this.moveAngle = normalizeAngle(Math.PI - this.moveAngle);
        }
        this.y += MOVE_SPEED * Math.sin(this.moveAngle) * dt;
        if (!isInBounds(this.y, playField.y, BOUNCE_RAD)) {
            this.y = bounceBoundify(this.y, playField.y, BOUNCE_RAD);
            this.moveAngle = normalizeAngle(-this.moveAngle);
        }
        this.turnCountdown -= dt;
        if (this.turnCountdown < 0) {
            this.turnCountdown += TURN_TIME + TURN_TIME_VAR * Math.random();
            this.turnDir *= -1;
        }
        this.moveAngle += this.turnDir * TURN_SPEED * dt;

        this.bodyRot += ROT_SPEED * this.rotDir * dt;
        this.ringAngle += dt * this.rotDir * RING_ROT_SPEED;
        this.stateProgress += dt;
        this.pupilLerp += dt / PUPIL_LERP_TIME;

        while (true) {
            if (this.state == STATE_IDLE) {
                if (this.stateProgress >= this.stateDuration) {
                    this.stateProgress -= this.stateDuration;
                    this.state = STATE_BUILD;

                    this.ringAngle = getAngleToPlayer(this.x, this.y);
                    this.ringAngle += this.stateProgress * this.rotDir * RING_ROT_SPEED;
                    this.bulletsSpawned = 0;

                    this.partialArea.setExistenceForAll(false);
                    this.partialRing.retired = false;
                    playField.addEnemyProjectile(this.partialRing);
                    continue;
                }
            } else if (this.state == STATE_BUILD) {
                this.partialRing.bound.x = this.x;
                this.partialRing.bound.y = this.y;
                for (let i = 0; i < this.bulletsSpawned; i++) {
                    this.bulletProgress[(BULLET_SKIP * i) % NUM_BULLETS] += dt;
                }
                while (true) {
                    if (this.bulletsSpawned == NUM_BULLETS) break;
                    const bulletNetTime = this.stateProgress - this.bulletsSpawned * BULLET_CREATE_TIME;
                    if (bulletNetTime < 0) break;
                    this.bulletProgress[(BULLET_SKIP * this.bulletsSpawned) % NUM_BULLETS] = bulletNetTime;
                    this.bulletsSpawned++;
                }
                let allSpawned = (this.bulletsSpawned == NUM_BULLETS);
                for (let i = 0; i < this.bulletsSpawned; i++) {
                    const index = (BULLET_SKIP * i) % NUM_BULLETS;
                    if (this.bulletProgress[index] >= BULLET_CREATE_TIME) {
                        this.bulletProgress[index] = BULLET_CREATE_TIME;
                    } else {
                        allSpawned = false;
                    }
                    const member = this.partialArea.members[i];
                    member.exists = true;
                    const memberAngle = this.ringAngle + 2 * Math.PI * this.rotDir * index / NUM_BULLETS;
                    const memberDist = PUPIL_OFFSET + (RING_RAD - PUPIL_OFFSET) * this.bulletProgress[index] / BULLET_CREATE_TIME;
                    member.x = this.x + memberDist * Math.cos(memberAngle);
                    member.y = this.y + memberDist * Math.sin(memberAngle);
                }
                if (allSpawned) {
                    this.stateProgress = 0;
                    this.state = STATE_SHOOT;

                    const lastAngle = this.ringAngle - this.rotDir * ADDITIONAL_PUPIL_SPEED * this.stateProgress;
                    this.lastPupilX = PUPIL_OFFSET * Math.cos(lastAngle);
                    this.lastPupilY = PUPIL_OFFSET * Math.sin(lastAngle);
                    this.pupilLerp = 0;

                    this.partialRing.retired = true;
                    this.fullRing = new RingOfBallsEProj(NUM_BULLETS, RING_RAD, BULLET_RAD, 0, 0, 0, 0, 0, 0, 0, CULL_DELAY, BULLET_LINE_THICK, this.dangerColor);
                    playField.addEnemyProjectile(this.fullRing);
                    continue;
                }
            } else if (this.state == STATE_SHOOT) {
                this.fullRing.area.x = this.x;
                this.fullRing.area.y = this.y;
                this.fullRing.area.angle = this.ringAngle;

                if (this.stateProgress >= SHOOT_TIME) {
                    let dx = playField.player.x - this.x;
                    const dy = playField.player.y - this.y;
                    if (dx == 0 && dy == 0) dx = 1;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    this.fullRing.vx = RING_MOVE_SPEED * dx / dist;
                    this.fullRing.vy = RING_MOVE_SPEED * dy / dist;
                    this.fullRing.rotSpeed = this.rotDir * RING_ROT_SPEED;
                    this.fullRing.growthRate = RING_GROWTH;
                    this.fullRing = null;

                    this.stateProgress -= SHOOT_TIME;
                    this.state = STATE_IDLE;
                    this.stateDuration = IDLE_TIME + IDLE_TIME_VAR * Math.random();
                    continue;
                }
            }
            break;
        }

        if (this.pupilLerp > 1) this.pupilLerp = 1;

        this.area.update(this.x, this.y, BODY_RAD, this.bodyRot, NUM_SIDES);
    }

    draw() {
        ctx.lineWidth = LINE_THICK;
        ctx.strokeStyle = (this.hitFlash > 0) ? '#fff' : this.getBaseColorStr(this.defenseProfile);
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

        let pupilX;
        let pupilY;
        if (this.state == STATE_IDLE || this.state == STATE_SHOOT) {
            const playerAngle = getAngleToPlayer(this.x, this.y);
            pupilX = PUPIL_OFFSET * Math.cos(playerAngle);
            pupilY = PUPIL_OFFSET * Math.sin(playerAngle);
            if (this.pupilLerp < 1) {
                pupilX = this.lastPupilX + this.pupilLerp * (pupilX - this.lastPupilX);
                pupilY = this.lastPupilY + this.pupilLerp * (pupilY - this.lastPupilY);
            }
        } else if (this.state == STATE_BUILD) {
            const angle = this.ringAngle + this.rotDir * this.stateProgress * ADDITIONAL_PUPIL_SPEED;
            pupilX = PUPIL_OFFSET * Math.cos(angle);
            pupilY = PUPIL_OFFSET * Math.sin(angle);
        }
        pupilX += this.x;
        pupilY += this.y;

        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, PUPIL_RAD, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    getHit() {
        if (this.defenseProfile.expired) {
            this.retired = true;
            this.partialRing.retired = true;
            if (this.fullRing) {
                this.fullRing.retired = true;
            }
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5 * RingShooter.RAD, 2 * RingShooter.RAD, 6, FlatColor.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}
