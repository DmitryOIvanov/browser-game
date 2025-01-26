import * as areas from "./areas.js";
import { posMod } from "./extraMath.js";

const singleIntersectFunctionTable = {};
for(let i=0; i<areas.numAreas; i++){
    singleIntersectFunctionTable[i] = {};
    for(let j=0; j<areas.numAreas; j++){
        singleIntersectFunctionTable[i][j] = null;
    }
}

singleIntersectFunctionTable[areas.PointArea.ID][areas.OrthoRectArea.ID] = function(point, oRect){
    return point.x>=oRect.x1 && point.x<=oRect.x2 && point.y>=oRect.y1 && point.y<=oRect.y2;
};

singleIntersectFunctionTable[areas.PointArea.ID][areas.CircleArea.ID] = function(point, circ){
    return (circ.x-point.x)*(circ.x-point.x) + (circ.y-point.y)*(circ.y-point.y) <= circ.rSqr;
};

singleIntersectFunctionTable[areas.CircleArea.ID][areas.CircleArea.ID] = function(c1, c2){
    return (c1.x-c2.x)*(c1.x-c2.x) + (c1.y-c2.y)*(c1.y-c2.y) <= (c1.r+c2.r)*(c1.r+c2.r);
};

singleIntersectFunctionTable[areas.OrthoRectArea.ID][areas.OrthoRectArea.ID] = function(r1, r2){
    return (r1.x2>=r2.x1 || r2.x2>=r1.x1) && (r1.y2>=r2.y1 || r2.y2>=r1.y1);
};

singleIntersectFunctionTable[areas.OrthoRectArea.ID][areas.CircleArea.ID] = function(oRect, circle){
    // Check rectangular bounding boxes for quick ruling out? is fast??
    // very verbose
    if(circle.x < oRect.x1){
        if(circle.y < oRect.y1){
            return (circle.x-oRect.x1)*(circle.x-oRect.x1) + (circle.y-oRect.y1)*(circle.y-oRect.y1) <= circle.rSqr;
        }else if(circle.y > oRect.y2){
            return (circle.x-oRect.x1)*(circle.x-oRect.x1) + (circle.y-oRect.y2)*(circle.y-oRect.y2) <= circle.rSqr;
        }else{
            return circle.x+circle.r >= oRect.x1;
        }
    }else if(circle.x > oRect.x2){
        if(circle.y < oRect.y1){
            return (circle.x-oRect.x2)*(circle.x-oRect.x2) + (circle.y-oRect.y1)*(circle.y-oRect.y1) <= circle.rSqr;
        }else if(circle.y > oRect.y2){
            return (circle.x-oRect.x2)*(circle.x-oRect.x2) + (circle.y-oRect.y2)*(circle.y-oRect.y2) <= circle.rSqr;
        }else{
            return circle.x-circle.r <= oRect.x2;
        }
    }else{
        if(circle.y < oRect.y1){
            return circle.y+circle.r >= oRect.y1;
        }else if(circle.y > oRect.y2){
            return circle.y-circle.r <= oRect.y2;
        }else{
            return true;
        }
    }
};

singleIntersectFunctionTable[areas.PointArea.ID][areas.EquiTriangleArea.ID] = function(p, t){
    if((p.x-t.x)*(p.x-t.x)+(p.y-t.y)*(p.y-t.y) > t.r*t.r) return false;
    return (t.p1y-t.p2y)*(p.x-t.p1x)+(t.p2x-t.p1x)*(p.y-t.p1y)>=0 && (t.p2y-t.p3y)*(p.x-t.p2x)+(t.p3x-t.p2x)*(p.y-t.p2y)>=0 && (t.p3y-t.p1y)*(p.x-t.p3x)+(t.p1x-t.p3x)*(p.y-t.p3y)>=0;
};

singleIntersectFunctionTable[areas.CircleArea.ID][areas.EquiTriangleArea.ID] = function(c, t){
    const dx = c.x-t.x;
    const dy = c.y-t.y;
    if(dx*dx + dy*dy > (t.r+c.r)*(t.r+c.r)) return false;
    if(dx*dx + dy*dy <= (0.5*t.r+c.r)*(0.5*t.r+c.r)) return true;
    const dAngle = (Math.atan2(dy,dx) - t.angle + 4*Math.PI)%(2*Math.PI/3) + Math.PI/6;
    // Optimization possible??? Remove trig???
    const dist = Math.sqrt(dx*dx + dy*dy);
    const dx2 = Math.cos(dAngle) * dist;
    const dy2 = Math.sin(dAngle) * dist;
    const cos30 = 0.5*Math.sqrt(3);
    if(dx2 > cos30*t.r){
        return (dx2-cos30*t.r)*(dx2-cos30*t.r)+(dy2-0.5*t.r)*(dy2-0.5*t.r) <= c.r*c.r;
    }else if(dx2 < -cos30*t.r){
        return (dx2+cos30*t.r)*(dx2+cos30*t.r)+(dy2-0.5*t.r)*(dy2-0.5*t.r) <= c.r*c.r;
    }
    return dy2 <= 0.5*t.r + c.r;
};

singleIntersectFunctionTable[areas.PointArea.ID][areas.RegularPolygonArea.ID] = function(p, rp){
    const dx = p.x-rp.x;
    const dy = p.y-rp.y;
    const distSqr = dx*dx + dy*dy;
    if(distSqr > rp.r*rp.r) return false;
    if(distSqr <= rp.r*rp.r*rp.cos*rp.cos) return true;
    const dist = Math.sqrt(distSqr);
    const dAngle = posMod(Math.atan2(dy,dx) - rp.rot, 2*rp.keyAngle)-rp.keyAngle;
    return dist*Math.cos(dAngle) <= rp.r*rp.cos;
};

singleIntersectFunctionTable[areas.CircleArea.ID][areas.RegularPolygonArea.ID] = function(c, rp){
    const dx = c.x-rp.x;
    const dy = c.y-rp.y;
    const distSqr = dx*dx + dy*dy;
    if(distSqr > (c.r+rp.r)*(c.r+rp.r)) return false;
    if(distSqr <= (c.r+rp.r*rp.cos)*(c.r+rp.r*rp.cos)) return true;
    const dist = Math.sqrt(distSqr);
    const dAngle = posMod(Math.atan2(dy,dx) - rp.rot, 2*rp.keyAngle)-rp.keyAngle;
    const dx2 = dist*Math.sin(dAngle);
    const dy2 = dist*Math.cos(dAngle);
    const littleRad = rp.sin*rp.r;
    if(dx2 > littleRad){
        return (dx2-littleRad)*(dx2-littleRad)+(dy2-rp.r*rp.cos)*(dy2-rp.r*rp.cos) <= c.r*c.r;
    }else if(dx2 < -littleRad){
        return (dx2+littleRad)*(dx2+littleRad)+(dy2-rp.r*rp.cos)*(dy2-rp.r*rp.cos) <= c.r*c.r;
    }
    return dy2 <= rp.r*rp.cos + c.r;
};

singleIntersectFunctionTable[areas.CircleArea.ID][areas.RayArea.ID] = function(c, r){
    const targetDX = c.x-r.x;
    const targetDY = c.y-r.y;
    if(r.dx*targetDX + r.dy*targetDY >= 0){
        return Math.abs(r.dy*targetDX - r.dx*targetDY) <= c.r+r.thick;
    }
    return targetDX*targetDX + targetDY*targetDY <= (c.r+r.thick)*(c.r+r.thick);
};

export default singleIntersectFunctionTable;