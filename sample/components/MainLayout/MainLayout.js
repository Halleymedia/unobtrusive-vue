import './MainLayout.scss';
import { component } from '@halleymedia/unobtrusive-vue';
import template from './MainLayout.html';

class ComplexObject {
  #a = 1;
  get a () {
    return this.#a;
  }

  set a (value) {
    this.#a = value;
  }

  b = { c: 2 };
  d = [{ e: 1 }];
}

@component('main-layout', template)
class MainLayout {
  /**
   * @param {import('../../models/AppParams').default} params
   */
  constructor ({ message }) {
    console.log('Received message at construction', message);
  }

  /**
   * @param {HTMLElement} element
   */
  init (element) {
    console.log('MainLayout has been rendered on element', element);
    setInterval(this.#update.bind(this), 1000);
  }

  #update = () => {
    this.complex.el.b.c++;
    this.complex.el.a++;
    this.complex.el.d[0].e++;
  }

  dispose () {
    console.log('MainLayout has been disposed');
  }

  /**
   * @param {Array<any>} args
   * @param {number} value
   */
  logUpdate (args, value) {
    console.log('Value updated', value, args);
  }

  complex = { el: new ComplexObject() };

  /**
   * @type {number}
   */
  initialValue = 1;

  /**
   * @type {boolean}
   */
  autoIncrement = false
}
export default MainLayout;
