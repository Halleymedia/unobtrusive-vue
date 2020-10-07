export default class VueComponentDescriptor {
  /**
   * @type {any}
   */
  #componentKey;

  /**
   * @type {any}
   */
  #params;

  /**
   * @type {string}
   */
  #elementName;

  /**
   * @type {new (params: any) => any}
   */
  #componentConstructor;

  /**
   * @type {Array<string>}
   */
  #methods = [];

  /**
   * @type {Array<string>}
   */
  #computed = [];

  /**
   * @type {Array<string>}
   */
  #properties = [];

  /**
   * @type {string}
   */
  #template;

  /**
   * Creates a new descriptor instance
   * @param {any} componentKey
   */
  constructor (componentKey) {
    this.#methods = [];
    this.#computed = [];
    this.#properties = [];
    this.#componentKey = componentKey;
    this.#template = '';
    this.#elementName = '';
    this.#componentConstructor = class {};
  }

  /**
   * Params passed to the constructor
   * @type {any}
   */
  get params () {
    return this.#params;
  }

  set params (value) {
    this.#params = value;
  }

  /**
   * Key of the component
   * @type {any}
   */
  get componentKey () {
    return this.#componentKey;
  }

  /**
   * Name of the element
   * @type {string}
   */
  get elementName () {
    return this.#elementName;
  }

  set elementName (value) {
    this.#elementName = value;
  }

  /**
   * Constructor of the component
   * @type {new (params: any) => any}
   */
  get componentConstructor () {
    return this.#componentConstructor;
  }

  set componentConstructor (value) {
    this.#componentConstructor = value;
  }

  /**
   * Public methods of the component
   * @type {Array<string>}
   */
  get methods () {
    return this.#methods;
  }

  set methods (value) {
    this.#methods = value;
  }

  /**
   * Computed properties of the component
   * @type {Array<string>}
   */
  get computed () {
    return this.#computed;
  }

  set computed (value) {
    this.#computed = value;
  }

  /**
   * Public properties of the component
   * @type {Array<string>}
   */
  get properties () {
    return this.#properties;
  }

  set properties (value) {
    this.#properties = value;
  }

  /**
   * HTML template of the component
   * @type {string}
   */
  get template () {
    return this.#template;
  }

  set template (value) {
    this.#template = value;
  }

  /**
   * @returns {VueComponentDescriptor}
   */
  clone () {
    const descriptor = new VueComponentDescriptor(this.#componentKey);
    descriptor.template = this.template;
    descriptor.properties = this.properties;
    descriptor.computed = this.computed;
    descriptor.methods = this.methods;
    descriptor.componentConstructor = this.componentConstructor;
    descriptor.elementName = this.elementName;
    descriptor.params = Object.create(this.params);
    return descriptor;
  }
}
