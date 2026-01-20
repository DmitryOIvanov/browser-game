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

// function processParams(params) {
//     let curGrowthRate = 1;
//     for (let i = 0; i < params.splitInfo.length; i++) {
//         const entry = params.splitInfo[i];
//         console.log(curGrowthRate);
//         entry.growthRate = curGrowthRate;
//         curGrowthRate -= entry.speedConversion;
//     }
// }

const DEFAULT_PARAMS = {
    scaleMultiplier: 50,
    timeMultiplier: 1 / 120,
    initialSize: 1,
    splitDirectionVariability: 0.3,
    splitInfo: [
        {
            growthAcceleration: 0,
            speedDecay: 0,
            speedConversion: [1],
            occurenceTime: [1],
            numSplits: [10],
        },
        {
            growthAcceleration: 0,
            speedDecay: 0,
            speedConversion: [1],
            occurenceTime: [1],
            numSplits: [10],
        },
        {
            growthAcceleration: 0.2,
            speedDecay: 0,
        },
    ],
};
// processParams(DEFAULT_PARAMS);

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
        }
    }

    timeStep(dt) {
        const params = this.params;
        let splitInfo = params.splitInfo[this.splitNum];
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

        this.growthRate += params.scaleMultiplier * splitInfo.growthAcceleration * ownStep;
        this.radius += this.growthRate * ownStep;
        if (this.radius <= 0) {
            this.retired = true;
            return;
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
                    splitParticle.timeStep(-this.timeToNextSplit);
                    playField.addParticle(splitParticle);
                }
                this.retired = true;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color.getStr();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        // ctx.fill();
        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

export default class BigExplosionParticle extends SubExplosion {
    constructor(x, y, color) {
        const params = DEFAULT_PARAMS;
        super(x, y, 0, 0, params.initialSize * params.scaleMultiplier, params.scaleMultiplier, 0, params, color);
    }
}
