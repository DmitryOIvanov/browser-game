import { HorizontalGridBackground } from "./horizontalGridBackground.js";
import { SimpleGridBackground } from "./simpleGridBackground.js";

export const backgrounds = {
    title: new HorizontalGridBackground(480, 300, 5, 0.01, 200, 400),
    simple: new SimpleGridBackground(80, 3, 40, 40),
}

export function timestepBackgrounds(dt) {
    for (let bgName in backgrounds) {
        if (backgrounds[bgName].timestep) {
            backgrounds[bgName].timestep(dt);
        }
    }
}
