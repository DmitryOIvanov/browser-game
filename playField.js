import { Area } from "./areas.js";
import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx } from "./drawing.js";
import { findMultiIntersections, intersects } from "./intersection.js";
import Player from "./player.js";
import { BouncyWeapon, MemeWeapon3 } from "./weapons/ballProjWeapons.js";
import { FireworkWeapon, MemeWeapon2 } from "./weapons/fireworkWeapons.js";
import { MachineGunWeapon, MemeWeapon1, PierceWeapon, ShotgunWeapon } from "./weapons/pointProjWeapons.js";

function deleteRetirables(array){
    for(let i=0; i<array.length; i++){
        if(array[i].retired){
            array[i] = array[array.length-1];
            array.pop();
            i--;
        }
    }
}

function attackAndDefend(attackProfile, defenseProfile){
    if(attackProfile.damage >= defenseProfile.hp){
        attackProfile.damage -= defenseProfile.hp;
        defenseProfile.expired = true;
    }else{
        defenseProfile.hp -= attackProfile.damage;
        attackProfile.expired = true;
    }

}

const weaponGenerators = [
    ()=>(new MachineGunWeapon()),
    ()=>(new ShotgunWeapon()),
    ()=>(new PierceWeapon()),
    ()=>(new BouncyWeapon()),
    ()=>(new FireworkWeapon()),
    ()=>(new MemeWeapon1()),
    ()=>(new MemeWeapon2()),
    ()=>(new MemeWeapon3())
];

const playField = {
    initialize(manager){
        this.x = canv.width;
        this.y = canv.height;
        this.diagLengthSqr = this.x*this.x + this.y*this.y;
        this.diagLength = Math.sqrt(this.diagLengthSqr);
        this.maxDim = Math.max(this.x,this.y);
        this.minDim = Math.min(this.x,this.y);
        
        this.player = new Player(playField.x/2,playField.y/2);
        this.weaponIndex = 0;
        this.player.weapon = weaponGenerators[this.weaponIndex]();

        this.playerProj = [];
        this.enemyProj = [];
        this.enemies = [];
        this.particles = [];

        this.manager = manager;
    },

    addPlayerProjectile(proj){
        this.playerProj.push(proj);
        return proj;
    },

    addEnemy(enemy){
        this.enemies.push(enemy);
        return enemy;
    },

    addEnemyProjectile(proj){
        this.enemyProj.push(proj);
        return proj;
    },

    addParticle(particle){
        this.particles.push(particle);
        return particle;
    },

    advanceOneFrame(){
        const player = this.player;
        player.updateSlowmoStatus();
        const playerStep = player.inSlowMo ? Player.SLOWMO_SPEED : 1;
        const step = playerStep * player.hitSlowFactor;
    
        Color.incRainbow(step*0.1);
    
        // Switch weapons
        if(controls.pressed["KeyE"]){
            this.weaponIndex = (this.weaponIndex+1)%weaponGenerators.length;
            player.weapon = weaponGenerators[this.weaponIndex]();
        }

        // Timestep manager
        if(this.manager){
            this.manager.timeStep(step);
            if(this.manager.concluded) return;
        }
    
        // Timestep forward
        player.timeStep(step);
        for(let i=0; i<this.particles.length; i++){
            const part = this.particles[i];
            if(part.autonomous) part.timeStep(step);
        }
        for(let i=0; i<this.playerProj.length; i++){
            this.playerProj[i].timeStep(step);
        }
        for(let ep=0; ep<this.enemyProj.length; ep++){
            const proj = this.enemyProj[ep];
            if(proj.autonomous) proj.timeStep(step);
        }
        for(let i=0; i<this.enemies.length; i++){
            this.enemies[i].timeStep(step);
        }

        // Check for enemy-playerprojectile collisions & delete player projectiles
        for(let p=0; p<this.playerProj.length; p++){
            let proj = this.playerProj[p];
            if(proj.retired) continue;
            let possibleEnemies = this.enemies.filter(enemy=>{ // Somewhat wasteful use of filter
                if(enemy.retired) return false;
                let checkArea = enemy.boundingArea;
                if(!checkArea) checkArea = enemy.area;
                return intersects(proj.boundingCircle, checkArea);
            });
            for(let step=0; step<proj.numColSamples; step++){
                for(let enemy of possibleEnemies){
                    if(enemy.area.type == Area.TYPE_SINGLE){
                        if(proj.excludes[enemy.id]) continue;
                        if(intersects(proj.colSamples[step], enemy.area)){
                            attackAndDefend(proj.attackProfile, enemy.defenseProfile);
                            enemy.getHit();
                            proj.getHit(step);
                            proj.excludes[enemy.id] = true;
                        }
                    }else{
                        let partitionsHit = findMultiIntersections(enemy.area, proj.colSamples[step]);
                        if(partitionsHit != null){
                            for(let part of partitionsHit){
                                if(proj.excludes[enemy.id]){
                                    if(proj.excludes[enemy.id][part]) continue;
                                }
                                enemy.getHit(proj, part);
                                proj.getHit(step);
                                if(!proj.excludes[enemy.id]) proj.excludes[enemy.id] = {};
                                proj.excludes[enemy.id][part] = true;
                                if(proj.retired) break;
                            }
                        }
                    }
                    if(proj.retired) break;
                }
                if(proj.retired) break;
            }
        }

        deleteRetirables(this.playerProj);

        // Check for player-enemyprojectile collisions
        for(let ep=0; ep<this.enemyProj.length; ep++){
            let proj = this.enemyProj[ep]
            if(!proj.retired){
                if(intersects(proj.area, player.area)){
                    player.getHit();
                    break;
                }
            }
        }
        // Check for player-enemy collisions
        for(let i=0; i<this.enemies.length; i++){
            if(intersects(player.area, this.enemies[i].area)){
                player.getHit();
                break;
            }
        }
        
        deleteRetirables(this.enemyProj);
        deleteRetirables(this.enemies);
        deleteRetirables(this.particles);
    },

    redraw(){
        for(let i=0; i<this.enemies.length; i++){
            this.enemies[i].draw();
        }
        for(let i=0; i<this.playerProj.length; i++){
            this.playerProj[i].draw();
        }
        for(let i=0; i<this.enemyProj.length; i++){
            this.enemyProj[i].draw();
        }
        for(let i=0; i<this.particles.length; i++){
            this.particles[i].draw();
        }
        this.player.draw();
        this.player.drawCursor(); 
    },

    isDangerFree(){ // Loopholes possible e.g. a particle that spawns danger
        return this.enemies.length==0 && this.enemyProj.length==0;
    },

    hasNoEnemies(){
        return this.enemies.length==0;
    },
};

export default playField;