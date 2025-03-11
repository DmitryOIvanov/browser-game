import playField from "./playField.js";
import { MemeWeapon2 } from "./weapons/fireworkWeapons.js";
import { MachineGunWeapon, MemeWeapon1, ShotgunWeapon } from "./weapons/pointProjWeapons.js";

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
            generator: ()=>(new MachineGunWeapon())
        },{
            name: "Shotgun",
            generator: ()=>(new ShotgunWeapon())
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
            taskName: "WaitTimeTask",
            time: 60
        },{
            taskName: "WeightedSpawnTask",
            delayCoeff: 1,
            enemies:[
                {name:"MultiCircle",weight:3,num:5},
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:20},
                    {name:"SmallTriangle",weight:1,num:20},
                    {name:"SmallCircle",weight:1,num:20},
                    {name:"SimpleShooter",weight:2,num:10},
                ]}
            ]
        },{
            taskName: "WaitForConditionTask",
            condition: ()=>(playField.isDangerFree())
        },{
            taskName: "WeightedSpawnTask",
            pool: "A",
            delayCoeff: 1,
            enemies:[
                {name:"MultiSquare",weight:1,num:20}
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
            pool: "A",
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