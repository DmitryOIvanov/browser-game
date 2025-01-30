import * as areas from "./areas.js";
import { normalizeAnglePMPI, posMod } from "./extraMath.js";

const multiIntersectFunctionTable = {};
for(let i=0; i<areas.numAreas; i++){
    multiIntersectFunctionTable[i] = {};
    for(let j=0; j<areas.numAreas; j++){
        multiIntersectFunctionTable[i][j] = null;
    }
}

// Arguments are ordered (Multi, Single), this is not checked during runtime

multiIntersectFunctionTable[areas.ShieldedCircleArea.ID][areas.PointArea.ID] = function(sc, p){
    let dx = p.x - sc.x;
    let dy = p.y - sc.y;
    let distSqr = dx*dx + dy*dy;
    if(distSqr > sc.rOut*sc.rOut){
        return null;
    }else if(distSqr <= sc.rIn*sc.rIn){
        return sc.segExistence[sc.numSegs] ? [sc.numSegs] : null;
    }else if(distSqr >= sc.rMid*sc.rMid){
        let seg = Math.floor(((Math.atan2(dy,dx)-sc.rot)*0.5/Math.PI+2)*sc.numSegs)%sc.numSegs;
        return sc.segExistence[seg] ? [seg] : null;
    }
    return null;
};

multiIntersectFunctionTable[areas.ShieldedCircleArea.ID][areas.CircleArea.ID] = function(sc, c){
    if(!sc.segExistence.reduce((cur,segExists)=>(cur||segExists),false)) return null;
    let dx = c.x-sc.x;
    let dy = c.y-sc.y;
    let distSqr = dx*dx+dy*dy;
    if(distSqr > (sc.rOut+c.r)*(sc.rOut+c.r)) return null;
    let result = [];
    if(distSqr <= (sc.rIn+c.r)*(sc.rIn+c.r)) result.push(sc.numSegs);
    let dist = Math.sqrt(distSqr);
    if(dist <= 0){
        if(c.r >= sc.rMid){
            result = Array(sc.numSegs+1).fill(0).map((_,i)=>(i==0?sc.numSegs:i-1));
        }
    }else{
        let angle = Math.atan2(dy,dx)-sc.rot;
        let angleDev = -1;
        if(sc.rMid*sc.rMid > distSqr-c.r*c.r){
            let determ = (sc.rMid*sc.rMid - c.r*c.r + distSqr)/(2*dist*sc.rMid);
            if(determ < 1){
                if(determ <= -1){
                    angleDev = Math.PI;
                }else{
                    angleDev = Math.acos(determ);
                }
            }
        }else if(sc.rOut*sc.rOut < distSqr-c.r*c.r){
            let determ = (sc.rOut*sc.rOut - c.r*c.r + distSqr)/(2*dist*sc.rOut);
            if(determ<1){
                if(determ <= -1){
                    angleDev = Math.PI;
                }else{
                    angleDev = Math.acos(determ);
                }
            }
        }else{
            angleDev = Math.asin(c.r/dist);
        }

        if(angleDev > -1){
            let portion = (angle*0.5/Math.PI + 2)*sc.numSegs;
            let centralIndex = Math.floor(portion)%sc.numSegs;
            let mainDir = portion-Math.floor(portion)>0.5 ? 1:-1;
            result.push(centralIndex);
            for(let i=1; 2*i<=sc.numSegs; i++){
                let indices = [
                    posMod(centralIndex+i*mainDir, sc.numSegs),
                    posMod(centralIndex-i*mainDir, sc.numSegs)
                ];
                for(let j=0; j==0 || (j==1&&indices[0]!=indices[1]);j++){
                    if(Math.abs(normalizeAnglePMPI(Math.PI*(2*indices[j]+1)/sc.numSegs-angle))<=angleDev+Math.PI/sc.numSegs){
                        result.push(indices[j]);
                    }
                }
            }
        }
    }
    result = result.filter(i=>(sc.segExistence[i]));
    return result.length>0?result:null;
};

export default multiIntersectFunctionTable;