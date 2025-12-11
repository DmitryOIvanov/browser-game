import { Area } from "./areas.js";
import { attackAndDefend } from "./attackAndDefense.js";
import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx } from "./drawing.js";
import { findMultiIntersections, intersects } from "./intersection.js";
import Player from "./player.js";

function deleteRetirables(array) {
	for (let i = 0; i < array.length; i++) {
		if (array[i].retired) {
			array[i] = array[array.length - 1];
			array.pop();
			i--;
		}
	}
}

const playField = {
	initialize(manager) {
		this.x = canv.width;
		this.y = canv.height;
		this.diagLengthSqr = this.x * this.x + this.y * this.y;
		this.diagLength = Math.sqrt(this.diagLengthSqr);
		this.maxDim = Math.max(this.x, this.y);
		this.minDim = Math.min(this.x, this.y);

		this.player = new Player(playField.x / 2, playField.y / 2);
		this.playerLost = false;

		this.playerProj = [];
		this.enemyProj = [];
		this.enemies = [];
		this.particles = [];
		this.bgParticles = [];
		this.trackedBgParticles = {};

		this.enemyWeight = 0;

		this.manager = manager;
		if (manager) manager.onPlayfieldInit();
	},

	addPlayerProjectile(proj) {
		this.playerProj.push(proj);
		return proj;
	},

	addEnemy(enemy, addWeight) {
		this.enemies.push(enemy);
		if (addWeight) this.enemyWeight += enemy.weight;
		return enemy;
	},

	announceEnemyWeight(weight) {
		this.enemyWeight += weight;
	},

	addEnemyProjectile(proj) {
		this.enemyProj.push(proj);
		return proj;
	},

	addParticle(particle) {
		this.particles.push(particle);
		return particle;
	},

	addBackgroundParticle(bgParticle) {
		this.bgParticles.push(bgParticle);
		return bgParticle;
	},

	addTrackedBackgroundParticle(bgParticle, id) {
		this.addBackgroundParticle(bgParticle);
		this.trackedBgParticles[id] = bgParticle;
	},

	deleteTrackedBackgroundParticle(id) {
		this.trackedBgParticles[id].retired = true;
		this.trackedBgParticles[id] = undefined;
	},

	getTrackedBackgroundParticle(id) {
		return this.trackedBgParticles[id];
	},

	advanceOneFrame() {
		const player = this.player;
		player.updateSlowmoStatus();
		const playerStep = player.inSlowMo ? Player.SLOWMO_SPEED : 1;
		const step = playerStep * player.hitSlowFactor;

		Color.incRainbow(step * 0.1);

		// Timestep manager
		if (this.manager) {
			this.manager.timeStep(step);
			if (this.manager.concluded) return;
		}

		// Timestep forward
		player.timeStep(step);
		for (let i = 0; i < this.playerProj.length; i++) {
			this.playerProj[i].timeStep(step);
		}
		for (let ep = 0; ep < this.enemyProj.length; ep++) {
			const proj = this.enemyProj[ep];
			if (proj.autonomous) proj.timeStep(step);
		}
		for (let i = 0; i < this.enemies.length; i++) {
			this.enemies[i].timeStep(step);
		}

		// Check for enemy-playerprojectile collisions & delete player projectiles
		for (let p = 0; p < this.playerProj.length; p++) {
			let proj = this.playerProj[p];
			if (proj.retired) continue;
			let possibleEnemies = this.enemies.filter(enemy => { // Usually small, so filter is acceptable
				if (enemy.retired) return false;
				let checkArea = enemy.boundingArea;
				if (!checkArea) checkArea = enemy.area;
				return intersects(proj.boundingCircle, checkArea);
			});
			for (let step = 0; step < proj.numColSamples; step++) {
				for (let enemy of possibleEnemies) {
					if (enemy.retired) continue;
					if (enemy.area.type == Area.TYPE_SINGLE) {
						if (proj.excludes[enemy.id]) continue;
						if (enemy.defenseProfile.expired) continue;
						if (intersects(proj.colSamples[step], enemy.area)) {
							attackAndDefend(proj.attackProfile, enemy.defenseProfile);
							enemy.getHit();
							proj.getHit(step);
							if (!proj.retired && !enemy.retired) {
								proj.excludes[enemy.id] = true;
							}
						}
					} else {
						let partitionsHit = findMultiIntersections(enemy.area, proj.colSamples[step]);
						if (partitionsHit != null) {
							for (let part of partitionsHit) {
								if (proj.excludes[enemy.id]) {
									if (proj.excludes[enemy.id][part]) continue;
								}
								const defenseProfile = enemy.getDefenseProfile(part);
								if (defenseProfile.expired) continue;
								attackAndDefend(proj.attackProfile, defenseProfile);
								enemy.getHit(part);
								proj.getHit(step);
								if (enemy.retired || proj.retired) break;
								if (!proj.excludes[enemy.id]) proj.excludes[enemy.id] = {};
								proj.excludes[enemy.id][part] = true;
							}
						}
					}
					if (proj.retired) break;
					if (enemy.retired) break;
				}
				if (proj.retired) break;
			}
		}

		deleteRetirables(this.playerProj);

		// Check for player-enemyprojectile collisions
		for (let ep = 0; ep < this.enemyProj.length; ep++) {
			let proj = this.enemyProj[ep]
			if (!proj.retired) {
				if (intersects(proj.area, player.area)) {
					player.getHit();
					if (this.manager) this.manager.onPlayerHit();
					break;
				}
			}
		}
		// Check for player-enemy collisions
		for (let i = 0; i < this.enemies.length; i++) {
			if (this.enemies[i].retired) continue;
			if (intersects(player.area, this.enemies[i].area)) {
				player.getHit();
				if (this.manager) this.manager.onPlayerHit();
				break;
			}
		}

		deleteRetirables(this.enemyProj);

		for (let i = 0; i < this.enemies.length; i++) {
			if (this.enemies[i].retired) {
				this.enemyWeight -= this.enemies[i].weight;
				this.enemies[i] = this.enemies[this.enemies.length - 1];
				this.enemies.pop();
				i--;
			}
		}

		for (let i = 0; i < this.bgParticles.length; i++) {
			this.bgParticles[i].timeStep(step);
		}
		for (let i = 0; i < this.particles.length; i++) {
			const part = this.particles[i];
			if (part.autonomous) part.timeStep(step);
		}
		deleteRetirables(this.bgParticles);
		deleteRetirables(this.particles);
	},

	redraw() {
		for (let i = 0; i < this.bgParticles.length; i++) {
			this.bgParticles[i].draw();
		}
		for (let i = 0; i < this.enemies.length; i++) {
			this.enemies[i].draw();
		}
		for (let i = 0; i < this.playerProj.length; i++) {
			this.playerProj[i].draw();
		}
		for (let i = 0; i < this.enemyProj.length; i++) {
			this.enemyProj[i].draw();
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].draw();
		}
		this.player.draw();
		this.player.drawCursor();
	},

	isDangerFree() { // Loopholes possible e.g. a particle that spawns danger
		return this.enemies.length == 0 && this.enemyProj.length == 0;
	},

	hasNoEnemies() {
		return this.enemies.length == 0;
	},
};

export default playField;
