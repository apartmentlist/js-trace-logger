import * as assert from 'assert';
import { compileTemplate, extractParams } from '../src/util';

describe('compileTemplate', () => {
  it('compiles a template without interpolation', () => {
    const fn: Function = compileTemplate('foo');
    assert.strictEqual(fn(), 'foo');
  });

  it('compiles a template with one expression', () => {
    const fn: Function = compileTemplate('${foo} is good');
    assert.strictEqual(fn({ foo: 'node' }), 'node is good');
  });

  it('compiles well with a randomly ordered object', () => {
    const fn: Function = compileTemplate('${foo} is ${bar} is ${baz}');
    assert.strictEqual(fn({ bar: 'a', baz: 'b', foo: 'c' }), 'c is a is b');
    assert.strictEqual(fn({ baz: 'a', bar: 'b', foo: 'c' }), 'c is b is a');
    assert.strictEqual(fn({ bar: 'a', foo: 'b', baz: 'c' }), 'b is a is c');
    assert.strictEqual(fn({ baz: 'a', foo: 'b', bar: 'c' }), 'b is c is a');
    assert.strictEqual(fn({ foo: 'a', baz: 'b', bar: 'c' }), 'a is c is b');
  });
});

describe('extractParams', () => {
  it('extracts nothing with no expressions', () => {
    assert.deepStrictEqual(extractParams('foo'), []);
  });

  it('extracts one expression', () => {
    assert.deepStrictEqual(extractParams('${foo}'), ['foo']);
  });

  it('extracts expressions with valid js variable characters (mostly)', () => {
    assert.deepStrictEqual(extractParams('a ${a1} b ${b_c} c ${_d_} d'), ['a1', 'b_c', '_d_']);
  });
});
