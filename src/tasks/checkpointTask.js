import { canv } from "../drawing.js";
import playField from "../playField.js";
import { CreateMessageTask, ExecuteFunctionTask, PerformTasksTask, WaitForConditionTask, WaitTimeTask } from "../tasks.js";

const tasks = [
    {
        class: WaitForConditionTask,
        condition: () => (playField.isDangerFree())
    },
    {
        class: WaitTimeTask,
        time: 20
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 - 180,
        text: "CHECKPOINT",
        fontSizePx: 150,
        fadeInTime: 10,
        showTime: 150,
        fadeOutTime: 30,
        opacity: 0.4,
    },
    {
        class: WaitTimeTask,
        time: 60
    },
    {
        class: CreateMessageTask,
        centerX: canv.width / 2,
        centerY: canv.height / 2 + 150,
        text: "Health Restored",
        fontSizePx: 50,
        fadeInTime: 10,
        showTime: 90,
        fadeOutTime: 30,
        opacity: 0.4,
    },
    {
        class: ExecuteFunctionTask,
        function: () => {
            playField.player.resetHealthAndFlash();
            playField.player.weapon.resetSecondaryCooldown();
        }
    },
    {
        class: WaitTimeTask,
        time: 140
    },
];

const params = { tasks: tasks };

export default class CheckpointTask extends PerformTasksTask {
    constructor() {
        super(params);
    }
}
