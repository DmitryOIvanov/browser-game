import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import playField from "./playField.js";
import EnemyRoundManager from "./enemyRoundManager.js";
import DebugEnemySpawning from "./debugEnemySpawning.js";

const startButton = new CanvasTextButton(canv.width/2,canv.height/2+100,"click to play",60,new Color(false,"#fff"));

const controller = {
    initialize(){
        this.state = "TITLE";
        playField.initialize(null);
    },

    nextFrame(){
        fillScreen("black");
        if(this.state == "TITLE"){
            ctx.textAlign = "center";
            ctx.font = "100px arial";
            ctx.fillStyle = '#fff';
            ctx.fillText("video game", canv.width/2,canv.height/2-100);
            startButton.update();
            startButton.draw();
            if(controls.mouse.inBounds){
                drawDot(controls.mouse.x,controls.mouse.y)
            }

            if(startButton.isPressed()){
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = "GAME";
                playField.initialize(new DebugEnemySpawning());
                // playField.initialize(new EnemyRoundManager());
            }
        }
        if(this.state == "GAME"){
            playField.advanceOneFrame();
            playField.redraw();
            if(playField.manager.concluded) this.state = "TITLE"
        }
    }
}

export default controller;