
/**
 * @interface
 *
 * @author Patrik Harag
 * @version 2023-08-27
 */
export class Scene {

    /**
     * @returns [width: number, height: number]
     */
    countSize(prefWidth, prefHeight) {
        throw 'Not implemented';
    }

    /**
     * @param prefWidth {number}
     * @param prefHeight {number}
     * @param processorDefaults {ProcessorDefaults}
     * @param context {CanvasRenderingContext2D|WebGLRenderingContext}
     * @param rendererInitializer {RendererInitializer}
     * @returns SandGame
     */
    createSandGame(prefWidth, prefHeight, processorDefaults, context, rendererInitializer) {
        throw 'Not implemented';
    }

    /**
     * @param prefWidth
     * @param prefHeight
     * @param defaultElement
     * @returns ElementArea
     */
    createElementArea(prefWidth, prefHeight, defaultElement) {
        throw 'Not implemented';
    }
}
