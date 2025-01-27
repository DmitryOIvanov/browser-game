import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import playField from "./playField.js";
import EnemyRoundManager from "./enemyRoundManager.js";
import DebugEnemySpawning from "./debugEnemySpawning.js";

const modeAButton = new CanvasTextButton(canv.width/2,canv.height/2+100,"Untitled Mode A",60,new Color(false,"#fff"));
const debugModeButton = new CanvasTextButton(canv.width/2,canv.height/2+180,"Debug Mode",60,new Color(false,"#fff"));

const STATE_TITLE = 0;
const STATE_GAME = 1;

const controller = {
    initialize(){
        this.state = STATE_TITLE;
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

            if(modeAButton.isPressed() || debugModeButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_GAME;
                if(modeAButton.isPressed()){
                    playField.initialize(new EnemyRoundManager());
                }else{
                    playField.initialize(new DebugEnemySpawning());
                }
            }
        }
        if(this.state == STATE_GAME){
            playField.advanceOneFrame();
            playField.redraw();
            if(playField.manager.concluded) this.state = STATE_TITLE;
        }
    }
}

export default controller;