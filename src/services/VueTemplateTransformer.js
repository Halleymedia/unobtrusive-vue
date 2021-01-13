const flags = 'gi';
const spaceLookBehind = '(?<=[\\s])';
const attributeName = '[a-z0-9-]+';
const tagName = '[a-z0-9]+';
const extendedTagName = '[a-z0-9-]+';
const builtinElementLookBehind = `(?<=[<]${tagName}\\s(?:[^>]+?\\s)?)`;
const customElementLookBehind = `(?<=[<]${tagName}(?:-${tagName})+\\s(?:[^>]+?\\s)?)`;
const moustacheCapture = '\\s*{{\\s*(.*?)\\s*}}\\s*';
const optionalMoustacheCapture = '(?:{{)?\\s*(.*?)\\s*(?:}})?';
const propPrefix = 'vue';
const greaterThanMoustaches = { regexp: '(?<={{[^}]*?)>', flags: 'g', replacement: '&gt;' };
const greaterThanQuotes = { regexp: '(?<=="[^"]*?)>', flags: 'g', replacement: '&gt;' };
const componentName = { regexp: '(<[a-z-]+)(\\sdata-component-root)?(\\s|>)', flags: '', replacement: '$1 data-component-root$3' };
const componentSelfClose = { regexp: '[<]([a-z]+(?:-[a-z]+)+)\\s([^>]*)/>', flags, replacement: '<$1 $2></$1>' };
const eventObject = { regexp: `(?<=[<]${extendedTagName}\\s(?:[^>]+?)?on${attributeName}="\\s*{{.*?[(\\s])event(?=[);+.-\\s"}])`, flags: 'g', replacement: '$event' };
const renderIf = { regexp: `${spaceLookBehind}render-if="${moustacheCapture}"`, flags, replacement: 'v-if="$1"' };
const renderFor = { regexp: `${spaceLookBehind}render-for="${moustacheCapture}"`, flags, replacement: 'v-for="($item, $index) in $1" :key="$item.id"' };
const dataIs = { regexp: `${spaceLookBehind}data-with-is-(.*?)="${moustacheCapture}"`, flags, replacement: `v-bind="{${propPrefix}$1:$2}"` };
const inputValue = { regexp: `${builtinElementLookBehind}(?:value|checked)="${moustacheCapture}"`, flags, replacement: 'v-model="$1"' };
const onSubmit = { regexp: `${builtinElementLookBehind}onsubmit="${moustacheCapture}"`, flags, replacement: '@submit.stop.prevent="$1"' };
const eventHandlers = { regexp: `${builtinElementLookBehind}on(${attributeName})="${moustacheCapture}"`, flags, replacement: '@$1="$2"' };
const builtinAttributes = { regexp: `${builtinElementLookBehind}(${attributeName})="${moustacheCapture}"`, flags, replacement: 'v-bind:$1="$2"' };
const componentDataAttributesExpressions = { regexp: `${customElementLookBehind}(data-${attributeName})="${moustacheCapture}"`, flags, replacement: 'v-bind:$1="$2"' };
const customAttributesEventExpressions = { regexp: `${customElementLookBehind}(?!v-|data-)on(${attributeName})="${moustacheCapture}"`, flags, replacement: `v-bind:${propPrefix}on$1="function(){var args=arguments;var value=args.length?args[0]:undefined;$2 }.bind(this)"` };
const customAttributesExpressions = { regexp: `${customElementLookBehind}(?!v-on|data-on)(${attributeName})="${moustacheCapture}"`, flags, replacement: `v-bind:${propPrefix}$1="$2"` };
const customAttributesLiterals = { regexp: `${customElementLookBehind}(?!v-|data-)(${attributeName})="${optionalMoustacheCapture}"`, flags, replacement: `${propPrefix}$1="$2"` };
const spaceRemoval = { regexp: '(?:(>)\\s+|\\s+(<))', flags, replacement: '$1$2' };

const expressions = [greaterThanMoustaches, greaterThanQuotes, componentName, componentSelfClose, eventObject, renderIf, renderFor, dataIs, inputValue, onSubmit, eventHandlers, builtinAttributes, componentDataAttributesExpressions, customAttributesEventExpressions, customAttributesExpressions, customAttributesLiterals];

export default class VueTemplateTransformer {
  /**
   *
   * @param {string} template
   * @param {{preserveWhitespace: boolean}|undefined} [options]
   * @returns {string}
   */
  static transform (template, options) {
    if (!shouldReplace(template)) {
      return template;
    }
    var currentExpressions = expressions.slice(0);
    if (options && options.preserveWhitespace === false) {
      currentExpressions.push(spaceRemoval);
    }
    currentExpressions.forEach(expression => { template = template.replace(new RegExp(expression.regexp, expression.flags), expression.replacement); });
    return template;
  }

  /**
   * @type {string}
   */
  static get propPrefix () {
    return propPrefix;
  }

  /**
   * @param {string} transformedPropertyName
   * @returns {string}
   */
  static getOriginalPropertyName (transformedPropertyName) {
    if (!transformedPropertyName) {
      return transformedPropertyName;
    }
    return transformedPropertyName.substr(VueTemplateTransformer.propPrefix.length);
  }
}

/**
 *
 * @param {string} template
 * @return {boolean}
 */
function shouldReplace (template) {
  const match = new RegExp(componentName.regexp, componentName.flags).exec(template || '');
  if (!match) {
    return false;
  }
  if (match[2]) { // is the data-component-root attribute present?
    // It was already replaced, no need to do it again
    return false;
  }
  return true;
}
