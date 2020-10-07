import { UnobtrusiveVueApp } from '../lib';
import './index.scss';
import AppParams from './models/AppParams';
/**
 * Imports all components since they're not statically referenced with import.
 * @param {any} requireResult
 */
function importAll (requireResult) {
  return requireResult.keys().map(requireResult);
}
importAll(require.context('./components', true, /\.js$/));

const container = /** @type {HTMLElement} **/ (global.document.querySelector('[data-app]'));
if (container) {
  const message = 'Hey there!';
  const appParams = new AppParams({ message });
  const app = new UnobtrusiveVueApp(container, appParams);
  console.log('App started', app);
}
