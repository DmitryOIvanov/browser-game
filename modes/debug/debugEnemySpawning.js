import { createAttackProfile } from "../../attackAndDefense.js";
import Color from "../../color.js";
import controls from "../../controls.js";
import { enemySpawningInfo, getRandomPosWithMargins } from "../../enemySpawning.js";
import BigExplosionParticle from "../../particles/bigExplosionParticle.js";
import playField from "../../playField.js";
import { BouncyWeapon, MemeWeapon3 } from "../../weapons/ballProjWeapons.js";
import { DualWeapon, DummyDualWeaponComponent, stockHeavyComponents, stockLightComponents } from "../../weapons/dualWeapons.js";
import { FireworkWeapon, MemeWeapon2 } from "../../weapons/fireworkWeapons.js";
import { MachineGunWeapon, MemeWeapon1, PierceWeapon, ShotgunWeapon } from "../../weapons/pointProjWeapons.js";

const specificSpawnInfo = [
    {
        name: "SmallSquare",
        probWeight: 200,
        cooldown: 30
    }, {
        name: "SmallCircle",
        probWeight: 200,
        cooldown: 30
    }, {
        name: "SmallTriangle",
        probWeight: 200,
        cooldown: 30
    }, {
        name: "MultiSquare",
        probWeight: 50,
        cooldown: 120
    }, {
        name: "MultiCircle",
        probWeight: 50,
        cooldown: 120
    }, {
        name: "MultiTriangle",
        probWeight: 50,
        cooldown: 120
    }, {
        name: "ShieldedCircle",
        probWeight: 25,
        cooldown: 180
    }, {
        name: "SimpleShooter",
        probWeight: 80,
        cooldown: 60
    }, {
        name: "BombEnemy",
        probWeight: 30,
        cooldown: 60
    }, {
        name: "LaserShooter",
        probWeight: 50,
        cooldown: 60
    }, {
        name: "ThreeShooter",
        probWeight: 20,
        cooldown: 120
    }, {
        name: "FlowerTower",
        probWeight: 10,
        cooldown: 300
    }, {
        name: "HeavyTower",
        probWeight: 10,
        cooldown: 300
    }, {
        name: "LaserTower",
        probWeight: 10,
        cooldown: 300
    }, {
        name: "Lurcher",
        probWeight: 200,
        cooldown: 60
    }, {
        name: "Snake",
        probWeight: 30,
        cooldown: 600
    }, {
        name: "RingShooter",
        probWeight: 30,
        cooldown: 200
    }, {
        name: "WallBurstShooter",
        probWeight: 30,
        cooldown: 200
    }
];

const WEIGHT_SUM = specificSpawnInfo.reduce((curSum, nextEntry) => (curSum + nextEntry.probWeight), 0);
const PLAYER_CLEARANCE = 300;

const weaponGenerators = [
    // ()=>(new MachineGunWeapon()),
    // ()=>(new ShotgunWeapon()),
    // ()=>(new PierceWeapon()),
    // ()=>(new BouncyWeapon()),
    // ()=>(new FireworkWeapon()),
    // ()=>(new MemeWeapon1()),
    // ()=>(new MemeWeapon2()),
    // ()=>(new MemeWeapon3()),
    () => (new DualWeapon(
        new stockLightComponents.MachineGun(),
        new stockHeavyComponents.Volley()
    )),
    () => (new DualWeapon(
        new stockLightComponents.Spread(),
        new stockHeavyComponents.Wave()
    )),
    () => (new DualWeapon(
        new stockLightComponents.Heavy(),
        new stockHeavyComponents.Buster()
    )),
    () => (new DualWeapon(
        new stockLightComponents.Splitter(),
        new stockHeavyComponents.Firework()
    )),
];

export default class DebugManager {
    constructor() {
        this.concluded = false;
        this.spawnTimer = 0;
        this.doSpawns = true;
        this.weaponIndex = 0;
    }

    onPlayfieldInit() {
        playField.player.weapon = weaponGenerators[this.weaponIndex]();
    }

    onPlayerHit() { }

    timeStep(amount) {
        if (controls.pressed["KeyP"]) {
            playField.addParticle(new BigExplosionParticle(640, 360, Color.WHITE));
        }
        if (controls.pressed["KeyO"]) this.doSpawns = !this.doSpawns;

        // Switch weapons
        if (controls.pressed["KeyE"]) {
            this.weaponIndex = (this.weaponIndex + 1) % weaponGenerators.length;
            playField.player.weapon = weaponGenerators[this.weaponIndex]();
        }


        if (this.doSpawns) {
            this.spawnTimer -= amount;
            while (this.spawnTimer <= 0) {
                const randNum = WEIGHT_SUM * Math.random();
                let curProbSum = 0;
                for (let entry of specificSpawnInfo) {
                    curProbSum += entry.probWeight;
                    if (randNum < curProbSum) {
                        const generalInfo = enemySpawningInfo[entry.name];
                        const pos = getRandomPosWithMargins(generalInfo.rad, PLAYER_CLEARANCE);
                        generalInfo.spawn(0, pos.x, pos.y);
                        this.spawnTimer += entry.cooldown;
                        break;
                    }
                }
            }
        }
    }
}
