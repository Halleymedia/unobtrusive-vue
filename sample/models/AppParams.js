export default class AppParams {
  /**
   * @type {string}
   */
  message;

  /**
   * @param {object} obj
   * @param {string} obj.message
   */
  constructor ({ message }) {
    this.message = message;
  }
}
