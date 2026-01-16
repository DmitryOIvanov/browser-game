import Color from "../color.js";
import { ctx } from "../drawing.js";
import playField from "../playField.js";

function randomFloatInRange(range) {
    return range[0] + (range[1] - range[0]) * Math.random();
}
function randomIntInRange(range) {
    const upper = Math.max(range[0], range[1]);
    const lower = Math.min(range[0], range[1]);
    return lower + Math.floor((upper - lower + 1) * Math.random());
}

const SPLIT_ANGLE_VARIABILITY = 0.3;
const allLevelInfo = [
    {
        growthRate: [-1, -2],
    },
    {
        growthRate: [-0.5, -1],
        numSplits: [2, 4],
        splitTime: [20, 20],
        splitSpeed: [2, 4],
        splitAngleFunction: (x) => {
            const a = 2 * x - 1;
            return 0.25 * a * a * a;
        },
    },
    {
        growthRate: [2, 2],
        numSplits: [7, 9],
        splitTime: [6, 6],
        splitSpeed: [5, 9],
        splitAngleFunction: (x) => (x),
    },
];

class SubExplosion {
    constructor(x, y, vx, vy, radius, level, color) {
        this.autonomous = true;
        this.retired = false;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.level = level;
        this.color = color;

        const levelInfo = allLevelInfo[this.level];
        this.growthRate = randomFloatInRange(levelInfo.growthRate);
        if (this.level > 0) {
            this.splitTime = randomFloatInRange(levelInfo.splitTime);
        }
    }

    timeStep(dt) {
        const levelInfo = allLevelInfo[this.level];
        let ownStep = dt;
        if (this.level > 0) ownStep = Math.min(dt, this.splitTime);
        this.x += this.vx * ownStep;
        this.y += this.vy * ownStep;
        this.radius += this.growthRate * ownStep;
        if (this.radius <= 0) {
            this.retired = true;
            return;
        }

        if (this.level > 0) {
            this.splitTime -= dt;
            if (this.splitTime <= 0) {
                const numSplits = randomIntInRange(levelInfo.splitTime);
                const currentAngle = Math.atan2(this.vy, this.vx);
                for (let i = 0; i < numSplits; i++) {
                    const randomValueForAngle = (i + 0.5 * SPLIT_ANGLE_VARIABILITY * (2 * Math.random() - 1)) / numSplits;
                    const splitAngle = 2 * Math.PI * levelInfo.splitAngleFunction(randomValueForAngle);
                    const splitSpeed = randomFloatInRange(levelInfo.splitSpeed);
                    const splitVX = this.vx + splitSpeed * Math.cos(currentAngle + splitAngle);
                    const splitVY = this.vy + splitSpeed * Math.sin(currentAngle + splitAngle);
                    const splitParticle = new SubExplosion(this.x, this.y, splitVX, splitVY, this.radius, this.level - 1, this.color);
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
        ctx.fill();
    }
}

export default class BigExplosionParticle extends SubExplosion {
    constructor(x, y, color) {
        super(x, y, 0, 0, 100, allLevelInfo.length - 1, color);
    }
}
