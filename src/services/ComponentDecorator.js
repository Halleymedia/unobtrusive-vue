import { componentRegistry } from './VueComponentRegistry';
import VueTemplateTransformer from './VueTemplateTransformer';

/**
 * @type {function|undefined}
 */
let onComponentUpdatedCallback;

/**
 * @param {string} elementName
 * @param {string} template
 * @return {(target: any) => any}
 */
export default (elementName, template) => {
  template = VueTemplateTransformer.transform(template);
  return (target) => {
    componentRegistry.registerComponent(elementName, target, target);
    const ignoreMembers = ['constructor', 'init', 'dispose'];

    /**
     * @type {Array<string>}
     */
    const propertyNames = [];

    const memberNames = Object.getOwnPropertyNames(target.prototype).filter(name => ignoreMembers.indexOf(name) < 0);

    /**
     * @type {Array<string>}
     */
    const methodNames = [];

    /**
     * @type {Array<string>}
     */
    const computedNames = [];

    memberNames.forEach(memberName => {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, memberName);
      if (!descriptor) {
        return;
      }
      let hasSetter = false;
      let hasGetter = false;
      if (('set' in descriptor) && descriptor.set) {
        propertyNames.push(memberName);
        hasSetter = true;
      }
      if (('get' in descriptor) && descriptor.get) {
        computedNames.push(memberName);
        hasGetter = true;
      }
      if (!hasSetter && !hasGetter) {
        methodNames.push(memberName);
      }
    });

    componentRegistry.registerComponentMethods(target, methodNames);
    componentRegistry.registerComponentProperties(target, propertyNames);
    componentRegistry.registerComponentComputed(target, computedNames);
    componentRegistry.registerComponentTemplate(target, template);
    if (onComponentUpdatedCallback && typeof onComponentUpdatedCallback === 'function') {
      const descriptor = componentRegistry.getOrCreateDescriptor(target);
      onComponentUpdatedCallback(descriptor);
    }
  };
};

/**
 * @param {function|undefined} callback
 */
export function setComponentUpdatedCallback (callback) {
  onComponentUpdatedCallback = callback;
}
