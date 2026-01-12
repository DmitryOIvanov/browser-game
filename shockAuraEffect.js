import { ctx } from "./drawing.js";
import { QT_I, qtInv, qtMult, qtRandomUnit } from "./quaternions.js";

export default class ShockAuraEffect {
    constructor(x, y, params) {
        this.x = x;
        this.y = y;

        this.radius = params.radius;
        this.arcDelayBase = params.arcDelayBase;
        this.arcDelayVar = params.arcDelayVar;
        this.arcDuration = params.arcDuration;
        this.minMoves = params.minMoves;
        this.extraMoveChance = params.extraMoveChance;
        this.moveSizeBase = params.moveSizeBase;
        this.moveSizeVar = params.moveSizeVar;
        this.redirectionAmount = params.redirectionAmount;
        this.arcThickness = params.arcThickness;
        this.radDeviation = params.radDeviation;

        this.arcs = [];
        this.timeToNextArc = 0;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    addArc() {
        const newArc = {
            timeLeft: this.arcDuration,
            points: [],
        };

        let curOrientation = qtRandomUnit();
        for (let i = 0; true; i++) {
            const nextQt = qtMult(qtInv(curOrientation), qtMult(QT_I, curOrientation));
            const rad = this.radius * (1 + this.radDeviation * Math.random());
            newArc.points.push([
                this.x + nextQt[1] * rad,
                this.y + nextQt[2] * rad,
                nextQt[3] * rad,
            ]);

            if (i < this.minMoves || Math.random() < this.extraMoveChance) {
                const travelRadians = this.moveSizeBase + this.moveSizeVar * Math.random();
                const travelQt = [Math.cos(travelRadians), 0, Math.sin(travelRadians), 0];
                const redirectionRadians = this.redirectionAmount * (2 * Math.random() - 1);
                const redirectionQt = [Math.cos(redirectionRadians), Math.sin(redirectionRadians), 0, 0];
                curOrientation = qtMult(redirectionQt, qtMult(travelQt, curOrientation));
            } else {
                break;
            }
        }
        this.arcs.push(newArc);
    }

    timeStep(dt) {
        for (let i = 0; i < this.arcs.length; i++) {
            this.arcs[i].timeLeft -= dt;
        }
        while (this.arcs.length > 0 && this.arcs[0].timeLeft <= 0) {
            this.arcs.shift();
        }
        this.timeToNextArc -= dt;
        while (this.timeToNextArc <= 0) {
            this.addArc();
            this.timeToNextArc += this.arcDelayBase + this.arcDelayBase * Math.random();
        }
    }

    drawUpper() {
        ctx.strokeStyle = "#FFF";
        for (let i = 0; i < this.arcs.length; i++) {
            const arc = this.arcs[i];
            ctx.lineWidth = this.arcThickness * arc.timeLeft / this.arcDuration;
            ctx.beginPath();
            for (let i = 0; i < arc.points.length; i++) {
                const point = arc.points[i];
                if (i > 0) {
                    ctx.lineTo(point[0], point[1]);
                } else {
                    ctx.moveTo(point[0], point[1]);
                }
            }
            ctx.stroke();
        }
    }

    drawLower() {

    }
}
