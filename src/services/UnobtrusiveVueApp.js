import Vue from 'vue/dist/vue.min';
import VueComponentAdapter from './VueComponentAdapter';
import { componentRegistry } from './VueComponentRegistry';

export default class UnobtrusiveVueApp {
  /**
   * @type {Vue}
   */
  #vue;

  /**
   * @type {any}
   */
  #componentParams;

  /**
   * Installs Vue on the container element
   * @param {HTMLElement} el
   * @param {any|undefined} [componentParams]
   */
  constructor (el, componentParams) {
    this.#componentParams = componentParams || {};
    const components = this.#generateVueComponents();
    const template = (el.innerHTML || '').replace(/\s/gm, '') === '' ? '<main-layout></main-layout>' : el.innerHTML;
    el.innerHTML = '';
    const dataObjectAttribute = el.getAttribute('data-object');
    let data = {};
    try {
      if (dataObjectAttribute) {
        data = JSON.parse(dataObjectAttribute);
      }
    } catch {
    }
    // @ts-ignore
    this.#vue = /** @type {Vue} */ (new Vue({ el, template, components, data }));
  }

  /**
   * @param {string} elementName
   * @param {any} params
   */
  setAdditionalComponentParams (elementName, params) {
    const componentParams = Object.create(this.#componentParams);
    params = params || {};
    for (const prop in params) {
      componentParams[prop] = params[prop];
    }
    componentRegistry.setComponentParams(elementName, componentParams);
  }

  /**
   * Destroys the app
   */
  dispose () {
    // @ts-ignore
    this.#vue.$destroy();
  }

  /**
   * Registers modules found in the app as Vue Components
   * @returns {Object.<string, VueComponentAdapter>}
   */
  #generateVueComponents = () => {
    /**
     * @type {Object.<string, VueComponentAdapter>}
     */
    const components = {};
    componentRegistry.descriptors.forEach(descriptor => {
      descriptor.params = Object.create(this.#componentParams);
      const component = new VueComponentAdapter(descriptor, components);
      components[descriptor.elementName] = component;
    });
    return components;
  }
}
