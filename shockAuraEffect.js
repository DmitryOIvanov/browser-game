import { FlatColor, RainbowColor } from "./color.js";
import { ctx } from "./drawing.js";
import { QT_I, qtInv, qtMult, qtRandomUnit } from "./quaternions.js";

let topDebug = false;
let bottomDebug = false;

export default class ShockAuraEffect {
    constructor(x, y, params) {
        this.x = x;
        this.y = y;

        this.color = params.color != undefined ? params.color : FlatColor.WHITE;
        this.radius = params.radius != undefined ? params.radius : 100;
        this.arcSpawnRate = params.arcSpawnRate != undefined ? params.arcSpawnRate : 1 / 60;
        this.arcSpawnVariance = params.arcSpawnVariance != undefined ? params.arcSpawnVariance : 0;
        this.arcSpawnAutoDecay = params.arcSpawnAutoDecay != undefined ? params.arcSpawnAutoDecay : 0;
        this.arcDuration = params.arcDuration != undefined ? params.arcDuration : 60;
        this.minMoves = params.minMoves != undefined ? params.minMoves : 5;
        this.extraMoveChance = params.extraMoveChance != undefined ? params.extraMoveChance : 0.5;
        this.moveSizeBase = params.moveSizeBase != undefined ? params.moveSizeBase : 1;
        this.moveSizeVar = params.moveSizeVar != undefined ? params.moveSizeVar : 0;
        this.redirectionAmount = params.redirectionAmount != undefined ? params.redirectionAmount : 1;
        this.arcThickness = params.arcThickness != undefined ? params.arcThickness : 5;
        this.radDeviation = params.radDeviation != undefined ? params.radDeviation : 0;

        this.arcs = [];
        this.arcSpawnValue = 1;
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
                (nextQt[3] >= 0), // Belongs to top layer or not
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
        this.arcSpawnValue -= this.arcSpawnRate * dt;
        this.arcSpawnRate -= this.arcSpawnAutoDecay * dt;
        if (this.arcSpawnRate < 0) this.arcSpawnRate = 0;
        while (this.arcSpawnValue <= 0) {
            this.addArc();
            this.arcSpawnValue += 1 + this.arcSpawnVariance * Math.random();
        }
    }

    drawPortion(isUpper) {
        ctx.lineCap = "round";
        ctx.strokeStyle = this.color.getStr();
        for (let i = 0; i < this.arcs.length; i++) {
            const arc = this.arcs[i];
            ctx.lineWidth = this.arcThickness * arc.timeLeft / this.arcDuration;

            let pathStarted = false;
            ctx.beginPath();
            for (let i = 0; i < arc.points.length - 1; i++) {
                const point = arc.points[i];
                const nextPoint = arc.points[i + 1];
                if ((point[2] && nextPoint[2]) == isUpper) { // Belongs to top layer or not
                    if (!pathStarted) {
                        ctx.moveTo(point[0], point[1]);
                    }
                    ctx.lineTo(nextPoint[0], nextPoint[1]);
                    pathStarted = true;
                } else {
                    pathStarted = false;
                }
            }
            ctx.stroke();
        }
        ctx.lineCap = "butt";
    }

    drawUpper() {
        this.drawPortion(true);
    }

    drawLower() {
        this.drawPortion(false);
    }
}
