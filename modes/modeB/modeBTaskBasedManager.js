import controls from "../../controls.js";
import playField from "../../playField.js";
import TaskBasedManager from "../../taskBasedManager.js";
import { DualWeapon, stockHeavyComponents, stockLightComponents } from "../../weapons/dualWeapons.js";
import modeBTasks from "./modeBTasks.js";

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

export default class ModeBTaskBasedManager extends TaskBasedManager{
    constructor(){
        super(modeBTasks);

        this.lightIndex = 0;
        this.heavyIndex = 0;
    }

    onPlayfieldInit(){
        this.updateWeapon();
    }

    timeStep(dt){
        super.timeStep(dt);
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