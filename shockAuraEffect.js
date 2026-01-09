import { ctx } from "./drawing.js";
import { qtInv, qtMult, qtRandomUnit } from "./quaternions.js";

export default class ShockAuraEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 100;
        this.avgTimeBetweenArcs = 10;
        this.arcDuration = 30;
        this.minMoves = 3;
        this.extraMoveChance = 0.6;
        this.minMoveSize = 0.1;
        this.moveSizeVariability = 0.2;

        this.arcs = [];
        this.timeToNextArc = 0;

        this.testArc = {
            points: []
        };
        this.generateTestArc();
        this.testRot = 0;
    }

    generateTestArc() {
        const baseVector = [0, 1, 0, 0];
        let curOrientation = qtRandomUnit();
        for (let i = 0; i < 30; i++) {
            const newVector = qtMult(qtInv(curOrientation), qtMult(baseVector, curOrientation));
            this.testArc.points.push(newVector);
            const travelRadians = 0.2 * Math.random();
            const travelQt = [Math.cos(travelRadians), 0, Math.sin(travelRadians), 0];
            const redirectionRadians = 0.5 * (2 * Math.random() - 1);
            const redirectionQt = [Math.cos(redirectionRadians), Math.sin(redirectionRadians), 0, 0];
            curOrientation = qtMult(redirectionQt, qtMult(travelQt, curOrientation));
        }
    }

    addArc() {
        // this.arcs.push({
        //     timeLeft: this.arcDuration
        // });
        // for (let i = 0; i < this.minMoves || Math.random < this.extraMoveChance; i++) {
        //
        // }
    }

    timeStep(dt) {
        this.testRot += 0.01 * dt;
        // this.timeToNextArc -= dt;
        // while (this.timeToNextArc <= 0) {
        //     this.timeToNextArc += - this.avgTimeBetweenArcs * Math.log(0.999 * Math.random() + 0.001);
        // }
    }

    drawUpper() {
        const testRotQt = [Math.cos(this.testRot), 0, Math.sin(this.testRot), 0];
        const testRotInvQt = qtInv(testRotQt);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let i = 0; i < this.testArc.points.length; i++) {
            const p1 = qtMult(testRotInvQt, qtMult(this.testArc.points[i], testRotQt));
            const x1 = p1[1] * this.radius + this.x;
            const y1 = p1[2] * this.radius + this.y;
            if (i > 0) {
                ctx.lineTo(x1, y1);
            } else {
                ctx.moveTo(x1, y1);
            }
        }
        ctx.stroke();
    }

    drawLower() {

    }
}
