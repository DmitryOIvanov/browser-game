const FRAMES_PER_SAMPLE = 30;

function getEmptySample(){
    return {
        totalRealMS: 0,
        maxRealMS: -1,
        totalProjectedMS: 0
    };
}

function roundTo1Decimal(num){return Math.floor(10*num)/10;}

export default class FpsTracker{
    constructor(){
        this.framesCollected = 0;
        this.unfinishedSample = getEmptySample();
        this.fullFrameStart = performance.now();
        this.productiveFrameStart = this.fullFrameStart;
        this.finishedSample = null;
    }

    startProductiveFrame(){
        this.productiveFrameStart = performance.now();
    }

    endFrame(){
        const frameEnd = performance.now();
        const fullFrameMS = frameEnd - this.fullFrameStart;
        const productiveFrameMS = frameEnd - this.productiveFrameStart;
        this.unfinishedSample.totalRealMS += fullFrameMS;
        this.unfinishedSample.maxRealMS = Math.max(fullFrameMS, this.unfinishedSample.maxRealMS);
        this.unfinishedSample.totalProjectedMS += productiveFrameMS;
        this.framesCollected++;
        if(this.framesCollected == FRAMES_PER_SAMPLE){
            this.finishedSample = this.unfinishedSample;
            this.unfinishedSample = getEmptySample();
            this.framesCollected = 0;
        }
        this.fullFrameStart = frameEnd;
    }

    getLatestFinishedSampleInfo(){
        if(this.finishedSample){
            return {
                realFPSText: `Real FPS: ${roundTo1Decimal(1000*FRAMES_PER_SAMPLE/this.finishedSample.totalRealMS)}, min: ${roundTo1Decimal(1000/this.finishedSample.maxRealMS)}`,
                projectedFPSText: `Projected FPS: ${roundTo1Decimal(1000*FRAMES_PER_SAMPLE/this.finishedSample.totalProjectedMS)}`
            };
        }else{
            return {
                realFPSText: "",
                projectedFPSText: ""
            };
        }
    }
}