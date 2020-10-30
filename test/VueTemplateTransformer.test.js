import { it, expect } from '@jest/globals';
import { templateTransformer } from '../src';

it('should add data-component-root attribute to template on transform', () => {
  // Arrange
  const template = '<div foo="{{bar}}"><div></div></div>';
  const expectedStart = '<div data-component-root';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate.substr(0, expectedStart.length)).toBe(expectedStart);
});

it('should not transform template if it was transformed already', () => {
  // Arrange
  const template = '<div foo="{{bar}}"></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);
  const retransformedTemplate = templateTransformer.transform(transformedTemplate);

  // Assert
  expect(transformedTemplate).toBe(retransformedTemplate);
  expect(transformedTemplate).not.toBe(template);
});

it('should transform template render-if', () => {
  // Arrange
  const template = '<div data-hey="yo" render-if="{{fizz}}"><custom-comp render-if="{{buzz}}"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root data-hey="yo" v-if="fizz"><custom-comp v-if="buzz"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template render-for', () => {
  // Arrange
  const template = '<div data-hey="yo" render-for="{{fizz}}"><custom-comp render-for="{{buzz}}"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root data-hey="yo" v-for="($item, $index) in fizz" :key="$item.id"><custom-comp v-for="($item, $index) in buzz" :key="$item.id"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template input value', () => {
  // Arrange
  const template = '<div><input type="text" value="{{foo}}"><input value="{{bar}}" type="number"></div>';
  const expectedTemplate = '<div data-component-root><input type="text" v-model="foo"><input v-model="bar" type="number"></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template input checked', () => {
  // Arrange
  const template = '<div><input type="checkbox" checked="{{foo}}"><input checked="{{bar}}" type="radio"></div>';
  const expectedTemplate = '<div data-component-root><input type="checkbox" v-model="foo"><input v-model="bar" type="radio"></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template attributes', () => {
  // Arrange
  const template = '<div title="{{fizz}}" placeholder="{{buzz}}"><custom-comp whatever="{{wha}}"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root v-bind:title="fizz" v-bind:placeholder="buzz"><custom-comp v-bind:vuewhatever="wha"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template event handlers on builtin elements by wrapping the original call', () => {
  // Arrange
  const template = '<div onclick="{{fizz()}}" onmouseover="{{buzz()}}"><custom-comp onwhatever="{{wha()}}"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root @click="fizz()" @mouseover="buzz()"><custom-comp v-bind:vueonwhatever="function(event){event=event||{};event.arguments=arguments;var value=arguments[0];wha() }.bind(this)"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template onsubmit to be prevented on builtin elements', () => {
  // Arrange
  const template = '<form onsubmit="{{fizz()}}"><custom-comp onsubmit="{{wha()}}"></custom-comp></form>';
  const expectedTemplate = '<form data-component-root @submit.prevent="fizz()"><custom-comp v-bind:vueonsubmit="function(event){event=event||{};event.arguments=arguments;var value=arguments[0];wha() }.bind(this)"></custom-comp></form>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template attributes without moustaches on custom elements', () => {
  // Arrange
  const template = '<div><custom-comp fizz-buzz="true"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root><custom-comp vuefizz-buzz="true"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should ignore template data attributes without moustaches on custom elements', () => {
  // Arrange
  const template = '<div><custom-comp data-fizz-buzz="true"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root><custom-comp data-fizz-buzz="true"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should transform template data attributes with moustaches on custom elements', () => {
  // Arrange
  const template = '<div><custom-comp data-fizz-buzz="{{true}}"></custom-comp></div>';
  const expectedTemplate = '<div data-component-root><custom-comp v-bind:data-fizz-buzz="true"></custom-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should not interfere with class names and inline code', () => {
  // Arrange
  const template = '<div class="foo bar" onclick="i++; console.log(j);"></div>';
  const expectedTemplate = '<div data-component-root class="foo bar" onclick="i++; console.log(j);"></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should not interfere with class names', () => {
  // Arrange
  const template = '<div class="foofoo barbar" onclick="{{ foo() }}"></div>';
  const expectedTemplate = '<div data-component-root class="foofoo barbar" @click="foo()"></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should tolerate spaces around moustaches', () => {
  // Arrange
  const template = '<div title="{{ 3 }} " data-fizz=" {{ 1}} " onclick=" {{ foo() }}"><my-comp bar=" {{ 5 }} "></my-comp></div>';
  const expectedTemplate = '<div data-component-root v-bind:title="3" v-bind:data-fizz="1" @click="foo()"><my-comp v-bind:vuebar="5"></my-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should replace self-closed components', () => {
  // Arrange
  const template = '<div><br /><my-comp /><foo-comp data-value="bar" data-other="{{ baz }}" /><other-comp>Blah</other-comp><extra-comp data-hey="1"/></div>';
  const expectedTemplate = '<div data-component-root><br /><my-comp ></my-comp><foo-comp data-value="bar" v-bind:data-other="baz" ></foo-comp><other-comp>Blah</other-comp><extra-comp data-hey="1"></extra-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});

it('should replace self-closed components spanning multiple lines', () => {
  // Arrange
  const template = '<div><br /><foo-comp\n data-value="bar"\n\tdata-other="{{ baz }}"\n/></div>';
  const expectedTemplate = '<div data-component-root><br /><foo-comp  data-value="bar"\n\tv-bind:data-other="baz"\n></foo-comp></div>';

  // Act
  const transformedTemplate = templateTransformer.transform(template);

  // Assert
  expect(transformedTemplate).toBe(expectedTemplate);
});
