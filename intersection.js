import { numAreas } from "./areas.js";
import singleIntersectFunctionTable from "./singleIntersectFunctionTable.js";
import multiIntersectFunctionTable from "./multiIntersectFunctionTable.js";

export function intersects(area1, area2){
    return singleIntersectFunctionTable[area1.id][area2.id](area1, area2);
}

export function findMultiIntersections(multiArea, singleArea){
    return multiIntersectFunctionTable[multiArea.id][singleArea.id](multiArea, singleArea);
}

// If appropriate multi defined but not single, use multi
for(let i=0; i<numAreas; i++){
    for(let j=0; j<numAreas; j++){
        if(singleIntersectFunctionTable[i][j] == null && multiIntersectFunctionTable[i][j] != null){
            singleIntersectFunctionTable[i][j] = (a,b)=>(findMultiIntersections(a,b)!=null);
        }
    }
}

// Make single table symmetric
for(let i=0; i<numAreas; i++){
    for(let j=0; j<numAreas; j++){
        if(singleIntersectFunctionTable[i][j] != null && singleIntersectFunctionTable[j][i] == null){
            singleIntersectFunctionTable[j][i] = (a,b)=>(singleIntersectFunctionTable[i][j](b,a));
        }
    }
}

// Fill empty slots in both tables with appropriate error functions
for(let i=0; i<numAreas; i++){
    for(let j=0; j<numAreas; j++){
        if(singleIntersectFunctionTable[i][j] == null){
            singleIntersectFunctionTable[i][j] = ()=>{throw new Error(`Single intersection function not defined for IDs ${i} & ${j}`)};
        }
        if(multiIntersectFunctionTable[i][j] == null){
            multiIntersectFunctionTable[i][j] = ()=>{throw new Error(`Multi intersection function not defined for IDs ${i} & ${j}`)};
        }
    }
}



