export const canv = document.getElementById("main_canvas");
export const ctx = canv.getContext("2d");
canv.width = canv.offsetWidth;
canv.height = canv.offsetHeight;
canv.oncontextmenu = () => false;

export function fillScreen(color){
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canv.width,canv.height);
}

export function drawDot(x,y){
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x,y,3,0,2*Math.PI);
    ctx.closePath();
    ctx.stroke();
}

const MAX_ALPHA_STACK = 16; // arbitrary and high enough
const alphaStack = new Array(MAX_ALPHA_STACK);
let alphaStackSize = 0;

function recomputeGlobalAlpha(){
    let alpha = 1;
    for(let i=0; i<alphaStackSize; i++){
        alpha *= alphaStack[i];
    }
    ctx.globalAlpha = alpha;
}

export function addToGlobalAlphaStack(val){
    if(alphaStackSize >= MAX_ALPHA_STACK) throw new Error("Max alpha stack size exceeded");
    alphaStack[alphaStackSize] = val;
    alphaStackSize++;
    recomputeGlobalAlpha();
}

export function popFromGlobalStack(){
    if(alphaStackSize > 0){
        alphaStackSize--;
    }
    recomputeGlobalAlpha();
}

export function fillTextCenteredXY(text, fontSizePx, x, y){
    ctx.textAlign = "center";
    ctx.fillText(text,x,y+fontSizePx*0.25);
}