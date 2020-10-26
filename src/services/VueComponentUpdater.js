export default class VueComponentUpdater {
  /**
   * @param {any} component
   */
  static init (component) {
    component.__backdoor = 0;
  }

  /**
   * @param {any} component
   */
  static update (component) {
    component.__backdoor++;
  }

  /**
   * @param {any} component
   * @returns {any}
   */
  static getValue (component) {
    return component.__backdoor;
  }
}
