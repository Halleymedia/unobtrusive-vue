import './index.scss';
import { UnobtrusiveVueApp } from '../lib';
import AppParams from './models/AppParams';

/**
 * Imports all components since they're not statically referenced with import.
 * @param {any} requireResult
 */
function importAll (requireResult) {
  requireResult.keys().map(requireResult);
}
importAll(require.context('./components', true, /\.js$/));

const container = /** @type {HTMLElement} **/ (global.document.querySelector('[data-app]'));
if (container) {
  /**
   * @type {UnobtrusiveVueApp|null}
   */
  let app = null;

  /**
   * @type {any|undefined}
   */
  const appOptions = { isDev: false, onBeforeAppCreate: undefined, onComponentUpdated: undefined };
  // #!if MODE === 'development'
  appOptions.isDev = true;
  if (module.hot) {
    const { setupHotModuleReload } = require('./webpack.hot-loader');
    const { onBeforeAppCreate, onComponentUpdated } = setupHotModuleReload(module.hot, () => app);
    appOptions.onBeforeAppCreate = onBeforeAppCreate;
    appOptions.onComponentUpdated = onComponentUpdated;
  }
  // #!endif
  const message = 'Hey there!';
  const appParams = new AppParams({ message });
  app = new UnobtrusiveVueApp(container, appParams, appOptions);
  console.log('App started', app);
}
