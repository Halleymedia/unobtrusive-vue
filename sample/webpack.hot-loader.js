/**
 * @this any
 * @param {string} source
 */
module.exports = function (source) {
  return source + '\nif (module.hot) module.hot.accept();\n';
};

/**
 * @param {__WebpackModuleApi.Hot|undefined} hot
 * @param {() => import('@halleymedia/unobtrusive-vue').UnobtrusiveVueApp} appAccessor
 * @returns {{ onAppCreating: function|undefined, onComponentUpdated: function|undefined }}
 */
module.exports.setupHotModuleReload = (hot, appAccessor) => {
  /**
   * @type {function|undefined}
   */
  let onAppCreating;

  /**
 * @type {function|undefined}
 */
  let onComponentUpdated;

  if (hot) {
    const hotReloadApi = require('vue-hot-reload-api');
    onAppCreating = /**
    * @param {any} vue
    * @param {Object.<string, object>} components
    */
      function (vue, components) {
        hotReloadApi.install(vue);
        for (const key in components) {
          hotReloadApi.createRecord(key, components[key]);
        }
      };

    onComponentUpdated = /**
      * @param {any} componentDescriptor
      */
      function (componentDescriptor) {
        const app = appAccessor();
        if (!app) {
          return;
        }

        const currentComponent = app.components[componentDescriptor.elementName];
        const currentDescriptor = currentComponent.getComponentDescriptor();
        const updatedComponent = app.updateComponent(componentDescriptor.elementName, componentDescriptor);
        if (currentDescriptor.template !== componentDescriptor.template) {
          hotReloadApi.rerender(componentDescriptor.elementName, updatedComponent);
        } else {
          hotReloadApi.reload(componentDescriptor.elementName, updatedComponent);
        }
      };
  }
  return { onAppCreating, onComponentUpdated };
};
