import { posMod } from "./extraMath.js";

export default class Color {
    static rainbowTimer = 0;
    static incRainbow(amount){
        this.rainbowTimer = posMod(this.rainbowTimer + amount, 6)
    }

    static rainbowFunction(value){
        value = posMod(value, 6);
        let r=0, g=0, b=0;
        if(value<1){
            r=1; g=value; b=0;
        }else if(value<2){
            r=2-value; g=1; b=0;
        }else if(value<3){
            r=0; g=1; b=value-2;
        }else if(value<4){
            r=0; g=4-value; b=1;
        }else if(value<5){
            r=value-4; g=0; b=1;
        }else{
            r=1; g=0; b=6-value;
        }

        r = Math.ceil(255*r);
        g = Math.ceil(255*g);
        b = Math.ceil(255*b);
        return `rgb(${r} ${g} ${b})`;
    }

    constructor(isRainbow, colorValue){
        this.isRainbow = isRainbow;
        this.colorValue = colorValue;
    }

    getStr(){
        return this.isRainbow? Color.rainbowFunction(Color.rainbowTimer + this.colorValue) : this.colorValue;
    }

    static WHITE = new Color(false, '#fff');
}
