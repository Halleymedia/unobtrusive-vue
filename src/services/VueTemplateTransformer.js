const flags = 'gi';
const spaceLookBehind = '(?<=[\\s])';
const builtinElementLookBehind = '(?<=[<][a-z]+\\s(?:[^>]+?\\s)?)';
const customElementLookBehind = '(?<=[<][a-z]+-[a-z]+\\s(?:[^>]+?\\s)?)';
const moustacheCapture = '{{\\s*(.*?)\\s*}}';
const optionalMoustacheCapture = '(?:{{)?\\s*(.*?)\\s*(?:}})?';
const propPrefix = 'vue';
const componentName = { regexp: '(<[a-z-]+)(\\sdata-component-root)?(\\s|>)', flags: '', replacement: '$1 data-component-root$3' };
const renderIf = { regexp: `${spaceLookBehind}render-if="${moustacheCapture}"`, flags, replacement: 'v-if="$1"' };
const renderFor = { regexp: `${spaceLookBehind}render-for="${moustacheCapture}"`, flags, replacement: 'v-for="($item, $index) in $1" :key="$item.id"' };
const inputValue = { regexp: `${builtinElementLookBehind}(?:value|checked)="${moustacheCapture}"`, flags, replacement: 'v-model="$1"' };
const onSubmit = { regexp: `${builtinElementLookBehind}onsubmit="${moustacheCapture}"`, flags, replacement: '@submit.prevent="$1"' };
const eventHandlers = { regexp: `${builtinElementLookBehind}on([a-z]+)="${moustacheCapture}"`, flags, replacement: '@$1="$2"' };
const builtinAttributes = { regexp: `${builtinElementLookBehind}([a-z-]+)="${moustacheCapture}"`, flags, replacement: 'v-bind:$1="$2"' };
const componentDataAttributesExpressions = { regexp: `${customElementLookBehind}(data-[a-z-]+)="${moustacheCapture}"`, flags, replacement: 'v-bind:$1="$2"' };
const customAttributesEventExpressions = { regexp: `${customElementLookBehind}(?!v-|data-)on([a-z-]+)="${moustacheCapture}"`, flags, replacement: `v-bind:${propPrefix}on$1="function() { var event = { arguments: arguments }; var value = arguments[0]; $2 }.bind(this)"` };
const customAttributesExpressions = { regexp: `${customElementLookBehind}(?!v-on|data-on)([a-z-]+)="${moustacheCapture}"`, flags, replacement: `v-bind:${propPrefix}$1="$2"` };
const customAttributesLiterals = { regexp: `${customElementLookBehind}(?!v-|data-)([a-z-]+)="${optionalMoustacheCapture}"`, flags, replacement: `${propPrefix}$1="$2"` };

const expressions = [componentName, renderIf, renderFor, inputValue, onSubmit, eventHandlers, builtinAttributes, componentDataAttributesExpressions, customAttributesEventExpressions, customAttributesExpressions, customAttributesLiterals];

export default class VueTemplateTransformer {
  /**
   *
   * @param {string} template
   * @returns {string}
   */
  static transform (template) {
    if (!shouldReplace(template)) {
      return template;
    }
    expressions.forEach(expression => { template = template.replace(new RegExp(expression.regexp, expression.flags), expression.replacement); });
    return template;
  }

  /**
   * @type {string}
   */
  static get propPrefix () {
    return propPrefix;
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
