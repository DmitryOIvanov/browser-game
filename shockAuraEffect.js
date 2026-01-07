export default class ShockAuraEffect {
    constructor() {
        this.radius = 100;
        this.avgTimeBetweenArcs = 10;
        this.arcDuration = 30;
        this.minMoves = 3;
        this.extraMoveChance = 0.6;
        this.minMoveSize = 0.1;
        this.moveSizeVariability = 0.2;

        this.arcs = [];
        this.timeToNextArc = 0;
    }

    addArc() {
        this.arcs.push({
            timeLeft: this.arcDuration
        });
        for (let i = 0; i < this.minMoves || Math.random < this.extraMoveChance; i++) {

        }
    }

    timeStep(dt) {
        this.timeToNextArc -= dt;
        while (this.timeToNextArc <= 0) {
            this.timeToNextArc += - this.avgTimeBetweenArcs * Math.log(0.999 * Math.random() + 0.001);
        }
    }

    drawUpper() {

    }

    drawLower() {

    }
}
