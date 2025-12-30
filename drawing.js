export const canv = document.getElementById("main_canvas");
export const ctx = canv.getContext("2d");
canv.width = canv.offsetWidth;
canv.height = canv.offsetHeight;
canv.oncontextmenu = () => false;

export function fillScreen(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canv.width, canv.height);
}

export function drawDot(x, y) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}

const MAX_ALPHA_STACK = 16; // arbitrary and high enough
const alphaStack = new Array(MAX_ALPHA_STACK);
let alphaStackSize = 0;

export function addToGlobalAlphaStack(val) {
    if (alphaStackSize >= MAX_ALPHA_STACK) throw new Error("Max alpha stack size exceeded");
    const prevAlpha = (alphaStackSize == 0) ? 1 : alphaStack[alphaStackSize - 1];
    alphaStack[alphaStackSize] = prevAlpha * val;
    alphaStackSize++;
    ctx.globalAlpha = alphaStack[alphaStackSize - 1];
}

export function popFromGlobalStack() {
    if (alphaStackSize > 0) {
        alphaStackSize--;
    }
    ctx.globalAlpha = (alphaStackSize == 0) ? 1 : alphaStack[alphaStackSize - 1];
}

export function fillTextCenteredXY(text, fontSizePx, x, y) {
    ctx.textAlign = "center";
    ctx.font = `${fontSizePx}px Arial`;
    ctx.fillText(text, x, y + fontSizePx * 0.25);
}

export function fillTextFromCorner(text, fontSizePx, x, y) {
    ctx.textAlign = "left";
    ctx.font = `${fontSizePx}px Arial`;
    ctx.fillText(text, x, y);
}

export function customStrokeRect(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();
}
