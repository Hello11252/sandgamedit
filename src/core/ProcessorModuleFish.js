import {ElementHead} from "./ElementHead.js";
import {Brushes} from "./Brushes.js";
import {ProcessorContext} from "./ProcessorContext.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-02-24
 */
export class ProcessorModuleFish {

    /** @type ElementArea */
    #elementArea;

    /** @type DeterministicRandom */
    #random;

    /** @type Element */
    #defaultElement;

    constructor(elementArea, random, defaultElement) {
        this.#elementArea = elementArea;
        this.#random = random;
        this.#defaultElement = defaultElement;
    }

    behaviourFish(elementHead, x, y) {
        // check has body
        if (x === this.#elementArea.getWidth() - 1
            || ElementHead.getBehaviour(this.#elementArea.getElementHead(x + 1, y)) !== ElementHead.BEHAVIOUR_FISH_BODY) {
            // => turn into corpse
            this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
        }

        // move down if flying
        if (y < this.#elementArea.getHeight() - 1) {
            if (ElementHead.getWeight(this.#elementArea.getElementHead(x, y + 1)) < ElementHead.WEIGHT_WATER
                && ElementHead.getWeight(this.#elementArea.getElementHead(x + 1, y + 1)) < ElementHead.WEIGHT_WATER) {
                this.#elementArea.swap(x, y, x, y + 1);
                this.#elementArea.swap(x + 1, y, x + 1, y + 1);
                return;
            }
        }

        // once a while check if there is a water
        // once a while move

        const action = this.#random.nextInt(ProcessorContext.OPT_CYCLES_PER_SECOND);
        if (action === 0) {
            let w = 0;
            w += this.#isWaterEnvironment(x - 1, y) ? 1 : 0;
            w += this.#isWaterEnvironment(x + 2, y) ? 1 : 0;
            w += this.#isWaterEnvironment(x, y + 1) ? 1 : 0;
            w += this.#isWaterEnvironment(x, y - 1) ? 1 : 0;
            if (w < 4) {
                w += this.#isWaterEnvironment(x + 1, y + 1) ? 1 : 0;
                w += this.#isWaterEnvironment(x + 1, y - 1) ? 1 : 0;
            }

            let dried = ElementHead.getSpecial(elementHead);
            if (w >= 4) {
                // enough water
                if (dried > 0) {
                    // reset counter
                    this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, 0));
                }
            } else {
                // not enough water
                dried++;
                if (dried > 5) {
                    // turn into corpse
                    this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
                } else {
                    this.#elementArea.setElementHead(x, y, ElementHead.setSpecial(elementHead, dried));
                }
            }
        } else if (action < ProcessorContext.OPT_CYCLES_PER_SECOND / 10) {
            const rx = this.#random.nextInt(3) - 1;
            const ry = this.#random.nextInt(3) - 1;
            if (rx === 0 && ry === 0) {
                return;
            }
            // move fish and it's body
            if (this.#isWater(rx + x, ry + y) && this.#isWater(rx + x + 1, ry + y)) {
                this.#elementArea.swap(x, y, rx + x, ry + y);
                this.#elementArea.swap(x + 1, y, rx + x + 1, ry + y);
            }
        }
    }

    behaviourFishBody(elementHead, x, y) {
        if (x === 0 || ElementHead.getBehaviour(this.#elementArea.getElementHead(x - 1, y)) !== ElementHead.BEHAVIOUR_FISH) {
            // the fish lost it's head :(
            // => turn into corpse
            this.#elementArea.setElement(x, y, Brushes.FISH_CORPSE.apply(x, y, this.#random));
        }
    }

    #isWater(x, y) {
        if (!this.#elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = this.#elementArea.getElementHead(x, y);
        if (ElementHead.getTypeOrdinal(targetElementHead) !== ElementHead.TYPE_FLUID_2) {
            return false;
        }
        return true;
    }

    #isWaterEnvironment(x, y) {
        if (!this.#elementArea.isValidPosition(x, y)) {
            return false;
        }
        let targetElementHead = this.#elementArea.getElementHead(x, y);
        if (ElementHead.getTypeOrdinal(targetElementHead) === ElementHead.TYPE_FLUID_2) {
            return true;
        }
        let behaviour = ElementHead.getBehaviour(targetElementHead);
        if (behaviour === ElementHead.BEHAVIOUR_FISH || behaviour === ElementHead.BEHAVIOUR_FISH_BODY) {
            return true;
        }
        return false;
    }
}