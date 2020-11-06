import Vue from 'vue/dist/vue.min';
import VueTemplateTransformer from './VueTemplateTransformer';
import VueComponentUpdater from './VueComponentUpdater';

export default class VueComponentAdapter {
  /**
   * @type {import('../models/VueComponentDescriptor').default}
   */
  #componentDescriptor;

  /**
   * @param {import('../models/VueComponentDescriptor').default} componentDescriptor
   * @param {Object.<string, VueComponentAdapter>} components
   */
  constructor (componentDescriptor, components) {
    this.#componentDescriptor = componentDescriptor;
    const props = this.getProps();
    this.props = props;
    this.components = components;
    const parseValue = this.#parseValue;
    Object.defineProperty(this, 'methods', { configurable: false, enumerable: true, get: this.getMethods });
    Object.defineProperty(this, 'template', { configurable: false, enumerable: true, get: this.getTemplate });
    Object.defineProperty(this, 'data', { configurable: false, enumerable: true, get: this.getData });
    Object.defineProperty(this, 'computed', { configurable: false, enumerable: true, get: this.getComputed, set: () => {} });
    Object.defineProperty(this, 'watch', { configurable: false, enumerable: true, get: this.getWatch, set: () => {} });
    Object.defineProperty(this, 'mounted', {
      configurable: false,
      enumerable: true,
      value: function () {
        /**
         * @type {any}
         */
        const vueComponent = this;
        const componentInstance = vueComponent.$data;
        const containerElement = vueComponent.$el;
        props.forEach(/** @param {string} prop */ prop => {
          if (prop in this.$vnode.componentOptions.propsData) {
            componentInstance[prop.substr(VueTemplateTransformer.propPrefix.length)] = parseValue(vueComponent[prop]);
          }
        });
        /**
         * @type {any}
         */
        const componentPrototype = componentInstance.constructor.prototype;
        if ('init' in componentPrototype) {
          // Let it finish its rendering cycle
          setTimeout(() => {
            componentPrototype.init.call(componentInstance, containerElement);
            VueComponentUpdater.update(componentInstance);
          }, 0);
        } else {
          VueComponentUpdater.update(componentInstance);
        }
      }
    });
    Object.defineProperty(this, 'destroyed', {
      configurable: false,
      enumerable: true,
      value: function () {
        /**
         * @type {any}
         */
        const vueComponent = this;
        const componentInstance = vueComponent.$data;
        /**
         * @type {any}
         */
        const componentPrototype = componentInstance.constructor.prototype;
        if ('dispose' in componentPrototype) {
          componentPrototype.dispose.call(componentInstance);
        }
      }
    });
  }

  getMethods () {
    /**
     * @type {Object.<string, (params: any|undefined) => any>}
     */
    const methods = {};
    const proto = this.#componentDescriptor.componentConstructor.prototype;
    this.#componentDescriptor.methods
      .forEach(method => {
        const oldMethod = proto[method];
        proto[method] = function () {
          const result = oldMethod.apply(this, arguments);
          VueComponentUpdater.update(this);
          if (result && ('finally' in result) && (typeof result.finally === 'function')) {
            result.finally(() => { VueComponentUpdater.update(this); });
          }
          return result;
        };
        methods[method] = function () {
          const activationObject = /** @type {any} */ (('$data' in this) ? this.$data : this);
          return proto[method].apply(activationObject, arguments);
        };
      });
    return methods;
  }

  getComputed () {
    /**
     * @type {Object.<string, function|undefined>}
     */
    const computed = {};
    const proto = this.#componentDescriptor.componentConstructor.prototype;
    this.#componentDescriptor.computed
      .forEach(method => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, method);
        computed[method] = (descriptor && descriptor.get) ? function () {
          // @ts-ignore
          const activationObject = /** @type {any} */ (('$data' in this) ? this.$data : this);
          VueComponentUpdater.getValue(activationObject);
          // @ts-ignore
          return descriptor.get.call(activationObject);
        } : undefined;
      });
    return computed;
  }

  getWatch () {
    /**
     * @type {Object.<string, function>}
     */
    const watch = {};
    const parseValue = this.#parseValue;
    this.getProps().forEach(prop => {
      /**
       * @param {any} value
       * @param {any} previousValue
       */
      watch[prop] = function (value, previousValue) {
        if (value === previousValue) {
          return;
        }
        /**
         * @type {any}
         */
        const vueComponent = this;
        /**
         * @type {any}
         */
        const componentInstance = vueComponent.$data;
        const parsedValue = parseValue(value);
        componentInstance[prop.substr(VueTemplateTransformer.propPrefix.length)] = parsedValue;
        VueComponentUpdater.update(componentInstance);
      };
    });
    return watch;
  }

  getTemplate () {
    return this.#componentDescriptor.template;
  }

  getData () {
    const ConstructorFunction = this.#componentDescriptor.componentConstructor;
    return () => {
      const instance = new ConstructorFunction(this.#componentDescriptor.params);
      VueComponentUpdater.init(instance);
      return instance;
    };
  }

  getProps () {
    return this.#componentDescriptor.properties.map(name => {
      const alteredName = `${VueTemplateTransformer.propPrefix}${name}`;
      return alteredName;
    });
  }

  /**
   * Returns a parsed value
   * @param {any} value
   * @returns {any}
   */
  #parseValue = (value) => {
    if (value == null) {
      return value;
    }
    if (typeof value === 'object') {
      if (!value.__ob__) {
        // @ts-ignore
        value = Vue.observable(value);
        return value;
      }
    }
    if (typeof value !== 'string') {
      return value;
    }
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    }
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    return value;
  }
}
