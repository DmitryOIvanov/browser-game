import { posMod } from "./extraMath.js";

export class FlatColor {
    static WHITE = new FlatColor('#fff');

    constructor(str) {
        this.str = str;
    }

    getStr() {
        return this.str;
    }
}

export function rainbowFunction(value) {
    value = posMod(value, 6);
    let r = 0, g = 0, b = 0;
    if (value < 1) {
        r = 1; g = value; b = 0;
    } else if (value < 2) {
        r = 2 - value; g = 1; b = 0;
    } else if (value < 3) {
        r = 0; g = 1; b = value - 2;
    } else if (value < 4) {
        r = 0; g = 4 - value; b = 1;
    } else if (value < 5) {
        r = value - 4; g = 0; b = 1;
    } else {
        r = 1; g = 0; b = 6 - value;
    }

    r = Math.ceil(255 * r);
    g = Math.ceil(255 * g);
    b = Math.ceil(255 * b);
    return `rgb(${r} ${g} ${b})`;
}

export class RainbowColor {
    static rainbowTimer = 0;
    static incRainbow(amount) {
        this.rainbowTimer = posMod(this.rainbowTimer + amount, 6)
    }

    constructor(offset) {
        this.offset = offset;
    }

    getStr() {
        return rainbowFunction(this.offset + RainbowColor.rainbowTimer);
    }
}

const NUM_DAMAGE_COLOR_GRADATIONS = 20;
const LOW_DAMAGE_COLOR = [255, 200, 0];
const HIGH_DAMAGE_COLOR = [255, 100, 0];
let DAMAGE_COLORS = new Array(NUM_DAMAGE_COLOR_GRADATIONS);
for (let i = 0; i < NUM_DAMAGE_COLOR_GRADATIONS; i++) {
    const t = i / (NUM_DAMAGE_COLOR_GRADATIONS - 1);
    const r = Math.floor(t * LOW_DAMAGE_COLOR[0] + (1 - t) * HIGH_DAMAGE_COLOR[0] + 0.5);
    const g = Math.floor(t * LOW_DAMAGE_COLOR[1] + (1 - t) * HIGH_DAMAGE_COLOR[1] + 0.5);
    const b = Math.floor(t * LOW_DAMAGE_COLOR[2] + (1 - t) * HIGH_DAMAGE_COLOR[2] + 0.5);
    DAMAGE_COLORS[i] = `rgb(${r} ${g} ${b})`;
}

export function getEnemyDamageColorStr(portion) {
    let index = Math.floor(portion * NUM_DAMAGE_COLOR_GRADATIONS);
    if (index < 0) index = 0;
    if (index >= NUM_DAMAGE_COLOR_GRADATIONS) index = NUM_DAMAGE_COLOR_GRADATIONS - 1;
    return DAMAGE_COLORS[index];
}
