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