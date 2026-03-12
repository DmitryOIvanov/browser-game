import { FlatColor, getEnemyDamageColorStr, RainbowColor, rainbowFunction } from "../color.js";

const RARE_CHANCE = 0.0001;

let nextID = 0;

const DANGER_COLOR = new FlatColor('#f22');

export default class AbstractEnemy {
    constructor() {
        this.id = nextID;
        nextID++;
        this.retired = false;
        this.isRare = (Math.random() <= RARE_CHANCE);
        if (this.isRare) {
            this.rainbowOffset = Math.random() * 6;
            this.dangerColor = new RainbowColor(this.rainbowOffset + 5);
        } else {
            this.dangerColor = DANGER_COLOR;
        }

        this.weight = 0;
    }

    getBaseColorStr(defenseProfile) {
        if (this.isRare) {
            return rainbowFunction(this.rainbowOffset);
        } else {
            return getEnemyDamageColorStr(defenseProfile.hp / defenseProfile.maxHP);
        }
    }

    setWeight(weight) {
        this.weight = weight;
        return this;
    }

    timeStep(amount) { }
}
