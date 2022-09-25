
/**
 *
 * @author Patrik Harag
 * @version 2022-09-25
 */
export class SandGame {

    static OPT_CYCLES_PER_SECOND = 120;
    static OPT_FRAMES_PER_SECOND = 60;

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type FastRandom */
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
        this.#random = new FastRandom(0);
        this.#framesCounter = new Counter();
        this.#cyclesCounter = new Counter();
        this.#processor = new ElementProcessor(width, height, this.#random, defaultElement);
        this.#renderer = new MotionBlurRenderer(width, height, context);
        this.#width = width;
        this.#height = height;

        let grassPlantingExtension = new GrassPlantingExtension(this.#elementArea, this.#random, Brushes.GRASS);
        this.#onProcessed.push(() => grassPlantingExtension.run());
        let fishSpawningExtension = new FishSpawningExtension(this.#elementArea, this.#random, Brushes.FISH, Brushes.FISH_BODY);
        this.#onProcessed.push(() => fishSpawningExtension.run());
    }

    startProcessing() {
        if (this.#processorIntervalHandle === null) {
            const interval = Math.trunc(1000 / SandGame.OPT_CYCLES_PER_SECOND);  // ms
            this.#processorIntervalHandle = setInterval(() => this.#doProcessing(), interval);
        }
    }

    startRendering() {
        if (this.#rendererIntervalHandle === null) {
            const interval = Math.trunc(1000 / SandGame.OPT_FRAMES_PER_SECOND);  // ms
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
        this.#processor.next(this.#elementArea);
        const t = Date.now();
        this.#cyclesCounter.tick(t);
        for (let func of this.#onProcessed) {
            func();
        }
    }

    #doRendering() {
        this.#renderer.render(this.#elementArea);
        const t = Date.now();
        this.#framesCounter.tick(t);
        for (let func of this.#onRendered) {
            func();
        }
    }

    graphics() {
        return new SandGameGraphics(this.#elementArea);
    }

    template() {
        return new TemplatePainter(this.graphics());
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

    copyElementsTo(sandGame) {
        for (let y = 0; y < Math.min(this.#height, sandGame.#height); y++) {
            for (let x = 0; x < Math.min(this.#width, sandGame.#width); x++) {
                sandGame.#elementArea.setElementHead(x, y, this.#elementArea.getElementHead(x, y));
                sandGame.#elementArea.setElementTail(x, y, this.#elementArea.getElementTail(x, y));
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-22
 */
class SandGameGraphics {

    /** @type ElementArea */
    #elementArea;

    constructor(elementArea) {
        this.#elementArea = elementArea;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    draw(x, y, brush) {
        let element = brush.apply(x, y);
        this.#elementArea.setElement(x, y, element);
    }

    drawRectangle(x1, y1, x2, y2, brush) {
        x1 = Math.max(Math.min(x1, this.getWidth()), 0);
        x2 = Math.max(Math.min(x2, this.getWidth()), 0);
        y1 = Math.max(Math.min(y1, this.getHeight()), 0);
        y2 = Math.max(Math.min(y2, this.getHeight()), 0);

        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                this.draw(x, y, brush);
            }
        }
    }

    drawLine(x1, y1, x2, y2, size, brush) {
        const d = Math.ceil(size / 2);
        let consumer = (x, y) => {
            this.drawRectangle(x-d, y-d, x+d, y+d, brush);
        };
        SandGameGraphics.#lineAlgorithm(x1, y1, x2, y2, consumer);
    }

    static #lineAlgorithm(x1, y1, x2, y2, consumer) {
        consumer(x1, y1);

        if ((x1 !== x2) || (y1 !== y2)) {
            const moveX = x1 < x2 ? 1 : -1;
            const moveY = y1 < y2 ? 1 : -1;

            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            let diff = dx - dy;

            while ((x1 !== x2) || (y1 !== y2)) {
                const p = 2 * diff;

                if (p > -dy) {
                    diff = diff - dy;
                    x1 = x1 + moveX;
                }
                if (p < dx) {
                    diff = diff + dx;
                    y1 = y1 + moveY;
                }
                consumer(x1, y1);
            }
        }
    }

    floodFill(x, y, brush) {
        let floodFillPainter = new FloodFillPainter(this.#elementArea);
        floodFillPainter.paint(x, y, brush);
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-29
 */
class Brush {

    /**
     *
     * @param x
     * @param y
     * @return {Element}
     */
    apply(x, y) {
        throw 'Not implemented'
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class RandomBrush extends Brush {
    static of(elements) {
        return new RandomBrush(elements);
    }

    static fromHeadAndTails(elementHead, elementTails) {
        let elements = [];
        for (let elementTail of elementTails) {
            elements.push(new Element(elementHead, elementTail));
        }
        return new RandomBrush(elements);
    }


    /** @type Element[] */
    #elements;

    constructor(elements) {
        super();
        this.#elements = elements;
    }

    apply(x, y) {
        return this.#elements[Math.trunc(Math.random() * this.#elements.length)];
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-21
 */
class TemplatePainter {

    /** @type SandGameGraphics */
    #graphics;

    /** @type string|string[]|null */
    #blueprint = null;
    /** @type object|null */
    #brushes = null;

    /** @type number */
    #maxHeight = Number.MAX_SAFE_INTEGER;

    /** @type string */
    #verticalAlign = 'bottom';

    /**
     *
     * @param graphics {SandGameGraphics}
     */
    constructor(graphics) {
        this.#graphics = graphics;
    }

    /**
     *
     * @param blueprint {string|string[]}
     * @returns {TemplatePainter}
     */
    withBlueprint(blueprint) {
        this.#blueprint = blueprint;
        return this;
    }

    /**
     *
     * @param brushes
     * @returns {TemplatePainter}
     */
    withBrushes(brushes) {
        this.#brushes = brushes;
        return this;
    }

    /**
     *
     * @param maxHeight max template height
     * @param align {string} bottom|top
     * @returns {TemplatePainter}
     */
    withMaxHeight(maxHeight, align='bottom') {
        this.#maxHeight = maxHeight;
        this.#verticalAlign = align;
        return this;
    }

    paint() {
        if (this.#blueprint === null || this.#blueprint.length === 0) {
            throw 'Blueprint not set';
        }
        if (this.#brushes === null) {
            throw 'Brushes not set';
        }

        const blueprint = (typeof this.#blueprint === 'string')
                ? this.#blueprint.split('\n')
                : this.#blueprint;

        const w = blueprint[0].length;
        const h = blueprint.length;

        const ww = Math.ceil(this.#graphics.getWidth() / w);
        const hh = Math.ceil(Math.min(this.#graphics.getHeight(), this.#maxHeight) / h);
        // note: rounding up is intentional - we don't want gaps, drawRectangle can handle drawing out of canvas

        const verticalOffset = (this.#verticalAlign === 'bottom' ? this.#graphics.getHeight() - (hh * h) : 0);

        for (let y = 0; y < h; y++) {
            const line = blueprint[y];
            for (let x = 0; x < Math.min(w, line.length); x++) {
                const char = line.charAt(x);
                let brush = this.#brushes[char];
                if (brush === undefined) {
                    if (char === ' ') {
                        // let this cell empty
                        continue;
                    }
                    throw 'Brush not found: ' + char;
                }
                this.#graphics.drawRectangle(
                        x * ww, verticalOffset + (y * hh),
                        x * ww + ww, verticalOffset + (y * hh) + hh, brush);
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-22
 */
class FloodFillPainter {

    /** @type ElementArea */
    #elementArea;

    /**
     *
     * @param elementArea {ElementArea}
     */
    constructor(elementArea) {
        this.#elementArea = elementArea;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    paint(x, y, brush) {
        const pattern = 0x00000FFF;  // type, weight, behaviour
        const matcher = this.#elementArea.getElementHead(x, y) & pattern;

        const w = this.#elementArea.getWidth();
        const h = this.#elementArea.getHeight();

        let point = x + y*w;

        const pointSet = new Set();
        const queue = [];

        do {
            let x = point % w;
            let y = Math.trunc(point / w);

            while (x > 0 && this.#equals(x - 1, y, pattern, matcher)) {
                x--;
            }

            let spanUp = false;
            let spanDown = false;

            while (x < w && this.#equals(x, y, pattern, matcher)) {
                const nextPoint = x + y*w;
                if (pointSet.has(nextPoint)) {
                    break;
                }

                this.#elementArea.setElement(x, y, brush.apply(x, y));
                pointSet.add(nextPoint);

                if (!spanUp && y > 0 && this.#equals(x, y - 1, pattern, matcher)) {
                    queue.push(x + (y - 1)*w);
                    spanUp = true;
                } else if (spanUp && y > 0 && this.#equals(x, y - 1, pattern, matcher)) {
                    spanUp = false;
                }

                if (!spanDown && y < h - 1 && this.#equals(x, y + 1, pattern, matcher)) {
                    queue.push(x + (y + 1)*w);
                    spanDown = true;
                } else if (spanDown && y < h - 1 && this.#equals(x, y + 1, pattern, matcher)) {
                    spanDown = false;
                }

                x++;
            }
        } while ((point = queue.pop()) != null);
    }

    #equals(x, y, pattern, matcher) {
        let elementHead = this.#elementArea.getElementHead(x, y);
        return (elementHead & pattern) === matcher;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-25
 */
class Counter {

    #currentValue = 0;
    #lastValue = 0;
    #start = 0;

    tick(currentTimeMillis) {
        this.#currentValue++;
        if (currentTimeMillis - this.#start >= 1000) {
            this.#lastValue = this.#currentValue;
            this.#currentValue = 0;
            this.#start = currentTimeMillis;
        }
    }

    getValue() {
        return this.#lastValue;
    }

    clear() {
        this.#lastValue = 0;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-08-28
 */
class FastRandom {
    /** @type number */
    #last;

    constructor(seed) {
        this.#last = seed;
    }

    // TODO: Deterministic fast random.

    nextInt(max) {
        return Math.trunc(Math.random() * max);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class ElementArea {
    static LITTLE_ENDIAN = true;

    /** @type number */
    #width;

    /** @type number */
    #height;

    /** @type DataView */
    #buffer;

    constructor(width, height, defaultElement) {
        this.#width = width;
        this.#height = height;
        this.#buffer = new DataView(new ArrayBuffer(width * height * 8));

        // set default elements
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                this.setElement(x, y, defaultElement);
            }
        }
    }

    isValidPosition(x, y) {
        if (x < 0 || y < 0) {
            return false;
        }
        if (x >= this.#width || y >= this.#height) {
            return false;
        }
        return true;
    }

    setElement(x, y, element) {
        if (element !== null) {
            this.setElementHeadAndTail(x, y, element.elementHead, element.elementTail);
        }
        // brushes can produce nulls
    }

    setElementHeadAndTail(x, y, elementHead, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    setElementHead(x, y, elementHead) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset, elementHead, ElementArea.LITTLE_ENDIAN);
    }

    setElementTail(x, y, elementTail) {
        const byteOffset = (this.#width * y + x) * 8;
        this.#buffer.setUint32(byteOffset + 4, elementTail, ElementArea.LITTLE_ENDIAN);
    }

    getElement(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        const elementHead = this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
        const elementTail = this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
        return new Element(elementHead, elementTail);
    }

    getElementHead(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset, ElementArea.LITTLE_ENDIAN);
    }

    getElementTail(x, y) {
        const byteOffset = (this.#width * y + x) * 8;
        return this.#buffer.getUint32(byteOffset + 4, ElementArea.LITTLE_ENDIAN);
    }

    swap(x, y, x2, y2) {
        const elementHead = this.getElementHead(x, y);
        const elementHead2 = this.getElementHead(x2, y2);
        this.setElementHead(x2, y2, elementHead);
        this.setElementHead(x, y, elementHead2);

        const elementTail = this.getElementTail(x, y);
        const elementTail2 = this.getElementTail(x2, y2);
        this.setElementTail(x2, y2, elementTail);
        this.setElementTail(x, y, elementTail2);
    }

    getWidth() {
        return this.#width;
    }

    getHeight() {
        return this.#height;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class ElementHead {
    static TYPE_STATIC = 0x0;
    static TYPE_FALLING = 0x1;
    static TYPE_SAND_1 = 0x2;
    static TYPE_SAND_2 = 0x3;
    static TYPE_FLUID_1 = 0x4;
    static TYPE_FLUID_2 = 0x5;

    static WEIGHT_AIR = 0x0;
    static WEIGHT_WATER = 0x1;
    static WEIGHT_POWDER = 0x2;
    static WEIGHT_WALL = 0x3;

    static BEHAVIOUR_NONE = 0x0;
    static BEHAVIOUR_SOIL = 0x1;
    static BEHAVIOUR_GRASS = 0x2;
    static BEHAVIOUR_FISH = 0x3;
    static BEHAVIOUR_FISH_BODY = 0x4;

    static of(type, weight, behaviour=0, special=0) {
        let value = 0;
        value = (value | special) << 4;
        value = (value | behaviour) << 4;
        value = (value | weight) << 4;
        value = value | type;
        return value;
    }

    static getType(elementHead) {
        return elementHead & 0x0000000F;
    }

    static getWeight(elementHead) {
        return (elementHead >> 4) & 0x0000000F;
    }

    static getBehaviour(elementHead) {
        return (elementHead >> 8) & 0x0000000F;
    }

    static getSpecial(elementHead) {
        return (elementHead >> 12) & 0x0000000F;
    }

    static setSpecial(elementHead, special) {
        return (elementHead & ~(0x0000F000)) | (special << 12);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class ElementTail {
    static MODIFIER_BACKGROUND = 0x01000000;
    static MODIFIER_BLUR_ENABLED = 0x02000000;
    static MODIFIER_GLITTER_ENABLED = 0x04000000;

    static of(r, g, b, renderingModifiers) {
        let value = 0;
        value = (value | r) << 8;
        value = (value | g) << 8;
        value = value | b;
        value = value | renderingModifiers
        return value;
    }

    static getColorRed(elementTail) {
        return (elementTail >> 16) & 0x000000FF;
    }

    static getColorGreen(elementTail) {
        return (elementTail >> 8) & 0x000000FF;
    }

    static getColorBlue(elementTail) {
        return elementTail & 0x000000FF;
    }

    static isRenderingModifierBackground(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BACKGROUND) !== 0;
    }

    static isRenderingModifierBlurEnabled(elementTail) {
        return (elementTail & ElementTail.MODIFIER_BLUR_ENABLED) !== 0;
    }

    static isRenderingModifierGlitterEnabled(elementTail) {
        return (elementTail & ElementTail.MODIFIER_GLITTER_ENABLED) !== 0;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class Element {
    elementHead;
    elementTail;

    constructor(elementHead, elementTail) {
        this.elementHead = elementHead;
        this.elementTail = elementTail;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class ElementProcessor {

    /** @type number */
    #width;

    /** @type number */
    #height;

    #iteration;

    /** @type FastRandom */
    #random;

    #defaultElement;

    static RANDOM_DATA_COUNT = 100;

    /** @type Uint32Array[] */
    #randData = [];

    constructor(width, height, random, defaultElement) {
        this.#width = width;
        this.#height = height;
        this.#iteration = 0;
        this.#random = random;
        this.#defaultElement = defaultElement;

        // init random data
        this.#randData = [];
        for (let i = 0; i < ElementProcessor.RANDOM_DATA_COUNT; i++) {
            let array = new Uint32Array(width);
            for (let j = 0; j < width; j++) {
                array[j] = this.#random.nextInt(width);
            }
            this.#randData.push(array);
        }
    }

    /**
     *
     * @param elementArea {ElementArea}
     */
    next(elementArea) {
        for (let y = this.#height - 1; y >= 0; y--) {
            let dataIndex = Math.trunc(this.#random.nextInt(ElementProcessor.RANDOM_DATA_COUNT));
            let data = this.#randData[dataIndex];

            for (let i = 0; i < this.#width; i++) {
                let x = data[i];
                this.#nextPoint(elementArea, x, y);
            }
        }
        this.#iteration++;
    }

    /**
     *
     * @param elementArea {ElementArea}
     * @param x {number}
     * @param y {number}
     */
    #nextPoint(elementArea, x, y) {
        let elementHead = elementArea.getElementHead(x, y);
        let moved = this.#performMovingBehaviour(elementArea, elementHead, x, y);

        if (!moved) {
            let behaviour = ElementHead.getBehaviour(elementHead);
            if (behaviour === ElementHead.BEHAVIOUR_GRASS) {
                this.#grow(elementArea, elementHead, x, y);
            } else if (behaviour === ElementHead.BEHAVIOUR_FISH) {
                this.#fishLive(elementArea, elementHead, x, y);
            } else if (behaviour === ElementHead.BEHAVIOUR_FISH_BODY) {
                this.#fishBodyLive(elementArea, elementHead, x, y);
            }
        }
    }

    /**
     *
     * @param elementArea {ElementArea}
     * @param elementHead
     * @param x {number}
     * @param y {number}
     * @returns {boolean}
     */
    #performMovingBehaviour(elementArea, elementHead, x, y) {
        let type = ElementHead.getType(elementHead);
        switch (type) {
            case ElementHead.TYPE_STATIC:
                // no action
                return false;

            case ElementHead.TYPE_FALLING:
                //  #
                //  #
                //  #
                return this.#move(elementArea, elementHead, x, y, x, y + 1);

            case ElementHead.TYPE_SAND_1:
                //   #
                //  ###
                // #####

                if (!this.#move(elementArea, elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        return this.#move(elementArea, elementHead, x, y, x + 1, y + 1)
                    } else {
                        return this.#move(elementArea, elementHead, x, y, x - 1, y + 1)
                    }
                }
                return true;

            case ElementHead.TYPE_SAND_2:
                //     #
                //   #####
                // #########

                if (!this.#move(elementArea, elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        if (!this.#move(elementArea, elementHead, x, y, x + 1, y + 1)) {
                            return this.#move(elementArea, elementHead, x, y, x + 2, y + 1)
                        }
                        return true;
                    } else {
                        if (!this.#move(elementArea, elementHead, x, y, x - 1, y + 1)) {
                            return this.#move(elementArea, elementHead, x, y, x - 2, y + 1)
                        }
                        return true;
                    }
                }
                return true;

            case ElementHead.TYPE_FLUID_1:
                if (!this.#move(elementArea, elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        return this.#move(elementArea, elementHead, x, y, x + 1, y)
                    } else {
                        return this.#move(elementArea, elementHead, x, y, x - 1, y)
                    }
                }
                return true;

            case ElementHead.TYPE_FLUID_2:
                if (!this.#move(elementArea, elementHead, x, y, x, y + 1)) {
                    let rnd = this.#random.nextInt(2);
                    if (rnd === 0) {
                        if (this.#move(elementArea, elementHead, x, y, x + 1, y)) {
                            if (this.#move(elementArea, elementHead, x + 1, y, x + 2, y)) {
                                this.#move(elementArea, elementHead, x + 2, y, x + 3, y)
                            }
                            return true;
                        }
                        return false;
                    } else {
                        if (this.#move(elementArea, elementHead, x, y, x - 1, y)) {
                            if (this.#move(elementArea, elementHead, x - 1, y, x - 2, y)) {
                                this.#move(elementArea, elementHead, x - 2, y, x - 3, y)
                            }
                            return true;
                        }
                        return false;
                    }
                }
                return true;
        }
        throw "Unknown element type: " + type;
    }

    #move(elementArea, elementHead, x, y, x2, y2) {
        if (!elementArea.isValidPosition(x2, y2)) {
            return false;
        }

        let elementHead2 = elementArea.getElementHead(x2, y2);
        if (ElementHead.getWeight(elementHead) > ElementHead.getWeight(elementHead2)) {
            let elementTail = elementArea.getElementTail(x, y);
            let elementTail2 = elementArea.getElementTail(x2, y2);

            elementArea.setElementHead(x2, y2, elementHead);
            elementArea.setElementHead(x, y, elementHead2);
            elementArea.setElementTail(x2, y2, elementTail);
            elementArea.setElementTail(x, y, elementTail2);
            return true;
        }
        return false;
    }

    #grow(elementArea, elementHead, x, y) {
        let random = this.#random.nextInt(100);
        if (random < 3) {
            // check above
            if (y > 0) {
                let above1 = elementArea.getElementHead(x, y - 1);
                let grassAbove = ElementHead.getBehaviour(above1) === ElementHead.BEHAVIOUR_GRASS;
                if (!grassAbove && ElementHead.getWeight(above1) > ElementHead.WEIGHT_WATER) {
                    // remove grass
                    elementArea.setElement(x, y, this.#defaultElement);
                }
            }

            if (random === 0) {
                // grow up
                let growIndex = ElementHead.getSpecial(elementHead);
                if (growIndex === 0) {
                    // maximum height
                    if (this.#random.nextInt(5) === 0) {
                        // remove top element to create some movement
                        elementArea.setElement(x, y, this.#defaultElement);
                    }
                    return;
                }
                if (y === 0) {
                    return;
                }
                let above1 = elementArea.getElementHead(x, y - 1);
                if (ElementHead.getWeight(above1) !== ElementHead.WEIGHT_AIR) {
                    return;
                }
                if (y > 1) {
                    let above2 = elementArea.getElementHead(x, y - 2);
                    if (ElementHead.getWeight(above2) !== ElementHead.WEIGHT_AIR) {
                        return;
                    }
                }
                elementArea.setElementHead(x, y - 1, ElementHead.setSpecial(elementHead, growIndex - 1));
                elementArea.setElementTail(x, y - 1, elementArea.getElementTail(x, y));
            } else if (random === 1) {
                // grow right
                if (GrassElement.couldGrowUpHere(elementArea, x + 1, y + 1)) {
                    elementArea.setElement(x + 1, y + 1, Brushes.GRASS.apply(x, y));
                }
            } else if (random === 2) {
                // grow left
                if (GrassElement.couldGrowUpHere(elementArea, x - 1, y + 1)) {
                    elementArea.setElement(x - 1, y + 1, Brushes.GRASS.apply(x, y));
                }
            }
        }
    }

    #fishLive(elementArea, elementHead, x, y) {
        // check has body
        if (x === elementArea.getWidth() - 1
                || ElementHead.getBehaviour(elementArea.getElementHead(x + 1, y)) !== ElementHead.BEHAVIOUR_FISH_BODY) {
            // => turn into corpse
            elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y));
        }

        // move down if flying
        if (y < elementArea.getHeight() - 1) {
            if (ElementHead.getWeight(elementArea.getElementHead(x, y + 1)) < ElementHead.WEIGHT_WATER
                    && ElementHead.getWeight(elementArea.getElementHead(x + 1, y + 1)) < ElementHead.WEIGHT_WATER) {
                elementArea.swap(x, y, x, y + 1);
                elementArea.swap(x + 1, y, x + 1, y + 1);
                return;
            }
        }

        // once a while check if there is a water
        // once a while move

        const action = this.#random.nextInt(SandGame.OPT_CYCLES_PER_SECOND);
        if (action === 0) {
            let w = 0;
            w += this.#isWaterEnvironment(elementArea, x - 1, y) ? 1 : 0;
            w += this.#isWaterEnvironment(elementArea, x + 2, y) ? 1 : 0;
            w += this.#isWaterEnvironment(elementArea, x, y + 1) ? 1 : 0;
            w += this.#isWaterEnvironment(elementArea, x, y - 1) ? 1 : 0;
            if (w < 4) {
                w += this.#isWaterEnvironment(elementArea, x + 1, y + 1) ? 1 : 0;
                w += this.#isWaterEnvironment(elementArea, x + 1, y - 1) ? 1 : 0;
            }

            let dried = ElementHead.getSpecial(elementHead);
            if (w >= 4) {
                // enough water
                if (dried > 0) {
                    // reset counter
                    elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));
                }
            } else {
                // not enough water
                dried++;
                if (dried > 5) {
                    // turn into corpse
                    elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y));
                } else {
                    elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, dried));
                }
            }
        } else if (action < SandGame.OPT_CYCLES_PER_SECOND / 10) {
            const rx = this.#random.nextInt(3) - 1;
            const ry = this.#random.nextInt(3) - 1;
            if (rx === 0 && ry === 0) {
                return;
            }
            // move fish and it's body
            if (this.#isWater(elementArea, rx + x, ry + y)
                    && this.#isWater(elementArea, rx + x + 1, ry + y)) {
                elementArea.swap(x, y, rx + x, ry + y);
                elementArea.swap(x + 1, y, rx + x + 1, ry + y);
            }
        }
    }

    #fishBodyLive(elementArea, elementHead, x, y) {
        if (x === 0 || ElementHead.getBehaviour(elementArea.getElementHead(x - 1, y)) !== ElementHead.BEHAVIOUR_FISH) {
            // the fish lost it's head :(
            // => turn into corpse
            elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y));
        }
    }

    #isWater(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isWaterEnvironment(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) === ElementHead.TYPE_FLUID_2) {
            return true;
        }
        let behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_FISH || behaviour === ElementHead.BEHAVIOUR_FISH_BODY) {
            return true;
        }
        return false;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class GrassElement {
    static couldGrowUpHere(elementArea, x, y) {
        if (x < 0 || y - 1 < 0) {
            return false;
        }
        if (x >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }
        let e1 = elementArea.getElementHead(x, y);
        if (ElementHead.getWeight(e1) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        let e2 = elementArea.getElementHead(x, y + 1);
        if (ElementHead.getBehaviour(e2) !== ElementHead.BEHAVIOUR_SOIL) {
            return false;
        }
        let e3 = elementArea.getElementHead(x, y - 1);
        if (ElementHead.getWeight(e3) !== ElementHead.WEIGHT_AIR) {
            return false;
        }
        return true;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class GrassPlantingExtension {
    static MAX_COUNTER_VALUE = 2;

    #elementArea;
    #random;
    #brush;

    #counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

    constructor(elementArea, random, brush) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brush = brush;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = GrassPlantingExtension.MAX_COUNTER_VALUE;

            const x = this.#random.nextInt(this.#elementArea.getWidth());
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 3) + 2;

            if (GrassElement.couldGrowUpHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brush.apply(x, y));
            }
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-20
 */
class FishSpawningExtension {

    #elementArea;
    #random;
    #brushHead;
    #brushBody;

    #counterStartValue = 2;
    #counter = 2;

    constructor(elementArea, random, brushHead, brushBody) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#brushHead = brushHead;
        this.#brushBody = brushBody;
    }

    run() {
        if (this.#counter-- === 0) {
            this.#counter = this.#counterStartValue;

            const x = this.#random.nextInt(this.#elementArea.getWidth() - 2) + 1;
            const y = this.#random.nextInt(this.#elementArea.getHeight() - 2) + 1;

            if (this.#couldSpawnHere(this.#elementArea, x, y)) {
                this.#elementArea.setElement(x, y, this.#brushHead.apply(x, y));
                this.#elementArea.setElement(x + 1, y, this.#brushBody.apply(x + 1, y));

                // increase difficulty of spawning fish again
                this.#counterStartValue = this.#counterStartValue << 2;
            }
        }
    }

    #couldSpawnHere(elementArea, x, y) {
        // space around
        if (x < 1 || y < 1) {
            return false;
        }
        if (x + 1 >= elementArea.getWidth() || y + 1 >= elementArea.getHeight()) {
            return false;
        }

        // water around
        if (!this.#isWater(elementArea, x, y) || !this.#isWater(elementArea, x - 1, y)
                || !this.#isWater(elementArea, x + 1, y) || !this.#isWater(elementArea, x + 2, y)
                || !this.#isWater(elementArea, x + 1, y + 1) || !this.#isWater(elementArea, x + 2, y + 1)
                || !this.#isWater(elementArea, x + 1, y - 1) || !this.#isWater(elementArea, x + 2, y - 1)) {
            return false;
        }

        // sand around
        return this.#isSand(elementArea, x, y + 2)
                || this.#isSand(elementArea, x + 1, y + 2);
    }

    #isWater(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isSand(elementArea, x, y) {
        if (!elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = elementArea.getElementHead(x, y);
        if (ElementHead.getType(targetElementHead) !== ElementHead.TYPE_SAND_2) {
            return false;
        }
        return true;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-08
 */
class Renderer {

    /**
     *
     * @param elementArea {ElementArea}
     * @return {void}
     */
    render(elementArea) {
        throw 'Not implemented';
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class DoubleBufferedRenderer extends Renderer {

    /** @type CanvasRenderingContext2D */
    #context;

    /** @type number */
    _width;

    /** @type number */
    _height;

    /** @type ImageData */
    #buffer;

    static #GLITTER_EFFECT_COUNTER_MAX = 2000;
    #waterEffectCounter = DoubleBufferedRenderer.#GLITTER_EFFECT_COUNTER_MAX;

    constructor(width, height, context) {
        super();
        this.#context = context;
        this._width = width;
        this._height = height;
        this.#buffer = this.#context.createImageData(width, height);

        // set up alpha color component
        let data = this.#buffer.data;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                let index = 4 * (this._width * y + x);
                data[index + 3] = 0xFF;
            }
        }
    }

    /**
     *
     * @param elementArea {ElementArea}
     * @return {void}
     */
    render(elementArea) {
        const data = this.#buffer.data;

        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._renderPixel(elementArea, x, y, data);
            }
        }

        this.#context.putImageData(this.#buffer, 0, 0, 0, 0, this._width, this._height);
    }

    _renderPixel(elementArea, x, y, data) {
        const elementTail = elementArea.getElementTail(x, y);
        const index = (this._width * y + x) * 4;
        this._renderElement(index, elementTail, data);
    }

    _renderElement(index, elementTail, data) {
        if (ElementTail.isRenderingModifierGlitterEnabled(elementTail) && this.#waterEffectCounter-- === 0) {
            // glitter effect - implemented using alpha blending

            this.#waterEffectCounter = Math.trunc(Math.random() * DoubleBufferedRenderer.#GLITTER_EFFECT_COUNTER_MAX);

            const alpha = 0.5 + Math.random() * 0.5;
            const whiteBackground = 255 * (1.0 - alpha);

            data[index]     = (ElementTail.getColorRed(elementTail)   * alpha) + whiteBackground;
            data[index + 1] = (ElementTail.getColorGreen(elementTail) * alpha) + whiteBackground;
            data[index + 2] = (ElementTail.getColorBlue(elementTail)  * alpha) + whiteBackground;
        } else {
            data[index]     = ElementTail.getColorRed(elementTail);
            data[index + 1] = ElementTail.getColorGreen(elementTail);
            data[index + 2] = ElementTail.getColorBlue(elementTail);
        }
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
class MotionBlurRenderer extends DoubleBufferedRenderer {

    static #ALPHA = 0.875;
    static #WHITE_BACKGROUND = 255 * (1.0 - MotionBlurRenderer.#ALPHA);

    /** @type boolean[] */
    #blur;

    /** @type boolean[] */
    #canBeBlurred;

    constructor(width, height, context) {
        super(width, height, context);
        this.#blur = new Array(width * height);
        this.#blur.fill(false);
        this.#canBeBlurred = new Array(width * height);
        this.#canBeBlurred.fill(false);
    }

    _renderPixel(elementArea, x, y, data) {
        const elementTail = elementArea.getElementTail(x, y);

        const pixelIndex = this._width * y + x;
        const dataIndex = pixelIndex * 4;

        if (ElementTail.isRenderingModifierBackground(elementTail)) {
            if (this.#canBeBlurred[pixelIndex] && MotionBlurRenderer.#isWhite(elementTail)) {
                // init fading here

                this.#blur[pixelIndex] = true;
                this.#canBeBlurred[pixelIndex] = false;
            }

            if (this.#blur[pixelIndex]) {
                // continue fading

                const r = data[dataIndex];
                const g = data[dataIndex + 1];
                const b = data[dataIndex + 2];

                if (MotionBlurRenderer.#isVisible(r, g, b)) {
                    data[dataIndex]     = (r * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    data[dataIndex + 1] = (g * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    data[dataIndex + 2] = (b * MotionBlurRenderer.#ALPHA) + MotionBlurRenderer.#WHITE_BACKGROUND;
                    return;
                } else {
                    // fading completed
                    this.#blur[pixelIndex] = false;
                }
            }
        }

        // no blur
        super._renderElement(dataIndex, elementTail, data);
        this.#canBeBlurred[pixelIndex] = ElementTail.isRenderingModifierBlurEnabled(elementTail);
        this.#blur[pixelIndex] = false;
    }

    static #isWhite(element) {
        return ElementTail.getColorRed(element) === 255
                && ElementTail.getColorGreen(element) === 255
                && ElementTail.getColorBlue(element) === 255;
    }

    static #isVisible(r, g, b) {
        return r < 251 && g < 251 && b < 251;
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-09-09
 */
export class Brushes {

    static AIR = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_AIR),
                ElementTail.of(255, 255, 255, ElementTail.MODIFIER_BACKGROUND))
    ]);

    static WALL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_WALL), [
        ElementTail.of(55, 55, 55, 0),
        ElementTail.of(57, 57, 57, 0)
    ]);

    static SAND = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(214, 212, 154, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(225, 217, 171, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(203, 201, 142, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(195, 194, 134, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(218, 211, 165, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(223, 232, 201, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(186, 183, 128, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static SOIL = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_SOIL), [
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(142, 104,  72, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114,  81,  58, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of( 82,  64,  30, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(177, 133,  87, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(102, 102, 102, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static STONE = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_SAND_1, ElementHead.WEIGHT_POWDER), [
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(131, 131, 131, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(135, 135, 135, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(145, 145, 145, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(148, 148, 148, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(160, 160, 160, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(114, 114, 114, ElementTail.MODIFIER_BLUR_ENABLED),
        ElementTail.of(193, 193, 193, ElementTail.MODIFIER_BLUR_ENABLED)
    ]);

    static WATER = RandomBrush.fromHeadAndTails(ElementHead.of(ElementHead.TYPE_FLUID_2, ElementHead.WEIGHT_WATER), [
        ElementTail.of(4, 135, 186, ElementTail.MODIFIER_BLUR_ENABLED | ElementTail.MODIFIER_GLITTER_ENABLED),
        ElementTail.of(5, 138, 189, ElementTail.MODIFIER_BLUR_ENABLED | ElementTail.MODIFIER_GLITTER_ENABLED)
    ]);

    static GRASS = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 7),
                ElementTail.of(44, 92, 33, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 5),
                ElementTail.of(0, 72,  0, ElementTail.MODIFIER_BLUR_ENABLED)),
        new Element(
                ElementHead.of(ElementHead.TYPE_FALLING, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_GRASS, 6),
                ElementTail.of(0, 65,  0, ElementTail.MODIFIER_BLUR_ENABLED))
    ]);

    static FISH = RandomBrush.of([
        new Element(
                ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH, 0),
                ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_BODY = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_STATIC, ElementHead.WEIGHT_POWDER, ElementHead.BEHAVIOUR_FISH_BODY, 0),
            ElementTail.of(37, 53, 66, 0)),
    ]);

    static FISH_CORPSE = RandomBrush.of([
        new Element(
            ElementHead.of(ElementHead.TYPE_SAND_2, ElementHead.WEIGHT_POWDER),
            ElementTail.of(61, 68, 74, 0)),
    ]);


    /**
     *
     * @param brush
     * @param intensity {number} 0..1
     */
    static withIntensity(brush, intensity) {
        class WrappingBrush extends Brush {
            apply(x, y) {
                if (Math.random() < intensity) {
                    return brush.apply(x, y);
                }
                return null;
            }
        }
        return new WrappingBrush();
    }
}