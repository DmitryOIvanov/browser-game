export const QT_I = [0, 1, 0, 0];
export const QT_J = [0, 0, 1, 0];
export const QT_K = [0, 0, 0, 1];

export function qtAdd(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
        a[3] + b[3],
    ];
}

export function qtMult(a, b) {
    return [
        a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
        a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
        a[0] * b[2] + a[2] * b[0] + a[3] * b[1] - a[1] * b[3],
        a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1],
    ];
}

export function qtInv(a) {
    const invMagSqr = 1 / (a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
    return [
        a[0] * invMagSqr,
        - a[1] * invMagSqr,
        - a[2] * invMagSqr,
        - a[3] * invMagSqr,
    ];
}

export function qtRandomUnit() {
    const a = Math.random();
    const a1 = Math.sqrt(a);
    const a2 = Math.sqrt(1 - a);
    const b = 2 * Math.PI * Math.random();
    const c = 2 * Math.PI * Math.random();
    return [
        a1 * Math.cos(b),
        a1 * Math.sin(b),
        a2 * Math.cos(c),
        a2 * Math.sin(c),
    ];
}
