import { canv } from "./drawing.js";

const controls = {
    pressed: {},
    held: {},
    mouse: {
        leftHeld: false,
        rightHeld: false,
        lPressed: false,
        rPressed: false,
        inBounds: false,
        x: 0,
        y: 0
    }
};

document.addEventListener("keydown", function(event){
    event.preventDefault();
    controls.held[event.code] = true;
    controls.pressed[event.code] = true;
});
document.addEventListener("keyup", function(event){
    event.preventDefault();
    controls.held[event.code] = false;
});
canv.addEventListener("mousemove", function(event){
    let rect = canv.getBoundingClientRect();
    controls.mouse.inBounds = true;
    controls.mouse.x = event.layerX - rect.left;
    controls.mouse.y = event.layerY - rect.top;
});
canv.addEventListener("mouseout", function(event){
    controls.mouse.inBounds = false;
});
canv.addEventListener("mousedown", function(event){
    if(event.button == 0){
        controls.mouse.leftHeld = true;
        controls.mouse.lPressed = true;
    }else if(event.button == 2){
        controls.mouse.rightHeld = true;
        controls.mouse.rPressed = true;
    }
});
canv.addEventListener("mouseup", function(event){
    if(event.button == 0){
        controls.mouse.leftHeld = false;
    }else if(event.button == 2){
        controls.mouse.rightHeld = false;
    }
});

controls.clearPresses = function(){
    controls.pressed = {};
    controls.mouse.lPressed = false;
    controls.mouse.rPressed = false;
}

export default controls;