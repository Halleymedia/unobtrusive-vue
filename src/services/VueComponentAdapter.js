import VueTemplateTransformer from './VueTemplateTransformer';
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
          componentInstance[prop.substr(VueTemplateTransformer.propPrefix.length)] = parseValue(vueComponent[prop]);
        });
        /**
         * @type {any}
         */
        const componentPrototype = componentInstance.constructor.prototype;
        if ('init' in componentPrototype) {
          // Let it finish its rendering cycle
          setTimeout(() => componentPrototype.init.call(componentInstance, containerElement), 0);
        }
        componentInstance.__backdoor++;
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
          this.__backdoor++;
          if (result && ('finally' in result) && (typeof result.finally === 'function')) {
            result.finally(() => { this.__backdoor++; });
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
          // @ts-ignore
          noop(activationObject.__backdoor);
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
        componentInstance.__backdoor++;
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
      instance.__backdoor = 0;
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
    if ((value == null) || (typeof value !== 'string')) {
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
function noop () {

}
