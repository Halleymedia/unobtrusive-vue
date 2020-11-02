# Unobtrusive Vue
This package is a thin abstraction layer over the Vue.js v2.6 rendering engine, so it can be used in a completely unobtrusive way, i.e. it won't surface in the JavaScript or HTML code at all. You're now free to take whatever design decisions you want. This is compatible with modern browsers and IE11 even if... well, [IE11 is pretty much dead now](https://death-to-ie11.com/).

![counter.gif](counter.gif)

## Getting started
This project is available as the npm package [https://www.npmjs.com/package/@halleymedia/unobtrusive-vue](@halleymedia/unobtrusive-vue).

[![npm package](https://img.shields.io/badge/npm_install-%40halleymedia%2Funobtrusive--vue-blue?logo=npm&style=flat)](https://www.npmjs.com/package/@halleymedia/unobtrusive-vue)

A simple demo application is available on GitHub, please review it.
[https://github.com/Halleymedia/unobtrusive-vue/tree/master/sample](https://github.com/Halleymedia/unobtrusive-vue/tree/master/sample)


## Why unobtrusive

If you take a look at the [Vue.js v2 documentation](https://vuejs.org/v2/guide/#Getting-Started), you'll bump into code like this.

```js
var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
})
```
This way of doing things looks artificial and tightly coupled to Vue.js itself and the DOM. We believe the application logic should be freed from any framework convention. What if we could, instead, express `data` as simple properties and `methods` as, well, methods of an ES6 class?
Image we could rewrite the previous code in a more idiomatic way like this.

```js
import { component } from '@halleymedia/unobtrusive-vue'
import template from './my-component.html' //use webpack for this, see sample

@component('my-component', template)
export default class MyComponent {
  message = 'Hello application!' // A simple property

  reverseMessage () { // A method
    this.message = this.message.split('').reverse().join('')
  }
}
```
Now there's no trace whatsover of any JavaScript framework being used. It's just simple, natural and readable JavaScript code we can easily unit test. Any developer who knows how to write basic ES6 code can now take part in the project without actually having to read the Vue.js manual beforehand.

This package takes the burden of _mapping_ ES6 classes to Vue.js convetions.

 * **Public properties** are `data`. Use these for two-way binding with input elements;
 * **Public getters** are mapped to `computed` to Vue.js;
 * **Public setters** are mapped to component properties (or `props` as Vue.js calls them);
 * **Public methods** are... well, mapped to `methods`;
 * **Private members** are not mapped at all. Feel free to use them to store internal state of a component.

## The View
Just use the moustache syntax everywhere:
```
<button type="button" title="{{message}}" onclick="{{reverseMessage()}}">{{message}}</button>
```
Again, there's no trace of a framework being used.

Use the special attribute `render-if` when you want to dynamically render an HTML element.

```
<div render-if="{{loading}}">loading</div>
```
And use the attribute `render-for` when you want to repeat an HTML element. The `$index` and `$item` variables will be automatically made available in this context.
```
<ul>
  <li render-for="{{results}}">
    <span>{{$index}}</span>. <span>{{$item}}</span></li>
  </li>
</ul>
```

The moustached binding also works two-way for input elements:

```
<input type="text" value="{{query}}">
```

The `query` property is updated as soon as the user types a character. In case you wanted to execute some code when the user stops typing, just bind a function to the `onchange` or `onblur` event handlers.

```
<input type="text" value="{{query}}" onchange="{{performSearch()}}">
```

This package aims at simplicity and it intentionally does without more advanced features of Vue.js. Developers can now spend more time on the project, instead of wasting time on a framework documentation.

## Slotted components

Components can have a default slot and any number of named slots by using the HTML specification. Define some `<slot>` elements in your view component

```
<div class="modal-dialog">
  <div class="modal-body">
    <slot></slot>
  </div>
  <footer class="modal-dialog-toolbar">
    <slot name="toolbar">
    </slot>
  </footer>
</div>
```

And then, use the component like this. The `<h2>` and `<p>` elements will be added to the default slot, while the `<button>` element will be added to the `toolbar` named slot.
```
<modal-dialog>
  <h2>Attention!</h2>
  <p>This is the modal body</p>
  <slot name="toolbar">
    <button onclick="{{closeModal()}}">Close</button>
  </slot>
</modal-dialog>
```

## Component life-cycle
Components are notified when they are mounted in the DOM and when they are detached. You may create the `init` and `dispose` methods for this.

```
/**
 * @param {HTMLElement} element
 */
init (element) {
  // Component has been mounted in the DOM
  // Do something with element
}

dispose () {
  // Component has been detached, perform some cleanup here
}
```

As you can see, the `init` method receives a reference to the component root element. You now have full access to its APIs.


## Template transformations
The moustached syntax is converted to Vue.js conventions. Template transformation is done with by the `@component` decorator at runtime but it's preferred to do it beforehand, at compile time. Here's an example on how to do it with webpack using the `html-loader` and its `preprocessor` option (see [./sample/webpack.config.babel.js](sample/webpack.config.babel.js)).

```js
import { templateTransformer } from '@halleymedia/unobtrusive-vue'
//...
module: {
  rules: [
    {
      test: /\.html$/i,
      loader: 'html-loader',
      options: {
        attributes: {
          root: path.resolve(__dirname, '.')
        },
        minimize: {
          removeAttributeQuotes: false
        },
        preprocessor: (content) => templateTransformer.transform(content)
      }
    }
  ]
}
```

## Style guidance
You **must**:

 * Name your custom components using one or more hyphens `-`, e.g. `my-component` and not `mycomponent`. See the [valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name) in the HTML specification;

 * Add only one root HTML node in each component.

You **may**:

 * Self-close custom components, even if Vue [recommends against it](https://vuejs.org/v2/style-guide/#Self-closing-components-strongly-recommended).

You **should**:

 * Use ES6 class `properties` for two-way data binding and `getters` for one-way data binding since properties are publicly writable, while getters are not;

 * Transform templates at build-time using webpack or gulp. If you don't, then it will be done at runtime and that will break compatibility with IE11 since it's using some regexp functionality which is missing from IE11;

 * Use lowercase for custom component events. E.g. use `onclick` and not `on-click`.

 * NOT use the `class` attribute with moustached syntax because it would compromise readability. Instead, keep things simple: use individual `data-*` attributes named as you like e.g.
   ```
   <my-component data-hidden="{{isHidden}}">Thing</my-component>
   ```
 
   Then, add this selector to your (S)CSS file:
   ```
   div[data-hidden] { display: none }
   ```

   There's [no performance penalty](https://gomakethings.com/how-performant-are-data-attributes-as-selectors/) in using `data-*` attributes as selectors so there's really no need to use CSS classes;

   As expected, `data-*` attributes are removed when you bind them to a boolean `false` value.

 * NOT use `render-if` on a component root element because, if you do, you won't get a proper `HTMLElement` as an argument to the `init` function. Vue.js replaces it with a comment when an element is not to be rendered.

**Notes**

 * All attributes on custom components elements, even known HTML attributes such as `title` and `href` are treated as component properties and they're not carried over to the root HTML element in the child component. There's an exception to that: `data-*` attributes, which you're free to (ab)use as you like.
 
   Each component should be the only responsible of defining its own HTML elements and their attributes. This will reduce code duplication.

 * Form `submit` events are always prevented.

## Batteries not included (so you can bring the most appropriate ones for your project)
Vue.js is used here just as a rendering engine. You'll have to bring your own router and event bus, if needed in your application.

## Coding style
This project follow the JavaScript Semi Standard Style. Click the banner to learn more about it.

[![js-semistandard-style](https://raw.githubusercontent.com/standard/semistandard/master/badge.svg)](https://github.com/standard/semistandard)


## Changelog

### v1.4.1
Fixes to documentation and sample.

### v1.4.0
Added support for self-closing components.