export class Area {
    static TYPE_SINGLE = 0;
    static TYPE_PARTITION = 1;
    constructor(id,type){
        this.id = id;
        this.type = type;
    }
}

let curNumAreas = 0;
function assignAreaID(){
    curNumAreas++;
    return curNumAreas-1;
}

// ---- "Single" Areas ----

export class OrthoRectArea extends Area{
    static ID = assignAreaID();
    constructor(x1,y1,x2,y2){
        super(OrthoRectArea.ID, Area.TYPE_SINGLE);
        this.update(x1,y1,x2,y2);
    }
    update(x1,y1,x2,y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

export class CircleArea extends Area{
    static ID = assignAreaID();
    constructor(x,y,r){
        super(CircleArea.ID, Area.TYPE_SINGLE);
        this.update(x,y,r);
    }
    update(x,y,r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSqr = r*r;
    }
}

export class PointArea extends Area{
    static ID = assignAreaID();
    constructor(x,y){
        super(PointArea.ID, Area.TYPE_SINGLE);
        this.update(x,y);
    }
    update(x,y){
        this.x = x;
        this.y = y;
    }
}

export class EquiTriangleArea extends Area{
    static ID = assignAreaID();
    constructor(x,y,r,angle){
        super(EquiTriangleArea.ID, Area.TYPE_SINGLE);
        this.update(x,y,r,angle);
    }
    update(x,y,r,angle){
        this.x = x;
        this.y = y;
        this.r = r;
        this.angle = angle;
        this.p1x = x + r*Math.cos(angle);
        this.p1y = y + r*Math.sin(angle);
        this.p2x = x + r*Math.cos(angle+Math.PI*2/3);
        this.p2y = y + r*Math.sin(angle+Math.PI*2/3);
        this.p3x = x + r*Math.cos(angle+Math.PI*4/3);
        this.p3y = y + r*Math.sin(angle+Math.PI*4/3);
    }
}

export class RegularPolygonArea extends Area{
    static ID = assignAreaID();
    constructor(x,y,r,rot,n){
        super(RegularPolygonArea.ID, Area.TYPE_SINGLE);
        this.update(x,y,r,rot,n);
    }
    update(x,y,r,rot,n){
        this.x = x;
        this.y = y;
        this.r = r;
        this.rot = rot;
        this.n = n;
        this.keyAngle = Math.PI/n;
        this.cos = Math.cos(this.keyAngle);
        this.sin = Math.sin(this.keyAngle);
    }
}

export class RayArea extends Area{
    static ID = assignAreaID();
    constructor(x,y,dx,dy,thick){
        super(RayArea.ID, Area.TYPE_SINGLE);
        this.update(x,y,dx,dy,thick);
    }
    update(x,y,dx,dy,thick){
        this.x=x; this.y=y;
        const coeff = 1/Math.sqrt(dx*dx+dy*dy);
        this.dx = dx*coeff;
        this.dy = dy*coeff;
        this.thick = thick;
    }
}

// ---- "Partition" aka "Multi" Areas

export class ShieldedCircleArea extends Area{
    static ID = assignAreaID();
    constructor(x,y,rIn,rMid,rOut,numSegs,segArr,rot){
        super(ShieldedCircleArea.ID, Area.TYPE_PARTITION);
        this.update(x,y,rIn,rMid,rOut,numSegs,segArr, rot);
    }
    update(x,y,rIn,rMid,rOut,numSegs,segArr, rot){
        this.x = x; this.y = y;
        this.rIn = rIn; this.rMid = rMid; this.rOut = rOut;
        this.numSegs = numSegs;
        this.segArr = segArr;
        this.rot = rot
    }
}

export const numAreas = curNumAreas;