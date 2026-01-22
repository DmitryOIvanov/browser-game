import Color from "../color.js";
import { ctx } from "../drawing.js";
import { posMod, randomAngle } from "../extraMath.js";
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
    scaleMultiplier: 15,
    timeMultiplier: 1,
    initialSize: 3,
    splitDirectionVariability: 0.4,
    outlineMode: true,
    decayTime: [3, 4],
    splitInfo: [
        {
            speedConversion: [0.4, 0.45],
            occurenceTime: [1.5],
            numSplits: [10],
            speedDecay: 0,
        },
        {
            speedConversion: [0.3, 0.35],
            occurenceTime: [0.3, 0.5],
            numSplits: [2],
            speedDecay: 0,
        },
        {
            speedConversion: [0.5, 0.65],
            occurenceTime: [0.2, 0.4],
            numSplits: [2, 3],
            speedDecay: 0,
        },
        {
            speedDecay: 0.03,
        },
    ],
};

const densityCubicWeight = 0.5
function splitAngleDensity(value) {
    const a = 2 * posMod(value, 1) - 1;
    return densityCubicWeight * 0.5 * a * a * a + (1 - densityCubicWeight) * (value - 0.5);
}

class SubExplosion {
    constructor(x, y, vx, vy, radius, growthRate, splitNum, params, color) {
        this.autonomous = true;
        this.retired = false;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.growthRate = growthRate;
        this.splitNum = splitNum;
        this.params = params;
        this.color = color;

        if (this.splitNum < params.splitInfo.length - 1) {
            const splitInfo = params.splitInfo[this.splitNum];
            this.timeToNextSplit = randomFloatInRange(splitInfo.occurenceTime) / params.timeMultiplier;
        } else {
            this.timeElapsed = 0;
            this.initialRadius = radius;
        }
    }

    timeStep(dt) {
        const params = this.params;
        const splitInfo = params.splitInfo[this.splitNum];
        const isLastSplit = (this.splitNum == params.splitInfo.length - 1);

        let ownStep = dt;
        if (!isLastSplit) {
            ownStep = Math.min(dt, this.timeToNextSplit);
        }
        ownStep *= params.timeMultiplier;

        let speedReduction = Math.exp(-splitInfo.speedDecay * ownStep);
        this.vx *= speedReduction;
        this.vy *= speedReduction;
        this.x += this.vx * ownStep;
        this.y += this.vy * ownStep;

        if (!isLastSplit) {
            this.radius += this.growthRate * ownStep;
            if (this.radius <= 0) {
                this.retired = true;
                return;
            }
        } else {
            this.timeElapsed += ownStep;
            if (this.timeElapsed >= -2 * this.initialRadius / this.growthRate) {
                this.retired = true;
                return;
            }
            const a = this.growthRate * this.timeElapsed;
            this.radius = this.initialRadius + a + 0.25 * a * a / this.initialRadius;
        }

        if (!isLastSplit) {
            this.timeToNextSplit -= dt;
            if (this.timeToNextSplit <= 0) {
                const numSplits = randomIntInRange(splitInfo.numSplits);
                for (let i = 0; i < numSplits; i++) {
                    const randomValueForAngle = (i + 0.5 + params.splitDirectionVariability * (2 * Math.random() - 1)) / numSplits;
                    let splitAngle = Math.atan2(this.vy, this.vx);
                    if (this.splitNum == 0) {
                        splitAngle += 2 * Math.PI * randomValueForAngle;
                    } else {
                        splitAngle += 2 * Math.PI * splitAngleDensity(randomValueForAngle);
                    }
                    const splitSpeed = randomFloatInRange(splitInfo.speedConversion) * params.scaleMultiplier;
                    const splitVX = this.vx + splitSpeed * Math.cos(splitAngle);
                    const splitVY = this.vy + splitSpeed * Math.sin(splitAngle);
                    const splitParticle = new SubExplosion(this.x, this.y, splitVX, splitVY, this.radius, this.growthRate - splitSpeed, this.splitNum + 1, params, this.color);
                    playField.addParticle(splitParticle);
                    splitParticle.timeStep(-this.timeToNextSplit);
                }
                this.retired = true;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color.getStr();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        if (this.params.outlineMode) {
            ctx.strokeStyle = this.color.getStr();
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fill();
        }
    }
}

export default class BigExplosionParticle extends SubExplosion {
    constructor(x, y, color) {
        const params = DEFAULT_PARAMS;
        super(x, y, 0, 0, params.initialSize * params.scaleMultiplier, params.scaleMultiplier, 0, params, color);
    }
}
