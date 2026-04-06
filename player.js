import { CircleArea } from "./areas.js";
import { FlatColor, RainbowColor } from "./color.js";
import controls from "./controls.js";
import { addToGlobalAlphaStack, ctx, popFromGlobalStack } from "./drawing.js";
import { decToZero, normalizeAngle } from "./extraMath.js";
import BigExplosionParticle from "./particles/bigExplosionParticle.js";
import ShrinkingCircleParticle from "./particles/shrinkingCircleParticle.js";
import playField from "./playField.js";
import ShockAuraEffect from "./shockAuraEffect.js";

const HIT_RAD = 10;
const ROT_SPEED = 0.01;
const OUT_RAD = 20;
const IN_RAD = 12;
const OUT_THICK = 5;
const IN_THICK = 2;

const MOVE_SPEED = 5;
const DEFAULT_CURSOR_SPEED = 0.0173;

const SLOWMO_SPEED = 0.2;
const SLOWMO_FULL_CHARGE = 450;
const SLOWMO_DRAIN_RATE = 1;
const SLOWMO_CHARGE_RATE = 1;
const SLOWMO_COOLDOWN = 60;

const HIT_SLOW_MAG = 0.1;
const HIT_SLOW_DUR = 50;
const HIT_COOLDOWN_DUR = 120;
const HIT_EXTRA_ROT_SPEED = 0.04;

const MAX_HP = 5;
const HP_FLASH_TIME = 60;

const HIT_SHOCK_INITIAL_RATE = 2.5;
const HIT_SHOCK_DEATH_DECAY_MULTIPLIER = -2;
const HIT_SHOCK_PARAMS = {
    color: FlatColor.WHITE,
    radius: 25,
    arcSpawnRate: 0,
    arcSpawnVariance: 2,
    arcSpawnAutoDecay: HIT_SHOCK_INITIAL_RATE / HIT_COOLDOWN_DUR,
    arcDuration: 6,
    minMoves: 4,
    extraMoveChance: 0.6,
    moveSizeBase: 0.1,
    moveSizeVar: 0.1,
    redirectionAmount: 0.5,
    arcThickness: 5,
    radDeviation: 0.5,
};

const DEATH_SHOCK_TIME = 60;
const DEATH_AFTER_TIME = 80;

export default class Player {
    static IN_RAD = IN_RAD;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rot = 0;
        this.cursorRot = 0;
        this.area = new CircleArea(this.x, this.y, HIT_RAD);
        this.hitCooldown = 0;
        this.hitSlowCooldown = 0;
        this.hitSlowFactor = 1;
        this.hp = MAX_HP;
        this.hpMeterDir = 0;
        this.hpFlash = 0;

        this.inSlowMo = false;
        this.slowMeterDir = 0;
        this.slowMoCharge = SLOWMO_FULL_CHARGE;
        this.slowMoCoolDown = 0;

        this.weapon = null;
        this.exp = 0;

        this.hitShockAura = new ShockAuraEffect(this.x, this.y, HIT_SHOCK_PARAMS);
        this.deathTimer = 0;
        this.deathParticleSpawned = false;
    }

    getColor() { return this.weapon == null ? FlatColor.WHITE : this.weapon.color; }

    updateAndReturnSlowMoAmount() {
        if (this.hp <= 0 && this.deathTimer >= DEATH_SHOCK_TIME) {
            return 1;
        }

        let slowMoAmount = 1;
        const slowMoKeyHeld = controls.held["Space"];
        this.inSlowMo = slowMoKeyHeld && (this.slowMoCharge > 0);
        if (this.inSlowMo) slowMoAmount *= SLOWMO_SPEED;
        this.hitSlowCooldown = decToZero(this.hitSlowCooldown, 1);
        if (this.hitSlowCooldown > 0) {
            const t = 1 - this.hitSlowCooldown / HIT_SLOW_DUR;
            slowMoAmount *= HIT_SLOW_MAG + (1 - HIT_SLOW_MAG) * t * t * t;
        }
        return slowMoAmount;
    }

    draw() {
        if (this.hp <= 0 && this.deathTimer >= DEATH_SHOCK_TIME) {
            return;
        }

        this.hitShockAura.drawLower();

        // --- Player body ---
        ctx.strokeStyle = this.getColor().getStr();
        ctx.lineWidth = OUT_THICK;
        ctx.beginPath();
        ctx.moveTo(this.x + OUT_RAD * Math.cos(2 * Math.PI * this.rot), this.y + OUT_RAD * Math.sin(2 * Math.PI * this.rot));
        for (let i = 1; i <= 4; i++) {
            ctx.lineTo(this.x + OUT_RAD * Math.cos(2 * Math.PI * (this.rot + 0.2 * i)), this.y + OUT_RAD * Math.sin(2 * Math.PI * (this.rot + 0.2 * i)));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = IN_THICK;
        ctx.beginPath();
        ctx.moveTo(this.x + IN_RAD * Math.cos(2 * Math.PI * this.rot), this.y - IN_RAD * Math.sin(2 * Math.PI * this.rot));
        for (let i = 1; i <= 4; i++) {
            ctx.lineTo(this.x + IN_RAD * Math.cos(2 * Math.PI * (this.rot + 0.2 * i)), this.y - IN_RAD * Math.sin(2 * Math.PI * (this.rot + 0.2 * i)));
        }
        ctx.closePath();
        ctx.stroke();

        // --- HP bars ---
        if (this.hitCooldown <= 0) this.hpMeterDir = 0;
        if (this.hitCooldown > 0 || this.hpFlash > 0) {
            let opacity = 1;
            if (this.hitCooldown <= 0) opacity = this.hpFlash / HP_FLASH_TIME;
            addToGlobalAlphaStack(opacity);

            ctx.lineWidth = 5 * this.hitCooldown / HIT_COOLDOWN_DUR;

            if (this.hpMeterDir == 0) {
                this.hpMeterDir = this.x <= 0.5 * playField.x ? 1 : -1;
            } else if (this.hpMeterDir * (this.x / playField.x - 0.5) > 0.4) {
                this.hpMeterDir = -this.hpMeterDir;
            }

            const HP_BAR_LINE_WIDTH = 1.5;
            const BAR_ANGULAR_WIDTH = 0.3;
            const ANGULAR_GAP = 0.1;
            const BAR_LENGTH = 25;
            const BAR_INNER_RAD = 40;
            const VERTICAL_CORRECTION = 1.5;
            const HP_FLASH_PERIOD = 5;
            const HP_FLASH_DENSITY = 0.4;
            const HP_FLASH_PORTION = 0.5;

            ctx.lineWidth = HP_BAR_LINE_WIDTH;
            ctx.fillStyle = this.getColor().getStr();
            for (let i = 0; i < MAX_HP; i++) {
                const isInverted = (this.hpMeterDir < 0);

                const totalAngularWidth = MAX_HP * BAR_ANGULAR_WIDTH + (MAX_HP - 1) * ANGULAR_GAP;
                let angle1 = -0.5 * totalAngularWidth + i * (BAR_ANGULAR_WIDTH + ANGULAR_GAP) - VERTICAL_CORRECTION * (this.y / playField.y - 0.5);
                let angle2 = angle1 + BAR_ANGULAR_WIDTH;
                if (isInverted) {
                    angle1 = Math.PI - angle1;
                    angle2 = Math.PI - angle2;
                }
                ctx.beginPath();
                ctx.arc(this.x, this.y, BAR_INNER_RAD, angle1, angle2, isInverted);
                ctx.arc(this.x, this.y, BAR_INNER_RAD + BAR_LENGTH, angle2, angle1, !isInverted);
                ctx.closePath();
                ctx.stroke();

                const upsideDownI = MAX_HP - 1 - i;
                if (upsideDownI < this.hp) {
                    ctx.fill();
                } else if (upsideDownI == this.hp) {
                    const hitFactor = this.hitCooldown / HIT_COOLDOWN_DUR;
                    if (hitFactor > 1 - HP_FLASH_PORTION) {
                        const periodValue = (HIT_COOLDOWN_DUR - this.hitCooldown) % HP_FLASH_PERIOD;
                        if (periodValue < 0.5 * HP_FLASH_PERIOD) {
                            ctx.fill();
                        }
                    }
                }
            }

            popFromGlobalStack();
        }

        // --- Slow mo meter ---
        if (this.slowMoCharge >= SLOWMO_FULL_CHARGE) this.slowMeterDir = 0;
        if (this.slowMoCharge > 0 && this.slowMoCharge < SLOWMO_FULL_CHARGE) {
            if (this.slowMeterDir == 0) {
                this.slowMeterDir = this.x <= 0.5 * playField.x ? 1 : -1;
            } else if (this.slowMeterDir * (this.x / playField.x - 0.5) > 0.4) {
                this.slowMeterDir = -this.slowMeterDir;
            }
            const vertCorrection = 1.2 * (this.y / playField.y - 0.5);
            const portion = this.slowMoCharge / SLOWMO_FULL_CHARGE;

            //Deciding color
            const margin = 0.2;
            let marginedPortion = (portion - margin) / (1 - 2 * margin);
            if (marginedPortion < 0) marginedPortion = 0;
            if (marginedPortion > 1) marginedPortion = 1;
            const col = Math.floor(marginedPortion * 255);
            ctx.strokeStyle = `rgb(255 ${col} ${col})`
            ctx.lineWidth = 7;
            ctx.beginPath();
            const angle1 = -this.slowMeterDir * vertCorrection + Math.PI * (this.slowMeterDir >= 0 ? 0.25 - 0.5 * portion : 0.75);
            const angle2 = -this.slowMeterDir * vertCorrection + Math.PI * (this.slowMeterDir >= 0 ? 0.25 : 0.75 + 0.5 * portion);
            ctx.arc(this.x, this.y, 30, angle1, angle2);
            ctx.stroke();
        }

        this.hitShockAura.drawUpper();
    }

    drawCursor() {
        if (this.hp <= 0 && this.deathTimer >= DEATH_SHOCK_TIME) {
            return;
        }

        if (this.weapon && this.weapon.drawCursor) {
            this.weapon.drawCursor();
        } else {
            if (!controls.mouse.inBounds) return;
            const mouse = controls.mouse;
            ctx.strokeStyle = this.getColor().getStr();
            ctx.lineWidth = 5;
            for (let i = 0; i < 3; i++) {
                let startAngle = 2 * Math.PI * (this.cursorRot + i / 3);
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 15, startAngle, startAngle + 0.4 * Math.PI);
                ctx.stroke();
            }
            ctx.fillStyle = this.getColor().getStr();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    timestep(dt) {
        if (this.hp <= 0) {
            this.deathTimer += dt;
            if (this.deathTimer >= DEATH_SHOCK_TIME) {
                if (!this.deathParticleSpawned) {
                    playField.addParticle(new BigExplosionParticle(this.x, this.y, BigExplosionParticle.PARAMS.PLAYER_DEATH, FlatColor.WHITE));
                    this.deathParticleSpawned = true;
                }
                if (this.deathTimer >= DEATH_SHOCK_TIME + DEATH_AFTER_TIME) {
                    this.deathFinished = true;
                }
                return;
            }
        }

        this.hitCooldown = decToZero(this.hitCooldown, dt);
        if (this.inSlowMo) {
            this.slowMoCharge -= SLOWMO_DRAIN_RATE;
            if (this.slowMoCharge < 0) this.slowMoCharge = 0;
            this.slowMoCoolDown = SLOWMO_COOLDOWN;
        } else {
            if (this.slowMoCoolDown == 0) {
                this.slowMoCharge += SLOWMO_CHARGE_RATE;
                if (this.slowMoCharge > SLOWMO_FULL_CHARGE) this.slowMoCharge = SLOWMO_FULL_CHARGE;
            } else {
                this.slowMoCoolDown -= 1;
            }
        }

        const hitFactor = this.hitCooldown / HIT_COOLDOWN_DUR;
        this.rot += dt * (ROT_SPEED + HIT_EXTRA_ROT_SPEED * hitFactor);
        if (this.rot > 1) this.rot -= 1;

        let rightHeld = controls.held["KeyD"] || controls.held["ArrowRight"];
        let leftHeld = controls.held["KeyA"] || controls.held["ArrowLeft"];
        let downHeld = controls.held["KeyS"] || controls.held["ArrowDown"];
        let upHeld = controls.held["KeyW"] || controls.held["ArrowUp"];
        let vx = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0);
        let vy = (downHeld ? 1 : 0) - (upHeld ? 1 : 0);
        if (vx * vx > 0.01 && vy * vy > 0.01) {
            vx /= Math.sqrt(2);
            vy /= Math.sqrt(2);
        }
        this.x += dt * MOVE_SPEED * vx;
        if (this.x < HIT_RAD) this.x = HIT_RAD;
        if (this.x > playField.x - HIT_RAD) this.x = playField.x - HIT_RAD;
        this.y += dt * MOVE_SPEED * vy;
        if (this.y < HIT_RAD) this.y = HIT_RAD;
        if (this.y > playField.y - HIT_RAD) this.y = playField.y - HIT_RAD;

        this.area.x = this.x;
        this.area.y = this.y;

        if (this.weapon != null) {
            this.weapon.timestep(dt);
        }

        if (!(this.weapon && this.weapon.drawCursor)) {
            this.cursorRot = normalizeAngle(this.cursorRot + dt * DEFAULT_CURSOR_SPEED);
        }

        this.hitShockAura.updatePosition(this.x, this.y);
        this.hitShockAura.timestep(dt);

        this.hpFlash = decToZero(this.hpFlash, dt);
    }

    getHit() {
        if (this.hp <= 0) {
            return;
        }
        if (this.hitCooldown == 0) {
            this.hp--;
            for (let i = 0; i < 100; i++) {
                const randAngle = 2 * Math.PI * Math.random();
                let randSpeed = Math.random();
                randSpeed = randSpeed * 30;
                const vx = randSpeed * Math.cos(randAngle);
                const vy = randSpeed * Math.sin(randAngle);
                const r = 4 + 3 * Math.random();
                const dur = 5 + (5 + randSpeed) * Math.random();
                playField.addParticle(new ShrinkingCircleParticle(this.x, this.y, vx, vy, r, dur, FlatColor.WHITE));
            }
            this.hitCooldown = HIT_COOLDOWN_DUR;
            this.hitSlowCooldown = HIT_SLOW_DUR;
            this.hitShockAura.arcSpawnValue = 0;
            this.hitShockAura.arcSpawnRate = HIT_SHOCK_INITIAL_RATE;
            if (this.hp == 0) {
                this.hitShockAura.arcSpawnAutoDecay *= HIT_SHOCK_DEATH_DECAY_MULTIPLIER;
            }
        }
    }

    resetHealthAndFlash() {
        this.hp = MAX_HP;
        this.hpFlash = HP_FLASH_TIME;
    }
}
