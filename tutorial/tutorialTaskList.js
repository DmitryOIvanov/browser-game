import { canv } from "../drawing.js";
import playField from "../playField.js";
import { CreateBgParticleAndWaitForRetirementTask, CreateMessageTask, ExecuteFunctionTask, WaitTimeTask, WeightedSpawnTask } from "../tasks.js";
import CheckpointTask from "../tasks/checkpointTask.js";
import { ShootTutorialTask } from "./shootTutorialTask.js";
import { SpecialTutorialTask } from "./specialTutorialTask.js";
import TimeSlowTutorialTask from "./timeSlowTutorialTask.js";
import { WasdTutorialTask } from "./wasdTutorialTask.js";

const tutorialPart1 = [
    {
        class: ExecuteFunctionTask,
        function: () => {
            playField.player.weapon.disableSecondary();
        }
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: WasdTutorialTask
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: ShootTutorialTask
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 - 200,
        text: "Defeat all Enemies",
        fontSizePx: 60,
        fadeInTime: 30,
        showTime: 210,
        fadeOutTime: 180,
        opacity: 0.6,
    },
    {
        class: WaitTimeTask,
        time: 90
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 + 200,
        text: "5 Hits and You're Out",
        fontSizePx: 50,
        fadeInTime: 30,
        showTime: 120,
        fadeOutTime: 180,
        opacity: 0.6,
    },
    {
        class: WaitTimeTask,
        time: 90
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 30,
        enemies: [
            { name: "SmallSquare", weight: 1, num: 3 },
            { name: "SmallTriangle", weight: 1, num: 3 },
            { name: "SmallCircle", weight: 1.2, num: 3 },
        ]
    },
    { class: CheckpointTask },
];

const tutorialPart2 = [
    {
        class: ExecuteFunctionTask,
        function: () => {
            playField.player.weapon.enableSecondary();
        }
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: SpecialTutorialTask
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: TimeSlowTutorialTask
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 - 200,
        text: "Try out Your New Abilities",
        fontSizePx: 60,
        fadeInTime: 30,
        showTime: 120,
        fadeOutTime: 180,
        opacity: 0.6,
    },
    {
        class: WaitTimeTask,
        time: 60
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 30,
        enemies: [
            {
                shuffle: [
                    { name: "SmallSquare", weight: 1, num: 3 },
                    { name: "SmallTriangle", weight: 1, num: 3 },
                    { name: "SmallCircle", weight: 1, num: 3 },
                ]
            },
            {
                shuffle: [
                    { name: "SmallSquare", weight: 1, num: 3 },
                    { name: "SmallTriangle", weight: 1, num: 3 },
                    { name: "SmallCircle", weight: 1, num: 3 },
                    { name: "MultiSquare", weight: 2, num: 2 },
                    { name: "MultiTriangle", weight: 2, num: 2 },
                    { name: "MultiCircle", weight: 2, num: 1 },
                ]
            }
        ]
    },
    { class: CheckpointTask },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 - 200,
        text: "Tutorial Complete",
        fontSizePx: 60,
        fadeInTime: 30,
        showTime: 210,
        fadeOutTime: 45,
        opacity: 0.6,
    },
    {
        class: WaitTimeTask,
        time: 90
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 + 200,
        text: "Good Luck",
        fontSizePx: 50,
        fadeInTime: 30,
        showTime: 120,
        fadeOutTime: 45,
        opacity: 0.6,
    },
    {
        class: WaitTimeTask,
        time: 195
    },
];

export const TUTORIAL_TASK_LIST = [
    tutorialPart1,
    tutorialPart2,
];
