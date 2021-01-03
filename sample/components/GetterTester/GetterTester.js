import { component } from '@halleymedia/unobtrusive-vue';
import template from './GetterTester.html';

@component('getter-tester', template)
class GetterTester {
  /**
   * @type {undefined|any}
   */
  #el;

  get el () {
    return this.#el;
  }

  set el (val) {
    this.#el = val;
  }
}

export default GetterTester;
