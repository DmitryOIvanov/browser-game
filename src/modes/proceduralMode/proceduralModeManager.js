import controls from "../../controls.js";
import { canv } from "../../drawing.js";
import playField from "../../playField.js";
import { TaskPerformer } from "../../taskBasedManager.js";
import { CreateMessageTask, WaitTimeTask, WeightedSpawnTask, WaitForConditionTask } from "../../tasks.js";
import CheckpointTask from "../../tasks/checkpointTask.js";
import { TUTORIAL_TASK_LIST } from "../../tutorial/tutorialTaskList.js";
import { DualWeapon } from "../../weapons/dualWeapons.js";
import { ProceduralWeightedSpawnTask } from "./proceduralLevelGeneration.js";
import { proceduralModeHeavyComponents, proceduralModeLightComponents } from "./proceduralModeStartScreen.js";

const DEBUG_WEAPON_SWITCH = false;

function getLevelTaskList(level, rng) {
    if (level >= 0) {
        return [
            {
                class: CreateMessageTask,
                centerX: canv.width / 2,
                centerY: canv.height / 2,
                text: `Level ${level + 1}`,
                fontSizePx: 280,
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
    constructor(isTutorial, level, lightIndex, heavyIndex, rng = null) {
        this.isTutorial = isTutorial;
        this.level = level;
        this.rng = rng;
        this.lastMilestoneRng = rng ? rng.clone() : null;
        this.concluded = false;
        this.performer = null;
        if (isTutorial) {
            this.performer = new TaskPerformer(TUTORIAL_TASK_LIST[level]);
        } else {
            this.performer = new TaskPerformer(getLevelTaskList(level, rng));
        }
        this.lightIndex = lightIndex;
        this.heavyIndex = heavyIndex;
        this.tutorialComplete = false;
    }

    onPlayfieldInit() {
        this.updateWeapon();
    }

    onPlayerHit() { }

    timestep(dt) {
        if (this.concluded) return;

        const player = playField.player;
        if (player.hp > 0) {
            this.performer.timestep(dt);
            if (this.performer.concluded) {
                this.level++;
                if (this.isTutorial) {
                    if (this.level >= TUTORIAL_TASK_LIST.length) {
                        this.tutorialComplete = true;
                        this.concluded = true;
                    } else {
                        this.performer = new TaskPerformer(TUTORIAL_TASK_LIST[this.level]);
                    }
                } else {
                    this.lastMilestoneRng = this.rng.clone();
                    this.performer = new TaskPerformer(getLevelTaskList(this.level, this.rng));
                }
            }
        } else {
            if (player.deathFinished) {
                this.concluded = true;
                return;
            }
        }

        if (DEBUG_WEAPON_SWITCH) {
            if (controls.pressed["KeyE"]) {
                this.lightIndex = (this.lightIndex + 1) % proceduralModeLightComponents.length;
                this.updateWeapon();
            }
            if (controls.pressed["KeyQ"]) {
                this.heavyIndex = (this.heavyIndex + 1) % proceduralModeHeavyComponents.length;
                this.updateWeapon();
            }
        }
    }

    updateWeapon() {
        playField.player.weapon = new DualWeapon(
            new proceduralModeLightComponents[this.lightIndex].class(),
            new proceduralModeHeavyComponents[this.heavyIndex].class()
        );
    }
}
