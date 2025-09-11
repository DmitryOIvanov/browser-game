import { WeightedSpawnTask } from "../../tasks.js";

const modeBTasks = [
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
    }
];

export default modeBTasks;