import { createAttackProfile } from "./attackAndDefense.js";
import Color from "./color.js";
import { canv } from "./drawing.js";
import playField from "./playField.js";
import { MemeWeapon2 } from "./weapons/fireworkWeapons.js";
import { MachineGunWeapon, MemeWeapon1, PointPProjWeapon, ShotgunWeapon } from "./weapons/pointProjWeapons.js";

export default class ModeAGame {
    constructor(){
        this.level = 0;
        this.weaponGenerator = null;
    }
}

export const modeAWeaponList = [
    [
        {
            name: "Machine Gun",
            generator: ()=>(new PointPProjWeapon(
                5, // Fire Rate
                1, // Number of bullets
                0, // Fixed spread between bullets
                0.02, // Random variance in each bullet's angle
                20, // Bullet speed
                new Color(false,'#0ff'), // Color
                ()=>(createAttackProfile(
                    1, // Damage
                    3, // Overkill factor
                    0 // Free hits where bullet is unaffected
                ))
            ))
        },{
            name: "Shotgun",
            generator: ()=>(new PointPProjWeapon(
                25, // Fire Rate
                5, // Number of bullets
                0.18, // Fixed spread between bullets
                0, // Random variance in each bullet's angle
                20, // Bullet speed
                new Color(false,'#ff0'), // Color
                ()=>(createAttackProfile(
                    1, // Damage
                    3, // Overkill factor
                    0 // Free hits where bullet is unaffected
                ))
            ))
        },{
            name: "Meme 1",
            generator: ()=>(new MemeWeapon1())
        }
    ],[
        {
            name: "Meme 1",
            generator: ()=>(new MemeWeapon1())
        },{
            name: "Meme 2",
            generator: ()=>(new MemeWeapon2())
        }
    ]
];

export const modeALevelList = [
    [
        {
            taskName: "MessageTask",
            centerX: canv.width/2,
            centerY: canv.height/2-200,
            text: "Level 1",
            fontSizePx: 100,
            duration: 60
        },{
            taskName: "WaitTimeTask",
            time: 30
        },{
            taskName: "WeightedSpawnTask",
            delayCoeff: 20,
            enemies:[
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:10},
                    {name:"MultiSquare",weight:2,num:2},
                ]}
            ]
        },{
            taskName: "WaitForConditionTask",
            condition: ()=>(playField.isDangerFree())
        },{
            taskName: "WeightedSpawnTask",
            delayCoeff: 20,
            enemies:[
                {shuffle:[
                    {name:"SmallTriangle",weight:1,num:10},
                    {name:"MultiTriangle",weight:2,num:2},
                ]}
            ]
        },{
            taskName: "WaitForConditionTask",
            condition: ()=>(playField.isDangerFree())
        },{
            taskName: "WeightedSpawnTask",
            delayCoeff: 20,
            enemies:[
                {shuffle:[
                    {name:"SmallCircle",weight:1,num:10},
                    {name:"MultiCircle",weight:2,num:2},
                ]}
            ]
        },{
            taskName: "WaitForConditionTask",
            condition: ()=>(playField.isDangerFree())
        },{
            taskName: "WaitTimeTask",
            time: 60
        }
    ],[
        {
            taskName: "WaitTimeTask",
            time: 60
        },{
            taskName: "WeightedSpawnTask",
            delayCoeff: 1,
            enemies:[
                {name:"MultiTriangle",weight:1,num:50}
            ]
        },{
            taskName: "WaitForConditionTask",
            condition: ()=>(playField.isDangerFree())
        },{
            taskName: "WaitTimeTask",
            time: 60
        }
    ]
]