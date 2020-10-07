import { component } from '../../lib';
import template from './NumericCounter.html';

@component('numeric-counter', template)
class NumericCounter {
  /**
   * @type {number}
   */
  #value = 0

  /**
   * @type {NodeJS.Timeout|undefined}
   */
  #intervalToken

  /**
   * @type {string}
   */
  #title = 'Demo'

  /**
   * @type {string}
   */
  get value () {
    return this.#value.toString();
  }

  /**
   * @param {number} value
   */
  set value (value) {
    this.#value = isNaN(value) ? 0 : value;
  }

  /**
   * @param {boolean} value
   */
  set autoIncrement (value) {
    if (!value) {
      if (this.#intervalToken) {
        clearInterval(this.#intervalToken);
        this.#intervalToken = undefined;
      }
      return;
    }
    if (value && this.#intervalToken) {
      return;
    }
    this.#intervalToken = setInterval(() => {
      this.increment();
    }, 1000);
  }

  increment () {
    this.#value++;
  }

  decrement () {
    this.#value = Math.max(0, this.#value - 1);
  }

  /**
   * @type {string}
   */
  get title () {
    return this.#title;
  }

  set title (title) {
    this.#title = title;
  }
}

export default NumericCounter;
