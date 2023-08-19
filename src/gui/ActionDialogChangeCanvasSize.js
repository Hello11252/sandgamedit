import { DomBuilder } from "./DomBuilder";
import { Action } from "./Action";
import { Analytics } from "../Analytics";

/**
 *
 * @author Patrik Harag
 * @version 2023-08-19
 */
export class ActionDialogChangeCanvasSize extends Action {

    performAction(sandGameControls) {
        let formBuilder = new DomBuilder.BootstrapSimpleForm();
        formBuilder.addInput('Width', 'width', '' + sandGameControls.getCurrentWidthPoints());
        formBuilder.addInput('Height', 'height', '' + sandGameControls.getCurrentHeightPoints());
        formBuilder.addInput('Scale', 'scale', '' + sandGameControls.getCurrentScale());

        let dialog = new DomBuilder.BootstrapDialog();
        dialog.setHeaderContent('Change canvas size manually');
        dialog.setBodyContent(formBuilder.createNode());
        dialog.addSubmitButton('Submit', () => {
            let data = formBuilder.getData();
            let w = Number.parseInt(data['width']);
            let h = Number.parseInt(data['height']);
            let s = Number.parseFloat(data['scale']);
            sandGameControls.changeCanvasSize(w, h, s);
            Analytics.triggerFeatureUsed(Analytics.FEATURE_CANVAS_SIZE_CHANGE);
        });
        dialog.addCloseButton('Close');
        dialog.show(sandGameControls.getDialogAnchor());
    }
}
