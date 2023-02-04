import {FloodFillPainter} from "./FloodFillPainter.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-07
 */
export class SandGameGraphics {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type function(number, number) */
    #triggerFunction;

    constructor(elementArea, random, triggerFunction) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#triggerFunction = triggerFunction;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param brush {Brush}
     */
    draw(x, y, brush) {
        let element = brush.apply(x, y, this.#random);
        this.#elementArea.setElement(x, y, element);
        this.#triggerFunction(x, y);
    }

    drawRectangle(x1, y1, x2, y2, brush, supportNegativeCoordinates = false) {
        if (supportNegativeCoordinates) {
            x1 = (x1 >= 0) ? x1 : this.getWidth() + x1 + 1;
            x2 = (x2 >= 0) ? x2 : this.getWidth() + x2 + 1;
            y1 = (y1 >= 0) ? y1 : this.getHeight() + y1 + 1;
            y2 = (y2 >= 0) ? y2 : this.getHeight() + y2 + 1;
        }

        x1 = Math.max(Math.min(x1, this.getWidth() - 1), 0);
        x2 = Math.max(Math.min(x2, this.getWidth() - 1), 0);
        y1 = Math.max(Math.min(y1, this.getHeight() - 1), 0);
        y2 = Math.max(Math.min(y2, this.getHeight() - 1), 0);

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                this.draw(x, y, brush);
            }
        }
    }

    drawLine(x1, y1, x2, y2, size, brush) {
        const d = Math.ceil(size / 2);
        let consumer = (x, y) => {
            this.drawRectangle(x - d, y - d, x + d, y + d, brush);
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

    fill(brush) {
        this.drawRectangle(0, 0, this.#elementArea.getWidth() - 1, this.#elementArea.getHeight() - 1, brush);
    }

    floodFill(x, y, brush, neighbourhood) {
        let floodFillPainter = new FloodFillPainter(this.#elementArea, neighbourhood, this);
        floodFillPainter.paint(x, y, brush);
    }

    getWidth() {
        return this.#elementArea.getWidth();
    }

    getHeight() {
        return this.#elementArea.getHeight();
    }
}