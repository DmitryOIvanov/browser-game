let totalNumSvgs = 0;
let numSvgsLoaded = 0;

export const SVG = {
    loaded: false,
    onLoad: null,

    title: registerSvg("./resources/svg/title.svg"),
    weaponIcons: {
        machineGun: registerSvg("./resources/svg/weaponIcons/machineGun.svg"),
        shotgun: registerSvg("./resources/svg/weaponIcons/shotgun.svg"),
        splitter: registerSvg("./resources/svg/weaponIcons/splitter.svg"),
        ricochet: registerSvg("./resources/svg/weaponIcons/ricochet.svg"),
        volley: registerSvg("./resources/svg/weaponIcons/volley.svg"),
        wave: registerSvg("./resources/svg/weaponIcons/wave.svg"),
        starburst: registerSvg("./resources/svg/weaponIcons/starburst.svg"),
        bounceMayhem: registerSvg("./resources/svg/weaponIcons/bounceMayhem.svg"),
    },
    seedResetIcon: registerSvg("./resources/svg/seedResetIcon.svg"),
    breakScreenWeaponDisplay: registerSvg("./resources/svg/breakScreenWeaponDisplay.svg"),
};

function registerSvg(path) {
    totalNumSvgs++;
    const img = new Image();
    img.onload = function () {
        numSvgsLoaded++;
        if (numSvgsLoaded == totalNumSvgs) {
            SVG.loaded = true;
            if (SVG.onLoad) {
                SVG.onLoad();
            }
        }
    };
    img.src = path;
    return img;
}

export function setSvgLoadedCallback(func) {
    if (SVG.loaded) {
        func();
    } else {
        SVG.onLoad = func;
    }
}
