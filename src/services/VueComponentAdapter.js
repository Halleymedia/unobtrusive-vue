import Vue from 'vue/dist/vue';
import VueTemplateTransformer from './VueTemplateTransformer';
import VueComponentUpdater from './VueComponentUpdater';

export default class VueComponentAdapter {
  /**
   * @type {import('../models/VueComponentDescriptor').default}
   */
  #componentDescriptor;

  /**
   * @type {function|undefined}
   */
  #onComponentCreating;

  /**
   * @param {import('../models/VueComponentDescriptor').default} componentDescriptor
   * @param {Object.<string, VueComponentAdapter>} components
   * @param {boolean|undefined} [addRenderError]
   * @param {function|undefined} [onComponentCreating]
   */
  constructor (componentDescriptor, components, addRenderError, onComponentCreating) {
    this.#componentDescriptor = componentDescriptor;
    this.#onComponentCreating = onComponentCreating;
    const props = this.getProps();
    this.props = props;
    this.components = components;
    const parseValue = this.#parseValue;
    Object.defineProperty(this, 'methods', { configurable: false, enumerable: true, get: this.getMethods });
    Object.defineProperty(this, 'data', { configurable: false, enumerable: true, get: this.getData });
    Object.defineProperty(this, 'computed', { configurable: false, enumerable: true, get: this.getComputed, set: () => {} });
    Object.defineProperty(this, 'template', { configurable: false, enumerable: true, get: this.getTemplate, set: this.setTemplate });
    Object.defineProperty(this, 'watch', { configurable: false, enumerable: true, get: this.getWatch, set: () => {} });
    Object.defineProperty(this, 'beforeMount', {
      configurable: false,
      enumerable: true,
      value: function () {
        /**
         * @type {any}
         */
        const vueComponent = this;
        const componentInstance = vueComponent.$data;
        props.forEach(/** @param {string} prop */ prop => {
          if (prop in this.$vnode.componentOptions.propsData) {
            componentInstance[VueTemplateTransformer.getOriginalPropertyName(prop)] = parseValue(vueComponent[prop]);
          }
        });
      }
    });
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
        /**
         * @type {any}
         */
        const componentPrototype = componentInstance.constructor.prototype;
        if ('init' in componentPrototype) {
          // Let it finish its rendering cycle
          setTimeout(() => {
            const result = componentPrototype.init.call(componentInstance, containerElement);
            VueComponentUpdater.update(componentInstance);
            VueComponentUpdater.updateOnCompleteIfNeeded(componentInstance, result);
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
    if (addRenderError) {
      Object.defineProperty(this, 'renderError', {
        configurable: false,
        enumerable: true,
        value: this.#renderError
      });
    }

    const compiledTemplate = Vue.compile(this.getTemplate());
    Object.defineProperty(this, 'staticRenderFns', {
      configurable: false,
      enumerable: true,
      value: compiledTemplate.staticRenderFns
    });
    Object.defineProperty(this, 'render', {
      configurable: false,
      enumerable: true,
      value: compiledTemplate.render
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
          VueComponentUpdater.updateOnCompleteIfNeeded(this, result);
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
          let value = descriptor.get.call(activationObject);
          if (typeof value === 'object' && !value.__ob__) {
            // @ts-ignore
            value = Vue.observable(value);
          }
          return value;
        } : undefined;
      });
    if (this.#onComponentCreating && typeof this.#onComponentCreating === 'function') {
      this.#onComponentCreating(this.#componentDescriptor, computed);
    }
    return computed;
  }

  getWatch () {
    /**
     * @type {Object.<string, function>}
     */
    const watch = {};
    const parseValue = this.#parseValue;

    const proto = this.#componentDescriptor.componentConstructor.prototype;

    this.getProps().forEach(prop => {
      // Rewrite setters
      const originalPropertyName = VueTemplateTransformer.getOriginalPropertyName(prop);
      const descriptor = Object.getOwnPropertyDescriptor(proto, originalPropertyName);
      if (!descriptor) {
        return;
      }
      const originalSetter = descriptor.set;
      if (!originalSetter) {
        return;
      }
      descriptor.set = function (value) {
        originalSetter.call(this, value);
        VueComponentUpdater.update(this);
      };
      Object.defineProperty(proto, originalPropertyName, descriptor);

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
        componentInstance[VueTemplateTransformer.getOriginalPropertyName(prop)] = parsedValue;
        // No longer needed since setters have been rewritten to update the component
        // VueComponentUpdater.update(componentInstance);
      };
    });
    return watch;
  }

  getTemplate () {
    return this.#componentDescriptor.template;
  }

  /**
   * @param {string} value
   */
  setTemplate (value) {
    this.#componentDescriptor.template = value;
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

  getComponentDescriptor () {
    return this.#componentDescriptor;
  }

  /**
   * Returns a parsed value
   * @param {any} value
   * @returns {any}
   */
  #parseValue = (value) => {
    if (value == null || value === '') {
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

    if (/^-?\d*\.?\d*$/.test(value)) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }

    return value;
  }

  /**
   * @param {function} h
   * @param {any} err
   */
  #renderError = (h, err) => {
    return h('pre', { style: { color: 'red' } }, ['❌ Rendering error (see console)']); // err.stack
  };
}
