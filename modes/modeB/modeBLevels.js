import { canv } from "../../drawing.js";
import playField from "../../playField.js";
import { CreateBgParticleAndWaitForRetirementTask, CreateMessageAndWaitTask, CreateMessageTask, CreateTrackedMessageTask, PerformTasksTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "../../tasks.js";
import CheckpointTask from "../../tasks/checkpointTask.js";
import { ShootTutorialTask } from "../../tutorial/shootTutorialTask.js";
import { SpecialTutorialTask } from "../../tutorial/specialTutorialTask.js";
import TimeSlowTutorialTask from "../../tutorial/timeSlowTutorialTask.js";
import { WasdTutorialTask } from "../../tutorial/wasdTutorialTask.js";

const tutorial = [
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
        delayCoeff: 20,
        enemies: [
            { name: "SmallSquare", weight: 1, num: 8 },
            { name: "SmallTriangle", weight: 1, num: 8 },
            { name: "SmallCircle", weight: 1, num: 5 },
        ]
    },
    { class: CheckpointTask },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: TimeSlowTutorialTask
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: SpecialTutorialTask
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
        delayCoeff: 20,
        enemies: [
            { name: "SmallSquare", weight: 1, num: 8 },
            { name: "SmallTriangle", weight: 1, num: 8 },
            { name: "SmallCircle", weight: 1, num: 5 },
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
        class: WeightedSpawnTask,
        delayCoeff: 15,
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
                    { name: "SmallCircle", weight: 1, num: 3 },
                    { name: "MultiSquare", weight: 2, num: 2 },
                    { name: "MultiTriangle", weight: 2, num: 2 },
                    { name: "MultiCircle", weight: 2, num: 1 },
                ]
            }
        ]
    }, {
        class: WaitForConditionTask,
        condition: () => (playField.isDangerFree())
    }, {
        class: WaitTimeTask,
        time: 30
    }
];

const level2 = [
    {
        class: WeightedSpawnTask,
        delayCoeff: 1,
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
                    { name: "SmallCircle", weight: 1, num: 3 },
                    { name: "MultiSquare", weight: 2, num: 2 },
                    { name: "MultiTriangle", weight: 2, num: 2 },
                    { name: "MultiCircle", weight: 2, num: 1 },
                ]
            }
        ]
    }, {
        class: WaitForConditionTask,
        condition: () => (playField.isDangerFree())
    }, {
        class: WaitTimeTask,
        time: 30
    }
];

const modeBLevels = [
    tutorial,
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
