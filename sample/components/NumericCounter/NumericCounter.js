import './NumericCounter.scss';
import { component } from '@halleymedia/unobtrusive-vue';
import template from './NumericCounter.html';

@component('numeric-counter', template)
class NumericCounter {
  /**
   * @type {number}
   */
  #value = 0;

  /**
   * @type {NodeJS.Timeout|undefined}
   */
  #intervalToken;

  /**
   * @type {string}
   */
  #title = 'Demo';

  /**
   * @type {((value: number) => void)|undefined}
   */
  #updateCallback;

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
    this.#updateValue(isNaN(value) ? 0 : value);
  }

  /**
   * @param {boolean} value
   */
  set autoIncrement (value) {
    if (!value) {
      this.#clearInterval();
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
    this.#updateValue(this.#value + 1);
  }

  decrement () {
    this.#updateValue(Math.max(0, this.#value - 1));
  }

  dispose () {
    this.#clearInterval();
  }

  /**
   * @param {(value: number) => void} callback
   */
  set onupdate (callback) {
    this.#updateCallback = callback;
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

  /**
   * @param {number} value
   */
  #updateValue = (value) => {
    this.#value = value;
    if (this.#updateCallback) {
      this.#updateCallback(this.#value);
    }
  };

  #clearInterval = () => {
    if (!this.#intervalToken) {
      return;
    }

    clearInterval(this.#intervalToken);
    this.#intervalToken = undefined;
  }
}

export default NumericCounter;
