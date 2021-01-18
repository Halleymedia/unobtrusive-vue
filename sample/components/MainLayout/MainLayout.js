import './MainLayout.scss';
import { component } from '@halleymedia/unobtrusive-vue';
import template from './MainLayout.html';
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

  /**
   * @type {number}
   */
  initialValue = 1;

  /**
   * @type {boolean}
   */
  autoIncrement = false;
}
export default MainLayout;
