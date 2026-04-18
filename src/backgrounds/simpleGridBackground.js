import { canv, ctx } from "../drawing.js";

export class SimpleGridBackground {
    constructor(tileWidth, lineWidth, xOffset, yOffset) {
        this.allPath = new Path2D();
        let lineIndex = 0;
        while (true) {
            const lesserX = lineIndex * tileWidth - 0.5 * lineWidth + xOffset;
            if (lesserX >= canv.width) break;
            this.allPath.rect(lesserX, 0, lineWidth, canv.height);
            lineIndex++;
        }
        lineIndex = 0;
        while (true) {
            const lesserY = lineIndex * tileWidth - 0.5 * lineWidth + yOffset;
            if (lesserY >= canv.height) break;
            this.allPath.rect(0, lesserY, canv.width, lineWidth);
            lineIndex++;
        }
    }

    draw() {
        ctx.fillStyle = "#080808";
        ctx.fill(this.allPath);
    }
}
