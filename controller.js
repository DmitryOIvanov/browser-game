import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import playField from "./playField.js";
import DebugManager from "./modes/debug/debugEnemySpawning.js";
import ModeAController from "./modes/modeA/modeAController.js";
import ModeBController from "./modes/modeB/modeBController.js";

const modeAButton = new CanvasTextButton(canv.width/2,canv.height/2,"Untitled Mode A",60,new Color(false,"#fff"));
const modeBButton = new CanvasTextButton(canv.width/2,canv.height/2+80,"Untitled Mode B",60,new Color(false,"#fff"));
const debugModeButton = new CanvasTextButton(canv.width/2,canv.height/2+160,"Debug Mode",60,new Color(false,"#fff"));

const STATE_TITLE = 0;
const STATE_MODE_A = 1;
const STATE_MODE_B = 2;
const STATE_DEBUG = 3;

const controller = {
    initialize(){
        this.state = STATE_TITLE;
        this.subController = null;
        playField.initialize(null);
    },

    nextFrame(){
        fillScreen("black");
        if(this.state == STATE_TITLE){
            ctx.textAlign = "center";
            ctx.font = "100px arial";
            ctx.fillStyle = '#fff';
            ctx.fillText("video game", canv.width/2,canv.height/2-200);
            modeAButton.update();
            modeAButton.draw();
            modeBButton.update();
            modeBButton.draw();
            debugModeButton.update();
            debugModeButton.draw();
            if(controls.mouse.inBounds){
                drawDot(controls.mouse.x,controls.mouse.y)
            }

            if(modeAButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_MODE_A;
                this.subController = new ModeAController();
            }else if(modeBButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_MODE_B;
                this.subController = new ModeBController();
            }else if(debugModeButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_DEBUG;
                playField.initialize(new DebugManager());
            }
        }else if(this.state == STATE_MODE_A || this.state == STATE_MODE_B){
            if(controls.pressed["Escape"]){
                this.state = STATE_TITLE;
                return;
            }
            this.subController.nextFrame();
            if(this.subController.concluded) this.state = STATE_TITLE;
        }else if(this.state == STATE_DEBUG){
            if(controls.pressed["Escape"]){
                this.state = STATE_TITLE;
                return;
            }
            playField.advanceOneFrame();
            playField.redraw();
            if(playField.manager.concluded) this.state = STATE_TITLE;
        }
    }
}

export default controller;