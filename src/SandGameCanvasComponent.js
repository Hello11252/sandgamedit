import { DomBuilder } from "./DomBuilder.js";
import { SandGameControls } from "./SandGameControls.js";
import { CursorDefinitionElementArea } from "./core/CursorDefinitionElementArea.js";
import { Renderer } from "./core/Renderer.js";
import { Analytics } from "./Analytics.js";

/**
 *
 * @author Patrik Harag
 * @version 2023-05-09
 */
export class SandGameCanvasComponent {

    /** @type SandGameControls */
    #controls;

    #nodeCanvas;

    /** @type SandGameCanvasDebugOverlayComponent */
    #debugOverlayComponent;
    #nodeDebugOverlay;

    /** @type SandGameCanvasCursorOverlayComponent */
    #cursorOverlayComponent;
    #nodeCursorOverlay;


    /**
     * @param sandGameControls {SandGameControls}
     */
    constructor(sandGameControls) {
        this.#controls = sandGameControls;

        const w = this.#controls.getCurrentWidthPoints();
        const h = this.#controls.getCurrentHeightPoints();
        const scale = this.#controls.getCurrentScale();
        this.#nodeCanvas = this.#createCanvas(w, h, scale);

        this.#debugOverlayComponent = new SandGameCanvasDebugOverlayComponent(w, h, scale, sandGameControls);
        this.#nodeDebugOverlay = this.#debugOverlayComponent.createNode();

        this.#cursorOverlayComponent = new SandGameCanvasCursorOverlayComponent(w, h, scale, sandGameControls);
        this.#nodeCursorOverlay = this.#cursorOverlayComponent.createNode();
    }

    #createCanvas(w, h, scale) {
        const wPx = w / scale;
        const hPx = h / scale;
        const canvas = DomBuilder.element('canvas', {
            style: `position: relative; width: ${wPx}px; height: ${hPx}px;`,
            class: 'sand-game-canvas',
            width: w + 'px',
            height: h + 'px'
        });

        // rendering style
        let domCanvasNode = canvas[0];
        domCanvasNode.style.imageRendering = this.#controls.getCanvasImageRenderingStyle();

        return canvas;
    }

    createNode() {
        return DomBuilder.div({
            style: 'position: relative;',
            class: 'sand-game-canvas-component'
        }, [
            this.#nodeCanvas,
            this.#nodeDebugOverlay,
            this.#nodeCursorOverlay
        ]);
    }

    initMouseHandling(sandGame) {
        let domNode = this.#nodeCursorOverlay[0];
        const scale = this.#controls.getCurrentScale();

        let getActualMousePosition = (e) => {
            const rect = domNode.getBoundingClientRect();
            const x = Math.max(0, Math.trunc((e.clientX - rect.left) * scale));
            const y = Math.max(0, Math.trunc((e.clientY - rect.top) * scale));
            return [x, y];
        }

        let lastX, lastY;
        let lastTool = null;  // drawing is not active if null
        let ctrlPressed = false;
        let shiftPressed = false;

        this.#nodeCursorOverlay.bind('contextmenu', e => false);
        domNode.addEventListener('mousedown', (e) => {
            const [x, y] = getActualMousePosition(e);
            lastX = x;
            lastY = y;
            lastTool = null;
            ctrlPressed = false;
            shiftPressed = false;

            if (e.buttons === 4) {
                // middle button
                e.preventDefault();

                if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                    const tool = this.#controls.getTertiaryTool();
                    tool.applyPoint(x, y, sandGame.graphics(), false);
                    Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_TERTIARY);
                    Analytics.triggerToolUsed(tool);
                } else if (e.altKey && e.ctrlKey && e.shiftKey) {
                    console.log('' + x + 'x' + y + ': ' + sandGame.debugElementAt(x, y));
                }
                return;
            }

            if (e.buttons === 1) {
                lastTool = this.#controls.getPrimaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            } else {
                lastTool = this.#controls.getSecondaryTool();
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_SECONDARY);
            }

            if (e.ctrlKey && e.shiftKey) {
                lastTool.applySpecial(x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_FLOOD);
                Analytics.triggerToolUsed(lastTool);
                lastTool = null;
                return;
            }

            if (!e.ctrlKey && !e.shiftKey) {
                lastTool.applyPoint(x, y, sandGame.graphics(), e.altKey)
                Analytics.triggerToolUsed(lastTool);
            } else {
                if (e.ctrlKey && lastTool.isSelectionEnabled()) {
                    ctrlPressed = e.ctrlKey;
                }
                if (e.shiftKey && lastTool.isStrokeEnabled()) {
                    shiftPressed = e.shiftKey;
                }
            }
            // if (!lastTool.isStrokeEnabled()) {
            //     lastTool = null;
            // }
        });
        domNode.addEventListener('mousemove', (e) => {
            if (!ctrlPressed && !shiftPressed) {

                // show / move cursor
                if (this.#cursorOverlayComponent.hasCursor()) {
                    const [x, y] = getActualMousePosition(e);
                    this.#cursorOverlayComponent.moveCursor(x, y, scale);
                } else {
                    const cursorDefinition = this.#controls.getPrimaryTool().createCursor();
                    if (cursorDefinition !== null) {
                        const [x, y] = getActualMousePosition(e);
                        this.#cursorOverlayComponent.showCursor(x, y, scale, cursorDefinition);
                    }
                }

                if (lastTool === null) {
                    return;
                }

                // drawing
                const [x, y] = getActualMousePosition(e);
                lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerToolUsed(lastTool);
                lastX = x;
                lastY = y;
                return;
            }

            if (lastTool === null) {
                return;
            }
            if (ctrlPressed && shiftPressed) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#cursorOverlayComponent.repaintRectangleSelection(lastX, lastY, x, y, scale);
                return;
            }
            if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                this.#cursorOverlayComponent.repaintLineSelection(lastX, lastY, x, y, scale);
                return;
            }
        });
        domNode.addEventListener('mouseup', (e) => {
            if (lastTool === null) {
                return;
            }
            if (ctrlPressed) {
                const [x, y] = getActualMousePosition(e);
                let minX = Math.min(lastX, x);
                let minY = Math.min(lastY, y);
                let maxX = Math.max(lastX, x);
                let maxY = Math.max(lastY, y);
                lastTool.applyArea(minX, minY, maxX, maxY, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_RECT);
                Analytics.triggerToolUsed(lastTool);
            } else if (shiftPressed) {
                const [x, y] = getActualMousePosition(e);
                lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), e.altKey);
                Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_LINE);
                Analytics.triggerToolUsed(lastTool);
            }
            lastTool = null;
            this.#cursorOverlayComponent.hideCursors();
        });
        domNode.addEventListener('mouseout', (e) => {
            this.#cursorOverlayComponent.hideCursors();
        });
        domNode.addEventListener('mouseenter', (e) => {
            if (lastTool !== null && e.buttons === 0) {
                // mouse released outside...
                lastTool = null;
                this.#cursorOverlayComponent.hideCursors();
                e.preventDefault();
            }
        });

        // touch support

        let getActualTouchPosition = (e) => {
            let touch = e.touches[0];
            return getActualMousePosition(touch);
        }
        domNode.addEventListener('touchstart', (e) => {
            const [x, y] = getActualTouchPosition(e);
            lastX = x;
            lastY = y;
            lastTool = this.#controls.getPrimaryTool();
            lastTool.applyPoint(x, y, sandGame.graphics(), false);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_DRAW_PRIMARY);
            Analytics.triggerToolUsed(lastTool);

            e.preventDefault();
        });
        domNode.addEventListener('touchmove', (e) => {
            if (lastTool === null) {
                return;
            }
            const [x, y] = getActualTouchPosition(e);
            lastTool.applyStroke(lastX, lastY, x, y, sandGame.graphics(), false);
            Analytics.triggerToolUsed(lastTool);
            lastX = x;
            lastY = y;

            e.preventDefault();
        });
        domNode.addEventListener('touchend', (e) => {
            lastTool = null;

            e.preventDefault();
        });
    }

    getContext() {
        let domCanvasNode = this.#nodeCanvas[0];
        return domCanvasNode.getContext('2d');
    }

    setImageRenderingStyle(style) {
        let domCanvasNode = this.#nodeCanvas[0];
        domCanvasNode.style.imageRendering = style;
    }

    highlightChunks(changedChunks) {
        this.#debugOverlayComponent.highlightChunks(changedChunks);
    }

    close() {
        // TODO
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-05-09
 */
class SandGameCanvasCursorOverlayComponent {

    /** @type SandGameControls */
    #controls;

    #nodeOverlay;

    /** @type {{node:any,width:number,height:number}|null} */
    #cursor = null;

    constructor(w, h, scale, controls) {
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: `position: absolute; left: 0; top: 0; width: ${wPx}px; height: ${hPx}px;`,
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controls = controls;
    }

    createNode() {
        return this.#nodeOverlay;
    }

    hideCursors() {
        this.#nodeOverlay.empty();
        this.#cursor = null;
    }

    repaintRectangleSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.empty();

        let xPx = Math.min(lastX, x) / scale;
        let yPx = Math.min(lastY, y) / scale;
        let wPx = Math.abs(x - lastX) / scale;
        let hPx = Math.abs(y - lastY) / scale;

        const selection = DomBuilder.div();
        selection.css({
            left: xPx + 'px',
            top: yPx + 'px',
            width: wPx + 'px',
            height: hPx + 'px',
            position: 'absolute',
            outline: 'black 1px solid',
            'pointer-events': 'none'
        });
        this.#nodeOverlay.append(selection);
    }

    repaintLineSelection(lastX, lastY, x, y, scale) {
        this.#nodeOverlay.empty();

        const w = this.#controls.getCurrentWidthPoints();
        const h = this.#controls.getCurrentHeightPoints();

        const line = DomBuilder.create(`
            <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
              <line x1="${lastX}" y1="${lastY}" x2="${x}" y2="${y}" stroke="black" />
            </svg>`
        );
        line.css({
            'pointer-events': 'none'
        });
        this.#nodeOverlay.append(line);
    }

    showCursor(x, y, scale, cursorDefinition) {
        if (cursorDefinition instanceof CursorDefinitionElementArea) {
            const wPx = Math.trunc(cursorDefinition.getWidth() / scale);
            const hPx = Math.trunc(cursorDefinition.getHeight() / scale);

            const node = DomBuilder.element('canvas', {
                width: cursorDefinition.getWidth() + 'px',
                height: cursorDefinition.getHeight() + 'px',
                style: `width: ${wPx}px; height: ${hPx}px; outline: black 1px solid;`,
            });

            // render preview
            let domCanvasNode = node[0];
            domCanvasNode.style.imageRendering = 'pixelated';
            Renderer.renderPreview(cursorDefinition.getElementArea(), domCanvasNode.getContext('2d'), 0xBB);

            this.#cursor = {
                width: wPx,
                height: hPx,
                node: node
            };
        } else {
            return;
        }

        this.#cursor.node.css({
            position: 'absolute',
            'pointer-events': 'none',
        });

        this.moveCursor(x, y, scale);
    }

    hasCursor() {
        return this.#cursor !== null;
    }

    moveCursor(x, y, scale) {
        const cursor = this.#cursor;

        const pxW = this.#controls.getCurrentWidthPoints() / scale;
        const pxH = this.#controls.getCurrentHeightPoints() / scale;

        const pxTop = y / scale - Math.trunc(cursor.height / 2);
        const pxLeft = x / scale - Math.trunc(cursor.width / 2);

        const UNSET = -1;  // expect border
        const pxClipTop = pxTop < 0 ? -pxTop : UNSET;
        const pxClipRight = pxLeft + cursor.width >= pxW ? pxLeft + cursor.width - pxW : UNSET;
        const pxClipBottom = pxTop + cursor.height >= pxH ? pxTop + cursor.height - pxH : UNSET;
        const pxClipLeft = pxLeft < 0 ? -pxLeft : UNSET;

        cursor.node.css({
            top: pxTop + 'px',
            left: pxLeft + 'px',
            'clip-path': `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`
        });

        this.#nodeOverlay.empty();
        this.#nodeOverlay.append(cursor.node);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2023-05-09
 */
class SandGameCanvasDebugOverlayComponent {

    /** @type SandGameControls */
    #controls;

    #nodeOverlay;

    #w;
    #h;
    #scale;

    constructor(w, h, scale, controls) {
        this.#w = w;
        this.#h = h;
        this.#scale = scale;
        const wPx = w / scale;
        const hPx = h / scale;
        this.#nodeOverlay = DomBuilder.div({
            style: `position: absolute; left: 0; top: 0; width: ${wPx}px; height: ${hPx}px;`,
            class: 'sand-game-canvas-overlay',
            width: w + 'px',
            height: h + 'px',
        });
        this.#controls = controls;
    }

    /**
     *
     * @param changedChunks {boolean[]}
     */
    highlightChunks(changedChunks) {
        this.#nodeOverlay.empty();

        if (changedChunks) {

            const sandGame = this.#controls.getSandGame();
            const chunkSize = sandGame.getChunkSize();
            const horChunkCount = Math.ceil(sandGame.getWidth() / chunkSize);
            const verChunkCount = Math.ceil(sandGame.getHeight() / chunkSize);

            for (let cy = 0; cy < verChunkCount; cy++) {
                for (let cx = 0; cx < horChunkCount; cx++) {
                    const chunkIndex = cy * horChunkCount + cx;
                    if (changedChunks[chunkIndex]) {
                        this.#highlightChunk(cx, cy, chunkSize);
                    }
                }
            }
        }
    }

    #highlightChunk(cx, cy, chunkSize) {
        const scale = this.#scale;
        const wPx = this.#w / scale;
        const hPx = this.#h / scale;
        const xPx = cx * chunkSize / scale;
        const yPx = cy * chunkSize / scale;
        const cwPx = chunkSize / scale;
        const chPx = chunkSize / scale;

        const selection = DomBuilder.div();
        selection.css({
            left: xPx + 'px',
            top: yPx + 'px',
            width: cwPx + 'px',
            height: chPx + 'px',
            position: 'absolute',
            outline: 'rgb(0, 255, 0) 1px solid',
            'pointer-events': 'none'
        });

        if (xPx + cwPx >= wPx || yPx + chPx >= hPx) {
            // clip

            const UNSET = -1;  // expect border
            const pxClipTop = UNSET;
            const pxClipRight = xPx + cwPx >= wPx ? xPx + cwPx - wPx : UNSET;
            const pxClipBottom = yPx + chunkSize >= hPx ? yPx + chPx - hPx : UNSET;
            const pxClipLeft = UNSET;

            selection.css({
                'clip-path': `inset(${pxClipTop}px ${pxClipRight}px ${pxClipBottom}px ${pxClipLeft}px)`
            });
        }

        this.#nodeOverlay.append(selection);
    }

    createNode() {
        return this.#nodeOverlay;
    }
}
