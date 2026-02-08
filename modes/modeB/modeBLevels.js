import { canv } from "../../drawing.js";
import playField from "../../playField.js";
import { CreateBgParticleAndWaitForRetirementTask, CreateMessageAndWaitTask, CreateMessageTask, CreateTrackedMessageTask, ExecuteFunctionTask, PerformTasksTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "../../tasks.js";
import CheckpointTask from "../../tasks/checkpointTask.js";
import { ShootTutorialTask } from "../../tutorial/shootTutorialTask.js";
import { SpecialTutorialTask } from "../../tutorial/specialTutorialTask.js";
import TimeSlowTutorialTask from "../../tutorial/timeSlowTutorialTask.js";
import { WasdTutorialTask } from "../../tutorial/wasdTutorialTask.js";

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

const level1 = [
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2,
        text: "Level 1",
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
        class: WeightedSpawnTask,
        delayCoeff: 20,
        enemies: [
            {
                shuffle: [
                    { name: "SmallSquare", weight: 1, num: 5 },
                    { name: "SmallTriangle", weight: 1, num: 5 },
                    { name: "SmallCircle", weight: 1, num: 5 },
                ]
            },
            {
                shuffle: [
                    { name: "SmallSquare", weight: 1, num: 5 },
                    { name: "SmallTriangle", weight: 1, num: 5 },
                    { name: "SmallCircle", weight: 1, num: 5 },
                    { name: "MultiSquare", weight: 2, num: 3 },
                    { name: "MultiTriangle", weight: 2, num: 3 },
                    { name: "MultiCircle", weight: 2, num: 3 },
                ]
            },
        ]
    },
    {
        class: WaitForConditionTask,
        condition: () => (playField.enemyWeight <= 3)
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 15,
        enemies: [
            { name: "SimpleShooter", weight: 3, num: 3 },
        ]
    },
    {
        class: WaitForConditionTask,
        condition: () => (playField.isDangerFree())
    },
    { class: CheckpointTask },
];

const level2 = [
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2,
        text: "Level 2",
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
        class: WeightedSpawnTask,
        delayCoeff: 15,
        enemies: [
            {
                shuffle: [
                    { name: "MultiSquare", weight: 2, num: 5 },
                    { name: "MultiTriangle", weight: 2, num: 5 },
                ]
            },
        ]
    },
    {
        class: WaitForConditionTask,
        condition: () => (playField.enemyWeight <= 2)
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 15,
        enemies: [
            { name: "SimpleShooter", weight: 3, num: 3 },
        ]
    },
    {
        class: WaitForConditionTask,
        condition: () => (playField.isDangerFree())
    },
    { class: CheckpointTask },
];

const modeBLevels = [
    tutorialPart1,
    tutorialPart2,
    level1,
    level2,
];

const modeBTasks = [
    {
        class: PerformTasksTask,
        tasks: modeBLevels[0],
    }
];

export default modeBLevels;
