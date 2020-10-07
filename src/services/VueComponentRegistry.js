import VueComponentDescriptor from '../models/VueComponentDescriptor';

export default class VueComponentRegistry {
  /**
   * @type {Map<any, VueComponentDescriptor>}
   */
  #descriptors;

  constructor () {
    this.#descriptors = new Map();
  }

  /**
   * @param {string} elementName
   * @param {any} componentKey
   * @param {new (params: any) => any} componentConstructor
   */
  registerComponent (elementName, componentKey, componentConstructor) {
    const descriptor = this.getOrCreateDescriptor(componentKey);
    descriptor.componentConstructor = componentConstructor;
    descriptor.elementName = elementName;
  }

  /**
   * @param {any} componentKey
   * @returns {VueComponentDescriptor}
   */
  getOrCreateDescriptor (componentKey) {
    let descriptor = this.#descriptors.get(componentKey);
    if (!descriptor) {
      descriptor = new VueComponentDescriptor(componentKey);
      this.#descriptors.set(componentKey, descriptor);
    }
    return descriptor;
  }

  /**
   * @param {any} componentDescriptor
   * @param {Array<string>} methodNames
   */
  registerComponentMethods (componentDescriptor, methodNames) {
    const descriptor = this.getOrCreateDescriptor(componentDescriptor);
    descriptor.methods.push(...methodNames);
  }

  /**
   * @param {any} componentDescriptor
   * @param {Array<string>} computedNames
   */
  registerComponentComputed (componentDescriptor, computedNames) {
    const descriptor = this.getOrCreateDescriptor(componentDescriptor);
    descriptor.computed.push(...computedNames);
  }

  /**
   * @param {any} componentKey
   * @param {Array<string>} propertyNames
   */
  registerComponentProperties (componentKey, propertyNames) {
    const descriptor = this.getOrCreateDescriptor(componentKey);
    descriptor.properties.push(...propertyNames);
  }

  /**
   * @param {any} componentKey
   * @param {string} template
   */
  registerComponentTemplate (componentKey, template) {
    this.getOrCreateDescriptor(componentKey).template = template;
  }

  /**
   * @param {string} elementName
   * @param {any} params
   */
  setComponentParams (elementName, params) {
    this.#descriptors.forEach(descriptor => {
      if (descriptor.elementName === elementName) {
        descriptor.params = params;
      }
    });
  }

  /**
   * Returns registered descriptors
   * @returns {Array<VueComponentDescriptor>}
   */
  get descriptors () {
    /**
     * @type {Array<VueComponentDescriptor>}
     */
    const results = [];
    this.#descriptors.forEach(descriptor => results.push(descriptor)); // TODO: we could use the 'values' property here and the spread operator but those are not supported by IE11 so that would need a polyfill or a babel transform
    return results;
  }
}

export const componentRegistry = new VueComponentRegistry();
