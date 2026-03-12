import { createDefenseProfile } from "../attackAndDefense.js";
import { FlatColor, RainbowColor } from "../color.js";
import { ctx } from "../drawing.js";
import Snake from "../enemies/snake.js";
import playField from "../playField.js";

const HOLE_RAD = 36;
const DASH_RAD = 48;
const ROT_SPEED = 0.08;
const HOLE_LINE_WIDTH = 5;
const DASH_LINE_WIDTH = 10;
const NUM_DASHES = 5;

const STATE_OPENING = 0;
const STATE_IDLE = 1;
const STATE_SPAWNING = 2;
const STATE_CLOSING = 3;
const STATE_DURATIONS = [30, 10, -1, 30];
const EYE_APPEAR_SPEED = 5;

const VISIBLE_TIME = (HOLE_RAD + Snake.SEG_RAD) / Snake.LINEAR_SPEED;

const FULL_HP_DEFENSE_PROFILE = createDefenseProfile(1);

export default class SnakeSpawnerParticle {
    constructor(x, y, initAngle, numSegs, weight) {
        this.x = x;
        this.y = y;
        this.initAngle = initAngle;
        this.numSegs = numSegs;

        this.autonomous = true;
        this.retired = false;

        this.state = STATE_OPENING;
        this.stateProgress = 0;
        this.spawnTimer = VISIBLE_TIME;
        this.rot = 0;
        this.minSeg = 0;

        this.storedSnake = new Snake(x, y, initAngle, numSegs);
        this.storedSnake.setWeight(weight);

        this.enemyRef = { enemy: null };
    }

    timeStep(dt) {
        this.rot += dt * ROT_SPEED;
        this.stateProgress += dt;
        let spawnTimerDecreased = false;
        while (true) {
            if (this.state == STATE_SPAWNING) {
                if (this.spawnTimer > 0) {
                    if (!spawnTimerDecreased) this.spawnTimer -= dt;
                    if (this.spawnTimer <= 0) {
                        this.storedSnake.timeStep(-this.spawnTimer);
                        playField.addEnemy(this.storedSnake);
                        this.enemyRef.enemy = this.storedSnake;
                    }
                }
                if (this.stateProgress > VISIBLE_TIME) {
                    this.stateProgress -= Snake.SEG_TIME_DIFF;
                    this.minSeg++;
                    if (this.minSeg >= this.numSegs) {
                        this.state++;
                    }
                } else {
                    break;
                }
            } else {
                if (this.stateProgress >= STATE_DURATIONS[this.state]) {
                    this.stateProgress -= STATE_DURATIONS[this.state];
                    this.state++;
                    if (this.state > STATE_CLOSING) {
                        this.retired = true;
                        return;
                    } else if (this.state == STATE_SPAWNING) {
                        this.spawnTimer -= this.stateProgress;
                        spawnTimerDecreased = true;
                    }
                } else {
                    break;
                }
            }
        }
    }

    draw() {
        if (this.retired) return;
        let scale = 1;
        if (this.state == STATE_OPENING) {
            scale = this.stateProgress / STATE_DURATIONS[STATE_OPENING];
        } else if (this.state == STATE_CLOSING) {
            scale = 1 - this.stateProgress / STATE_DURATIONS[STATE_CLOSING];
        }
        scale = 1 - (1 - scale) * (1 - scale);

        if (this.state == STATE_SPAWNING) {
            const colorStr = this.storedSnake.getBaseColorStr(FULL_HP_DEFENSE_PROFILE);
            ctx.strokeStyle = colorStr;
            ctx.lineWidth = Snake.LINE_THICK;
            let seg = this.minSeg;
            let time = this.stateProgress;
            while (time > 0 && seg < this.numSegs) {
                const dist = Snake.LINEAR_SPEED * (VISIBLE_TIME - time);
                const x = this.x - dist * Math.cos(this.initAngle);
                const y = this.y - dist * Math.sin(this.initAngle);
                let startAngle = 0;
                let endAngle = 2 * Math.PI;
                const cosValue = (Snake.SEG_RAD * Snake.SEG_RAD + dist * dist - HOLE_RAD * HOLE_RAD) / (2 * Snake.SEG_RAD * dist);
                if (cosValue >= -1 && cosValue <= 1) {
                    startAngle = this.initAngle - Math.acos(cosValue);
                    endAngle = this.initAngle + Math.acos(cosValue);
                }
                if (cosValue <= 1) {
                    ctx.beginPath();
                    ctx.arc(x, y, Snake.SEG_RAD, startAngle, endAngle);
                    ctx.stroke();
                }
                if (seg == this.minSeg && (seg == 0 || !this.storedSnake.area.arr[seg - 1].exists)) {
                    ctx.fillStyle = colorStr;
                    let eyeScale = EYE_APPEAR_SPEED * time / VISIBLE_TIME - 1;
                    if (eyeScale >= 0) {
                        if (eyeScale > 1) eyeScale = 1;
                        const eyeX = x + Snake.EYE_OFFSET * Math.cos(this.initAngle);
                        const eyeY = y + Snake.EYE_OFFSET * Math.sin(this.initAngle);
                        ctx.beginPath();
                        ctx.arc(eyeX, eyeY, eyeScale * Snake.EYE_RAD, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }

                seg++;
                time -= Snake.SEG_TIME_DIFF;
            }
        }

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = scale * HOLE_LINE_WIDTH;
        ctx.beginPath();
        ctx.arc(this.x, this.y, HOLE_RAD * scale, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = scale * DASH_LINE_WIDTH;
        for (let i = 0; i < NUM_DASHES; i++) {
            const startAngle = 2 * Math.PI * i / NUM_DASHES + this.rot;
            const endAngle = startAngle + Math.PI / NUM_DASHES;
            ctx.beginPath();
            ctx.arc(this.x, this.y, DASH_RAD * scale, startAngle, endAngle);
            ctx.stroke();
        }
    }

    getEnemyRef() {
        return this.enemyRef;
    }
}
