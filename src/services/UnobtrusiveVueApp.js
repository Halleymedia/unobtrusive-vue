import Vue from 'vue/dist/vue';
import VueComponentAdapter from './VueComponentAdapter';
import { componentRegistry } from './VueComponentRegistry';
import { setComponentUpdatedCallback } from './ComponentDecorator';

export default class UnobtrusiveVueApp {
  /**
   * @type {Vue}
   */
  #vueInstance;

  /**
   * @type {typeof Vue}
   */
  #vue;

  /**
   * @type {any}
   */
  #componentParams;

  /**
   * @type {Object.<string, import('./VueComponentAdapter').default>}
   */
  #components = {};

  /**
   * @type {boolean}
   */
  #isDev;

  /**
   * Installs Vue on the container element
   * @param {HTMLElement} el
   * @param {any|undefined} [componentParams]
   * @param {{ isDev: boolean, onBeforeAppCreate: function|undefined, onComponentUpdated: function|undefined, errHandler: function|undefined }|undefined} [options]
   */
  constructor (el, componentParams, options) {
    this.#vue = Vue;
    this.#isDev = options !== undefined && options.isDev === true;
    this.#componentParams = componentParams || {};
    this.#components = this.#createVueComponents();
    const components = this.#components;
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

    if (options) {
      if (options.onComponentUpdated) {
        setComponentUpdatedCallback(options.onComponentUpdated);
      }
      if (options.onBeforeAppCreate && (typeof options.onBeforeAppCreate === 'function')) {
        options.onBeforeAppCreate(Vue, components);
      }
    }

    if (this.#isDev) {
      // @ts-ignore
      Vue.config.devtools = true;
      // @ts-ignore
      Vue.config.performance = true;
    }

    // @ts-ignore
    // Vue.config.silent = true;
    // @ts-ignore
    Vue.config.productionTip = false;
    // @ts-ignore
    Vue.config.errorHandler = this.#errorHandler.bind(this, options && options.errorHandler ? options.errorHandler : this.#defaultErrorHandler);
    // @ts-ignore
    Vue.config.warnHandler = this.#warnHandler.bind(this, options && options.warnHandler ? options.warnHandler : this.#defaultWarnHandler);

    // @ts-ignore
    this.#vueInstance = /** @type {Vue} */ (new Vue({ el, template, components, data }));
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
   * @param {string} elementName
   * @param {import('../models/VueComponentDescriptor').default} descriptor
   * @returns {import('./VueComponentAdapter').default}
   */
  updateComponent (elementName, descriptor) {
    const updatedComponent = this.#createVueComponent(descriptor, this.#components);
    this.#components[elementName] = updatedComponent;
    return updatedComponent;
  }

  get components () {
    return Object.create(this.#components);
  }

  get vueInstance () {
    return this.#vueInstance;
  }

  get vue () {
    return this.#vue;
  }

  /**
   * Destroys the app
   */
  dispose () {
    // @ts-ignore
    this.#vueInstance.$destroy();
  }

  /**
   * Registers modules found in the app as Vue Components
   * @returns {Object.<string, import('./VueComponentAdapter').default>}
   */
  #createVueComponents = () => {
    /**
     * @type {Object.<string, import('./VueComponentAdapter').default>}
     */
    const components = {};
    componentRegistry.descriptors.forEach(descriptor => {
      descriptor.params = Object.create(this.#componentParams);
      const component = this.#createVueComponent(descriptor, components);
      components[descriptor.elementName] = component;
    });

    return components;
  }

  /**
   * @param {import('../models/VueComponentDescriptor').default} descriptor
   * @param {Object.<string, import('./VueComponentAdapter').default>} components
   */
  #createVueComponent = (descriptor, components) => {
    const component = new VueComponentAdapter(descriptor, components);
    if (this.#isDev) {
      Object.defineProperty(component, 'renderError', {
        configurable: false,
        enumerable: true,
        value: this.#renderError
      });
    }
    return component;
  }

  /**
   * @param {function} innerHandler
   * @param {Error} err
   * @param {any} vm
   * @param {string} info
   */
  #errorHandler = (innerHandler, err, vm, info) => {
    innerHandler(err, vm, info);
  };

  /**
   * @param {function} innerHandler
   * @param {string} err
   * @param {any} vm
   * @param {string} info
   */
  #warnHandler = (innerHandler, err, vm, info) => {
    // Component instance contains both data and computed properties. That's how it is, suppress this warning.
    if (/The computed property .* is already defined in data/.test(err)) {
      return;
    }
    innerHandler(err, vm, info);
  };

  /**
   * @param {function} h
   * @param {any} err
   */
  #renderError = (h, err) => {
    return h('pre', { style: { color: 'red' } }, ['❌ Rendering error (see console)']); // err.stack
  };

  /**
   * @param {string} err
   * @param {any} vm
   * @param {string} info
   */
  #defaultErrorHandler = (err, vm, info) => {
    console.error(err, vm, info);
  };

  /**
   * @param {Error} err
   * @param {any} vm
   * @param {string} info
   */
  #defaultWarnHandler = (err, vm, info) => {
    console.warn(err, vm, info);
  };
}
