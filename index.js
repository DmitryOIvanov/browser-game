import { canv, ctx } from "./drawing.js";
import controls from "./controls.js";
import FpsTracker from "./fpsTracker.js";
import playField from "./playField.js";
import controller from "./controller.js";

let showDebugInfo = false;

controller.initialize();

const fpsTracker = new FpsTracker();
function renderLoop(){
    fpsTracker.startProductiveFrame();

    controller.nextFrame();

    if(controls.pressed["KeyI"]) showDebugInfo = !showDebugInfo;
    if(showDebugInfo){
        ctx.textAlign = "left";
        ctx.font = "36px serif";
        ctx.fillStyle = '#fff';
        const latestFpsInfo = fpsTracker.getLatestFinishedSampleInfo();
        ctx.fillText(latestFpsInfo.realFPSText, 30,50);
        ctx.fillText(latestFpsInfo.projectedFPSText, 30,90);
        ctx.font = "24px serif";
        ctx.fillText("Particles",30,120); ctx.fillText(`${playField.particles.length}`,160,120);
        ctx.fillText("Enemies",30,144); ctx.fillText(`${playField.enemies.length}`,160,144);
        ctx.fillText("Enemy Proj.",30,168); ctx.fillText(`${playField.enemyProj.length}`,160,168);
        ctx.fillText("Player Proj.",30,192); ctx.fillText(`${playField.playerProj.length}`,160,192);
    }

    controls.clearPresses();
    requestAnimationFrame(renderLoop, canv);

    fpsTracker.endFrame();
}

renderLoop();