import Color from "./color.js";
import controls from "./controls.js";
import Player from "./player.js";
import playField from "./playField.js";

export const PLAYER_SHOT_HEAD_START = Player.IN_RAD;

export function shoot(x, y, angle, speed, partialDt, projectileGenerator){
    const dx = speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);
    const newBullet = projectileGenerator(x, y, dx, dy, Color.WHITE);
    playField.addPlayerProjectile(newBullet);
    newBullet.timeStep(partialDt);
}

export function shootWithAngularOffset(x, y, angle, speed, offsetAngle, partialDt, projectileGenerator){
    shoot(
        x + PLAYER_SHOT_HEAD_START * Math.cos(angle+offsetAngle),
        y + PLAYER_SHOT_HEAD_START * Math.sin(angle+offsetAngle),
        angle, speed, partialDt, projectileGenerator
    );
}

export function shootSpread(x, y, numShots, baseAngle, spread, variance, speed, headStart, partialDt, projectileGenerator){
    for(let i=0; i<numShots; i++){
        const angle = baseAngle + spread*(i+0.5*(1-numShots)) + variance*2*(Math.random()-0.5);
        shoot(x+headStart*Math.cos(angle), y+headStart*Math.sin(angle), angle, speed, partialDt, projectileGenerator);
    }
}

export function shootSpreadAsPlayer(numShots, spread, variance, speed, partialDt, projectileGenerator){
    const baseAngle = Math.atan2(controls.mouse.y-playField.player.y, controls.mouse.x-playField.player.x);
    shootSpread(playField.player.x, playField.player.y, numShots, baseAngle, spread, variance, speed, PLAYER_SHOT_HEAD_START, partialDt, projectileGenerator);
}