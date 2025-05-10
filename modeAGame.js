import { createAttackProfile } from "./attackAndDefense.js";
import Color from "./color.js";
import { canv } from "./drawing.js";
import playField from "./playField.js";
import { BallPProjWeapon } from "./weapons/ballProjWeapons.js";
import { MemeWeapon2 } from "./weapons/fireworkWeapons.js";
import { MachineGunWeapon, MemeWeapon1, PointPProjWeapon, ShotgunWeapon } from "./weapons/pointProjWeapons.js";
import { CreateStaticBgParticleTask, CreateStaticMessageTask, DeleteStaticBgParticleTask, DeleteStaticMessageTask, MessageTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "./tasks.js";
import BgMessage, { StaticBGMessage } from "./bgMessage.js";
import { WasdSymbol } from "./tutorialParticles.js";

export default class ModeAGame {
    constructor(){
        this.level = 0;
        this.weaponGenerator = null;
    }
}

const level1 = {
    weapons: [
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
            name: "Heavy",
            generator: ()=>(new BallPProjWeapon(
                30, // fireRate
                1, // numShots
                0, // spread
                0, // variance
                10, // speed
                12, // radius
                -1, // duration (Negative: infinite)
                0, // bounces (Negative: infinite)
                new Color(false,'#f0f'), // color
                () => (createAttackProfile(
                    5, // Damage
                    3, // Overkill factor
                    0 // Free hits where bullet is unaffected
                ))
            ))
        },{
            name: "Meme 1",
            generator: ()=>(new MemeWeapon1())
        },{
            name: "Meme 2",
            generator: ()=>(new MemeWeapon2())
        }
    ], tasks: [
        {
            class: CreateStaticBgParticleTask,
            particleClass: WasdSymbol,
            id: "TUT_WASD"
        },{
            class: CreateStaticBgParticleTask,
            particleClass: StaticBGMessage,
            centerX: canv.width/2,
            centerY: canv.height/2+100,
            text: "Test",
            fontSizePx: 100,
            id: "MSG_TEST"
        },{
            class: MessageTask,
            centerX: canv.width/2,
            centerY: canv.height/2-200,
            text: "Level 1",
            fontSizePx: 100,
            duration: 60
        },{
            class: WaitTimeTask,
            time: 30
        },{
            class: WeightedSpawnTask,
            delayCoeff: 20,
            enemies:[
                {name:"SmallSquare",weight:1,num:5},
                {name:"SmallCircle",weight:1,num:3},
                {name:"SmallTriangle",weight:1,num:5},
            ]
        },{
            class: DeleteStaticBgParticleTask,
            id: "MSG_TEST"
        },{
            class: WaitForConditionTask,
            condition: ()=>(playField.enemyWeight <= 1)
        },{
            class: WeightedSpawnTask,
            delayCoeff: 15,
            enemies:[
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:5},
                    {name:"SmallTriangle",weight:1,num:5},
                    {name:"SmallCircle",weight:1,num:5},
                ]},
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:5},
                    {name:"SmallTriangle",weight:1,num:5},
                    {name:"SmallCircle",weight:1,num:3},
                    {name:"MultiSquare",weight:2,num:2},
                    {name:"MultiTriangle",weight:2,num:2},
                    {name:"MultiCircle",weight:2,num:1},
                ]}
            ]
        },{
            class: WaitForConditionTask,
            condition: ()=>(playField.enemyWeight <= 1)
        },{
            class: WeightedSpawnTask,
            delayCoeff: 30,
            enemies:[
                {name:"SimpleShooter",weight:1,num:3},
            ]
        },{
            class: WaitForConditionTask,
            condition: ()=>(playField.isDangerFree())
        },{
            class: WaitTimeTask,
            time: 60
        }
    ]
};

const level2 = {
    weapons: [
        {
            name: "Machine Gun II",
            generator: ()=>(new PointPProjWeapon(
                3, // Fire Rate
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
            name: "Shotgun II",
            generator: ()=>(new PointPProjWeapon(
                23, // Fire Rate
                7, // Number of bullets
                0.15, // Fixed spread between bullets
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
            name: "Heavy II",
            generator: ()=>(new BallPProjWeapon(
                60, // fireRate
                1, // numShots
                0, // spread
                0, // variance
                10, // speed
                16, // radius
                -1, // duration (Negative: infinite)
                0, // bounces (Negative: infinite)
                new Color(false,'#f0f'), // color
                () => (createAttackProfile(
                    15, // Damage
                    1, // Overkill factor
                    0 // Free hits where bullet is unaffected
                ))
            ))
        },{
            name: "Meme 1",
            generator: ()=>(new MemeWeapon1())
        },{
            name: "Meme 2",
            generator: ()=>(new MemeWeapon2())
        }
    ], tasks: [
        {
            class: MessageTask,
            centerX: canv.width/2,
            centerY: canv.height/2-200,
            text: "Level 2",
            fontSizePx: 100,
            duration: 60
        },{
            class: WaitTimeTask,
            time: 30
        },{
            class: WeightedSpawnTask,
            delayCoeff: 6,
            enemies:[
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:6},
                    {name:"SmallTriangle",weight:1,num:6},
                    {name:"SmallCircle",weight:1,num:6},
                    {name:"MultiSquare",weight:3,num:2},
                    {name:"MultiTriangle",weight:3,num:2},
                    {name:"MultiCircle",weight:3,num:1},
                ]},
                {shuffle:[
                    {name:"SmallSquare",weight:1,num:3},
                    {name:"SmallTriangle",weight:1,num:3},
                    {name:"SmallCircle",weight:1,num:3},
                    {name:"MultiSquare",weight:3,num:1},
                    {name:"MultiTriangle",weight:3,num:1},
                    {name:"MultiCircle",weight:3,num:1},
                    {name:"SimpleShooter",weight:2,num:3},
                ]},
                {shuffle:[
                    {name:"MultiSquare",weight:1,num:3},
                    {name:"SimpleShooter",weight:2,num:3},
                    {name:"ThreeShooter",weight:3,num:1},
                ]},
            ]
        },{
            class: WaitForConditionTask,
            condition: ()=>(playField.enemyWeight <= 3)
        },{
            class: WeightedSpawnTask,
            delayCoeff: 4,
            enemies:[
                {name:"SmallTriangle",weight:1,num:30},
            ]
        },{
            class: WaitForConditionTask,
            condition: ()=>(playField.isDangerFree())
        },{
            class: WaitTimeTask,
            time: 60
        }
    ]
};

export const modeALevelList = [
    level1,
    level2,
]