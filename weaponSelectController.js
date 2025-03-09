import controls from "./controls.js";
import { canv, ctx } from "./drawing.js";

export default class WeaponSelectController {
    constructor(game){
        this.game = game;
        this.concluded = false;
    }

    nextFrame(){
        if(controls.pressed["KeyM"]){
            this.concluded = true;
        }
        if(this.concluded) return;

        ctx.textAlign = "center";
        ctx.font = "100px arial";
        ctx.fillStyle = '#fff';
        ctx.fillText("video game", canv.width/2,100);
    }
}