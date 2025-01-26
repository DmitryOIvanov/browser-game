import { CircleArea } from "../areas.js";
import { decToZero, normalizeAngle } from "../extraMath.js";
import AbstractEnemy from "./abstractEnemy.js";

const OUT_THICK = 6;
const IN_THICK = 1;
const Z_DIST = 4;
const RAD = 100;
const ROT_SPEED = 0.003;

const basePoints = [];
const keyLen1 = Math.sqrt(50+10*Math.sqrt(5))/10;
const keyLen2 = Math.sqrt(50-10*Math.sqrt(5))/10;
basePoints.push([0 , 0.5*keyLen1+keyLen2 , 0]);
basePoints.push([0 ,-0.5*keyLen1-keyLen2 , 0]);
for(let i=0; i<5; i++){
    const angle1 = 2*Math.PI*i/5;
    const angle2 = 2*Math.PI*(2*i+1)/10;
    basePoints.push([keyLen1*Math.cos(angle1) , 0.5*keyLen1 , keyLen1*Math.sin(angle1)]);
    basePoints.push([keyLen1*Math.cos(angle2) ,-0.5*keyLen1 , keyLen1*Math.sin(angle2)]);
}
const edges = [
    [0,2],[0,4],[0,6],[0,8],[0,10],[1,3],[1,5],[1,7],[1,9],[1,11],
    [2,4],[4,6],[6,8],[8,10],[10,2],[3,5],[5,7],[7,9],[9,11],[11,3],
    [2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,2]
];
const faceEdges = [
    [0,1,10],[1,2,11],[2,3,12],[3,4,13],[4,0,14],[5,6,15],[6,7,16],[7,8,17],[8,9,18],[9,5,19],
    [10,20,21],[15,21,22],[11,22,23],[16,23,24],[12,24,25],[17,25,26],[13,26,27],[18,27,28],[14,28,29],[19,29,20]
];
const facePoints = [
    [0,2,4],[0,4,6],[0,6,8],[0,8,10],[0,10,2],[1,3,5],[1,5,7],[1,7,9],[1,9,11],[1,11,3],
    [2,3,4],[3,4,5],[4,5,6],[5,6,7],[6,7,8],[7,8,9],[8,9,10],[9,10,11],[10,11,2],[11,2,3]
];

export default class IcosaBoss extends AbstractEnemy{
    constructor(x,y){
        super();
        this.x=x; this.y=y;
        this.hitFlash = 0;
        this.hp = 10000;
        this.area = new CircleArea(this.x,this.y,0.8*RAD);
        this.modPoints3d = new Array(12);
        this.modPoints2d = new Array(12);
        this.edgeInFront = new Array(30);
        this.highlight = 0;
        this.highlightTimer = 60;

        this.rot = 2*Math.PI*Math.random();
        this.rotMatrix = [[1,0,0],[0,1,0],[0,0,1]];
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash = decToZero(this.hitFlash, amount);
        this.rot = normalizeAngle(this.rot + ROT_SPEED*amount);
        this.highlightTimer -= amount;
        if(this.highlightTimer <= 0){
            this.highlightTimer += 60;
            this.highlight = (this.highlight+1)%20;
        }
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineCap = "round";

        for(let i=0; i<12; i++){
            const axisVec = [Math.sin(this.rot),Math.cos(this.rot),0];
            const cos = Math.cos(5*this.rot);
            const sin = Math.sin(5*this.rot);
            const tempMat = [[0,axisVec[2],-axisVec[1]], [-axisVec[2],0,axisVec[0]], [axisVec[1],-axisVec[0],0]];
            const rotMatrix = linAlg.m3add(linAlg.getI3(), linAlg.m3add(linAlg.m3Scale(tempMat,sin), linAlg.m3Scale(linAlg.mm3Mult(tempMat,tempMat),1-cos)));

            // const rotMatrix = [[cos,0,sin],[0,1,0],[-sin,0,cos]];
            this.modPoints3d[i] = linAlg.mv3Mult(rotMatrix, basePoints[i]);
        }
        for(let i=0; i<30; i++){
            this.edgeInFront[i] = false;
        }
        for(let i=0; i<20; i++){
            let midX = 0; let midY = 0; let midZ = 0;
            for(let j=0; j<3; j++){
                midX += this.modPoints3d[facePoints[i][j]][0];
                midY += this.modPoints3d[facePoints[i][j]][1];
                midZ += this.modPoints3d[facePoints[i][j]][2];
            }
            midX /= 3; midY /= 3; midZ /= 3;
            const dot = - midX*midX - midY*midY + midZ*(-Z_DIST-midZ);
            if(dot >= 0){
                for(let j=0; j<3; j++){
                    this.edgeInFront[faceEdges[i][j]] = true;
                }
            }
        }
        for(let i=0; i<30; i++){
            ctx.lineWidth = this.edgeInFront[i] ? OUT_THICK : IN_THICK;
            ctx.beginPath();
            const zCoeff1 = 1/(1+this.modPoints3d[edges[i][0]][2]/Z_DIST);
            ctx.moveTo(this.x+RAD*this.modPoints3d[edges[i][0]][0]*zCoeff1, this.y+RAD*this.modPoints3d[edges[i][0]][1]*zCoeff1);
            const zCoeff2 = 1/(1+this.modPoints3d[edges[i][1]][2]/Z_DIST);
            ctx.lineTo(this.x+RAD*this.modPoints3d[edges[i][1]][0]*zCoeff2, this.y+RAD*this.modPoints3d[edges[i][1]][1]*zCoeff2);
            ctx.stroke();
        }
        ctx.lineCap = "butt";
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = G_PARAMS.HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            game.particles.push(new ExplodingRingParticle(this.x, this.y, 1.5*TowerBase.RAD, 2.5*TowerBase.RAD, 9, '#fff'));
            return;
        }
    }
}

