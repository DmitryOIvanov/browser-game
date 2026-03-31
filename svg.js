export const SVG = {
    loaded: false,
    onLoad: null,

    title: null,
};

let totalNumSvgs = 0;
let numSvgsLoaded = 0;

function registerSvg(name, path) {
    totalNumSvgs++;
    SVG[name] = new Image();
    SVG[name].onload = function () {
        numSvgsLoaded++;
        if (numSvgsLoaded == totalNumSvgs) {
            SVG.loaded = true;
            if (SVG.onLoad) {
                SVG.onLoad();
            }
        }
    };
    SVG[name].src = path;
}

registerSvg("title", "./resources/svg/title.svg");

export function setSvgLoadedCallback(func) {
    if (SVG.loaded) {
        func();
    } else {
        SVG.onLoad = func;
    }
}
