import { CircleArea } from "./areas.js";
import Color from "./color.js";
import controls from "./controls.js";
import { ctx } from "./drawing.js";
import { decToZero, normalizeAngle } from "./extraMath.js";
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

const MAX_HP = 5;

const SHOCK_AURA_PARAMS = {
    radius: 30,
    arcDelayBase: 1,
    arcDelayVar: 2,
    arcDuration: 6.5,
    minMoves: 6,
    extraMoveChance: 0.75,
    moveSizeBase: 0.1,
    moveSizeVar: 0.1,
    redirectionAmount: 0.5,
    arcThickness: 5,
    radDeviation: 0.5,
};

export default class Player {
    static SLOWMO_SPEED = SLOWMO_SPEED;
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

        this.inSlowMo = false;
        this.slowMeterDir = 0;
        this.slowMoCharge = SLOWMO_FULL_CHARGE;
        this.slowMoCoolDown = 0;

        this.weapon = null;
        this.exp = 0;

        this.shockAura = new ShockAuraEffect(this.x, this.y, SHOCK_AURA_PARAMS);
    }

    getColor() { return this.weapon == null ? Color.WHITE : this.weapon.color; }

    draw() {
        this.shockAura.drawUpper();

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
        if (this.hitCooldown > 0) {
            ctx.lineWidth = 5 * this.hitCooldown / HIT_COOLDOWN_DUR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 40, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();

            if (this.hpMeterDir == 0) {
                this.hpMeterDir = this.x <= 0.5 * playField.x ? 1 : -1;
            } else if (this.hpMeterDir * (this.x / playField.x - 0.5) > 0.4) {
                this.hpMeterDir = -this.hpMeterDir;
            }
            ctx.lineWidth = 25;
            for (let i = 0; i < this.hp + 1; i++) {
                if (i == 0) {
                    const shownProbability = 0.7 * (1.6 * this.hitCooldown / HIT_COOLDOWN_DUR - 1);
                    if (Math.random() > shownProbability) continue;
                }

                const THICK = 0.2;
                let startAngle = (i - 2) * 0.3 - THICK * 0.5 - 1.3 * (this.y / playField.y - 0.5);
                let endAngle = startAngle + THICK;
                if (this.hpMeterDir < 0) {
                    startAngle = Math.PI - startAngle;
                    endAngle = Math.PI - endAngle;
                }
                ctx.beginPath();
                ctx.arc(this.x, this.y, 65, startAngle, endAngle, this.hpMeterDir < 0);
                ctx.closePath();
                ctx.stroke();
            }
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
    }

    drawCursor() {
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

    updateSlowmoStatus() {
        const keyHeld = (controls.held["ShiftLeft"] || controls.held["ShiftRight"] || controls.held["Space"]);
        this.inSlowMo = keyHeld && (this.slowMoCharge > 0);
    }

    timeStep(dt) {
        this.hitCooldown = decToZero(this.hitCooldown, dt);
        this.hitSlowCooldown = decToZero(this.hitSlowCooldown, 1);
        if (this.hitSlowCooldown == 0) {
            this.hitSlowFactor = 1;
        } else {
            const t = 1 - this.hitSlowCooldown / HIT_SLOW_DUR;
            this.hitSlowFactor = HIT_SLOW_MAG + (1 - HIT_SLOW_MAG) * t * t * t;
        }
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

        this.rot += dt * ROT_SPEED;
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
            this.weapon.timeStep(dt);
        }

        if (!(this.weapon && this.weapon.drawCursor)) {
            this.cursorRot = normalizeAngle(this.cursorRot + dt * DEFAULT_CURSOR_SPEED);
        }

        this.shockAura.updatePosition(this.x, this.y);
        this.shockAura.timeStep(dt);
    }

    getHit() {
        if (this.hitCooldown == 0) {
            this.hp--;
            for (let i = 0; i < 50; i++) {
                const randAngle = 2 * Math.PI * Math.random();
                let randSpeed = Math.random();
                randSpeed = randSpeed * randSpeed * 30;
                const vx = randSpeed * Math.cos(randAngle);
                const vy = randSpeed * Math.sin(randAngle);
                const r = 5 + 5 * Math.random();
                const dur = 5 + (5 + randSpeed) * Math.random();
                playField.addParticle(new ShrinkingCircleParticle(this.x, this.y, vx, vy, r, dur, this.getColor()));
            }
            this.hitCooldown = HIT_COOLDOWN_DUR;
            this.hitSlowCooldown = HIT_SLOW_DUR;
        }
    }
}
