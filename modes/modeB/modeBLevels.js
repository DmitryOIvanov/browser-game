import playField from "../../playField.js";
import { CreateBgParticleAndWaitForRetirementTask, PerformTasksTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "../../tasks.js";
import { ShootTutorialTask } from "../../tutorial/shootTutorialTask.js";
import { SpecialTutorialTask } from "../../tutorial/specialTutorialTask.js";
import TimeSlowTutorialTask from "../../tutorial/timeSlowTutorialTask.js";
import { WasdTutorialTask } from "../../tutorial/wasdTutorialTask.js";

const tutorial = [
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: WasdTutorialTask
    }, {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: ShootTutorialTask
    }, {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: TimeSlowTutorialTask
    },
    {
        class: CreateBgParticleAndWaitForRetirementTask,
        particleClass: SpecialTutorialTask
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
