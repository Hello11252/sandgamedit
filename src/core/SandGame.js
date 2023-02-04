import {Brushes} from "./Brushes.js";
import {Counter} from "./Counter.js";
import {DeterministicRandom} from "./DeterministicRandom.js";
import {ElementArea} from "./ElementArea.js";
import {ElementProcessor} from "./ElementProcessor.js";
import {Element} from "./Element.js";
import {FishSpawningExtension} from "./FishSpawningExtension.js";
import {GrassPlantingExtension} from "./GrassPlantingExtension.js";
import {Renderer} from "./Renderer.js";
import {SandGameGraphics} from "./SandGameGraphics.js";
import {TemplatePainter} from "./TemplatePainter.js";
import {TreePlantingExtension} from "./TreePlantingExtension.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-08
 */
export class SandGame {

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DeterministicRandom */
    #random;

    /** @type Counter */
    #framesCounter;

    /** @type Counter */
    #cyclesCounter;

    /** @type ElementProcessor */
    #processor;

    /** @type Renderer */
    #renderer;

    /** @type number|null */
    #processorIntervalHandle = null;

    /** @type number|null */
    #rendererIntervalHandle = null;

    /** @type boolean */
    #rendererShowActiveChunks = false;

    /** @type function[] */
    #onRendered = [];

    /** @type function[] */
    #onProcessed = [];

    /**
     *
     * @param context {CanvasRenderingContext2D}
     * @param width {number}
     * @param height {number}
     * @param defaultElement {Element}
     */
    constructor(context, width, height, defaultElement) {
        this.#elementArea = new ElementArea(width, height, defaultElement);
        this.#random = new DeterministicRandom(0);
        this.#framesCounter = new Counter();
        this.#cyclesCounter = new Counter();
        this.#processor = new ElementProcessor(this.#elementArea, 16, this.#random, defaultElement);
        this.#renderer = new Renderer(this.#elementArea, 16, context);
        this.#width = width;
        this.#height = height;

        let grassPlantingExtension = new GrassPlantingExtension(this.#elementArea, this.#random, Brushes.GRASS);
        this.#onProcessed.push(() => grassPlantingExtension.run());
        let treePlantingExtension = new TreePlantingExtension(this.#elementArea, this.#random, Brushes.TREE);
        this.#onProcessed.push(() => treePlantingExtension.run());
        let fishSpawningExtension = new FishSpawningExtension(this.#elementArea, this.#random, Brushes.FISH, Brushes.FISH_BODY);
        this.#onProcessed.push(() => fishSpawningExtension.run());
    }

    startProcessing() {
        if (this.#processorIntervalHandle === null) {
            const interval = Math.trunc(1000 / ElementProcessor.OPT_CYCLES_PER_SECOND);  // ms
            this.#processorIntervalHandle = setInterval(() => this.#doProcessing(), interval);
        }
    }

    startRendering() {
        if (this.#rendererIntervalHandle === null) {
            const interval = Math.trunc(1000 / ElementProcessor.OPT_FRAMES_PER_SECOND);  // ms
            this.#rendererIntervalHandle = setInterval(() => this.#doRendering(), interval);
        }
    }

    stopProcessing() {
        if (this.#processorIntervalHandle !== null) {
            clearInterval(this.#processorIntervalHandle);
            this.#processorIntervalHandle = null;
        }
        this.#cyclesCounter.clear();
    }

    stopRendering() {
        if (this.#rendererIntervalHandle !== null) {
            clearInterval(this.#rendererIntervalHandle);
            this.#rendererIntervalHandle = null;
        }
        this.#framesCounter.clear();
    }

    #doProcessing() {
        this.#processor.next();
        const t = Date.now();
        this.#cyclesCounter.tick(t);
        for (let func of this.#onProcessed) {
            func();
        }
    }

    #doRendering() {
        this.#renderer.render(this.#processor.getActiveChunks(), this.#rendererShowActiveChunks);
        const t = Date.now();
        this.#framesCounter.tick(t);
        for (let func of this.#onRendered) {
            func();
        }
    }

    graphics() {
        return new SandGameGraphics(this.#elementArea, this.#random, (x, y) => {
            this.#processor.trigger(x, y);
            this.#renderer.trigger(x, y);
        });
    }

    template() {
        return new TemplatePainter(this.graphics());
    }

    setRendererShowActiveChunks(show) {
        this.#rendererShowActiveChunks = show;
    }

    setBoxedMode() {
        this.#processor.setFallThroughEnabled(false);
        this.#processor.setErasingEnabled(false);
    }

    setFallThroughMode() {
        this.#processor.setFallThroughEnabled(true);
        this.#processor.setErasingEnabled(false);
    }

    setErasingMode() {
        this.#processor.setFallThroughEnabled(false);
        this.#processor.setErasingEnabled(true);
    }

    addOnRendered(onRenderedFunc) {
        this.#onRendered.push(onRenderedFunc);
    }

    getFramesPerSecond() {
        return this.#framesCounter.getValue();
    }

    getCyclesPerSecond() {
        return this.#cyclesCounter.getValue();
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }

    copyStateTo(sandGame) {
        let sourceY0;
        let targetY0;
        if (sandGame.#height >= this.#height) {
            sourceY0 = 0;
            targetY0 = sandGame.#height - this.#height
        } else {
            sourceY0 = this.#height - sandGame.#height;
            targetY0 = 0;
        }

        for (let y = 0; y < Math.min(this.#height, sandGame.#height); y++) {
            for (let x = 0; x < Math.min(this.#width, sandGame.#width); x++) {
                let elementHead = this.#elementArea.getElementHead(x, y + sourceY0);
                let elementTail = this.#elementArea.getElementTail(x, y + sourceY0);
                sandGame.#elementArea.setElementHead(x, targetY0 + y, elementHead);
                sandGame.#elementArea.setElementTail(x, targetY0 + y, elementTail);
            }
        }
        sandGame.#processor.setFallThroughEnabled(this.#processor.isFallThroughEnabled());
        sandGame.#processor.setErasingEnabled(this.#processor.isErasingEnabled());
    }
}
