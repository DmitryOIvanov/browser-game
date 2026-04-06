import { canv, ctx } from "../drawing.js";
import { posMod } from "../extraMath.js";

export class HorizontalGridBackground {
    constructor(horizonHeight, tileWidth, lineThick, speedFactor, fogStartHeight, fogEndHeight) {
        this.horizonHeight = horizonHeight;
        this.tileWidth = tileWidth;
        this.lineThick = lineThick;
        this.speedFactor = speedFactor;
        this.fogStartHeight = fogStartHeight;
        this.fogEndHeight = fogEndHeight;

        this.gradient = ctx.createLinearGradient(0, canv.height - fogStartHeight, 0, canv.height - fogEndHeight);
        this.gradient.addColorStop(0, 'rgba(0,0,0,0)');
        this.gradient.addColorStop(1, '#000');

        this.verticalLines = new Path2D();
        const fogEndScaleFactor = 1 - fogEndHeight / horizonHeight;
        let lineIndex = Math.ceil(-0.5 * (canv.width / fogEndScaleFactor + lineThick) / tileWidth);
        while (true) {
            this.verticalLines.moveTo(0.5 * canv.width, canv.height - horizonHeight);
            const middle = 0.5 * canv.width + tileWidth * lineIndex;
            const leftmost = middle - 0.5 * lineThick;
            const rightmost = middle + 0.5 * lineThick;
            this.verticalLines.lineTo(leftmost, canv.height);
            this.verticalLines.lineTo(rightmost, canv.height);
            this.verticalLines.closePath();

            lineIndex++;
            const xAtEndOfFog = canv.width * 0.5 + (tileWidth * lineIndex + lineThick) * fogEndScaleFactor;
            if (xAtEndOfFog > canv.width) break;
        }

        this.moveOffset = 0;
    }

    timestep(dt) {
        this.moveOffset = posMod(this.moveOffset + dt * this.speedFactor, 1);
    }

    draw() {
        ctx.fillStyle = '#333';
        ctx.fill(this.verticalLines);

        let lineIndex = 0;
        while (true) {
            const effectiveIndex = lineIndex - this.moveOffset;
            const bottom = this.horizonHeight * (1 - 1 / (1 + (effectiveIndex * this.tileWidth - 0.5 * this.lineThick) / this.horizonHeight));
            if (bottom >= this.fogEndHeight) break;
            const top = this.horizonHeight * (1 - 1 / (1 + (effectiveIndex * this.tileWidth + 0.5 * this.lineThick) / this.horizonHeight));

            ctx.fillRect(0, canv.height - bottom, canv.width, top - bottom);

            lineIndex++;
        }

        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, canv.width, canv.height - this.fogStartHeight);
    }
}
