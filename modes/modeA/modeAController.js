import controls from "../../controls.js";
import TaskBasedManager from "../../taskBasedManager.js";
import ModeAGame, { modeALevelList } from "./modeAGame.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import WeaponSelectController from "../../weaponSelectController.js";

// const STATE_NONE = 0;
const STATE_WEAPON_SELECT = 0;
const STATE_PLAYING = 1;
const STATE_END = 2;

export default class ModeAController {
    constructor(){
        this.concluded = false;
        this.game = new ModeAGame();
        this.subController = null;

        this.startWeaponSelect();
    }

    nextFrame(){
        if(this.concluded) return;
        if(this.state == STATE_WEAPON_SELECT){
            this.subController.nextFrame();
            if(this.subController.concluded){
                this.startPlay();
            }
        }else if(this.state == STATE_PLAYING){
            playField.advanceOneFrame();
            if(playField.manager.concluded){
                if(playField.manager.playerLost){
                    this.startEndScreen("Game Over");
                }else{
                    this.game.level++;
                    if(this.game.level >= modeALevelList.length){
                        this.startEndScreen("You Win");
                    }else{
                        this.startWeaponSelect(); 
                    }
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

    startWeaponSelect(){
        this.state = STATE_WEAPON_SELECT;
        this.subController = new WeaponSelectController(this.game);
    }

    startPlay(){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize(new TaskBasedManager(this.game));
    }

    startEndScreen(message){
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_END;
        this.subController = new SimpleMessageScreen(message);
    }
}