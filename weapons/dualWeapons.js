import { createAttackProfile } from "../attackAndDefense.js";
import { FlatColor, RainbowColor } from "../color.js";
import controls from "../controls.js";
import { ctx } from "../drawing.js";
import { decToZero, posMod } from "../extraMath.js";
import Player from "../player.js";
import playField from "../playField.js";
import { shoot, shootSpread, shootSpreadAsPlayer, shootWithAngularOffset } from "../projectileCreation.js";
import BallPProj from "../projectiles/player/ballPProj.js";
import ExplodingBallPProj from "../projectiles/player/explodingBallPProj.js";
import FireworkProj from "../projectiles/player/fireworkProj.js";
import PointPProj from "../projectiles/player/pointPProj.js";

const CROSSHAIR_IN_RAD = 10;
const CROSSHAIR_LENGTH = 20;
const CROSSHAIR_LINE_WIDTH = 5;
const CROSSHAIR_CENTER_RAD = 5;
const CROSSHAIR_SPECIAL_LINE_WIDTH = 7;
const CROSSHAIR_SPECIAL_RADIUS = 20;
const CHARGE_BAR_ANGLE_CORRECTION = Math.asin(0.5 * CROSSHAIR_LINE_WIDTH / (CROSSHAIR_SPECIAL_RADIUS + CROSSHAIR_SPECIAL_LINE_WIDTH * 0.5));

const PRIMARY_COLOR = new FlatColor('#7FF');
const SECONDARY_COLOR = new FlatColor('#FFF');

const CHARGE_FLASH_TOTAL_TIME = 27;
const CHARGE_FlASH_ALT_TIME = 3;

export class DualWeapon {
    constructor(primaryComponent, secondaryComponent) {
        this.primaryComponent = primaryComponent;
        this.secondaryComponent = secondaryComponent;

        this.primaryTimer = 0;
        this.secondaryTimer = secondaryComponent.getDelay();
        this.canFireSecondary = true;

        this.color = PRIMARY_COLOR;
        this.chargeFlash = CHARGE_FLASH_TOTAL_TIME;
        this.flashTriggered = true;

        // For tutorial
        this.hasStartedAHeavyAttack = false;
        this.hasFinishedAHeavyAttack = false;
    }

    disableSecondary() { this.canFireSecondary = false; }
    enableSecondary() { this.canFireSecondary = true; }
    resetSecondaryCooldown() {
        if (!this.secondaryComponent.isContinuing()) {
            this.secondaryTimer = this.secondaryComponent.getDelay();
        }
    }

    drawCursor() {
        if (!controls.mouse.inBounds) return;
        const mouse = controls.mouse;

        ctx.strokeStyle = this.color.getStr();
        ctx.lineWidth = CROSSHAIR_LINE_WIDTH;
        ctx.fillStyle = this.color.getStr();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, CROSSHAIR_CENTER_RAD, 0, 2 * Math.PI);
        ctx.fill();

        const inRad = CROSSHAIR_IN_RAD;
        const outRad = inRad + CROSSHAIR_LENGTH;

        for (let i = 0; i < 4; i++) {
            const angle = 2 * Math.PI * (i + 0.5) / 4;
            ctx.beginPath();
            ctx.moveTo(mouse.x + inRad * Math.cos(angle), mouse.y + inRad * Math.sin(angle));
            ctx.lineTo(mouse.x + outRad * Math.cos(angle), mouse.y + outRad * Math.sin(angle));
            ctx.stroke();
        }

        if (!this.secondaryComponent.isContinuing()) {
            const portion = CHARGE_BAR_ANGLE_CORRECTION + (0.5 * Math.PI - 2 * CHARGE_BAR_ANGLE_CORRECTION) * this.secondaryTimer / this.secondaryComponent.getDelay();
            ctx.lineWidth = CROSSHAIR_SPECIAL_LINE_WIDTH;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, CROSSHAIR_SPECIAL_RADIUS, 0.25 * Math.PI, 0.25 * Math.PI - portion, true);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, CROSSHAIR_SPECIAL_RADIUS, 0.75 * Math.PI, 0.75 * Math.PI + portion);
            ctx.stroke();
        }
    }

    timestep(dt) {
        this.chargeFlash = Math.min(this.chargeFlash + dt, CHARGE_FLASH_TOTAL_TIME);

        if (!this.secondaryComponent.isContinuing()) {
            this.primaryTimer += dt;
            while (true) {
                if (controls.mouse.leftHeld || this.primaryComponent.isContinuing()) {
                    const delay = this.primaryComponent.getDelay();
                    if (this.primaryTimer >= delay) {
                        this.primaryTimer -= delay;
                        this.primaryComponent.fire(this.primaryTimer);
                        continue;
                    }
                }
                break;
            }
        }
        this.primaryTimer = Math.min(this.primaryTimer, this.primaryComponent.getDelay());

        this.secondaryTimer += dt;
        while (true) {
            if ((controls.mouse.rightHeld && this.canFireSecondary) || this.secondaryComponent.isContinuing()) {
                const delay = this.secondaryComponent.getDelay();
                if (this.secondaryTimer >= delay) {
                    this.hasStartedAHeavyAttack = true;
                    this.secondaryTimer -= delay;
                    this.secondaryComponent.fire(this.secondaryTimer);
                    if (this.hasStartedAHeavyAttack && !this.secondaryComponent.isContinuing()) this.hasFinishedAHeavyAttack = true;
                    this.flashTriggered = false;
                    this.chargeFlash = CHARGE_FLASH_TOTAL_TIME;
                    continue;
                }
            }
            break;
        }
        this.secondaryTimer = Math.min(this.secondaryTimer, this.secondaryComponent.getDelay());

        if (this.secondaryTimer >= this.secondaryComponent.getDelay() && !this.secondaryComponent.isContinuing() && !this.flashTriggered) {
            this.flashTriggered = true;
            this.chargeFlash = 0;
        }

        if (this.secondaryComponent.isContinuing()) {
            this.color = SECONDARY_COLOR;
        } else if (this.chargeFlash < CHARGE_FLASH_TOTAL_TIME && posMod(this.chargeFlash / CHARGE_FlASH_ALT_TIME, 2) < 1) {
            this.color = SECONDARY_COLOR;
        } else {
            this.color = PRIMARY_COLOR;
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
    constructor(numRounds, mainDelay, subDelay, sideProjCount, forwardOffset, sideOffset, backOffset, angleSpread, speed, extraSpeed, projectileGenerator) {
        this.numRounds = numRounds;
        this.mainDelay = mainDelay;
        this.subDelay = subDelay;
        this.sideProjCount = sideProjCount;
        this.forwardOffset = forwardOffset;
        this.sideOffset = sideOffset;
        this.backOffset = backOffset;
        this.angleSpread = angleSpread;
        this.speed = speed;
        this.extraSpeed = extraSpeed;
        this.projectileGenerator = projectileGenerator;

        this.roundIndex = 0;
    }

    fire(partialDt) {
        const dx = controls.mouse.x - playField.player.x;
        const dy = controls.mouse.y - playField.player.y;
        const baseAngle = Math.atan2(dy, dx);
        const cos = Math.cos(baseAngle);
        const sin = Math.sin(baseAngle);

        const primaryX = playField.player.x + this.forwardOffset * cos;
        const primaryY = playField.player.y + this.forwardOffset * sin;
        shoot(primaryX, primaryY, baseAngle, this.speed + this.extraSpeed, partialDt, this.projectileGenerator);
        for (let bullet = 1; bullet <= this.sideProjCount; bullet++) {
            const specificSpeed = this.speed + this.extraSpeed * (1 - bullet / this.sideProjCount);
            for (let bulletDir = -1; bulletDir <= 1; bulletDir += 2) {
                const x1 = primaryX + bullet * (- this.backOffset * cos - bulletDir * this.sideOffset * sin);
                const y1 = primaryY + bullet * (- this.backOffset * sin + bulletDir * this.sideOffset * cos);
                shoot(x1, y1, baseAngle + bulletDir * bullet * this.angleSpread, specificSpeed, partialDt, this.projectileGenerator);
            }
        }

        this.roundIndex = (this.roundIndex + 1) % this.numRounds;
    }

    getDelay() {
        if (this.roundIndex == 0) {
            return this.mainDelay;
        } else {
            return this.subDelay;
        }
    }

    isContinuing() {
        return this.roundIndex != 0;
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
                23, // Delay
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
                        false, // duration is soft? (ball exits screen instead of disappearing instantly)
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
                    5, // # Sub bullets
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
    Ricochet: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                12, // Delay
                1, // # Bullets
                0, // Spread
                0, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new BallPProj(x, y, dx, dy,
                        10, // Radius
                        -1, // Duration
                        false, // duration is soft? (ball exits screen instead of disappearing instantly)
                        2, // # Bounces
                        PRIMARY_COLOR, () => (createAttackProfile(
                            1, // Damage
                            3, // Overflow deduction coefficient
                            3, // Free hits (pierce-1)
                        ))
                    )
                )
            );
        }
    },
};

export const stockHeavyComponents = {
    // numRounds, mainDelay, subDelay, sideProjCount, forwardOffset, sideOffset, backOffset, angleSpread, speed, projectileGenerator
    Volley: class extends VolleyDualWeaponComponent {
        constructor() {
            super(
                8, // # Rounds
                600, // Main delay
                5, // Time between shots
                7, // Bullets from center excluding center
                20, // Forward offset of wedge
                2, // Sideways offset of sucessive bullets
                2, // Backwatds offset of successive bullets
                0.01, // angle difference of bullets in one wedge
                25, // Speed
                2.5, // Extra speed given to arrow tip
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
                5, // # Rounds
                600, // Main Delay
                0, // Sub delay
                [31, 30, 31, 30, 31], // # Bullets
                0.05, // Spread
                0, // Variance
                [27, 26, 25, 24, 23], // Speed
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
                        false, // duration is soft? (ball exits screen instead of disappearing instantly)
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
                600, // Delay
                1, // # Bullets
                0, // Spread
                0, // Variance
                20, // Speed
                (x, y, dx, dy) => (
                    new FireworkProj(x, y, dx, dy,
                        12, // Radius
                        40, // Duration
                        140, // Projectiles in 1 of 2 rings
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
    bounceMayhem: class extends BasicDualWeaponComponent {
        constructor() {
            super(
                600, // Delay
                7, // # Bullets
                0.2, // Spread
                0, // Variance
                25, // Speed
                (x, y, dx, dy) => (
                    new BallPProj(x, y, dx, dy,
                        16, // Radius
                        240, // Duration
                        true, // duration is soft? (ball exits screen instead of disappearing instantly)
                        -1, // # Bounces
                        PRIMARY_COLOR, () => (createAttackProfile(
                            1, // Damage
                            3, // Overflow deduction coefficient
                            24, // Free hits (pierce-1)
                        ))
                    )
                )
            );
        }
    },
};
