import { createAttackProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import controls from "../controls.js";
import { ctx } from "../drawing.js";
import Player from "../player.js";
import playField from "../playField.js";
import { shootSpread, shootSpreadAsPlayer, shootWithAngularOffset } from "../projectileCreation.js";
import BallPProj from "../projectiles/player/ballPProj.js";
import ExplodingBallPProj from "../projectiles/player/explodingBallPProj.js";
import FireworkProj from "../projectiles/player/fireworkProj.js";
import PointPProj from "../projectiles/player/pointPProj.js";

const PRIMARY_COLOR = new Color(false, '#7FF');
const SECONDARY_COLOR = new Color(false, '#FFF');

const NUM_CROSSHAIRS = 4;
const CROSSHAIR_IN_RAD_NORMAL = 10;
const CROSSHAIR_SPECIAL_EXTRA_RAD = 14;
const CROSSHAIR_LENGTH = 15;
const CROSSHAIR_SWITCH_RATE = 0.2;

function lerp(t) {
    return t * t * (3 - 2 * t);
}

export class DualWeapon {
    constructor(lightComponent, heavyComponent) {
        this.lightComponent = lightComponent;
        this.heavyComponent = heavyComponent;

        this.fireTimer = 0;
        this.wasRightClicking = false;

        this.color = PRIMARY_COLOR;

        // For tutorial
        this.hasStartedAHeavyAttack = false;
        this.hasFinishedAHeavyAttack = false;

        // Cursor
        this.cursorSwitch = 0;
        this.cursorSpecialCharge = 0;
    }

    drawCursor() {
        if (!controls.mouse.inBounds) return;
        const mouse = controls.mouse;

        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = 5;
        ctx.fillStyle = this.color.getStr();

        const inRad = CROSSHAIR_IN_RAD_NORMAL + lerp(this.cursorSwitch) * CROSSHAIR_SPECIAL_EXTRA_RAD;
        const outRad = inRad + CROSSHAIR_LENGTH;

        for (let i = 0; i < NUM_CROSSHAIRS; i++) {
            const angle = 2 * Math.PI * i / NUM_CROSSHAIRS;
            ctx.beginPath();
            ctx.moveTo(mouse.x + inRad * Math.cos(angle), mouse.y + inRad * Math.sin(angle));
            ctx.lineTo(mouse.x + outRad * Math.cos(angle), mouse.y + outRad * Math.sin(angle));
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.lineWidth = 8;
        const deviation = this.cursorSpecialCharge * Math.PI;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16, 0.5 * Math.PI - deviation, 0.5 * Math.PI + deviation);
        ctx.stroke();
    }

    timeStep(dt) {
        let dtAdded = false;
        let forcedHeavyShot = (this.wasRightClicking && !controls.mouse.rightHeld);
        if (this.heavyComponent.isContinuing() || controls.mouse.rightHeld || forcedHeavyShot) {
            this.cursorSwitch = Math.min(1, this.cursorSwitch + dt * CROSSHAIR_SWITCH_RATE);

            this.fireTimer += dt;
            if (this.heavyComponent.isContinuing()) {
                this.cursorSpecialCharge = 0;
            } else {
                this.cursorSpecialCharge = Math.min(1, this.fireTimer / this.heavyComponent.getDelay());
            }

            dtAdded = true;
            while (true) {
                if (!this.heavyComponent.isContinuing()) {
                    if (this.hasStartedAHeavyAttack) {
                        this.hasFinishedAHeavyAttack = true;
                    }
                    if (!forcedHeavyShot && !controls.mouse.leftHeld) break;
                }
                if (this.fireTimer >= this.heavyComponent.getDelay()) {
                    this.fireTimer -= this.heavyComponent.getDelay();
                    this.heavyComponent.fire(this.fireTimer);
                    this.hasStartedAHeavyAttack = true;
                } else {
                    break;
                }
                forcedHeavyShot = false;
            }
        } else {
            this.cursorSwitch = Math.max(0, this.cursorSwitch - dt * CROSSHAIR_SWITCH_RATE);
            this.cursorSpecialCharge = 0;
        }

        if (!this.heavyComponent.isContinuing() && !controls.mouse.rightHeld) {
            this.fireTimer = Math.min(this.fireTimer, this.lightComponent.getDelay());
            if (!dtAdded) this.fireTimer += dt;
            dtAdded = true;
            if (controls.mouse.leftHeld) {
                while (this.fireTimer >= this.lightComponent.getDelay()) {
                    this.fireTimer -= this.lightComponent.getDelay();
                    this.lightComponent.fire(this.fireTimer);
                }
            }
        } else if (controls.mouse.rightHeld) {
            this.fireTimer = Math.min(this.fireTimer, this.heavyComponent.getDelay());
        }
        if (this.heavyComponent.isContinuing() || (controls.mouse.rightHeld && this.fireTimer >= this.heavyComponent.getDelay())) {
            this.color = SECONDARY_COLOR;
        } else {
            this.color = PRIMARY_COLOR;
        }
        this.wasRightClicking = controls.mouse.rightHeld;

        if (!dtAdded) {
            console.log("[!!!] Dual weapon: dt added later than expected");
            this.fireTimer += dt;
        }
    }
}

function getFromArrayOrSingleValue(source, index) {
    return Array.isArray(source) ? source[index] : source;
}

export class DummyDualWeaponComponent {
    constructor() { }
    fire(partialDt) { }
    getDelay() { return Infinity; }
    isContinuing() { return false; }
}

export class BasicDualWeaponComponent {
    constructor(fireTime, numShots, spread, variance, speed, projectileGenerator) {
        this.fireTime = fireTime;
        this.numShots = numShots;
        this.spread = spread;
        this.variance = variance;
        this.speed = speed;
        this.projectileGenerator = projectileGenerator;
    }

    fire(partialDt) {
        shootSpreadAsPlayer(this.numShots, this.spread, this.variance, this.speed, partialDt, this.projectileGenerator);
    }

    getDelay() {
        return this.fireTime;
    }

    isContinuing() {
        return false;
    }
}

export class MultiDualWeaponComponent {
    constructor(numRounds, mainDelay, subDelays, projCounts, spreads, variances, speeds, projectileGenerators) {
        this.numRounds = numRounds;
        this.mainDelay = mainDelay;
        this.subDelays = subDelays;
        this.projCounts = projCounts;
        this.spreads = spreads;
        this.variances = variances;
        this.speeds = speeds;
        this.projectileGenerators = projectileGenerators;

        this.roundIndex = 0;
    }

    fire(partialDt) {
        shootSpreadAsPlayer(
            getFromArrayOrSingleValue(this.projCounts, this.roundIndex),
            getFromArrayOrSingleValue(this.spreads, this.roundIndex),
            getFromArrayOrSingleValue(this.variances, this.roundIndex),
            getFromArrayOrSingleValue(this.speeds, this.roundIndex),
            partialDt,
            getFromArrayOrSingleValue(this.projectileGenerators, this.roundIndex)
        );
        this.roundIndex = (this.roundIndex + 1) % this.numRounds;
    }

    getDelay() {
        if (this.roundIndex == 0) {
            return this.mainDelay;
        } else {
            return getFromArrayOrSingleValue(this.subDelays, this.roundIndex - 1);
        }
    }

    isContinuing() {
        return this.roundIndex != 0;
    }
}

export class VolleyDualWeaponComponent {
    constructor(numRounds, mainDelay, subDelay, sideProjCount, spread, offsetSpread, speed, projectileGenerator) {
        this.numRounds = numRounds;
        this.mainDelay = mainDelay;
        this.subDelay = subDelay;
        this.sideProjCount = sideProjCount;
        this.spread = spread;
        this.offsetSpread = offsetSpread;
        this.speed = speed;
        this.projectileGenerator = projectileGenerator;

        this.subRound = 0;
        this.roundIndex = 0;
    }

    fire(partialDt) {
        const dx = controls.mouse.x - playField.player.x;
        const dy = controls.mouse.y - playField.player.y;
        const baseAngle = Math.atan2(dy, dx);
        if (this.subRound == 0) {
            shootWithAngularOffset(playField.player.x, playField.player.y, baseAngle, this.speed, 0, partialDt, this.projectileGenerator);
        } else {
            const angleChange = this.spread * this.subRound / this.sideProjCount;
            const offset = this.offsetSpread * this.subRound / this.sideProjCount;
            shootWithAngularOffset(playField.player.x, playField.player.y, baseAngle + angleChange, this.speed, offset, partialDt, this.projectileGenerator);
            shootWithAngularOffset(playField.player.x, playField.player.y, baseAngle - angleChange, this.speed, -offset, partialDt, this.projectileGenerator);
        }

        this.subRound++;
        if (this.subRound >= this.sideProjCount) {
            this.subRound = 0;
            this.roundIndex = (this.roundIndex + 1) % this.numRounds;
        }
    }

    getDelay() {
        if (this.roundIndex == 0 && this.subRound == 0) {
            return this.mainDelay;
        } else {
            return this.subDelay;
        }
    }

    isContinuing() {
        return !(this.roundIndex == 0 && this.subRound == 0);
    }
}

export const stockLightComponents = {
    MachineGun: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                3, // Delay
                1, // # Bullets
                0, // Spread
                0.01, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new PointPProj(x, y, dx, dy, PRIMARY_COLOR, () => (createAttackProfile(
                        1, // Damage
                        3, // Overflow deduction coefficient
                        0, // Free hits (pierce-1)
                    )))
                )
            );
        }
    },
    Spread: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                22, // Delay
                7, // # Bullets
                0.1, // Spread
                0, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new PointPProj(x, y, dx, dy, PRIMARY_COLOR, () => (createAttackProfile(
                        1, // Damage
                        3, // Overflow deduction coefficient
                        0, // Free hits (pierce-1)
                    )))
                )
            );
        }
    },
    Heavy: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                30, // Delay
                1, // # Bullets
                0, // Spread
                0, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new BallPProj(x, y, dx, dy,
                        10, // Radius
                        -1, // Duration
                        0, // # Bounces
                        PRIMARY_COLOR, () => (createAttackProfile(
                            10, // Damage
                            1, // Overflow deduction coefficient
                            0, // Free hits (pierce-1)
                        ))
                    )
                )
            );
        }
    },
    Splitter: (function () {
        const PROJECTILE_PARAMS = {
            radius: 10,
            duration: 20,
            attackProfileGenerator: () => (createAttackProfile(
                1, // Damage
                3, // Overflow deduction coefficient
                0, // Free hits (pierce-1)
            )),
            explode: (x, y, angle) => {
                shootSpread(
                    x, y,
                    7, // # Sub bullets
                    angle,
                    0.2, // Spread
                    0, // Variance
                    25, // Speed
                    0, // Headstart
                    0, // (PartialDt)
                    (x, y, dx, dy) => (
                        new PointPProj(x, y, dx, dy, PRIMARY_COLOR, () => (createAttackProfile(
                            1, // Damage
                            3, // Overflow deduction coefficient
                            0, // Free hits (pierce-1)
                        )))
                    )
                );
            },
        };

        class Splitter extends BasicDualWeaponComponent {
            constructor() {
                super(
                    20, // Delay
                    1, // # Bullets
                    0, // Spread
                    0, // Variance
                    15, // Speed
                    (x, y, dx, dy) => (
                        new ExplodingBallPProj(x, y, dx, dy, PRIMARY_COLOR, PROJECTILE_PARAMS)
                    )
                );
            }
        }

        return Splitter;
    })(),
};

export const stockHeavyComponents = {
    Volley: class extends VolleyDualWeaponComponent {
        constructor() {
            super(
                15, // # Rounds
                120, // Main delay
                0.5, // Time between bullets
                8, // Bullets from center including center
                0.06, // Total spread
                Math.PI / 2, // Total offset spread
                25, // Speed
                (x, y, dx, dy) => (
                    new PointPProj(x, y, dx, dy, SECONDARY_COLOR, () => (createAttackProfile(
                        1, // Damage
                        3, // Overflow deduction coefficient
                        0, // Free hits (pierce-1)
                    )))
                )
            );
        }
    },
    Wave: class extends MultiDualWeaponComponent {
        constructor() {
            super(
                3, // # Rounds
                120, // Main Delay
                0, // Sub delay
                [31, 30, 29], // # Bullets
                0.05, // Spread
                0, // Variance
                [25, 22.5, 20], // Speed
                (x, y, dx, dy) => (
                    new PointPProj(x, y, dx, dy, SECONDARY_COLOR, () => (createAttackProfile(
                        1, // Damage
                        3, // Overflow deduction coefficient
                        0, // Free hits (pierce-1)
                    )))
                )
            );
        }
    },
    Buster: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                120, // Delay
                1, // # Bullets
                0, // Spread
                0, // Variance
                15, // Speed
                (x, y, dx, dy) => (
                    new BallPProj(x, y, dx, dy,
                        20, // Radius
                        -1, // Duration
                        0, // # Bounces
                        SECONDARY_COLOR, () => (createAttackProfile(
                            100, // Damage
                            1, // Overflow deduction coefficient
                            0, // Free hits (pierce-1)
                        ))
                    )
                )
            );
        }
    },
    Firework: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                120, // Delay
                1, // # Bullets
                0, // Spread
                0, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new FireworkProj(x, y, dx, dy,
                        12, // Radius
                        40, // Duration
                        50, // Projectiles in 1 of 2 rings
                        30, // Speed 1
                        25, // Speed 2
                        SECONDARY_COLOR,
                        () => (createAttackProfile( // Primary
                            1, // Damage
                            3, // Overflow deduction coefficient
                            0, // Free hits (pierce-1)
                        )),
                        () => (createAttackProfile( // Secondary
                            1, // Damage
                            3, // Overflow deduction coefficient
                            0, // Free hits (pierce-1)
                        ))
                    )
                )
            );
        }
    },
};
