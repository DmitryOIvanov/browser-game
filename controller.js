import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import playField from "./playField.js";
import TaskBasedManager from "./taskBasedManager.js";
import DebugManager from "./debugEnemySpawning.js";
import ModeAController from "./modeAController.js";

const modeAButton = new CanvasTextButton(canv.width/2,canv.height/2+100,"Untitled Mode A",60,new Color(false,"#fff"));
const debugModeButton = new CanvasTextButton(canv.width/2,canv.height/2+180,"Debug Mode",60,new Color(false,"#fff"));

const STATE_TITLE = 0;
const STATE_MODE_A = 1;
const STATE_DEBUG = 2;

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
            ctx.fillText("video game", canv.width/2,canv.height/2-100);
            modeAButton.update();
            modeAButton.draw();
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
            }else if(debugModeButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_DEBUG;
                playField.initialize(new DebugManager());
            }
        }else if(this.state == STATE_MODE_A){
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