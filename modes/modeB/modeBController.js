import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import ModeBManager from "./modeBManager.js";
import SimpleOptionScreen from "../../simpleOptionScreen.js";
import modeBLevels from "./modeBLevels.js";

const STATE_WEAPON_SELECT = 0;
const STATE_PLAYING = 1;
const STATE_LOSE = 2;
const STATE_END = 3;

export default class ModeBController {
    constructor(){
        this.concluded = false;
        this.subController = null;

        this.levelReached = 0;
        this.startPlay();
    }

    nextFrame(){
        if(this.concluded) return;
        if(this.state == STATE_PLAYING){
            playField.advanceOneFrame();
            if(playField.manager.concluded){
                this.levelReached = playField.manager.level
                if(this.levelReached == modeBLevels.length){
                    this.startEndScreen();
                }else{
                    this.startLoseScreen();
                }
            }else{
                playField.redraw();
            }
        }else if(this.state == STATE_LOSE){
            this.subController.nextFrame();
            if(this.subController.concluded){
                if(this.subController.result == 0){
                    this.startPlay();
                }else{
                    this.concluded = true;
                }
            }
        }else if(this.state == STATE_END){
            this.subController.nextFrame();
            if(this.subController.concluded){
                this.concluded = true;
            }
        }
    }

    startPlay(){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize(new ModeBManager(this.levelReached));
    }

    startLoseScreen(){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_LOSE;
        this.subController = new SimpleOptionScreen("Game Over", ["Retry", "Quit"]);
    }

    startEndScreen(){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_END;
        this.subController = new SimpleMessageScreen("You Win");
    }
}