import { canv, ctx } from "../drawing.js";
import { posMod } from "../extraMath.js";

export class HorizontalGridBackground {
    constructor(horizonHeight, tileWidth, lineThick, tileVerticalFactor, speedFactor, fogStartHeight, fogEndHeight) {
        this.horizonHeight = horizonHeight;
        this.tileWidth = tileWidth;
        this.lineThick = lineThick;
        this.tileVerticalFactor = tileVerticalFactor;
        this.speedFactor = speedFactor;
        this.fogStartHeight = fogStartHeight;
        this.fogEndHeight = fogEndHeight;

        this.verticalLines = new Path2D();
        const fogEndScaleFactor = 1 - fogEndHeight / horizonHeight;
        let lineIndex = Math.ceil(-0.5 * (canv.width / fogEndScaleFactor + lineThick) / tileWidth);
        console.log(lineIndex);
        while (true) {
            const bottomMiddle = 0.5 * canv.width + tileWidth * lineIndex;
            this.verticalLines.moveTo(0.5 * canv.width, canv.height - horizonHeight);
            this.verticalLines.lineTo(bottomMiddle - lineThick, canv.height);
            this.verticalLines.lineTo(bottomMiddle + lineThick, canv.height);
            this.verticalLines.closePath();

            lineIndex += 1;
            const xAtEndOfFog = canv.width * 0.5 + (tileWidth * lineIndex + lineThick) * fogEndScaleFactor;
            if (xAtEndOfFog > canv.width) break;
        }

        this.moveOffset = 0;
    }

    timeStep(dt) {
        this.moveOffset = posMod(this.moveOffset + dt * this.speedFactor, 1);
    }

    draw() {
        ctx.fillStyle = '#fff';
        ctx.fill(this.verticalLines);
    }
}
