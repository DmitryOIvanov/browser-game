import { RegularPolygonArea } from "../areas.js";
import { ctx } from "../drawing.js";
import { decToZero } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const RAD = 60;
const LINE_THICK = 6;
const HIT_RAD = RAD + LINE_THICK*0.5/Math.cos(Math.PI/8);
const HIT_FLASH_TIME = 2;

const VERTS = 8;
const ROT_OFFSET = Math.PI/VERTS;

export default class TowerBase extends AbstractEnemy{
    static RAD = RAD;

    constructor(x,y,hp){
        super();
        this.x=x; this.y=y;
        this.hitFlash = 0;
        this.hp = hp;
        this.area = new RegularPolygonArea(this.x,this.y,HIT_RAD,ROT_OFFSET,VERTS);
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash = decToZero(this.hitFlash, amount);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        for(let i=0; i<VERTS; i++){
            const angle = 2*Math.PI*i/VERTS + ROT_OFFSET;
            ctx.lineTo(this.x+RAD*Math.cos(angle), this.y+RAD*Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*RAD, 2.5*RAD, 9, '#fff'));
            return;
        }
    }
}