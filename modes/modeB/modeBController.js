import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import ModeBTaskBasedManager from "./modeBTaskBasedManager.js";

const STATE_WEAPON_SELECT = 0;
const STATE_PLAYING = 1;
const STATE_END = 2;

export default class ModeBController {
    constructor(){
        this.concluded = false;
        this.subController = null;

        this.startPlay();
    }

    nextFrame(){
        if(this.concluded) return;
        if(this.state == STATE_PLAYING){
            playField.advanceOneFrame();
            if(playField.manager.concluded){
                if(playField.manager.playerLost){
                    this.startEndScreen("Game Over");
                }else{
                    this.startEndScreen("You Win");
                }
            }else{
                playField.redraw();
            }
        }else if(this.state == STATE_END){
            this.subController.nextFrame();
            if(this.subController.concluded){
                this.concluded = true;
                return;
            }
        }
    }

    startPlay(){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize(new ModeBTaskBasedManager(this.game));
    }

    startEndScreen(message){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_END;
        this.subController = new SimpleMessageScreen(message);
    }
}