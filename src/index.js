import VueComponentUpdater from './services/VueComponentUpdater';
import ComponentDecorator from './services/ComponentDecorator';
import VueTemplateTransformer from './services/VueTemplateTransformer';
import App from './services/UnobtrusiveVueApp';

export const UnobtrusiveVueApp = App;
export const templateTransformer = VueTemplateTransformer;
export const component = ComponentDecorator;
export const forceUpdate = VueComponentUpdater.update;
