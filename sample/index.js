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

const localization = {
  main: {
    title: 'Unobtrusive Vue counter demo',
    initialValue: 'Initial value',
    autoIncrement: 'Autoincrement once a second'
  },
  counter: {
    title: 'Here\'s the counter!'
  },
  footer: {
    someLinks: 'Some useful links',
    thisProject: 'This project',
    suggestedExtensions: 'Suggested VSCode extensions'
  }
};

const container = /** @type {HTMLElement} **/ (global.document.querySelector('[data-app]'));
if (container) {
  /**
   * @type {UnobtrusiveVueApp|null}
   */
  let app = null;

  /**
   * @type {any|undefined}
   */
  const appOptions = { isDev: false, onAppCreating: undefined, onComponentUpdated: undefined, onComponentCreating: addGlobals };
  // #!if MODE === 'development'
  appOptions.isDev = true;
  if (module.hot) {
    const { setupHotModuleReload } = require('./webpack.hot-loader');
    const { onAppCreating, onComponentUpdated } = setupHotModuleReload(module.hot, () => app);
    appOptions.onAppCreating = onAppCreating;
    appOptions.onComponentUpdated = onComponentUpdated;
  }
  // #!endif
  const message = 'Hey there!';
  const appParams = new AppParams({ message });
  app = new UnobtrusiveVueApp(container, appParams, appOptions);
  console.log('App started', app);
}

/**
 * @param {any} componentDescriptor
 * @param {any} componentPropertyBag
 */
function addGlobals (componentDescriptor, componentPropertyBag) {
  Object.defineProperty(componentPropertyBag, 'localization', { enumerable: true, configurable: false, value: () => localization });
}
