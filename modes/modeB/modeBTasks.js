import playField from "../../playField.js";
import { PerformTasksTask, WaitForConditionTask, WaitTimeTask, WeightedSpawnTask } from "../../tasks.js";

const level1 = [
    {
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
        condition: ()=>(playField.isDangerFree())
    },{
        class: WaitTimeTask,
        time: 30
    }
];

const modeBLevels = [
    level1
];

const modeBTasks = [
    {
        class: PerformTasksTask,
        tasks: modeBLevels[0],
    }
];

export default modeBTasks;