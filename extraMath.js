import playField from "./playField.js";

export function posMod(a,b){
    return (a%b + b)%b;
}

export function normalizeAngle(angle){
    return posMod(angle, 2*Math.PI);
}

export function normalizeAnglePMPI(angle){
    angle = normalizeAngle(angle);
    if(angle >= Math.PI) angle-=2*Math.PI;
    return angle;
}

export function normalizedAtan2(y,x){
    return normalizeAngle(Math.atan2(y,x));
}

export function convergeToAngle(curAngle, targetAngle, amount){
    let diff = normalizeAnglePMPI(targetAngle-curAngle);
    if(Math.abs(diff)< amount){
        return normalizeAngle(targetAngle);
    }else if(diff >= 0){
        return normalizeAngle(curAngle + amount);
    }else{
        return normalizeAngle(curAngle - amount);
    }
}

export function randomAngle(){
    return 2*Math.PI*Math.random();
};

export function decToZero(val, amount){
    return val-amount < 0 ? 0 : val-amount;
}

export function isInBounds(coord, winSize, radius){
    return (coord>=radius) && (coord<=winSize-radius);
}

export function simpleBoundify(coord, winSize, radius){
    if(coord < radius){
        return radius;
    }else if(coord > winSize-radius){
        return winSize-radius;
    }
    return coord;
}

export function bounceBoundify(coord, winSize, radius){
    if(coord < radius){
        return 2*radius-coord;
    }else if(coord > winSize-radius){
        return 2*(winSize-radius) - coord;
    }
    return coord;
}

export function timeStepBouncyMovement(mvmt,r,amount){
    mvmt.x += mvmt.vx*amount;
    if(mvmt.x < r){
        mvmt.x = 2*r-mvmt.x;
        mvmt.vx = -mvmt.vx;
    }else if(mvmt.x > playField.x-r){
        mvmt.x = 2*(playField.x-r)-mvmt.x;
        mvmt.vx = -mvmt.vx;
    }
    mvmt.y += mvmt.vy*amount;
    if(mvmt.y < r){
        mvmt.y = 2*r-mvmt.y;
        mvmt.vy = -mvmt.vy;
    }else if(mvmt.y > playField.y-r){
        mvmt.y = 2*(playField.y-r)-mvmt.y;
        mvmt.vy = -mvmt.vy;
    }
}