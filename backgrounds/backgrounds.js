import { HorizontalGridBackground } from "./horizontalGridBackground.js";

export const backgrounds = {
    title: new HorizontalGridBackground(480, 300, 5, 0.01, 200, 400),
}

export function timestepBackgrounds(dt) {
    for (let bgName in backgrounds) {
        if (backgrounds[bgName].timestep) {
            backgrounds[bgName].timestep(dt);
        }
    }
}
