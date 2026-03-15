import { canv } from "../../drawing.js";
import playField from "../../playField.js";
import { CreateBgParticleAndWaitForRetirementTask, CreateMessageAndWaitTask, CreateMessageTask, CreateTrackedMessageTask, ExecuteFunctionTask, PerformTasksTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "../../tasks.js";
import CheckpointTask from "../../tasks/checkpointTask.js";
import { ShootTutorialTask } from "../../tutorial/shootTutorialTask.js";
import { SpecialTutorialTask } from "../../tutorial/specialTutorialTask.js";
import TimeSlowTutorialTask from "../../tutorial/timeSlowTutorialTask.js";
import { WasdTutorialTask } from "../../tutorial/wasdTutorialTask.js";

function getLevelIntroMessage(number) {
    return {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2,
        text: `Level ${number}`,
        fontSizePx: 320,
        fadeInTime: 20,
        showTime: 60,
        fadeOutTime: 20,
        opacity: 0.3,
    };
}

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
    getLevelIntroMessage(1),
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
    { class: CheckpointTask },
];

const level2 = [
    getLevelIntroMessage(2),
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
                    { name: "MultiSquare", weight: 2, num: 3 },
                    { name: "SmallSquare", weight: 0.5, num: 10 },
                    { name: "MultiTriangle", weight: 2, num: 3 },
                    { name: "SmallTriangle", weight: 0.5, num: 10 },
                    { name: "ShieldedCircle", weight: 2.5, num: 2 },
                ]
            },
        ]
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 15,
        enemies: [
            {
                shuffle: [
                    { name: "SmallCircle", weight: 1, num: 10 },
                    { name: "MultiCircle", weight: 2, num: 2 },
                    { name: "SimpleShooter", weight: 2, num: 5 },
                ]
            },
            { name: "ThreeShooter", weight: 2, num: 1 },
            {
                shuffle: [
                    { name: "SmallCircle", weight: 1, num: 3 },
                    { name: "MultiCircle", weight: 2, num: 1 },
                    { name: "SimpleShooter", weight: 2, num: 2 },
                ]
            },
        ]
    },
    { class: CheckpointTask },
];

const level3 = [
    getLevelIntroMessage(3),
    {
        class: WaitTimeTask,
        time: 100
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 12,
        enemies: [
            {
                shuffle: [
                    { name: "SmallTriangle", weight: 0.2, num: 5 },
                    { name: "MultiTriangle", weight: 1, num: 1 },
                    { name: "SmallSquare", weight: 0.2, num: 5 },
                    { name: "MultiSquare", weight: 1, num: 1 },
                ]
            },
            { name: "Snake", weight: 3, num: 1 },
            {
                shuffle: [
                    { name: "SimpleShooter", weight: 1, num: 5 },
                    { name: "MultiTriangle", weight: 1, num: 5 },
                    { name: "SmallTriangle", weight: 0.2, num: 20 },
                ]
            },
            {
                shuffle: [
                    { name: "SimpleShooter", weight: 1, num: 5 },
                    { name: "MultiTriangle", weight: 1, num: 3 },
                    { name: "SmallTriangle", weight: 0.2, num: 20 },
                    { name: "ThreeShooter", weight: 3, num: 2 },
                ]
            },
            {
                shuffle: [
                    { name: "MultiSquare", weight: 1, num: 2 },
                    { name: "MultiTriangle", weight: 1, num: 2 },
                    { name: "SmallTriangle", weight: 0.2, num: 5 },
                    { name: "SmallSquare", weight: 0.2, num: 5 },
                    { name: "ShieldedCircle", weight: 2, num: 2 },
                    { name: "LaserShooter", weight: 2, num: 3 },
                ]
            },
        ]
    },
    { class: CheckpointTask },
];

const level4 = [
    getLevelIntroMessage(4),
    {
        class: WaitTimeTask,
        time: 100
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 13,
        enemies: [
            {
                shuffle: [
                    { name: "Lurcher", weight: 1, num: 8 },
                    { name: "MultiSquare", weight: 1, num: 2 },
                    { name: "SmallSquare", weight: 0.2, num: 3 },
                    { name: "MultiCircle", weight: 1, num: 2 },
                    { name: "SmallCircle", weight: 0.2, num: 3 },
                ]
            },
            {
                shuffle: [
                    { name: "BombEnemy", weight: 2, num: 8 },
                    { name: "SimpleShooter", weight: 1.5, num: 4 },
                    { name: "MultiTriangle", weight: 1, num: 2 },
                    { name: "SmallTriangle", weight: 0.2, num: 3 },
                    { name: "MultiCircle", weight: 1, num: 2 },
                    { name: "SmallCircle", weight: 0.2, num: 3 },
                    { name: "ShieldedCircle", weight: 2, num: 2 },
                ]
            },
            { name: "Snake", weight: 2, num: 1 },
            {
                shuffle: [
                    { name: "SimpleShooter", weight: 1, num: 6 },
                    { name: "LaserShooter", weight: 2, num: 3 },
                    { name: "ThreeShooter", weight: 2.5, num: 1 },
                    { name: "MultiSquare", weight: 1, num: 3 },
                    { name: "SmallSquare", weight: 0.2, num: 12 },
                ]
            },
        ]
    },
    { class: CheckpointTask },
];

const level5 = [
    getLevelIntroMessage(5),
    {
        class: WaitTimeTask,
        time: 100
    },
    {
        class: WeightedSpawnTask,
        delayCoeff: 17,
        enemies: [
            {
                shuffle: [
                    { name: "SimpleShooter", weight: 1, num: 15 },
                    { name: "ThreeShooter", weight: 2, num: 5 },
                    { name: "SmallCircle", weight: 0.5, num: 15 },
                ]
            },
            { name: "SmallCircle", weight: 0.5, num: 5 },
            {
                shuffle: [
                    { name: "RingShooter", weight: 2.5, num: 2 },
                    { name: "SimpleShooter", weight: 1, num: 5 },
                    { name: "ShieldedCircle", weight: 1, num: 2 },
                    { name: "MultiSquare", weight: 1, num: 5 },
                ]
            },
            {
                shuffle: [
                    { name: "WallBurstShooter", weight: 2.5, num: 2 },
                    { name: "SimpleShooter", weight: 1, num: 5 },
                    { name: "ShieldedCircle", weight: 1, num: 2 },
                    { name: "MultiSquare", weight: 1, num: 5 },
                ]
            },
        ]
    },
    { class: CheckpointTask },
];

const modeBLevels = [
    tutorialPart1,
    tutorialPart2,
    level1,
    level2,
    level3,
    level4,
    level5,
];

const modeBTasks = [
    {
        class: PerformTasksTask,
        tasks: modeBLevels[0],
    }
];

export default modeBLevels;
