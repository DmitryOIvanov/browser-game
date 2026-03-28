import controls from "../../controls.js";
import { canv } from "../../drawing.js";
import playField from "../../playField.js";
import { TaskPerformer } from "../../taskBasedManager.js";
import { CreateMessageTask, WaitTimeTask, WeightedSpawnTask, WaitForConditionTask } from "../../tasks.js";
import CheckpointTask from "../../tasks/checkpointTask.js";
import { TUTORIAL_TASK_LIST } from "../../tutorial/tutorialTaskList.js";
import { DualWeapon, stockHeavyComponents, stockLightComponents } from "../../weapons/dualWeapons.js";
import { ProceduralWeightedSpawnTask } from "./proceduralLevelGeneration.js";

export const lightWeaponClasses = [
    stockLightComponents.MachineGun,
    stockLightComponents.Spread,
    // stockLightComponents.Heavy,
    stockLightComponents.Splitter,
];

export const heavyWeaponClasses = [
    stockHeavyComponents.Volley,
    stockHeavyComponents.Wave,
    // stockHeavyComponents.Buster,
    stockHeavyComponents.Firework,
];

function getLevelTaskList(level, rng) {
    if (level >= 0) {
        return [
            {
                class: CreateMessageTask,
                centerX: canv.width / 2,
                centerY: canv.height / 2,
                text: `Level ${level + 1}`,
                fontSizePx: 320,
                fadeInTime: 20,
                showTime: 60,
                fadeOutTime: 20,
                opacity: 0.3,
            },
            {
                class: WaitTimeTask,
                time: 100
            },
            {
                class: ProceduralWeightedSpawnTask,
                rng: rng,
                level: level,
            },
            { class: CheckpointTask },
        ];
    } else {
        return TUTORIAL_TASK_LIST[level + 2];
    }
}

export default class ProceduralModeManager {
    constructor(level, rng) {
        this.level = level;
        this.rng = rng;
        this.lastMilestoneRng = rng.clone();
        this.concluded = false;
        this.performer = new TaskPerformer(getLevelTaskList(level, rng));
        this.lightIndex = 0;
        this.heavyIndex = 0;
    }

    onPlayfieldInit() {
        this.updateWeapon();
    }

    onPlayerHit() { }

    timeStep(dt) {
        if (this.concluded) return;

        const player = playField.player;
        if (player.hp > 0) {
            this.performer.timeStep(dt);
            if (this.performer.concluded) {
                this.level++;
                this.lastMilestoneRng = this.rng.clone();

                this.performer = new TaskPerformer(getLevelTaskList(this.level, this.rng));
            }
        } else {
            if (player.deathFinished) {
                this.concluded = true;
                return;
            }
        }

        if (controls.pressed["KeyE"]) {
            this.lightIndex = (this.lightIndex + 1) % lightWeaponClasses.length;
            this.updateWeapon();
        }
        if (controls.pressed["KeyQ"]) {
            this.heavyIndex = (this.heavyIndex + 1) % heavyWeaponClasses.length;
            this.updateWeapon();
        }
    }

    updateWeapon() {
        playField.player.weapon = new DualWeapon(
            new lightWeaponClasses[this.lightIndex](),
            new heavyWeaponClasses[this.heavyIndex]()
        );
    }
}
