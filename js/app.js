import {FrModel} from "./fr/modules/Model.js";
import {FrView} from "./fr/view/View.js";
import {Presenter} from "./fr/presenter/Presenter.js";
import {HumanManager} from "./fr/modules/HumanManager.js";

document.addEventListener('DOMContentLoaded', () => {
    const faceManager = new HumanManager();
    const model = new FrModel(faceManager);
    const view = new FrView();
    const presenter = new Presenter(view, model);

    presenter.initStream()
})