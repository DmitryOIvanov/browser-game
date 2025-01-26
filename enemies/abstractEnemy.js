import Color from "../color.js";

const RARE_CHANCE = 0.0001;

let nextID = 0;

const dangerColor = new Color(false, '#f22');
const BASE_COLOR_BASE = 104;
const BASE_COLOR_VAR = 48;
const baseColorTable = Array(BASE_COLOR_VAR).fill(null)
    .map((_,i)=>(new Color(false, `rgb(255 ${BASE_COLOR_BASE+i} 0)`)));

export default class AbstractEnemy {
    constructor(){
        this.id = nextID;
        nextID++;
        this.retired = false;
        this.isRare = (Math.random() <= RARE_CHANCE);
        if(this.isRare){
            const offset = Math.random()*6;
            this.baseColor = new Color(true, offset);
            this.dangerColor = new Color(true, offset+5);
        }else{
            const randIndex = Math.floor(Math.random()*BASE_COLOR_VAR);
            this.baseColor = baseColorTable[randIndex];
            this.dangerColor = dangerColor;
        }
    }

    timeStep(amount){}
}