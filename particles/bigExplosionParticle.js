import Color from "../color.js";
import { ctx } from "../drawing.js";
import { randomAngle } from "../extraMath.js";
import playField from "../playField.js";

function randomFloatInRange(range) {
    if (range.length == 1) return range[0];
    return range[0] + (range[1] - range[0]) * Math.random();
}
function randomIntInRange(range) {
    if (range.length == 1) return range[0];
    const upper = Math.max(range[0], range[1]);
    const lower = Math.min(range[0], range[1]);
    return lower + Math.floor((upper - lower + 1) * Math.random());
}

const DEFAULT_PARAMS = {
    initialSize: 100,
    initialSpeed: 40,
    duration: 30,
    speedDecay: 0.1,
    sizeDecay: 0.03,
    splitVariability: 0.3,
    splitInfo: [
        {
            durationElapsed: [0.1],
            numSplits: [10],
        },
        {
            durationElapsed: [0.1],
            numSplits: [3],
        },
    ],
};

function splitAngleDensity(value) {
    const a = 2 * value - 1;
    return 0.75 * a * a * a;
}

class SubExplosion {
    constructor(x, y, speed, angle, abstractSizeValue, splitsLeft, params, color) {
        this.autonomous = true;
        this.retired = false;

        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = angle;
        this.abstractSizeValue = abstractSizeValue;
        this.splitsLeft = splitsLeft;
        this.params = params;
        this.color = color;

        if (this.splitsLeft > 0) {
            const splitInfo = params.splitInfo[this.splitsLeft - 1];
            this.timeToNextSplit = params.duration * randomFloatInRange(splitInfo.durationElapsed);
        }
    }

    timeStep(dt) {
        let ownStep = dt;
        if (this.splitsLeft > 0) {
            ownStep = Math.min(dt, this.timeToNextSplit);
        }
        this.speed *= Math.exp(-this.params.speedDecay * ownStep);
        this.x += Math.cos(this.angle) * ownStep;
        this.y += Math.sin(this.angle) * ownStep;
        this.abstractSizeValue += dt / this.params.duration;
        if (this.abstractSizeValue >= 1) {
            this.retired = true;
            return;
        }

        if (this.splitsLeft > 0) {
            const splitInfo = this.params.splitInfo[this.splitsLeft - 1];
            this.timeToNextSplit -= dt;
            if (this.timeToNextSplit <= 0) {
                const numSplits = randomIntInRange(splitInfo.numSplits);
                for (let i = 0; i < numSplits; i++) {
                    const randomValueForAngle = (i + 0.5 + this.params.splitVariability * (2 * Math.random() - 1)) / numSplits;
                    let splitAngle;
                    if (this.splitsLeft < this.params.splitInfo.length) {
                        splitAngle = 2 * Math.PI * splitAngleDensity(randomValueForAngle);
                    } else {
                        splitAngle = 2 * Math.PI * randomValueForAngle;
                    }
                    const splitParticle = new SubExplosion(this.x, this.y, this.speed, this.angle + splitAngle, this.abstractSizeValue, this.splitsLeft - 1, this.params, this.color);
                    splitParticle.timeStep(-this.timeToNextSplit);
                    playField.addParticle(splitParticle);
                }
                this.retired = true;
            }
        }
    }

    getRadius() {
        const params = this.params;
    }

    draw() {
        const radius = (this.params.initialSize + this.params.initialSpeed * this.abstractSizeValue) * Math.exp(-this.abstractSizeValue * this.params.sizeDecay * this.params.duration);
        ctx.fillStyle = this.color.getStr();
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default class BigExplosionParticle extends SubExplosion {
    constructor(x, y, color) {
        super(x, y, 0, 0, 0, DEFAULT_PARAMS.splitInfo.length, DEFAULT_PARAMS, color);
    }
}
