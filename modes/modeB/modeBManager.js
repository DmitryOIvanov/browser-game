import controls from "../../controls.js";
import playField from "../../playField.js";
import { TaskPerformer } from "../../taskBasedManager.js";
import { DualWeapon, stockHeavyComponents, stockLightComponents } from "../../weapons/dualWeapons.js";
import modeBLevels from "./modeBLevels.js";

export const lightWeaponClasses = [
    stockLightComponents.MachineGun,
    stockLightComponents.Spread,
    stockLightComponents.Heavy,
    stockLightComponents.Splitter,
];

export const heavyWeaponClasses = [
    stockHeavyComponents.Volley,
    stockHeavyComponents.Wave,
    stockHeavyComponents.Buster,
    stockHeavyComponents.Firework,
];

export default class ModeBManager {
    constructor(level){
        this.level = level;
        this.concluded = false;
        this.performer = new TaskPerformer(modeBLevels[this.level]);
        this.lightIndex = 0;
        this.heavyIndex = 0;
    }

    onPlayfieldInit(){
        this.updateWeapon();
    }

    onPlayerHit(){
        if(playField.player.hp <= 0){
            this.concluded = true;
            return;
        }
    }

    timeStep(dt){
        if(this.concluded) return;
        this.performer.timeStep(dt);
        if(this.performer.concluded){
            this.level++;
            if(this.level == modeBLevels.length){
                this.concluded = true;
                return;
            }else{
                this.performer = new TaskPerformer(modeBLevels[this.level]);
            }
        }

        if(controls.pressed["KeyE"]){
            this.lightIndex = (this.lightIndex+1)%lightWeaponClasses.length;
            this.updateWeapon();
        }
        if(controls.pressed["KeyQ"]){
            this.heavyIndex = (this.heavyIndex+1)%heavyWeaponClasses.length;
            this.updateWeapon();
        }
    }

    updateWeapon(){
        playField.player.weapon = new DualWeapon(
            new lightWeaponClasses[this.lightIndex](),
            new heavyWeaponClasses[this.heavyIndex]()
        );
    }
}