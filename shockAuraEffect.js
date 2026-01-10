import { ctx } from "./drawing.js";
import { QT_I, qtInv, qtMult, qtRandomUnit } from "./quaternions.js";

export default class ShockAuraEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 100;
        this.avgTimeBetweenArcs = 10;
        this.arcDuration = 30;
        this.minMoves = 3;
        this.extraMoveChance = 0.9;
        this.moveSizeBase = 0.1;
        this.moveSizeVar = 0.1;
        this.redirectionAmount = 0.5;

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
        for (let i = 0; i < 100; i++) {
            const newVector = qtMult(qtInv(curOrientation), qtMult(baseVector, curOrientation));
            this.testArc.points.push(newVector);
            const travelRadians = 0.1 * Math.random();
            const travelQt = [Math.cos(travelRadians), 0, Math.sin(travelRadians), 0];
            const redirectionRadians = 0.5 * (2 * Math.random() - 1);
            const redirectionQt = [Math.cos(redirectionRadians), Math.sin(redirectionRadians), 0, 0];
            curOrientation = qtMult(redirectionQt, qtMult(travelQt, curOrientation));
        }
    }

    addArc() {
        const newArc = {
            timeLeft: this.arcDuration,
            points: [],
        };

        let curOrientation = qtRandomUnit();
        for (let i = 0; i < this.minMoves || Math.random() < this.extraMoveChance; i++) {
            const nextPoint = qtMult(qtInv(curOrientation), qtMult(QT_I, curOrientation));
            newArc.points.push(nextPoint);

            const travelRadians = this.moveSizeBase + this.moveSizeVar * Math.random();
            const travelQt = [Math.cos(travelRadians), 0, Math.sin(travelRadians), 0];
            const redirectionRadians = this.redirectionAmount * (2 * Math.random() - 1);
            const redirectionQt = [Math.cos(redirectionRadians), Math.sin(redirectionRadians), 0, 0];
            curOrientation = qtMult(redirectionQt, qtMult(travelQt, curOrientation));
        }
        const nextPoint = qtMult(qtInv(curOrientation), qtMult(QT_I, curOrientation));
        newArc.points.push(nextPoint);

        this.arcs.push(newArc);
    }

    timeStep(dt) {
        this.testRot += 0.01 * dt;
        for (let i = 0; i < this.arcs.length; i++) {
            this.arcs[i].timeLeft -= dt;
        }
        while (this.arcs.length > 0 && this.arcs[0].timeLeft <= 0) {
            this.arcs.shift();
        }
        this.timeToNextArc -= dt;
        while (this.timeToNextArc <= 0) {
            this.addArc();
            this.timeToNextArc += - this.avgTimeBetweenArcs * Math.log(0.999 * Math.random() + 0.001);
        }
    }

    drawUpper() {
        ctx.strokeStyle = "#FFF";
        for (let i = 0; i < this.arcs.length; i++) {
            const arc = this.arcs[i];
            ctx.lineWidth = 5 * arc.timeLeft / this.arcDuration;
            ctx.beginPath();
            for (let i = 0; i < arc.points.length; i++) {
                const p1 = arc.points[i];
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
    }

    drawLower() {

    }
}
