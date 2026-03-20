function rotate32(value, rotationNumber) {
    return (value << rotationNumber) | (value >>> (32 - rotationNumber));
}

const POW_2_32 = ((1 << 30) * 4);
const INV_2_32 = 1 / POW_2_32;

// 128 bit string hash, specifically for seeding RNG
// From https://stackoverflow.com/a/47593316
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

// Implementation of xoshiro128++, output mapped to [0,1) like Math.random()
export class PseudorandomGenerator {
    static fromString(str) {
        return new PseudorandomGenerator(cyrb128(str));
    }

    constructor(rawSeed) {
        this.state = new Array(4).fill(0).map((_, i) => (rawSeed[i] | 0));
        for (let i = 0; i < 10; i++) {
            this.next();
        }
    }

    next() {
        const s = this.state;
        let result = (rotate32(s[0] + s[3], 7) + s[0]) | 0;
        if (result < 0) result += POW_2_32;

        const t = s[1] << 9;
        s[2] ^= s[0];
        s[3] ^= s[1];
        s[1] ^= s[2];
        s[0] ^= s[3];
        s[2] ^= t;
        s[3] = rotate32(s[3], 11);

        return result * INV_2_32;
    }
}
