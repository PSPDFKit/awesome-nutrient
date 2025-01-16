/// <reference types="react" />
import * as React from 'react';
import React__default, { ClipboardEventHandler, CompositionEventHandler, ReactEventHandler, FormEventHandler, AriaAttributes, DOMAttributes as DOMAttributes$1, AriaRole, CSSProperties, HTMLAttributeAnchorTarget, HTMLAttributeReferrerPolicy, ReactNode, RefObject, ReactElement, FocusEvent as FocusEvent$1, KeyboardEvent as KeyboardEvent$1, SyntheticEvent, JSX, ElementType, JSXElementConstructor, SVGProps, Key as Key$1, Dispatch, SetStateAction, ReactHTML, ForwardedRef } from 'react';
import * as _vanilla_extract_sprinkles from '@vanilla-extract/sprinkles';

declare const SignatureSaveMode: {
    readonly ALWAYS: "ALWAYS";
    readonly NEVER: "NEVER";
    readonly USING_UI: "USING_UI";
};
type ISignatureSaveMode = (typeof SignatureSaveMode)[keyof typeof SignatureSaveMode];

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Immutable data encourages pure functions (data-in, data-out) and lends itself
 * to much simpler application development and enabling techniques from
 * functional programming such as lazy evaluation.
 *
 * While designed to bring these powerful functional concepts to JavaScript, it
 * presents an Object-Oriented API familiar to Javascript engineers and closely
 * mirroring that of Array, Map, and Set. It is easy and efficient to convert to
 * and from plain Javascript types.
 *
 * ## How to read these docs
 *
 * In order to better explain what kinds of values the Immutable.js API expects
 * and produces, this documentation is presented in a statically typed dialect of
 * JavaScript (like [Flow][] or [TypeScript][]). You *don't need* to use these
 * type checking tools in order to use Immutable.js, however becoming familiar
 * with their syntax will help you get a deeper understanding of this API.
 *
 * **A few examples and how to read them.**
 *
 * All methods describe the kinds of data they accept and the kinds of data
 * they return. For example a function which accepts two numbers and returns
 * a number would look like this:
 *
 * ```js
 * sum(first: number, second: number): number
 * ```
 *
 * Sometimes, methods can accept different kinds of data or return different
 * kinds of data, and this is described with a *type variable*, which is
 * typically in all-caps. For example, a function which always returns the same
 * kind of data it was provided would look like this:
 *
 * ```js
 * identity<T>(value: T): T
 * ```
 *
 * Type variables are defined with classes and referred to in methods. For
 * example, a class that holds onto a value for you might look like this:
 *
 * ```js
 * class Box<T> {
 *   constructor(value: T)
 *   getValue(): T
 * }
 * ```
 *
 * In order to manipulate Immutable data, methods that we're used to affecting
 * a Collection instead return a new Collection of the same type. The type
 * `this` refers to the same kind of class. For example, a List which returns
 * new Lists when you `push` a value onto it might look like:
 *
 * ```js
 * class List<T> {
 *   push(value: T): this
 * }
 * ```
 *
 * Many methods in Immutable.js accept values which implement the JavaScript
 * [Iterable][] protocol, and might appear like `Iterable<string>` for something
 * which represents sequence of strings. Typically in JavaScript we use plain
 * Arrays (`[]`) when an Iterable is expected, but also all of the Immutable.js
 * collections are iterable themselves!
 *
 * For example, to get a value deep within a structure of data, we might use
 * `getIn` which expects an `Iterable` path:
 *
 * ```
 * getIn(path: Iterable<string | number>): any
 * ```
 *
 * To use this method, we could pass an array: `data.getIn([ "key", 2 ])`.
 *
 *
 * Note: All examples are presented in the modern [ES2015][] version of
 * JavaScript. Use tools like Babel to support older browsers.
 *
 * For example:
 *
 * ```js
 * // ES2015
 * const mappedFoo = foo.map(x => x * x);
 * // ES5
 * var mappedFoo = foo.map(function (x) { return x * x; });
 * ```
 *
 * [ES2015]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
 * [TypeScript]: http://www.typescriptlang.org/
 * [Flow]: https://flowtype.org/
 * [Iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */



  /**
   * Lists are ordered indexed dense collections, much like a JavaScript
   * Array.
   *
   * Lists are immutable and fully persistent with O(log32 N) gets and sets,
   * and O(1) push and pop.
   *
   * Lists implement Deque, with efficient addition and removal from both the
   * end (`push`, `pop`) and beginning (`unshift`, `shift`).
   *
   * Unlike a JavaScript Array, there is no distinction between an
   * "unset" index and an index set to `undefined`. `List#forEach` visits all
   * indices from 0 to size, regardless of whether they were explicitly defined.
   */
  declare module List {

    /**
     * True if the provided value is a List
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable');
     * List.isList([]); // false
     * List.isList(List()); // true
     * ```
     */
    function isList(maybeList: any): maybeList is List<any>;

    /**
     * Creates a new List containing `values`.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable');
     * List.of(1, 2, 3, 4)
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: Values are not altered or converted in any way.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable');
     * List.of({x:1}, 2, [3], 4)
     * // List [ { x: 1 }, 2, [ 3 ], 4 ]
     * ```
     */
    function of<T>(...values: Array<T>): List<T>;
  }

  /**
   * Create a new immutable List containing the values of the provided
   * collection-like.
   *
   * Note: `List` is a factory function and not a class, and does not use the
   * `new` keyword during construction.
   *
   * <!-- runkit:activate -->
   * ```js
   * const { List, Set } = require('immutable')
   *
   * const emptyList = List()
   * // List []
   *
   * const plainArray = [ 1, 2, 3, 4 ]
   * const listFromPlainArray = List(plainArray)
   * // List [ 1, 2, 3, 4 ]
   *
   * const plainSet = Set([ 1, 2, 3, 4 ])
   * const listFromPlainSet = List(plainSet)
   * // List [ 1, 2, 3, 4 ]
   *
   * const arrayIterator = plainArray[Symbol.iterator]()
   * const listFromCollectionArray = List(arrayIterator)
   * // List [ 1, 2, 3, 4 ]
   *
   * listFromPlainArray.equals(listFromCollectionArray) // true
   * listFromPlainSet.equals(listFromCollectionArray) // true
   * listFromPlainSet.equals(listFromPlainArray) // true
   * ```
   */
  declare function List(): List<any>;
  declare function List<T>(): List<T>;
  declare function List<T>(collection: Iterable<T>): List<T>;

  interface List<T> extends Collection$1.Indexed<T> {

    /**
     * The number of items in this List.
     */
    readonly size: number;

    // Persistent changes

    /**
     * Returns a new List which includes `value` at `index`. If `index` already
     * exists in this List, it will be replaced.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.set(-1, "value")` sets the last item in the List.
     *
     * If `index` larger than `size`, the returned List's `size` will be large
     * enough to include the `index`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * const originalList = List([ 0 ]);
     * // List [ 0 ]
     * originalList.set(1, 1);
     * // List [ 0, 1 ]
     * originalList.set(0, 'overwritten');
     * // List [ "overwritten" ]
     * originalList.set(2, 2);
     * // List [ 0, undefined, 2 ]
     *
     * List().set(50000, 'value').size;
     * // 50001
     * ```
     *
     * Note: `set` can be used in `withMutations`.
     */
    set(index: number, value: T): List<T>;

    /**
     * Returns a new List which excludes this `index` and with a size 1 less
     * than this List. Values at indices above `index` are shifted down by 1 to
     * fill the position.
     *
     * This is synonymous with `list.splice(index, 1)`.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.delete(-1)` deletes the last item in the List.
     *
     * Note: `delete` cannot be safely used in IE8
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).delete(0);
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Since `delete()` re-indexes values, it produces a complete copy, which
     * has `O(N)` complexity.
     *
     * Note: `delete` *cannot* be used in `withMutations`.
     *
     * @alias remove
     */
    delete(index: number): List<T>;
    remove(index: number): List<T>;

    /**
     * Returns a new List with `value` at `index` with a size 1 more than this
     * List. Values at indices above `index` are shifted over by 1.
     *
     * This is synonymous with `list.splice(index, 0, value)`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).insert(6, 5)
     * // List [ 0, 1, 2, 3, 4, 5 ]
     * ```
     *
     * Since `insert()` re-indexes values, it produces a complete copy, which
     * has `O(N)` complexity.
     *
     * Note: `insert` *cannot* be used in `withMutations`.
     */
    insert(index: number, value: T): List<T>;

    /**
     * Returns a new List with 0 size and no values in constant time.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 1, 2, 3, 4 ]).clear()
     * // List []
     * ```
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): List<T>;

    /**
     * Returns a new List with the provided `values` appended, starting at this
     * List's `size`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 1, 2, 3, 4 ]).push(5)
     * // List [ 1, 2, 3, 4, 5 ]
     * ```
     *
     * Note: `push` can be used in `withMutations`.
     */
    push(...values: Array<T>): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the last index in this List.
     *
     * Note: this differs from `Array#pop` because it returns a new
     * List rather than the removed value. Use `last()` to get the last value
     * in this List.
     *
     * ```js
     * List([ 1, 2, 3, 4 ]).pop()
     * // List[ 1, 2, 3 ]
     * ```
     *
     * Note: `pop` can be used in `withMutations`.
     */
    pop(): List<T>;

    /**
     * Returns a new List with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 2, 3, 4]).unshift(1);
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: `unshift` can be used in `withMutations`.
     */
    unshift(...values: Array<T>): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the first index in this List, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * List rather than the removed value. Use `first()` to get the first
     * value in this List.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).shift();
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: `shift` can be used in `withMutations`.
     */
    shift(): List<T>;

    /**
     * Returns a new List with an updated value at `index` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * `index` was not set. If called with a single argument, `updater` is
     * called with the List itself.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.update(-1)` updates the last item in the List.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * const list = List([ 'a', 'b', 'c' ])
     * const result = list.update(2, val => val.toUpperCase())
     * // List [ "a", "b", "C" ]
     * ```
     *
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum a List after mapping and filtering:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * List([ 1, 2, 3 ])
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     *
     * Note: `update(index)` can be used in `withMutations`.
     *
     * @see `Map#update`
     */
    update(index: number, notSetValue: T, updater: (value: T) => T): this;
    update(index: number, updater: (value: T) => T): this;
    update<R>(updater: (value: this) => R): R;

    /**
     * Returns a new List with size `size`. If `size` is less than this
     * List's size, the new List will exclude values at the higher indices.
     * If `size` is greater than this List's size, the new List will have
     * undefined values for the newly available indices.
     *
     * When building a new List and the final size is known up front, `setSize`
     * used in conjunction with `withMutations` may result in the more
     * performant construction.
     */
    setSize(size: number): List<T>;


    // Deep persistent changes

    /**
     * Returns a new List having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     *
     * Index numbers are used as keys to determine the path to follow in
     * the List.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * const list = List([ 0, 1, 2, List([ 3, 4 ])])
     * list.setIn([3, 0], 999);
     * // List [ 0, 1, 2, List [ 999, 4 ] ]
     * ```
     *
     * Plain JavaScript Object or Arrays may be nested within an Immutable.js
     * Collection, and setIn() can update those values as well, treating them
     * immutably by creating new copies of those values with the changes applied.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * const list = List([ 0, 1, 2, { plain: 'object' }])
     * list.setIn([3, 'plain'], 'value');
     * // List([ 0, 1, 2, { plain: 'value' }])
     * ```
     *
     * Note: `setIn` can be used in `withMutations`.
     */
    setIn(keyPath: Iterable<any>, value: any): this;

    /**
     * Returns a new List having removed the value at this `keyPath`. If any
     * keys in `keyPath` do not exist, no change will occur.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * const list = List([ 0, 1, 2, List([ 3, 4 ])])
     * list.deleteIn([3, 0]);
     * // List [ 0, 1, 2, List [ 4 ] ]
     * ```
     *
     * Plain JavaScript Object or Arrays may be nested within an Immutable.js
     * Collection, and removeIn() can update those values as well, treating them
     * immutably by creating new copies of those values with the changes applied.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * const list = List([ 0, 1, 2, { plain: 'object' }])
     * list.removeIn([3, 'plain']);
     * // List([ 0, 1, 2, {}])
     * ```
     *
     * Note: `deleteIn` *cannot* be safely used in `withMutations`.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Iterable<any>): this;
    removeIn(keyPath: Iterable<any>): this;

    /**
     * Note: `updateIn` can be used in `withMutations`.
     *
     * @see `Map#updateIn`
     */
    updateIn(keyPath: Iterable<any>, notSetValue: any, updater: (value: any) => any): this;
    updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;

    /**
     * Note: `mergeIn` can be used in `withMutations`.
     *
     * @see `Map#mergeIn`
     */
    mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    /**
     * Note: `mergeDeepIn` can be used in `withMutations`.
     *
     * @see `Map#mergeDeepIn`
     */
    mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    // Transient changes

    /**
     * Note: Not all methods can be safely used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * allows being used in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * An alternative API for withMutations()
     *
     * Note: Not all methods can be safely used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * allows being used in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#wasAltered`
     */
    wasAltered(): boolean;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new List with other values or collections concatenated to this one.
     *
     * Note: `concat` can be used in `withMutations`.
     *
     * @alias merge
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): List<T | C>;
    merge<C>(...collections: Array<Iterable<C>>): List<T | C>;

    /**
     * Returns a new List with values passed through a
     * `mapper` function.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * List([ 1, 2 ]).map(x => 10 * x)
     * // List [ 10, 20 ]
     * ```
     */
    map<M>(
      mapper: (value: T, key: number, iter: this) => M,
      context?: any
    ): List<M>;

    /**
     * Flat-maps the List, returning a new List.
     *
     * Similar to `list.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: number, iter: this) => Iterable<M>,
      context?: any
    ): List<M>;

    /**
     * Returns a new List with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, index: number, iter: this) => value is F,
      context?: any
    ): List<F>;
    filter(
      predicate: (value: T, index: number, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns a List "zipped" with the provided collection.
     *
     * Like `zipWith`, but using the default `zipper`: creating an `Array`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 4, 5, 6 ]);
     * const c = a.zip(b); // List [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
     * ```
     */
    zip<U>(other: Collection$1<any, U>): List<[T,U]>;
    zip<U,V>(other: Collection$1<any, U>, other2: Collection$1<any,V>): List<[T,U,V]>;
    zip(...collections: Array<Collection$1<any, any>>): List<any>;

    /**
     * Returns a List "zipped" with the provided collections.
     *
     * Unlike `zip`, `zipAll` continues zipping until the longest collection is
     * exhausted. Missing values from shorter collections are filled with `undefined`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * const a = List([ 1, 2 ]);
     * const b = List([ 3, 4, 5 ]);
     * const c = a.zipAll(b); // List [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
     * ```
     *
     * Note: Since zipAll will return a collection as large as the largest
     * input, some results may contain undefined values. TypeScript cannot
     * account for these without cases (as of v2.5).
     */
    zipAll<U>(other: Collection$1<any, U>): List<[T,U]>;
    zipAll<U,V>(other: Collection$1<any, U>, other2: Collection$1<any,V>): List<[T,U,V]>;
    zipAll(...collections: Array<Collection$1<any, any>>): List<any>;

    /**
     * Returns a List "zipped" with the provided collections by using a
     * custom `zipper` function.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { List } = require('immutable');" }
     * -->
     * ```js
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 4, 5, 6 ]);
     * const c = a.zipWith((a, b) => a + b, b);
     * // List [ 5, 7, 9 ]
     * ```
     */
    zipWith<U, Z>(
      zipper: (value: T, otherValue: U) => Z,
      otherCollection: Collection$1<any, U>
    ): List<Z>;
    zipWith<U, V, Z>(
      zipper: (value: T, otherValue: U, thirdValue: V) => Z,
      otherCollection: Collection$1<any, U>,
      thirdCollection: Collection$1<any, V>
    ): List<Z>;
    zipWith<Z>(
      zipper: (...any: Array<any>) => Z,
      ...collections: Array<Collection$1<any, any>>
    ): List<Z>;
  }


  /**
   * Immutable Map is an unordered Collection.Keyed of (key, value) pairs with
   * `O(log32 N)` gets and `O(log32 N)` persistent sets.
   *
   * Iteration order of a Map is undefined, however is stable. Multiple
   * iterations of the same Map will iterate in the same order.
   *
   * Map's keys can be of any type, and use `Immutable.is` to determine key
   * equality. This allows the use of any value (including NaN) as a key.
   *
   * Because `Immutable.is` returns equality based on value semantics, and
   * Immutable collections are treated as values, any Immutable collection may
   * be used as a key.
   *
   * <!-- runkit:activate -->
   * ```js
   * const { Map, List } = require('immutable');
   * Map().set(List([ 1 ]), 'listofone').get(List([ 1 ]));
   * // 'listofone'
   * ```
   *
   * Any JavaScript object may be used as a key, however strict identity is used
   * to evaluate key equality. Two similar looking objects will represent two
   * different keys.
   *
   * Implemented by a hash-array mapped trie.
   */
  declare module Map {

    /**
     * True if the provided value is a Map
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map.isMap({}) // false
     * Map.isMap(Map()) // true
     * ```
     */
    function isMap(maybeMap: any): maybeMap is Map<any, any>;

    /**
     * Creates a new Map from alternating keys and values
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map.of(
     *   'key', 'value',
     *   'numerical value', 3,
     *    0, 'numerical key'
     * )
     * // Map { 0: "numerical key", "key": "value", "numerical value": 3 }
     * ```
     *
     * @deprecated Use Map([ [ 'k', 'v' ] ]) or Map({ k: 'v' })
     */
    function of(...keyValues: Array<any>): Map<any, any>;
  }

  /**
   * Creates a new Immutable Map.
   *
   * Created with the same key value pairs as the provided Collection.Keyed or
   * JavaScript Object or expects a Collection of [K, V] tuple entries.
   *
   * Note: `Map` is a factory function and not a class, and does not use the
   * `new` keyword during construction.
   *
   * <!-- runkit:activate -->
   * ```js
   * const { Map } = require('immutable')
   * Map({ key: "value" })
   * Map([ [ "key", "value" ] ])
   * ```
   *
   * Keep in mind, when using JS objects to construct Immutable Maps, that
   * JavaScript Object properties are always strings, even if written in a
   * quote-less shorthand, while Immutable Maps accept keys of any type.
   *
   * <!-- runkit:activate
   *      { "preamble": "const { Map } = require('immutable');" }
   * -->
   * ```js
   * let obj = { 1: "one" }
   * Object.keys(obj) // [ "1" ]
   * assert.equal(obj["1"], obj[1]) // "one" === "one"
   *
   * let map = Map(obj)
   * assert.notEqual(map.get("1"), map.get(1)) // "one" !== undefined
   * ```
   *
   * Property access for JavaScript Objects first converts the key to a string,
   * but since Immutable Map keys can be of any type the argument to `get()` is
   * not altered.
   */
  declare function Map<K, V>(collection: Iterable<[K, V]>): Map<K, V>;
  declare function Map<T>(collection: Iterable<Iterable<T>>): Map<T, T>;
  declare function Map<V>(obj: {[key: string]: V}): Map<string, V>;
  declare function Map<K, V>(): Map<K, V>;
  declare function Map(): Map<any, any>;

  interface Map<K, V> extends Collection$1.Keyed<K, V> {

    /**
     * The number of entries in this Map.
     */
    readonly size: number;

    // Persistent changes

    /**
     * Returns a new Map also containing the new key, value pair. If an equivalent
     * key already exists in this Map, it will be replaced.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map()
     * const newerMap = originalMap.set('key', 'value')
     * const newestMap = newerMap.set('key', 'newer value')
     *
     * originalMap
     * // Map {}
     * newerMap
     * // Map { "key": "value" }
     * newestMap
     * // Map { "key": "newer value" }
     * ```
     *
     * Note: `set` can be used in `withMutations`.
     */
    set(key: K, value: V): this;

    /**
     * Returns a new Map which excludes this `key`.
     *
     * Note: `delete` cannot be safely used in IE8, but is provided to mirror
     * the ES6 collection API.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map({
     *   key: 'value',
     *   otherKey: 'other value'
     * })
     * // Map { "key": "value", "otherKey": "other value" }
     * originalMap.delete('otherKey')
     * // Map { "key": "value" }
     * ```
     *
     * Note: `delete` can be used in `withMutations`.
     *
     * @alias remove
     */
    delete(key: K): this;
    remove(key: K): this;

    /**
     * Returns a new Map which excludes the provided `keys`.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const names = Map({ a: "Aaron", b: "Barry", c: "Connor" })
     * names.deleteAll([ 'a', 'c' ])
     * // Map { "b": "Barry" }
     * ```
     *
     * Note: `deleteAll` can be used in `withMutations`.
     *
     * @alias removeAll
     */
    deleteAll(keys: Iterable<K>): this;
    removeAll(keys: Iterable<K>): this;

    /**
     * Returns a new Map containing no keys or values.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map({ key: 'value' }).clear()
     * // Map {}
     * ```
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): this;

    /**
     * Returns a new Map having updated the value at this `key` with the return
     * value of calling `updater` with the existing value.
     *
     * Similar to: `map.set(key, updater(map.get(key)))`.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const aMap = Map({ key: 'value' })
     * const newMap = aMap.update('key', value => value + value)
     * // Map { "key": "valuevalue" }
     * ```
     *
     * This is most commonly used to call methods on collections within a
     * structure of data. For example, in order to `.push()` onto a nested `List`,
     * `update` and `push` can be used together:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map, List } = require('immutable');" }
     * -->
     * ```js
     * const aMap = Map({ nestedList: List([ 1, 2, 3 ]) })
     * const newMap = aMap.update('nestedList', list => list.push(4))
     * // Map { "nestedList": List [ 1, 2, 3, 4 ] }
     * ```
     *
     * When a `notSetValue` is provided, it is provided to the `updater`
     * function when the value at the key does not exist in the Map.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable');" }
     * -->
     * ```js
     * const aMap = Map({ key: 'value' })
     * const newMap = aMap.update('noKey', 'no value', value => value + value)
     * // Map { "key": "value", "noKey": "no valueno value" }
     * ```
     *
     * However, if the `updater` function returns the same value it was called
     * with, then no change will occur. This is still true if `notSetValue`
     * is provided.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable');" }
     * -->
     * ```js
     * const aMap = Map({ apples: 10 })
     * const newMap = aMap.update('oranges', 0, val => val)
     * // Map { "apples": 10 }
     * assert.strictEqual(newMap, map);
     * ```
     *
     * For code using ES2015 or later, using `notSetValue` is discourged in
     * favor of function parameter default values. This helps to avoid any
     * potential confusion with identify functions as described above.
     *
     * The previous example behaves differently when written with default values:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable');" }
     * -->
     * ```js
     * const aMap = Map({ apples: 10 })
     * const newMap = aMap.update('oranges', (val = 0) => val)
     * // Map { "apples": 10, "oranges": 0 }
     * ```
     *
     * If no key is provided, then the `updater` function return value is
     * returned as well.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable');" }
     * -->
     * ```js
     * const aMap = Map({ key: 'value' })
     * const result = aMap.update(aMap => aMap.get('key'))
     * // "value"
     * ```
     *
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum the values in a Map
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable');" }
     * -->
     * ```js
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * Map({ x: 1, y: 2, z: 3 })
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     *
     * Note: `update(key)` can be used in `withMutations`.
     */
    update(key: K, notSetValue: V, updater: (value: V) => V): this;
    update(key: K, updater: (value: V) => V): this;
    update<R>(updater: (value: this) => R): R;

    /**
     * Returns a new Map resulting from merging the provided Collections
     * (or JS objects) into this Map. In other words, this takes each entry of
     * each collection and sets it on this Map.
     *
     * Note: Values provided to `merge` are shallowly converted before being
     * merged. No nested values are altered.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: 10, b: 20, c: 30 })
     * const two = Map({ b: 40, a: 50, d: 60 })
     * one.merge(two) // Map { "a": 50, "b": 40, "c": 30, "d": 60 }
     * two.merge(one) // Map { "b": 20, "a": 10, "d": 60, "c": 30 }
     * ```
     *
     * Note: `merge` can be used in `withMutations`.
     *
     * @alias concat
     */
    merge<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Map<K | KC, V | VC>;
    merge<C>(...collections: Array<{[key: string]: C}>): Map<K | string, V | C>;
    concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Map<K | KC, V | VC>;
    concat<C>(...collections: Array<{[key: string]: C}>): Map<K | string, V | C>;

    /**
     * Like `merge()`, `mergeWith()` returns a new Map resulting from merging
     * the provided Collections (or JS objects) into this Map, but uses the
     * `merger` function for dealing with conflicts.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: 10, b: 20, c: 30 })
     * const two = Map({ b: 40, a: 50, d: 60 })
     * one.mergeWith((oldVal, newVal) => oldVal / newVal, two)
     * // { "a": 0.2, "b": 0.5, "c": 30, "d": 60 }
     * two.mergeWith((oldVal, newVal) => oldVal / newVal, one)
     * // { "b": 2, "a": 5, "d": 60, "c": 30 }
     * ```
     *
     * Note: `mergeWith` can be used in `withMutations`.
     */
    mergeWith(
      merger: (oldVal: V, newVal: V, key: K) => V,
      ...collections: Array<Iterable<[K, V]> | {[key: string]: V}>
    ): this;

    /**
     * Like `merge()`, but when two Collections conflict, it merges them as well,
     * recursing deeply through the nested data.
     *
     * Note: Values provided to `merge` are shallowly converted before being
     * merged. No nested values are altered unless they will also be merged at
     * a deeper level.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })
     * const two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })
     * one.mergeDeep(two)
     * // Map {
     * //   "a": Map { "x": 2, "y": 10 },
     * //   "b": Map { "x": 20, "y": 5 },
     * //   "c": Map { "z": 3 }
     * // }
     * ```
     *
     * Note: `mergeDeep` can be used in `withMutations`.
     */
    mergeDeep(...collections: Array<Iterable<[K, V]> | {[key: string]: V}>): this;

    /**
     * Like `mergeDeep()`, but when two non-Collections conflict, it uses the
     * `merger` function to determine the resulting value.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })
     * const two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })
     * one.mergeDeepWith((oldVal, newVal) => oldVal / newVal, two)
     * // Map {
     * //   "a": Map { "x": 5, "y": 10 },
     * //   "b": Map { "x": 20, "y": 10 },
     * //   "c": Map { "z": 3 }
     * // }
     * ```

     * Note: `mergeDeepWith` can be used in `withMutations`.
     */
    mergeDeepWith(
      merger: (oldVal: any, newVal: any, key: any) => any,
      ...collections: Array<Iterable<[K, V]> | {[key: string]: V}>
    ): this;


    // Deep persistent changes

    /**
     * Returns a new Map having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map({
     *   subObject: Map({
     *     subKey: 'subvalue',
     *     subSubObject: Map({
     *       subSubKey: 'subSubValue'
     *     })
     *   })
     * })
     *
     * const newMap = originalMap.setIn(['subObject', 'subKey'], 'ha ha!')
     * // Map {
     * //   "subObject": Map {
     * //     "subKey": "ha ha!",
     * //     "subSubObject": Map { "subSubKey": "subSubValue" }
     * //   }
     * // }
     *
     * const newerMap = originalMap.setIn(
     *   ['subObject', 'subSubObject', 'subSubKey'],
     *   'ha ha ha!'
     * )
     * // Map {
     * //   "subObject": Map {
     * //     "subKey": "subvalue",
     * //     "subSubObject": Map { "subSubKey": "ha ha ha!" }
     * //   }
     * // }
     * ```
     *
     * Plain JavaScript Object or Arrays may be nested within an Immutable.js
     * Collection, and setIn() can update those values as well, treating them
     * immutably by creating new copies of those values with the changes applied.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map({
     *   subObject: {
     *     subKey: 'subvalue',
     *     subSubObject: {
     *       subSubKey: 'subSubValue'
     *     }
     *   }
     * })
     *
     * originalMap.setIn(['subObject', 'subKey'], 'ha ha!')
     * // Map {
     * //   "subObject": {
     * //     subKey: "ha ha!",
     * //     subSubObject: { subSubKey: "subSubValue" }
     * //   }
     * // }
     * ```
     *
     * If any key in the path exists but cannot be updated (such as a primitive
     * like number or a custom Object like Date), an error will be thrown.
     *
     * Note: `setIn` can be used in `withMutations`.
     */
    setIn(keyPath: Iterable<any>, value: any): this;

    /**
     * Returns a new Map having removed the value at this `keyPath`. If any keys
     * in `keyPath` do not exist, no change will occur.
     *
     * Note: `deleteIn` can be used in `withMutations`.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Iterable<any>): this;
    removeIn(keyPath: Iterable<any>): this;

    /**
     * Returns a new Map having applied the `updater` to the entry found at the
     * keyPath.
     *
     * This is most commonly used to call methods on collections nested within a
     * structure of data. For example, in order to `.push()` onto a nested `List`,
     * `updateIn` and `push` can be used together:
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map, List } = require('immutable')
     * const map = Map({ inMap: Map({ inList: List([ 1, 2, 3 ]) }) })
     * const newMap = map.updateIn(['inMap', 'inList'], list => list.push(4))
     * // Map { "inMap": Map { "inList": List [ 1, 2, 3, 4 ] } }
     * ```
     *
     * If any keys in `keyPath` do not exist, new Immutable `Map`s will
     * be created at those keys. If the `keyPath` does not already contain a
     * value, the `updater` function will be called with `notSetValue`, if
     * provided, otherwise `undefined`.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable')" }
     * -->
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'c'], val => val * 2)
     * // Map { "a": Map { "b": Map { "c": 20 } } }
     * ```
     *
     * If the `updater` function returns the same value it was called with, then
     * no change will occur. This is still true if `notSetValue` is provided.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable')" }
     * -->
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'x'], 100, val => val)
     * // Map { "a": Map { "b": Map { "c": 10 } } }
     * assert.strictEqual(newMap, aMap)
     * ```
     *
     * For code using ES2015 or later, using `notSetValue` is discourged in
     * favor of function parameter default values. This helps to avoid any
     * potential confusion with identify functions as described above.
     *
     * The previous example behaves differently when written with default values:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable')" }
     * -->
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'x'], (val = 100) => val)
     * // Map { "a": Map { "b": Map { "c": 10, "x": 100 } } }
     * ```
     *
     * Plain JavaScript Object or Arrays may be nested within an Immutable.js
     * Collection, and updateIn() can update those values as well, treating them
     * immutably by creating new copies of those values with the changes applied.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Map } = require('immutable')" }
     * -->
     * ```js
     * const map = Map({ a: { b: { c: 10 } } })
     * const newMap = map.updateIn(['a', 'b', 'c'], val => val * 2)
     * // Map { "a": { b: { c: 20 } } }
     * ```
     *
     * If any key in the path exists but cannot be updated (such as a primitive
     * like number or a custom Object like Date), an error will be thrown.
     *
     * Note: `updateIn` can be used in `withMutations`.
     */
    updateIn(keyPath: Iterable<any>, notSetValue: any, updater: (value: any) => any): this;
    updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;

    /**
     * A combination of `updateIn` and `merge`, returning a new Map, but
     * performing the merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     * ```js
     * map.updateIn(['a', 'b', 'c'], abc => abc.merge(y))
     * map.mergeIn(['a', 'b', 'c'], y)
     * ```
     *
     * Note: `mergeIn` can be used in `withMutations`.
     */
    mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    /**
     * A combination of `updateIn` and `mergeDeep`, returning a new Map, but
     * performing the deep merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     * ```js
     * map.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y))
     * map.mergeDeepIn(['a', 'b', 'c'], y)
     * ```
     *
     * Note: `mergeDeepIn` can be used in `withMutations`.
     */
    mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    // Transient changes

    /**
     * Every time you call one of the above functions, a new immutable Map is
     * created. If a pure function calls a number of these to produce a final
     * return value, then a penalty on performance and memory has been paid by
     * creating all of the intermediate immutable Maps.
     *
     * If you need to apply a series of mutations to produce a new immutable
     * Map, `withMutations()` creates a temporary mutable copy of the Map which
     * can apply mutations in a highly performant manner. In fact, this is
     * exactly how complex mutations like `merge` are done.
     *
     * As an example, this results in the creation of 2, not 4, new Maps:
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * const map1 = Map()
     * const map2 = map1.withMutations(map => {
     *   map.set('a', 1).set('b', 2).set('c', 3)
     * })
     * assert.equal(map1.size, 0)
     * assert.equal(map2.size, 3)
     * ```
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Read the documentation for each method to see if it
     * is safe to use in `withMutations`.
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Another way to avoid creation of intermediate Immutable maps is to create
     * a mutable copy of this collection. Mutable copies *always* return `this`,
     * and thus shouldn't be used for equality. Your function should never return
     * a mutable copy of a collection, only use it internally to create a new
     * collection.
     *
     * If possible, use `withMutations` to work with temporary mutable copies as
     * it provides an easier to use API and considers many common optimizations.
     *
     * Note: if the collection is already mutable, `asMutable` returns itself.
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Read the documentation for each method to see if it
     * is safe to use in `withMutations`.
     *
     * @see `Map#asImmutable`
     */
    asMutable(): this;

    /**
     * Returns true if this is a mutable copy (see `asMutable()`) and mutative
     * alterations have been applied.
     *
     * @see `Map#asMutable`
     */
    wasAltered(): boolean;

    /**
     * The yin to `asMutable`'s yang. Because it applies to mutable collections,
     * this operation is *mutable* and may return itself (though may not
     * return itself, i.e. if the result is an empty collection). Once
     * performed, the original mutable copy must no longer be mutated since it
     * may be the immutable result.
     *
     * If possible, use `withMutations` to work with temporary mutable copies as
     * it provides an easier to use API and considers many common optimizations.
     *
     * @see `Map#asMutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Map with values passed through a
     * `mapper` function.
     *
     *     Map({ a: 1, b: 2 }).map(x => 10 * x)
     *     // Map { a: 10, b: 20 }
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Map<K, M>;

    /**
     * @see Collection.Keyed.mapKeys
     */
    mapKeys<M>(
      mapper: (key: K, value: V, iter: this) => M,
      context?: any
    ): Map<M, V>;

    /**
     * @see Collection.Keyed.mapEntries
     */
    mapEntries<KM, VM>(
      mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
      context?: any
    ): Map<KM, VM>;

    /**
     * Flat-maps the Map, returning a new Map.
     *
     * Similar to `data.map(...).flatten(true)`.
     */
    flatMap<KM, VM>(
      mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
      context?: any
    ): Map<KM, VM>;

    /**
     * Returns a new Map with only the entries for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Map<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;

    /**
     * @see Collection.Keyed.flip
     */
    flip(): Map<V, K>;
  }


  /**
   * A type of Map that has the additional guarantee that the iteration order of
   * entries will be the order in which they were set().
   *
   * The iteration behavior of OrderedMap is the same as native ES6 Map and
   * JavaScript Object.
   *
   * Note that `OrderedMap` are more expensive than non-ordered `Map` and may
   * consume more memory. `OrderedMap#set` is amortized O(log32 N), but not
   * stable.
   */

  declare module OrderedMap {

    /**
     * True if the provided value is an OrderedMap.
     */
    function isOrderedMap(maybeOrderedMap: any): maybeOrderedMap is OrderedMap<any, any>;
  }

  /**
   * Creates a new Immutable OrderedMap.
   *
   * Created with the same key value pairs as the provided Collection.Keyed or
   * JavaScript Object or expects a Collection of [K, V] tuple entries.
   *
   * The iteration order of key-value pairs provided to this constructor will
   * be preserved in the OrderedMap.
   *
   *     let newOrderedMap = OrderedMap({key: "value"})
   *     let newOrderedMap = OrderedMap([["key", "value"]])
   *
   * Note: `OrderedMap` is a factory function and not a class, and does not use
   * the `new` keyword during construction.
   */
  declare function OrderedMap<K, V>(collection: Iterable<[K, V]>): OrderedMap<K, V>;
  declare function OrderedMap<T>(collection: Iterable<Iterable<T>>): OrderedMap<T, T>;
  declare function OrderedMap<V>(obj: {[key: string]: V}): OrderedMap<string, V>;
  declare function OrderedMap<K, V>(): OrderedMap<K, V>;
  declare function OrderedMap(): OrderedMap<any, any>;

  interface OrderedMap<K, V> extends Map<K, V> {

    /**
     * The number of entries in this OrderedMap.
     */
    readonly size: number;

    /**
     * Returns a new OrderedMap also containing the new key, value pair. If an
     * equivalent key already exists in this OrderedMap, it will be replaced
     * while maintaining the existing order.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { OrderedMap } = require('immutable')
     * const originalMap = OrderedMap({a:1, b:1, c:1})
     * const updatedMap = originalMap.set('b', 2)
     *
     * originalMap
     * // OrderedMap {a: 1, b: 1, c: 1}
     * updatedMap
     * // OrderedMap {a: 1, b: 2, c: 1}
     * ```
     *
     * Note: `set` can be used in `withMutations`.
     */
    set(key: K, value: V): this;

    /**
     * Returns a new OrderedMap resulting from merging the provided Collections
     * (or JS objects) into this OrderedMap. In other words, this takes each
     * entry of each collection and sets it on this OrderedMap.
     *
     * Note: Values provided to `merge` are shallowly converted before being
     * merged. No nested values are altered.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { OrderedMap } = require('immutable')
     * const one = OrderedMap({ a: 10, b: 20, c: 30 })
     * const two = OrderedMap({ b: 40, a: 50, d: 60 })
     * one.merge(two) // OrderedMap { "a": 50, "b": 40, "c": 30, "d": 60 }
     * two.merge(one) // OrderedMap { "b": 20, "a": 10, "d": 60, "c": 30 }
     * ```
     *
     * Note: `merge` can be used in `withMutations`.
     *
     * @alias concat
     */
    merge<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): OrderedMap<K | KC, V | VC>;
    merge<C>(...collections: Array<{[key: string]: C}>): OrderedMap<K | string, V | C>;
    concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): OrderedMap<K | KC, V | VC>;
    concat<C>(...collections: Array<{[key: string]: C}>): OrderedMap<K | string, V | C>;

    // Sequence algorithms

    /**
     * Returns a new OrderedMap with values passed through a
     * `mapper` function.
     *
     *     OrderedMap({ a: 1, b: 2 }).map(x => 10 * x)
     *     // OrderedMap { "a": 10, "b": 20 }
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): OrderedMap<K, M>;

    /**
     * @see Collection.Keyed.mapKeys
     */
    mapKeys<M>(
      mapper: (key: K, value: V, iter: this) => M,
      context?: any
    ): OrderedMap<M, V>;

    /**
     * @see Collection.Keyed.mapEntries
     */
    mapEntries<KM, VM>(
      mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
      context?: any
    ): OrderedMap<KM, VM>;

    /**
     * Flat-maps the OrderedMap, returning a new OrderedMap.
     *
     * Similar to `data.map(...).flatten(true)`.
     */
    flatMap<KM, VM>(
      mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
      context?: any
    ): OrderedMap<KM, VM>;

    /**
     * Returns a new OrderedMap with only the entries for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): OrderedMap<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;

    /**
     * @see Collection.Keyed.flip
     */
    flip(): OrderedMap<V, K>;
  }


  /**
   * A Collection of unique values with `O(log32 N)` adds and has.
   *
   * When iterating a Set, the entries will be (value, value) pairs. Iteration
   * order of a Set is undefined, however is stable. Multiple iterations of the
   * same Set will iterate in the same order.
   *
   * Set values, like Map keys, may be of any type. Equality is determined using
   * `Immutable.is`, enabling Sets to uniquely include other Immutable
   * collections, custom value types, and NaN.
   */
  declare module Set$1 {

    /**
     * True if the provided value is a Set
     */
    function isSet(maybeSet: any): maybeSet is Set$1<any>;

    /**
     * Creates a new Set containing `values`.
     */
    function of<T>(...values: Array<T>): Set$1<T>;

    /**
     * `Set.fromKeys()` creates a new immutable Set containing the keys from
     * this Collection or JavaScript Object.
     */
    function fromKeys<T>(iter: Collection$1<T, any>): Set$1<T>;
    function fromKeys(obj: {[key: string]: any}): Set$1<string>;

    /**
     * `Set.intersect()` creates a new immutable Set that is the intersection of
     * a collection of other sets.
     *
     * ```js
     * const { Set } = require('immutable')
     * const intersected = Set.intersect([
     *   Set([ 'a', 'b', 'c' ])
     *   Set([ 'c', 'a', 't' ])
     * ])
     * // Set [ "a", "c"" ]
     * ```
     */
    function intersect<T>(sets: Iterable<Iterable<T>>): Set$1<T>;

    /**
     * `Set.union()` creates a new immutable Set that is the union of a
     * collection of other sets.
     *
     * ```js
     * const { Set } = require('immutable')
     * const unioned = Set.union([
     *   Set([ 'a', 'b', 'c' ])
     *   Set([ 'c', 'a', 't' ])
     * ])
     * // Set [ "a", "b", "c", "t"" ]
     * ```
     */
    function union<T>(sets: Iterable<Iterable<T>>): Set$1<T>;
  }

  /**
   * Create a new immutable Set containing the values of the provided
   * collection-like.
   *
   * Note: `Set` is a factory function and not a class, and does not use the
   * `new` keyword during construction.
   */
  declare function Set$1(): Set$1<any>;
  declare function Set$1<T>(): Set$1<T>;
  declare function Set$1<T>(collection: Iterable<T>): Set$1<T>;

  interface Set$1<T> extends Collection$1.Set<T> {

    /**
     * The number of items in this Set.
     */
    readonly size: number;

    // Persistent changes

    /**
     * Returns a new Set which also includes this value.
     *
     * Note: `add` can be used in `withMutations`.
     */
    add(value: T): this;

    /**
     * Returns a new Set which excludes this value.
     *
     * Note: `delete` can be used in `withMutations`.
     *
     * Note: `delete` **cannot** be safely used in IE8, use `remove` if
     * supporting old browsers.
     *
     * @alias remove
     */
    delete(value: T): this;
    remove(value: T): this;

    /**
     * Returns a new Set containing no values.
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): this;

    /**
     * Returns a Set including any value from `collections` that does not already
     * exist in this Set.
     *
     * Note: `union` can be used in `withMutations`.
     * @alias merge
     * @alias concat
     */
    union<C>(...collections: Array<Iterable<C>>): Set$1<T | C>;
    merge<C>(...collections: Array<Iterable<C>>): Set$1<T | C>;
    concat<C>(...collections: Array<Iterable<C>>): Set$1<T | C>;

    /**
     * Returns a Set which has removed any values not also contained
     * within `collections`.
     *
     * Note: `intersect` can be used in `withMutations`.
     */
    intersect(...collections: Array<Iterable<T>>): this;

    /**
     * Returns a Set excluding any values contained within `collections`.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { OrderedSet } = require('immutable')
     * OrderedSet([ 1, 2, 3 ]).subtract([1, 3])
     * // OrderedSet [2]
     * ```
     *
     * Note: `subtract` can be used in `withMutations`.
     */
    subtract(...collections: Array<Iterable<T>>): this;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#wasAltered`
     */
    wasAltered(): boolean;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Set with values passed through a
     * `mapper` function.
     *
     *     Set([1,2]).map(x => 10 * x)
     *     // Set [10,20]
     */
    map<M>(
      mapper: (value: T, key: T, iter: this) => M,
      context?: any
    ): Set$1<M>;

    /**
     * Flat-maps the Set, returning a new Set.
     *
     * Similar to `set.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: T, iter: this) => Iterable<M>,
      context?: any
    ): Set$1<M>;

    /**
     * Returns a new Set with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, key: T, iter: this) => value is F,
      context?: any
    ): Set$1<F>;
    filter(
      predicate: (value: T, key: T, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * A type of Set that has the additional guarantee that the iteration order of
   * values will be the order in which they were `add`ed.
   *
   * The iteration behavior of OrderedSet is the same as native ES6 Set.
   *
   * Note that `OrderedSet` are more expensive than non-ordered `Set` and may
   * consume more memory. `OrderedSet#add` is amortized O(log32 N), but not
   * stable.
   */
  declare module OrderedSet {

    /**
     * True if the provided value is an OrderedSet.
     */
    function isOrderedSet(maybeOrderedSet: any): boolean;

    /**
     * Creates a new OrderedSet containing `values`.
     */
    function of<T>(...values: Array<T>): OrderedSet<T>;

    /**
     * `OrderedSet.fromKeys()` creates a new immutable OrderedSet containing
     * the keys from this Collection or JavaScript Object.
     */
    function fromKeys<T>(iter: Collection$1<T, any>): OrderedSet<T>;
    function fromKeys(obj: {[key: string]: any}): OrderedSet<string>;
  }

  /**
   * Create a new immutable OrderedSet containing the values of the provided
   * collection-like.
   *
   * Note: `OrderedSet` is a factory function and not a class, and does not use
   * the `new` keyword during construction.
   */
  declare function OrderedSet(): OrderedSet<any>;
  declare function OrderedSet<T>(): OrderedSet<T>;
  declare function OrderedSet<T>(collection: Iterable<T>): OrderedSet<T>;

  interface OrderedSet<T> extends Set$1<T> {

    /**
     * The number of items in this OrderedSet.
     */
    readonly size: number;

    /**
     * Returns an OrderedSet including any value from `collections` that does
     * not already exist in this OrderedSet.
     *
     * Note: `union` can be used in `withMutations`.
     * @alias merge
     * @alias concat
     */
    union<C>(...collections: Array<Iterable<C>>): OrderedSet<T | C>;
    merge<C>(...collections: Array<Iterable<C>>): OrderedSet<T | C>;
    concat<C>(...collections: Array<Iterable<C>>): OrderedSet<T | C>;

    // Sequence algorithms

    /**
     * Returns a new Set with values passed through a
     * `mapper` function.
     *
     *     OrderedSet([ 1, 2 ]).map(x => 10 * x)
     *     // OrderedSet [10, 20]
     */
    map<M>(
      mapper: (value: T, key: T, iter: this) => M,
      context?: any
    ): OrderedSet<M>;

    /**
     * Flat-maps the OrderedSet, returning a new OrderedSet.
     *
     * Similar to `set.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: T, iter: this) => Iterable<M>,
      context?: any
    ): OrderedSet<M>;

    /**
     * Returns a new OrderedSet with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, key: T, iter: this) => value is F,
      context?: any
    ): OrderedSet<F>;
    filter(
      predicate: (value: T, key: T, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns an OrderedSet of the same type "zipped" with the provided
     * collections.
     *
     * Like `zipWith`, but using the default `zipper`: creating an `Array`.
     *
     * ```js
     * const a = OrderedSet([ 1, 2, 3 ])
     * const b = OrderedSet([ 4, 5, 6 ])
     * const c = a.zip(b)
     * // OrderedSet [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
     * ```
     */
    zip<U>(other: Collection$1<any, U>): OrderedSet<[T,U]>;
    zip<U,V>(other1: Collection$1<any, U>, other2: Collection$1<any, V>): OrderedSet<[T,U,V]>;
    zip(...collections: Array<Collection$1<any, any>>): OrderedSet<any>;

    /**
     * Returns a OrderedSet of the same type "zipped" with the provided
     * collections.
     *
     * Unlike `zip`, `zipAll` continues zipping until the longest collection is
     * exhausted. Missing values from shorter collections are filled with `undefined`.
     *
     * ```js
     * const a = OrderedSet([ 1, 2 ]);
     * const b = OrderedSet([ 3, 4, 5 ]);
     * const c = a.zipAll(b); // OrderedSet [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
     * ```
     *
     * Note: Since zipAll will return a collection as large as the largest
     * input, some results may contain undefined values. TypeScript cannot
     * account for these without cases (as of v2.5).
     */
    zipAll<U>(other: Collection$1<any, U>): OrderedSet<[T,U]>;
    zipAll<U,V>(other1: Collection$1<any, U>, other2: Collection$1<any, V>): OrderedSet<[T,U,V]>;
    zipAll(...collections: Array<Collection$1<any, any>>): OrderedSet<any>;

    /**
     * Returns an OrderedSet of the same type "zipped" with the provided
     * collections by using a custom `zipper` function.
     *
     * @see Seq.Indexed.zipWith
     */
    zipWith<U, Z>(
      zipper: (value: T, otherValue: U) => Z,
      otherCollection: Collection$1<any, U>
    ): OrderedSet<Z>;
    zipWith<U, V, Z>(
      zipper: (value: T, otherValue: U, thirdValue: V) => Z,
      otherCollection: Collection$1<any, U>,
      thirdCollection: Collection$1<any, V>
    ): OrderedSet<Z>;
    zipWith<Z>(
      zipper: (...any: Array<any>) => Z,
      ...collections: Array<Collection$1<any, any>>
    ): OrderedSet<Z>;

  }


  /**
   * Stacks are indexed collections which support very efficient O(1) addition
   * and removal from the front using `unshift(v)` and `shift()`.
   *
   * For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but
   * be aware that they also operate on the front of the list, unlike List or
   * a JavaScript Array.
   *
   * Note: `reverse()` or any inherent reverse traversal (`reduceRight`,
   * `lastIndexOf`, etc.) is not efficient with a Stack.
   *
   * Stack is implemented with a Single-Linked List.
   */
  declare module Stack {

    /**
     * True if the provided value is a Stack
     */
    function isStack(maybeStack: any): maybeStack is Stack<any>;

    /**
     * Creates a new Stack containing `values`.
     */
    function of<T>(...values: Array<T>): Stack<T>;
  }

  /**
   * Create a new immutable Stack containing the values of the provided
   * collection-like.
   *
   * The iteration order of the provided collection is preserved in the
   * resulting `Stack`.
   *
   * Note: `Stack` is a factory function and not a class, and does not use the
   * `new` keyword during construction.
   */
  declare function Stack(): Stack<any>;
  declare function Stack<T>(): Stack<T>;
  declare function Stack<T>(collection: Iterable<T>): Stack<T>;

  interface Stack<T> extends Collection$1.Indexed<T> {

    /**
     * The number of items in this Stack.
     */
    readonly size: number;

    // Reading values

    /**
     * Alias for `Stack.first()`.
     */
    peek(): T | undefined;


    // Persistent changes

    /**
     * Returns a new Stack with 0 size and no values.
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): Stack<T>;

    /**
     * Returns a new Stack with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * This is very efficient for Stack.
     *
     * Note: `unshift` can be used in `withMutations`.
     */
    unshift(...values: Array<T>): Stack<T>;

    /**
     * Like `Stack#unshift`, but accepts a collection rather than varargs.
     *
     * Note: `unshiftAll` can be used in `withMutations`.
     */
    unshiftAll(iter: Iterable<T>): Stack<T>;

    /**
     * Returns a new Stack with a size ones less than this Stack, excluding
     * the first item in this Stack, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * Stack rather than the removed value. Use `first()` or `peek()` to get the
     * first value in this Stack.
     *
     * Note: `shift` can be used in `withMutations`.
     */
    shift(): Stack<T>;

    /**
     * Alias for `Stack#unshift` and is not equivalent to `List#push`.
     */
    push(...values: Array<T>): Stack<T>;

    /**
     * Alias for `Stack#unshiftAll`.
     */
    pushAll(iter: Iterable<T>): Stack<T>;

    /**
     * Alias for `Stack#shift` and is not equivalent to `List#pop`.
     */
    pop(): Stack<T>;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#wasAltered`
     */
    wasAltered(): boolean;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Stack with other collections concatenated to this one.
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Stack<T | C>;

    /**
     * Returns a new Stack with values passed through a
     * `mapper` function.
     *
     *     Stack([ 1, 2 ]).map(x => 10 * x)
     *     // Stack [ 10, 20 ]
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: T, key: number, iter: this) => M,
      context?: any
    ): Stack<M>;

    /**
     * Flat-maps the Stack, returning a new Stack.
     *
     * Similar to `stack.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: number, iter: this) => Iterable<M>,
      context?: any
    ): Stack<M>;

    /**
     * Returns a new Set with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, index: number, iter: this) => value is F,
      context?: any
    ): Set$1<F>;
    filter(
      predicate: (value: T, index: number, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns a Stack "zipped" with the provided collections.
     *
     * Like `zipWith`, but using the default `zipper`: creating an `Array`.
     *
     * ```js
     * const a = Stack([ 1, 2, 3 ]);
     * const b = Stack([ 4, 5, 6 ]);
     * const c = a.zip(b); // Stack [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
     * ```
     */
    zip<U>(other: Collection$1<any, U>): Stack<[T,U]>;
    zip<U,V>(other: Collection$1<any, U>, other2: Collection$1<any,V>): Stack<[T,U,V]>;
    zip(...collections: Array<Collection$1<any, any>>): Stack<any>;

    /**
     * Returns a Stack "zipped" with the provided collections.
     *
     * Unlike `zip`, `zipAll` continues zipping until the longest collection is
     * exhausted. Missing values from shorter collections are filled with `undefined`.
     *
     * ```js
     * const a = Stack([ 1, 2 ]);
     * const b = Stack([ 3, 4, 5 ]);
     * const c = a.zipAll(b); // Stack [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
     * ```
     *
     * Note: Since zipAll will return a collection as large as the largest
     * input, some results may contain undefined values. TypeScript cannot
     * account for these without cases (as of v2.5).
     */
    zipAll<U>(other: Collection$1<any, U>): Stack<[T,U]>;
    zipAll<U,V>(other: Collection$1<any, U>, other2: Collection$1<any,V>): Stack<[T,U,V]>;
    zipAll(...collections: Array<Collection$1<any, any>>): Stack<any>;

    /**
     * Returns a Stack "zipped" with the provided collections by using a
     * custom `zipper` function.
     *
     * ```js
     * const a = Stack([ 1, 2, 3 ]);
     * const b = Stack([ 4, 5, 6 ]);
     * const c = a.zipWith((a, b) => a + b, b);
     * // Stack [ 5, 7, 9 ]
     * ```
     */
    zipWith<U, Z>(
      zipper: (value: T, otherValue: U) => Z,
      otherCollection: Collection$1<any, U>
    ): Stack<Z>;
    zipWith<U, V, Z>(
      zipper: (value: T, otherValue: U, thirdValue: V) => Z,
      otherCollection: Collection$1<any, U>,
      thirdCollection: Collection$1<any, V>
    ): Stack<Z>;
    zipWith<Z>(
      zipper: (...any: Array<any>) => Z,
      ...collections: Array<Collection$1<any, any>>
    ): Stack<Z>;
  }


  /**
   * A record is similar to a JS object, but enforces a specific set of allowed
   * string keys, and has default values.
   *
   * The `Record()` function produces new Record Factories, which when called
   * create Record instances.
   *
   * ```js
   * const { Record } = require('immutable')
   * const ABRecord = Record({ a: 1, b: 2 })
   * const myRecord = ABRecord({ b: 3 })
   * ```
   *
   * Records always have a value for the keys they define. `remove`ing a key
   * from a record simply resets it to the default value for that key.
   *
   * ```js
   * myRecord.size // 2
   * myRecord.get('a') // 1
   * myRecord.get('b') // 3
   * const myRecordWithoutB = myRecord.remove('b')
   * myRecordWithoutB.get('b') // 2
   * myRecordWithoutB.size // 2
   * ```
   *
   * Values provided to the constructor not found in the Record type will
   * be ignored. For example, in this case, ABRecord is provided a key "x" even
   * though only "a" and "b" have been defined. The value for "x" will be
   * ignored for this record.
   *
   * ```js
   * const myRecord = ABRecord({ b: 3, x: 10 })
   * myRecord.get('x') // undefined
   * ```
   *
   * Because Records have a known set of string keys, property get access works
   * as expected, however property sets will throw an Error.
   *
   * Note: IE8 does not support property access. Only use `get()` when
   * supporting IE8.
   *
   * ```js
   * myRecord.b // 3
   * myRecord.b = 5 // throws Error
   * ```
   *
   * Record Types can be extended as well, allowing for custom methods on your
   * Record. This is not a common pattern in functional environments, but is in
   * many JS programs.
   *
   * However Record Types are more restricted than typical JavaScript classes.
   * They do not use a class constructor, which also means they cannot use
   * class properties (since those are technically part of a constructor).
   *
   * While Record Types can be syntactically created with the JavaScript `class`
   * form, the resulting Record function is actually a factory function, not a
   * class constructor. Even though Record Types are not classes, JavaScript
   * currently requires the use of `new` when creating new Record instances if
   * they are defined as a `class`.
   *
   * ```
   * class ABRecord extends Record({ a: 1, b: 2 }) {
   *   getAB() {
   *     return this.a + this.b;
   *   }
   * }
   *
   * var myRecord = new ABRecord({b: 3})
   * myRecord.getAB() // 4
   * ```
   *
   *
   * **Flow Typing Records:**
   *
   * Immutable.js exports two Flow types designed to make it easier to use
   * Records with flow typed code, `RecordOf<TProps>` and `RecordFactory<TProps>`.
   *
   * When defining a new kind of Record factory function, use a flow type that
   * describes the values the record contains along with `RecordFactory<TProps>`.
   * To type instances of the Record (which the factory function returns),
   * use `RecordOf<TProps>`.
   *
   * Typically, new Record definitions will export both the Record factory
   * function as well as the Record instance type for use in other code.
   *
   * ```js
   * import type { RecordFactory, RecordOf } from 'immutable';
   *
   * // Use RecordFactory<TProps> for defining new Record factory functions.
   * type Point3DProps = { x: number, y: number, z: number };
   * const defaultValues: Point3DProps = { x: 0, y: 0, z: 0 };
   * const makePoint3D: RecordFactory<Point3DProps> = Record(defaultValues);
   * export makePoint3D;
   *
   * // Use RecordOf<T> for defining new instances of that Record.
   * export type Point3D = RecordOf<Point3DProps>;
   * const some3DPoint: Point3D = makePoint3D({ x: 10, y: 20, z: 30 });
   * ```
   *
   * **Flow Typing Record Subclasses:**
   *
   * Records can be subclassed as a means to add additional methods to Record
   * instances. This is generally discouraged in favor of a more functional API,
   * since Subclasses have some minor overhead. However the ability to create
   * a rich API on Record types can be quite valuable.
   *
   * When using Flow to type Subclasses, do not use `RecordFactory<TProps>`,
   * instead apply the props type when subclassing:
   *
   * ```js
   * type PersonProps = {name: string, age: number};
   * const defaultValues: PersonProps = {name: 'Aristotle', age: 2400};
   * const PersonRecord = Record(defaultValues);
   * class Person extends PersonRecord<PersonProps> {
   *   getName(): string {
   *     return this.get('name')
   *   }
   *
   *   setName(name: string): this {
   *     return this.set('name', name);
   *   }
   * }
   * ```
   *
   * **Choosing Records vs plain JavaScript objects**
   *
   * Records offer a persistently immutable alternative to plain JavaScript
   * objects, however they're not required to be used within Immutable.js
   * collections. In fact, the deep-access and deep-updating functions
   * like `getIn()` and `setIn()` work with plain JavaScript Objects as well.
   *
   * Deciding to use Records or Objects in your application should be informed
   * by the tradeoffs and relative benefits of each:
   *
   * - *Runtime immutability*: plain JS objects may be carefully treated as
   *   immutable, however Record instances will *throw* if attempted to be
   *   mutated directly. Records provide this additional guarantee, however at
   *   some marginal runtime cost. While JS objects are mutable by nature, the
   *   use of type-checking tools like [Flow](https://medium.com/@gcanti/immutability-with-flow-faa050a1aef4)
   *   can help gain confidence in code written to favor immutability.
   *
   * - *Value equality*: Records use value equality when compared with `is()`
   *   or `record.equals()`. That is, two Records with the same keys and values
   *   are equal. Plain objects use *reference equality*. Two objects with the
   *   same keys and values are not equal since they are different objects.
   *   This is important to consider when using objects as keys in a `Map` or
   *   values in a `Set`, which use equality when retrieving values.
   *
   * - *API methods*: Records have a full featured API, with methods like
   *   `.getIn()`, and `.equals()`. These can make working with these values
   *   easier, but comes at the cost of not allowing keys with those names.
   *
   * - *Default values*: Records provide default values for every key, which
   *   can be useful when constructing Records with often unchanging values.
   *   However default values can make using Flow and TypeScript more laborious.
   *
   * - *Serialization*: Records use a custom internal representation to
   *   efficiently store and update their values. Converting to and from this
   *   form isn't free. If converting Records to plain objects is common,
   *   consider sticking with plain objects to begin with.
   */
  declare module Record$1 {

    /**
     * True if `maybeRecord` is an instance of a Record.
     */
    export function isRecord(maybeRecord: any): maybeRecord is Record$1<any>;

    /**
     * Records allow passing a second parameter to supply a descriptive name
     * that appears when converting a Record to a string or in any error
     * messages. A descriptive name for any record can be accessed by using this
     * method. If one was not provided, the string "Record" is returned.
     *
     * ```js
     * const { Record } = require('immutable')
     * const Person = Record({
     *   name: null
     * }, 'Person')
     *
     * var me = Person({ name: 'My Name' })
     * me.toString() // "Person { "name": "My Name" }"
     * Record.getDescriptiveName(me) // "Person"
     * ```
     */
    export function getDescriptiveName(record: Record$1<any>): string;

    /**
     * A Record.Factory is created by the `Record()` function. Record instances
     * are created by passing it some of the accepted values for that Record
     * type:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Record } = require('immutable')" }
     * -->
     * ```js
     * // makePerson is a Record Factory function
     * const makePerson = Record({ name: null, favoriteColor: 'unknown' });
     *
     * // alan is a Record instance
     * const alan = makePerson({ name: 'Alan' });
     * ```
     *
     * Note that Record Factories return `Record<TProps> & Readonly<TProps>`,
     * this allows use of both the Record instance API, and direct property
     * access on the resulting instances:
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Record } = require('immutable');const makePerson = Record({ name: null, favoriteColor: 'unknown' });const alan = makePerson({ name: 'Alan' });" }
     * -->
     * ```js
     * // Use the Record API
     * console.log('Record API: ' + alan.get('name'))
     *
     * // Or direct property access (Readonly)
     * console.log('property access: ' + alan.name)
     * ```
     *
     * **Flow Typing Records:**
     *
     * Use the `RecordFactory<TProps>` Flow type to get high quality type checking of
     * Records:
     *
     * ```js
     * import type { RecordFactory, RecordOf } from 'immutable';
     *
     * // Use RecordFactory<TProps> for defining new Record factory functions.
     * type PersonProps = { name: ?string, favoriteColor: string };
     * const makePerson: RecordFactory<PersonProps> = Record({ name: null, favoriteColor: 'unknown' });
     *
     * // Use RecordOf<T> for defining new instances of that Record.
     * type Person = RecordOf<PersonProps>;
     * const alan: Person = makePerson({ name: 'Alan' });
     * ```
     */
    export module Factory {}

    export interface Factory<TProps extends Object> {
      (values?: Partial<TProps> | Iterable<[string, any]>): Record$1<TProps> & Readonly<TProps>;
      new (values?: Partial<TProps> | Iterable<[string, any]>): Record$1<TProps> & Readonly<TProps>;
    }

    export function Factory<TProps extends Object>(values?: Partial<TProps> | Iterable<[string, any]>): Record$1<TProps> & Readonly<TProps>;
  }

  /**
   * Unlike other types in Immutable.js, the `Record()` function creates a new
   * Record Factory, which is a function that creates Record instances.
   *
   * See above for examples of using `Record()`.
   *
   * Note: `Record` is a factory function and not a class, and does not use the
   * `new` keyword during construction.
   */
  declare function Record$1<TProps extends object>(defaultValues: TProps, name?: string): Record$1.Factory<TProps>;

  interface Record$1<TProps extends Object> {

    // Reading values

    has(key: string): key is keyof TProps & string;

    /**
     * Returns the value associated with the provided key, which may be the
     * default value defined when creating the Record factory function.
     *
     * If the requested key is not defined by this Record type, then
     * notSetValue will be returned if provided. Note that this scenario would
     * produce an error when using Flow or TypeScript.
     */
    get<K extends keyof TProps>(key: K, notSetValue?: any): TProps[K];
    get<T>(key: string, notSetValue: T): T;

    // Reading deep values

    hasIn(keyPath: Iterable<any>): boolean;
    getIn(keyPath: Iterable<any>): any;

    // Value equality

    equals(other: any): boolean;
    hashCode(): number;

    // Persistent changes

    set<K extends keyof TProps>(key: K, value: TProps[K]): this;
    update<K extends keyof TProps>(key: K, updater: (value: TProps[K]) => TProps[K]): this;
    merge(...collections: Array<Partial<TProps> | Iterable<[string, any]>>): this;
    mergeDeep(...collections: Array<Partial<TProps> | Iterable<[string, any]>>): this;

    mergeWith(
      merger: (oldVal: any, newVal: any, key: keyof TProps) => any,
      ...collections: Array<Partial<TProps> | Iterable<[string, any]>>
    ): this;
    mergeDeepWith(
      merger: (oldVal: any, newVal: any, key: any) => any,
      ...collections: Array<Partial<TProps> | Iterable<[string, any]>>
    ): this;

    /**
     * Returns a new instance of this Record type with the value for the
     * specific key set to its default value.
     *
     * @alias remove
     */
    delete<K extends keyof TProps>(key: K): this;
    remove<K extends keyof TProps>(key: K): this;

    /**
     * Returns a new instance of this Record type with all values set
     * to their default values.
     */
    clear(): this;

    // Deep persistent changes

    setIn(keyPath: Iterable<any>, value: any): this;
    updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;
    mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;
    mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    /**
     * @alias removeIn
     */
    deleteIn(keyPath: Iterable<any>): this;
    removeIn(keyPath: Iterable<any>): this;

    // Conversion to JavaScript types

    /**
     * Deeply converts this Record to equivalent native JavaScript Object.
     *
     * Note: This method may not be overridden. Objects with custom
     * serialization to plain JS may override toJSON() instead.
     */
    toJS(): { [K in keyof TProps]: any };

    /**
     * Shallowly converts this Record to equivalent native JavaScript Object.
     */
    toJSON(): TProps;

    /**
     * Shallowly converts this Record to equivalent JavaScript Object.
     */
    toObject(): TProps;

    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Only `set` may be used mutatively.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#wasAltered`
     */
    wasAltered(): boolean;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    toSeq(): Seq.Keyed<keyof TProps, TProps[keyof TProps]>;

    [Symbol.iterator](): IterableIterator<[keyof TProps, TProps[keyof TProps]]>;
  }

  /**
   * `Seq` describes a lazy operation, allowing them to efficiently chain
   * use of all the higher-order collection methods (such as `map` and `filter`)
   * by not creating intermediate collections.
   *
   * **Seq is immutable** — Once a Seq is created, it cannot be
   * changed, appended to, rearranged or otherwise modified. Instead, any
   * mutative method called on a `Seq` will return a new `Seq`.
   *
   * **Seq is lazy** — `Seq` does as little work as necessary to respond to any
   * method call. Values are often created during iteration, including implicit
   * iteration when reducing or converting to a concrete data structure such as
   * a `List` or JavaScript `Array`.
   *
   * For example, the following performs no work, because the resulting
   * `Seq`'s values are never iterated:
   *
   * ```js
   * const { Seq } = require('immutable')
   * const oddSquares = Seq([ 1, 2, 3, 4, 5, 6, 7, 8 ])
   *   .filter(x => x % 2 !== 0)
   *   .map(x => x * x)
   * ```
   *
   * Once the `Seq` is used, it performs only the work necessary. In this
   * example, no intermediate arrays are ever created, filter is called three
   * times, and map is only called once:
   *
   * ```js
   * oddSquares.get(1); // 9
   * ```
   *
   * Any collection can be converted to a lazy Seq with `Seq()`.
   *
   * <!-- runkit:activate -->
   * ```js
   * const { Map } = require('immutable')
   * const map = Map({ a: 1, b: 2, c: 3 }
   * const lazySeq = Seq(map)
   * ```
   *
   * `Seq` allows for the efficient chaining of operations, allowing for the
   * expression of logic that can otherwise be very tedious:
   *
   * ```js
   * lazySeq
   *   .flip()
   *   .map(key => key.toUpperCase())
   *   .flip()
   * // Seq { A: 1, B: 1, C: 1 }
   * ```
   *
   * As well as expressing logic that would otherwise seem memory or time
   * limited, for example `Range` is a special kind of Lazy sequence.
   *
   * <!-- runkit:activate -->
   * ```js
   * const { Range } = require('immutable')
   * Range(1, Infinity)
   *   .skip(1000)
   *   .map(n => -n)
   *   .filter(n => n % 2 === 0)
   *   .take(2)
   *   .reduce((r, n) => r * n, 1)
   * // 1006008
   * ```
   *
   * Seq is often used to provide a rich collection API to JavaScript Object.
   *
   * ```js
   * Seq({ x: 0, y: 1, z: 2 }).map(v => v * 2).toObject();
   * // { x: 0, y: 2, z: 4 }
   * ```
   */

  declare module Seq {
    /**
     * True if `maybeSeq` is a Seq, it is not backed by a concrete
     * structure such as Map, List, or Set.
     */
    function isSeq(maybeSeq: any): maybeSeq is Seq.Indexed<any> | Seq.Keyed<any, any> | Seq.Set<any>;


    /**
     * `Seq` which represents key-value pairs.
     */
    export module Keyed {}

    /**
     * Always returns a Seq.Keyed, if input is not keyed, expects an
     * collection of [K, V] tuples.
     *
     * Note: `Seq.Keyed` is a conversion function and not a class, and does not
     * use the `new` keyword during construction.
     */
    export function Keyed<K, V>(collection: Iterable<[K, V]>): Seq.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
    export function Keyed<K, V>(): Seq.Keyed<K, V>;
    export function Keyed(): Seq.Keyed<any, any>;

    export interface Keyed<K, V> extends Seq<K, V>, Collection$1.Keyed<K, V> {
      /**
       * Deeply converts this Keyed Seq to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJS(): Object;

      /**
       * Shallowly converts this Keyed Seq to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJSON(): { [key: string]: V };

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<[K, V]>;

      /**
       * Returns itself
       */
      toSeq(): this;

      /**
       * Returns a new Seq with other collections concatenated to this one.
       *
       * All entries will be present in the resulting Seq, even if they
       * have the same key.
       */
      concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Seq.Keyed<K | KC, V | VC>;
      concat<C>(...collections: Array<{[key: string]: C}>): Seq.Keyed<K | string, V | C>;

      /**
       * Returns a new Seq.Keyed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Seq } = require('immutable')
       * Seq.Keyed({ a: 1, b: 2 }).map(x => 10 * x)
       * // Seq { "a": 10, "b": 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: V, key: K, iter: this) => M,
        context?: any
      ): Seq.Keyed<K, M>;

      /**
       * @see Collection.Keyed.mapKeys
       */
      mapKeys<M>(
        mapper: (key: K, value: V, iter: this) => M,
        context?: any
      ): Seq.Keyed<M, V>;

      /**
       * @see Collection.Keyed.mapEntries
       */
      mapEntries<KM, VM>(
        mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
        context?: any
      ): Seq.Keyed<KM, VM>;

      /**
       * Flat-maps the Seq, returning a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<KM, VM>(
        mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
        context?: any
      ): Seq.Keyed<KM, VM>;

      /**
       * Returns a new Seq with only the entries for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends V>(
        predicate: (value: V, key: K, iter: this) => value is F,
        context?: any
      ): Seq.Keyed<K, F>;
      filter(
        predicate: (value: V, key: K, iter: this) => any,
        context?: any
      ): this;

      /**
       * @see Collection.Keyed.flip
       */
      flip(): Seq.Keyed<V, K>;
    }


    /**
     * `Seq` which represents an ordered indexed list of values.
     */
    module Indexed {

      /**
       * Provides an Seq.Indexed of the values provided.
       */
      function of<T>(...values: Array<T>): Seq.Indexed<T>;
    }

    /**
     * Always returns Seq.Indexed, discarding associated keys and
     * supplying incrementing indices.
     *
     * Note: `Seq.Indexed` is a conversion function and not a class, and does
     * not use the `new` keyword during construction.
     */
    export function Indexed(): Seq.Indexed<any>;
    export function Indexed<T>(): Seq.Indexed<T>;
    export function Indexed<T>(collection: Iterable<T>): Seq.Indexed<T>;

    export interface Indexed<T> extends Seq<number, T>, Collection$1.Indexed<T> {
      /**
       * Deeply converts this Indexed Seq to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Indexed Seq to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<T>;

      /**
       * Returns itself
       */
      toSeq(): this

      /**
       * Returns a new Seq with other collections concatenated to this one.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Seq.Indexed<T | C>;

      /**
       * Returns a new Seq.Indexed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Seq } = require('immutable')
       * Seq.Indexed([ 1, 2 ]).map(x => 10 * x)
       * // Seq [ 10, 20 ]
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: number, iter: this) => M,
        context?: any
      ): Seq.Indexed<M>;

      /**
       * Flat-maps the Seq, returning a a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        context?: any
      ): Seq.Indexed<M>;

      /**
       * Returns a new Seq with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        context?: any
      ): Seq.Indexed<F>;
      filter(
        predicate: (value: T, index: number, iter: this) => any,
        context?: any
      ): this;

      /**
       * Returns a Seq "zipped" with the provided collections.
       *
       * Like `zipWith`, but using the default `zipper`: creating an `Array`.
       *
       * ```js
       * const a = Seq([ 1, 2, 3 ]);
       * const b = Seq([ 4, 5, 6 ]);
       * const c = a.zip(b); // Seq [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
       * ```
       */
      zip<U>(other: Collection$1<any, U>): Seq.Indexed<[T,U]>;
      zip<U,V>(other: Collection$1<any, U>, other2: Collection$1<any, V>): Seq.Indexed<[T,U,V]>;
      zip(...collections: Array<Collection$1<any, any>>): Seq.Indexed<any>;

      /**
       * Returns a Seq "zipped" with the provided collections.
       *
       * Unlike `zip`, `zipAll` continues zipping until the longest collection is
       * exhausted. Missing values from shorter collections are filled with `undefined`.
       *
       * ```js
       * const a = Seq([ 1, 2 ]);
       * const b = Seq([ 3, 4, 5 ]);
       * const c = a.zipAll(b); // Seq [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
       * ```
       */
      zipAll<U>(other: Collection$1<any, U>): Seq.Indexed<[T,U]>;
      zipAll<U,V>(other: Collection$1<any, U>, other2: Collection$1<any, V>): Seq.Indexed<[T,U,V]>;
      zipAll(...collections: Array<Collection$1<any, any>>): Seq.Indexed<any>;

      /**
       * Returns a Seq "zipped" with the provided collections by using a
       * custom `zipper` function.
       *
       * ```js
       * const a = Seq([ 1, 2, 3 ]);
       * const b = Seq([ 4, 5, 6 ]);
       * const c = a.zipWith((a, b) => a + b, b);
       * // Seq [ 5, 7, 9 ]
       * ```
       */
      zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection$1<any, U>
      ): Seq.Indexed<Z>;
      zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection$1<any, U>,
        thirdCollection: Collection$1<any, V>
      ): Seq.Indexed<Z>;
      zipWith<Z>(
        zipper: (...any: Array<any>) => Z,
        ...collections: Array<Collection$1<any, any>>
      ): Seq.Indexed<Z>;
    }


    /**
     * `Seq` which represents a set of values.
     *
     * Because `Seq` are often lazy, `Seq.Set` does not provide the same guarantee
     * of value uniqueness as the concrete `Set`.
     */
    export module Set {

      /**
       * Returns a Seq.Set of the provided values
       */
      function of<T>(...values: Array<T>): Seq.Set<T>;
    }

    /**
     * Always returns a Seq.Set, discarding associated indices or keys.
     *
     * Note: `Seq.Set` is a conversion function and not a class, and does not
     * use the `new` keyword during construction.
     */
    export function Set(): Seq.Set<any>;
    export function Set<T>(): Seq.Set<T>;
    export function Set<T>(collection: Iterable<T>): Seq.Set<T>;

    export interface Set<T> extends Seq<T, T>, Collection$1.Set<T> {
      /**
       * Deeply converts this Set Seq to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Set Seq to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<T>;

      /**
       * Returns itself
       */
      toSeq(): this

      /**
       * Returns a new Seq with other collections concatenated to this one.
       *
       * All entries will be present in the resulting Seq, even if they
       * are duplicates.
       */
      concat<U>(...collections: Array<Iterable<U>>): Seq.Set<T | U>;

      /**
       * Returns a new Seq.Set with values passed through a
       * `mapper` function.
       *
       * ```js
       * Seq.Set([ 1, 2 ]).map(x => 10 * x)
       * // Seq { 10, 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: T, iter: this) => M,
        context?: any
      ): Seq.Set<M>;

      /**
       * Flat-maps the Seq, returning a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: T, iter: this) => Iterable<M>,
        context?: any
      ): Seq.Set<M>;

      /**
       * Returns a new Seq with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, key: T, iter: this) => value is F,
        context?: any
      ): Seq.Set<F>;
      filter(
        predicate: (value: T, key: T, iter: this) => any,
        context?: any
      ): this;
    }

  }

  /**
   * Creates a Seq.
   *
   * Returns a particular kind of `Seq` based on the input.
   *
   *   * If a `Seq`, that same `Seq`.
   *   * If an `Collection`, a `Seq` of the same kind (Keyed, Indexed, or Set).
   *   * If an Array-like, an `Seq.Indexed`.
   *   * If an Iterable Object, an `Seq.Indexed`.
   *   * If an Object, a `Seq.Keyed`.
   *
   * Note: An Iterator itself will be treated as an object, becoming a `Seq.Keyed`,
   * which is usually not what you want. You should turn your Iterator Object into
   * an iterable object by defining a Symbol.iterator (or @@iterator) method which
   * returns `this`.
   *
   * Note: `Seq` is a conversion function and not a class, and does not use the
   * `new` keyword during construction.
   */
  declare function Seq<S extends Seq<any, any>>(seq: S): S;
  declare function Seq<K, V>(collection: Collection$1.Keyed<K, V>): Seq.Keyed<K, V>;
  declare function Seq<T>(collection: Collection$1.Indexed<T>): Seq.Indexed<T>;
  declare function Seq<T>(collection: Collection$1.Set<T>): Seq.Set<T>;
  declare function Seq<T>(collection: Iterable<T>): Seq.Indexed<T>;
  declare function Seq<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
  declare function Seq(): Seq<any, any>;

  interface Seq<K, V> extends Collection$1<K, V> {

    /**
     * Some Seqs can describe their size lazily. When this is the case,
     * size will be an integer. Otherwise it will be undefined.
     *
     * For example, Seqs returned from `map()` or `reverse()`
     * preserve the size of the original `Seq` while `filter()` does not.
     *
     * Note: `Range`, `Repeat` and `Seq`s made from `Array`s and `Object`s will
     * always have a size.
     */
    readonly size: number | undefined;


    // Force evaluation

    /**
     * Because Sequences are lazy and designed to be chained together, they do
     * not cache their results. For example, this map function is called a total
     * of 6 times, as each `join` iterates the Seq of three values.
     *
     *     var squares = Seq([ 1, 2, 3 ]).map(x => x * x)
     *     squares.join() + squares.join()
     *
     * If you know a `Seq` will be used multiple times, it may be more
     * efficient to first cache it in memory. Here, the map function is called
     * only 3 times.
     *
     *     var squares = Seq([ 1, 2, 3 ]).map(x => x * x).cacheResult()
     *     squares.join() + squares.join()
     *
     * Use this method judiciously, as it must fully evaluate a Seq which can be
     * a burden on memory and possibly performance.
     *
     * Note: after calling `cacheResult`, a Seq will always have a `size`.
     */
    cacheResult(): this;

    // Sequence algorithms

    /**
     * Returns a new Seq with values passed through a
     * `mapper` function.
     *
     * ```js
     * const { Seq } = require('immutable')
     * Seq([ 1, 2 ]).map(x => 10 * x)
     * // Seq [ 10, 20 ]
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Seq<K, M>;

    /**
     * Returns a new Seq with values passed through a
     * `mapper` function.
     *
     * ```js
     * const { Seq } = require('immutable')
     * Seq([ 1, 2 ]).map(x => 10 * x)
     * // Seq [ 10, 20 ]
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     * Note: used only for sets.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Seq<M, M>;

    /**
     * Flat-maps the Seq, returning a Seq of the same type.
     *
     * Similar to `seq.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: V, key: K, iter: this) => Iterable<M>,
      context?: any
    ): Seq<K, M>;

    /**
     * Flat-maps the Seq, returning a Seq of the same type.
     *
     * Similar to `seq.map(...).flatten(true)`.
     * Note: Used only for sets.
     */
    flatMap<M>(
      mapper: (value: V, key: K, iter: this) => Iterable<M>,
      context?: any
    ): Seq<M, M>;

    /**
     * Returns a new Seq with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Seq<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;
  }

  /**
   * The `Collection` is a set of (key, value) entries which can be iterated, and
   * is the base class for all collections in `immutable`, allowing them to
   * make use of all the Collection methods (such as `map` and `filter`).
   *
   * Note: A collection is always iterated in the same order, however that order
   * may not always be well defined, as is the case for the `Map` and `Set`.
   *
   * Collection is the abstract base class for concrete data structures. It
   * cannot be constructed directly.
   *
   * Implementations should extend one of the subclasses, `Collection.Keyed`,
   * `Collection.Indexed`, or `Collection.Set`.
   */
  declare module Collection$1 {

    /**
     * @deprecated use `const { isKeyed } = require('immutable')`
     */
    function isKeyed(maybeKeyed: any): maybeKeyed is Collection$1.Keyed<any, any>;

    /**
     * @deprecated use `const { isIndexed } = require('immutable')`
     */
    function isIndexed(maybeIndexed: any): maybeIndexed is Collection$1.Indexed<any>;

    /**
     * @deprecated use `const { isAssociative } = require('immutable')`
     */
    function isAssociative(maybeAssociative: any): maybeAssociative is Collection$1.Keyed<any, any> | Collection$1.Indexed<any>;

    /**
     * @deprecated use `const { isOrdered } = require('immutable')`
     */
    function isOrdered(maybeOrdered: any): boolean;


    /**
     * Keyed Collections have discrete keys tied to each value.
     *
     * When iterating `Collection.Keyed`, each iteration will yield a `[K, V]`
     * tuple, in other words, `Collection#entries` is the default iterator for
     * Keyed Collections.
     */
    export module Keyed {}

    /**
     * Creates a Collection.Keyed
     *
     * Similar to `Collection()`, however it expects collection-likes of [K, V]
     * tuples if not constructed from a Collection.Keyed or JS Object.
     *
     * Note: `Collection.Keyed` is a conversion function and not a class, and
     * does not use the `new` keyword during construction.
     */
    export function Keyed<K, V>(collection: Iterable<[K, V]>): Collection$1.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Collection$1.Keyed<string, V>;

    export interface Keyed<K, V> extends Collection$1<K, V> {
      /**
       * Deeply converts this Keyed collection to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJS(): Object;

      /**
       * Shallowly converts this Keyed collection to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJSON(): { [key: string]: V };

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<[K, V]>;

      /**
       * Returns Seq.Keyed.
       * @override
       */
      toSeq(): Seq.Keyed<K, V>;


      // Sequence functions

      /**
       * Returns a new Collection.Keyed of the same type where the keys and values
       * have been flipped.
       *
       * <!-- runkit:activate -->
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 'z', b: 'y' }).flip()
       * // Map { "z": "a", "y": "b" }
       * ```
       */
      flip(): Collection$1.Keyed<V, K>;

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Collection$1.Keyed<K | KC, V | VC>;
      concat<C>(...collections: Array<{[key: string]: C}>): Collection$1.Keyed<K | string, V | C>;

      /**
       * Returns a new Collection.Keyed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Collection } = require('immutable')
       * Collection.Keyed({ a: 1, b: 2 }).map(x => 10 * x)
       * // Seq { "a": 10, "b": 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: V, key: K, iter: this) => M,
        context?: any
      ): Collection$1.Keyed<K, M>;

      /**
       * Returns a new Collection.Keyed of the same type with keys passed through
       * a `mapper` function.
       *
       * <!-- runkit:activate -->
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 1, b: 2 }).mapKeys(x => x.toUpperCase())
       * // Map { "A": 1, "B": 2 }
       * ```
       *
       * Note: `mapKeys()` always returns a new instance, even if it produced
       * the same key at every step.
       */
      mapKeys<M>(
        mapper: (key: K, value: V, iter: this) => M,
        context?: any
      ): Collection$1.Keyed<M, V>;

      /**
       * Returns a new Collection.Keyed of the same type with entries
       * ([key, value] tuples) passed through a `mapper` function.
       *
       * <!-- runkit:activate -->
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 1, b: 2 })
       *   .mapEntries(([ k, v ]) => [ k.toUpperCase(), v * 2 ])
       * // Map { "A": 2, "B": 4 }
       * ```
       *
       * Note: `mapEntries()` always returns a new instance, even if it produced
       * the same entry at every step.
       */
      mapEntries<KM, VM>(
        mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
        context?: any
      ): Collection$1.Keyed<KM, VM>;

      /**
       * Flat-maps the Collection, returning a Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<KM, VM>(
        mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
        context?: any
      ): Collection$1.Keyed<KM, VM>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends V>(
        predicate: (value: V, key: K, iter: this) => value is F,
        context?: any
      ): Collection$1.Keyed<K, F>;
      filter(
        predicate: (value: V, key: K, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<[K, V]>;
    }


    /**
     * Indexed Collections have incrementing numeric keys. They exhibit
     * slightly different behavior than `Collection.Keyed` for some methods in order
     * to better mirror the behavior of JavaScript's `Array`, and add methods
     * which do not make sense on non-indexed Collections such as `indexOf`.
     *
     * Unlike JavaScript arrays, `Collection.Indexed`s are always dense. "Unset"
     * indices and `undefined` indices are indistinguishable, and all indices from
     * 0 to `size` are visited when iterated.
     *
     * All Collection.Indexed methods return re-indexed Collections. In other words,
     * indices always start at 0 and increment until size. If you wish to
     * preserve indices, using them as keys, convert to a Collection.Keyed by
     * calling `toKeyedSeq`.
     */
    export module Indexed {}

    /**
     * Creates a new Collection.Indexed.
     *
     * Note: `Collection.Indexed` is a conversion function and not a class, and
     * does not use the `new` keyword during construction.
     */
    export function Indexed<T>(collection: Iterable<T>): Collection$1.Indexed<T>;

    export interface Indexed<T> extends Collection$1<number, T> {
      /**
       * Deeply converts this Indexed collection to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Indexed collection to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<T>;

      // Reading values

      /**
       * Returns the value associated with the provided index, or notSetValue if
       * the index is beyond the bounds of the Collection.
       *
       * `index` may be a negative number, which indexes back from the end of the
       * Collection. `s.get(-1)` gets the last item in the Collection.
       */
      get<NSV>(index: number, notSetValue: NSV): T | NSV;
      get(index: number): T | undefined;


      // Conversion to Seq

      /**
       * Returns Seq.Indexed.
       * @override
       */
      toSeq(): Seq.Indexed<T>;

      /**
       * If this is a collection of [key, value] entry tuples, it will return a
       * Seq.Keyed of those entries.
       */
      fromEntrySeq(): Seq.Keyed<any, any>;


      // Combination

      /**
       * Returns a Collection of the same type with `separator` between each item
       * in this Collection.
       */
      interpose(separator: T): this;

      /**
       * Returns a Collection of the same type with the provided `collections`
       * interleaved into this collection.
       *
       * The resulting Collection includes the first item from each, then the
       * second from each, etc.
       *
       * <!-- runkit:activate
       *      { "preamble": "require('immutable')"}
       * -->
       * ```js
       * const { List } = require('immutable')
       * List([ 1, 2, 3 ]).interleave(List([ 'A', 'B', 'C' ]))
       * // List [ 1, "A", 2, "B", 3, "C"" ]
       * ```
       *
       * The shortest Collection stops interleave.
       *
       * <!-- runkit:activate
       *      { "preamble": "const { List } = require('immutable')" }
       * -->
       * ```js
       * List([ 1, 2, 3 ]).interleave(
       *   List([ 'A', 'B' ]),
       *   List([ 'X', 'Y', 'Z' ])
       * )
       * // List [ 1, "A", "X", 2, "B", "Y"" ]
       * ```
       *
       * Since `interleave()` re-indexes values, it produces a complete copy,
       * which has `O(N)` complexity.
       *
       * Note: `interleave` *cannot* be used in `withMutations`.
       */
      interleave(...collections: Array<Collection$1<any, T>>): this;

      /**
       * Splice returns a new indexed Collection by replacing a region of this
       * Collection with new values. If values are not provided, it only skips the
       * region to be removed.
       *
       * `index` may be a negative number, which indexes back from the end of the
       * Collection. `s.splice(-2)` splices after the second to last item.
       *
       * <!-- runkit:activate -->
       * ```js
       * const { List } = require('immutable')
       * List([ 'a', 'b', 'c', 'd' ]).splice(1, 2, 'q', 'r', 's')
       * // List [ "a", "q", "r", "s", "d" ]
       * ```
       *
       * Since `splice()` re-indexes values, it produces a complete copy, which
       * has `O(N)` complexity.
       *
       * Note: `splice` *cannot* be used in `withMutations`.
       */
      splice(
        index: number,
        removeNum: number,
        ...values: Array<T>
      ): this;

      /**
       * Returns a Collection of the same type "zipped" with the provided
       * collections.
       *
       * Like `zipWith`, but using the default `zipper`: creating an `Array`.
       *
       *
       * <!-- runkit:activate
       *      { "preamble": "const { List } = require('immutable')" }
       * -->
       * ```js
       * const a = List([ 1, 2, 3 ]);
       * const b = List([ 4, 5, 6 ]);
       * const c = a.zip(b); // List [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
       * ```
       */
      zip<U>(other: Collection$1<any, U>): Collection$1.Indexed<[T,U]>;
      zip<U,V>(other: Collection$1<any, U>, other2: Collection$1<any, V>): Collection$1.Indexed<[T,U,V]>;
      zip(...collections: Array<Collection$1<any, any>>): Collection$1.Indexed<any>;

      /**
       * Returns a Collection "zipped" with the provided collections.
       *
       * Unlike `zip`, `zipAll` continues zipping until the longest collection is
       * exhausted. Missing values from shorter collections are filled with `undefined`.
       *
       * ```js
       * const a = List([ 1, 2 ]);
       * const b = List([ 3, 4, 5 ]);
       * const c = a.zipAll(b); // List [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
       * ```
       */
      zipAll<U>(other: Collection$1<any, U>): Collection$1.Indexed<[T,U]>;
      zipAll<U,V>(other: Collection$1<any, U>, other2: Collection$1<any, V>): Collection$1.Indexed<[T,U,V]>;
      zipAll(...collections: Array<Collection$1<any, any>>): Collection$1.Indexed<any>;

      /**
       * Returns a Collection of the same type "zipped" with the provided
       * collections by using a custom `zipper` function.
       *
       * <!-- runkit:activate
       *      { "preamble": "const { List } = require('immutable')" }
       * -->
       * ```js
       * const a = List([ 1, 2, 3 ]);
       * const b = List([ 4, 5, 6 ]);
       * const c = a.zipWith((a, b) => a + b, b);
       * // List [ 5, 7, 9 ]
       * ```
       */
      zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection$1<any, U>
      ): Collection$1.Indexed<Z>;
      zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection$1<any, U>,
        thirdCollection: Collection$1<any, V>
      ): Collection$1.Indexed<Z>;
      zipWith<Z>(
        zipper: (...any: Array<any>) => Z,
        ...collections: Array<Collection$1<any, any>>
      ): Collection$1.Indexed<Z>;


      // Search for value

      /**
       * Returns the first index at which a given value can be found in the
       * Collection, or -1 if it is not present.
       */
      indexOf(searchValue: T): number;

      /**
       * Returns the last index at which a given value can be found in the
       * Collection, or -1 if it is not present.
       */
      lastIndexOf(searchValue: T): number;

      /**
       * Returns the first index in the Collection where a value satisfies the
       * provided predicate function. Otherwise -1 is returned.
       */
      findIndex(
        predicate: (value: T, index: number, iter: this) => boolean,
        context?: any
      ): number;

      /**
       * Returns the last index in the Collection where a value satisfies the
       * provided predicate function. Otherwise -1 is returned.
       */
      findLastIndex(
        predicate: (value: T, index: number, iter: this) => boolean,
        context?: any
      ): number;

      // Sequence algorithms

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Collection$1.Indexed<T | C>;

      /**
       * Returns a new Collection.Indexed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Collection } = require('immutable')
       * Collection.Indexed([1,2]).map(x => 10 * x)
       * // Seq [ 1, 2 ]
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: number, iter: this) => M,
        context?: any
      ): Collection$1.Indexed<M>;

      /**
       * Flat-maps the Collection, returning a Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        context?: any
      ): Collection$1.Indexed<M>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        context?: any
      ): Collection$1.Indexed<F>;
      filter(
        predicate: (value: T, index: number, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<T>;
    }


    /**
     * Set Collections only represent values. They have no associated keys or
     * indices. Duplicate values are possible in the lazy `Seq.Set`s, however
     * the concrete `Set` Collection does not allow duplicate values.
     *
     * Collection methods on Collection.Set such as `map` and `forEach` will provide
     * the value as both the first and second arguments to the provided function.
     *
     * ```js
     * const { Collection } = require('immutable')
     * const seq = Collection.Set([ 'A', 'B', 'C' ])
     * // Seq { "A", "B", "C" }
     * seq.forEach((v, k) =>
     *  assert.equal(v, k)
     * )
     * ```
     */
    export module Set {}

    /**
     * Similar to `Collection()`, but always returns a Collection.Set.
     *
     * Note: `Collection.Set` is a factory function and not a class, and does
     * not use the `new` keyword during construction.
     */
    export function Set<T>(collection: Iterable<T>): Collection$1.Set<T>;

    export interface Set<T> extends Collection$1<T, T> {
      /**
       * Deeply converts this Set collection to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Set collection to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Shallowly converts this collection to an Array.
       */
      toArray(): Array<T>;

      /**
       * Returns Seq.Set.
       * @override
       */
      toSeq(): Seq.Set<T>;

      // Sequence algorithms

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<U>(...collections: Array<Iterable<U>>): Collection$1.Set<T | U>;

      /**
       * Returns a new Collection.Set with values passed through a
       * `mapper` function.
       *
       * ```
       * Collection.Set([ 1, 2 ]).map(x => 10 * x)
       * // Seq { 1, 2 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: T, iter: this) => M,
        context?: any
      ): Collection$1.Set<M>;

      /**
       * Flat-maps the Collection, returning a Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: T, iter: this) => Iterable<M>,
        context?: any
      ): Collection$1.Set<M>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, key: T, iter: this) => value is F,
        context?: any
      ): Collection$1.Set<F>;
      filter(
        predicate: (value: T, key: T, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<T>;
    }

  }

  /**
   * Creates a Collection.
   *
   * The type of Collection created is based on the input.
   *
   *   * If an `Collection`, that same `Collection`.
   *   * If an Array-like, an `Collection.Indexed`.
   *   * If an Object with an Iterator defined, an `Collection.Indexed`.
   *   * If an Object, an `Collection.Keyed`.
   *
   * This methods forces the conversion of Objects and Strings to Collections.
   * If you want to ensure that a Collection of one item is returned, use
   * `Seq.of`.
   *
   * Note: An Iterator itself will be treated as an object, becoming a `Seq.Keyed`,
   * which is usually not what you want. You should turn your Iterator Object into
   * an iterable object by defining a Symbol.iterator (or @@iterator) method which
   * returns `this`.
   *
   * Note: `Collection` is a conversion function and not a class, and does not
   * use the `new` keyword during construction.
   */
  declare function Collection$1<I extends Collection$1<any, any>>(collection: I): I;
  declare function Collection$1<T>(collection: Iterable<T>): Collection$1.Indexed<T>;
  declare function Collection$1<V>(obj: {[key: string]: V}): Collection$1.Keyed<string, V>;

  interface Collection$1<K, V> extends ValueObject {

    // Value equality

    /**
     * True if this and the other Collection have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: any): boolean;

    /**
     * Computes and returns the hashed identity for this Collection.
     *
     * The `hashCode` of a Collection is used to determine potential equality,
     * and is used when adding this to a `Set` or as a key in a `Map`, enabling
     * lookup via a different instance.
     *
     * <!-- runkit:activate
     *      { "preamble": "const { Set,  List } = require('immutable')" }
     * -->
     * ```js
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 1, 2, 3 ]);
     * assert.notStrictEqual(a, b); // different instances
     * const set = Set([ a ]);
     * assert.equal(set.has(b), true);
     * ```
     *
     * If two values have the same `hashCode`, they are [not guaranteed
     * to be equal][Hash Collision]. If two values have different `hashCode`s,
     * they must not be equal.
     *
     * [Hash Collision]: http://en.wikipedia.org/wiki/Collision_(computer_science)
     */
    hashCode(): number;


    // Reading values

    /**
     * Returns the value associated with the provided key, or notSetValue if
     * the Collection does not contain this key.
     *
     * Note: it is possible a key may be associated with an `undefined` value,
     * so if `notSetValue` is not provided and this method returns `undefined`,
     * that does not guarantee the key was not found.
     */
    get<NSV>(key: K, notSetValue: NSV): V | NSV;
    get(key: K): V | undefined;

    /**
     * True if a key exists within this `Collection`, using `Immutable.is`
     * to determine equality
     */
    has(key: K): boolean;

    /**
     * True if a value exists within this `Collection`, using `Immutable.is`
     * to determine equality
     * @alias contains
     */
    includes(value: V): boolean;
    contains(value: V): boolean;

    /**
     * In case the `Collection` is not empty returns the first element of the
     * `Collection`.
     * In case the `Collection` is empty returns the optional default
     * value if provided, if no default value is provided returns undefined.
     */
    first<NSV>(notSetValue?: NSV): V | NSV;

    /**
     * In case the `Collection` is not empty returns the last element of the
     * `Collection`.
     * In case the `Collection` is empty returns the optional default
     * value if provided, if no default value is provided returns undefined.
     */
    last<NSV>(notSetValue?: NSV): V | NSV;

    // Reading deep values

    /**
     * Returns the value found by following a path of keys or indices through
     * nested Collections.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map, List } = require('immutable')
     * const deepData = Map({ x: List([ Map({ y: 123 }) ]) });
     * deepData.getIn(['x', 0, 'y']) // 123
     * ```
     *
     * Plain JavaScript Object or Arrays may be nested within an Immutable.js
     * Collection, and getIn() can access those values as well:
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map, List } = require('immutable')
     * const deepData = Map({ x: [ { y: 123 } ] });
     * deepData.getIn(['x', 0, 'y']) // 123
     * ```
     */
    getIn(searchKeyPath: Iterable<any>, notSetValue?: any): any;

    /**
     * True if the result of following a path of keys or indices through nested
     * Collections results in a set value.
     */
    hasIn(searchKeyPath: Iterable<any>): boolean;

    // Persistent changes

    /**
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum a Seq after mapping and filtering:
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Seq } = require('immutable')
     *
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * Seq([ 1, 2, 3 ])
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     */
    update<R>(updater: (value: this) => R): R;


    // Conversion to JavaScript types

    /**
     * Deeply converts this Collection to equivalent native JavaScript Array or Object.
     *
     * `Collection.Indexed`, and `Collection.Set` become `Array`, while
     * `Collection.Keyed` become `Object`, converting keys to Strings.
     */
    toJS(): Array<any> | { [key: string]: any };

    /**
     * Shallowly converts this Collection to equivalent native JavaScript Array or Object.
     *
     * `Collection.Indexed`, and `Collection.Set` become `Array`, while
     * `Collection.Keyed` become `Object`, converting keys to Strings.
     */
    toJSON(): Array<V> | { [key: string]: V };

    /**
     * Shallowly converts this collection to an Array.
     *
     * `Collection.Indexed`, and `Collection.Set` produce an Array of values.
     * `Collection.Keyed` produce an Array of [key, value] tuples.
     */
    toArray(): Array<V> | Array<[K, V]>;

    /**
     * Shallowly converts this Collection to an Object.
     *
     * Converts keys to Strings.
     */
    toObject(): { [key: string]: V };


    // Conversion to Collections

    /**
     * Converts this Collection to a Map, Throws if keys are not hashable.
     *
     * Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toMap(): Map<K, V>;

    /**
     * Converts this Collection to a Map, maintaining the order of iteration.
     *
     * Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but
     * provided for convenience and to allow for chained expressions.
     */
    toOrderedMap(): OrderedMap<K, V>;

    /**
     * Converts this Collection to a Set, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Set(this)`, but provided to allow for
     * chained expressions.
     */
    toSet(): Set$1<V>;

    /**
     * Converts this Collection to a Set, maintaining the order of iteration and
     * discarding keys.
     *
     * Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toOrderedSet(): OrderedSet<V>;

    /**
     * Converts this Collection to a List, discarding keys.
     *
     * This is similar to `List(collection)`, but provided to allow for chained
     * expressions. However, when called on `Map` or other keyed collections,
     * `collection.toList()` discards the keys and creates a list of only the
     * values, whereas `List(collection)` creates a list of entry tuples.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map, List } = require('immutable')
     * var myMap = Map({ a: 'Apple', b: 'Banana' })
     * List(myMap) // List [ [ "a", "Apple" ], [ "b", "Banana" ] ]
     * myMap.toList() // List [ "Apple", "Banana" ]
     * ```
     */
    toList(): List<V>;

    /**
     * Converts this Collection to a Stack, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Stack(this)`, but provided to allow for
     * chained expressions.
     */
    toStack(): Stack<V>;


    // Conversion to Seq

    /**
     * Converts this Collection to a Seq of the same kind (indexed,
     * keyed, or set).
     */
    toSeq(): Seq<K, V>;

    /**
     * Returns a Seq.Keyed from this Collection where indices are treated as keys.
     *
     * This is useful if you want to operate on an
     * Collection.Indexed and preserve the [index, value] pairs.
     *
     * The returned Seq will have identical iteration order as
     * this Collection.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Seq } = require('immutable')
     * const indexedSeq = Seq([ 'A', 'B', 'C' ])
     * // Seq [ "A", "B", "C" ]
     * indexedSeq.filter(v => v === 'B')
     * // Seq [ "B" ]
     * const keyedSeq = indexedSeq.toKeyedSeq()
     * // Seq { 0: "A", 1: "B", 2: "C" }
     * keyedSeq.filter(v => v === 'B')
     * // Seq { 1: "B" }
     * ```
     */
    toKeyedSeq(): Seq.Keyed<K, V>;

    /**
     * Returns an Seq.Indexed of the values of this Collection, discarding keys.
     */
    toIndexedSeq(): Seq.Indexed<V>;

    /**
     * Returns a Seq.Set of the values of this Collection, discarding keys.
     */
    toSetSeq(): Seq.Set<V>;


    // Iterators

    /**
     * An iterator of this `Collection`'s keys.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `keySeq` instead, if this is
     * what you want.
     */
    keys(): IterableIterator<K>;

    /**
     * An iterator of this `Collection`'s values.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `valueSeq` instead, if this is
     * what you want.
     */
    values(): IterableIterator<V>;

    /**
     * An iterator of this `Collection`'s entries as `[ key, value ]` tuples.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `entrySeq` instead, if this is
     * what you want.
     */
    entries(): IterableIterator<[K, V]>;


    // Collections (Seq)

    /**
     * Returns a new Seq.Indexed of the keys of this Collection,
     * discarding values.
     */
    keySeq(): Seq.Indexed<K>;

    /**
     * Returns an Seq.Indexed of the values of this Collection, discarding keys.
     */
    valueSeq(): Seq.Indexed<V>;

    /**
     * Returns a new Seq.Indexed of [key, value] tuples.
     */
    entrySeq(): Seq.Indexed<[K, V]>;


    // Sequence algorithms

    /**
     * Returns a new Collection of the same type with values passed through a
     * `mapper` function.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Collection } = require('immutable')
     * Collection({ a: 1, b: 2 }).map(x => 10 * x)
     * // Seq { "a": 10, "b": 20 }
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Collection$1<K, M>;

    /**
     * Note: used only for sets, which return Collection<M, M> but are otherwise
     * identical to normal `map()`.
     *
     * @ignore
     */
    map<M>(...args: never[]): any;

    /**
     * Returns a new Collection of the same type with only the entries for which
     * the `predicate` function returns true.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map({ a: 1, b: 2, c: 3, d: 4}).filter(x => x % 2 === 0)
     * // Map { "b": 2, "d": 4 }
     * ```
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Collection$1<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type with only the entries for which
     * the `predicate` function returns false.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map({ a: 1, b: 2, c: 3, d: 4}).filterNot(x => x % 2 === 0)
     * // Map { "a": 1, "c": 3 }
     * ```
     *
     * Note: `filterNot()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filterNot(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type in reverse order.
     */
    reverse(): this;

    /**
     * Returns a new Collection of the same type which includes the same entries,
     * stably sorted by using a `comparator`.
     *
     * If a `comparator` is not provided, a default comparator uses `<` and `>`.
     *
     * `comparator(valueA, valueB)`:
     *
     *   * Returns `0` if the elements should not be swapped.
     *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
     *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
     *   * Is pure, i.e. it must always return the same value for the same pair
     *     of values.
     *
     * When sorting collections which have no defined order, their ordered
     * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { Map } = require('immutable')
     * Map({ "c": 3, "a": 1, "b": 2 }).sort((a, b) => {
     *   if (a < b) { return -1; }
     *   if (a > b) { return 1; }
     *   if (a === b) { return 0; }
     * });
     * // OrderedMap { "a": 1, "b": 2, "c": 3 }
     * ```
     *
     * Note: `sort()` Always returns a new instance, even if the original was
     * already sorted.
     *
     * Note: This is always an eager operation.
     */
    sort(comparator?: (valueA: V, valueB: V) => number): this;

    /**
     * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
     * sorting by more sophisticated means:
     *
     *     hitters.sortBy(hitter => hitter.avgHits)
     *
     * Note: `sortBy()` Always returns a new instance, even if the original was
     * already sorted.
     *
     * Note: This is always an eager operation.
     */
    sortBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): this;

    /**
     * Returns a `Collection.Keyed` of `Collection.Keyeds`, grouped by the return
     * value of the `grouper` function.
     *
     * Note: This is always an eager operation.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List, Map } = require('immutable')
     * const listOfMaps = List([
     *   Map({ v: 0 }),
     *   Map({ v: 1 }),
     *   Map({ v: 1 }),
     *   Map({ v: 0 }),
     *   Map({ v: 2 })
     * ])
     * const groupsOfMaps = listOfMaps.groupBy(x => x.get('v'))
     * // Map {
     * //   0: List [ Map{ "v": 0 }, Map { "v": 0 } ],
     * //   1: List [ Map{ "v": 1 }, Map { "v": 1 } ],
     * //   2: List [ Map{ "v": 2 } ],
     * // }
     * ```
     */
    groupBy<G>(
      grouper: (value: V, key: K, iter: this) => G,
      context?: any
    ): /*Map*/Seq.Keyed<G, /*this*/Collection$1<K, V>>;


    // Side effects

    /**
     * The `sideEffect` is executed for every entry in the Collection.
     *
     * Unlike `Array#forEach`, if any call of `sideEffect` returns
     * `false`, the iteration will stop. Returns the number of entries iterated
     * (including the last iteration which returned false).
     */
    forEach(
      sideEffect: (value: V, key: K, iter: this) => any,
      context?: any
    ): number;


    // Creating subsets

    /**
     * Returns a new Collection of the same type representing a portion of this
     * Collection from start up to but not including end.
     *
     * If begin is negative, it is offset from the end of the Collection. e.g.
     * `slice(-2)` returns a Collection of the last two entries. If it is not
     * provided the new Collection will begin at the beginning of this Collection.
     *
     * If end is negative, it is offset from the end of the Collection. e.g.
     * `slice(0, -1)` returns a Collection of everything but the last entry. If
     * it is not provided, the new Collection will continue through the end of
     * this Collection.
     *
     * If the requested slice is equivalent to the current Collection, then it
     * will return itself.
     */
    slice(begin?: number, end?: number): this;

    /**
     * Returns a new Collection of the same type containing all entries except
     * the first.
     */
    rest(): this;

    /**
     * Returns a new Collection of the same type containing all entries except
     * the last.
     */
    butLast(): this;

    /**
     * Returns a new Collection of the same type which excludes the first `amount`
     * entries from this Collection.
     */
    skip(amount: number): this;

    /**
     * Returns a new Collection of the same type which excludes the last `amount`
     * entries from this Collection.
     */
    skipLast(amount: number): this;

    /**
     * Returns a new Collection of the same type which includes entries starting
     * from when `predicate` first returns false.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .skipWhile(x => x.match(/g/))
     * // List [ "cat", "hat", "god"" ]
     * ```
     */
    skipWhile(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type which includes entries starting
     * from when `predicate` first returns true.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .skipUntil(x => x.match(/hat/))
     * // List [ "hat", "god"" ]
     * ```
     */
    skipUntil(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type which includes the first `amount`
     * entries from this Collection.
     */
    take(amount: number): this;

    /**
     * Returns a new Collection of the same type which includes the last `amount`
     * entries from this Collection.
     */
    takeLast(amount: number): this;

    /**
     * Returns a new Collection of the same type which includes entries from this
     * Collection as long as the `predicate` returns true.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .takeWhile(x => x.match(/o/))
     * // List [ "dog", "frog" ]
     * ```
     */
    takeWhile(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type which includes entries from this
     * Collection as long as the `predicate` returns false.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .takeUntil(x => x.match(/at/))
     * // List [ "dog", "frog" ]
     * ```
     */
    takeUntil(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;


    // Combination

    /**
     * Returns a new Collection of the same type with other values and
     * collection-like concatenated to this one.
     *
     * For Seqs, all entries will be present in the resulting Seq, even if they
     * have the same key.
     */
    concat(...valuesOrCollections: Array<any>): Collection$1<any, any>;

    /**
     * Flattens nested Collections.
     *
     * Will deeply flatten the Collection by default, returning a Collection of the
     * same type, but a `depth` can be provided in the form of a number or
     * boolean (where true means to shallowly flatten one level). A depth of 0
     * (or shallow: false) will deeply flatten.
     *
     * Flattens only others Collection, not Arrays or Objects.
     *
     * Note: `flatten(true)` operates on Collection<any, Collection<K, V>> and
     * returns Collection<K, V>
     */
    flatten(depth?: number): Collection$1<any, any>;
    flatten(shallow?: boolean): Collection$1<any, any>;

    /**
     * Flat-maps the Collection, returning a Collection of the same type.
     *
     * Similar to `collection.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: V, key: K, iter: this) => Iterable<M>,
      context?: any
    ): Collection$1<K, M>;

    /**
     * Flat-maps the Collection, returning a Collection of the same type.
     *
     * Similar to `collection.map(...).flatten(true)`.
     * Used for Dictionaries only.
     */
    flatMap<KM, VM>(
      mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
      context?: any
    ): Collection$1<KM, VM>;

    // Reducing a value

    /**
     * Reduces the Collection to a value by calling the `reducer` for every entry
     * in the Collection and passing along the reduced value.
     *
     * If `initialReduction` is not provided, the first item in the
     * Collection will be used.
     *
     * @see `Array#reduce`.
     */
    reduce<R>(
      reducer: (reduction: R, value: V, key: K, iter: this) => R,
      initialReduction: R,
      context?: any
    ): R;
    reduce<R>(
      reducer: (reduction: V | R, value: V, key: K, iter: this) => R
    ): R;

    /**
     * Reduces the Collection in reverse (from the right side).
     *
     * Note: Similar to this.reverse().reduce(), and provided for parity
     * with `Array#reduceRight`.
     */
    reduceRight<R>(
      reducer: (reduction: R, value: V, key: K, iter: this) => R,
      initialReduction: R,
      context?: any
    ): R;
    reduceRight<R>(
      reducer: (reduction: V | R, value: V, key: K, iter: this) => R
    ): R;

    /**
     * True if `predicate` returns true for all entries in the Collection.
     */
    every(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): boolean;

    /**
     * True if `predicate` returns true for any entry in the Collection.
     */
    some(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): boolean;

    /**
     * Joins values together as a string, inserting a separator between each.
     * The default separator is `","`.
     */
    join(separator?: string): string;

    /**
     * Returns true if this Collection includes no values.
     *
     * For some lazy `Seq`, `isEmpty` might need to iterate to determine
     * emptiness. At most one iteration will occur.
     */
    isEmpty(): boolean;

    /**
     * Returns the size of this Collection.
     *
     * Regardless of if this Collection can describe its size lazily (some Seqs
     * cannot), this method will always return the correct size. E.g. it
     * evaluates a lazy `Seq` if necessary.
     *
     * If `predicate` is provided, then this returns the count of entries in the
     * Collection for which the `predicate` returns true.
     */
    count(): number;
    count(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): number;

    /**
     * Returns a `Seq.Keyed` of counts, grouped by the return value of
     * the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    countBy<G>(
      grouper: (value: V, key: K, iter: this) => G,
      context?: any
    ): Map<G, number>;


    // Search for value

    /**
     * Returns the first value for which the `predicate` returns true.
     */
    find(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): V | undefined;

    /**
     * Returns the last value for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLast(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): V | undefined;

    /**
     * Returns the first [key, value] entry for which the `predicate` returns true.
     */
    findEntry(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): [K, V] | undefined;

    /**
     * Returns the last [key, value] entry for which the `predicate`
     * returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastEntry(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): [K, V] | undefined;

    /**
     * Returns the key for which the `predicate` returns true.
     */
    findKey(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): K | undefined;

    /**
     * Returns the last key for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastKey(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): K | undefined;

    /**
     * Returns the key associated with the search value, or undefined.
     */
    keyOf(searchValue: V): K | undefined;

    /**
     * Returns the last key associated with the search value, or undefined.
     */
    lastKeyOf(searchValue: V): K | undefined;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Collection#sort`. If it is not
     * provided, the default comparator is `>`.
     *
     * When two values are considered equivalent, the first encountered will be
     * returned. Otherwise, `max` will operate independent of the order of input
     * as long as the comparator is commutative. The default comparator `>` is
     * commutative *only* when types do not differ.
     *
     * If `comparator` returns 0 and either value is NaN, undefined, or null,
     * that value will be returned.
     */
    max(comparator?: (valueA: V, valueB: V) => number): V | undefined;

    /**
     * Like `max`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.maxBy(hitter => hitter.avgHits);
     *
     */
    maxBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V | undefined;

    /**
     * Returns the minimum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Collection#sort`. If it is not
     * provided, the default comparator is `<`.
     *
     * When two values are considered equivalent, the first encountered will be
     * returned. Otherwise, `min` will operate independent of the order of input
     * as long as the comparator is commutative. The default comparator `<` is
     * commutative *only* when types do not differ.
     *
     * If `comparator` returns 0 and either value is NaN, undefined, or null,
     * that value will be returned.
     */
    min(comparator?: (valueA: V, valueB: V) => number): V | undefined;

    /**
     * Like `min`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.minBy(hitter => hitter.avgHits);
     *
     */
    minBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V | undefined;


    // Comparison

    /**
     * True if `iter` includes every value in this Collection.
     */
    isSubset(iter: Iterable<V>): boolean;

    /**
     * True if this Collection includes every value in `iter`.
     */
    isSuperset(iter: Iterable<V>): boolean;
  }

  /**
   * The interface to fulfill to qualify as a Value Object.
   */
  interface ValueObject {
    /**
     * True if this and the other Collection have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: any): boolean;

    /**
     * Computes and returns the hashed identity for this Collection.
     *
     * The `hashCode` of a Collection is used to determine potential equality,
     * and is used when adding this to a `Set` or as a key in a `Map`, enabling
     * lookup via a different instance.
     *
     * <!-- runkit:activate -->
     * ```js
     * const { List, Set } = require('immutable');
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 1, 2, 3 ]);
     * assert.notStrictEqual(a, b); // different instances
     * const set = Set([ a ]);
     * assert.equal(set.has(b), true);
     * ```
     *
     * Note: hashCode() MUST return a Uint32 number. The easiest way to
     * guarantee this is to return `myHash | 0` from a custom implementation.
     *
     * If two values have the same `hashCode`, they are [not guaranteed
     * to be equal][Hash Collision]. If two values have different `hashCode`s,
     * they must not be equal.
     *
     * Note: `hashCode()` is not guaranteed to always be called before
     * `equals()`. Most but not all Immutable.js collections use hash codes to
     * organize their internal data structures, while all Immutable.js
     * collections use equality during lookups.
     *
     * [Hash Collision]: http://en.wikipedia.org/wiki/Collision_(computer_science)
     */
    hashCode(): number;
  }

type IFunction<T = void> = (...args: Array<any>) => T;
type IObject$1 = Record<string, any>;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type Class<T> = new (...args: Array<any>) => T;

declare const TransformationMatrix_base: Record$1.Factory<{
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}>;
declare class TransformationMatrix extends TransformationMatrix_base {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    static defaultValues: IObject$1;
    static IDENTITY: TransformationMatrix;
    translate({ x: tx, y: ty }: {
        x: number;
        y: number;
    }): TransformationMatrix;
    translateX(tx: number): TransformationMatrix;
    translateY(ty: number): TransformationMatrix;
    scale(sx: number, sy?: number): TransformationMatrix;
    transform(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number): TransformationMatrix;
    rotate(degCW: number): TransformationMatrix;
    rotateRad(a: number): TransformationMatrix;
    inverse(): TransformationMatrix;
    toCssValue(): string;
    applyToPoint([x, y]: [number, number]): [number, number];
    applyToVector([x, y]: [number, number]): [number, number];
}

interface PointCtorProps {
    x?: number;
    y?: number;
    [k: string]: unknown;
}
declare const Point_base: Record$1.Factory<PointCtorProps>;
declare class Point extends Point_base {
    x: number;
    y: number;
    static defaultValues: IObject$1;
    constructor(options?: PointCtorProps);
    scale(sx: number, sy?: number): this;
    translate({ x: tx, y: ty }: {
        x: number;
        y: number;
    }): this;
    translateX(tx: number): this;
    translateY(ty: number): this;
    distance(other: this): number;
    rotate(deg: number): this;
    apply(matrix: TransformationMatrix): this;
}

interface IDrawingPoint extends PointCtorProps {
    intensity?: number;
}
declare class DrawingPoint extends Point {
    intensity: number;
    static defaultValues: IObject$1;
    constructor(options?: IDrawingPoint);
}

interface ISize {
    width: number;
    height: number;
}
declare const Size_base: Record$1.Factory<ISize>;
declare class Size extends Size_base {
    scale(factor: number): Size;
    ceil(): Size;
    floor(): Size;
    swapDimensions(): Size;
    apply(matrix: TransformationMatrix): Size;
}

interface IRect {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
}
declare const Rect_base: Record$1.Factory<IRect>;
declare class Rect extends Rect_base {
    left: number;
    top: number;
    width: number;
    height: number;
    static defaultValues: IObject$1;
    constructor(options?: IRect);
    get right(): number;
    get bottom(): number;
    static fromClientRect({ top, left, width, height }: ClientRect): Rect;
    static union(rects: List<Rect>): Rect;
    static getCenteredRect(inner: Size, outer: Size): Rect;
    static fromInset(inset: Inset): Rect;
    static fromPoints(...points: Point[]): Rect;
    expandToIncludePoints(...points: Point[]): Rect;
    static areRectsCloserThan(a: Rect, b: Rect, distance: number): boolean;
    static areVerticallyAligned(a: Rect, b: Rect, thresholdDistance: number): boolean;
    translate({ x: tx, y: ty }: Point): Rect;
    translateX(tx: number): Rect;
    translateY(ty: number): Rect;
    scale(sx: number, sy?: number): Rect;
    grow(growth: number): Rect;
    getLocation(): Point;
    getSize(): Size;
    getCenter(): Point;
    setLocation(location: Point): Rect;
    roundOverlap(): Rect;
    round(): Rect;
    isPointInside(point: Point): boolean;
    isRectInside(other: Rect): boolean;
    isRectOverlapping(other: Rect): boolean;
    normalize(): Rect;
    apply(matrix: TransformationMatrix): Rect;
}

interface IInset {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
declare const Inset_base: Record$1.Factory<IInset>;
declare class Inset extends Inset_base {
    static applyToRect(inset: Inset, rect: Rect): Rect;
    static fromRect(rect: Rect): Inset;
    static fromValue(insetValue: number): Inset;
    apply(matrix: TransformationMatrix): Inset;
    setScale(scale: number): Inset;
}
type InsetJSON = [left: number, top: number, right: number, bottom: number];

type ActionCtorProps = {
    subActions?: List<Action> | null;
};
declare abstract class Action extends InheritableImmutableRecord<ActionCtorProps> {
    subActions?: List<Action> | null | undefined;
    protected constructor(args?: ActionCtorProps);
}

type ActionTriggerEventType = 'onPointerEnter' | 'onPointerLeave' | 'onPointerDown' | 'onPointerUp' | 'onPageOpen' | 'onPageClose' | 'onPageVisible' | 'onPageHidden';

interface IGoToAction extends ActionCtorProps {
    pageIndex?: number;
}
declare class GoToAction extends Action {
    pageIndex: number;
    static defaultValues: IObject$1;
    constructor(args?: IGoToAction);
}

interface IGoToEmbeddedAction extends ActionCtorProps {
    newWindow?: boolean;
    relativePath?: string;
    targetType?: 'parent' | 'child';
}
declare class GoToEmbeddedAction extends Action {
    newWindow: boolean;
    relativePath: string;
    targetType: 'parent' | 'child';
    static defaultValues: IObject$1;
    constructor(args?: IGoToEmbeddedAction);
}

interface IGoToRemoteAction extends ActionCtorProps {
    relativePath?: string;
    namedDestination?: string;
}
declare class GoToRemoteAction extends Action {
    relativePath: string;
    namedDestination: string;
    static defaultValues: IObject$1;
    constructor(args?: IGoToRemoteAction);
}

type AnnotationReference = {
    fieldName: string;
} | {
    pdfObjectId: number;
};
interface IHideAction extends ActionCtorProps {
    hide?: boolean;
    annotationReferences?: List<AnnotationReference>;
}
declare class HideAction extends Action {
    hide: boolean;
    annotationReferences: List<AnnotationReference>;
    static defaultValues: IObject$1;
    constructor(args?: IHideAction);
}

interface IJavaScriptAction extends ActionCtorProps {
    script?: string;
}
declare class JavaScriptAction extends Action {
    script: string;
    static defaultValues: IObject$1;
    constructor(args?: IJavaScriptAction);
}

interface ILaunchAction extends ActionCtorProps {
    filePath?: string;
}
declare class LaunchAction extends Action {
    filePath: string;
    static defaultValues: IObject$1;
    constructor(args?: ILaunchAction);
}

interface INamedAction extends ActionCtorProps {
    action?: string;
}
declare class NamedAction extends Action {
    action: string;
    static defaultValues: IObject$1;
    constructor(args?: INamedAction);
}

interface IResetFormAction extends ActionCtorProps {
    fields?: List<string> | null | undefined;
    includeExclude?: boolean;
}
declare class ResetFormAction extends Action {
    fields: List<string> | null | undefined;
    includeExclude: boolean;
    static defaultValues: IObject$1;
    constructor(args?: IResetFormAction);
}

interface ISubmitFormAction extends ActionCtorProps {
    uri?: string;
    fields?: List<string>;
    includeExclude?: boolean;
    includeNoValueFields?: boolean;
    exportFormat?: boolean;
    getMethod?: boolean;
    submitCoordinated?: boolean;
    xfdf?: boolean;
    includeAppendSaves?: boolean;
    includeAnnotations?: boolean;
    submitPDF?: boolean;
    canonicalFormat?: boolean;
    excludeNonUserAnnotations?: boolean;
    excludeFKey?: boolean;
    embedForm?: boolean;
}
declare class SubmitFormAction extends Action {
    uri: string;
    fields: List<string> | null | undefined;
    includeExclude: boolean;
    includeNoValueFields: boolean;
    exportFormat: boolean;
    getMethod: boolean;
    submitCoordinated: boolean;
    xfdf: boolean;
    includeAppendSaves: boolean;
    includeAnnotations: boolean;
    submitPDF: boolean;
    canonicalFormat: boolean;
    excludeNonUserAnnotations: boolean;
    excludeFKey: boolean;
    embedForm: boolean;
    static defaultValues: IObject$1;
    constructor(args?: ISubmitFormAction);
}

interface IURIAction extends ActionCtorProps {
    uri?: string;
}
declare class URIAction extends Action {
    uri: string;
    static defaultValues: IObject$1;
    constructor(args?: IURIAction);
}

declare const Color_base: Record$1.Factory<{
    r: number;
    g: number;
    b: number;
    transparent: boolean;
}>;
declare class Color$2 extends Color_base {
    static BLACK: Color$2;
    static GREY: Color$2;
    static WHITE: Color$2;
    static DARK_BLUE: Color$2;
    static RED: Color$2;
    static PURPLE: Color$2;
    static PINK: Color$2;
    static GREEN: Color$2;
    static ORANGE: Color$2;
    static YELLOW: Color$2;
    static LIGHT_BLUE: Color$2;
    static LIGHT_RED: Color$2;
    static LIGHT_GREEN: Color$2;
    static LIGHT_YELLOW: Color$2;
    static BLUE: Color$2;
    static LIGHT_ORANGE: Color$2;
    static LIGHT_GREY: Color$2;
    static DARK_GREY: Color$2;
    static MAUVE: Color$2;
    static TRANSPARENT: Color$2;
    static fromHex: (hexColor: string) => Color$2;
    constructor(args: {
        r?: number;
        g?: number;
        b?: number;
        transparent?: boolean;
    });
    lighter(percent: number): Color$2;
    darker(percent: number): Color$2;
    equals(color: Color$2 | {
        r: number;
        g: number;
        b: number;
        transparent: boolean;
    }): boolean;
    saturate(percent: number): Color$2;
    sRGBToRGBComponent(RGBComponent: number): number;
    relativeLuminance(): number;
    contrastRatio(color: Color$2): number;
    toCSSValue(): string;
    toHex(): string;
}

declare const BlendMode: {
    readonly normal: "normal";
    readonly multiply: "multiply";
    readonly screen: "screen";
    readonly overlay: "overlay";
    readonly darken: "darken";
    readonly lighten: "lighten";
    readonly colorDodge: "colorDodge";
    readonly colorBurn: "colorBurn";
    readonly hardLight: "hardLight";
    readonly softLight: "softLight";
    readonly difference: "difference";
    readonly exclusion: "exclusion";
};
type IBlendMode = (typeof BlendMode)[keyof typeof BlendMode];

interface ITextMarkupAnnotation extends AnnotationProperties {
    rects: List<Rect>;
    color: Color$2;
    blendMode: IBlendMode;
}
declare class TextMarkupAnnotation<T extends ITextMarkupAnnotation = ITextMarkupAnnotation> extends Annotation<T> {
    rects: List<Rect>;
    color: Color$2;
    blendMode: IBlendMode;
    static defaultValues: IObject$1;
    static readableName: string;
}

interface IHighlightAnnotation extends ITextMarkupAnnotation {
    color: Color$2;
    blendMode: IBlendMode | 'multiply';
}
declare class HighlightAnnotation<T extends IHighlightAnnotation = IHighlightAnnotation> extends TextMarkupAnnotation<T> {
    blendMode: IBlendMode;
    static className: string;
    static readableName: string;
    static defaultValues: IObject$1;
}

interface IImageAnnotation extends AnnotationProperties {
    description: string | null;
    fileName: string | null;
    contentType: string | null;
    imageAttachmentId: string | null;
    isSignature: boolean;
    xfdfAppearanceStream: string | null;
    xfdfAppearanceStreamOriginalPageRotation: number | null;
}
declare class ImageAnnotation<T extends IImageAnnotation = IImageAnnotation> extends Annotation<T> {
    description: null | string;
    fileName: null | string;
    contentType: string;
    imageAttachmentId: string;
    isSignature: boolean;
    xfdfAppearanceStream: null | string;
    xfdfAppearanceStreamOriginalPageRotation: null | number;
    static defaultValues: IObject$1;
    static readableName: string;
}

interface IInkAnnotation extends AnnotationProperties {
    lines: List<List<DrawingPoint>>;
    lineWidth: number | null;
    strokeColor: Color$2 | null;
    backgroundColor: Color$2 | null;
    isDrawnNaturally: boolean;
    isSignature: boolean;
}
declare class InkAnnotation<T extends IInkAnnotation = IInkAnnotation> extends Annotation<T> {
    lines: List<List<DrawingPoint>>;
    lineWidth: number;
    strokeColor: Color$2 | null;
    backgroundColor: Color$2 | null;
    isDrawnNaturally: boolean;
    isSignature: boolean;
    static defaultValues: IObject$1;
    static readableName: string;
}

declare const MeasurementPrecision: {
    readonly WHOLE: "whole";
    readonly ONE: "oneDp";
    readonly TWO: "twoDp";
    readonly THREE: "threeDp";
    readonly FOUR: "fourDp";
    readonly HALVES: "1/2";
    readonly QUARTERS: "1/4";
    readonly EIGHTHS: "1/8";
    readonly SIXTEENTHS: "1/16";
};
type IMeasurementPrecision = (typeof MeasurementPrecision)[keyof typeof MeasurementPrecision];

declare const MeasurementScaleUnitFrom: {
    readonly INCHES: "in";
    readonly MILLIMETERS: "mm";
    readonly CENTIMETERS: "cm";
    readonly POINTS: "pt";
};
type IMeasurementScaleUnitFrom = (typeof MeasurementScaleUnitFrom)[keyof typeof MeasurementScaleUnitFrom];

declare const MeasurementScaleUnitTo: {
    readonly INCHES: "in";
    readonly MILLIMETERS: "mm";
    readonly CENTIMETERS: "cm";
    readonly POINTS: "pt";
    readonly FEET: "ft";
    readonly METERS: "m";
    readonly YARDS: "yd";
    readonly KILOMETERS: "km";
    readonly MILES: "mi";
};
type IMeasurementScaleUnitTo = (typeof MeasurementScaleUnitTo)[keyof typeof MeasurementScaleUnitTo];

interface IMeasurementScale {
    unitFrom: IMeasurementScaleUnitFrom;
    unitTo: IMeasurementScaleUnitTo;
    fromValue: number;
    toValue: number;
}
declare const MeasurementScale_base: Record$1.Factory<IMeasurementScale>;
declare class MeasurementScale extends MeasurementScale_base {
}

interface IShapeAnnotation extends AnnotationProperties {
    strokeDashArray: [number, number] | null;
    strokeWidth: number | null;
    strokeColor: Color$2 | null;
    fillColor: Color$2 | null;
    measurementScale: MeasurementScale | null;
    measurementPrecision: IMeasurementPrecision | null;
}
declare abstract class ShapeAnnotation<T extends IShapeAnnotation = IShapeAnnotation> extends Annotation<T> {
    strokeDashArray: null | [number, number];
    strokeWidth: number;
    strokeColor: null | Color$2;
    fillColor: null | Color$2;
    measurementPrecision: null | IMeasurementPrecision;
    measurementScale: null | MeasurementScale;
    static readableName: string;
    static defaultValues: IObject$1;
    isMeasurement(): boolean;
    getMeasurementDetails: () => {
        value: number;
        label: string;
    };
}

declare const LineCap: {
    readonly square: "square";
    readonly circle: "circle";
    readonly diamond: "diamond";
    readonly openArrow: "openArrow";
    readonly closedArrow: "closedArrow";
    readonly butt: "butt";
    readonly reverseOpenArrow: "reverseOpenArrow";
    readonly reverseClosedArrow: "reverseClosedArrow";
    readonly slash: "slash";
};
type ILineCap = (typeof LineCap)[keyof typeof LineCap];
type LineCapsType = {
    start?: ILineCap | null;
    end?: ILineCap | null;
};

interface ILineAnnotation extends IShapeAnnotation {
    startPoint: Point | null;
    endPoint: Point | null;
    lineCaps: LineCapsType | null;
    points: List<Point> | null;
}
declare class LineAnnotation<T extends ILineAnnotation = ILineAnnotation> extends ShapeAnnotation<T> {
    startPoint: Point;
    endPoint: Point;
    lineCaps: LineCapsType | null;
    points: List<Point> | null;
    static defaultValues: IObject$1;
    static readableName: string;
}

interface IRectangleAnnotation extends IShapeAnnotation {
    cloudyBorderIntensity?: number | null;
    cloudyBorderInset?: Inset | null;
}
declare class RectangleAnnotation<T extends IRectangleAnnotation = IRectangleAnnotation> extends ShapeAnnotation<T> {
    cloudyBorderIntensity: null | number;
    cloudyBorderInset: null | Inset;
    measurementBBox: null | Rect;
    static defaultValues: IObject$1;
    static readableName: string;
    constructor(options?: Partial<T>);
}

interface IEllipseAnnotation extends IShapeAnnotation {
    cloudyBorderIntensity?: number | null;
    cloudyBorderInset?: Inset | null;
}
declare class EllipseAnnotation<T extends IEllipseAnnotation = IEllipseAnnotation> extends ShapeAnnotation<T> {
    cloudyBorderIntensity: null | number;
    cloudyBorderInset: null | Inset;
    measurementBBox: null | Rect;
    static defaultValues: IObject$1;
    static readableName: string;
    constructor(options?: Partial<T>);
}

interface IPolygonAnnotation extends IShapeAnnotation {
    points: List<Point> | null;
    cloudyBorderIntensity: number | null;
}
declare class PolygonAnnotation<T extends IPolygonAnnotation = IPolygonAnnotation> extends ShapeAnnotation<T> {
    points: List<Point>;
    cloudyBorderIntensity: null | number;
    static defaultValues: IObject$1;
    static readableName: string;
}

interface IPolyLineAnnotation extends IShapeAnnotation {
    points: List<Point> | null;
    lineCaps: LineCapsType | null;
}
declare class PolylineAnnotation<T extends IPolyLineAnnotation = IPolyLineAnnotation> extends ShapeAnnotation<T> {
    points: List<Point>;
    lineCaps: null | LineCapsType;
    static defaultValues: IObject$1;
    static readableName: string;
}

declare const BorderStyle: {
    readonly solid: "solid";
    readonly dashed: "dashed";
    readonly beveled: "beveled";
    readonly inset: "inset";
    readonly underline: "underline";
};
type IBorderStyle = (typeof BorderStyle)[keyof typeof BorderStyle];

interface ILinkAnnotation extends AnnotationProperties {
    action: Action | null;
    borderColor: Color$2 | null;
    borderStyle: IBorderStyle | null;
    borderWidth: number | null;
}
declare class LinkAnnotation<T extends ILinkAnnotation = ILinkAnnotation> extends Annotation<T> {
    action: Action;
    borderColor: null | Color$2;
    borderStyle: null | IBorderStyle;
    borderWidth: null | number;
    static readableName: string;
    static defaultValues: IObject$1;
}

declare const NoteIcon: {
    readonly COMMENT: "COMMENT";
    readonly RIGHT_POINTER: "RIGHT_POINTER";
    readonly RIGHT_ARROW: "RIGHT_ARROW";
    readonly CHECK: "CHECK";
    readonly CIRCLE: "CIRCLE";
    readonly CROSS: "CROSS";
    readonly INSERT: "INSERT";
    readonly NEW_PARAGRAPH: "NEW_PARAGRAPH";
    readonly NOTE: "NOTE";
    readonly PARAGRAPH: "PARAGRAPH";
    readonly HELP: "HELP";
    readonly STAR: "STAR";
    readonly KEY: "KEY";
};
type INoteIcon = (typeof NoteIcon)[keyof typeof NoteIcon];

interface INoteAnnotation extends AnnotationProperties {
    text: {
        format: 'plain';
        value: string;
    };
    icon: string | INoteIcon;
    color: Color$2;
}
declare class NoteAnnotation<T extends INoteAnnotation = INoteAnnotation> extends Annotation<T> {
    text: {
        format: 'plain';
        value: string;
    };
    icon: INoteIcon;
    color: Color$2;
    static isEditable: boolean;
    static readableName: string;
    static defaultValues: IObject$1;
}

interface ISquiggleAnnotation extends ITextMarkupAnnotation {
    color: Color$2;
}
declare class SquiggleAnnotation<T extends ISquiggleAnnotation = ISquiggleAnnotation> extends TextMarkupAnnotation<T> {
    static className: string;
    static readableName: string;
    static defaultValues: IObject$1;
}

interface IStrikeOutAnnotation extends ITextMarkupAnnotation {
    color: Color$2;
}
declare class StrikeOutAnnotation<T extends IStrikeOutAnnotation = IStrikeOutAnnotation> extends TextMarkupAnnotation<T> {
    static className: string;
    static readableName: string;
    static defaultValues: IObject$1;
}

type ICallout = {
    start: Point | null;
    knee: Point | null;
    end: Point | null;
    cap: ILineCap | null;
    innerRectInset: Inset | null;
};
declare class Callout extends InheritableImmutableRecord<ICallout> {
    start: Point | null;
    knee: Point | null;
    end: Point | null;
    cap: ILineCap | null;
    innerRectInset: Inset | null;
    static defaultValues: {
        start: null;
        knee: null;
        end: null;
        cap: null;
        innerRectInset: null;
    };
}

interface ITextAnnotation extends AnnotationProperties {
    text: {
        format: 'plain' | 'xhtml';
        value: string | null;
    };
    fontColor: Color$2 | null;
    backgroundColor: Color$2 | null;
    font: string;
    fontSize: number | null;
    isBold: boolean | null;
    isItalic: boolean | null;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'center' | 'bottom';
    callout: Callout | null;
    borderStyle: IBorderStyle | null;
    borderWidth: number | null;
    borderColor: Color$2 | null;
    isFitting: boolean;
    lineHeightFactor: number | null;
}
declare class TextAnnotation<T extends ITextAnnotation = ITextAnnotation> extends Annotation<T> {
    text: {
        format: 'plain' | 'xhtml';
        value: string;
    };
    fontColor: null | Color$2;
    backgroundColor: null | Color$2;
    font: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'center' | 'bottom';
    isFitting: boolean;
    callout: null | Callout;
    borderStyle: null | IBorderStyle;
    borderWidth: null | number;
    borderColor: Color$2 | null;
    lineHeightFactor: null | number;
    static defaultValues: IObject$1;
    static readonly isEditable = true;
    static readonly readableName = "Text";
    static readonly fontSizePresets: readonly number[];
}

interface IUnderlineAnnotation extends ITextMarkupAnnotation {
    color: Color$2;
}
declare class UnderlineAnnotation<T extends IUnderlineAnnotation = IUnderlineAnnotation> extends TextMarkupAnnotation<T> {
    static className: string;
    static readableName: string;
    static defaultValues: IObject$1;
}

declare class UnknownAnnotation extends Annotation {
}

type FontSize = 'auto' | number;
type WidgetActionTriggerEventType = ActionTriggerEventType | 'onFocus' | 'onBlur';
type WidgetAnnotationAdditionalActionsType = {
    onFocus?: JavaScriptAction;
    onBlur?: JavaScriptAction;
    onChange?: JavaScriptAction;
    onFormat?: JavaScriptAction;
    onInput?: JavaScriptAction;
    onPointerDown?: Action;
    onPointerUp?: Action;
    onPointerEnter?: Action;
    onPointerLeave?: Action;
};
interface IWidgetAnnotation extends AnnotationProperties {
    formFieldName: string | null;
    borderColor: Color$2 | null;
    borderStyle: IBorderStyle | null;
    borderDashArray: number[] | null;
    borderWidth: number | null;
    backgroundColor: Color$2 | null;
    fontSize: FontSize | null;
    font: string | null;
    fontColor: Color$2 | null;
    isBold: boolean | null;
    isItalic: boolean | null;
    horizontalAlign: 'left' | 'center' | 'right' | null;
    verticalAlign: 'top' | 'center' | 'bottom' | null;
    additionalActions: WidgetAnnotationAdditionalActionsType | null;
    rotation: number;
    lineHeightFactor: number | null;
    buttonIconUpdatedAt: number | null;
}
declare class WidgetAnnotation<T extends IWidgetAnnotation = IWidgetAnnotation> extends Annotation<T> {
    formFieldName: string;
    borderColor: null | Color$2;
    borderStyle: null | IBorderStyle;
    borderDashArray: null | number[];
    borderWidth: null | number;
    backgroundColor: null | Color$2;
    fontSize: null | FontSize;
    font: null | string;
    fontColor: null | Color$2;
    isBold: boolean;
    isItalic: boolean;
    horizontalAlign: 'left' | 'center' | 'right' | null;
    verticalAlign: 'top' | 'center' | 'bottom' | null;
    additionalActions: null | WidgetAnnotationAdditionalActionsType;
    rotation: number;
    lineHeightFactor: null | number;
    action: null | Action;
    buttonIconUpdatedAt: null | number;
    static defaultValues: IObject$1;
    static readableName: string;
}

declare class CommentMarkerAnnotation extends Annotation {
    static readableName: string;
}

interface IRedactionAnnotation extends ITextMarkupAnnotation {
    color: Color$2;
    fillColor: null | Color$2;
    overlayText: null | string;
    repeatOverlayText: null | boolean;
    outlineColor: null | Color$2;
}
declare class RedactionAnnotation<T extends IRedactionAnnotation = IRedactionAnnotation> extends TextMarkupAnnotation<T> {
    fillColor: null | Color$2;
    overlayText: null | string;
    repeatOverlayText: null | boolean;
    outlineColor: null | Color$2;
    color: Color$2;
    static readableName: string;
    static defaultValues: IObject$1;
}

interface IMediaAnnotation extends AnnotationProperties {
    description: null | string;
    fileName: null | string;
    contentType: string | null;
    mediaAttachmentId: string | null;
}
declare class MediaAnnotation<T extends IMediaAnnotation = IMediaAnnotation> extends Annotation<T> {
    description: null | string;
    fileName: null | string;
    contentType: string | null;
    mediaAttachmentId: string | null;
    static defaultValues: IObject$1;
    static readableName: string;
}

type SignatureInfo = {
    type: 'pspdfkit/signature-info';
    signatureType?: SignatureTypeType | null | undefined;
    signerName: string | null | undefined;
    creationDate: Date | null | undefined;
    signatureReason: string | null | undefined;
    signatureLocation: string | null | undefined;
    documentIntegrityStatus: DocumentIntegrityStatusType;
    certificateChainValidationStatus: CertificateChainValidationStatusType;
    signatureValidationStatus: SignatureValidationStatusType;
    isTrusted: boolean;
    isSelfSigned: boolean;
    isExpired: boolean;
    documentModifiedSinceSignature: boolean;
    signatureFormFQN: string;
    PAdESSignatureLevel?: PAdESLevelType | null;
    validFrom: string | null | undefined;
    validUntil: string | null | undefined;
    timestampInfo: {
        type: 'pspdfkit/timestamp-info';
        signerName: string | null | undefined;
    };
    ltv: boolean;
};
declare const DocumentIntegrityStatus: {
    readonly ok: "ok";
    readonly tampered_document: "tampered_document";
    readonly failed_to_retrieve_signature_contents: "failed_to_retrieve_signature_contents";
    readonly failed_to_retrieve_byterange: "failed_to_retrieve_byterange";
    readonly failed_to_compute_digest: "failed_to_compute_digest";
    readonly failed_retrieve_signing_certificate: "failed_retrieve_signing_certificate";
    readonly failed_retrieve_public_key: "failed_retrieve_public_key";
    readonly failed_encryption_padding: "failed_encryption_padding";
    readonly tampered_or_invalid_timestamp: "tampered_or_invalid_timestamp";
    readonly general_failure: "general_failure";
};
type DocumentIntegrityStatusType = (typeof DocumentIntegrityStatus)[keyof typeof DocumentIntegrityStatus];
declare const CertificateChainValidationStatus: {
    readonly ok: "ok";
    readonly ok_but_self_signed: "ok_but_self_signed";
    readonly ok_but_could_not_check_revocation: "ok_but_could_not_check_revocation";
    readonly untrusted: "untrusted";
    readonly expired: "expired";
    readonly not_yet_valid: "not_yet_valid";
    readonly invalid: "invalid";
    readonly revoked: "revoked";
    readonly failed_to_retrieve_signature_contents: "failed_to_retrieve_signature_contents";
    readonly general_validation_problem: "general_validation_problem";
};
type CertificateChainValidationStatusType = (typeof CertificateChainValidationStatus)[keyof typeof CertificateChainValidationStatus];
declare const SignatureValidationStatus: {
    readonly valid: "valid";
    readonly warning: "warning";
    readonly error: "error";
};
type SignatureValidationStatusType = (typeof SignatureValidationStatus)[keyof typeof SignatureValidationStatus];
declare const SignatureType: {
    CMS: string;
    CAdES: string;
};
type SignatureTypeType = (typeof SignatureType)[keyof typeof SignatureType];
declare const PAdESLevel: {
    readonly b_b: "b-b";
    readonly b_t: "b-t";
    readonly b_lt: "b-lt";
};
type PAdESLevelType = (typeof PAdESLevel)[keyof typeof PAdESLevel];

type SignaturesInfo = {
    status: DocumentValidationStatusType;
    checkedAt: Date;
    signatures?: Array<SignatureInfo>;
    documentModifiedSinceSignature?: boolean;
};
declare const DocumentValidationStatus: {
    valid: string;
    warning: string;
    error: string;
    not_signed: string;
};
type DocumentValidationStatusType = keyof typeof DocumentValidationStatus;

type Glyph = {
    c: string;
    rect: Rect;
};

type IAnnotationJSON = Omit<BaseAnnotationJSON, 'id' | 'group' | 'permissions'>;
declare class AnnotationSerializer {
    static VERSION: number;
    annotation: AnnotationsUnion;
    constructor(annotation: AnnotationsUnion);
    toJSON(): Omit<BaseAnnotationJSON, 'type'>;
    static fromJSON(id: ID | null, json: IAnnotationJSON, options?: ICollaboratorPermissionsOptions): {
        group?: string | null | undefined;
        canSetGroup?: boolean | undefined;
        isEditable?: boolean | undefined;
        isDeletable?: boolean | undefined;
        blendMode?: IBlendMode | undefined;
        id: string | null;
        name: string | null;
        subject: string | null;
        pdfObjectId: number | null;
        pageIndex: number;
        opacity: number;
        boundingBox: Rect;
        noPrint: boolean;
        noZoom: boolean;
        noRotate: boolean;
        noView: boolean;
        hidden: boolean;
        locked: boolean;
        lockedContents: boolean;
        readOnly: boolean;
        action: Action | null | undefined;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        creatorName: string | null;
        customData: Record<string, unknown> | null;
        isCommentThreadRoot: boolean;
        isAnonymous: boolean;
    };
    static blendModeObjectForAnnotation(json: IAnnotationJSON): {
        blendMode: IBlendMode;
    } | null;
    serializeFlags(): ("noView" | "noPrint" | "locked" | "lockedContents" | "readOnly" | "hidden" | "noZoom" | "noRotate")[] | null;
}

declare class InkAnnotationSerializer extends AnnotationSerializer {
    annotation: InkAnnotation;
    constructor(annotation: InkAnnotation);
    toJSON(): InkAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<InkAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): InkAnnotation;
    _linesToJSON(): {
        points: [number, number][][];
        intensities: number[][];
    };
    static _JSONToLines(linesJSON: {
        points: Array<Array<[number, number]>>;
        intensities: Array<Array<number>>;
    }): List<List<DrawingPoint>>;
}

declare abstract class ShapeAnnotationSerializer extends AnnotationSerializer {
    annotation: ShapeAnnotationsUnion;
    toJSON(): ShapeAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<ShapeAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): {
        strokeWidth: number | null;
        strokeColor: Color$2 | null;
        fillColor: Color$2 | null;
        strokeDashArray: [number, number] | null | undefined;
        measurementPrecision: IMeasurementPrecision | null | undefined;
        measurementScale: MeasurementScale | null;
        group?: string | null | undefined;
        canSetGroup?: boolean | undefined;
        isEditable?: boolean | undefined;
        isDeletable?: boolean | undefined;
        blendMode?: IBlendMode | undefined;
        id: string | null;
        name: string | null;
        subject: string | null;
        pdfObjectId: number | null;
        pageIndex: number;
        opacity: number;
        boundingBox: Rect;
        noPrint: boolean;
        noZoom: boolean;
        noRotate: boolean;
        noView: boolean;
        hidden: boolean;
        locked: boolean;
        lockedContents: boolean;
        readOnly: boolean;
        action: Action | null | undefined;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        creatorName: string | null;
        customData: Record<string, unknown> | null;
        isCommentThreadRoot: boolean;
        isAnonymous: boolean;
    };
    _pointsToJSON(): Array<[number, number]>;
    static _JSONToPoints(pointsJSON: Array<[number, number]>): List<Point>;
    static _JSONLinesToPoints(linesJSON: {
        points: Array<Array<[number, number]>>;
        intensities: Array<Array<number>>;
    }): List<Point>;
}
type MeasurementScaleJSON = {
    unitFrom: IMeasurementScaleUnitFrom;
    unitTo: IMeasurementScaleUnitTo;
    from: number;
    to: number;
};

declare class LineAnnotationSerializer extends ShapeAnnotationSerializer {
    annotation: LineAnnotation;
    toJSON(): LineAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<LineAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): LineAnnotation;
}

declare class RectangleAnnotationSerializer extends ShapeAnnotationSerializer {
    annotation: RectangleAnnotation;
    toJSON(): RectangleAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<RectangleAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): RectangleAnnotation;
}

declare class EllipseAnnotationSerializer extends ShapeAnnotationSerializer {
    annotation: EllipseAnnotation;
    toJSON(): EllipseAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<EllipseAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): EllipseAnnotation;
}

declare class PolygonAnnotationSerializer extends ShapeAnnotationSerializer {
    annotation: PolygonAnnotation;
    toJSON(): PolygonAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<PolygonAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: IObject$1): PolygonAnnotation;
}

declare class PolylineAnnotationSerializer extends ShapeAnnotationSerializer {
    annotation: PolylineAnnotation;
    toJSON(): PolylineAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<PolylineAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): PolylineAnnotation;
}

declare class LinkAnnotationSerializer extends AnnotationSerializer {
    annotation: LinkAnnotation;
    constructor(annotation: LinkAnnotation);
    toJSON(): LinkAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<LinkAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): LinkAnnotation;
}

declare abstract class BaseTextMarkupSerializer extends AnnotationSerializer {
    annotation: RedactionAnnotation | TextMarkupAnnotation;
    constructor(annotation: RedactionAnnotation | TextMarkupAnnotation);
    toJSON(): BaseTextMarkupAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<BaseTextMarkupAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): {
        rects: List<Rect>;
        group?: string | null | undefined;
        canSetGroup?: boolean | undefined;
        isEditable?: boolean | undefined;
        isDeletable?: boolean | undefined;
        blendMode?: IBlendMode | undefined;
        id: string | null;
        name: string | null;
        subject: string | null;
        pdfObjectId: number | null;
        pageIndex: number;
        opacity: number;
        boundingBox: Rect;
        noPrint: boolean;
        noZoom: boolean;
        noRotate: boolean;
        noView: boolean;
        hidden: boolean;
        locked: boolean;
        lockedContents: boolean;
        readOnly: boolean;
        action: Action | null | undefined;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        creatorName: string | null;
        customData: Record<string, unknown> | null;
        isCommentThreadRoot: boolean;
        isAnonymous: boolean;
    };
}

declare class TextMarkupAnnotationSerializer extends BaseTextMarkupSerializer {
    annotation: TextMarkupAnnotationsUnion;
    constructor(annotation: TextMarkupAnnotationsUnion);
    toJSON(): TextMarkupAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<TextMarkupAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): TextMarkupAnnotationsUnion;
    typeForAnnotation(): "pspdfkit/markup/highlight" | "pspdfkit/markup/squiggly" | "pspdfkit/markup/strikeout" | "pspdfkit/markup/underline" | "pspdfkit/markup/redaction";
}

declare class RedactionAnnotationSerializer extends BaseTextMarkupSerializer {
    annotation: RedactionAnnotation;
    constructor(annotation: RedactionAnnotation);
    toJSON(): RedactionAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<RedactionAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): RedactionAnnotation;
}

declare class TextAnnotationSerializer extends AnnotationSerializer {
    annotation: TextAnnotation;
    constructor(annotation: TextAnnotation);
    toJSON(): TextAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<TextAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): TextAnnotation;
    _calloutToJSON(): {
        start: [number, number];
        knee: [number, number] | null;
        end: [number, number];
        cap: ILineCap | null;
        innerRectInset: InsetJSON | null;
    } | null;
    static _JSONToCallout(calloutJSON: TextAnnotationJSON['callout']): Callout | null | undefined;
}

declare class NoteAnnotationSerializer extends AnnotationSerializer {
    annotation: NoteAnnotation;
    constructor(annotation: NoteAnnotation);
    toJSON(): NoteAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<NoteAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): NoteAnnotation;
}

declare class ImageAnnotationSerializer extends AnnotationSerializer {
    annotation: ImageAnnotation;
    constructor(annotation: ImageAnnotation);
    toJSON(): ImageAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<ImageAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): ImageAnnotation;
}

declare class StampAnnotationSerializer extends AnnotationSerializer {
    annotation: StampAnnotation;
    constructor(annotation: StampAnnotation);
    toJSON(): StampAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<StampAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): StampAnnotation;
}

declare class WidgetAnnotationSerializer extends AnnotationSerializer {
    annotation: WidgetAnnotation;
    constructor(annotation: WidgetAnnotation);
    toJSON(): WidgetAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<WidgetAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): WidgetAnnotation;
}

type InstantID = string;
declare function generateInstantId(): InstantID;

declare class CommentMarkerAnnotationSerializer extends AnnotationSerializer {
    annotation: CommentMarkerAnnotation;
    constructor(annotation: CommentMarkerAnnotation);
    toJSON(): CommentMarkerAnnotationJSON;
    static fromJSON(id: InstantID | null, json: Omit<CommentMarkerAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): CommentMarkerAnnotation;
}

declare class UnknownAnnotationSerializer extends AnnotationSerializer {
    annotation: UnknownAnnotation;
    constructor(annotation: UnknownAnnotation);
    toJSON(): UnknownAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<UnknownAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): UnknownAnnotation;
}

declare class MediaAnnotationSerializer extends AnnotationSerializer {
    annotation: MediaAnnotation;
    constructor(annotation: MediaAnnotation);
    toJSON(): MediaAnnotationJSON;
    static fromJSON(id: ID | null, json: Omit<MediaAnnotationJSON, 'id' | 'group' | 'permissions'>, options?: ICollaboratorPermissionsOptions): MediaAnnotation;
}

type AnnotationSerializerTypeMap = {
    'pspdfkit/ink': {
        serializer: InkAnnotationSerializer;
        annotation: InkAnnotation;
        json: InkAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<InkAnnotationJSON>;
    };
    'pspdfkit/shape/line': {
        serializer: LineAnnotationSerializer;
        annotation: LineAnnotation;
        json: LineAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<LineAnnotationJSON>;
    };
    'pspdfkit/shape/rectangle': {
        serializer: RectangleAnnotationSerializer;
        annotation: RectangleAnnotation;
        json: RectangleAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<RectangleAnnotationJSON>;
    };
    'pspdfkit/shape/ellipse': {
        serializer: EllipseAnnotationSerializer;
        annotation: EllipseAnnotation;
        json: EllipseAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<EllipseAnnotationJSON>;
    };
    'pspdfkit/shape/polygon': {
        serializer: PolygonAnnotationSerializer;
        annotation: PolygonAnnotation;
        json: PolygonAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<PolygonAnnotationJSON>;
    };
    'pspdfkit/shape/polyline': {
        serializer: PolylineAnnotationSerializer;
        annotation: PolylineAnnotation;
        json: PolylineAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<PolylineAnnotationJSON>;
    };
    'pspdfkit/link': {
        serializer: LinkAnnotationSerializer;
        annotation: LinkAnnotation;
        json: LinkAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<LinkAnnotationJSON>;
    };
    'pspdfkit/markup/highlight': {
        serializer: TextMarkupAnnotationSerializer;
        annotation: HighlightAnnotation;
        json: TextMarkupAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<TextMarkupAnnotationJSON>;
    };
    'pspdfkit/markup/squiggly': {
        serializer: TextMarkupAnnotationSerializer;
        annotation: SquiggleAnnotation;
        json: TextMarkupAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<TextMarkupAnnotationJSON>;
    };
    'pspdfkit/markup/strikeout': {
        serializer: TextMarkupAnnotationSerializer;
        annotation: StrikeOutAnnotation;
        json: TextMarkupAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<TextMarkupAnnotationJSON>;
    };
    'pspdfkit/markup/underline': {
        serializer: TextMarkupAnnotationSerializer;
        annotation: UnderlineAnnotation;
        json: TextMarkupAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<TextMarkupAnnotationJSON>;
    };
    'pspdfkit/markup/redaction': {
        serializer: RedactionAnnotationSerializer;
        annotation: RedactionAnnotation;
        json: RedactionAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<RedactionAnnotationJSON>;
    };
    'pspdfkit/text': {
        serializer: TextAnnotationSerializer;
        annotation: TextAnnotation;
        json: TextAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<TextAnnotationJSON>;
    };
    'pspdfkit/note': {
        serializer: NoteAnnotationSerializer;
        annotation: NoteAnnotation;
        json: NoteAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<NoteAnnotationJSON>;
    };
    'pspdfkit/image': {
        serializer: ImageAnnotationSerializer;
        annotation: ImageAnnotation;
        json: ImageAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<ImageAnnotationJSON>;
    };
    'pspdfkit/stamp': {
        serializer: StampAnnotationSerializer;
        annotation: StampAnnotation;
        json: StampAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<StampAnnotationJSON, 'color'>;
    };
    'pspdfkit/widget': {
        serializer: WidgetAnnotationSerializer;
        annotation: WidgetAnnotation;
        json: WidgetAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<WidgetAnnotationJSON>;
    };
    'pspdfkit/comment-marker': {
        serializer: CommentMarkerAnnotationSerializer;
        annotation: CommentMarkerAnnotation;
        json: CommentMarkerAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<CommentMarkerAnnotationJSON>;
    };
    'pspdfkit/unknown': {
        serializer: UnknownAnnotationSerializer;
        annotation: UnknownAnnotation;
        json: UnknownAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<UnknownAnnotationJSON>;
    };
    'pspdfkit/media': {
        serializer: MediaAnnotationSerializer;
        annotation: MediaAnnotation;
        json: MediaAnnotationJSON;
        jsonForBackend: AnnotationBackendJSON<MediaAnnotationJSON>;
    };
};
type GetTypeFromAnnotationJSON<T extends {
    type: keyof AnnotationSerializerTypeMap;
}> = T extends {
    type: infer U;
} ? U : never;
type AnnotationJSONToAnnotation<T extends {
    type: keyof AnnotationSerializerTypeMap;
}> = AnnotationSerializerTypeMap[GetTypeFromAnnotationJSON<T>]['annotation'];
type Intersection<T, U> = T extends U ? T : never;
type BackendRequiredKeys = 'id' | 'v' | 'pageIndex' | 'type' | 'bbox';
type AnnotationBackendJSON<K extends BaseAnnotationJSON = AnnotationJSONUnion, R extends string = never> = {
    [P in keyof K]?: NonNullable<K[P]>;
} & {
    [P in Intersection<keyof K, BackendRequiredKeys | R>]-?: Exclude<NonNullable<K[P]>, undefined>;
};
type AnnotationsUnion = {
    [K in keyof AnnotationSerializerTypeMap]: AnnotationSerializerTypeMap[K]['annotation'];
}[keyof AnnotationSerializerTypeMap];
type AnnotationsUnionClass = {
    [K in keyof AnnotationSerializerTypeMap]: Class<AnnotationSerializerTypeMap[K]['annotation']>;
}[keyof AnnotationSerializerTypeMap];
type ShapeAnnotationsUnion = PolylineAnnotation | PolygonAnnotation | LineAnnotation | RectangleAnnotation | EllipseAnnotation;
type AnnotationsBackendJSONUnion = {
    [K in keyof AnnotationSerializerTypeMap]: AnnotationSerializerTypeMap[K]['jsonForBackend'];
}[keyof AnnotationSerializerTypeMap];
type TextMarkupAnnotationsUnion = HighlightAnnotation | UnderlineAnnotation | StrikeOutAnnotation | SquiggleAnnotation | RedactionAnnotation;

type CommentJSON = {
    id?: string | null;
    type: 'pspdfkit/comment';
    v: 2;
    rootId: string | number | null;
    pageIndex: number | null;
    pdfObjectId?: number | null;
    creatorName?: string | null;
    name?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    text: {
        value: string | null;
        format: 'xhtml' | 'plain';
    };
    customData?: {
        [key: string]: unknown;
    } | null;
    isAnonymous?: boolean | null;
} & ICollaboratorPermissionsOptions;

type CommentProps = {
    id: InstantID | null;
    rootId: InstantID | null;
    pageIndex: null | number;
    pdfObjectId: number | null;
    creatorName: string | null;
    createdAt: Date;
    updatedAt: Date;
    text: {
        format: 'plain' | 'xhtml';
        value: string | null;
    };
    customData: Record<string, unknown> | null;
    group?: string | null;
    isEditable?: boolean;
    isDeletable?: boolean;
    canSetGroup?: boolean;
    isAnonymous?: boolean | null;
};
declare const Comment_base: Record$1.Factory<CommentProps>;
declare class Comment extends Comment_base {
    static toSerializableObject: (comment: Comment) => CommentJSON;
    static fromSerializableObject: (comment: CommentJSON) => Comment;
    getMentionedUserIds(): Set$1<string>;
}
type MentionableUser$1 = {
    id: string;
    name: string;
    avatarUrl?: string;
    displayName: string;
    description?: string;
};

type IGroup = string | null | undefined;
type IPermissions = {
    edit: boolean;
    delete: boolean;
    setGroup: boolean;
    fill?: boolean;
    reply?: boolean;
};

type ICollaboratorPermissionsOptions = {
    group?: IGroup;
    permissions?: IPermissions;
};

type SerializedAdditionalActionsType = {
    [key in ActionTriggerEventType | FormFieldEventTriggerType | FormFieldInputEventTriggerType | WidgetActionTriggerEventType]?: {
        type: string;
        [key: string]: unknown;
    };
};

type FontSubstitution = {
    pattern: string;
    target: string;
};

declare const ComparisonOperationType: {
    readonly TEXT: "text";
};
type IComparisonOperationType = (typeof ComparisonOperationType)[keyof typeof ComparisonOperationType];

declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}

type OnCommentCreationStartCallback = (comment: Comment) => Comment;

interface ITextLine {
    id: number | null;
    pageIndex: number | null;
    boundingBox: Rect;
    contents: string;
}
declare const TextLine_base: Record$1.Factory<ITextLine>;
declare class TextLine extends TextLine_base {
}

type CustomOverlayItemID = string;
interface ICustomOverlayItem {
    disableAutoZoom?: boolean;
    id: CustomOverlayItemID | null;
    node: Node | null;
    noRotate?: boolean;
    pageIndex: number;
    position: Point;
    onAppear?: null | ((...args: Array<any>) => any);
    onDisappear?: null | ((...args: Array<any>) => any);
}
declare const CustomOverlayItem_base: Record$1.Factory<ICustomOverlayItem>;
declare class CustomOverlayItem extends CustomOverlayItem_base {
    disableAutoZoom: boolean;
    id: CustomOverlayItemID;
    node: Node;
    noRotate: boolean;
    pageIndex: number;
    position: Point;
    onAppear?: ((...args: Array<any>) => any) | null;
    onDisappear?: ((...args: Array<any>) => any) | null;
    constructor(args: ICustomOverlayItem);
}

declare class PageInfo {
    index: number;
    label: string;
    height: number;
    width: number;
    rotation: number;
    rawPdfBoxes: RawPdfBoxes;
}

declare const ViewportPadding_base: Record$1.Factory<{
    horizontal: number;
    vertical: number;
}>;
declare class ViewportPadding extends ViewportPadding_base {
}

declare const LayoutMode: {
    readonly SINGLE: "SINGLE";
    readonly DOUBLE: "DOUBLE";
    readonly AUTO: "AUTO";
};
type ILayoutMode = (typeof LayoutMode)[keyof typeof LayoutMode];

declare const ScrollMode: {
    readonly CONTINUOUS: "CONTINUOUS";
    readonly PER_SPREAD: "PER_SPREAD";
    readonly DISABLED: "DISABLED";
};
type IScrollMode = (typeof ScrollMode)[keyof typeof ScrollMode];

declare const SidebarPlacement: {
    readonly START: "START";
    readonly END: "END";
};
type ISidebarPlacement = (typeof SidebarPlacement)[keyof typeof SidebarPlacement];

declare const ZoomMode: {
    readonly AUTO: "AUTO";
    readonly FIT_TO_WIDTH: "FIT_TO_WIDTH";
    readonly FIT_TO_VIEWPORT: "FIT_TO_VIEWPORT";
    readonly CUSTOM: "CUSTOM";
};
type IZoomMode = (typeof ZoomMode)[keyof typeof ZoomMode];

declare const ShowSignatureValidationStatusMode: {
    readonly IF_SIGNED: "IF_SIGNED";
    readonly HAS_WARNINGS: "HAS_WARNINGS";
    readonly HAS_ERRORS: "HAS_ERRORS";
    readonly NEVER: "NEVER";
};
type IShowSignatureValidationStatusMode = (typeof ShowSignatureValidationStatusMode)[keyof typeof ShowSignatureValidationStatusMode];

declare const InteractionMode: {
    readonly TEXT_HIGHLIGHTER: "TEXT_HIGHLIGHTER";
    readonly INK: "INK";
    readonly INK_SIGNATURE: "INK_SIGNATURE";
    readonly SIGNATURE: "SIGNATURE";
    readonly STAMP_PICKER: "STAMP_PICKER";
    readonly STAMP_CUSTOM: "STAMP_CUSTOM";
    readonly SHAPE_LINE: "SHAPE_LINE";
    readonly SHAPE_RECTANGLE: "SHAPE_RECTANGLE";
    readonly SHAPE_ELLIPSE: "SHAPE_ELLIPSE";
    readonly SHAPE_POLYGON: "SHAPE_POLYGON";
    readonly SHAPE_POLYLINE: "SHAPE_POLYLINE";
    readonly INK_ERASER: "INK_ERASER";
    readonly NOTE: "NOTE";
    readonly COMMENT_MARKER: "COMMENT_MARKER";
    readonly TEXT: "TEXT";
    readonly CALLOUT: "CALLOUT";
    readonly PAN: "PAN";
    readonly SEARCH: "SEARCH";
    readonly DOCUMENT_EDITOR: "DOCUMENT_EDITOR";
    readonly MARQUEE_ZOOM: "MARQUEE_ZOOM";
    readonly REDACT_TEXT_HIGHLIGHTER: "REDACT_TEXT_HIGHLIGHTER";
    readonly REDACT_SHAPE_RECTANGLE: "REDACT_SHAPE_RECTANGLE";
    readonly DOCUMENT_CROP: "DOCUMENT_CROP";
    readonly BUTTON_WIDGET: "BUTTON_WIDGET";
    readonly TEXT_WIDGET: "TEXT_WIDGET";
    readonly RADIO_BUTTON_WIDGET: "RADIO_BUTTON_WIDGET";
    readonly CHECKBOX_WIDGET: "CHECKBOX_WIDGET";
    readonly COMBO_BOX_WIDGET: "COMBO_BOX_WIDGET";
    readonly LIST_BOX_WIDGET: "LIST_BOX_WIDGET";
    readonly SIGNATURE_WIDGET: "SIGNATURE_WIDGET";
    readonly DATE_WIDGET: "DATE_WIDGET";
    readonly FORM_CREATOR: "FORM_CREATOR";
    readonly LINK: "LINK";
    readonly DISTANCE: "DISTANCE";
    readonly PERIMETER: "PERIMETER";
    readonly RECTANGLE_AREA: "RECTANGLE_AREA";
    readonly ELLIPSE_AREA: "ELLIPSE_AREA";
    readonly POLYGON_AREA: "POLYGON_AREA";
    readonly CONTENT_EDITOR: "CONTENT_EDITOR";
    readonly MULTI_ANNOTATIONS_SELECTION: "MULTI_ANNOTATIONS_SELECTION";
    readonly MEASUREMENT: "MEASUREMENT";
    readonly MEASUREMENT_SETTINGS: "MEASUREMENT_SETTINGS";
};
type IInteractionMode = (typeof InteractionMode)[keyof typeof InteractionMode];

declare const SidebarMode: {
    readonly ANNOTATIONS: "ANNOTATIONS";
    readonly BOOKMARKS: "BOOKMARKS";
    readonly DOCUMENT_OUTLINE: "DOCUMENT_OUTLINE";
    readonly THUMBNAILS: "THUMBNAILS";
    readonly SIGNATURES: "SIGNATURES";
    readonly LAYERS: "LAYERS";
    readonly CUSTOM: "CUSTOM";
};
type ISidebarMode = (typeof SidebarMode)[keyof typeof SidebarMode];

declare const Alignment: {
    readonly START: "START";
    readonly END: "END";
};
type IAlignment = (typeof Alignment)[keyof typeof Alignment];

type SidebarOptions<T extends AnnotationsSidebarOptions | LayersSidebarOptions> = T extends AnnotationsSidebarOptions ? {
    [SidebarMode.ANNOTATIONS]: AnnotationsSidebarOptions;
} : {
    [SidebarMode.LAYERS]: LayersSidebarOptions;
};
type AnnotationsSidebarOptions = {
    includeContent: Array<AnnotationsUnionClass | Class<Comment>>;
};
type LayersSidebarOptions = {
    lockedLayers: number[];
    iconsAlignment: IAlignment;
};

type Rotation$1 = 0 | 90 | 180 | 270;
interface IViewState {
    allowPrinting: boolean;
    allowExport: boolean;
    currentPageIndex: number;
    instance: Instance | null;
    interactionMode: IInteractionMode | null;
    keepFirstSpreadAsSinglePage: boolean;
    layoutMode: ILayoutMode;
    pageSpacing: number;
    pagesRotation: Rotation$1;
    readOnly: boolean;
    scrollMode: IScrollMode;
    showAnnotations: boolean;
    showComments: boolean;
    showAnnotationNotes: boolean;
    showToolbar: boolean;
    enableAnnotationToolbar: boolean;
    sidebarMode: ISidebarMode | null | undefined;
    sidebarOptions: SidebarOptions<AnnotationsSidebarOptions | LayersSidebarOptions>;
    sidebarPlacement: ISidebarPlacement;
    spreadSpacing: number;
    viewportPadding: ViewportPadding;
    zoom: IZoomMode | number;
    zoomStep: number;
    formDesignMode: boolean;
    showSignatureValidationStatus: IShowSignatureValidationStatusMode;
    previewRedactionMode: boolean;
    canScrollWhileDrawing: boolean;
    keepSelectedTool: boolean;
    resolvedLayoutMode: ILayoutMode;
    sidebarWidth: number;
    disablePointSnapping: boolean;
    enableAlwaysScrollToZoom: boolean;
    forceRenderWidgetsInAnnotationsOrder: boolean;
    prerenderedPageSpreads: number | null;
}
declare const ViewState_base: Record$1.Factory<IViewState>;
declare class ViewState extends ViewState_base {
    zoomIn(): ViewState;
    zoomOut(): ViewState;
    rotateLeft(): ViewState;
    rotateRight(): ViewState;
    goToNextPage(): ViewState;
    goToPreviousPage(): ViewState;
}

declare class InstantClient {
    clientId: string;
    userId: string | null | undefined;
}

declare const PrintMode: {
    readonly DOM: "DOM";
    readonly EXPORT_PDF: "EXPORT_PDF";
};
type IPrintMode = (typeof PrintMode)[keyof typeof PrintMode];

declare function toJSON(bookmark: Bookmark): BookmarkJSON;

type ID$1 = string;
type BookmarkProps = {
    id: ID$1 | null;
    pdfBookmarkId: ID$1 | null;
    name: string | null;
    sortKey: number | null;
    action: Action | null;
};
declare const Bookmark_base: Record$1.Factory<BookmarkProps>;
declare class Bookmark extends Bookmark_base {
    id: ID$1;
    action: Action;
    static toSerializableObject: typeof toJSON;
    static fromSerializableObject: (bookmark: BookmarkJSON) => Bookmark;
}

declare const allowedToolbarTypes: ("link" | "ellipse" | "image" | "line" | "polygon" | "polyline" | "text" | "spacer" | "distance" | "note" | "comment" | "zoom-in" | "zoom-out" | "callout" | "search" | "arrow" | "highlighter" | "undo" | "redo" | "custom" | "measure" | "print" | "redact-text-highlighter" | "rectangle" | "ink" | "stamp" | "cloudy-rectangle" | "dashed-rectangle" | "cloudy-ellipse" | "dashed-ellipse" | "cloudy-polygon" | "dashed-polygon" | "text-highlighter" | "perimeter" | "ellipse-area" | "rectangle-area" | "polygon-area" | "debug" | "multi-annotations-selection" | "annotate" | "responsive-group" | "layout-config" | "marquee-zoom" | "redact-rectangle" | "document-comparison" | "form-creator" | "content-editor" | "sidebar-thumbnails" | "sidebar-document-outline" | "sidebar-annotations" | "sidebar-bookmarks" | "sidebar-signatures" | "sidebar-layers" | "pager" | "pan" | "zoom-mode" | "ink-eraser" | "signature" | "document-editor" | "document-crop" | "export-pdf")[];

type ToolItemType = 'custom';
type ToolItem = {
    type: ToolItemType;
    node?: Node;
    id?: string;
    title?: string;
    className?: string;
    icon?: string;
    onPress?: IFunction;
    selected?: boolean;
    disabled?: boolean;
};

type AnnotationPreset$1 = Record<string, any>;
type AnnotationPresetID$1 = string;

type ToolbarItemType = ToolItemType | (typeof allowedToolbarTypes)[number];
type ToolbarItem = Omit<ToolItem, 'type'> & {
    type: ToolbarItemType;
    mediaQueries?: string[];
    responsiveGroup?: string;
    dropdownGroup?: string;
    preset?: AnnotationPresetID$1;
    onKeyPress?: (...args: Array<any>) => any;
};

type OutlineElementProps = {
    children: List<OutlineElement>;
    title: string;
    color: Color$2 | null;
    isBold: boolean;
    isItalic: boolean;
    isExpanded: boolean;
    action: Action | null;
};
declare const OutlineElement_base: Record$1.Factory<OutlineElementProps>;
declare class OutlineElement extends OutlineElement_base {
}

type BaseFormFieldJSON = {
    v: 1;
    pdfObjectId?: number | null;
    annotationIds: Array<string>;
    name: string;
    label: string;
    flags?: FormFieldFlags;
    id: string;
    additionalActions?: SerializedAdditionalActionsType;
    group?: IGroup;
    permissions?: IPermissions;
};
type ChoiceFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/listbox' | 'pspdfkit/form-field/combobox';
    options: Array<FormOptionJSON>;
    multiSelect: boolean;
    commitOnChange: boolean;
    defaultValues: Array<string>;
};
type ListBoxFormFieldJSON = ChoiceFormFieldJSON & {
    type: 'pspdfkit/form-field/listbox';
};
type DoNotSpellCheckPropertyPair = XOR<Record<'doNotSpellCheck', boolean>, Record<'doNotSpellcheck', boolean>>;
type ComboBoxFormFieldJSON = ChoiceFormFieldJSON & {
    type: 'pspdfkit/form-field/combobox';
    edit: boolean;
} & DoNotSpellCheckPropertyPair;
type CheckBoxFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/checkbox';
    options: Array<FormOptionJSON>;
    defaultValues: Array<string>;
};
type RadioButtonFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/radio';
    options: Array<FormOptionJSON>;
    noToggleToOff: boolean;
    radiosInUnison: boolean;
    defaultValue: string;
};
type TextFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/text';
    password: boolean;
    maxLength?: number | null;
    doNotScroll: boolean;
    multiLine: boolean;
    defaultValue: string;
    comb: boolean;
} & DoNotSpellCheckPropertyPair;
type ButtonFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/button';
    buttonLabel: string | null;
};
type SignatureFormFieldJSON = BaseFormFieldJSON & {
    type: 'pspdfkit/form-field/signature';
};
type FormFieldJSON = ListBoxFormFieldJSON | ComboBoxFormFieldJSON | RadioButtonFormFieldJSON | CheckBoxFormFieldJSON | TextFormFieldJSON | ButtonFormFieldJSON | SignatureFormFieldJSON;

type SerializedJSON = {
    skippedPdfObjectIds?: number[];
    annotations?: AnnotationJSONUnion[];
    formFields?: FormFieldJSON[];
    skippedPdfFormFieldIds?: number[];
    formFieldValues?: Record<string, any>[];
    comments?: Record<string, any>[];
    skippedComments?: number[];
    attachments?: Record<string, {
        binary: string;
        contentType: string;
    }>;
    skippedPdfBookmarkIds?: string[];
    bookmarks?: BookmarkJSON[];
};
type InstantJSON = SerializedJSON & {
    format: 'https://pspdfkit.com/instant-json/v1';
    pdfId?: {
        permanent: string;
        changing: string;
    };
};

declare const SearchResult_base: Record$1.Factory<{
    pageIndex: number | null;
    previewText: string;
    locationInPreview: number | null;
    lengthInPreview: number | null;
    rectsOnPage: List<Rect>;
    isAnnotation: boolean | null;
    annotationRect?: Rect | null | undefined;
}>;
declare class SearchResult extends SearchResult_base {
}

declare const SearchState_base: Record$1.Factory<ISearchState>;
declare class SearchState extends SearchState_base {
}
interface ISearchState {
    isFocused: boolean;
    isLoading: boolean;
    term: string;
    focusedResultIndex: number;
    results: List<SearchResult>;
    minSearchQueryLength: number;
}

type IsEditableAnnotationCallback = (annotation: AnnotationsUnion) => boolean;

type Rotation = 0 | 90 | 180 | 270;
type AddPageConfiguration = {
    backgroundColor: Color$2;
    pageWidth: number;
    pageHeight: number;
    rotateBy: Rotation;
    insets?: Rect;
};
type OperationAttachment = string | File | Blob;
type min = number;
type max = number;
type Range$1 = [min, max];
type ImportPageIndex = Array<number | Range$1>;
type DocumentMetadata = {
    title?: string;
    author?: string;
};
type NonSerializableDocumentOperationsCommon = {
    type: 'removePages';
    pageIndexes: Array<number>;
} | {
    type: 'duplicatePages';
    pageIndexes: Array<number>;
} | {
    type: 'movePages';
    pageIndexes: Array<number>;
    afterPageIndex: number;
} | {
    type: 'movePages';
    pageIndexes: Array<number>;
    beforePageIndex: number;
} | {
    type: 'rotatePages';
    pageIndexes: Array<number>;
    rotateBy: Rotation;
} | {
    type: 'keepPages';
    pageIndexes: Array<number>;
} | {
    type: 'importDocument';
    afterPageIndex: number;
    treatImportedDocumentAsOnePage?: boolean;
    document: OperationAttachment;
    importedPageIndexes?: ImportPageIndex;
} | {
    type: 'importDocument';
    beforePageIndex: number;
    treatImportedDocumentAsOnePage?: boolean;
    document: OperationAttachment;
    importedPageIndexes?: ImportPageIndex;
} | {
    type: 'flattenAnnotations';
    pageIndexes?: Array<number>;
    annotationIds?: string[];
} | {
    type: 'setPageLabel';
    pageIndexes?: Array<number>;
    pageLabel?: string;
} | {
    type: 'performOcr';
    pageIndexes?: Array<number> | 'all';
    language: string;
} | {
    type: 'applyRedactions';
} | {
    type: 'updateMetadata';
    metadata: DocumentMetadata;
};
type NonSerializableDocumentOperations = {
    type: 'applyInstantJson';
    instantJson: Record<string, any>;
    dataFilePath?: OperationAttachment;
} | {
    type: 'applyXfdf';
    xfdf: string;
    ignorePageRotation?: boolean;
    dataFilePath?: OperationAttachment;
};
type DocumentOperation = (AddPageConfiguration & {
    type: 'addPage';
    afterPageIndex: number;
}) | (AddPageConfiguration & {
    type: 'addPage';
    beforePageIndex: number;
}) | {
    type: 'cropPages';
    pageIndexes?: Array<number>;
    cropBox: Rect;
} | {
    type: 'addPageMargins';
    pageIndexes?: Array<number>;
    margins: Inset;
} | NonSerializableDocumentOperationsCommon | NonSerializableDocumentOperations;

type RendererConfiguration = {
    node: Node;
    append?: boolean | null;
    noZoom?: boolean | null;
    onDisappear?: ((arg0: Node | null) => void) | null;
};

type CustomRenderers = {
    Annotation?: (arg0: {
        annotation: AnnotationsUnion;
    }) => RendererConfiguration | null | undefined;
    CommentAvatar?: (arg0: {
        comment: Comment;
    }) => RendererConfiguration | null | undefined;
};

type IsEditableCommentCallback = (comment: Comment) => boolean;

type TwoStepSignatureCallback = (arg0: {
    hash: string;
    fileContents: ArrayBuffer | null;
    dataToBeSigned: ArrayBuffer;
}) => Promise<ArrayBuffer>;

type SignatureMetadata = {
    signerName?: string;
    signatureReason?: string;
    signatureLocation?: string;
};

type SignaturePosition = {
    pageIndex: number;
    boundingBox: Rect;
};

declare const SignatureAppearanceMode: {
    readonly signatureOnly: "signatureOnly";
    readonly signatureAndDescription: "signatureAndDescription";
    readonly descriptionOnly: "descriptionOnly";
};
type ISignatureAppearanceMode = (typeof SignatureAppearanceMode)[keyof typeof SignatureAppearanceMode];

type SignatureAppearance = {
    mode?: ISignatureAppearanceMode;
    showSigner?: boolean;
    showSignDate?: boolean;
    showReason?: boolean;
    showLocation?: boolean;
    showWatermark?: boolean;
    showDateTimezone?: boolean;
    watermarkImage?: Blob | File;
};

type SignatureContainerType = 'raw' | 'pkcs7';
type TimestampType = {
    url: string;
    username?: string;
    password?: string;
};
type SigningData = {
    certificates?: ArrayBuffer[] | string[];
    signatureType: SignatureTypeType;
    privateKey?: string;
    signatureContainer?: SignatureContainerType;
    timestamp?: TimestampType;
    ltv?: boolean;
};
type SignaturePreparationData = {
    placeholderSize?: number;
    flatten?: boolean;
    formFieldName?: string;
    position?: SignaturePosition;
    appearance?: SignatureAppearance;
};
type SignatureCreationData = SignaturePreparationData & {
    signatureMetadata?: SignatureMetadata;
} & {
    signingData?: SigningData;
};

type SigningServiceData = {
    signingToken: string;
};

type RedactionAnnotationPreset = {
    fillColor?: Color$2;
    overlayText?: string;
    repeatOverlayText?: boolean;
    color?: Color$2;
    outlineColor?: Color$2;
    creatorName?: string;
};

type Change = AnnotationsUnion | Bookmark | FormField | FormFieldValue | Comment;

type DocumentEditorUIHandler = {
    setOperations: (callback: (stagedDocumentOperations: List<DocumentOperation | List<DocumentOperation>>) => List<DocumentOperation | List<DocumentOperation>>, clearPagesSelection?: boolean) => void | Promise<void>;
    getSelectedPageIndexes: () => number[];
};

type BuiltInDocumentEditorFooterItem = 'cancel' | 'spacer' | 'save-as' | 'save' | 'selected-pages' | 'loading-indicator';
type BasicDocumentEditorFooterItem = {
    type: BuiltInDocumentEditorFooterItem | 'custom';
    node?: Node;
    className?: string;
    id?: string;
    onPress?: (e: MouseEvent, documentEditorUIHandler?: DocumentEditorUIHandler, id?: string) => void;
};
type DocumentEditorFooterItem = Omit<BasicDocumentEditorFooterItem, 'type' | 'onPress'> & ({
    type: BuiltInDocumentEditorFooterItem;
    onPress?: (e: Event) => void;
} | {
    type: 'custom';
    onPress?: (e: Event, documentEditorUIHandler: DocumentEditorUIHandler, id?: string) => void;
});

type BuiltInDocumentEditorToolbarItem = 'add' | 'remove' | 'duplicate' | 'rotate-left' | 'rotate-right' | 'move' | 'move-left' | 'move-right' | 'import-document' | 'spacer' | 'undo' | 'redo' | 'select-all' | 'select-none';
type DocumentEditorBuiltinToolbarItem = Omit<ToolItem, 'type' | 'onPress'> & {
    type: BuiltInDocumentEditorToolbarItem;
    onPress?: (e: Event) => void;
};
type DocumentEditorToolbarItem = Omit<ToolItem, 'type' | 'onPress'> & (DocumentEditorBuiltinToolbarItem | {
    type: 'custom';
    onPress?: (e: Event, documentEditorUIHandler: DocumentEditorUIHandler, id?: string) => void;
});

type AnnotationsResizeEvent = {
    annotation: AnnotationsUnion;
    isShiftPressed: boolean;
    resizeAnchor: ResizeAnchor;
};
type ResizeAnchor = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT';

type AnnotationResizeStartCallbackConfiguration = {
    maintainAspectRatio?: boolean;
    minWidth?: number | undefined;
    minHeight?: number | undefined;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
};
type AnnotationResizeStartCallback = (event: AnnotationsResizeEvent) => AnnotationResizeStartCallbackConfiguration;

declare const UIElement: {
    readonly Sidebar: "Sidebar";
};
type IUIElement = (typeof UIElement)[keyof typeof UIElement];

type RendererProps = {
    containerNode: Node;
    items?: List<any> | null;
};
type ItemRendererProps = {
    itemContainerNode: Node;
    item: any;
};
type ItemCustomRenderer = (itemRendererProps: ItemRendererProps) => void;
type UIRendererConfiguration = {
    node: Node;
    onRenderItem?: ItemCustomRenderer;
};
type Renderer$1 = (rendererProps: RendererProps) => UIRendererConfiguration;
type CustomUISidebarConfiguration = Partial<{
    [K in ISidebarMode]: Renderer$1;
}>;
type CustomUIElementConfiguration = CustomUISidebarConfiguration;
type CustomUI = Partial<Record<IUIElement, CustomUIElementConfiguration>>;

declare const SearchType: {
    readonly TEXT: "text";
    readonly PRESET: "preset";
    readonly REGEX: "regex";
};
type ISearchType = (typeof SearchType)[keyof typeof SearchType];

declare const SearchPattern: {
    readonly CREDIT_CARD_NUMBER: "credit_card_number";
    readonly DATE: "date";
    readonly TIME: "time";
    readonly EMAIL_ADDRESS: "email_address";
    readonly INTERNATIONAL_PHONE_NUMBER: "international_phone_number";
    readonly IP_V4: "ipv4";
    readonly IP_V6: "ipv6";
    readonly MAC_ADDRESS: "mac_address";
    readonly NORTH_AMERICAN_PHONE_NUMBER: "north_american_phone_number";
    readonly SOCIAL_SECURITY_NUMBER: "social_security_number";
    readonly URL: "url";
    readonly US_ZIP_CODE: "us_zip_code";
    readonly VIN: "vin";
};
type ISearchPattern = (typeof SearchPattern)[keyof typeof SearchPattern];

type AnnotationsPressEvent = {
    annotation: AnnotationsUnion;
    nativeEvent: Event;
    preventDefault?: () => void;
    selected: boolean;
};

declare enum AnnotationsWillChangeReason {
    DRAW_START = "DRAW_START",
    DRAW_END = "DRAW_END",
    TEXT_EDIT_START = "TEXT_EDIT_START",
    TEXT_EDIT_END = "TEXT_EDIT_END",
    SELECT_START = "SELECT_START",
    SELECT_END = "SELECT_END",
    MOVE_START = "MOVE_START",
    MOVE_END = "MOVE_END",
    RESIZE_START = "RESIZE_START",
    RESIZE_END = "RESIZE_END",
    ROTATE_START = "ROTATE_START",
    ROTATE_END = "ROTATE_END",
    DELETE_START = "DELETE_START",
    DELETE_END = "DELETE_END",
    PROPERTY_CHANGE = "PROPERTY_CHANGE"
}

type PagePressEvent = {
    pageIndex: number;
    point: Point;
    nativeEvent: Event;
};

type AnnotationPresetsUpdateEvent = {
    preventDefault: () => boolean;
    currentPreset: AnnotationPresetID;
    currentPresetProperties: AnnotationPreset;
    newPresetProperties: AnnotationPreset;
};

type AnnotationsFocusEvent = {
    annotation: AnnotationsUnion;
    nativeEvent: FocusEvent;
};
type AnnotationsBlurEvent = {
    annotation: AnnotationsUnion;
    nativeEvent: FocusEvent;
};

type SaveStateChangeEvent = {
    hasUnsavedChanges: boolean;
};

type SearchTermChangeEvent = {
    term: string;
    preventDefault: () => void;
};

type TextLinePressEvent = {
    textLine: TextLine;
    point: Point;
    nativeEvent: Event;
};

type CropAreaChangeStartEvent = {
    cropBox: Rect;
    pageIndex: number;
};
type CropAreaChangeStopEvent = {
    cropBox: Rect;
    pageIndex: number;
};

type AnnotationsTransformEvent = {
    annotation: AnnotationsUnion;
};

type AnnotationsCopyEvent = {
    annotation: AnnotationsUnion;
};

type AnnotationsCutEvent = {
    annotation: AnnotationsUnion;
};

type AnnotationsDuplicateEvent = {
    annotations: AnnotationsUnion[];
    formFields?: FormField[];
    originalAnnotations: AnnotationsUnion[];
    originalFormFields?: Map<string, FormField>;
};

type AnnotationsPasteEvent = AnnotationsDuplicateEvent & {
    previousAction: 'COPY' | 'CUT';
};

interface ITextSelection$1 {
    startNestedContentBlockId: string | null;
    startTextLineId: number | null;
    startPageIndex: number | null;
    startNode: Text | null;
    startOffset: number | null;
    endNestedContentBlockId: string | null;
    endTextLineId: number | null;
    endPageIndex: number | null;
    endNode: Text | null;
    endOffset: number | null;
    getText: (() => Promise<string>) | null;
    getSelectedTextLines: (() => Promise<List<TextLine>>) | null;
    getBoundingClientRect: (() => Promise<Rect | null>) | null;
    getSelectedRectsPerPage: (() => Promise<List<{
        pageIndex: number;
        rects: List<Rect>;
    }>>) | null;
}
declare const PublicTextSelection_base: Record$1.Factory<ITextSelection$1>;
declare class PublicTextSelection extends PublicTextSelection_base {
    startTextLineId: number;
    startNestedContentBlockId: string;
    startPageIndex: number;
    startNode: Text;
    startOffset: number;
    endTextLineId: number;
    endNestedContentBlockId: string;
    endPageIndex: number;
    endNode: Text;
    endOffset: number;
    getText: () => Promise<string>;
    getSelectedTextLines: () => Promise<List<TextLine>>;
    getBoundingClientRect: () => Promise<Rect | null>;
    getSelectedRectsPerPage: () => Promise<List<{
        pageIndex: number;
        rects: List<Rect>;
    }>>;
}

interface AnnotationNoteProps extends INoteAnnotation {
    parentAnnotation: AnnotationsUnion | null;
    position: Point;
    notePosition?: Point;
}
declare class AnnotationNote<T extends AnnotationNoteProps = AnnotationNoteProps> extends NoteAnnotation<T> {
    parentAnnotation?: AnnotationsUnion;
    position: Point;
    notePosition?: Point;
    static defaultValues: IObject$1;
}

type AnnotationNotePressEvent = {
    preventDefault: () => boolean;
    annotationNote?: AnnotationNote | null;
};

type AnnotationNoteHoverEvent = {
    preventDefault: () => boolean;
    annotationNote?: AnnotationNote | null;
};

declare const DocumentComparisonSourceType: {
    readonly USE_OPEN_DOCUMENT: "USE_OPEN_DOCUMENT";
    readonly USE_FILE_DIALOG: "USE_FILE_DIALOG";
};
type IDocumentComparisonSourceType = (typeof DocumentComparisonSourceType)[keyof typeof DocumentComparisonSourceType];

type DocumentComparisonSource = {
    source: IDocumentComparisonSourceType | string | ArrayBuffer | Promise<string | ArrayBuffer>;
    pageIndex?: number;
};

type DocumentComparisonStrokeColors = {
    documentA?: Color$2;
    documentB?: Color$2;
};

type DocumentComparisonConfiguration = {
    documentA: DocumentComparisonSource;
    documentB: DocumentComparisonSource;
    strokeColors?: DocumentComparisonStrokeColors;
    blendMode?: IBlendMode;
    autoCompare: boolean;
};

type DocumentComparisonUIStartEvent = DocumentComparisonConfiguration;

type CommentsMentionEvent = {
    comment: Comment;
    modifications: List<{
        userId: string;
        action: 'ADDED' | 'REMOVED';
    }>;
};

type Signature = InkAnnotation | ImageAnnotation;
interface HistoryEvent<T> {
    action: T;
    before: AnnotationsUnion;
    after: AnnotationsUnion;
}
interface EventMap {
    'viewState.change': (viewState: ViewState, previousViewState: ViewState) => void;
    'viewState.currentPageIndex.change': (pageIndex: number) => void;
    'viewState.zoom.change': (zoom: number) => void;
    'annotationPresets.update': (event: AnnotationPresetsUpdateEvent) => void;
    'annotations.blur': (event: AnnotationsBlurEvent) => void;
    'annotations.change': () => void;
    'annotations.create': (annotations: List<AnnotationsUnion>) => void;
    'annotations.delete': (annotations: List<AnnotationsUnion>) => void;
    'annotations.didSave': () => void;
    'annotations.focus': (event: AnnotationsFocusEvent) => void;
    'annotations.load': (annotations: List<AnnotationsUnion>) => void;
    'annotations.press': (event: AnnotationsPressEvent) => void;
    'annotations.update': (annotations: List<AnnotationsUnion>) => void;
    'annotations.willChange': (event: {
        reason: AnnotationsWillChangeReason;
        annotations: List<AnnotationsUnion>;
    }) => void;
    'annotations.willSave': () => void;
    'annotationSelection.change': (annotation?: AnnotationsUnion) => void;
    'annotations.transform': (event: AnnotationsTransformEvent) => void;
    'annotations.copy': (event: AnnotationsCopyEvent) => void;
    'annotations.cut': (event: AnnotationsCutEvent) => void;
    'annotations.paste': (event: AnnotationsPasteEvent) => void;
    'annotations.duplicate': (event: AnnotationsDuplicateEvent) => void;
    'bookmarks.change': () => void;
    'bookmarks.create': (bookmarks: List<Bookmark>) => void;
    'bookmarks.update': (bookmarks: List<Bookmark>) => void;
    'bookmarks.delete': (bookmarks: List<Bookmark>) => void;
    'bookmarks.load': (bookmarks: List<Bookmark>) => void;
    'bookmarks.didSave': () => void;
    'bookmarks.willSave': () => void;
    'comments.change': () => void;
    'comments.create': (comments: List<Comment>) => void;
    'comments.delete': (comments: List<Comment>) => void;
    'comments.update': (comments: List<Comment>) => void;
    'comments.load': () => void;
    'comments.willSave': () => void;
    'comments.didSave': () => void;
    'instant.connectedClients.change': (clients: Map<string, InstantClient>) => void;
    'document.change': (operations: DocumentOperation[]) => void;
    'document.saveStateChange': (event: SaveStateChangeEvent) => void;
    'formFieldValues.update': (formFields: List<FormField>) => void;
    'formFieldValues.willSave': () => void;
    'formFieldValues.didSave': (res: {
        response: Response;
        error: Error;
    }) => void;
    'forms.willSubmit': (event: {
        preventDefault: () => void;
    }) => void;
    'forms.didSubmit': (event: {
        preventDefault: () => void;
    }) => void;
    'formFields.change': () => void;
    'formFields.create': (formFields: List<FormField>) => void;
    'formFields.delete': (formFields: List<FormField>) => void;
    'formFields.didSave': () => void;
    'formFields.load': (formFields: List<FormField>) => void;
    'formFields.update': (formFields: List<FormField>) => void;
    'formFields.willSave': () => void;
    'search.stateChange': (searchState: SearchState) => void;
    'search.termChange': (event: SearchTermChangeEvent) => void;
    'storedSignatures.change': () => void;
    'storedSignatures.create': (signature: Signature) => void;
    'storedSignatures.delete': (signature: Signature) => void;
    'storedSignatures.update': (signatures: List<Signature>) => void;
    'textLine.press': (event: TextLinePressEvent) => void;
    'textSelection.change': (selection: PublicTextSelection | null) => void;
    'history.change': (event: HistoryEvent<'undo' | 'redo'>) => void;
    'history.willChange': (event: {
        type: 'create' | 'update' | 'delete';
        annotation: Annotation;
        preventDefault: () => void;
    }) => void;
    'history.clear': () => void;
    'history.redo': (event: HistoryEvent<'redo'>) => void;
    'history.undo': (event: HistoryEvent<'undo'>) => void;
    'page.press': (event: PagePressEvent) => void;
    'inkSignatures.create': (signature: Signature) => void;
    'inkSignatures.delete': (signature: Signature) => void;
    'inkSignatures.update': (signatures: Signature[]) => void;
    'inkSignatures.change': () => void;
    'cropArea.changeStart': (opts: CropAreaChangeStartEvent) => void;
    'cropArea.changeStop': (opts: CropAreaChangeStopEvent) => void;
    'documentComparisonUI.start': (opts: DocumentComparisonUIStartEvent) => void;
    'documentComparisonUI.end': () => void;
    'annotationNote.press': (event: AnnotationNotePressEvent) => void;
    'annotationNote.hover': (event: AnnotationNoteHoverEvent) => void;
    'comments.mention': (event: CommentsMentionEvent) => void;
}

interface IEmbeddedFile {
    id: ID;
    attachmentId: string;
    description: null | string;
    fileName: null | string;
    fileSize: null | number;
    updatedAt: null | Date;
}
declare const EmbeddedFile_base: Record$1.Factory<IEmbeddedFile>;
declare class EmbeddedFile extends EmbeddedFile_base {
}

type IAnnotationToolbarType = 'stroke-color' | 'fill-color' | 'background-color' | 'opacity' | 'line-width' | 'blend-mode' | 'spacer' | 'delete' | 'annotation-note' | 'border-color' | 'border-width' | 'border-style' | 'color' | 'linecaps-dasharray' | 'line-style' | 'font' | 'overlay-text' | 'outline-color' | 'apply-redactions' | 'measurementType' | 'measurementScale' | 'back';
type BuiltInAnnotationToolbarItem = {
    type: IAnnotationToolbarType;
};
type Shared = Omit<ToolItem, 'selected' | 'type'> & {
    onPress?: (nativeEvent: MouseEvent, id?: string) => void;
    iconClassName?: string;
    onIconPress?: (nativeEvent: MouseEvent, id?: string) => void;
};
type AnnotationToolbarItem = (Omit<Shared, 'node'> & {
    type: IAnnotationToolbarType;
}) | (Omit<Shared, 'icon'> & {
    id: string;
    type: 'custom';
    icon?: string | Node;
    node?: Node;
});

type AnnotationToolbarItemsCallback = (annotation: AnnotationsUnion, options: {
    defaultAnnotationToolbarItems: BuiltInAnnotationToolbarItem[];
    hasDesktopLayout: boolean;
}) => AnnotationToolbarItem[];

type OnWidgetAnnotationCreationStartCallback = (annotation: WidgetAnnotation, formField: FormField) => {
    annotation?: WidgetAnnotation;
    formField?: FormField;
};

interface ITextRange {
    startNode: Text | null;
    startOffset: number | null;
    endNode: Text | null;
    endOffset: number | null;
}
declare const TextRange_base: Record$1.Factory<ITextRange>;
declare class TextRange extends TextRange_base {
    startNode: Text;
    startOffset: number;
    endNode: Text;
    endOffset: number;
    startAndEndIds(): {
        startTextLineId: number;
        endTextLineId: number;
        startNestedContentBlockId: string;
        endNestedContentBlockId: string;
        startPageIndex: number;
        endPageIndex: number;
    } | null;
}

interface ITextSelection {
    textRange: TextRange | null;
    startTextLineId: number | null;
    endTextLineId: number | null;
    startNestedContentBlockId: string | null;
    endNestedContentBlockId: string | null;
    startPageIndex: number | null;
    endPageIndex: number | null;
}
declare const TextSelection_base: Record$1.Factory<ITextSelection>;
declare class TextSelection extends TextSelection_base {
}

declare const builtInItems: readonly ["highlight", "strikeout", "underline", "squiggle", "redact-text-highlighter", "comment"];
type InlineToolbarType = (typeof builtInItems)[number];
type InlineTextSelectionToolbarItem = Omit<ToolItem, 'type'> & {
    type: InlineToolbarType | 'custom';
};
type InlineTextSelectionToolbarItemsCallback = (options: {
    defaultItems: InlineTextSelectionToolbarItem[];
    hasDesktopLayout: boolean;
}, selection: TextSelection) => InlineTextSelectionToolbarItem[];

type MeasurementValueConfiguration = {
    name?: string;
    scale: IMeasurementScale;
    precision: IMeasurementPrecision;
    selected?: boolean;
};
type MeasurementValueConfigurationCallback = (configuration: MeasurementValueConfiguration[]) => MeasurementValueConfiguration[];

declare const DocumentPermissionsEnum: {
    readonly annotationsAndForms: "annotationsAndForms";
    readonly assemble: "assemble";
    readonly extract: "extract";
    readonly extractAccessibility: "extractAccessibility";
    readonly fillForms: "fillForms";
    readonly modification: "modification";
    readonly printHighQuality: "printHighQuality";
    readonly printing: "printing";
};
type IDocumentPermissions = (typeof DocumentPermissionsEnum)[keyof typeof DocumentPermissionsEnum];

type OCGLayer = {
    name: string;
    ocgId: number;
    radioGroup?: number;
};
type OCGCollection = {
    name?: string;
    ocgId?: number;
    layers: OCGLayer[];
};
type OCG = OCGLayer | OCGCollection;
type OCGLayers = OCG[];
type OCGLayersVisibilityState = {
    visibleLayerIds: number[];
};

type ViewStateSetter = (currentState: ViewState) => ViewState;
type ToolbarItemsSetter = (currentState: ToolbarItem[]) => ToolbarItem[];
type StoredSignaturesSetter = (annotations: List<InkAnnotation | ImageAnnotation>) => List<InkAnnotation | ImageAnnotation>;
type SearchStateSetter = (currentState: SearchState) => SearchState;
type AnnotationPresetsSetter = (currentState: Record<string, AnnotationPreset$1>) => Record<string, AnnotationPreset$1>;
type StampAnnotationTemplatesSetter = (currentState: Array<StampAnnotation | ImageAnnotation>) => Array<StampAnnotation | ImageAnnotation>;
type SetDocumentEditorFooterFunction = (currentState: DocumentEditorFooterItem[]) => DocumentEditorFooterItem[];
type SetDocumentEditorToolbarFunction = (currentState: DocumentEditorToolbarItem[]) => DocumentEditorToolbarItem[];
declare class Instance {
    totalPageCount: number;
    pageInfoForIndex: (pageIndex: number) => PageInfo | null | undefined;
    textLinesForPageIndex: (pageIndex: number) => Promise<List<TextLine>>;
    getMarkupAnnotationText: (annotation: TextMarkupAnnotationsUnion) => Promise<string>;
    getTextFromRects: (pageIndex: number, rects: List<Rect>) => Promise<string>;
    getDocumentPermissions: () => Promise<Record<IDocumentPermissions, boolean>>;
    currentZoomLevel: number;
    maximumZoomLevel: number;
    minimumZoomLevel: number;
    zoomStep: number;
    disablePointSnapping: boolean;
    connectedClients: Map<string, InstantClient>;
    addEventListener: <K extends keyof EventMap>(action: K, listener: EventMap[K]) => void;
    removeEventListener: <K extends keyof EventMap>(action: K, listener: EventMap[K]) => void;
    jumpToRect: (pageIndex: number, rect: Rect) => void;
    jumpAndZoomToRect: (pageIndex: number, rect: Rect) => void;
    transformContentClientToPageSpace: (rectOrPoint: Rect | Point, pageIndex: number) => Rect | Point;
    transformContentPageToClientSpace: (rectOrPoint: Rect | Point, pageIndex: number) => Rect | Point;
    transformClientToPageSpace: (rectOrPoint: Rect | Point, pageIndex: number) => Rect | Point;
    transformPageToClientSpace: (rectOrPoint: Rect | Point, pageIndex: number) => Rect | Point;
    transformRawToPageSpace: (rawInset: InsetJSON | Inset, pageIndex: number) => Rect;
    transformPageToRawSpace: (rect: Rect, pageIndex: number) => Inset;
    exportOffice: (options: ExportOfficeFlags) => Promise<ArrayBuffer>;
    exportPDF: (flags?: ExportPDFFlags) => Promise<ArrayBuffer>;
    exportXFDF: () => Promise<string>;
    exportInstantJSON: (version?: number) => Promise<InstantJSON>;
    renderPageAsArrayBuffer: (options: {
        width: number;
    } | {
        height: number;
    }, pageIndex: number) => Promise<ArrayBuffer>;
    renderPageAsImageURL: (options: {
        width: number;
    } | {
        height: number;
    }, pageIndex: number) => Promise<string>;
    print: (printMode?: IPrintMode | {
        mode?: IPrintMode;
        excludeAnnotations?: boolean;
    }) => void;
    abortPrint: () => void;
    setCustomRenderers: (customRenderers: CustomRenderers) => void;
    setCustomUIConfiguration: (customUIConfigurationOrConfigurationSetter: CustomUI | ((customUI: CustomUI | null) => CustomUI)) => void;
    getDocumentOutline: () => Promise<List<OutlineElement>>;
    setDocumentOutline: (outline: List<OutlineElement>) => void;
    getPageGlyphs: (pageIndex: number) => Promise<List<Glyph>>;
    setAnnotationCreatorName: (annotationCreatorName?: string | null) => void;
    setOnWidgetAnnotationCreationStart: (callback: OnWidgetAnnotationCreationStartCallback) => void;
    setOnCommentCreationStart: (callback: OnCommentCreationStartCallback) => void;
    getLayers: () => Promise<OCGLayers>;
    getLayersVisibilityState: () => Promise<OCGLayersVisibilityState>;
    setLayersVisibilityState: (visibilityState: OCGLayersVisibilityState) => Promise<void>;
    contentWindow: Window;
    contentDocument: Document | ShadowRoot;
    readonly viewState: ViewState;
    setViewState: (stateOrFunction: ViewStateSetter | ViewState) => void;
    readonly toolbarItems: ToolbarItem[];
    setToolbarItems: (stateOrFunction: ToolbarItemsSetter | ToolbarItem[]) => void;
    setAnnotationToolbarItems: (annotationToolbarItemsCallback: AnnotationToolbarItemsCallback) => void;
    setInlineTextSelectionToolbarItems: (InlineTextSelectionToolbarItemsCallback: InlineTextSelectionToolbarItemsCallback) => void;
    annotationPresets: Record<AnnotationPresetID$1, AnnotationPreset$1>;
    setAnnotationPresets: (stateOrFunction: AnnotationPresetsSetter | Record<AnnotationPresetID$1, AnnotationPreset$1>) => void;
    setCurrentAnnotationPreset: (annotationPresetID?: string | null) => void;
    readonly currentAnnotationPreset: string | null | undefined;
    readonly stampAnnotationTemplates: Array<StampAnnotation | ImageAnnotation>;
    setStampAnnotationTemplates: (stateOrFunction: StampAnnotationTemplatesSetter | Array<StampAnnotation | ImageAnnotation>) => void;
    getAnnotations: (pageIndex: number) => Promise<List<AnnotationsUnion>>;
    createAttachment: (file: Blob) => Promise<string>;
    getAttachment: (attachmentId: string) => Promise<Blob>;
    calculateFittingTextAnnotationBoundingBox: (annotation: TextAnnotation) => TextAnnotation;
    setOnAnnotationResizeStart: (callback: AnnotationResizeStartCallback) => void;
    getOverlappingAnnotations: (annotationOrFormField: AnnotationsUnion | FormField) => Promise<List<AnnotationsUnion>>;
    getBookmarks: () => Promise<List<Bookmark>>;
    getFormFields: () => Promise<List<FormField>>;
    getFormFieldValues: () => Record<string, null | string | Array<string>>;
    setFormFieldValues: (formFieldValues: Record<string, null | string | Array<string>>) => void;
    getTextSelection: () => Record<string, any> | null | undefined;
    getSelectedAnnotation: () => AnnotationsUnion | null | undefined;
    getSelectedAnnotations: () => List<AnnotationsUnion> | null | undefined;
    getAnnotationsGroups: () => Map<string, {
        groupKey: string;
        annotationsIds: Set$1<ID>;
    }> | null | undefined;
    setSelectedAnnotation: (annotationOrAnnotationId?: (AnnotationsUnion | ID) | null) => void;
    setSelectedAnnotations: (annotationsOrAnnotationsId?: List<AnnotationsUnion | ID> | null) => void;
    groupAnnotations: (annotationsOrAnnotationsId?: List<AnnotationsUnion | ID>) => void;
    deleteAnnotationsGroup: (annotationGroupId?: string) => void;
    setEditingAnnotation: (annotationOrAnnotationId?: (AnnotationsUnion | ID) | null, autoSelectText?: boolean | null) => void;
    setCustomOverlayItem: (item: CustomOverlayItem) => void;
    removeCustomOverlayItem: (id: CustomOverlayItemID) => void;
    readonly locale: string;
    setLocale: (arg0: string) => Promise<void>;
    getInkSignatures: () => Promise<List<InkAnnotation | ImageAnnotation>>;
    getStoredSignatures: () => Promise<List<InkAnnotation | ImageAnnotation>>;
    setInkSignatures: (stateOrFunction: StoredSignaturesSetter | List<InkAnnotation | ImageAnnotation>) => Promise<void>;
    setStoredSignatures: (stateOrFunction: StoredSignaturesSetter | List<InkAnnotation | ImageAnnotation>) => Promise<void>;
    search: (term: string, options?: {
        startPageIndex?: number;
        endPageIndex?: number;
        searchType?: ISearchType;
        searchInAnnotations?: boolean;
        caseSensitive?: boolean;
    }) => Promise<List<SearchResult>>;
    startUISearch: (term: string) => void;
    readonly searchState: SearchState;
    setSearchState: (stateOrFunction: SearchStateSetter | SearchState) => void;
    readonly editableAnnotationTypes: Array<Class<AnnotationsUnion>>;
    setEditableAnnotationTypes: (arg0: Array<Class<AnnotationsUnion>>) => void;
    setIsEditableAnnotation: (arg0: IsEditableAnnotationCallback) => void;
    setIsEditableComment: (arg0: IsEditableCommentCallback) => void;
    setGroup: (group: string) => void;
    resetGroup: () => void;
    setMentionableUsers: (users: MentionableUser$1[]) => void;
    setMaxMentionSuggestions: (maxSuggestions: number) => void;
    getComments: () => Promise<List<Comment>>;
    setDocumentEditorFooterItems: (stateOrFunction: DocumentEditorFooterItem[] | SetDocumentEditorFooterFunction) => void;
    setDocumentEditorToolbarItems: (stateOrFunction: DocumentEditorToolbarItem[] | SetDocumentEditorToolbarFunction) => void;
    getSignaturesInfo: () => Promise<SignaturesInfo>;
    signDocument: (arg0: SignatureCreationData | null, arg1?: TwoStepSignatureCallback | SigningServiceData) => Promise<void>;
    setSignaturesLTV: (certificates?: ArrayBuffer[] | string[]) => Promise<SignaturesInfo>;
    applyOperations: (operations: Array<DocumentOperation>) => Promise<void>;
    exportPDFWithOperations: (arg0: Array<DocumentOperation>) => Promise<ArrayBuffer>;
    applyRedactions: () => Promise<void>;
    save: () => Promise<void>;
    hasUnsavedChanges: () => boolean;
    ensureChangesSaved: (changes: Change | Array<Change>) => Promise<Array<Change>>;
    create: (changes: Change | Array<Change> | List<Change>) => Promise<Array<Change>>;
    update: (changes: Change | Array<Change> | List<Change>) => Promise<Array<Change>>;
    delete: (ids: InstantID | Change | Array<InstantID | Change> | List<InstantID | Change>) => Promise<Array<Change>>;
    toggleClipboardActions: (enable: boolean) => void;
    setMeasurementSnapping: (enable: boolean) => void;
    setMeasurementPrecision: (precision: IMeasurementPrecision) => void;
    setMeasurementScale: (scale: MeasurementScale) => void;
    setMeasurementValueConfiguration: (configurationCallback: MeasurementValueConfigurationCallback) => void;
    createRedactionsBySearch: (term: string | ISearchPattern, options?: {
        searchType?: ISearchType;
        searchInAnnotations?: boolean;
        caseSensitive?: boolean;
        annotationPreset?: RedactionAnnotationPreset;
    }) => Promise<List<string>>;
    history: {
        undo: () => Promise<boolean>;
        redo: () => Promise<boolean>;
        clear: () => void;
        enable: () => void;
        disable: () => void;
        canUndo: () => boolean;
        canRedo: () => boolean;
    };
    setDocumentComparisonMode: (documentComparisonConfiguration: DocumentComparisonConfiguration | null) => void;
    compareDocuments: (comparisonDocuments: ComparisonDocuments, operations: ComparisonOperation) => Promise<DocumentComparisonResult>;
    getEmbeddedFiles: () => Promise<List<EmbeddedFile>>;
    getPageTabOrder: (pageIndex: number) => Promise<ID[]>;
    setPageTabOrder: (pageIndex: number, annotationIdsSortCallback: (tabOrderedAnnotations: AnnotationsUnion[]) => ID[]) => Promise<void>;
    enableAlwaysScrollToZoom: boolean;
}

type ComparisonDocuments = {
    originalDocument: DocumentDescriptor;
    changedDocument: DocumentDescriptor;
};
type Range = {
    position: number;
    length: number;
};
type TextBlock = {
    range: Range;
    rects: number[][];
};
type Operation = {
    type: 'insert' | 'delete' | 'equal';
    text: string;
    originalTextBlocks: TextBlock;
    changedTextBlocks: TextBlock;
};
type Hunk = {
    originalRange: Range;
    changedRange: Range;
    operations: Operation[];
};
type ComparisonResult = {
    type: 'text';
    hunks: Hunk[];
};
type PageComparisonResult = {
    originalPageIndex: number;
    changedPageIndex: number;
    comparisonResults: ComparisonResult[];
};
type DocumentComparisonResult = {
    documentComparisonResults: PageComparisonResult[];
} | null;

declare const ProductId: {
    SharePoint: string;
    Salesforce: string;
    Maui_Android: string;
    Maui_iOS: string;
    Maui_MacCatalyst: string;
    Maui_Windows: string;
    FlutterForWeb: string;
    Electron: string;
};
type IProductId = (typeof ProductId)[keyof typeof ProductId];

type ActionFlags = 'includeExclude' | 'includeNoValueFields' | 'exportFormat' | 'getMethod' | 'submitCoordinated' | 'xfdf' | 'includeAppendSaves' | 'includeAnnotations' | 'submitPDF' | 'canonicalFormat' | 'excludeNonUserAnnotations' | 'excludeFKey' | 'embedForm';
type ActionJSON = {
    type: 'uri';
    uri: string;
    subactions?: Array<ActionJSON>;
} | {
    type: 'goTo';
    pageIndex: number;
    subactions?: Array<ActionJSON>;
} | {
    type: 'goToEmbedded';
    newWindow: boolean;
    relativePath: string;
    targetType: 'parent' | 'child';
    subactions?: Array<ActionJSON>;
} | {
    type: 'goToRemote';
    relativePath: string;
    namedDestination: string;
    subactions?: Array<ActionJSON>;
} | {
    type: 'hide';
    hide: boolean;
    annotationReferences: Array<AnnotationReference>;
    subactions?: Array<ActionJSON>;
} | {
    type: 'resetForm';
    fields: Array<string> | null;
    flags: string | null;
    subactions?: Array<ActionJSON>;
} | {
    type: 'submitForm';
    uri: string;
    fields: Array<string> | null;
    flags: Array<ActionFlags> | null;
    subactions?: Array<ActionJSON>;
} | {
    type: 'launch';
    filePath: string;
    subactions?: Array<ActionJSON>;
} | {
    type: 'named';
    action: string;
    subactions?: Array<ActionJSON>;
} | {
    type: 'javaScript';
    script: string;
    subactions?: Array<ActionJSON>;
};
type BookmarkJSON = {
    v: 1;
    type: 'pspdfkit/bookmark';
    id: string;
    name: string | null;
    sortKey: number | null;
    action: ActionJSON;
    pdfBookmarkId: string | null;
};
type RawPdfBoxes = {
    bleedBox: null | IRectJSON;
    cropBox: null | IRectJSON;
    mediaBox: null | IRectJSON;
    trimBox: null | IRectJSON;
};

type IRectJSON = [left: number, top: number, width: number, height: number];

type BaseAnnotationJSON = {
    v: number;
    type?: 'pspdfkit/ink' | 'pspdfkit/shape/line' | 'pspdfkit/shape/rectangle' | 'pspdfkit/shape/ellipse' | 'pspdfkit/shape/polygon' | 'pspdfkit/shape/polyline' | 'pspdfkit/link' | 'pspdfkit/markup/highlight' | 'pspdfkit/markup/squiggly' | 'pspdfkit/markup/strikeout' | 'pspdfkit/markup/underline' | 'pspdfkit/markup/redaction' | 'pspdfkit/stamp' | 'pspdfkit/text' | 'pspdfkit/note' | 'pspdfkit/image' | 'pspdfkit/media' | 'pspdfkit/widget' | 'pspdfkit/comment-marker' | 'pspdfkit/unknown';
    name?: string | null;
    id: string;
    subject?: string | null;
    pdfObjectId?: number | null;
    pageIndex: number;
    bbox: IRectJSON;
    opacity?: number;
    flags?: ('noPrint' | 'noZoom' | 'noRotate' | 'noView' | 'hidden' | 'locked' | 'lockedContents' | 'readOnly')[] | null;
    action?: ActionJSON | null;
    note?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    creatorName?: string | null;
    customData?: Record<string, unknown> | null;
    isCommentThreadRoot?: boolean;
    isAnonymous?: boolean;
    APStreamCache?: {
        cache: string;
    } | {
        attach: string;
    };
    blendMode?: IBlendMode | null;
} & ICollaboratorPermissionsOptions;
type ImageAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/image';
    description?: string | null;
    fileName?: string | null;
    contentType: string;
    imageAttachmentId: string;
    rotation: number;
    isSignature?: boolean;
    xfdfAppearanceStream?: string;
    xfdfAppearanceStreamOriginalPageRotation?: number;
};
type ShapeAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    strokeWidth: number;
    strokeColor: string | null;
    fillColor: string | null;
    strokeDashArray?: [number, number] | null;
    measurementPrecision?: IMeasurementPrecision | null;
    measurementScale?: MeasurementScaleJSON | null;
    lineWidth?: number | null;
};
type EllipseAnnotationJSON = ShapeAnnotationJSON & {
    type: 'pspdfkit/shape/ellipse';
    cloudyBorderIntensity: number | null;
    cloudyBorderInset: InsetJSON | null;
    measurementBBox: IRectJSON | null;
};
type LineAnnotationJSON = ShapeAnnotationJSON & {
    type: 'pspdfkit/shape/line';
    startPoint: [number, number];
    endPoint: [number, number];
    lineCaps?: LineCapsType | null;
    lines?: {
        points: [number, number][][];
        intensities: number[][];
    };
};
type PolygonAnnotationJSON = ShapeAnnotationJSON & {
    type: 'pspdfkit/shape/polygon';
    points: [number, number][];
    cloudyBorderIntensity: number | null;
    lines?: {
        points: [number, number][][];
        intensities: number[][];
    };
};
type PolylineAnnotationJSON = ShapeAnnotationJSON & {
    type: 'pspdfkit/shape/polyline';
    points: [number, number][];
    lineCaps?: LineCapsType | null;
    lines?: {
        points: [number, number][][];
        intensities: number[][];
    };
};
type RectangleAnnotationJSON = ShapeAnnotationJSON & {
    type: 'pspdfkit/shape/rectangle';
    cloudyBorderIntensity: number | null;
    cloudyBorderInset?: InsetJSON | null;
    measurementBBox: IRectJSON | null;
};
type InkAnnotationJSON = BaseAnnotationJSON & {
    type: 'pspdfkit/ink';
    lines: {
        points: [number, number][][];
        intensities: number[][];
    };
    lineWidth: number;
    strokeColor: string | null;
    backgroundColor: string | null;
    isDrawnNaturally: boolean;
    isSignature: boolean;
};
type LinkAnnotationJSON = BaseAnnotationJSON & {
    type: 'pspdfkit/link';
    borderColor?: string | null;
    borderWidth?: number | null;
    borderStyle?: IBorderStyle | null;
};
type NoteAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/note';
    text?: {
        format: 'plain';
        value: string;
    };
    icon?: string;
    color?: string;
};
type MediaAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/media';
    description: string | null;
    fileName: string | null;
    contentType: string | null;
    mediaAttachmentId: string | null;
};
type BaseTextMarkupAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    rects: [number, number, number, number][];
};
type TextMarkupAnnotationJSON = BaseTextMarkupAnnotationJSON & {
    type: 'pspdfkit/markup/highlight' | 'pspdfkit/markup/squiggly' | 'pspdfkit/markup/strikeout' | 'pspdfkit/markup/underline' | 'pspdfkit/markup/redaction';
    color: string | null;
};
type RedactionAnnotationJSON = BaseTextMarkupAnnotationJSON & {
    type: 'pspdfkit/markup/redaction';
    fillColor?: string | null;
    outlineColor?: string | null;
    overlayText?: string | null;
    repeatOverlayText?: boolean | null;
    rotation?: number;
    color?: string | null;
};
type StampAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/stamp';
    stampType: StampKind;
    title: string | null;
    color?: string | null;
    subTitle?: string | null;
    subtitle: string | null;
    rotation: number | null;
    xfdfAppearanceStream?: string;
    xfdfAppearanceStreamOriginalPageRotation?: number;
    kind?: StampKind;
};
type TextAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/text';
    text: {
        format: 'xhtml' | 'plain';
        value: string;
    };
    fontColor?: string | null;
    backgroundColor?: string | null;
    font?: string | null;
    rotation?: number | null;
    fontSize?: number | null;
    fontStyle?: string[] | null;
    horizontalAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'center' | 'bottom';
    callout?: {
        start: [number, number];
        knee?: [number, number] | null;
        end: [number, number];
        cap?: ILineCap | null;
        innerRectInset?: InsetJSON | null;
    } | null;
    borderStyle?: IBorderStyle | null;
    borderWidth?: number | null;
    borderColor?: string | null;
    isFitting?: boolean;
    lineHeightFactor?: number | null;
};
type UnknownAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/unknown';
};
type WidgetAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/widget';
    formFieldName: string;
    borderColor?: string | null;
    borderStyle?: IBorderStyle | null;
    borderDashArray?: number[] | null;
    borderWidth?: number | null;
    font?: string | null;
    fontSize?: 'auto' | number | null;
    fontColor?: string | null;
    backgroundColor?: string | null;
    horizontalAlign?: 'left' | 'center' | 'right' | null;
    verticalAlign?: 'top' | 'center' | 'bottom' | null;
    fontStyle?: string[] | null | undefined;
    rotation?: number;
    additionalActions?: SerializedAdditionalActionsType | null;
    lineHeightFactor?: number | null;
};
type CommentMarkerAnnotationJSON = Omit<BaseAnnotationJSON, 'type'> & {
    type: 'pspdfkit/comment-marker';
};
type AnnotationJSONUnion = TextMarkupAnnotationJSON | TextAnnotationJSON | WidgetAnnotationJSON | RedactionAnnotationJSON | StampAnnotationJSON | NoteAnnotationJSON | LinkAnnotationJSON | InkAnnotationJSON | RectangleAnnotationJSON | PolylineAnnotationJSON | PolygonAnnotationJSON | LineAnnotationJSON | EllipseAnnotationJSON | ImageAnnotationJSON | UnknownAnnotationJSON | MediaAnnotationJSON | CommentMarkerAnnotationJSON;

declare const Theme$1: {
    readonly LIGHT: "LIGHT";
    readonly DARK: "DARK";
    readonly AUTO: "AUTO";
};
type ITheme = (typeof Theme$1)[keyof typeof Theme$1];

interface ResolvedDateTimeFormatOptions extends Intl.ResolvedDateTimeFormatOptions {
    hourCycle?: Intl.DateTimeFormatOptions['hourCycle'];
}
interface DateRangeFormatPart extends Intl.DateTimeFormatPart {
    source: 'startRange' | 'endRange' | 'shared';
}
/** A wrapper around Intl.DateTimeFormat that fixes various browser bugs, and polyfills new features. */
declare class DateFormatter implements Intl.DateTimeFormat {
    constructor(locale: string, options?: Intl.DateTimeFormatOptions);
    /** Formats a date as a string according to the locale and format options passed to the constructor. */
    format(value: Date): string;
    /** Formats a date to an array of parts such as separators, numbers, punctuation, and more. */
    formatToParts(value: Date): Intl.DateTimeFormatPart[];
    /** Formats a date range as a string. */
    formatRange(start: Date, end: Date): string;
    /** Formats a date range as an array of parts. */
    formatRangeToParts(start: Date, end: Date): DateRangeFormatPart[];
    /** Returns the resolved formatting options based on the values passed to the constructor. */
    resolvedOptions(): ResolvedDateTimeFormatOptions;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface AriaLabelingProps {
  /**
   * Defines a string value that labels the current element.
   */
  'aria-label'?: string,

  /**
   * Identifies the element (or elements) that labels the current element.
   */
  'aria-labelledby'?: string,

  /**
   * Identifies the element (or elements) that describes the object.
   */
  'aria-describedby'?: string,

  /**
   * Identifies the element (or elements) that provide a detailed, extended description for the object.
   */
  'aria-details'?: string
}

interface AriaValidationProps {
  // https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage
  /**
   * Identifies the element that provides an error message for the object.
   */
  'aria-errormessage'?: string
}

// A set of common DOM props that are allowed on any component
// Ensure this is synced with DOMPropNames in filterDOMProps
interface DOMProps {
  /**
   * The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id).
   */
  id?: string
}

interface FocusableDOMProps extends DOMProps {
  /**
   * Whether to exclude the element from the sequential tab order. If true,
   * the element will not be focusable via the keyboard by tabbing. This should
   * be avoided except in rare scenarios where an alternative means of accessing
   * the element or its functionality via the keyboard is available.
   */
  excludeFromTabOrder?: boolean
}


interface TextInputDOMEvents {
  // Clipboard events
  /**
   * Handler that is called when the user copies text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy).
   */
   onCopy?: ClipboardEventHandler<HTMLInputElement>,

   /**
    * Handler that is called when the user cuts text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut).
    */
   onCut?: ClipboardEventHandler<HTMLInputElement>,

   /**
    * Handler that is called when the user pastes text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste).
    */
   onPaste?: ClipboardEventHandler<HTMLInputElement>,

   // Composition events
   /**
    * Handler that is called when a text composition system starts a new text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event).
    */
   onCompositionStart?: CompositionEventHandler<HTMLInputElement>,

   /**
    * Handler that is called when a text composition system completes or cancels the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event).
    */
   onCompositionEnd?: CompositionEventHandler<HTMLInputElement>,

   /**
    * Handler that is called when a new character is received in the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event).
    */
   onCompositionUpdate?: CompositionEventHandler<HTMLInputElement>,

   // Selection events
   /**
    * Handler that is called when text in the input is selected. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/select_event).
    */
   onSelect?: ReactEventHandler<HTMLInputElement>,

   // Input events
   /**
    * Handler that is called when the input value is about to be modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event).
    */
   onBeforeInput?: FormEventHandler<HTMLInputElement>,
   /**
    * Handler that is called when the input value is modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event).
    */
   onInput?: FormEventHandler<HTMLInputElement>
}

interface InputDOMProps {
  /**
   * The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: string
}

// DOM props that apply to all text inputs
// Ensure this is synced with useTextField
interface TextInputDOMProps extends DOMProps, InputDOMProps, TextInputDOMEvents {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,

  /**
   * The maximum number of characters supported by the input. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefmaxlength).
   */
  maxLength?: number,

  /**
   * The minimum number of characters required by the input. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefminlength).
   */
  minLength?: number,

  /**
   * Regex pattern that the value of the input must match to be valid. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefpattern).
   */
  pattern?: string,

  /**
   * Content that appears in the input when it is empty. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefplaceholder).
   */
  placeholder?: string,

  /**
   * The type of input to render. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdeftype).
   */
  type?: 'text' | 'search' | 'url' | 'tel' | 'email' | 'password' | (string & {}),

  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents. See [MDN](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute).
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
}

// Make sure to update filterDOMProps.ts when updating this.
interface LinkDOMProps {
  /** A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). */
  href?: string,
  /** The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). */
  target?: HTMLAttributeAnchorTarget,
  /** The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). */
  rel?: string,
  /** Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). */
  download?: boolean | string,
  /** A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). */
  ping?: string,
  /** How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). */
  referrerPolicy?: HTMLAttributeReferrerPolicy
}

/** Any focusable element, including both HTML and SVG elements. */
interface FocusableElement extends Element, HTMLOrSVGElement {}

/** All DOM attributes supported across both HTML and SVG elements. */
interface DOMAttributes<T = FocusableElement> extends AriaAttributes, DOMAttributes$1<T> {
  id?: string | undefined,
  role?: AriaRole | undefined,
  tabIndex?: number | undefined,
  style?: CSSProperties | undefined,
  className?: string | undefined
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


type ValidationState = 'valid' | 'invalid';

type ValidationError = string | string[];

interface Validation<T> {
  /** Whether user input is required on the input before form submission. */
  isRequired?: boolean,
  /** Whether the input value is invalid. */
  isInvalid?: boolean,
  /** @deprecated Use `isInvalid` instead. */
  validationState?: ValidationState,
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when the value is missing or invalid, or mark the field as required
   * or invalid via ARIA.
   * @default 'aria'
   */
  validationBehavior?: 'aria' | 'native',
  /**
   * A function that returns an error message if a given value is invalid.
   * Validation errors are displayed to the user when the form is submitted
   * if `validationBehavior="native"`. For realtime validation, use the `isInvalid`
   * prop instead.
   */
  validate?: (value: T) => ValidationError | true | null | undefined
}

interface ValidationResult {
  /** Whether the input value is invalid. */
  isInvalid: boolean,
  /** The current error messages for the input if it is invalid, otherwise an empty array. */
  validationErrors: string[],
  /** The native validation details for the input. */
  validationDetails: ValidityState
}

interface InputBase {
  /** Whether the input is disabled. */
  isDisabled?: boolean,
  /** Whether the input can be selected but not changed by the user. */
  isReadOnly?: boolean
}

interface ValueBase<T, C = T> {
  /** The current value (controlled). */
  value?: T,
  /** The default value (uncontrolled). */
  defaultValue?: T,
  /** Handler that is called when the value changes. */
  onChange?: (value: C) => void
}

interface TextInputBase {
  /** Temporary text that occupies the text input when it is empty. */
  placeholder?: string
}

interface RangeInputBase<T> {
  /** The smallest value allowed for the input. */
  minValue?: T,
  /** The largest value allowed for the input. */
  maxValue?: T,
  /** The amount that the input value changes with each increment or decrement "tick". */
  step?: T // ??
}

interface HelpTextProps {
  /** A description for the field. Provides a hint such as specific requirements for what to choose. */
  description?: ReactNode,
  /** An error message for the field. */
  errorMessage?: ReactNode | ((v: ValidationResult) => ReactNode)
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface SingleSelection {
  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: boolean,
  /** The currently selected key in the collection (controlled). */
  selectedKey?: Key | null,
  /** The initial selected key in the collection (uncontrolled). */
  defaultSelectedKey?: Key,
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key) => any
}

type SelectionMode = 'none' | 'single' | 'multiple';
type SelectionBehavior = 'toggle' | 'replace';
type Selection$1 = 'all' | Set<Key>;
interface MultipleSelection {
  /** The type of selection that is allowed in the collection. */
  selectionMode?: SelectionMode,
  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: boolean,
  /** The currently selected keys in the collection (controlled). */
  selectedKeys?: 'all' | Iterable<Key>,
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKeys?: 'all' | Iterable<Key>,
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (keys: Selection$1) => any,
  /** The currently disabled keys in the collection (controlled). */
  disabledKeys?: Iterable<Key>
}

type FocusStrategy = 'first' | 'last';
type DisabledBehavior = 'selection' | 'all';

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface DragDropEvent {
  /** The x coordinate of the event, relative to the target element. */
  x: number,
  /** The y coordinate of the event, relative to the target element. */
  y: number
}

type DropOperation = 'copy' | 'link' | 'move' | 'cancel';

interface DragItem {
  [type: string]: string
}

interface DragStartEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragstart'
}

interface DragMoveEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragmove'
}

interface DragEndEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragend',
  /** The drop operation that occurred. */
  dropOperation: DropOperation
}

interface DropEnterEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropenter'
}

interface DropMoveEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropmove'
}

interface DropActivateEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropactivate'
}

interface DropExitEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropexit'
}

interface TextDropItem {
  /** The item kind. */
  kind: 'text',
  /**
   * The drag types available for this item.
   * These are often mime types, but may be custom app-specific types.
   */
  types: Set<string>,
  /** Returns the data for the given type as a string. */
  getText(type: string): Promise<string>
}

interface FileDropItem {
  /** The item kind. */
  kind: 'file',
  /** The file type (usually a mime type). */
  type: string,
  /** The file name. */
  name: string,
  /** Returns the contents of the file as a blob. */
  getFile(): Promise<File>,
  /** Returns the contents of the file as a string. */
  getText(): Promise<string>
}

interface DirectoryDropItem {
  /** The item kind. */
  kind: 'directory',
  /** The directory name. */
  name: string,
  /** Returns the entries contained within the directory. */
  getEntries(): AsyncIterable<FileDropItem | DirectoryDropItem>
}

type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;

interface DropEvent extends DragDropEvent {
  /** The event type. */
  type: 'drop',
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** The dropped items. */
  items: DropItem[]
}

type DropPosition = 'on' | 'before' | 'after';
interface RootDropTarget {
  /** The event type. */
  type: 'root'
}

interface ItemDropTarget {
  /** The drop target type. */
  type: 'item',
  /** The item key. */
  key: Key,
  /** The drop position relative to the item. */
  dropPosition: DropPosition
}

type DropTarget = RootDropTarget | ItemDropTarget;

interface DroppableCollectionEnterEvent extends DropEnterEvent {
  /** The drop target. */
  target: DropTarget
}

interface DroppableCollectionActivateEvent extends DropActivateEvent {
  /** The drop target. */
  target: DropTarget
}

interface DroppableCollectionExitEvent extends DropExitEvent {
  /** The drop target. */
  target: DropTarget
}

interface DroppableCollectionDropEvent extends DropEvent {
  /** The drop target. */
  target: DropTarget
}

interface DroppableCollectionInsertDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
   /** The drop target. */
  target: ItemDropTarget
}

interface DroppableCollectionRootDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation
}

interface DroppableCollectionOnItemDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** Whether the drag originated within the same collection as the drop. */
  isInternal: boolean,
  /** The drop target. */
  target: ItemDropTarget
}

interface DroppableCollectionReorderEvent {
  /** The keys of the items that were reordered. */
  keys: Set<Key>,
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** The drop target. */
  target: ItemDropTarget
}

interface DragTypes {
  /** Returns whether the drag contains data of the given type. */
  has(type: string | symbol): boolean
}

interface DropTargetDelegate {
  /**
   * Returns a drop target within a collection for the given x and y coordinates.
   * The point is provided relative to the top left corner of the collection container.
   * A drop target can be checked to see if it is valid using the provided `isValidDropTarget` function.
   */
  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget | null
}

interface DroppableCollectionUtilityOptions {
  /**
   * The drag types that the droppable collection accepts. If the collection accepts directories, include `DIRECTORY_DRAG_TYPE` in your array of allowed types.
   * @default 'all'
   */
  acceptedDragTypes?: 'all' | Array<string | symbol>,
  /**
   * Handler that is called when external items are dropped "between" items.
   */
  onInsert?: (e: DroppableCollectionInsertDropEvent) => void,
  /**
   * Handler that is called when external items are dropped on the droppable collection's root.
   */
  onRootDrop?: (e: DroppableCollectionRootDropEvent) => void,
  /**
   * Handler that is called when items are dropped "on" an item.
   */
  onItemDrop?: (e: DroppableCollectionOnItemDropEvent) => void,
  /**
   * Handler that is called when items are reordered via drag in the source collection.
   */
  onReorder?: (e: DroppableCollectionReorderEvent) => void,
  /**
   * A function returning whether a given target in the droppable collection is a valid "on" drop target for the current drag types.
   */
  shouldAcceptItemDrop?: (target: ItemDropTarget, types: DragTypes) => boolean
}

interface DroppableCollectionBaseProps {
  /** Handler that is called when a valid drag enters a drop target. */
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void,
  /**
   * Handler that is called after a valid drag is held over a drop target for a period of time.
   * @private
   */
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void,
  /** Handler that is called when a valid drag exits a drop target. */
  onDropExit?: (e: DroppableCollectionExitEvent) => void,
  /**
   * Handler that is called when a valid drag is dropped on a drop target. When defined, this overrides other
   * drop handlers such as `onInsert`, and `onItemDrop`.
   */
  onDrop?: (e: DroppableCollectionDropEvent) => void,
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target.
   */
  getDropOperation?: (target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation
}

interface DroppableCollectionProps extends DroppableCollectionUtilityOptions, DroppableCollectionBaseProps {}

interface DraggableCollectionStartEvent extends DragStartEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>
}

interface DraggableCollectionMoveEvent extends DragMoveEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>
}

interface DraggableCollectionEndEvent extends DragEndEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>,
  /** Whether the drop ended within the same collection as it originated. */
  isInternal: boolean
}

type DragPreviewRenderer = (items: DragItem[], callback: (node: HTMLElement) => void) => void;

interface DraggableCollectionProps {
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DraggableCollectionStartEvent) => void,
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DraggableCollectionMoveEvent) => void,
  /** Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. */
  onDragEnd?: (e: DraggableCollectionEndEvent) => void,
  /** A function that returns the items being dragged. */
  getItems: (keys: Set<Key>) => DragItem[],
  /** The ref of the element that will be rendered as the drag preview while dragging. */
  preview?: RefObject<DragPreviewRenderer>,
  /** Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. */
  getAllowedDropOperations?: () => DropOperation[]
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface ItemProps$1<T> extends LinkDOMProps {
  /** Rendered contents of the item or child items. */
  children: ReactNode,
  /** Rendered contents of the item if `children` contains child items. */
  title?: ReactNode, // label?? contents?
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  /** A list of child item objects. Used for dynamic collections. */
  childItems?: Iterable<T>,
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean
}

type ItemElement<T> = ReactElement<ItemProps$1<T>>;
type ItemRenderer<T> = (item: T) => ItemElement<T>;

interface SectionProps<T> {
  /** Rendered contents of the section, e.g. a header. */
  title?: ReactNode,
  /** An accessibility label for the section. */
  'aria-label'?: string,
  /** Static child items or a function to render children. */
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>,
  /** Item objects in the section. */
  items?: Iterable<T>
}

type SectionElement<T> = ReactElement<SectionProps<T>>;

type CollectionElement<T> = SectionElement<T> | ItemElement<T>;
type CollectionChildren<T> = CollectionElement<T> | CollectionElement<T>[] | ((item: T) => CollectionElement<T>);
interface CollectionBase<T> {
  /** The contents of the collection. */
  children: CollectionChildren<T>,
  /** Item objects in the collection. */
  items?: Iterable<T>,
  /** The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. */
  disabledKeys?: Iterable<Key>
}

interface CollectionStateBase<T, C extends Collection<Node$1<T>> = Collection<Node$1<T>>> extends Partial<CollectionBase<T>> {
  /** A pre-constructed collection to use instead of building one from items and children. */
  collection?: C
}

interface KeyboardDelegate {
  /** Returns the key visually below the given one, or `null` for none. */
  getKeyBelow?(key: Key): Key | null,

  /** Returns the key visually above the given one, or `null` for none. */
  getKeyAbove?(key: Key): Key | null,

  /** Returns the key visually to the left of the given one, or `null` for none. */
  getKeyLeftOf?(key: Key): Key | null,

  /** Returns the key visually to the right of the given one, or `null` for none. */
  getKeyRightOf?(key: Key): Key | null,

  /** Returns the key visually one page below the given one, or `null` for none. */
  getKeyPageBelow?(key: Key): Key | null,

  /** Returns the key visually one page above the given one, or `null` for none. */
  getKeyPageAbove?(key: Key): Key | null,

  /** Returns the first key, or `null` for none. */
  getFirstKey?(key?: Key, global?: boolean): Key | null,

  /** Returns the last key, or `null` for none. */
  getLastKey?(key?: Key, global?: boolean): Key | null,

  /** Returns the next key after `fromKey` that matches the given search string, or `null` for none. */
  getKeyForSearch?(search: string, fromKey?: Key): Key | null
}

/**
 * A generic interface to access a readonly sequential
 * collection of unique keyed items.
 */
interface Collection<T> extends Iterable<T> {
  /** The number of items in the collection. */
  readonly size: number,

  /** Iterate over all keys in the collection. */
  getKeys(): Iterable<Key>,

  /** Get an item by its key. */
  getItem(key: Key): T | null,

  /** Get an item by the index of its key. */
  at(idx: number): T | null,

  /** Get the key that comes before the given key in the collection. */
  getKeyBefore(key: Key): Key | null,

  /** Get the key that comes after the given key in the collection. */
  getKeyAfter(key: Key): Key | null,

  /** Get the first key in the collection. */
  getFirstKey(): Key | null,

  /** Get the last key in the collection. */
  getLastKey(): Key | null,

  /** Iterate over the child items of the given key. */
  getChildren?(key: Key): Iterable<T>,

  /** Returns a string representation of the item's contents. */
  getTextValue?(key: Key): string
}

interface Node$1<T> {
  /** The type of item this node represents. */
  type: string,
  /** A unique key for the node. */
  key: Key,
  /** The object value the node was created from. */
  value: T | null,
  /** The level of depth this node is at in the hierarchy. */
  level: number,
  /** Whether this item has children, even if not loaded yet. */
  hasChildNodes: boolean,
  /**
   * The loaded children of this node.
   * @deprecated Use `collection.getChildren(node.key)` instead.
   */
  childNodes: Iterable<Node$1<T>>,
  /** The rendered contents of this node (e.g. JSX). */
  rendered: ReactNode,
  /** A string value for this node, used for features like typeahead. */
  textValue: string,
  /** An accessibility label for this node. */
  'aria-label'?: string,
  /** The index of this node within its parent. */
  index?: number,
  /** A function that should be called to wrap the rendered node. */
  wrapper?: (element: ReactElement) => ReactElement,
  /** The key of the parent node. */
  parentKey?: Key | null,
  /** The key of the node before this node. */
  prevKey?: Key | null,
  /** The key of the node after this node. */
  nextKey?: Key | null,
  /** Additional properties specific to a particular node type. */
  props?: any,
  /** @private */
  shouldInvalidate?: (context: unknown) => boolean
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


// Event bubbling can be problematic in real-world applications, so the default for React Spectrum components
// is not to propagate. This can be overridden by calling continuePropagation() on the event.
type BaseEvent<T extends SyntheticEvent> = T & {
  /**
   * Use continuePropagation.
   * @deprecated */
  stopPropagation(): void,
  continuePropagation(): void
}

type KeyboardEvent = BaseEvent<KeyboardEvent$1<any>>;

type PointerType = 'mouse' | 'pen' | 'touch' | 'keyboard' | 'virtual';

interface PressEvent {
  /** The type of press event being fired. */
  type: 'pressstart' | 'pressend' | 'pressup' | 'press',
  /** The pointer type that triggered the press event. */
  pointerType: PointerType,
  /** The target element of the press event. */
  target: Element,
  /** Whether the shift keyboard modifier was held during the press event. */
  shiftKey: boolean,
  /** Whether the ctrl keyboard modifier was held during the press event. */
  ctrlKey: boolean,
  /** Whether the meta keyboard modifier was held during the press event. */
  metaKey: boolean,
  /** Whether the alt keyboard modifier was held during the press event. */
  altKey: boolean,
  /**
   * By default, press events stop propagation to parent elements.
   * In cases where a handler decides not to handle a specific event,
   * it can call `continuePropagation()` to allow a parent to handle it.
   */
  continuePropagation(): void
}

interface LongPressEvent extends Omit<PressEvent, 'type' | 'continuePropagation'> {
  /** The type of long press event being fired. */
  type: 'longpressstart' | 'longpressend' | 'longpress'
}

interface KeyboardEvents {
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void,
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void
}

interface FocusEvents<Target = Element> {
  /** Handler that is called when the element receives focus. */
  onFocus?: (e: FocusEvent$1<Target>) => void,
  /** Handler that is called when the element loses focus. */
  onBlur?: (e: FocusEvent$1<Target>) => void,
  /** Handler that is called when the element's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void
}

interface PressEvents {
  /** Handler that is called when the press is released over the target. */
  onPress?: (e: PressEvent) => void,
  /** Handler that is called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void,
  /**
   * Handler that is called when a press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onPressEnd?: (e: PressEvent) => void,
  /** Handler that is called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void,
  /**
   * Handler that is called when a press is released over the target, regardless of
   * whether it started on the target or not.
   */
  onPressUp?: (e: PressEvent) => void
}

interface FocusableProps<Target = Element> extends FocusEvents<Target>, KeyboardEvents {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface LabelableProps {
  /** The content to display as the label. */
  label?: ReactNode
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

type Orientation = 'horizontal' | 'vertical';

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

type Direction = 'ltr' | 'rtl';

/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

type Key = string | number;

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface ToggleProps extends InputBase, Validation<boolean>, FocusableProps {
  /**
   * The label for the element.
   */
  children?: ReactNode,
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string
}

interface AriaToggleProps extends ToggleProps, FocusableDOMProps, AriaLabelingProps, AriaValidationProps, InputDOMProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  'aria-controls'?: string
}

interface CheckboxProps$1 extends ToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean
}

interface AriaCheckboxProps extends CheckboxProps$1, AriaToggleProps {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

interface PositionProps {
  /**
   * The placement of the element with respect to its anchor element.
   * @default 'bottom'
   */
  placement?: Placement,
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   * @default 12
   */
  containerPadding?: number,
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   * @default 0
   */
  offset?: number,
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   * @default 0
   */
  crossOffset?: number,
  /**
   * Whether the element should flip its orientation (e.g. top to bottom or left to right) when
   * there is insufficient room for it to render completely.
   * @default true
   */
  shouldFlip?: boolean,
  // /**
  //  * The element that should be used as the bounding container when calculating container offset
  //  * or whether it should flip.
  //  */
  // boundaryElement?: Element,
  /** Whether the element is rendered. */
  isOpen?: boolean
}

interface OverlayTriggerProps$1 {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean,
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean,
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void
}

interface OverlayTriggerState {
    /** Whether the overlay is currently open. */
    readonly isOpen: boolean;
    /** Sets whether the overlay is open. */
    setOpen(isOpen: boolean): void;
    /** Opens the overlay. */
    open(): void;
    /** Closes the overlay. */
    close(): void;
    /** Toggles the overlay's visibility. */
    toggle(): void;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface SelectProps$1<T> extends CollectionBase<T>, Omit<InputBase, 'isReadOnly'>, Validation<Key>, HelpTextProps, LabelableProps, TextInputBase, Omit<SingleSelection, 'disallowEmptySelection'>, FocusableProps {
  /** Sets the open state of the menu. */
  isOpen?: boolean,
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean,
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void
}

interface AriaSelectProps<T> extends SelectProps$1<T>, DOMProps, AriaLabelingProps, FocusableDOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,
  /**
   * The name of the input, used when submitting an HTML form.
   */
  name?: string
}

interface FocusState {
    /** Whether the collection is currently focused. */
    readonly isFocused: boolean;
    /** Sets whether the collection is focused. */
    setFocused(isFocused: boolean): void;
    /** The current focused key in the collection. */
    readonly focusedKey: Key;
    /** Whether the first or last child of the focused key should receive focus. */
    readonly childFocusStrategy: FocusStrategy;
    /** Sets the focused key, and optionally, whether the first or last child of that key should receive focus. */
    setFocusedKey(key: Key, child?: FocusStrategy): void;
}
interface MultipleSelectionState extends FocusState {
    /** The type of selection that is allowed in the collection. */
    readonly selectionMode: SelectionMode;
    /** The selection behavior for the collection. */
    readonly selectionBehavior: SelectionBehavior;
    /** Sets the selection behavior for the collection. */
    setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
    /** Whether the collection allows empty selection. */
    readonly disallowEmptySelection: boolean;
    /** The currently selected keys in the collection. */
    readonly selectedKeys: Selection$1;
    /** Sets the selected keys in the collection. */
    setSelectedKeys(keys: Selection$1): void;
    /** The currently disabled keys in the collection. */
    readonly disabledKeys: Set<Key>;
    /** Whether `disabledKeys` applies to selection, actions, or both. */
    readonly disabledBehavior: DisabledBehavior;
}
interface MultipleSelectionManager extends FocusState {
    /** The type of selection that is allowed in the collection. */
    readonly selectionMode: SelectionMode;
    /** The selection behavior for the collection. */
    readonly selectionBehavior: SelectionBehavior;
    /** Whether the collection allows empty selection. */
    readonly disallowEmptySelection?: boolean;
    /** The currently selected keys in the collection. */
    readonly selectedKeys: Set<Key>;
    /** Whether the selection is empty. */
    readonly isEmpty: boolean;
    /** Whether all items in the collection are selected. */
    readonly isSelectAll: boolean;
    /** The first selected key in the collection. */
    readonly firstSelectedKey: Key | null;
    /** The last selected key in the collection. */
    readonly lastSelectedKey: Key | null;
    /** The currently disabled keys in the collection. */
    readonly disabledKeys: Set<Key>;
    /** Whether `disabledKeys` applies to selection, actions, or both. */
    readonly disabledBehavior: DisabledBehavior;
    /** Returns whether a key is selected. */
    isSelected(key: Key): boolean;
    /** Returns whether the current selection is equal to the given selection. */
    isSelectionEqual(selection: Set<Key>): boolean;
    /** Extends the selection to the given key. */
    extendSelection(toKey: Key): void;
    /** Toggles whether the given key is selected. */
    toggleSelection(key: Key): void;
    /** Replaces the selection with only the given key. */
    replaceSelection(key: Key): void;
    /** Replaces the selection with the given keys. */
    setSelectedKeys(keys: Iterable<Key>): void;
    /** Selects all items in the collection. */
    selectAll(): void;
    /** Removes all keys from the selection. */
    clearSelection(): void;
    /** Toggles between select all and an empty selection. */
    toggleSelectAll(): void;
    /**
     * Toggles, replaces, or extends selection to the given key depending
     * on the pointer event and collection's selection mode.
     */
    select(key: Key, e?: PressEvent | LongPressEvent | PointerEvent): void;
    /** Returns whether the given key can be selected. */
    canSelectItem(key: Key): boolean;
    /** Returns whether the given key is non-interactive, i.e. both selection and actions are disabled. */
    isDisabled(key: Key): boolean;
    /** Sets the selection behavior for the collection. */
    setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
    /** Returns whether the given key is a hyperlink. */
    isLink(key: Key): boolean;
}
interface MultipleSelectionStateProps extends MultipleSelection {
    /** How multiple selection should behave in the collection. */
    selectionBehavior?: SelectionBehavior;
    /** Whether onSelectionChange should fire even if the new set of keys is the same as the last. */
    allowDuplicateSelectionEvents?: boolean;
    /** Whether `disabledKeys` applies to all interactions, or only selection. */
    disabledBehavior?: DisabledBehavior;
}
interface SelectionManagerOptions {
    allowsCellSelection?: boolean;
}
/**
 * An interface for reading and updating multiple selection state.
 */
declare class SelectionManager implements MultipleSelectionManager {
    constructor(collection: Collection<Node$1<unknown>>, state: MultipleSelectionState, options?: SelectionManagerOptions);
    /**
     * The type of selection that is allowed in the collection.
     */
    get selectionMode(): SelectionMode;
    /**
     * Whether the collection allows empty selection.
     */
    get disallowEmptySelection(): boolean;
    /**
     * The selection behavior for the collection.
     */
    get selectionBehavior(): SelectionBehavior;
    /**
     * Sets the selection behavior for the collection.
     */
    setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
    /**
     * Whether the collection is currently focused.
     */
    get isFocused(): boolean;
    /**
     * Sets whether the collection is focused.
     */
    setFocused(isFocused: boolean): void;
    /**
     * The current focused key in the collection.
     */
    get focusedKey(): Key;
    /** Whether the first or last child of the focused key should receive focus. */
    get childFocusStrategy(): FocusStrategy;
    /**
     * Sets the focused key.
     */
    setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void;
    /**
     * The currently selected keys in the collection.
     */
    get selectedKeys(): Set<Key>;
    /**
     * The raw selection value for the collection.
     * Either 'all' for select all, or a set of keys.
     */
    get rawSelection(): Selection$1;
    /**
     * Returns whether a key is selected.
     */
    isSelected(key: Key): boolean;
    /**
     * Whether the selection is empty.
     */
    get isEmpty(): boolean;
    /**
     * Whether all items in the collection are selected.
     */
    get isSelectAll(): boolean;
    get firstSelectedKey(): Key | null;
    get lastSelectedKey(): Key | null;
    get disabledKeys(): Set<Key>;
    get disabledBehavior(): DisabledBehavior;
    /**
     * Extends the selection to the given key.
     */
    extendSelection(toKey: Key): void;
    /**
     * Toggles whether the given key is selected.
     */
    toggleSelection(key: Key): void;
    /**
     * Replaces the selection with only the given key.
     */
    replaceSelection(key: Key): void;
    /**
     * Replaces the selection with the given keys.
     */
    setSelectedKeys(keys: Iterable<Key>): void;
    /**
     * Selects all items in the collection.
     */
    selectAll(): void;
    /**
     * Removes all keys from the selection.
     */
    clearSelection(): void;
    /**
     * Toggles between select all and an empty selection.
     */
    toggleSelectAll(): void;
    select(key: Key, e?: PressEvent | LongPressEvent | PointerEvent): void;
    /**
     * Returns whether the current selection is equal to the given selection.
     */
    isSelectionEqual(selection: Set<Key>): boolean;
    canSelectItem(key: Key): boolean;
    isDisabled(key: Key): boolean;
    isLink(key: Key): boolean;
}

interface ListProps<T> extends CollectionStateBase<T>, MultipleSelectionStateProps {
    /** Filter function to generate a filtered list of nodes. */
    filter?: (nodes: Iterable<Node$1<T>>) => Iterable<Node$1<T>>;
    /** @private */
    suppressTextValueWarning?: boolean;
}
interface ListState<T> {
    /** A collection of items in the list. */
    collection: Collection<Node$1<T>>;
    /** A set of items that are disabled. */
    disabledKeys: Set<Key>;
    /** A selection manager to read and update multiple selection state. */
    selectionManager: SelectionManager;
}

interface SelectStateOptions<T> extends Omit<SelectProps$1<T>, 'children'>, CollectionStateBase<T> {
}

interface DraggableCollectionStateOptions extends DraggableCollectionProps {
    /** A collection of items. */
    collection: Collection<Node$1<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
}
interface DroppableCollectionStateOptions extends Omit<DroppableCollectionProps, 'onDropMove' | 'onDropActivate'> {
    /** A collection of items. */
    collection: Collection<Node$1<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


type MenuTriggerType = 'press' | 'longPress';

interface MenuTriggerProps extends OverlayTriggerProps$1 {
  /**
   * How the menu is triggered.
   * @default 'press'
   */
  trigger?: MenuTriggerType
}

interface MenuProps$1<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy,
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean,
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void,
  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void
}

interface AriaMenuProps<T> extends MenuProps$1<T>, DOMProps, AriaLabelingProps {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface RadioGroupProps$1 extends ValueBase<string>, InputBase, InputDOMProps, Validation<string | null>, LabelableProps, HelpTextProps, FocusEvents {
  /**
   * The axis the Radio Button(s) should align with.
   * @default 'vertical'
   */
  orientation?: Orientation
}

interface AriaRadioGroupProps extends RadioGroupProps$1, DOMProps, AriaLabelingProps, AriaValidationProps {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface TextFieldProps extends InputBase, Validation<string>, HelpTextProps, FocusableProps, TextInputBase, ValueBase<string>, LabelableProps {}

interface AriaTextFieldProps extends TextFieldProps, AriaLabelingProps, FocusableDOMProps, TextInputDOMProps, AriaValidationProps {
  // https://www.w3.org/TR/wai-aria-1.2/#textbox
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  'aria-activedescendant'?: string,
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both',
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface SearchFieldProps extends TextFieldProps {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void,

  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void
}

interface AriaSearchFieldProps extends SearchFieldProps, AriaTextFieldProps {}

interface SliderProps$1<T = number | number[]> extends RangeInputBase<number>, ValueBase<T>, LabelableProps {
  /**
   * The orientation of the Slider.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /** Whether the whole Slider is disabled. */
  isDisabled?: boolean,
  /** Fired when the slider stops moving, due to being let go. */
  onChangeEnd?: (value: T) => void,
  // These are duplicated from ValueBase to define defaults for the docs.
  /**
   * The slider's minimum value.
   * @default 0
   */
  minValue?: number,
  /**
   * The slider's maximum value.
   * @default 100
   */
  maxValue?: number,
  /**
   * The slider's step value.
   * @default 1
   */
  step?: number
}

interface AriaSliderProps<T = number | number[]> extends SliderProps$1<T>, DOMProps, AriaLabelingProps {}

interface SliderStateOptions<T> extends SliderProps$1<T> {
    numberFormatter: Intl.NumberFormat;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface NumberFieldProps extends InputBase, Validation<number>, FocusableProps, TextInputBase, ValueBase<number>, RangeInputBase<number>, LabelableProps, HelpTextProps {
  /**
   * Formatting options for the value displayed in the number field.
   * This also affects what characters are allowed to be typed by the user.
   */
  formatOptions?: Intl.NumberFormatOptions
}

interface AriaNumberFieldProps extends NumberFieldProps, DOMProps, AriaLabelingProps, TextInputDOMEvents {
  /** A custom aria-label for the decrement button. If not provided, the localized string "Decrement" is used. */
  decrementAriaLabel?: string,
  /** A custom aria-label for the increment button. If not provided, the localized string "Increment" is used. */
  incrementAriaLabel?: string,
  /**
   * Enables or disables changing the value with scroll.
   */
  isWheelDisabled?: boolean
}

interface NumberFieldStateOptions extends NumberFieldProps {
    /**
     * The locale that should be used for parsing.
     * @default 'en-US'
     */
    locale: string;
}

declare let Item$1: <T>(props: ItemProps$1<T>) => JSX.Element;

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface TabListProps<T> extends CollectionBase<T>, Omit<SingleSelection, 'disallowEmptySelection'> {
  /**
   * Whether the TabList is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean
}

interface AriaTabListBase extends AriaLabelingProps {
  /**
   * Whether tabs are activated automatically on focus or manually.
   * @default 'automatic'
   */
  keyboardActivation?: 'automatic' | 'manual',
  /**
   * The orientation of the tabs.
   * @default 'horizontal'
   */
  orientation?: Orientation
}

interface AriaTabListProps<T> extends TabListProps<T>, AriaTabListBase, DOMProps, AriaLabelingProps {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface TooltipTriggerProps extends OverlayTriggerProps$1 {
  /**
   * Whether the tooltip should be disabled, independent from the trigger.
   */
  isDisabled?: boolean,

  /**
   * The delay time for the tooltip to show up. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Immediate-or-delayed-appearance).
   * @default 1500
   */
  delay?: number,

  /**
   * The delay time for the tooltip to close. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Warmup-and-cooldown).
   * @default 500
   */
  closeDelay?: number,

  /**
   * By default, opens for both focus and hover. Can be made to open only for focus.
   */
  trigger?: 'focus'
}

interface TooltipProps$1 {
  isOpen?: boolean
}

interface AriaTooltipProps extends TooltipProps$1, DOMProps, AriaLabelingProps {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface LinkProps$1 extends PressEvents, FocusableProps {}

interface AriaLinkProps extends LinkProps$1, LinkDOMProps, AriaLabelingProps { }

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface ButtonProps extends PressEvents, FocusableProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean,
  /** The content to display in the button. */
  children?: ReactNode
}

interface ToggleButtonProps$1 extends ButtonProps {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean,
  /** Whether the element should be selected (uncontrolled). */
  defaultSelected?: boolean,
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void
}

interface AriaButtonElementTypeProps<T extends ElementType = 'button'> {
  /**
   * The HTML element or React element used to render the button, e.g. 'div', 'a', or `RouterLink`.
   * @default 'button'
   */
  elementType?: T | JSXElementConstructor<any>
}

interface LinkButtonProps<T extends ElementType = 'button'> extends AriaButtonElementTypeProps<T> {
  /** A URL to link to if elementType="a". */
  href?: string,
  /** The target window for the link. */
  target?: string,
  /** The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). */
  rel?: string
}

interface AriaBaseButtonProps extends FocusableDOMProps, AriaLabelingProps {
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  'aria-expanded'?: boolean | 'true' | 'false',
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | 'true' | 'false',
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  'aria-controls'?: string,
  /** Indicates the current "pressed" state of toggle buttons. */
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed',
  /**
   * The behavior of the button when used in an HTML form.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'
}

interface AriaButtonProps<T extends ElementType = 'button'> extends ButtonProps, LinkButtonProps<T>, AriaBaseButtonProps {}
interface AriaToggleButtonProps<T extends ElementType = 'button'> extends ToggleButtonProps$1, AriaBaseButtonProps, AriaButtonElementTypeProps<T> {}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface ListBoxProps$1<T> extends CollectionBase<T>, MultipleSelection, FocusEvents {
  /** Whether to auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy,
  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean
}

interface AriaListBoxPropsBase<T> extends ListBoxProps$1<T>, DOMProps, AriaLabelingProps {}
interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  /**
   * An optional visual label for the listbox.
   */
  label?: ReactNode,
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void
}

interface SelectableItemStates {
    /** Whether the item is currently in a pressed state. */
    isPressed: boolean;
    /** Whether the item is currently selected. */
    isSelected: boolean;
    /** Whether the item is currently focused. */
    isFocused: boolean;
    /**
     * Whether the item is non-interactive, i.e. both selection and actions are disabled and the item may
     * not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
     */
    isDisabled: boolean;
    /**
     * Whether the item may be selected, dependent on `selectionMode`, `disabledKeys`, and `disabledBehavior`.
     */
    allowsSelection: boolean;
    /**
     * Whether the item has an action, dependent on `onAction`, `disabledKeys`,
     * and `disabledBehavior`. It may also change depending on the current selection state
     * of the list (e.g. when selection is primary). This can be used to enable or disable hover
     * styles or other visual indications of interactivity.
     */
    hasAction: boolean;
}

interface AriaListBoxOptions<T> extends Omit<AriaListBoxProps<T>, 'children'> {
    /** Whether the listbox uses virtual scrolling. */
    isVirtualized?: boolean;
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
    /**
     * Whether the listbox items should use virtual focus instead of being focused directly.
     */
    shouldUseVirtualFocus?: boolean;
    /** Whether selection should occur on press up instead of press down. */
    shouldSelectOnPressUp?: boolean;
    /** Whether options should be focused when the user hovers over them. */
    shouldFocusOnHover?: boolean;
    /**
     * The behavior of links in the collection.
     * - 'action': link behaves like onAction.
     * - 'selection': link follows selection interactions (e.g. if URL drives selection).
     * - 'override': links override all other interactions (link items are not selectable).
     * @default 'override'
     */
    linkBehavior?: 'action' | 'selection' | 'override';
}
interface OptionAria extends SelectableItemStates {
    /** Props for the option element. */
    optionProps: DOMAttributes;
    /** Props for the main text element inside the option. */
    labelProps: DOMAttributes;
    /** Props for the description text element inside the option, if any. */
    descriptionProps: DOMAttributes;
    /** Whether the option is currently focused. */
    isFocused: boolean;
    /** Whether the option is keyboard focused. */
    isFocusVisible: boolean;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface AriaDialogProps extends DOMProps, AriaLabelingProps {
  /**
   * The accessibility role for the dialog.
   * @default 'dialog'
   */
  role?: 'dialog' | 'alertdialog'
}

interface DropOptions {
    /** A ref for the droppable element. */
    ref: RefObject<HTMLElement>;
    /**
     * A function returning the drop operation to be performed when items matching the given types are dropped
     * on the drop target.
     */
    getDropOperation?: (types: DragTypes, allowedOperations: DropOperation[]) => DropOperation;
    /** A function that returns the drop operation for a specific point within the target. */
    getDropOperationForPoint?: (types: DragTypes, allowedOperations: DropOperation[], x: number, y: number) => DropOperation;
    /** Handler that is called when a valid drag enters the drop target. */
    onDropEnter?: (e: DropEnterEvent) => void;
    /** Handler that is called when a valid drag is moved within the drop target. */
    onDropMove?: (e: DropMoveEvent) => void;
    /**
     * Handler that is called after a valid drag is held over the drop target for a period of time.
     * This typically opens the item so that the user can drop within it.
     * @private
     */
    onDropActivate?: (e: DropActivateEvent) => void;
    /** Handler that is called when a valid drag exits the drop target. */
    onDropExit?: (e: DropExitEvent) => void;
    /** Handler that is called when a valid drag is dropped on the drop target. */
    onDrop?: (e: DropEvent) => void;
    /**
     * Whether the item has an explicit focusable drop affordance to initiate accessible drag and drop mode.
     * If true, the dropProps will omit these event handlers, and they will be applied to dropButtonProps instead.
     */
    hasDropButton?: boolean;
}
interface DroppableCollectionOptions extends DroppableCollectionProps {
    /** A delegate object that implements behavior for keyboard focus movement. */
    keyboardDelegate: KeyboardDelegate;
    /** A delegate object that provides drop targets for pointer coordinates within the collection. */
    dropTargetDelegate: DropTargetDelegate;
}
interface DraggableCollectionOptions {
}
interface ClipboardProps {
    /** A function that returns the items to copy. */
    getItems?: () => DragItem[];
    /** Handler that is called when the user triggers a copy interaction. */
    onCopy?: () => void;
    /** Handler that is called when the user triggers a cut interaction. */
    onCut?: () => void;
    /** Handler that is called when the user triggers a paste interaction. */
    onPaste?: (items: DropItem[]) => void;
}

declare global {
    namespace FormatjsIntl {
        interface Message {
        }
        interface IntlConfig {
        }
        interface Formats {
        }
    }
}

type LocalizedStrings = {
    [lang: string]: {
        [key: string]: string;
    };
};

interface NumberFormatOptions extends Intl.NumberFormatOptions {
    /** Overrides default numbering system for the current locale. */
    numberingSystem?: string;
}

interface Locale {
    /** The [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the locale. */
    locale: string;
    /** The writing direction for the locale. */
    direction: Direction;
}
interface I18nProviderProps$1 {
    /** Contents that should have the locale applied. */
    children: ReactNode;
    /** The locale to apply to the children. */
    locale?: string;
}
interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
    calendar?: string;
}
/**
 * Provides localized date formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the date formatter for performance.
 * @param options - Formatting options.
 */
declare function useDateFormatter(options?: DateFormatterOptions): DateFormatter;
/**
 * Provides localized number formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the number formatter for performance.
 * @param options - Formatting options.
 */
declare function useNumberFormatter(options?: NumberFormatOptions): Intl.NumberFormat;
/**
 * Provides localized string collation for the current locale. Automatically updates when the locale changes,
 * and handles caching of the collator for performance.
 * @param options - Collator options.
 */
declare function useCollator(options?: Intl.CollatorOptions): Intl.Collator;

interface PressProps extends PressEvents {
    /** Whether the target is in a controlled press state (e.g. an overlay it triggers is open). */
    isPressed?: boolean;
    /** Whether the press events should be disabled. */
    isDisabled?: boolean;
    /** Whether the target should not receive focus on press. */
    preventFocusOnPress?: boolean;
    /**
     * Whether press events should be canceled when the pointer leaves the target while pressed.
     * By default, this is `false`, which means if the pointer returns back over the target while
     * still pressed, onPressStart will be fired again. If set to `true`, the press is canceled
     * when the pointer leaves the target and onPressStart will not be fired if the pointer returns.
     */
    shouldCancelOnPointerExit?: boolean;
    /** Whether text selection should be enabled on the pressable element. */
    allowTextSelectionOnPress?: boolean;
}

interface AriaLinkOptions extends AriaLinkProps {
    /** Whether the link is disabled. */
    isDisabled?: boolean;
    /**
     * The HTML element used to render the link, e.g. 'a', or 'span'.
     * @default 'a'
     */
    elementType?: string;
}

interface AriaPositionProps extends PositionProps {
    /**
     * Cross size of the overlay arrow in pixels.
     * @default 0
     */
    arrowSize?: number;
    /**
     * Element that that serves as the positioning boundary.
     * @default document.body
     */
    boundaryElement?: Element;
    /**
     * The ref for the element which the overlay positions itself with respect to.
     */
    targetRef: RefObject<Element>;
    /**
     * The ref for the overlay element.
     */
    overlayRef: RefObject<Element>;
    /**
     * A ref for the scrollable region within the overlay.
     * @default overlayRef
     */
    scrollRef?: RefObject<Element>;
    /**
     * Whether the overlay should update its position automatically.
     * @default true
     */
    shouldUpdatePosition?: boolean;
    /** Handler that is called when the overlay should close. */
    onClose?: () => void;
    /**
     * The maxHeight specified for the overlay element.
     * By default, it will take all space up to the current viewport height.
     */
    maxHeight?: number;
    /**
     * The minimum distance the arrow's edge should be from the edge of the overlay element.
     * @default 0
     */
    arrowBoundaryOffset?: number;
}
interface AriaOverlayProps {
    /** Whether the overlay is currently open. */
    isOpen?: boolean;
    /** Handler that is called when the overlay should close. */
    onClose?: () => void;
    /**
     * Whether to close the overlay when the user interacts outside it.
     * @default false
     */
    isDismissable?: boolean;
    /** Whether the overlay should close when focus is lost or moves outside it. */
    shouldCloseOnBlur?: boolean;
    /**
     * Whether pressing the escape key to close the overlay should be disabled.
     * @default false
     */
    isKeyboardDismissDisabled?: boolean;
    /**
     * When user interacts with the argument element outside of the overlay ref,
     * return true if onClose should be called.  This gives you a chance to filter
     * out interaction with elements that should not dismiss the overlay.
     * By default, onClose will always be called on interaction outside the overlay ref.
     */
    shouldCloseOnInteractOutside?: (element: Element) => boolean;
}
interface OverlayTriggerProps {
    /** Type of overlay that is opened by the trigger. */
    type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}
interface OverlayTriggerAria {
    /** Props for the trigger element. */
    triggerProps: AriaButtonProps;
    /** Props for the overlay container element. */
    overlayProps: DOMProps;
}
/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
declare function useOverlayTrigger(props: OverlayTriggerProps, state: OverlayTriggerState, ref?: RefObject<Element>): OverlayTriggerAria;
interface AriaPopoverProps extends Omit<AriaPositionProps, 'isOpen' | 'onClose' | 'targetRef' | 'overlayRef'> {
    /**
     * The ref for the element which the popover positions itself with respect to.
     */
    triggerRef: RefObject<Element>;
    /**
     * The ref for the popover element.
     */
    popoverRef: RefObject<Element>;
    /**
     * Whether the popover is non-modal, i.e. elements outside the popover may be
     * interacted with by assistive technologies.
     *
     * Most popovers should not use this option as it may negatively impact the screen
     * reader experience. Only use with components such as combobox, which are designed
     * to handle this situation carefully.
     */
    isNonModal?: boolean;
    /**
     * Whether pressing the escape key to close the popover should be disabled.
     *
     * Most popovers should not use this option. When set to true, an alternative
     * way to close the popover with a keyboard must be provided.
     *
     * @default false
     */
    isKeyboardDismissDisabled?: boolean;
    /**
     * When user interacts with the argument element outside of the popover ref,
     * return true if onClose should be called. This gives you a chance to filter
     * out interaction with elements that should not dismiss the popover.
     * By default, onClose will always be called on interaction outside the popover ref.
     */
    shouldCloseOnInteractOutside?: (element: Element) => boolean;
}
interface OverlayProps {
    /**
     * The container element in which the overlay portal will be placed.
     * @default document.body
     */
    portalContainer?: Element;
    /** The overlay to render in the portal. */
    children: ReactNode;
    /**
     * Disables default focus management for the overlay, including containment and restoration.
     * This option should be used very carefully. When focus management is disabled, you must
     * implement focus containment and restoration to ensure the overlay is keyboard accessible.
     */
    disableFocusManagement?: boolean;
    /**
     * Whether the overlay is currently performing an exit animation. When true,
     * focus is allowed to move outside.
     */
    isExiting?: boolean;
}
interface AriaModalOverlayProps extends Pick<AriaOverlayProps, 'shouldCloseOnInteractOutside'> {
    /**
     * Whether to close the modal when the user interacts outside it.
     * @default false
     */
    isDismissable?: boolean;
    /**
     * Whether pressing the escape key to close the modal should be disabled.
     * @default false
     */
    isKeyboardDismissDisabled?: boolean;
}

interface AriaMenuTriggerProps {
    /** The type of menu that the menu trigger opens. */
    type?: 'menu' | 'listbox';
    /** Whether menu trigger is disabled. */
    isDisabled?: boolean;
    /** How menu is triggered. */
    trigger?: MenuTriggerType;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface ProgressBaseProps {
  /**
   * The current value (controlled).
   * @default 0
   */
  value?: number,
  /**
   * The smallest value allowed for the input.
   * @default 0
   */
  minValue?: number,
  /**
   * The largest value allowed for the input.
   * @default 100
   */
  maxValue?: number
}

interface ProgressBarBaseProps extends ProgressBaseProps {
  /** The content to display as the label. */
  label?: ReactNode,
  /**
   * The display format of the value label.
   * @default {style: 'percent'}
   */
  formatOptions?: Intl.NumberFormatOptions,
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: ReactNode
}

interface ProgressBarProps$1 extends ProgressBarBaseProps {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean
}

interface AriaProgressBarProps extends ProgressBarProps$1, DOMProps, AriaLabelingProps {}

interface AriaSelectOptions<T> extends Omit<AriaSelectProps<T>, 'children'> {
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
}

interface SeparatorProps$1 extends DOMProps, AriaLabelingProps {
    /**
     * The orientation of the separator.
     * @default 'horizontal'
     */
    orientation?: Orientation;
    /** The HTML element type that will be used to render the separator. */
    elementType?: string;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


interface SwitchBase extends InputBase, FocusableProps {
  /**
   * The content to render as the Switch's label.
   */
  children?: ReactNode,
  /**
   * Whether the Switch should be selected (uncontrolled).
   */
  defaultSelected?: boolean,
  /**
   * Whether the Switch should be selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler that is called when the Switch's selection state changes.
   */
  onChange?: (isSelected: boolean) => void,
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string
}
interface SwitchProps$1 extends SwitchBase {}
interface AriaSwitchBase extends SwitchBase, FocusableDOMProps, InputDOMProps, AriaLabelingProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  'aria-controls'?: string
}
interface AriaSwitchProps extends SwitchProps$1, AriaSwitchBase {}

interface AriaTagGroupProps<T> extends CollectionBase<T>, MultipleSelection, DOMProps, LabelableProps, AriaLabelingProps, Omit<HelpTextProps, 'errorMessage'> {
    /** How multiple selection should behave in the collection. */
    selectionBehavior?: SelectionBehavior;
    /** Handler that is called when a user deletes a tag.  */
    onRemove?: (keys: Set<Key>) => void;
    /** An error message for the field. */
    errorMessage?: ReactNode;
}

interface SVGRProps {
    title?: string;
    titleId?: string;
    size?: CSSProperties["width"];
}
type IconProps = SVGRProps & SVGProps<SVGSVGElement>;

declare const createLayerSprinkles: (layer: string) => ((props: {
    paddingBlockStart?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingInlineEnd?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingBlockEnd?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingInlineStart?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginBlockStart?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginInlineEnd?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginBlockEnd?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginInlineStart?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    gap?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingLeft?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingRight?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingTop?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingBottom?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    padding?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingX?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    paddingY?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginLeft?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginRight?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginTop?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginBottom?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    margin?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginX?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
    marginY?: ("none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | {
        mobile?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        tablet?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
        desktop?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | null>;
} & {
    borderStartStartRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderStartEndRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderEndStartRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderEndEndRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderTopRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderBottomRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderLeftRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
    borderRightRadius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | undefined;
} & {
    boxShadow?: "medium" | "low" | undefined;
} & {
    opacity?: "none" | "medium" | "low" | "high" | undefined;
} & {
    typography?: "heading.h6.regular" | "heading.h6.medium" | "heading.h6.semibold" | "heading.h5.regular" | "heading.h5.medium" | "heading.h5.semibold" | "heading.h4.regular" | "heading.h4.medium" | "heading.h4.semibold" | "heading.h3.regular" | "heading.h3.medium" | "heading.h3.semibold" | "heading.h2.regular" | "heading.h2.medium" | "heading.h2.semibold" | "heading.h1.regular" | "heading.h1.medium" | "heading.h1.semibold" | "label.sm.regular" | "label.sm.medium" | "label.sm.semibold" | "label.md.regular" | "label.md.medium" | "label.md.semibold" | "label.lg.regular" | "label.lg.medium" | "label.lg.semibold" | "body.sm.regular" | "body.sm.medium" | "body.sm.semibold" | "body.md.regular" | "body.md.medium" | "body.md.semibold" | "body.lg.regular" | "body.lg.medium" | "body.lg.semibold" | undefined;
} & {
    color?: "text.primary" | "text.secondary" | "text.helper" | "text.placeholder" | "text.disabled" | "text.inverse" | "icon.primary" | "icon.secondary" | "icon.disabled" | "icon.inverse" | "icon.interactive" | "interactive.primary" | "interactive.hovered" | "interactive.active" | "interactive.visited" | "interactive.disabled" | "support.error.subtler" | "support.error.subtle" | "support.error.medium" | "support.error.strong" | "support.success.subtler" | "support.success.subtle" | "support.success.medium" | "support.success.strong" | "support.warning.subtler" | "support.warning.subtle" | "support.warning.medium" | "support.warning.strong" | "support.info.subtler" | "support.info.subtle" | "support.info.medium" | "support.info.strong" | "focused.primary" | "focused.inset" | undefined;
    backgroundColor?: "background.primary.subtle" | "background.primary.medium" | "background.primary.strong" | "background.secondary.subtle" | "background.secondary.medium" | "background.secondary.strong" | "background.inverse.subtle" | "background.inverse.medium" | "background.inverse.strong" | "background.overlay.subtle" | "background.overlay.medium" | "positive.subtle" | "positive.medium" | "positive.strong" | "positive.interactive" | "support.error.subtler" | "support.error.subtle" | "support.error.medium" | "support.error.strong" | "support.success.subtler" | "support.success.subtle" | "support.success.medium" | "support.success.strong" | "support.warning.subtler" | "support.warning.subtle" | "support.warning.medium" | "support.warning.strong" | "support.info.subtler" | "support.info.subtle" | "support.info.medium" | "support.info.strong" | "focused.primary" | "focused.inset" | undefined;
    borderColor?: "transparent" | "support.error.subtler" | "support.error.subtle" | "support.error.medium" | "support.error.strong" | "support.success.subtler" | "support.success.subtle" | "support.success.medium" | "support.success.strong" | "support.warning.subtler" | "support.warning.subtle" | "support.warning.medium" | "support.warning.strong" | "support.info.subtler" | "support.info.subtle" | "support.info.medium" | "support.info.strong" | "focused.primary" | "focused.inset" | "border.subtle" | "border.medium" | "border.strong" | "border.inverse" | "border.interactive" | "border.disabled" | undefined;
    outlineColor?: "transparent" | "support.error.subtler" | "support.error.subtle" | "support.error.medium" | "support.error.strong" | "support.success.subtler" | "support.success.subtle" | "support.success.medium" | "support.success.strong" | "support.warning.subtler" | "support.warning.subtle" | "support.warning.medium" | "support.warning.strong" | "support.info.subtler" | "support.info.subtle" | "support.info.medium" | "support.info.strong" | "focused.primary" | "focused.inset" | "border.subtle" | "border.medium" | "border.strong" | "border.inverse" | "border.interactive" | "border.disabled" | undefined;
} & {
    position?: ("fixed" | "absolute" | "relative" | {
        mobile?: "fixed" | "absolute" | "relative" | undefined;
        tablet?: "fixed" | "absolute" | "relative" | undefined;
        desktop?: "fixed" | "absolute" | "relative" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "fixed" | "absolute" | "relative" | null>;
    display?: ("none" | "flex" | "grid" | "block" | "inline-flex" | {
        mobile?: "none" | "flex" | "grid" | "block" | "inline-flex" | undefined;
        tablet?: "none" | "flex" | "grid" | "block" | "inline-flex" | undefined;
        desktop?: "none" | "flex" | "grid" | "block" | "inline-flex" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "none" | "flex" | "grid" | "block" | "inline-flex" | null>;
    flexDirection?: ("column" | "column-reverse" | "row" | "row-reverse" | {
        mobile?: "column" | "column-reverse" | "row" | "row-reverse" | undefined;
        tablet?: "column" | "column-reverse" | "row" | "row-reverse" | undefined;
        desktop?: "column" | "column-reverse" | "row" | "row-reverse" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "column" | "column-reverse" | "row" | "row-reverse" | null>;
    alignItems?: ("stretch" | "center" | "flex-end" | "flex-start" | {
        mobile?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        tablet?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        desktop?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "stretch" | "center" | "flex-end" | "flex-start" | null>;
    alignSelf?: ("stretch" | "center" | "flex-end" | "flex-start" | {
        mobile?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        tablet?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        desktop?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "stretch" | "center" | "flex-end" | "flex-start" | null>;
    flex?: (number | {
        mobile?: number | undefined;
        tablet?: number | undefined;
        desktop?: number | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, number | null>;
    justifyContent?: ("space-between" | "stretch" | "center" | "flex-end" | "flex-start" | {
        mobile?: "space-between" | "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        tablet?: "space-between" | "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        desktop?: "space-between" | "stretch" | "center" | "flex-end" | "flex-start" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "space-between" | "stretch" | "center" | "flex-end" | "flex-start" | null>;
    justifySelf?: ("stretch" | "center" | "flex-end" | "flex-start" | {
        mobile?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        tablet?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        desktop?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "stretch" | "center" | "flex-end" | "flex-start" | null>;
    placeItems?: ("stretch" | "center" | "flex-end" | "flex-start" | {
        mobile?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        tablet?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
        desktop?: "stretch" | "center" | "flex-end" | "flex-start" | undefined;
    } | undefined) | _vanilla_extract_sprinkles.ResponsiveArray<1 | 2 | 3, "stretch" | "center" | "flex-end" | "flex-start" | null>;
} & {
    transition?: "transition.medium" | undefined;
    transitionProperty?: "opacity" | "transform" | "background-color" | undefined;
} & {
    readonly flexWrap?: "nowrap" | "wrap" | undefined;
    readonly insetBlockStart?: 0 | undefined;
    readonly insetBlockEnd?: 0 | undefined;
    readonly insetInlineStart?: 0 | undefined;
    readonly insetInlineEnd?: 0 | undefined;
    readonly flexShrink?: 0 | undefined;
    readonly flexGrow?: 0 | 1 | undefined;
    readonly width?: "full" | undefined;
    readonly height?: "full" | undefined;
    readonly cursor?: "pointer" | undefined;
    inset?: 0 | undefined;
} & {
    outline?: "none" | undefined;
    outlineStyle?: "solid" | undefined;
    outlineWidth?: number | undefined;
    outlineOffset?: number | undefined;
    border?: "none" | undefined;
    borderStyle?: "dashed" | "solid" | undefined;
    borderWidth?: number | undefined;
}) => string) & {
    properties: Set<"alignItems" | "alignSelf" | "backgroundColor" | "borderEndEndRadius" | "borderEndStartRadius" | "borderStartEndRadius" | "borderStartStartRadius" | "boxShadow" | "color" | "cursor" | "display" | "flexDirection" | "flexGrow" | "flexShrink" | "flexWrap" | "height" | "insetBlockEnd" | "insetBlockStart" | "insetInlineEnd" | "insetInlineStart" | "justifyContent" | "justifySelf" | "marginBlockEnd" | "marginBlockStart" | "marginBottom" | "marginInlineEnd" | "marginInlineStart" | "marginLeft" | "marginRight" | "marginTop" | "opacity" | "outlineColor" | "outlineOffset" | "outlineStyle" | "outlineWidth" | "paddingBlockEnd" | "paddingBlockStart" | "paddingBottom" | "paddingInlineEnd" | "paddingInlineStart" | "paddingLeft" | "paddingRight" | "paddingTop" | "position" | "transitionProperty" | "width" | "border" | "borderColor" | "borderRadius" | "borderStyle" | "borderWidth" | "flex" | "gap" | "inset" | "margin" | "outline" | "padding" | "placeItems" | "transition" | "typography" | "paddingX" | "paddingY" | "marginX" | "marginY" | "borderTopRadius" | "borderBottomRadius" | "borderLeftRadius" | "borderRightRadius">;
};
type BaseSprinkles = ReturnType<typeof createLayerSprinkles>;

interface Theme {
  elevation: Elevation;
  opacity: Opacity;
  rounded: Rounded;
  spacing: Spacing;
  color: Color$1;
  typography: Typography;
}
interface Typography {
  heading: Heading;
  label: Label;
  body: Label;
}
interface Label {
  sm: H6;
  md: H6;
  lg: H6;
}
interface Heading {
  h6: H6;
  h5: H6;
  h4: H6;
  h3: H6;
  h2: H6;
  h1: H6;
}
interface H6 {
  regular: Regular;
  medium: Regular;
  semibold: Regular;
}
interface Regular {
  font: string;
  letterSpacing: string;
}
interface Color$1 {
  support: Support;
  focused: Focused;
  background: Background;
  text: Text$2;
  icon: Icon;
  border: Border;
  interactive: Interactive;
  positive: Positive;
}
interface Positive {
  subtle: string;
  medium: string;
  strong: string;
  interactive: string;
}
interface Interactive {
  primary: string;
  hovered: string;
  active: string;
  visited: string;
  disabled: string;
}
interface Border {
  subtle: string;
  medium: string;
  strong: string;
  inverse: string;
  interactive: string;
  disabled: string;
}
interface Icon {
  primary: string;
  secondary: string;
  inverse: string;
  interactive: string;
  disabled: string;
}
interface Text$2 {
  primary: string;
  secondary: string;
  helper: string;
  placeholder: string;
  inverse: string;
  disabled: string;
}
interface Background {
  primary: Primary;
  inverse: Primary;
  secondary: Primary;
  overlay: Overlay;
}
interface Overlay {
  subtle: string;
  medium: string;
  interactive: string;
}
interface Primary {
  subtle: string;
  medium: string;
  strong: string;
}
interface Focused {
  primary: string;
  inset: string;
}
interface Support {
  error: Error$1;
  success: Error$1;
  warning: Error$1;
  info: Error$1;
}
interface Error$1 {
  subtler: string;
  subtle: string;
  medium: string;
  strong: string;
}
interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}
interface Rounded {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}
interface Opacity {
  none: string;
  low: string;
  medium: string;
  high: string;
}
interface Elevation {
  low: string;
  medium: string;
}

interface Sprinkles extends BaseSprinkles {
    base: BaseSprinkles;
    variants: BaseSprinkles;
    compoundVariants: BaseSprinkles;
    overrides: BaseSprinkles;
}

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


/** A list of supported color formats. */
type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba';

/** A list of color channels. */
type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'lightness' | 'red' | 'green' | 'blue' | 'alpha';

type ColorAxes = {xChannel: ColorChannel, yChannel: ColorChannel, zChannel: ColorChannel};

interface ColorChannelRange {
  /** The minimum value of the color channel. */
  minValue: number,
  /** The maximum value of the color channel. */
  maxValue: number,
  /** The step value of the color channel, used when incrementing and decrementing. */
  step: number,
  /** The page step value of the color channel, used when incrementing and decrementing. */
  pageSize: number
}

/** Represents a color value. */
interface Color {
  /** Converts the color to the given color format, and returns a new Color object. */
  toFormat(format: ColorFormat): Color,
  /** Converts the color to a string in the given format. */
  toString(format: ColorFormat | 'css'): string,
  /** Converts the color to hex, and returns an integer representation. */
  toHexInt(): number,
  /**
   * Returns the numeric value for a given channel.
   * Throws an error if the channel is unsupported in the current color format.
   */
  getChannelValue(channel: ColorChannel): number,
  /**
   * Sets the numeric value for a given channel, and returns a new Color object.
   * Throws an error if the channel is unsupported in the current color format.
   */
  withChannelValue(channel: ColorChannel, value: number): Color,
  /**
   * Returns the minimum, maximum, and step values for a given channel.
   */
  getChannelRange(channel: ColorChannel): ColorChannelRange,
  /**
   * Returns a localized color channel name for a given channel and locale,
   * for use in visual or accessibility labels.
   */
  getChannelName(channel: ColorChannel, locale: string): string,
  /**
   * Formats the numeric value for a given channel for display according to the provided locale.
   */
  formatChannelValue(channel: ColorChannel, locale: string): string,
  /**
   * Returns the color space, 'rgb', 'hsb' or 'hsl', for the current color.
   */
  getColorSpace(): ColorFormat,
  /**
   * Returns the color space axes, xChannel, yChannel, zChannel.
   */
  getColorSpaceAxes(xyChannels: {xChannel?: ColorChannel, yChannel?: ColorChannel}): ColorAxes,
  /**
   * Returns an array of the color channels within the current color space space.
   */
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel]
}

interface ColorFieldProps extends Omit<ValueBase<string | Color | null>, 'onChange'>, InputBase, Validation<Color | null>, FocusableProps, TextInputBase, LabelableProps, HelpTextProps {
  /** Handler that is called when the value changes. */
  onChange?: (color: Color | null) => void
}

interface IObject<T> {
    [name: string]: T;
}

declare type TargetParam<Param> = Pick<Param, Exclude<keyof Param, keyof EmitterParam>> & Partial<EmitterParam>;
interface EmitterParam<Target = any> {
    type: string;
    currentTarget: Target;
    stop(): void;
}
declare type OnEvent$1<Param, Target = any> = EmitterParam<Target> & Param;
declare type EventHash<Events, Target> = Partial<{
    [Key in keyof Events]: EventListener<Events[Key], Target>;
}>;
declare type EventListener<Param, Target> = (e: OnEvent$1<Param, Target>) => any;

declare class EventEmitter<Events extends {} = {
    [key: string]: {
        [key: string]: any;
    };
}> {
    private _events;
    on<Name extends keyof Events, Param = Events[Name]>(eventName: Name, listener: EventListener<Param, this>): this;
    on(events: EventHash<Events, this>): this;
    off<Name extends keyof Events, Param = Events[Name]>(eventName?: Name, listener?: EventListener<Param, this>): this;
    off(events: EventHash<Events, this>): this;
    once<Name extends keyof Events & string, Param = Events[Name]>(eventName: Name, listener?: EventListener<Param, this>): Promise<OnEvent$1<Param, this>>;
    emit<Name extends keyof Events, Param = Events[Name]>(eventName: {} extends Param ? Name : never): boolean;
    emit<Name extends keyof Events, Param = Events[Name]>(eventName: Name, param: TargetParam<Param>): boolean;
    trigger<Name extends keyof Events, Param = Events[Name]>(eventName: {} extends TargetParam<Param> ? Name : never): boolean;
    trigger<Name extends keyof Events, Param = Events[Name]>(eventName: Name, param: TargetParam<Param>): boolean;
    private _addEvent;
}

/**
 * @typedef
 * @memberof Gesto
 */
interface Client {
    clientX: number;
    clientY: number;
    originalClientX?: number;
    originalClientY?: number;
}
/**
 * @typedef
 * @memberof Gesto
 */
interface Dist {
    distX: number;
    distY: number;
}
/**
 * @typedef
 * @memberof Gesto
 */
interface Delta {
    deltaX: number;
    deltaY: number;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Client
 * @extends Gesto.Dist
 * @extends Gesto.Delta
 */
interface Position extends Client, Dist, Delta {
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnDragStart$1<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    data: IObject<any>;
    inputEvent: any;
    isTrusted: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isDouble: boolean;
    preventDefault: () => void;
    preventDrag: () => void;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnDrag$1<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isPinch: boolean;
    movement: number;
    datas: IObject<any>;
    data: IObject<any>;
    isScroll: boolean;
    isFirstDrag: boolean;
    inputEvent: any;
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnDragEnd$1<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isClick: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isDouble: boolean;
    datas: IObject<any>;
    data: IObject<any>;
    inputEvent: any;
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnPinchStart<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    data: IObject<any>;
    touches: Position[];
    angle: number;
    inputEvent: any;
    isTrusted: boolean;
    preventDefault: () => void;
    preventDrag: () => void;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnPinch<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    data: IObject<any>;
    touches: Position[];
    rotation: number;
    angle: number;
    scale: number;
    distance: number;
    movement: number;
    inputEvent: any;
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
interface OnPinchEnd<T = Gesto> extends Position, EmitterParam<T> {
    isPinch: boolean;
    datas: IObject<any>;
    data: IObject<any>;
    touches: Position[];
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 */
interface GestoOptions {
    container?: Window | Node | Element;
    /**
     * @default ["mouse", "touch"]
     */
    events?: Array<"drag" | "mouse" | "touch">;
    /**
     * Whether to prevent dragging of the right mouse button
     * @default true
     */
    preventRightClick?: boolean;
    /**
     * @default true
     */
    preventWheelClick?: boolean;
    preventDefault?: boolean;
    /**
     * Prevents pinching when the drag is moved more than a certain distance. That distance allowance is pinchThreshold.
     * @default 0
     */
    pinchThreshold?: number;
    /**
     * Whether to keep dragging even when pinch ends
     * @default false
     */
    keepDragging?: boolean;
    /**
     * Prevent click event on drag. (mousemove, touchmove)
     * @default false
     */
    preventClickEventOnDrag?: boolean;
    /**
     * Prevent click event on dragStart. (mousedown, touchstart)
     * @default false
     */
    preventClickEventOnDragStart?: boolean;
    /**
     * Prevent click event according to specific conditions.
     * Returning true allows the click event, returning false prevents it.
     * @default null
     */
    preventClickEventByCondition?: ((e: MouseEvent) => boolean) | null;
    pinchOutside?: boolean;
    /**
     * Prevent dragging of `input`, `textarea`, and contenteditable.
     * @default false
     */
    checkInput?: boolean;
    /**
     * Whether to drag the focused input
     * If `checkInput` is true, this option is not applied.
     * @default false
     */
    dragFocusedInput?: boolean;
    checkWindowBlur?: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 */
type GestoEvents = {
    "dragStart": OnDragStart$1;
    "drag": OnDrag$1;
    "dragEnd": OnDragEnd$1;
    "pinchStart": OnPinchStart;
    "pinch": OnPinch;
    "pinchEnd": OnPinchEnd;
};

/**
 * You can set up drag, pinch events in any browser.
 */
declare class Gesto extends EventEmitter<GestoEvents> {
    options: GestoOptions;
    private flag;
    private pinchFlag;
    private data;
    private isDrag;
    private isPinch;
    private clientStores;
    private targets;
    private prevTime;
    private doubleFlag;
    private _useMouse;
    private _useTouch;
    private _useDrag;
    private _dragFlag;
    private _isTrusted;
    private _isMouseEvent;
    private _isSecondaryButton;
    private _preventMouseEvent;
    private _prevInputEvent;
    private _isDragAPI;
    private _isIdle;
    private _preventMouseEventId;
    private _window;
    /**
     *
     */
    constructor(targets: Array<Element | Window> | Element | Window, options?: GestoOptions);
    /**
     * Stop Gesto's drag events.
     */
    stop(): void;
    /**
     * The total moved distance
     */
    getMovement(clients?: Client[]): number;
    /**
     * Whether to drag
     */
    isDragging(): boolean;
    /**
     * Whether the operation of gesto is finished and is in idle state
     */
    isIdle(): boolean;
    /**
     * Whether to start drag
     */
    isFlag(): boolean;
    /**
     * Whether to start pinch
     */
    isPinchFlag(): boolean;
    /**
     * Whether to start double click
     */
    isDoubleFlag(): boolean;
    /**
     * Whether to pinch
     */
    isPinching(): boolean;
    /**
     * If a scroll event occurs, it is corrected by the scroll distance.
     */
    scrollBy(deltaX: number, deltaY: number, e: any, isCallDrag?: boolean): void;
    /**
     * Create a virtual drag event.
     */
    move([deltaX, deltaY]: number[], inputEvent: any): TargetParam<OnDrag$1>;
    /**
     * The dragStart event is triggered by an external event.
     */
    triggerDragStart(e: any): void;
    /**
     * Set the event data while dragging.
     */
    setEventData(data: IObject<any>): this;
    /**
     * Set the event data while dragging.
     * Use `setEventData`
     * @deprecated
     */
    setEventDatas(data: IObject<any>): this;
    /**
     * Get the current event state while dragging.
     */
    getCurrentEvent(inputEvent?: any): {
        movement: number;
        isDrag: boolean;
        isPinch: boolean;
        isScroll: boolean;
        inputEvent: any;
        distX: number;
        distY: number;
        clientX: number;
        clientY: number;
        originalClientX?: number | undefined;
        originalClientY?: number | undefined;
        deltaX: number;
        deltaY: number;
        data: IObject<any>;
        datas: IObject<any>;
    };
    /**
     * Get & Set the event data while dragging.
     */
    getEventData(): IObject<any>;
    /**
     * Get & Set the event data while dragging.
     * Use getEventData method
     * @depreacated
     */
    getEventDatas(): IObject<any>;
    /**
     * Unset Gesto
     */
    unset(): void;
    onDragStart: (e: any, isTrusted?: boolean) => false | undefined;
    onDrag: (e: any, isScroll?: boolean) => void;
    onDragEnd: (e?: any) => void;
    onPinchStart(e: TouchEvent): void;
    onPinch(e: TouchEvent, clients: Client[]): void;
    onPinchEnd(e: TouchEvent): void;
    private getCurrentStore;
    private moveClients;
    private onBlur;
    private _addStore;
    private _getPosition;
    private _allowClickEvent;
    private _attchDragEvent;
    private _dettachDragEvent;
    private _onClick;
    private _onContextMenu;
    private _allowMouseEvent;
    private _passCallback;
}

declare class CustomGesto {
    private ableName;
    private prevX;
    private prevY;
    private startX;
    private startY;
    private isDrag;
    private isFlag;
    private datas;
    constructor(ableName?: string);
    dragStart(client: number[], e: any): {
        type: string;
        inputEvent: any;
        isDrag: boolean;
        isFirstDrag: boolean;
        datas: IObject<any>;
        originalDatas: IObject<any>;
        parentEvent: boolean;
        parentGesto: CustomGesto;
        clientX: number;
        clientY: number;
        originalClientX?: number | undefined;
        originalClientY?: number | undefined;
        distX: number;
        distY: number;
        deltaX: number;
        deltaY: number;
    };
    drag(client: number[], inputEvent: any): OnCustomDrag;
    move(delta: number[], inputEvent: any): OnCustomDrag;
}

interface MoveableElementMatrixInfo {
    hasZoom: boolean;
    hasFixed: boolean;
    originalRootMatrix: number[];
    rootMatrix: number[];
    beforeMatrix: number[];
    offsetMatrix: number[];
    allMatrix: number[];
    targetMatrix: number[];
    transformOrigin: number[];
    targetOrigin: number[];
    is3d: boolean;
    targetTransform: string;
    inlineTransform: string;
    offsetContainer: HTMLElement | null;
    offsetRootContainer: HTMLElement | null;
    matrixes: MatrixInfo[];
}

interface MoveableElementInfo extends MoveableElementMatrixInfo, MoveablePosition, ElementSizes {
    width: number;
    height: number;
    rotation: number;
}

interface MoveableTargetInfo extends MoveableElementInfo {
    targetClientRect: MoveableClientRect;
    containerClientRect: MoveableClientRect;
    moveableClientRect: MoveableClientRect;
    rootContainerClientRect: MoveableClientRect;
    beforeDirection: 1 | -1;
    beforeOrigin: number[];
    offsetDelta: number[];
    originalBeforeOrigin: number[];
    target: HTMLElement | SVGElement | null | undefined;
    style: Partial<Writable<CSSStyleDeclaration>>;
}

interface MoveableClientRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    clientLeft?: number;
    clientTop?: number;
    clientWidth?: number;
    clientHeight?: number;
    scrollWidth?: number;
    scrollHeight?: number;
    overflow?: boolean;
}
declare type MoveableManagerProps<T = {}> = {
    cssStyled: any;
    customStyledMap: Record<string, any>;
    wrapperMoveable?: MoveableManagerInterface | null;
    isWrapperMounted?: boolean;
    parentMoveable?: MoveableManagerInterface | null;
    parentPosition?: number[] | null;
    groupable?: boolean;
} & MoveableDefaultOptions & (unknown extends T ? IObject<any> : T);
/**
 * @typedef
 * @memberof Moveable
 */
interface MoveablePosition {
    left: number;
    top: number;
    right: number;
    bottom: number;
    origin: number[];
    pos1: number[];
    pos2: number[];
    pos3: number[];
    pos4: number[];
    direction: 1 | -1;
}
/**
 * @typedef
 * @memberof Moveable
 * @options
 */
interface DefaultOptions {
    /**
     * The target(s) to indicate Moveable Control Box.
     * @default null
     */
    target?: SVGElement | HTMLElement | null;
    /**
     * The external target(s) to drag Moveable target(s)
     * @default target
     */
    dragTarget?: MoveableRefType | null;
    /**
     * If dragTarget is set directly, taget itself cannot be dragged.
     * Whether to drag the target as well.
     * @default false
     */
    dragTargetSelf?: boolean;
    /**
     * Container area where drag works
     * @default window
     */
    dragContainer?: null | Window | MoveableRefType<HTMLElement>;
    /**
     * A container into which Moveables are inserted.
     * Set it only when used within the slot of Web Components or when the container is different.
     * @default parentElement
     */
    container?: SVGElement | HTMLElement | null;
    /**
     * Whether to warp itself to the container itself. Don't set it.
     * @private
     * @default false
     */
    warpSelf?: boolean;
    /**
     * Moveable Root Container (No Transformed Container)
     * @default parentElement
     * @story options--options-root-container
     */
    rootContainer?: MoveableRefType<HTMLElement>;
    /**
     * If you want to set the dragging information to the viewer, refer to the following.
     * @default null
     * @story options--options-view-container
     */
    viewContainer?: MoveableRefType<HTMLElement>;
    /**
     * Whether the target size is detected and updated whenever it changes.
     * It is more effective when used together with `useMutationObserver`.
     * @default false
     * @story options--options-resize-observer
     */
    useResizeObserver?: boolean;
    /**
     * Whether the target size, pos in inline style is detected and updated whenever it changes.
     * It is more effective when used together with `useResizeObserver`.
     * @default false
     * @story options--options-mutation-observer
     */
    useMutationObserver?: boolean;
    /**
     * Zooms in the elements of a moveable.
     * @default 1
     */
    zoom?: number;
    /**
     * The default transformOrigin of the target can be set in advance.
     * @default ""
     */
    transformOrigin?: Array<string | number> | string | "";
    /**
     * You can add your custom able.
     * @default []
     */
    ables?: Able[];
    /**
     * You can specify the className of the moveable controlbox.
     * @default ""
     */
    className?: string;
    /**
     * Minimum distance to pinch.
     * @default 20
     */
    pinchThreshold?: number;
    /**
     * Whether the container containing the target becomes a pinch.
     * @default true
     */
    pinchOutside?: boolean;
    /**
     * Lets generate events of ables at the same time. (like Resizable, Scalable)
     * @default false
     */
    triggerAblesSimultaneously?: boolean;
    /**
     * Checks whether this is an element to input text or contentEditable, and prevents dragging.
     * @default false
     */
    checkInput?: boolean;
    /**
     * add nonce property to style for CSP.
     * @deprecated
     * @default ""
     */
    cspNonce?: string;
    /**
     * You can set the translateZ value of moveable.
     * @default 50
     */
    translateZ?: number | string;
    /**
     * Whether to hide the line corresponding to the rect of the target.
     * @default false
     */
    hideDefaultLines?: boolean;
    /**
     * Whether to prevent bubbling of events like mousedown, touchstart, etc.
     * @default false
     */
    stopPropagation?: boolean;
    /**
     * Whether to call preventDefault on touchstart or mousedown
     * @since 0.44.0
     * @default true
     */
    preventDefault?: boolean;
    /**
     * Whether to prevent dragging using the right mouse button
     * @default true
     */
    preventRightClick?: boolean;
    /**
     * Whether to prevent dragging using the wheel (middle) mouse button
     * @default true
     */
    preventWheelClick?: boolean;
    /**
     * Prevent click event on drag. (mousemove, touchmove)
     * @default true
     */
    preventClickEventOnDrag?: boolean;
    /**
     * Whether to drag the focused input
     * If `checkInput` is true, this option is not applied.
     * @since 0.47.0
     * @story options--options-drag-focused-input
     * @default false
     */
    dragFocusedInput?: boolean;
    /**
     * Prevent click event on dragStart. (mousedown, touchstart)
     * @default false
     */
    preventClickDefault?: boolean;
    /**
     * You can use props in object format or custom props.
     * @default empty object
     */
    props?: Record<string, any>;
    /**
     * Data for first render
     * @default null
     */
    persistData?: PersistRectData | null;
    /**
     * Whether to accurately show the position of a movable control box
     * Because getBoundingClientRect is used, css zoom, transform: rotate between container and rootContainer cannot be used.
     * group is not supported.
     * @default false
     */
    useAccuratePosition?: boolean;
    /**
     * By adding padding to the line, you can increase the area of the line that can be clicked and dragged.
     * @since 0.43.0
     * @story options--options-line-padding
     * @default 0
     */
    linePadding?: number;
    /**
     * By adding padding to the control, you can increase the area of the control that can be clicked and dragged.
     * Either `rotateAroundControls` or `displayAroundControls` can be used.
     * @since 0.44.0
     * @story options--options-control-padding
     * @default 0
     */
    controlPadding?: number;
    /**
     * @private
     * single => group로 변환과정에 도형 유지를 위한 첫 렌더링 state
     */
    firstRenderState?: MoveableManagerState | null;
    /**
     * @private
     */
    requestStyles?: string[];
    /**
     * If you are using React 18's concurrent mode, use `flushSync` for UI sync.
     * @default empty function
     * @example
     * ```jsx
     * import { flushSync } from "react-dom";
     *
     * <Moveable flushSync={flushSync} />
     * ```
     */
    flushSync?: (callback: () => void) => void;
}
/**
 * @typedef
 * @extends Moveable.DefaultOptions
 * @extends Moveable.DragAreaOptions
 * @extends Moveable.OriginOptions
 * @extends Moveable.PaddingOptions
 */
interface MoveableDefaultOptions extends DefaultOptions, DragAreaOptions, OriginOptions, PaddingOptions {
}
interface MatrixInfo {
    type: "offset" | "target" | "zoom";
    target: SVGElement | HTMLElement;
    matrix?: number[];
    origin?: number[];
    zoom?: number;
}
declare type MoveableManagerState<T = {}> = {
    container: SVGElement | HTMLElement | null | undefined;
    disableNativeEvent: boolean;
    gestos: Record<string, Gesto | CustomGesto | null>;
    renderLines: number[][][];
    renderPoses: number[][];
    posDelta: number[];
    style: Partial<Writable<CSSStyleDeclaration>>;
    isPersisted?: boolean;
} & MoveableTargetInfo & T;
/**
 * @typedef
 * @memberof Moveable
 */
interface ElementSizes {
    svg: boolean;
    offsetWidth: number;
    offsetHeight: number;
    clientWidth: number;
    clientHeight: number;
    inlineCSSWidth: number;
    inlineCSSHeight: number;
    cssWidth: number;
    cssHeight: number;
    contentWidth: number;
    contentHeight: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    minOffsetWidth: number;
    minOffsetHeight: number;
    maxOffsetWidth: number;
    maxOffsetHeight: number;
}
/**
 * @typedef
 * @memberof Moveable
 * @property - left padding
 * @property - top padding
 * @property - right padding
 * @property - bottom padding
 */
interface PaddingBox {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}
interface Renderer {
    createElement(type: any, props?: any, ...children: any[]): any;
}
/**
 * @typedef
 * @memberof Moveable.Snappable
 */
interface SnapGuideline {
    type: "horizontal" | "vertical";
    direction: string;
    hide?: boolean;
    element?: Element | null;
    isStart?: boolean;
    isEnd?: boolean;
    isCenter?: boolean;
    isInner?: boolean;
    grid?: boolean;
    pos: number[];
    size: number;
    className?: string;
    sizes?: number[];
    gap?: number;
    elementDirection?: string;
    elementRect?: SnapElementRect;
    gapRects?: SnapElementRect[];
}
/**
 * @memberof Moveable
 * @typedef
 */
declare type MoveableRefType<T extends Element = HTMLElement | SVGElement> = string | (() => T) | MoveableRefObject<T> | T | null | undefined;
/**
 * @memberof Moveable
 * @typedef
 */
interface MoveableRefObject<T extends Element = HTMLElement | SVGElement> {
    current: T | undefined | null;
}
/**
 * You can make Able that can work in Moveable.
 * @typedef
 * In Able, you can manage drag events, props, state, fire event props, and render elements.
 * @memberof Moveable
 */
interface Able<Props extends IObject<any> = IObject<any>, Events extends IObject<any> = IObject<any>> {
    name: string;
    props?: readonly (keyof Props)[];
    events?: readonly (keyof Events)[];
    always?: boolean;
    ableGroup?: string;
    updateRect?: boolean;
    canPinch?: boolean;
    css?: string[];
    /**
     * You can request style. Specify the name of the style in camel case.
     * You can check it with `moveable.state.style`
     * @exmaple
     * ["borderRadius", "top", "left"]
     */
    requestStyle?(): string[];
    /**
     * If you use group, you can request child style. Specify the name of the style in camel case.
     * You can check it with `moveable.state.style`
     * @exmaple
     * ["borderRadius", "top", "left"]
     */
    requestChildStyle?(): string[];
    /**
     * You can specify the class name to be added to the Moveable control box.
     */
    className?(moveable: any): string;
    /**
     * You can specify the class name to be added to the Moveable View Container
     */
    viewClassName?(moveable: any): string;
    /**
     * Check how related to drag
     */
    dragRelation?: "strong" | "weak" | undefined | null | false;
    /**
     * Fired when the event is cleared
     */
    unset?(moveable: any): any;
    /**
     * Renders the React DOM structure for the able.
     */
    render?(moveable: any, renderer: Renderer): any;
    dragStart?(moveable: any, e: any): any;
    drag?(moveable: any, e: any): any;
    dragEnd?(moveable: any, e: any): any;
    dragAfter?(moveable: any, e: any): any;
    pinchStart?(moveable: any, e: OnPinchStart): any;
    pinch?(moveable: any, e: OnPinch): any;
    pinchEnd?(moveable: any, e: OnPinchEnd): any;
    dragControlCondition?(moveable: any, e: any): boolean;
    dragControlStart?(moveable: any, e: any): any;
    dragControl?(moveable: any, e: any): any;
    dragControlEnd?(moveable: any, e: any): any;
    dragControlAfter?(moveable: any, e: any): any;
    dragGroupCondition?(moveable: any, e: any): boolean;
    dragGroupStart?(moveable: any, e: any): any;
    dragGroup?(moveable: any, e: any): any;
    dragGroupEnd?(moveable: any, e: any): any;
    pinchGroupStart?(moveable: any, e: OnPinchStart): any;
    pinchGroup?(moveable: any, e: OnPinch): any;
    pinchGroupEnd?(moveable: any, e: OnPinchEnd): any;
    dragGroupControlCondition?(moveable: any, e: any): boolean;
    dragGroupControlStart?(moveable: any, e: any): any;
    dragGroupControl?(moveable: any, e: any): any;
    dragGroupControlEnd?(moveable: any, e: any): any;
    mouseEnter?(moveable: any, e: any): any;
    mouseLeave?(moveable: any, e: any): any;
    mouseGroupEnter?(moveable: any, e: any): any;
    mouseGroupLeave?(moveable: any, e: any): any;
    request?(moveable: any): AbleRequester;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface OnEvent {
    /**
     * The Moveable instance
     */
    currentTarget: MoveableManagerInterface<Record<string, any>, Record<string, any>>;
    /**
     * The Moveable instance
     */
    moveable: MoveableManagerInterface<Record<string, any>, Record<string, any>>;
    /**
     * The Moveable's target
     */
    target: HTMLElement | SVGElement;
    /**
     * The horizontal coordinate within the application's client area at which the event occurred.
     */
    clientX: number;
    /**
     * The vertical coordinate within the application's client area at which the event occurred.
     */
    clientY: number;
    /**
     * Whether this is the first drag in the drag event
     */
    isFirstDrag: number;
    /**
     * Objects that can send information to the following events.
     */
    datas: IObject<any>;
    /**
     * The mouse or touch input event that is invoking the moveable event
     */
    inputEvent: any;
    /**
     * Stop the currently working able.
     */
    stopAble(): void;
    /**
     * Calling `stopDrag` in a drag-related event ends the drag.
     */
    stopDrag(): void;
    /**
     * Whether the event did not occur externally
     */
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Moveable
 * @extends Moveable.OnEvent
 * @property - This is the last dragged event. No, if you haven't dragged.
 * @property - Whether this moved
 * @property - Whether it is double-click
 */
interface OnEndEvent extends OnEvent {
    lastEvent: any | undefined;
    isDrag: boolean;
    isDouble: boolean;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface OnTransformStartEvent {
    /**
     * Set your original transform.
     * `transformIndex` is the sequence of functions used in the event.
     * If you use `setTransform`, you don't need to use `set` function.
     * @default transform of target's inline style
     */
    setTransform(transform: string | string[], transformIndex?: number): void;
    /**
     * `transformIndex` is the sequence of functions used in the event.
     * @default index with that property in transform or last
     */
    setTransformIndex(transformIndex: number): void;
}
/**
 * @typedef
 * @memberof Moveable
 * @extends Moveable.CSSObject
 */
interface TransformObject extends CSSObject {
    /**
     * a target's next transform string value.
     */
    transform: string;
    /**
     * A transform obtained by the simultaneous occurrence of other events in the current event
     */
    afterTransform: string;
}
/**
 * @typedef
 * @memberof Moveable
 * @extends Moveable.TransformObject
 */
interface OnTransformEvent extends TransformObject {
    /**
     * transform events causes a `drag` event. In some events, there may be no value.
     */
    drag: OnDrag;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface AbleRequestParam {
    /**
     * Run the request instantly. (requestStart, request, requestEnd happen at the same time)
     */
    isInstant?: boolean;
    [key: string]: any;
}
/**
 * @typedef
 * @memberof Moveable
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.html#request|Request Method}
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Draggable.html#request|Draggable Requester}
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Resizable.html#request|Resizable Requester}
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Scalable.html#request|Scalable Requester}
 * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Rotatable.html#request|Rotatable Requester}
 * @property - Continue executing the request.
 * @property - End the request.
 */
interface Requester<RequestParam extends {} = AbleRequestParam> {
    request(param: RequestParam): this;
    requestEnd(): this;
}
interface AbleRequester {
    isControl: boolean;
    requestStart(param: IObject<any>): IObject<any>;
    request(param: IObject<any>): IObject<any>;
    requestEnd(): IObject<any>;
}
/**
 * When the drag starts, the dragStart event is called.
 * @typedef
 * @memberof Moveable.Draggable
 * @extends Moveable.OnEvent
 * @extends Moveable.OnTransformStartEvent
 */
interface OnDragStart extends OnEvent, OnTransformStartEvent {
    /**
     * You can set the start translate value.
     */
    set: (translate: number[]) => void;
}
/**
 * @typedef
 * @memberof Moveable.Draggable
 * @extends Moveable.OnEvent
 * @extends Moveable.CSSObject
 * @property - The delta of [left, top]
 * @property - The distance of [left, top]
 * @property - The position of [left, top]
 * @property - The delta of [translateX, translateY]
 * @property - The distance of [translateX, translateY]
 * @property - The position of [translateX, translateY]
 * @property - a target's transform
 * @property - a target's left
 * @property - a target's top
 * @property - a target's bottom
 * @property - a target's offset width
 * @property - a target's offset height
 * @property - a target's right
 * @property - Whether or not it is being pinched.
 */
interface OnDrag extends OnEvent, CSSObject {
    beforeDelta: number[];
    beforeDist: number[];
    beforeTranslate: number[];
    delta: number[];
    dist: number[];
    translate: number[];
    transform: string;
    left: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    right: number;
    isPinch: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Draggable
 * @extends Moveable.OnEndEvent
 */
interface OnDragEnd extends OnEndEvent {
}
/**
 * @typedef
 * @memberof Moveable.Resizable
 * @extends Moveable.OnEvent
 * @property - The direction of resize.
 * @property - resize causes a `dragStart` event.
 * @property - You can set the css width, height value.
 * @property - You can set the css min width, min height value. (default: min-width)
 * @property - You can set the css max width, max height value. (default: max-width)
 * @property - You can set the css origin (default: % %)
 * @property - Set a fixed direction to resize. (default: Opposite direction)
 * @property - Set the ratio of width and height. (default: offsetWidth / offsetHeight)
 */
interface OnResizeStart extends OnEvent {
    /**
     * The direction of resize.
     */
    direction: number[];
    /**
     * First set (boundingWidth / boundingHeight) value
     */
    startRatio: number;
    /**
     * resize causes a `dragStart` event.
     */
    dragStart: OnDragStart | false;
    /**
     * You can set the css width, height value.
     */
    set: (size: number[]) => any;
    /**
     * You can set the css min offset width, min offset height value.
     * @default [minOffsetWidth, minOffsetHeight])
     */
    setMin: (minSize: Array<string | number>) => any;
    /**
     * You can set the css max offset width, max offset height value.
     * @default [maxOffsetWidth, maxOffsetHeight])
     */
    setMax: (maxSize: Array<string | number>) => any;
    /**
     * You can set the css origin
     * @default transformOrigin
     */
    setOrigin: (origin: Array<string | number>) => any;
    /**
     * Set a fixed direction to resize.
     * @default Opposite direction
     */
    setFixedDirection: (startDirecition: number[]) => any;
    /**
     * Set a fixed direction to resize.
     * @default Opposite position
     * @private
     */
    setFixedPosition: (startPosition: number[]) => any;
    /**
     * Set the ratio of width and height.
     * @default offsetWidth / offsetHeight
     */
    setRatio: (ratio: number) => any;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface CSSObject {
    /**
     * You can get the style you can get from the event.
     */
    style: Record<string, string>;
    /**
     * You can get it as a cssText that you can get from that event.
     */
    cssText: string;
}
/**
 * @typedef
 * @memberof Moveable.Resizable
 * @extends Moveable.OnEvent
 * @extends Moveable.OnTransformEvent
 */
interface OnResize extends OnEvent, OnTransformEvent {
    /**
     * The direction of resize.
     */
    direction: number[];
    /**
     * a target's cssWidth
     */
    width: number;
    /**
     * a target's cssHeight
     */
    height: number;
    /**
     * a target's offset width as an integer with bounding width
     */
    offsetWidth: number;
    /**
     * a target's offset height as an integer with bounding height
     */
    offsetHeight: number;
    /**
     * a target's bounding width
     */
    boundingWidth: number;
    /**
     * a target's bounding height
     */
    boundingHeight: number;
    /**
     * The distance of [boundingWidth, boundingHeight]
     */
    dist: number[];
    /**
     * The delta of [boundingWidth, boundingHeight]
     */
    delta: number[];
    /**
     * First set (boundingWidth / boundingHeight) value
     */
    startRatio: number;
    /**
     * Whether or not it is being pinched.
     */
    isPinch: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Resizable
 * @extends Moveable.OnEndEvent
 */
interface OnResizeEnd extends OnEndEvent {
}
/**
 * @typedef
 * @memberof Moveable.Rotatable
 * @extends Moveable.OnEvent
 * @extends Moveable.OnTransformStartEvent
 */
interface OnRotateStart extends OnEvent, OnTransformStartEvent {
    /**
     * You can set the start rotate value.
     */
    set: (rotate: number) => void;
    /**
     * Set a fixed direction to rotate.
     * @default target's transformOrigin
     */
    setFixedDirection: (fixedDirection: number[]) => void;
    /**
     * Set a fixed position to rotate.
     * @default target's transformOrigin
     */
    setFixedPosition: (fixedPosition: number[]) => void;
    /**
     * rotate causes a `dragStart` event.
     */
    dragStart: OnDragStart | false;
    /**
     * rotate causes a `resizeStart` event.
     */
    resizeStart: OnResizeStart | false;
}
/**
 * @typedef
 * @description Parameters for the `rotate` event
 * @memberof Moveable.Rotatable
 * @extends Moveable.OnEvent
 * @extends Moveable.OnTransformEvent
 */
interface OnRotate extends OnEvent, OnTransformEvent {
    /**
     * The distance of rotation degree before transform is applied
     */
    beforeDist: number;
    /**
     * The delta of rotation degree before transform is applied
     */
    beforeDelta: number;
    /**
     * The now rotation degree before transform is applied
     * @deprecated
     */
    beforeRotate: number;
    /**
     * The now rotation degree before transform is applied
     */
    beforeRotation: number;
    /**
     * The distance of rotation degree
     */
    dist: number;
    /**
     * The delta of rotation degree
     */
    delta: number;
    /**
     * The now rotation degree
     * @deprecated
     */
    rotate: number;
    /**
     * The now rotation degree
     */
    rotation: number;
    /**
     * The distance of client rotation degree
     */
    absoluteDist: number;
    /**
     * The delta of client rotation degree
     */
    absoluteDelta: number;
    /**
     * The now client rotation degree
     * @deprecated
     */
    absoluteRotate: number;
    /**
     * The now client rotation degree
     */
    absoluteRotation: number;
    /**
     * Whether or not it is being pinched.
     */
    isPinch: boolean;
    /**
     * rotate causes a `resize` event.
     */
    resize?: OnResize;
}
/**
 * @typedef
 * @memberof Moveable.Rotatable
 * @extends Moveable.OnEndEvent
 */
interface OnRotateEnd extends OnEndEvent {
}
/**
 * `renderStart` event occurs at the first start of all events.
 * @typedef
 * @memberof Moveable
 * @extends Moveable.OnEvent
 * @property - Whether or not it is being pinched.
 */
interface OnRenderStart extends OnEvent {
    isPinch: boolean;
}
/**
 * `render` event occurs before the target is drawn on the screen.
 * @typedef
 * @memberof Moveable
 * @extends Moveable.OnEvent
 * @extends Moveable.CSSObject
 */
interface OnRender extends OnEvent, CSSObject {
    /**
     * a target's next transform string value.
     */
    transform: string;
    /**
     * Whether or not it is being pinched.
     */
    isPinch: boolean;
    /**
     * Return transform as a transform object.
     * `rotate` is a number and everything else is an array of numbers.
     */
    transformObject: Record<string, any>;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface PaddingOptions {
    /**
     * Add padding around the target to increase the drag area.
     * @default null
     */
    padding?: PaddingBox | number;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface OriginOptions {
    /**
     * Whether or not the origin control box will be visible or not.
     * @default true
     */
    origin?: boolean;
    /**
     * Sets the transform origin based on the svg target. If not set, it is set as the transform origin based on the owner of svg.
     * @since 0.47.0
     * @default ""
     */
    svgOrigin?: string;
}
/**
 * @typedef
 * @memberof Moveable
 * @extends Moveable.AbleRequestParam
 * @description the Resizable's request parameter
 */
interface AbleRequesters {
    draggable: DraggableRequestParam;
    resizable: ResizableRequestParam;
    scalable: ScalableRequestParam;
    rotatable: RotatableRequestParam;
    [key: string]: AbleRequestParam;
}
/**
 * @typedef
 * @memberof Moveable.Draggable
 * @extends Moveable.AbleRequestParam
 * @description the Draggable's request parameter
 */
interface DraggableRequestParam extends AbleRequestParam {
    /**
     * x position
     */
    x?: number;
    /**
     * y position
     */
    y?: number;
    /**
     * X number to move
     */
    deltaX?: number;
    /**
     * Y number to move
     */
    deltaY?: number;
    /**
     * whether to use with `snappable`
     */
    useSnap?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Resizable
 * @extends Moveable.AbleRequestParam
 * @description the Resizable's request parameter
 */
interface ResizableRequestParam extends AbleRequestParam {
    /**
     * Direction to resize
     * @default [1, 1]
     */
    direction?: number[];
    /**
     * Whether to force keepRatio to resize
     */
    keepRatio?: boolean;
    /**
     * delta number of width
     */
    deltaWidth?: number;
    /**
     * delta number of height
     */
    deltaHeight?: number;
    /**
     * offset number of width
     */
    offsetWidth?: number;
    /**
     * offset number of height
     */
    offsetHeight?: number;
    /**
     *
     */
    horizontal?: boolean;
    /**
     * whether to use with `snappable`
     */
    useSnap?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Scalable
 * @extends Moveable.AbleRequestParam
 * @description the Scalable's request parameter
 */
interface ScalableRequestParam extends AbleRequestParam {
    /**
     * Direction to scale
     * @default [1, 1]
     */
    direction?: number[];
    /**
     * Whether to force keepRatio to resize
     */
    keepRatio?: boolean;
    /**
     * delta number of width
     */
    deltaWidth?: number;
    /**
     * delta number of height
     */
    deltaHeight?: number;
    /**
     * whether to use with `snappable`
     */
    useSnap?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Rotatable
 * @extends Moveable.AbleRequestParam
 * @description the Rotatable's request parameter
 */
interface RotatableRequestParam extends AbleRequestParam {
    /**
     * delta number of rotation
     */
    deltaRotate?: number;
    /**
     * absolute number of moveable's rotation
     */
    rotate?: number;
}
declare type RotationPosition = "top" | "bottom" | "left" | "right" | "top-right" | "top-left" | "bottom-right" | "bottom-left" | "left-top" | "left-bottom" | "right-top" | "right-bottom" | "none";
/**
 * @typedef
 * @memberof Moveable.Snappable
 */
interface SnapDirections {
    /**
     * Whether to snap the top of the element
     * @default true
     */
    left?: boolean;
    /**
     * Whether to snap the left of the element
     * @default true
     */
    top?: boolean;
    /**
     * Whether to snap the right of the element
     * @default true
     */
    right?: boolean;
    /**
     * Whether to snap the bottom of the element
     * @default true
     */
    bottom?: boolean;
    /**
     * Whether to snap the center((left + right) / 2) of the element
     * @default false
     */
    center?: boolean;
    /**
     * Whether to snap the middle((top + bottom) / 2) of the element
     * @default false
     */
    middle?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Snappable
 * @extends Moveable.Snappable.SnapDirections
 */
interface ElementGuidelineValue extends SnapDirections {
    /**
     * guideline element
     */
    element: Element;
    /**
     * class names to add to guideline
     * @default ""
     * @example
     *
     * ```css
     * .moveable-gap.red {
     *   background: red!important;
     * }
     * ```
     * ```css
     * .moveable-bold.red {
     *   background: red!important;
     * }
     * ```
     * ```css
     * .moveable-dashed.red {
     *   border-top-color: red!important;
     * }
     * ```
     */
    className?: string;
    /**
     * Whether to update the element size at every render
     * @default false
     */
    refresh?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Snappable
 * @extends Moveable.Snappable.SnapDirections
 */
interface ElementGuidelineValue extends SnapDirections {
    /**
     * guideline element
     */
    element: Element;
    /**
     * class names to add to guideline
     * @default ""
     */
    className?: string;
    /**
     * Whether to update the element size at every render
     * @default false
     */
    refresh?: boolean;
}
/**
 * @typedef
 * @memberof Moveable.Snappable
 */
interface OnSnap {
    /**
     * snapped verticalGuidelines, horizontalGuidelines,
     */
    guidelines: SnapGuideline[];
    /**
     * snapped elements (group by element)
     */
    elements: SnapGuideline[];
    /**
     * gaps is snapped guidelines that became gap snap between elements.
     */
    gaps: SnapGuideline[];
}
interface SnapDirectionPoses {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
    center?: number;
    middle?: number;
}
interface SnapElementRect extends ElementGuidelineValue {
    rect: SnapDirectionPoses;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface DragAreaOptions {
    /**
     * Instead of firing an event on the target, we add it to the moveable control element. You can use click and clickGroup events.
     * @default if group, true, else fals
     */
    dragArea?: boolean;
    /**
     * Set `pointerEvents: none;` css to pass events in dragArea.
     * @default false
     */
    passDragArea?: boolean;
}
interface OnCustomDrag extends Position {
    type: string;
    inputEvent: any;
    isDrag: boolean;
    isFirstDrag: boolean;
    datas: IObject<any>;
    originalDatas: IObject<any>;
    parentEvent: boolean;
    parentGesto: CustomGesto;
}
/**
 * @typedef
 * @memberof Moveable
 */
declare type PersistRectData = Omit<Partial<RectInfo>, "children"> & {
    children?: Array<Partial<RectInfo>>;
};
/**
 * @typedef
 * @memberof Moveable
 */
interface RectInfo {
    /**
     * The coordinates of the vertex 1
     */
    pos1: number[];
    /**
     * The coordinates of the vertex 2
     */
    pos2: number[];
    /**
     * The coordinates of the vertex 3
     */
    pos3: number[];
    /**
     * The coordinates of the vertex 4
     */
    pos4: number[];
    /**
     * left position of the target relative to the container
     */
    left: number;
    /**
     * top position of the target relative to the container
     */
    top: number;
    /**
     * The width of moveable element
     */
    width: number;
    /**
     * The height of moveable element
     */
    height: number;
    /**
     * The offset width of the target
     */
    offsetWidth: number;
    /**
     * The offset height of the target
     */
    offsetHeight: number;
    /**
     * The absolute transform origin
     */
    origin: number[];
    /**
     * The absolute transform origin before transformation
     */
    beforeOrigin: number[];
    /**
     * The target transform origin
     */
    transformOrigin: number[];
    /**
     * you can get the absolute rotation value
     */
    rotation: number;
    /**
     * If you use a group, you can get child moveables' rect info
     */
    children?: RectInfo[];
}
/**
 * @typedef
 * @memberof Moveable
 * @property - top position
 * @property - left position
 * @property - target's width
 * @property - target's height
 */
interface HitRect {
    top: number;
    left: number;
    width?: number;
    height?: number;
}
/**
 * @typedef
 * @memberof Moveable
 * @extends Moveable.MoveableInterface
 */
interface MoveableManagerInterface<T = {}, U = {}> extends MoveableInterface {
    moveables?: MoveableManagerInterface[];
    props: MoveableManagerProps<T>;
    state: MoveableManagerState<U>;
    renderState: Record<string, any>;
    rotation: number;
    scale: number[];
    controlGesto: Gesto;
    targetGesto: Gesto;
    enabledAbles: Able[];
    controlAbles: Able[];
    targetAbles: Able[];
    areaElement: HTMLElement;
    controlBox: HTMLElement;
    isUnmounted: boolean;
    useCSS(tag: string, css: string): any;
    getContainer(): HTMLElement | SVGElement;
    getRotation(): number;
    getState(): MoveableManagerState<U>;
    triggerEvent(name: string, params: IObject<any>, isManager?: boolean): any;
}
/**
 * @typedef
 * @memberof Moveable
 */
interface MoveableInterface {
    getManager(): MoveableManagerInterface<any, any>;
    getRect(): RectInfo;
    getAble<T extends Able>(ableName: string): T | undefined;
    isMoveableElement(target: Element): boolean;
    /**
     * If the location or size of the target is changed, call the `.updateRect()` method.
     * Use the `useResizeObserver` and `useMutationObserver` props to update automatically.
     */
    updateRect(type?: "Start" | "" | "End", isTarget?: boolean, isSetState?: boolean): void;
    /**
     * @deprecated
     * Use `.updateRect()` method
     */
    updateTarget(): void;
    /**
     * Request able through a method rather than an event.
     * At the moment of execution, requestStart is executed,
     * and then request and requestEnd can be executed through Requester.
     * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Draggable.html#request Draggable Requester}
     * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Resizable.html#request Resizable Requester}
     * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Scalable.html#request Scalable Requester}
     * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.Rotatable.html#request Rotatable Requester}
     * @see {@link https://daybrush.com/moveable/release/latest/doc/Moveable.OriginDraggable.html#request OriginDraggable Requester}
     * @param - ableName
     * @param - request to be able params.
     * @param - If isInstant is true, request and requestEnd are executed immediately.
     * @return - Able Requester. If there is no request in able, nothing will work.
     * @example
     * import Moveable from "moveable";
     *
     * const moveable = new Moveable(document.body);
     *
     * // Instantly Request (requestStart - request - requestEnd)
     * moveable.request("draggable", { deltaX: 10, deltaY: 10 }, true);
     *
     * // Start move
     * const requester = moveable.request("draggable");
     * requester.request({ deltaX: 10, deltaY: 10 });
     * requester.request({ deltaX: 10, deltaY: 10 });
     * requester.request({ deltaX: 10, deltaY: 10 });
     * requester.requestEnd();
     */
    request<RequestParam extends AbleRequesters[Name], Name extends string = string>(ableName: Name, params?: RequestParam, isInstant?: boolean): Requester<RequestParam>;
    /**
     * moveable is the top level that manages targets
     * `Single`: MoveableManager instance
     * `Group`: MoveableGroup instance
     * `IndividualGroup`: MoveableIndividaulGroup instance
     * Returns leaf target MoveableManagers.
     */
    getMoveables(): MoveableManagerInterface[];
    /**
     * Returns the element of the control box.
     */
    getControlBoxElement(): HTMLElement;
    /**
     * Target element to be dragged in moveable
     */
    getDragElement(): HTMLElement | SVGElement | null | undefined;
    destroy(): void;
    dragStart(e: MouseEvent | TouchEvent, target?: EventTarget | null): void;
    isInside(clientX: number, clientY: number): boolean;
    isDragging(ableName?: string): boolean;
    hitTest(el: Element | HitRect): number;
    setState(state: any, callback?: () => any): any;
    waitToChangeTarget(): Promise<void>;
    forceUpdate(callback?: () => any): any;
    updateSelectors(): void;
    getTargets(): Array<HTMLElement | SVGElement>;
    stopDrag(type?: "target" | "control"): void;
}
declare type Writable<T> = {
    -readonly [key in keyof T]: T[key];
};

interface AriaToolbarProps extends AriaLabelingProps {
    /**
     * The orientation of the entire toolbar.
     * @default 'horizontal'
     */
    orientation?: Orientation;
}

type DragAndDropProps = Omit<DraggableCollectionStateOptions & DraggableCollectionOptions & DroppableCollectionOptions & DroppableCollectionStateOptions, "keyboardDelegate" | "dropTargetDelegate" | "shouldAcceptItemDrop" | "onDropEnter" | "onDropActivate" | "onDropExit" | "getDropOperation" | "collection" | "selectionManager" | "onRootDrop" | "onInsert" | "getAllowedDropOperations" | "getItems" | "onItemDrop"> & Partial<Pick<DraggableCollectionStateOptions, "getItems">> & {
    /**
     * Indicates whether reordering is enabled.
     *
     * @default false
     */
    enableReorder: boolean;
    /**
     * Whether the items are arranged in a stack or grid.
     *
     * @default stack
     */
    layout: "grid" | "stack";
    /**
     * The primary orientation of the items. Usually this is the direction that
     * the collection scrolls.
     *
     * @default vertical
     */
    orientation: Orientation;
};

interface BlockProps {
  /**
   * The unique identifier for the block. This is used to identify the block in
   * the DOM and in the block map. It is added as a data attribute
   * `data-block-id` to the root element of the block if a DOM node is
   * rendered.
   */
  "data-block-id"?: Key$1;
}

interface StylingProps extends BlockProps {
  /** The className applied to the root element of the component. */
  className?: string;

  /** The style applied to the root element of the component. */
  style?: React__default.CSSProperties;
}

interface ListOption {
    id: string;
    label: string;
    description?: string;
    icon?: React__default.FC<IconProps>;
    data?: Record<string, any>;
    /**
     * The type of item.
     *
     * @default item
     */
    type?: "option";
}
interface ListSection {
    id: string;
    title?: string;
    type: "section";
    children: ListOption[];
}
type ListItem = ListOption | ListSection;
interface ListBoxProps extends StylingProps, Omit<AriaListBoxProps<ListItem> & AriaListBoxOptions<ListItem>, "children" | "linkBehavior" | "isVirtualized" | "keyboardDelegate">, Omit<DragAndDropProps, "preview" | "enableReorder" | "orientation" | "layout">, Partial<Pick<DragAndDropProps, "enableReorder" | "orientation" | "layout">> {
    /**
     * The items to render in the listbox. Items have the following shape:
     *
     * ```ts
     * export type ListOption = {
     *   id: string;
     *   label: string;
     *   description?: string;
     *   icon?: React.FC<IconProps>;
     * };
     *
     * export type ListSection = {
     *   id: string;
     *   title?: string;
     *   type: "section";
     *   children: ListOption[];
     * };
     *
     * type ListItem = ListOption | ListSection;
     * ```
     */
    items: ListItem[];
    /**
     * The custom render function for the listbox options.
     *
     * @param item Node<ListItem>
     * @param options [OptionAria]()
     * @param ref React.RefObject<HTMLLIElement>
     */
    renderOption?: (item: Node$1<ListItem>, options: OptionAria & {
        showSelectedIcon?: boolean;
        _state: ListState<ListItem>;
    }, ref: React__default.Ref<HTMLLIElement>) => React__default.ReactNode;
    /** Renders the drop indicator component. */
    renderDropIndicator?: (options: {
        dropIndicatorProps: React__default.HTMLAttributes<HTMLLIElement>;
        isDropTarget: boolean;
        isHidden: boolean;
        orientation: Orientation;
    }, ref: React__default.RefObject<HTMLLIElement>) => React__default.ReactNode;
    /**
     * The custom render function for the drag preview. This can be used to render
     * a custom drag preview when dragging items.
     */
    renderDragPreview?: (items: DragItem[]) => React__default.ReactNode;
    /** Whether to show the selected checkmark icon. */
    showSelectedIcon?: boolean;
    /** The label for the listbox. */
    label?: React__default.ReactNode;
    /** The CSS class name for the drop indicator. */
    dropIndicatorClassName?: string;
    /** The style of the drop indicator used in a component. */
    dropIndicatorStyle?: React__default.CSSProperties;
}

declare const ListBox: React__default.ForwardRefExoticComponent<ListBoxProps & React__default.RefAttributes<HTMLUListElement>>;

interface ActionButtonSharedProps extends Omit<AriaButtonProps<"button" | "div">, "rel" | "href" | "target" | "children">, StylingProps {
}
interface ActionButtonProps extends ActionButtonSharedProps {
    /**
     * The button's variant.
     *
     * @default primary
     */
    variant?: "primary" | "secondary" | "tertiary" | "ghost" | "popover";
    /** The button's label. */
    label: React__default.ReactNode;
    /** The button's icon before the label. */
    iconStart?: React__default.FC<IconProps>;
    /** The button's icon after the label. */
    iconEnd?: React__default.FC<IconProps>;
    /**
     * The button's size.
     *
     * @default sm
     */
    size?: "sm" | "md";
}

declare const ActionButton: React__default.ForwardRefExoticComponent<ActionButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface DomNodeRendererProps {
    /** The class name applied to the wrapper `div` component. */
    className?: string;
    /**
     * The DOM node to render inside the component. If this is not provided, the
     * component will render nothing. If this is provided, the component will
     * render the DOM node inside a `div` component with `display` set to
     * `contents`.
     */
    node: Node;
}

declare const DomNodeRenderer: React__default.ForwardRefExoticComponent<DomNodeRendererProps & React__default.RefAttributes<HTMLDivElement>>;

interface SliderProps extends Omit<AriaSliderProps<number> & SliderStateOptions<number>, "orientation" | "numberFormatter">, StylingProps {
    /**
     * Whether the slider is read only.
     *
     * @default false
     */
    isReadOnly?: boolean;
    /** The format options passed to `Intl.NumberFormat`. */
    numberFormatOptions?: Intl.NumberFormatOptions & {
        numberingSystem?: string;
    };
    /** The label for the slider. */
    label?: React__default.ReactNode;
    /**
     * Whether to include a number input for the slider.
     *
     * @default false
     */
    includeNumberInput?: boolean;
}

declare const Slider: React__default.ForwardRefExoticComponent<SliderProps & React__default.RefAttributes<HTMLDivElement>>;

interface SwitchProps extends Omit<AriaSwitchProps, "children">, Omit<ToggleProps, "children" | "isRequired" | "validate" | "validationBehavior" | "validationState" | "isInvalid">, StylingProps {
    /** The label to display next to the switch. */
    label?: React__default.ReactNode;
    /** The position of the label. */
    labelPosition?: "top" | "left";
    /** The status label to display next to the switch. */
    statusLabel?: {
        on: string;
        off: string;
    };
}

declare const Switch: React__default.ForwardRefExoticComponent<SwitchProps & React__default.RefAttributes<HTMLLabelElement>>;

interface SearchInputProps extends Omit<AriaSearchFieldProps, "validationState" | "label" | "aria-autocomplete" | "autoComplete" | "isRequired" | "aria-haspopup" | "isReadOnly" | "aria-activedescendant" | "type" | "validationBehavior" | "validate" | "isInvalid">, StylingProps {
    /**
     * The size of the search input.
     *
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /**
     * The variant of the search input.
     *
     * @default "primary"
     */
    variant?: "primary" | "ghost";
    /** Defines a string value that labels the current element. */
    "aria-label": string;
}

declare const SearchInput: React__default.ForwardRefExoticComponent<SearchInputProps & React__default.RefAttributes<HTMLDivElement>>;

interface ThemeProviderProps extends StylingProps {
    /**
     * The theme to use. If not provided, the theme will be inherited from the
     * parent ThemeProvider. If there is no parent ThemeProvider, the default
     * theme will be used.
     *
     * @default "system"
     */
    theme?: Theme | "light" | "dark" | "system";
    /** The children to render. */
    children: React__default.ReactNode;
    /**
     * A function that will be called when the theme changes from any of the child
     * components.
     */
    setTheme?: (theme: Theme | "light" | "dark" | "system") => void;
}

declare const ThemeProvider: React__default.ForwardRefExoticComponent<ThemeProviderProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * A hook that returns the user preferences for color scheme, contrast, reduced
 * motion, transparency and reduced data. The values are updated when the user
 * changes their preferences.
 *
 * @example
 *   const { colorScheme, highContrast, reducedMotion, transparency } =
 *     useUserPreferences();
 *
 * @param ownerWindow - The window object to use. Defaults to the global window
 *   object.
 * @returns The user preferences.
 */
declare function useUserPreferences(ownerWindow?: Window & typeof globalThis): {
    colorScheme: "dark" | "light";
    highContrast: boolean;
    reducedMotion: boolean;
    transparency: boolean;
};

type OverlayTriggerProps_ = Parameters<typeof useOverlayTrigger>[0];
interface PopoverProps extends OverlayTriggerProps$1, OverlayTriggerProps_ {
    /** The children of the popover. */
    children: React__default.ReactNode | ((state: OverlayTriggerState) => React__default.ReactNode);
}
interface PopoverContentProps extends Omit<AriaPopoverProps, "popoverRef" | "triggerRef">, StylingProps {
    /**
     * The reference element for the popover position. By default, the popover is
     * positioned relative to the trigger element.
     */
    triggerRef?: React__default.RefObject<HTMLElement>;
    /** The class name for the underlay element. */
    underlayClassName?: string;
    /** The contents of the popover. */
    children: React__default.ReactNode;
}
interface PopoverTriggerProps {
    /** The contents of the popover trigger. */
    children: React__default.ReactNode | (({ isOpen, triggerProps, triggerRef, }: {
        isOpen: boolean;
        triggerProps: AriaButtonProps<"button">;
        triggerRef: React__default.RefObject<HTMLElement>;
    }) => React__default.ReactNode);
}

declare const PopoverContent: React__default.ForwardRefExoticComponent<PopoverContentProps & React__default.RefAttributes<HTMLDivElement>>;

declare const PopoverTrigger: React__default.FC;

declare const Popover: React__default.FC<PopoverProps>;

type MenuOption = Omit<ListOption, "description"> & {
    keyboardShortcut?: string;
};
type MenuSection = Omit<ListSection, "children"> & {
    children: MenuOption[];
};
type MenuItem = MenuOption | MenuSection;
type MenuPopoverProps = Pick<PopoverContentProps, "isNonModal" | "placement" | "shouldUpdatePosition" | "shouldFlip" | "boundaryElement" | "crossOffset" | "offset">;
interface MenuProps extends MenuPopoverProps, MenuTriggerProps, Omit<AriaMenuProps<MenuItem>, "children">, Omit<AriaMenuTriggerProps, "type"> {
    /** The `className` property assigned to the root element of the component. */
    className?: string;
    /** The `className` property assigned to the content element of the component. */
    contentClassName?: string;
    /** The `className` property assigned to the item element of the component. */
    itemClassName?: string;
    /**
     * A list of items to render in the menu. Items have the following shape:
     *
     * ```ts
     * export type MenuOption = {
     *   id: string;
     *   label: string;
     *   keyboardShortcut?: string;
     *   icon?: React.FC<IconProps>;
     * };
     *
     * export type MenuSection = {
     *   id: string;
     *   title?: string;
     *   type: "section";
     *   children: MenuOption[];
     * };
     *
     * export type MenuItem = MenuOption | MenuSection;
     * ```
     */
    items: MenuItem[];
    /**
     * The `children` property is used to render the trigger element of the
     * component.
     *
     * ```tsx
     * <Menu>
     *   <ActionButton label="Label">
     * </Menu>
     * ```
     */
    children?: React__default.ReactNode;
}

declare const Menu: React__default.ForwardRefExoticComponent<MenuProps & React__default.RefAttributes<HTMLUListElement>>;

interface LinkProps extends AriaLinkOptions, StylingProps {
    /** The link's style variant. */
    variant?: "default" | "inline";
    /** The children to render. */
    children: React__default.ReactNode;
    /** The size of the link. */
    size?: "sm" | "md" | "lg";
    /**
     * The type of the link.
     *
     * @default "body"
     */
    type?: "body" | "label";
}

declare const Link: React__default.ForwardRefExoticComponent<LinkProps & React__default.RefAttributes<HTMLElement>>;

interface SharedFileUploadProps extends StylingProps {
    /** Whether the component is inlined. */
    variant?: "default" | "inline";
    /** Whether the component is disabled. */
    isDisabled?: boolean;
    /** The label to display. */
    label: string;
    /** The description to display. */
    description?: string;
    /**
     * The pattern to match the file name against. This is a regular expression,
     * and will be matched against the entire file name.
     */
    accept?: string;
    /** The name of the input. */
    name?: string;
    /** The callback function that is fired when the value changes. */
    onChange?: (event: React__default.ChangeEvent<HTMLInputElement>) => void;
    /**
     * The callback function that is fired when the value changes and the value is
     * valid.
     */
    onValueChange?: (files: File[]) => void;
    /**
     * Identifies the element (or elements) that provide a detailed, extended
     * description for the object.
     */
    "aria-describedby"?: string;
}
interface FileUploadProps extends SharedFileUploadProps {
    /** The Icon to display. */
    icon?: React__default.FC<IconProps>;
    /** Whether to allow multiple files to be uploaded. */
    multiple?: boolean;
}

declare const FileUpload: React__default.ForwardRefExoticComponent<FileUploadProps & React__default.RefAttributes<HTMLLabelElement>>;

interface SeparatorProps extends SeparatorProps$1, StylingProps {
    /**
     * The variant of the separator.
     *
     * @default "primary"
     */
    variant?: "primary" | "secondary";
}

declare const Separator: React__default.ForwardRefExoticComponent<SeparatorProps & React__default.RefAttributes<HTMLDivElement>>;

interface ProgressBarProps extends Omit<AriaProgressBarProps, "isIndeterminate"> {
    /** The `className` property assigned to the root element of the component. */
    className?: string;
    /**
     * The variant of the progress bar.
     *
     * @default active
     */
    variant?: "active" | "success" | "error";
    /** The description of the progress bar. */
    description?: string;
    /**
     * Whether the progress bar value should be displayed.
     *
     * @default false
     */
    showValue?: boolean;
    /** The error message of the progress bar. */
    errorMessage?: string;
}

declare const ProgressBar: React__default.ForwardRefExoticComponent<ProgressBarProps & React__default.RefAttributes<HTMLDivElement>>;

interface InputMessage {
    /** The description to display below the input. */
    description?: string;
    /** The error message to display when the input is in an error state. */
    errorMessage?: string;
    /** The warning message to display when the input is in a warning state. */
    warningMessage?: string;
}
interface TextInputProps extends Omit<AriaTextFieldProps, "validationState" | "isInvalid" | "description" | "errorMessage">, StylingProps, InputMessage {
    /** The state of the input. */
    validationState?: "valid" | "error" | "warning";
    /**
     * The variant of the text input.
     *
     * @default primary
     */
    variant?: "primary" | "ghost";
    /**
     * The position of the label relative to the input.
     *
     * @default top
     */
    labelPosition?: "top" | "start";
    /** Whether the input is read only. */
    readOnly?: boolean;
    /** The style object to apply to the input element */
    inputStyle?: React__default.CSSProperties;
    /** The class name to apply to the input element */
    inputClassName?: string;
}

declare const TextInput: React__default.ForwardRefExoticComponent<TextInputProps & React__default.RefAttributes<HTMLInputElement>>;

interface ReactionProps extends Omit<AriaSwitchProps & ToggleProps, "validationState" | "isRequired" | "children" | "isInvalid" | "validationBehavior" | "validate">, StylingProps {
    /** The size of the reaction. */
    size?: "sm" | "md";
    /** The number of reactions. */
    count: number;
    /** The icon to render. */
    icon?: React__default.FC<IconProps>;
}

declare const Reaction: React__default.ForwardRefExoticComponent<ReactionProps & React__default.RefAttributes<HTMLLabelElement>>;

interface TooltipProps extends TooltipTriggerProps, AriaTooltipProps, Omit<AriaPositionProps, "overlayRef" | "targetRef" | "maxHeight" | "isOpen" | "arrowSize"> {
    /** The content of the tooltip. */
    text?: string;
    /** The tooltip trigger element. */
    children: React__default.ReactNode;
    /**
     * The delay time for the tooltip to show up.
     *
     * @default 1000
     */
    delay?: number;
    /**
     * The delay time for the tooltip to hide.
     *
     * @default 500
     */
    closeDelay?: number;
    /**
     * Represents the size of an element.
     *
     * @default md
     */
    size?: "sm" | "md";
    /**
     * The variant that can be applied to an element.
     *
     * @default default
     */
    variant?: "default" | "inverse";
    /**
     * Indicates whether to include an arrow in the output.
     *
     * @default true
     */
    includeArrow?: boolean;
}

declare const Tooltip: React__default.ForwardRefExoticComponent<TooltipProps & React__default.RefAttributes<HTMLDivElement>>;

interface PortalProps extends OverlayProps {
    /** The `className` property assigned to the root element of the component. */
    className?: string;
}

declare const Portal: React__default.ForwardRefExoticComponent<PortalProps & React__default.RefAttributes<HTMLDivElement>>;

interface ProgressSpinnerProps extends Omit<AriaProgressBarProps, "value" | "isIndeterminate" | "formatOptions" | "maxValue" | "minValue" | "valueLabel">, StylingProps {
    /**
     * The size of the progress circle.
     *
     * @default md
     */
    size?: "sm" | "md";
    /**
     * The progress circle's variant.
     *
     * @default active
     */
    variant?: "active" | "inactive" | "success" | "error";
}

declare const ProgressSpinner: React__default.ForwardRefExoticComponent<ProgressSpinnerProps & React__default.RefAttributes<HTMLDivElement>>;

interface ActionIconButtonProps extends ActionButtonSharedProps {
    /** The icon to display */
    icon: React__default.FC<IconProps>;
    /**
     * The size of the icon button.
     *
     * @default "md"
     */
    size?: "xxs" | "xs" | "sm" | "md" | "lg";
    /**
     * The variant of the icon button.
     *
     * @default "primary"
     */
    variant?: "primary" | "secondary" | "tertiary" | "ghost" | "toolbar" | "popover";
}

declare const ActionIconButton: React__default.ForwardRefExoticComponent<ActionIconButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface ToggleButtonProps extends StylingProps, Omit<AriaToggleButtonProps, "children"> {
    /** The text content of the button. */
    label: React__default.ReactNode;
    /** The icon to display before the label. */
    iconStart?: React__default.FC<SVGRProps>;
    /**
     * The size of the button.
     *
     * @default "md"
     */
    size?: "md" | "lg";
}

declare const ToggleButton: React__default.ForwardRefExoticComponent<ToggleButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface CheckboxProps extends Omit<AriaCheckboxProps, "children" | "validationBehavior" | "validationState" | "validate">, StylingProps {
    /** The checkbox's label. */
    label?: string;
    /**
     * The position of the label
     *
     * @default end
     */
    labelPosition?: "start" | "end";
}

declare const Checkbox: React__default.ForwardRefExoticComponent<CheckboxProps & React__default.RefAttributes<HTMLLabelElement>>;

type Excluded = "isDisabled" | "isReadOnly" | "isRequired" | "locale" | "validationState" | "label" | "formatOptions" | "isInvalid" | "validationBehaviour" | "validate" | "description" | "errorMessage";
interface PaginationProps extends Omit<AriaNumberFieldProps, Excluded>, Omit<NumberFieldStateOptions, Excluded>, StylingProps {
    /** The largest value allowed for the input. */
    maxValue: number;
    /** The label for the pagination component. */
    "aria-label": string;
    /**
     * The variant of the pagination component.
     *
     * @default floating
     */
    variant?: "floating" | "pinned";
    /**
     * The size of the pagination component.
     *
     * @default md
     */
    size?: "xs" | "sm" | "md" | "lg";
}

declare const Pagination: React__default.ForwardRefExoticComponent<PaginationProps & React__default.RefAttributes<HTMLDivElement>>;

interface I18nProviderProps extends I18nProviderProps$1 {
    /** The messages to use for internationalization. */
    messages?: LocalizedStrings;
}

declare const I18nProvider: React__default.FC<I18nProviderProps>;

type NumberFormatProps = Parameters<typeof useNumberFormatter>[0] & {
    /** The number to format. */
    value: number;
};

declare const NumberFormat: React__default.FC<NumberFormatProps>;

type DateFormatProps = Parameters<typeof useDateFormatter>[0] & {
    /** The date to format. */
    date: Date;
};

declare const DateFormat: React__default.FC<DateFormatProps>;

interface Item {
    id: string;
    label: string;
    variant?: "neutral" | "red" | "green" | "blue" | "high-contrast";
    icon?: React__default.FC<SVGRProps>;
}
interface TagGroupProps extends StylingProps, Omit<AriaTagGroupProps<Item>, "children" | "errorMessage" | "description">, Omit<ListProps<Item>, "children" | "collection" | "filter"> {
    /**
     * The items to display in the tag group.
     *
     * Type Item = { id: string; label: string; variant?: "neutral" | "red" |
     * "green" | "blue" | "high-contrast"; icon?: React.FC<SVGRProps>; }
     */
    items: Item[];
    /**
     * The variant of the tag group.
     *
     * @default "neutral"
     */
    variant?: Item["variant"];
    /** The label for the tag group. */
    "aria-label": string;
}

declare const TagGroup: React__default.ForwardRefExoticComponent<TagGroupProps & React__default.RefAttributes<HTMLDivElement>>;

interface AccordionProps extends StylingProps {
    /**
     * This prop controls the expansion mode of the accordion. If set to `single`,
     * only one item can be expanded at a time. If set to `multiple`, multiple
     * items can be expanded at the same time.
     *
     * @default single
     */
    expansionMode?: "single" | "multiple";
    /** This callback is called when the expanded state of the accordion changes. */
    onChange?: (value: Set<Key$1>) => void;
    /** The children of the accordion. Each child should be an `AccordionItem`. */
    children: React__default.ReactNode;
    /** The keys of the items that should be expanded by default. */
    defaultExpandedKeys?: Set<Key$1>;
    /**
     * The keys of the items that should be expanded. If this prop is provided,
     * the accordion will be a controlled component. This means that the expanded
     * state of the accordion will not change unless you update this prop.
     */
    expandedKeys?: Set<Key$1>;
    /**
     * The keys of the items that should be disabled. Disabled items cannot be
     * expanded or collapsed.
     */
    disabledKeys?: Set<Key$1>;
}
interface AccordionItemProps extends StylingProps {
    /** The title of the accordion item. */
    title: string;
    /**
     * The buttons that should be rendered in the accordion item. These buttons
     * will be rendered in the top right corner of the accordion item. They will
     * be rendered in the order they are provided. The buttons will be rendered as
     * `ActionIconButton`s, so you can pass any props that you would pass to an
     * `ActionIconButton`.
     *
     * @example
     *   ```jsx
     *   <AccordionItem
     *    title="Accordion Item"
     *    actions={[{
     *      icon: EditIcon,
     *      label: "Edit",
     *      onPress: () => alert("Edit"),
     *    }]}>Content</AccordionItem>
     *    ```;
     */
    actions?: Omit<ActionIconButtonProps, "size" | "variant" | "excludeFromTabOrder">[];
    /**
     * The action buttons should only be shown when the user hovers over or
     * focuses the accordion item.
     *
     * @default false
     */
    showActionsOnTriggerOnly?: boolean;
    /** The content of the accordion item. */
    children: React__default.ReactNode;
    /** The key of the accordion item. */
    value: Key$1;
    /**
     * The description of the accordion item. This will be rendered at the end of
     * the accordion header.
     */
    subLabel?: string;
}

declare const Accordion: React__default.ForwardRefExoticComponent<AccordionProps & React__default.RefAttributes<HTMLDivElement>>;

declare const AccordionItem: React__default.ForwardRefExoticComponent<AccordionItemProps & React__default.RefAttributes<HTMLHeadingElement>>;

interface SelectProps extends Omit<AriaSelectOptions<ListItem> & SelectStateOptions<ListItem> & PopoverContentProps, "validationState" | "items" | "children" | "isRequired" | "className" | "style" | "triggerRef" | "validate" | "validationBehavior" | "keyboardDelegate">, Pick<ListBoxProps, "items" | "showSelectedIcon">, StylingProps {
    /**
     * The position of the label.
     *
     * @default "top"
     */
    labelPosition?: "top" | "start";
    /** The description of the select component. */
    description?: string;
    /** The error message of the select component. */
    errorMessage?: string;
    /** The warning message of the select component. */
    warningMessage?: string;
    /** The label of the select component. */
    label?: React__default.ReactNode;
    /** The variant of the select component. */
    variant?: "primary" | "ghost";
    /** The state of the select component. */
    validationState?: "valid" | "error" | "warning";
    /** Whether the select component is read only. */
    isReadOnly?: boolean;
}

declare const Select: React__default.ForwardRefExoticComponent<SelectProps & React__default.RefAttributes<HTMLDivElement>>;

interface AvatarProps extends StylingProps {
    /**
     * The size of the component.
     *
     * @default "md"
     */
    size?: "md" | "sm";
    /**
     * The icon to display. This icon has to be imported from the
     * `@baseline-ui/icons` package.
     */
    icon?: React__default.FC<SVGRProps>;
    /** The name of the user. */
    name: string;
    /** The URL of the image to display. */
    imgSrc?: string;
    /**
     * The image loading strategy to use. See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attributes:~:text=a%20fallback%20destination.-,loading,-Indicates%20how%20the)
     */
    imgLoading?: "lazy" | "eager";
    /** Whether to show the initials of the user if no image is provided. */
    showInitials?: boolean;
    /** Whether the component is disabled. */
    isDisabled?: boolean;
    /** Whether the user has a notification. */
    hasNotifications?: boolean;
}

declare const Avatar: React__default.ForwardRefExoticComponent<AvatarProps & React__default.RefAttributes<HTMLSpanElement>>;

type ItemProps = React__default.ComponentProps<typeof Item$1> & StylingProps & {
    key?: Key$1;
    icon?: React__default.FC<SVGRProps>;
    value?: string;
    title?: string;
    titleClassName?: string;
    titleStyle?: React__default.CSSProperties;
};
type TabsProps = Omit<StylingProps & AriaTabListProps<ItemProps>, "orientation" | "children" | "items" | "selectedKey" | "defaultSelectedKey" | "disabledKeys"> & {
    /**
     * The `TabItem` components to render inside the `Tabs` component.
     *
     * ```jsx
     * <Tabs>
     *   <TabItem key="tab1" title="Tab 1">
     *     <div>Tab 1 content</div>
     *   </TabItem>
     *   <TabItem key="tab2" title="Tab 2">
     *     <div>Tab 2 content</div>
     *   </TabItem>
     * </Tabs>;
     * ```
     */
    children: React__default.ReactNode;
    /**
     * The key of the tab that needs to be removed.
     *
     * @param key
     */
    onRemove?: (key: Key$1) => void;
    /** The value of the tab that needs to be selected. */
    selectedValue?: string;
    /** The default value of the tab that needs to be selected. */
    defaultSelectedValue?: string;
    /** The values of the tabs that need to be disabled. */
    disabledValues?: Set<Key$1>;
    /** A list of action buttons to render beside the tab items. */
    actions?: Omit<ActionIconButtonProps, "variant" | "size">[];
    /** The variant of the tabs */
    variant?: "primary" | "ghost";
    /** The className to apply to the tab header container. */
    tabHeaderClassName?: string;
    /** The style to apply to the tab header container. */
    tabHeaderStyle?: React__default.CSSProperties;
};
type TabItemProps = StylingProps & {
    /** The title of the tab. This will be displayed in the tab button. */
    title: string;
    /** The icon to display in front of the title. */
    icon?: React__default.FC<SVGRProps>;
    /** The value of the tab. This will be used to identify the tab. */
    value: string;
    /** The className to apply to the tab item. */
    titleClassName?: string;
    /** The style to apply to the tab item. */
    titleStyle?: React__default.CSSProperties;
};

declare const Tabs: React__default.ForwardRefExoticComponent<Omit<StylingProps & AriaTabListProps<ItemProps>, "children" | "items" | "disabledKeys" | "orientation" | "selectedKey" | "defaultSelectedKey"> & {
    children: React__default.ReactNode;
    onRemove?: ((key: React__default.Key) => void) | undefined;
    selectedValue?: string | undefined;
    defaultSelectedValue?: string | undefined;
    disabledValues?: Set<React__default.Key> | undefined;
    actions?: Omit<ActionIconButtonProps, "size" | "variant">[] | undefined;
    variant?: "primary" | "ghost" | undefined;
    tabHeaderClassName?: string | undefined;
    tabHeaderStyle?: React__default.CSSProperties | undefined;
} & React__default.RefAttributes<HTMLDivElement>>;

declare const TabItem: React__default.FC<TabItemProps>;

interface InlineAlertProps extends StylingProps {
    /**
     * The variant of the alert.
     *
     * @default "info"
     */
    variant?: "info" | "warning" | "error" | "success";
    /** The title of the alert. */
    title: string;
    /** The description of the alert. */
    description: string;
    /**
     * The label of the action button. When provided, the action button will be
     * rendered.
     */
    actionLabel?: string;
    /** The callback fired when the action button is clicked. */
    onAction?: () => void;
    /**
     * The callback fired when the close button is clicked. When provided, the
     * close button will be rendered.
     */
    onClose?: () => void;
    /**
     * The arrangement of the variable.
     *
     * @default "single"
     * @typedef {"single" | "multi" | "compact"} Arrangement
     */
    arrangement?: "single" | "multi" | "compact";
    /**
     * The size of the alert.
     *
     * @default "md"
     */
    size?: "sm" | "md";
}

declare const InlineAlert: React__default.ForwardRefExoticComponent<InlineAlertProps & React__default.RefAttributes<HTMLDivElement>>;

interface NumberInputProps extends StylingProps, Omit<AriaNumberFieldProps, "validationState" | "isRequired" | "validate" | "validationBehavior"> {
    /**
     * The position of the label relative to the input.
     *
     * @default top
     */
    labelPosition?: "top" | "start";
    /**
     * The variant of the number input.
     *
     * @default primary
     */
    variant?: "primary" | "ghost";
    /**
     * Whether to show the stepper buttons.
     *
     * @default true
     */
    showStepper?: boolean;
    /** The description to display below the input. */
    description?: string;
    /** The error message to display when the input is in an error state. */
    errorMessage?: string;
}

declare const NumberInput: React__default.ForwardRefExoticComponent<NumberInputProps & React__default.RefAttributes<HTMLDivElement>>;

interface DialogProps extends AriaDialogProps, StylingProps {
    /** The children to render. */
    children: React__default.ReactNode;
    /**
     * The size of the dialog. This defines the max width of the dialog.
     *
     * @default "sm"
     */
    size?: "sm" | "md" | "lg" | "content";
    /**
     * The variant of the dialog.
     *
     * @default "primary"
     */
    variant?: "primary" | "ghost";
}
interface DialogTitleProps extends StylingProps {
    /** The children to render. */
    children: React__default.ReactNode;
}

declare const Dialog: React__default.ForwardRefExoticComponent<DialogProps & React__default.RefAttributes<HTMLDivElement>>;

declare const DialogTitle: React__default.ForwardRefExoticComponent<DialogTitleProps & React__default.RefAttributes<HTMLDivElement>>;

interface ColorPreset$1 {
    label: string;
    color: string;
}
interface ColorInputProps extends OverlayTriggerProps$1, StylingProps, Pick<ColorFieldProps, "onChange" | "defaultValue" | "value" | "label" | "isDisabled">, Pick<AriaLabelingProps, "aria-label">, Pick<PopoverContentProps, "isNonModal" | "placement" | "shouldUpdatePosition" | "shouldFlip" | "boundaryElement" | "crossOffset" | "offset"> {
    /**
     * The list of color presets to show in the color picker. The signature of the
     * color presets is:
     *
     * ```ts
     * export interface ColorPreset {
     *   label: string;
     *   color: string;
     * }
     * ```
     *
     * The color can be a hex or hexa value.
     */
    presets?: ColorPreset$1[];
    /**
     * Whether to include the custom color picker. If `false`, the color picker
     * will only show the color presets. The custom color picker allows the user
     * to pick any color. You can set the `allowAlpha` prop to `false` to disable
     * the alpha channel.
     *
     * @default true
     */
    includePicker?: boolean;
    /**
     * Whether to show the color label. The color label is the name of the color
     * that is currently selected. If boolean, the label will be shown only when
     * the color is not `null`. If a function, the function will be called with
     * the current color and should return a string. If `false`, the label will
     * not be shown.
     *
     * @default true
     */
    colorLabel?: boolean | ((color: Color | null) => string);
    /**
     * Whether to allow alpha values in the custom color picker.
     *
     * @default true
     */
    allowAlpha?: boolean;
    /**
     * Whether to allow the removal of the color.
     *
     * @default false
     */
    allowRemoval?: boolean;
    /** The label position of the color input. */
    labelPosition?: "top" | "start";
    /**
     * Whether to show the color picker in active or lazy mode. In active mode,
     * the color picker will be rendered when the color input popover is open and
     * the value of the color input will be updated when the user picks a color.
     * In lazy mode, the color picker will be rendered only when the user clicks
     * on the "Add color" button and the selected color will be added to custom
     * colors when the user clicks on the "Add color" button.
     *
     * @default active
     */
    pickerMode?: "active" | "lazy";
    /**
     * The key to use to store the picked color in the local storage.
     *
     * @default baselinePickedColor
     */
    storePickedColorKey?: string;
    /**
     * The label to show on the add color button.
     *
     * @default Add color
     */
    addColorButtonLabel?: string;
    /**
     * The label to show on the remove color button.
     *
     * @default Remove color
     */
    removeColorButtonLabel?: string;
    /**
     * The label to show on the custom colors section.
     *
     * @default Custom colors
     */
    customColorsLabel?: string;
    /**
     * An optional function to render the custom trigger button.
     *
     * @param options
     */
    renderTriggerButton?: (options: {
        isOpen: boolean;
        color: Color | null;
        ref: React__default.RefObject<HTMLButtonElement>;
        colorName?: string | boolean;
        triggerProps: AriaButtonProps<"button">;
    }) => React__default.ReactElement;
}

declare const ColorInput: React__default.ForwardRefExoticComponent<ColorInputProps & React__default.RefAttributes<HTMLDivElement>>;

declare const ColorSwatch: React__default.FC<ColorSwatchProps>;
interface ColorSwatchProps {
    color?: string;
    isFocusVisible?: boolean;
    isDisabled?: boolean;
    isSelected?: boolean;
    isPresentational?: boolean;
}

declare const IconColorInputButton: React__default.ForwardRefExoticComponent<Omit<ColorInputButtonProps, "children" | "labelPosition"> & {
    icon: React__default.FC<IconProps>;
    color?: string | undefined;
} & React__default.RefAttributes<HTMLButtonElement>>;
interface ColorInputButtonProps extends Omit<ActionButtonProps, "label"> {
    isOpen: boolean;
    "aria-label"?: string;
    labelPosition: "top" | "start";
    children: React__default.ReactNode;
}

interface FreehandCanvasProps extends StylingProps, AriaLabelingProps {
    /** The className applicable to the SVG canvas. */
    canvasClassName?: string;
    /** The style applicable to the SVG canvas. */
    canvasStyle?: React__default.CSSProperties;
    /** The ref for the canvas. */
    canvasRef?: React__default.RefObject<HTMLDivElement>;
    /** The className applicable to the footer. */
    footerClassName?: string;
    /** The style applicable to the footer. */
    footerStyle?: React__default.CSSProperties;
    /**
     * How much to soften the stroke's edges.
     *
     * @default 0
     */
    smoothing?: number;
    /**
     * How much to streamline the stroke.
     *
     * @default 0
     */
    streamline?: number;
    /** An easing function to apply to each point's pressure. */
    easing?: (pressure: number) => number;
    /**
     * Whether to simulate pressure based on velocity.
     *
     * @default false
     */
    simulatePressure?: boolean;
    /** Cap, taper and easing for the start of the line. */
    start?: {
        cap?: boolean;
        taper?: number | boolean;
        easing?: (distance: number) => number;
    };
    /** Cap, taper and easing for the end of the line. */
    end?: {
        cap?: boolean;
        taper?: number | boolean;
        easing?: (distance: number) => number;
    };
    /**
     * The width of the stroke.
     *
     * @default 2
     */
    strokeWidth?: number;
    /**
     * The color of the stroke.
     *
     * @default #3A87FD
     */
    strokeColor?: string;
    /**
     * Whether to keep the points within the canvas.
     *
     * @default true
     */
    isBound?: boolean;
    /**
     * Callback for when the points change. This is called on every point change.
     *
     * @param points
     */
    onChange?: (points: number[][][]) => void;
    /**
     * Callback for when the points change has ended. This is called once after
     * the pointerup event. It is recommended to use this callback for performance
     * reasons.
     *
     * @param points
     */
    onChangeEnd?: (points: number[][][]) => void;
    /** The default points to render. */
    defaultValue?: number[][][];
    /**
     * The value of the canvas. This can be used to make the canvas a controlled
     * component.
     */
    value?: number[][][];
    /** The label for the canvas. */
    label?: string;
    /**
     * Whether to enable history for undo/redo.
     *
     * @default false
     */
    enableHistory?: boolean;
    /**
     * Whether the canvas is inline.
     *
     * @default true
     */
    isInline?: boolean;
    /** Whether the canvas is disabled. */
    isDisabled?: boolean;
    /** The placeholder for the canvas. */
    placeholder?: string;
    /** The label for the clear button. */
    clearLabel?: string;
    /** The label for the undo button. */
    undoLabel?: string;
    /** The label for the redo button. */
    redoLabel?: string;
    /** Description for the canvas. */
    description?: string;
}

declare const FreehandCanvas: React__default.ForwardRefExoticComponent<FreehandCanvasProps & React__default.RefAttributes<HTMLDivElement>>;

type TextProps<T extends keyof React__default.JSX.IntrinsicElements = "span"> = StylingProps & React__default.ComponentProps<T> & {
    /**
     * The type of text to render.
     *
     * @default "title"
     */
    type?: "subtitle" | "title" | "label" | "value" | "helper" | "body";
    /**
     * The size of the text.
     *
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /** The text to render. Can be a string or a number. */
    children: React__default.ReactNode;
    /**
     * The HTML element to render.
     *
     * @default "span"
     */
    elementType?: React__default.ElementType;
};

declare const Text$1: React__default.ForwardRefExoticComponent<Pick<TextProps, "children" | "autoFocus" | "onFocus" | "onBlur" | "id" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-details" | "onDrop" | "onDragStart" | "onDragEnd" | "className" | "style" | "data-block-id" | "type" | "color" | "size" | "content" | "translate" | "hidden" | "elementType" | "role" | "slot" | "title" | "key" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "lang" | "nonce" | "placeholder" | "spellCheck" | "tabIndex" | "radioGroup" | "about" | "datatype" | "inlist" | "prefix" | "property" | "rel" | "resource" | "rev" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocusCapture" | "onBlurCapture" | "onChange" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStartCapture" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture"> & React__default.RefAttributes<HTMLDivElement>>;

interface TransformProps {
    /** The `className` property assigned to the root element of the component. */
    className?: string;
    /** The `style` property assigned to the root element of the component. */
    style?: React__default.CSSProperties;
    /** The children to render. */
    children: (options: {
        style: React__default.CSSProperties;
    }) => React__default.ReactNode;
    /** Whether the transform is draggable. */
    isDraggable?: boolean;
    /** Whether the transform is resizable. */
    isResizable?: boolean;
    /** Whether the transform is rotatable. */
    isRotatable?: boolean;
    /** Whether the transform is snappable. */
    isSnappable?: boolean;
    /** A callback that will be called when the transform changes. */
    onTransform?: (transform: OnRender) => void;
    /** A callback that will be called when the transform starts. */
    onTransformStart?: (transform: OnRenderStart) => void;
    /** A callback that will be called when the transform ends. */
    onTransformEnd?: (transform: OnRender) => void;
    /** A callback that will be called when the target drag starts. */
    onDragStart?: (e: OnDragStart) => void;
    /** A callback that will be called when the target is dragged. */
    onDrag?: (e: OnDrag) => void;
    /** A callback that will be called when the target drag ends. */
    onDragEnd?: (e: OnDragEnd) => void;
    /** A callback that will be called when the target resize starts. */
    onResizeStart?: (e: OnResizeStart) => void;
    /** A callback that will be called when the target is resized. */
    onResize?: (e: OnResize) => void;
    /** A callback that will be called when the target resize ends. */
    onResizeEnd?: (e: OnResizeEnd) => void;
    /** A callback that will be called when the target rotation starts. */
    onRotateStart?: (e: OnRotateStart) => void;
    /** A callback that will be called when the target is rotated. */
    onRotate?: (e: OnRotate) => void;
    /** A callback that will be called when the target rotation ends. */
    onRotateEnd?: (e: OnRotateEnd) => void;
    /** A callback that will be called when the target is snapped. */
    onSnap?: (e: OnSnap) => void;
    /** A callback that will be called when the child is double clicked. */
    onDoubleClick?: (e: React__default.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    /** A list of selectors relative to which the guidelines will be rendered. */
    elementGuidelines?: string[];
    /**
     * Set directions to show the control box.
     *
     * @default false if rotatable, ["n", "nw", "ne", "s", "se", "sw", "e", "w"] otherwise
     */
    renderDirections?: boolean | ("n" | "nw" | "ne" | "s" | "se" | "sw" | "e" | "w")[];
    /**
     * Whether the anchor should be hidden when dragging.
     *
     * @default true
     */
    hideAnchorOnDrag?: boolean;
    /** The `title` property assigned to the root element of the component. */
    title: string;
    /** The position of the rotation anchor. */
    rotationPosition?: RotationPosition;
    /**
     * Degree angles to snap to rotation
     *
     * @default [ ]
     */
    snapRotationDegrees?: number[];
    /**
     * Snap works if `abs(current rotation - snapRotationDegrees) <
     * snapRotationThreshold`.
     *
     * @default 5
     */
    snapRotationThreshold?: number;
    /** Whether the transform should be updated automatically. */
    autoUpdate?: boolean;
    /** The element ref, selector or element to which the transform will be bound. */
    bound?: React__default.RefObject<HTMLElement> | string | HTMLElement;
    /** The element ref, selector or element that is it's scrollable ancestor. */
    scrollableAncestor?: React__default.RefObject<HTMLElement> | string | HTMLElement;
    /**
     * Whether to prevent bubbling of events like mousedown, touchstart, etc.
     *
     * @default false
     */
    stopPropagation?: boolean;
    /**
     * Whether to call preventDefault on touchstart or mousedown
     *
     * @default true
     */
    preventDefault?: boolean;
    /**
     * The default transformOrigin of the target can be set in advance.
     *
     * @default ""
     */
    transformOrigin?: (string | number)[] | string;
}

declare const Transform: React__default.ForwardRefExoticComponent<TransformProps & React__default.RefAttributes<HTMLDivElement>>;

interface ImageDropZoneProps extends Omit<SharedFileUploadProps, "label" | "variant">, Omit<DropOptions, "ref" | "getDropOperation" | "hasDropButton" | "getDropOperationForPoint">, Omit<ClipboardProps, "getItems" | "onCut" | "onCopy">, Pick<FreehandCanvasProps, "footerClassName" | "footerStyle" | "placeholder" | "clearLabel">, AriaLabelingProps {
    /**
     * The initial image to display. This will be used as the `src` attribute of
     * the `<img>` element. You will be able to choose a new image.
     */
    defaultImageSrc?: string | File;
    /**
     * The image to display. This will be used as the `src` attribute of the
     * `<img>` element and will not be able to be changed from within the
     * component. Basically, this makes the component controlled.
     */
    imageSrc?: string | File;
    /**
     * The alt text to display for the image. This will be used as the `alt`
     * attribute of the `<img>`. element. If no `imageAlt` is provided, the
     * `label` will be used.
     */
    imageAlt?: string;
    /** The label to display for the picker button. */
    pickerButtonLabel?: string;
    /**
     * Whether to show the checkered background behind the image. This is useful
     * when the image has transparency.
     *
     * @default true
     */
    includeCheckeredBackground?: boolean;
    /** Whether the component is inlined. */
    isInline?: boolean;
    /** The class name to apply to the picker button. */
    pickerButtonClassName?: string;
    /** The style to apply to the picker button. */
    pickerButtonStyle?: React__default.CSSProperties;
    /** The class name to apply to the label. */
    labelClassName?: string;
    /** The style to apply to the label. */
    labelStyle?: React__default.CSSProperties;
}

declare const ImageDropZone: React__default.ForwardRefExoticComponent<ImageDropZoneProps & React__default.RefAttributes<HTMLDivElement>>;

interface PreviewProps extends StylingProps, AriaLabelingProps {
    /**
     * Whether the preview should be displayed inline or not. This is just a
     * visual change, the component will still behave the same.
     *
     * @default true
     */
    isInline?: boolean;
    /**
     * The image to display in the preview. This can be a URL or a base64 encoded
     * string.
     */
    imageSrc?: string;
    /** The alt text for the image. */
    imageAlt?: string;
    /** The SVG to display in the preview. This can be a React element or a string. */
    svgSrc?: string | React__default.ReactElement;
    /** Whether the preview should be disabled or not. */
    isDisabled?: boolean;
    /** The text to display in the preview. */
    textValue?: string;
    /** The style of the text. */
    textStyle?: React__default.CSSProperties;
    /**
     * This is fired when the `actionButtons` are not passed and you trigger a
     * `click` event on the preview. In case you have passed `actionButtons`, this
     * is not fired as focus shifts to the action buttons.
     */
    onPress?: PressProps["onPress"];
    /**
     * The callback to be called when the delete button is clicked. When passed,
     * the delete button is displayed.
     */
    onDelete?: ActionButtonProps["onPress"];
    /**
     * The label to be used for the delete button. This is used for accessibility
     * purposes.
     */
    deleteAriaLabel?: string;
    /** The callback to be called when the preview is clicked. */
    addAriaLabel?: string;
    /**
     * The accent variable represents the type of accent color used in the
     * application. It can have one of the following values:
     *
     * - "theme": Represents the accent color defined by the current application
     *   theme.
     * - "positive": Represents a positive accent color that doesn't change with
     *   theme.
     *
     * @default "theme"
     */
    accent?: "theme" | "positive";
}

declare const Preview: React__default.ForwardRefExoticComponent<PreviewProps & React__default.RefAttributes<HTMLDivElement>>;

interface RadioGroupProps extends StylingProps, Omit<AriaRadioGroupProps, "description" | "errorMessage" | "isRequired" | "isInvalid" | "validate" | "validationBehavior" | "validationState"> {
    /**
     * The position of the label relative to the input.
     *
     * @default top
     */
    labelPosition?: "top" | "start";
    /**
     * The list of items to render in the radio group. Items have the following
     * shape:
     *
     * ```ts
     * export type ListOption = {
     *   id: string;
     *   label: string;
     *   description?: string;
     *   icon?: React.FC<IconProps>;
     * };
     * ```
     */
    items: ListOption[];
    /**
     * Render item option
     *
     * @typedef {Object} RenderItemOptions
     * @property {boolean} isFocusVisible - Whether the focus ring is visible.
     * @property {boolean} isFocused - Whether the option is focused.
     * @property {boolean} isSelected - Whether the option is selected.
     * @property {boolean} isHovered - Whether the option is hovered.
     * @property {boolean} isDisabled - Whether the option is disabled.
     */
    /**
     * The custom render function for the radio group options.
     *
     * @param {ListOption} item The item to render.
     * @param {RenderItemOptions} options The options for rendering the item.
     */
    renderOption?: (item: ListOption, options: {
        isFocusVisible: boolean;
        isFocused: boolean;
        isSelected: boolean;
        isHovered: boolean;
        isDisabled: boolean;
        optionLabelPosition: "start" | "end";
        isReadOnly?: boolean;
    }) => React__default.ReactNode;
    /** The class name for the group container. */
    optionsContainerClassName?: string;
    /** The style for the group container. */
    optionsContainerStyle?: React__default.CSSProperties;
    /** The ids of the items that are disabled. */
    disabledValues?: string[];
    /**
     * The position of the label of individual radio buttons.
     *
     * @default end
     */
    optionLabelPosition?: "start" | "end";
    /** The className applicable to the label. */
    optionClassName?: string;
    /** The style applicable to the label. */
    optionStyle?: React__default.CSSProperties;
}

declare const RadioGroup: React__default.ForwardRefExoticComponent<RadioGroupProps & React__default.RefAttributes<HTMLDivElement>>;

interface ModalProps extends OverlayTriggerProps$1 {
}
interface ModalContentProps extends Omit<AriaModalOverlayProps, "isDismissable" | "isKeyboardDismissDisabled">, StylingProps {
    /**
     * The contents of the modal. Can be a React node or a function that returns a
     * React node.
     */
    children: React__default.ReactNode | ((props: {
        close: () => void;
    }) => React__default.ReactNode);
    /**
     * The container element for the modal. By default, the modal is rendered as a
     * child of the body element.
     *
     * @default document.body
     */
    portalContainer?: HTMLElement;
    /**
     * Whether to disable the animation for the modal. This is useful when you
     * want to render one modal after another without the animation.
     *
     * @default false
     */
    disableAnimation?: boolean;
    /**
     * Whether the modal should be rendered as a drawer. This will render the
     * modal with a transparent background and no border at the bottom. The `auto`
     * value will render the modal as a drawer on mobile and as a dialog on
     * desktop and tablet.
     *
     * @default false
     */
    enableDrawer?: boolean | "auto";
    /**
     * Specifies if the component is dismissable or not. If the value is a
     * function, it will be called with a boolean indicating if the modal is
     * rendered as a drawer or not.
     *
     * @default true
     */
    isDismissable?: boolean | ((isDrawer: boolean) => boolean);
    /**
     * Determines if keyboard dismissal is disabled. If the value is a function,
     * it will be called with a boolean indicating if the modal is rendered as a
     * drawer or not.
     *
     * @default false
     */
    isKeyboardDismissDisabled?: boolean | ((isDrawer: boolean) => boolean);
}

declare const Modal: React__default.FC<ModalProps>;

declare const ModalContent: React__default.FC<ModalContentProps>;

declare const ModalTrigger: React__default.FC;

declare const ModalClose: React__default.FC;

interface MessageFormatProps {
    /**
     * By default `<MessageFormat>` will render the formatted string into a
     * `<React.Fragment>`. If you need to customize rendering, you can either wrap
     * it with another React element (recommended), specify a different tagName
     * (e.g., 'div')
     */
    elementType?: React__default.ElementType | "div" | "span";
    /** The id of the message to format. */
    id: string;
    /** The default message to use if the message id is not found. */
    defaultMessage?: string;
}

declare const MessageFormat: React__default.FC<MessageFormatProps>;

interface GroupProps extends StylingProps, AriaLabelingProps {
    /**
     * The `role` property specifies the accessibility `role` for the group. By
     * default, it is set to 'group'. If the contents of the group are important
     * enough to be included in the page table of contents, use 'region'. If the
     * group is visual only and does not represent a semantic grouping of
     * controls, use 'presentation'.
     *
     * @default group
     */
    role?: "group" | "region" | "presentation";
    /** Whether the group is disabled. */
    isDisabled?: boolean;
    /** The children to render. */
    children: React__default.ReactNode;
}

declare const Group: React__default.ForwardRefExoticComponent<GroupProps & React__default.RefAttributes<HTMLDivElement>>;

type SprinkleProps = Parameters<Sprinkles>[0];
interface BoxProps extends Pick<StylingProps, "data-block-id">, Omit<React__default.ComponentPropsWithoutRef<"div">, "color">, SprinkleProps {
    /**
     * The HTML element to use for the box.
     *
     * @default "div"
     */
    elementType?: string;
}

declare const Box: React__default.ForwardRefExoticComponent<BoxProps & React__default.RefAttributes<HTMLDivElement>>;

interface ColorPresetInlineInputProps extends Omit<RadioGroupProps, "items" | "disabledValues"> {
    items: ColorPreset$1[];
}

declare const ColorPresetInlineInput: React__default.ForwardRefExoticComponent<ColorPresetInlineInputProps & React__default.RefAttributes<HTMLDivElement>>;

interface ToolbarProps extends StylingProps, AriaToolbarProps {
    children: React__default.ReactNode;
    /**
     * Identifies the element (or elements) whose contents or presence are
     * controlled by the current element.
     */
    "aria-controls"?: string;
}

declare const Toolbar: React__default.ForwardRefExoticComponent<ToolbarProps & React__default.RefAttributes<HTMLDivElement>>;

interface ToggleIconButtonProps extends StylingProps, Omit<ToggleProps, "children">, Omit<ToggleButtonProps, "size" | "iconStart" | "label"> {
    /**
     * The available sizes for a variable.
     *
     * @default "md"
     */
    size?: "xxs" | "xs" | "sm" | "md" | "lg";
    /** Represents the variant of a component. */
    variant?: "primary" | "secondary" | "tertiary" | "toolbar";
    /**
     * The icon to be displayed on the button. You can pass an object with
     * `selected` and `unselected` keys to display different icons based on the
     * state of the button.
     */
    icon: React__default.FC<IconProps> | {
        selected: React__default.FC<IconProps>;
        unselected: React__default.FC<IconProps>;
    };
}

declare const ToggleIconButton: React__default.ForwardRefExoticComponent<ToggleIconButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface MentionableUser {
    id: string;
    name: string;
    displayName: string;
    avatar?: AvatarProps;
    description?: string;
}
interface EditorHandle {
    setCaretPosition: (index: number) => void;
}
interface EditorProps extends StylingProps, AriaLabelingProps {
    /**
     * The function to be called when `Enter` key is pressed or Save button is
     * clicked.
     */
    onSave?: (value: string) => void;
    /**
     * The function to be called when Cancel button is clicked. If not provided,
     * the Cancel button will not be rendered.
     */
    onCancel?: () => void;
    /** The default value of the editor. */
    defaultValue?: string;
    /** The value of the editor. */
    value?: string;
    /**
     * The function to be called when the value of the editor changes.
     *
     * @param value
     */
    onChange?: (value: string) => void;
    /** Whether the editor is disabled. */
    isDisabled?: boolean;
    /**
     * Indicates whether rich text is enabled or not.
     *
     * @default true
     */
    enableRichText?: boolean;
    /** The placeholder text to be displayed when the editor is empty. */
    placeholder?: string;
    /**
     * The variant of the editor.
     *
     * @default default
     */
    variant?: "default" | "minimal";
    /** Whether the editor is inline or not. */
    isInline?: boolean;
    /** Specifies whether spell checking is enabled or disabled. */
    spellCheck?: boolean;
    /**
     * Optional property that represents the ARIA label for the submit button.
     * This property is used to provide an accessible label for the button, which
     * is read by screen readers to assist visually impaired users.
     *
     * @default Save
     */
    submitButtonAriaLabel?: string;
    /**
     * The React node representing the icon to be displayed on the submit button.
     *
     * @default ArrowUpCircleFilledIcon
     */
    submitButtonIcon?: React__default.FC<IconProps>;
    /**
     * The name of the avatar. The avatar is visible when `variant` is set to
     * `minimal` and `enableRichText` is set to `false`.
     */
    avatarName?: string;
    /**
     * The ARIA label for the editable content. In case of rich text, this label
     * is used to provide an accessible label for the contenteditable element,
     * which is read by screen readers to assist visually impaired users. In case
     * of plain text, this label is used to provide an accessible label for the
     * textarea element.
     *
     * @default Editing Area
     */
    editableContentAriaLabel?: string;
    /**
     * An optional array of mentionable users. Mention feature is only available
     * when `enableRichText` is set to `true` and this prop is provided.
     *
     * ```tsx
     * type MentionableUser = {
     *   id: string;
     *   name: string;
     *   displayName: string;
     *   avatar?: AvatarProps;
     *   description?: string;
     * };
     * ```
     */
    mentionableUsers?: MentionableUser[];
    /** Footer button represents an array of ActionIconButtonProps. */
    footerButtons?: ActionIconButtonProps[];
    /** The imperative handle for manipulating editor. */
    editorHandle?: React__default.RefObject<EditorHandle>;
}

declare const Editor: React__default.ForwardRefExoticComponent<EditorProps & React__default.RefAttributes<HTMLDivElement>>;

interface ScrollControlButtonProps extends StylingProps, Pick<ActionButtonProps, "label"> {
    /**
     * The ref to the scrollable element.
     *
     * @default document.body
     */
    scrollRef?: React__default.RefObject<HTMLElement>;
    /**
     * Indicates whether the button should be hidden when the keyboard is being
     * used.
     *
     * @default false
     */
    hideForKeyboard?: boolean;
    /**
     * The delay in milliseconds before the button is hidden when the scrolling
     * stops.
     *
     * @default 1500
     */
    delay?: number;
    /**
     * Indicates whether the scroll should be smooth.
     *
     * @default true
     */
    smoothScroll?: boolean;
}

declare const ScrollControlButton: React__default.ForwardRefExoticComponent<ScrollControlButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface AlertDialogProps extends StylingProps {
    /**
     * The title of the dialog. This is the main heading of the dialog and is
     * displayed at the top of the dialog.
     */
    title: string;
    /**
     * The message of the dialog. This is the main content of the dialog and is
     * displayed below the title.
     */
    message?: React__default.ReactNode;
    /**
     * The label for the cancel button. This is the text that is displayed on the
     * button that allows the user to cancel the dialog.
     */
    cancelLabel?: string;
    /**
     * The label for the confirm button. This is the text that is displayed on the
     * button that allows the user to confirm the dialog.
     */
    primaryActionLabel?: string;
    /**
     * The function that is called when the user confirms the dialog. This is
     * called when the user clicks the primary action button.
     */
    onPrimaryAction?: () => void;
    /**
     * The function that is called when the user cancels the dialog. This is
     * called when the user clicks the cancel button or the close button.
     */
    onCancel?: () => void;
    /** The button that should be focused when the dialog is opened. */
    autoFocusButton?: "primary" | "cancel";
    /** Whether the primary action button should be disabled. */
    isPrimaryActionDisabled?: boolean;
    /**
     * The props that are passed to the text input. If this is provided, a text
     * input will be displayed at the bottom of the dialog.
     */
    textInputProps?: TextInputProps;
    /**
     * The icon that is displayed at the top of the dialog. This is typically used
     * to display an icon that represents the type of alert that is being shown.
     */
    icon?: React__default.FC<IconProps>;
    /** The color of the icon. This is the color that is used to fill the icon. */
    iconColor?: string;
    /**
     * Whether the close button should be displayed in the top end corner of the
     * dialog. If this is `true`, a close button will be displayed. If this is
     * `false`, no close button will be displayed.
     *
     * @default true
     */
    showCloseButton?: boolean;
}

declare const AlertDialog: React__default.ForwardRefExoticComponent<AlertDialogProps & React__default.RefAttributes<HTMLDivElement>>;

interface MarkdownProps extends StylingProps {
    /** The markdown to render. */
    children: string;
}

declare const Markdown: React__default.ForwardRefExoticComponent<MarkdownProps & React__default.RefAttributes<HTMLDivElement>>;

interface DrawerProps extends StylingProps, AriaDialogProps {
    /** The children to render. */
    children: React__default.ReactNode;
    /**
     * The valid values for the background type are "medium" and "subtle".
     *
     * @default "medium"
     */
    background?: "medium" | "subtle";
    /** The title to display in the drawer. */
    title: string;
    /** The props of additional `ActionIconButton` to display in the drawer header. */
    action?: ActionIconButtonProps;
    /** The callback to call when the drawer is requested to be closed. */
    onCloseRequest?: () => void;
}

declare const Drawer: React__default.ForwardRefExoticComponent<DrawerProps & React__default.RefAttributes<HTMLDivElement>>;

interface AudioPlayerProps extends StylingProps, AriaLabelingProps {
    /**
     * The sources of the audio file. The `url` is the URL of the audio file, and
     * the `type` is the MIME type of the audio file.
     *
     * ```tsx
     * <AudioPlayer
     *  sources={[
     *    { url: "/sound.mp3", type: "audio/mpeg" },
     *    { url: "/sound.ogg", type: "audio/ogg" },
     *  ]}
     * />
     * ```
     */
    sources: {
        url: string;
        type: string;
    }[];
    /**
     * The size of the audio player.
     *
     * @default "lg"
     */
    size?: "sm" | "lg";
}

declare const AudioPlayer: React__default.ForwardRefExoticComponent<AudioPlayerProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * A hook that creates an IntersectionObserver and observes a target element.
 *
 * @example
 *   ```tsx
 *   import { useIntersectionObserver } from "@baseline-ui/core";
 *
 *   const MyComponent = () => {
 *    const ref = useRef(null);
 *
 *    const onIntersect = (entry) => {
 *      console.log(entry);
 *    };
 *
 *    useIntersectionObserver({ ref, onIntersect });
 *
 *    return <div ref={ref}>Hello world</div>;
 *   };
 *   ```;
 *
 * @param {IntersectionObserverOptions} options - The options for the
 *   IntersectionObserver.
 * @param {React.RefObject<HTMLElement>} options.ref - The ref of the target
 *   element to observe.
 * @param {(entry: IntersectionObserverEntry) => void} options.onIntersect - The
 *   function to call when the target element intersects the root element.
 * @param {boolean} options.isDisabled - Whether the IntersectionObserver should
 *   be disabled.
 * @param {number | number[]} options.threshold - The threshold(s) at which to
 *   trigger the onIntersect function.
 * @param {string} options.rootMargin - The margin around the root element.
 * @param {React.RefObject<HTMLElement>} options.root - The ref of the root
 *   element to observe.
 */
declare function useIntersectionObserver({ ref, onIntersect, isDisabled, threshold, rootMargin, root, }: IntersectionObserverOptions): void;
interface IntersectionObserverOptions {
    ref: React__default.RefObject<HTMLElement>;
    onIntersect: (entry: IntersectionObserverEntry) => void;
    root?: React__default.RefObject<HTMLElement>;
    rootMargin?: string;
    threshold?: number;
    isDisabled?: boolean;
}

/**
 * A hook that observes the size changes of a DOM element using the
 * ResizeObserver API.
 *
 * @example
 *   ```tsx
 *   const ref = useRef<HTMLDivElement>(null);
 *
 *   const { size } = useResizeObserver({
 *    ref,
 *    onResize: (entry) => {
 *    // do something
 *    },
 *    isDisabled: false,
 *   });
 *   ```;
 *
 * @param {Object} options - The options object.
 * @param {React.RefObject<HTMLElement>} options.ref - The ref object that
 *   points to the observed element.
 * @param {Function} options.onResize - The callback function that is called
 *   when the element is resized.
 * @param {boolean} options.isDisabled - A flag that indicates whether the
 *   observer is disabled.
 * @returns {Object} An object that contains the size of the observed element.
 */
declare function useResizeObserver({ ref, onResize, isDisabled, }: ResizeObserverOptions): {
    size: {
        width: number;
        height: number;
    } | undefined;
};
interface ResizeObserverOptions {
    ref: React__default.RefObject<HTMLElement>;
    onResize?: (entry: ResizeObserverEntry) => void;
    isDisabled?: boolean;
}

/**
 * A custom hook that loads an image and returns its loading state and props.
 *
 * @example
 *   ```tsx
 *   const { isLoaded, hasError, isLoading, imgProps } = useImage({
 *    src: "https://via.placeholder.com/150",
 *    alt: "Placeholder image",
 *   });
 *   ```;
 *
 * @param {Object} options - The options object.
 * @param {string} options.src - The image source URL.
 * @param {string} options.alt - The image alt text.
 * @returns {Object} An object containing the image loading state and props.
 * @returns {boolean} IsLoaded - Whether the image has loaded.
 * @returns {boolean} HasError - Whether there was an error loading the image.
 * @returns {boolean} IsLoading - Whether the image is currently loading.
 * @returns {Object} ImgProps - The image props to be passed to the `img`
 *   element.
 * @returns {string} ImgProps.src - The image source URL, or `undefined` if the
 *   image hasn't loaded yet.
 * @returns {string} ImgProps.alt - The image alt text.
 */
declare function useImage({ src, alt }: {
    src?: string;
    alt: string;
}): {
    isLoaded: boolean;
    hasError: boolean;
    isLoading: boolean;
    imgProps: {
        src?: string;
        alt: string;
    };
};

/**
 * A hook that provides undo and redo functionality for a given state.
 *
 * @example
 *   ```tsx
 *   const { state, push, undo, redo, pastStates, futureStates, canUndo, canRedo } = useUndoRedo({
 *     onAction: (state, action) => {
 *     // do something
 *     },
 *   });
 *
 *   // push a new state
 *   push({ foo: "bar" });
 *
 *   // undo the last state
 *   undo();
 *
 *   // redo the last state
 *   redo();
 *   ```;
 *
 * @template T The type of the state object.
 * @param initialState The initial state object.
 * @param options Additional options for the hook.
 * @param options.isDisabled Whether the undo/redo functionality should be
 *   disabled.
 * @param options.onAction A callback function that is called whenever an undo
 *   or redo action is performed.
 * @returns An object containing the current state, undo and redo functions, and
 *   other related properties.
 */
declare const useUndoRedo: <T>(initialState: T | undefined, { isDisabled, onAction, }: {
    isDisabled?: boolean | undefined;
    onAction?: ((state: T, action: "UNDO" | "REDO") => void) | undefined;
}) => {
    state: T;
    push: (newState: T) => void;
    undo: () => void;
    redo: () => void;
    pastStates: T[];
    futureStates: T[];
    canUndo: boolean;
    canRedo: boolean;
};

/**
 * This hook returns true if the component is being rendered for the first time.
 * This is useful for avoiding side effects on the first render inside of
 * useEffect.
 *
 * @example
 *   ```tsx
 *   const isFirstRender = useIsFirstRender();
 *
 *   useEffect(() => {
 *      if (isFirstRender) return;
 *      // do something
 *      return () => {
 *        // do something on unmount
 *      };
 *   }, [isFirstRender]);
 *   ```;
 *
 * @returns Whether or not the component is being rendered for the first time
 */
declare function useIsFirstRender(): boolean;

/**
 * A hook that provides internationalization functionality. It returns a
 * function to format messages and the current locale. The hook can be used with
 * or without a messages object. If no messages object is provided, the hook
 * will use the messages provided by the `I18nProvider`. If a messages object is
 * provided, the hook will use those messages instead of the ones provided by
 * the `I18nProvider`.
 *
 * @example
 *   ```tsx
 *   import { useI18n } from "@baseline-ui/core";
 *
 *   const messages = {
 *    en: { hello: "Hello" },
 *    fr: { hello: "Bonjour" },
 *   };
 *
 *   const MyComponent = () => {
 *    const { formatMessage, locale } = useI18n(messages);
 *
 *   return (
 *    <div>
 *      <p>{formatMessage("hello")}</p>
 *      <p>{locale}</p>
 *    </div>
 *    )};
 *   ```;
 *
 * @template T - A type that represents the shape of the translation messages.
 * @param {Object<string, T>} [messages] - An optional object containing
 *   translation messages for different languages.
 * @returns {I18nResult<T>} An object containing a function to format messages
 *   and the current locale.
 */
declare function useI18n<T extends Record<string, string>>(messages?: Record<string, T>): I18nResult<T>;
interface I18nResult<T extends LocalizedStrings[keyof LocalizedStrings]> {
    formatMessage: (id: keyof T | MessageDescriptor<T>, values?: Record<string, any>) => string;
    locale: Locale;
}
interface MessageDescriptor<T extends LocalizedStrings[keyof LocalizedStrings]> {
    id: keyof T;
    defaultMessage?: string;
}
/**
 * Defines a set of messages for use with the `useI18n` hook.
 *
 * @param messages An object containing message descriptors.
 * @returns An object containing the message descriptors with their keys as
 *   property names.
 */
declare const defineMessages: <const T extends Record<string, {
    id: string;
}>>(messages: T) => T;

/**
 * A hook that uses a MutationObserver to watch for changes to the DOM.
 *
 * @example
 *   ```tsx
 *   const targetRef = React.useRef<HTMLDivElement>(null);
 *
 *   useMutationObserver(targetRef.current, { attributes: true }, (mutations) => {
 *    console.log(mutations);
 *    // do something with the mutations
 *    // ...
 *   });
 *   ```;
 *
 * @param target The element to observe for changes.
 * @param options The options to pass to the MutationObserver.
 * @param callback The callback to call when a mutation occurs.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
declare function useMutationObserver(target: Element | null, options: MutationObserverInit, callback: MutationCallback): MutationObserver | null;

type SetValue<T> = Dispatch<SetStateAction<T>>;
/**
 * A hook to persist a value to localStorage.
 *
 * @example
 *   ```tsx
 *   function MyComponent() {
 *    const [value, setValue] = useLocalStorage("my-value", "default-value");
 *    return (
 *    <input value={value} onChange={e => setValue(e.target.value)} />
 *    );
 *   }
 *   ```;
 *
 * @param key The localStorage key to use
 * @param initialValue The initial value to use if the key is not found in
 *   localStorage
 */
declare function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>];

/**
 * A hook that provides text selection functionality for a given HTML element.
 *
 * ```jsx
 * function MyComponent() {
 *   const ref = useRef();
 *   const [selection, setSelection] = useState();
 *
 *   useTextSelection({
 *     ref,
 *     onSelectionChange: setSelection,
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
 *     </div>
 *   );
 * }
 * ```
 */
declare function useTextSelection({ ref, onSelectionChange, onSelectionEnd, isDisabled, }: TextSelectionProps): void;
interface TextSelectionProps {
    ref: React__default.RefObject<HTMLElement>;
    onSelectionChange: (selection: Selection) => void;
    onSelectionEnd?: (selection: Selection) => void;
    isDisabled?: boolean;
}

/**
 * Returns the current device type based on the window width.
 *
 * ```jsx
 * const device = useDevice();
 *
 * if (device === "mobile") {
 *   return <MobileComponent />;
 * } else if (device === "tablet") {
 *   return <TabletComponent />;
 * } else {
 *   return <DesktopComponent />;
 * }
 * ```
 *
 * @param element - The element to use to get the owner window. Defaults to
 *   `document.body`.
 */
declare function useDevice(element?: Element | null | undefined): "tablet" | "desktop" | "mobile";

declare const Core_Accordion: typeof Accordion;
declare const Core_AccordionItem: typeof AccordionItem;
type Core_AccordionItemProps = AccordionItemProps;
type Core_AccordionProps = AccordionProps;
declare const Core_ActionButton: typeof ActionButton;
type Core_ActionButtonProps = ActionButtonProps;
declare const Core_ActionIconButton: typeof ActionIconButton;
type Core_ActionIconButtonProps = ActionIconButtonProps;
declare const Core_AlertDialog: typeof AlertDialog;
type Core_AlertDialogProps = AlertDialogProps;
declare const Core_AudioPlayer: typeof AudioPlayer;
type Core_AudioPlayerProps = AudioPlayerProps;
declare const Core_Avatar: typeof Avatar;
type Core_AvatarProps = AvatarProps;
type Core_BlockProps = BlockProps;
declare const Core_Box: typeof Box;
type Core_BoxProps = BoxProps;
declare const Core_Checkbox: typeof Checkbox;
type Core_CheckboxProps = CheckboxProps;
declare const Core_ColorInput: typeof ColorInput;
type Core_ColorInputProps = ColorInputProps;
declare const Core_ColorPresetInlineInput: typeof ColorPresetInlineInput;
type Core_ColorPresetInlineInputProps = ColorPresetInlineInputProps;
declare const Core_ColorSwatch: typeof ColorSwatch;
type Core_ColorSwatchProps = ColorSwatchProps;
declare const Core_DateFormat: typeof DateFormat;
type Core_DateFormatProps = DateFormatProps;
declare const Core_Dialog: typeof Dialog;
type Core_DialogProps = DialogProps;
declare const Core_DialogTitle: typeof DialogTitle;
type Core_DialogTitleProps = DialogTitleProps;
declare const Core_DomNodeRenderer: typeof DomNodeRenderer;
type Core_DomNodeRendererProps = DomNodeRendererProps;
declare const Core_Drawer: typeof Drawer;
type Core_DrawerProps = DrawerProps;
declare const Core_Editor: typeof Editor;
type Core_EditorProps = EditorProps;
declare const Core_FileUpload: typeof FileUpload;
type Core_FileUploadProps = FileUploadProps;
declare const Core_FreehandCanvas: typeof FreehandCanvas;
type Core_FreehandCanvasProps = FreehandCanvasProps;
declare const Core_Group: typeof Group;
type Core_GroupProps = GroupProps;
declare const Core_I18nProvider: typeof I18nProvider;
type Core_I18nResult<T extends LocalizedStrings[keyof LocalizedStrings]> = I18nResult<T>;
declare const Core_IconColorInputButton: typeof IconColorInputButton;
declare const Core_ImageDropZone: typeof ImageDropZone;
type Core_ImageDropZoneProps = ImageDropZoneProps;
declare const Core_InlineAlert: typeof InlineAlert;
type Core_InlineAlertProps = InlineAlertProps;
declare const Core_Link: typeof Link;
type Core_LinkProps = LinkProps;
declare const Core_ListBox: typeof ListBox;
type Core_ListBoxProps = ListBoxProps;
type Core_ListOption = ListOption;
declare const Core_Markdown: typeof Markdown;
type Core_MarkdownProps = MarkdownProps;
declare const Core_Menu: typeof Menu;
type Core_MenuItem = MenuItem;
type Core_MenuProps = MenuProps;
type Core_MessageDescriptor<T extends LocalizedStrings[keyof LocalizedStrings]> = MessageDescriptor<T>;
declare const Core_MessageFormat: typeof MessageFormat;
type Core_MessageFormatProps = MessageFormatProps;
declare const Core_Modal: typeof Modal;
declare const Core_ModalClose: typeof ModalClose;
declare const Core_ModalContent: typeof ModalContent;
type Core_ModalContentProps = ModalContentProps;
type Core_ModalProps = ModalProps;
declare const Core_ModalTrigger: typeof ModalTrigger;
declare const Core_NumberFormat: typeof NumberFormat;
type Core_NumberFormatProps = NumberFormatProps;
declare const Core_NumberInput: typeof NumberInput;
type Core_NumberInputProps = NumberInputProps;
declare const Core_Pagination: typeof Pagination;
type Core_PaginationProps = PaginationProps;
declare const Core_Popover: typeof Popover;
declare const Core_PopoverContent: typeof PopoverContent;
type Core_PopoverContentProps = PopoverContentProps;
type Core_PopoverProps = PopoverProps;
declare const Core_PopoverTrigger: typeof PopoverTrigger;
type Core_PopoverTriggerProps = PopoverTriggerProps;
declare const Core_Portal: typeof Portal;
type Core_PortalProps = PortalProps;
declare const Core_Preview: typeof Preview;
type Core_PreviewProps = PreviewProps;
declare const Core_ProgressBar: typeof ProgressBar;
type Core_ProgressBarProps = ProgressBarProps;
declare const Core_ProgressSpinner: typeof ProgressSpinner;
type Core_ProgressSpinnerProps = ProgressSpinnerProps;
declare const Core_RadioGroup: typeof RadioGroup;
type Core_RadioGroupProps = RadioGroupProps;
declare const Core_Reaction: typeof Reaction;
type Core_ReactionProps = ReactionProps;
declare const Core_ScrollControlButton: typeof ScrollControlButton;
type Core_ScrollControlButtonProps = ScrollControlButtonProps;
declare const Core_SearchInput: typeof SearchInput;
type Core_SearchInputProps = SearchInputProps;
declare const Core_Select: typeof Select;
type Core_SelectProps = SelectProps;
declare const Core_Separator: typeof Separator;
type Core_SeparatorProps = SeparatorProps;
declare const Core_Slider: typeof Slider;
type Core_SliderProps = SliderProps;
type Core_StylingProps = StylingProps;
declare const Core_Switch: typeof Switch;
type Core_SwitchProps = SwitchProps;
declare const Core_TabItem: typeof TabItem;
type Core_TabItemProps = TabItemProps;
declare const Core_Tabs: typeof Tabs;
type Core_TabsProps = TabsProps;
declare const Core_TagGroup: typeof TagGroup;
type Core_TagGroupProps = TagGroupProps;
declare const Core_TextInput: typeof TextInput;
type Core_TextInputProps = TextInputProps;
type Core_TextProps<T extends keyof React__default.JSX.IntrinsicElements = "span"> = TextProps<T>;
declare const Core_ThemeProvider: typeof ThemeProvider;
type Core_ThemeProviderProps = ThemeProviderProps;
declare const Core_ToggleButton: typeof ToggleButton;
type Core_ToggleButtonProps = ToggleButtonProps;
declare const Core_ToggleIconButton: typeof ToggleIconButton;
type Core_ToggleIconButtonProps = ToggleIconButtonProps;
declare const Core_Toolbar: typeof Toolbar;
type Core_ToolbarProps = ToolbarProps;
declare const Core_Tooltip: typeof Tooltip;
type Core_TooltipProps = TooltipProps;
declare const Core_Transform: typeof Transform;
type Core_TransformProps = TransformProps;
declare const Core_defineMessages: typeof defineMessages;
declare const Core_useCollator: typeof useCollator;
declare const Core_useDateFormatter: typeof useDateFormatter;
declare const Core_useDevice: typeof useDevice;
declare const Core_useI18n: typeof useI18n;
declare const Core_useImage: typeof useImage;
declare const Core_useIntersectionObserver: typeof useIntersectionObserver;
declare const Core_useIsFirstRender: typeof useIsFirstRender;
declare const Core_useLocalStorage: typeof useLocalStorage;
declare const Core_useMutationObserver: typeof useMutationObserver;
declare const Core_useNumberFormatter: typeof useNumberFormatter;
declare const Core_useResizeObserver: typeof useResizeObserver;
declare const Core_useTextSelection: typeof useTextSelection;
declare const Core_useUndoRedo: typeof useUndoRedo;
declare const Core_useUserPreferences: typeof useUserPreferences;
declare namespace Core {
  export { Core_Accordion as Accordion, Core_AccordionItem as AccordionItem, type Core_AccordionItemProps as AccordionItemProps, type Core_AccordionProps as AccordionProps, Core_ActionButton as ActionButton, type Core_ActionButtonProps as ActionButtonProps, Core_ActionIconButton as ActionIconButton, type Core_ActionIconButtonProps as ActionIconButtonProps, Core_AlertDialog as AlertDialog, type Core_AlertDialogProps as AlertDialogProps, Core_AudioPlayer as AudioPlayer, type Core_AudioPlayerProps as AudioPlayerProps, Core_Avatar as Avatar, type Core_AvatarProps as AvatarProps, type Core_BlockProps as BlockProps, Core_Box as Box, type Core_BoxProps as BoxProps, Core_Checkbox as Checkbox, type Core_CheckboxProps as CheckboxProps, Core_ColorInput as ColorInput, type Core_ColorInputProps as ColorInputProps, type ColorPreset$1 as ColorPreset, Core_ColorPresetInlineInput as ColorPresetInlineInput, type Core_ColorPresetInlineInputProps as ColorPresetInlineInputProps, Core_ColorSwatch as ColorSwatch, type Core_ColorSwatchProps as ColorSwatchProps, Core_DateFormat as DateFormat, type Core_DateFormatProps as DateFormatProps, Core_Dialog as Dialog, type Core_DialogProps as DialogProps, Core_DialogTitle as DialogTitle, type Core_DialogTitleProps as DialogTitleProps, Core_DomNodeRenderer as DomNodeRenderer, type Core_DomNodeRendererProps as DomNodeRendererProps, Core_Drawer as Drawer, type Core_DrawerProps as DrawerProps, Core_Editor as Editor, type Core_EditorProps as EditorProps, Core_FileUpload as FileUpload, type Core_FileUploadProps as FileUploadProps, Core_FreehandCanvas as FreehandCanvas, type Core_FreehandCanvasProps as FreehandCanvasProps, Core_Group as Group, type Core_GroupProps as GroupProps, Core_I18nProvider as I18nProvider, type I18nProviderProps$1 as I18nProviderProps, type Core_I18nResult as I18nResult, Core_IconColorInputButton as IconColorInputButton, Core_ImageDropZone as ImageDropZone, type Core_ImageDropZoneProps as ImageDropZoneProps, Core_InlineAlert as InlineAlert, type Core_InlineAlertProps as InlineAlertProps, Core_Link as Link, type Core_LinkProps as LinkProps, Core_ListBox as ListBox, type Core_ListBoxProps as ListBoxProps, type Core_ListOption as ListOption, Core_Markdown as Markdown, type Core_MarkdownProps as MarkdownProps, Core_Menu as Menu, type Core_MenuItem as MenuItem, type Core_MenuProps as MenuProps, type Core_MessageDescriptor as MessageDescriptor, Core_MessageFormat as MessageFormat, type Core_MessageFormatProps as MessageFormatProps, Core_Modal as Modal, Core_ModalClose as ModalClose, Core_ModalContent as ModalContent, type Core_ModalContentProps as ModalContentProps, type Core_ModalProps as ModalProps, Core_ModalTrigger as ModalTrigger, Core_NumberFormat as NumberFormat, type Core_NumberFormatProps as NumberFormatProps, Core_NumberInput as NumberInput, type Core_NumberInputProps as NumberInputProps, Core_Pagination as Pagination, type Core_PaginationProps as PaginationProps, Core_Popover as Popover, Core_PopoverContent as PopoverContent, type Core_PopoverContentProps as PopoverContentProps, type Core_PopoverProps as PopoverProps, Core_PopoverTrigger as PopoverTrigger, type Core_PopoverTriggerProps as PopoverTriggerProps, Core_Portal as Portal, type Core_PortalProps as PortalProps, Core_Preview as Preview, type Core_PreviewProps as PreviewProps, Core_ProgressBar as ProgressBar, type Core_ProgressBarProps as ProgressBarProps, Core_ProgressSpinner as ProgressSpinner, type Core_ProgressSpinnerProps as ProgressSpinnerProps, Core_RadioGroup as RadioGroup, type Core_RadioGroupProps as RadioGroupProps, Core_Reaction as Reaction, type Core_ReactionProps as ReactionProps, Core_ScrollControlButton as ScrollControlButton, type Core_ScrollControlButtonProps as ScrollControlButtonProps, Core_SearchInput as SearchInput, type Core_SearchInputProps as SearchInputProps, Core_Select as Select, type Core_SelectProps as SelectProps, Core_Separator as Separator, type Core_SeparatorProps as SeparatorProps, Core_Slider as Slider, type Core_SliderProps as SliderProps, type Core_StylingProps as StylingProps, Core_Switch as Switch, type Core_SwitchProps as SwitchProps, Core_TabItem as TabItem, type Core_TabItemProps as TabItemProps, Core_Tabs as Tabs, type Core_TabsProps as TabsProps, Core_TagGroup as TagGroup, type Core_TagGroupProps as TagGroupProps, Text$1 as Text, Core_TextInput as TextInput, type Core_TextInputProps as TextInputProps, type Core_TextProps as TextProps, Core_ThemeProvider as ThemeProvider, type Core_ThemeProviderProps as ThemeProviderProps, Core_ToggleButton as ToggleButton, type Core_ToggleButtonProps as ToggleButtonProps, Core_ToggleIconButton as ToggleIconButton, type Core_ToggleIconButtonProps as ToggleIconButtonProps, Core_Toolbar as Toolbar, type Core_ToolbarProps as ToolbarProps, Core_Tooltip as Tooltip, type Core_TooltipProps as TooltipProps, Core_Transform as Transform, type Core_TransformProps as TransformProps, Core_defineMessages as defineMessages, Core_useCollator as useCollator, Core_useDateFormatter as useDateFormatter, Core_useDevice as useDevice, Core_useI18n as useI18n, Core_useImage as useImage, Core_useIntersectionObserver as useIntersectionObserver, Core_useIsFirstRender as useIsFirstRender, Core_useLocalStorage as useLocalStorage, Core_useMutationObserver as useMutationObserver, Core_useNumberFormatter as useNumberFormatter, Core_useResizeObserver as useResizeObserver, Core_useTextSelection as useTextSelection, Core_useUndoRedo as useUndoRedo, Core_useUserPreferences as useUserPreferences };
}

type Any$1 = any;
type IRecord$1 = Record<Any$1, Any$1>;
type AnyComponent = React__default.ComponentType<Any$1> | keyof ReactHTML;
type Child = Block | string | number | ((...args: Any$1[]) => React__default.ReactElement);
type Props<T extends AnyComponent> = Omit<React__default.ComponentPropsWithRef<T>, "children"> & {
    "data-block-id"?: string;
    children?: Child[];
};
type PropsWithoutChildren<T extends AnyComponent> = Omit<Props<T>, "children">;
/**
 * The Block class is a wrapper around React components. It is used to create a
 * virtual DOM tree that can be rendered to the DOM.
 */
declare class Block<T extends AnyComponent = AnyComponent> {
    id: string;
    private readonly _container;
    private readonly _component;
    private _props;
    private _children;
    private parent?;
    constructor(component: AnyComponent, props: Props<T>, options?: {
        container?: HTMLElement;
        ownerDocument?: Document;
    });
    private _setParent;
    /**
     * This getter returns the props of the block.
     *
     * ```tsx
     * const block = new Block("div", { className: "test" });
     *
     * block.props; // { className: "test" }
     * ```
     */
    get props(): PropsWithoutChildren<T>;
    /**
     * This setter sets the props of the block. This method will replace the
     * existing props with the new props. Do not pass children in the props. Use
     * the `children` setter instead.
     *
     * ```tsx
     * const block = new Block("div", { className: "test" });
     *
     * block.props = { className: "test2" };
     * ```
     *
     * @param props
     */
    set props(props: PropsWithoutChildren<T>);
    /**
     * This method will create a React element from the block and all of its
     * children.
     *
     * ```ts
     * const App = () => {
     *   const block = new Block("div", { className: "test" });
     *   return block.createComponent();
     *   // <div className="test" />
     * };
     * ```
     *
     * @param key The key to use for the component.
     * @returns A React element.
     */
    createComponent(key?: Key$1): React__default.ReactElement;
    /**
     * This getter returns a list of the children of the block.
     *
     * ```ts
     * const block = new Block("div", { className: "test" });
     *
     * block.children = ["test"];
     * block.children; // ["test"]
     * ```
     */
    get children(): Child[];
    /**
     * This setter sets the children of the block. This method will replace the
     * existing children with the new children.
     *
     * ```ts
     * const block = new Block("div", { className: "test" });
     *
     * block.children = ["test"];
     * block.children; // ["test"]
     * ```
     *
     * @param children The new children to use.
     */
    set children(children: Child[]);
    /**
     * Prepends children to the block. This method will prepend the children to
     * the beginning of the existing children.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     * const block = new Block("div", { className: "test", children: [
     *  child1,
     *  child2,
     * ]});
     *
     * const child3 = new Block("div", { className: "test3", data-block-id: "test3" });
     * block.prependChildren(child3);
     * block.children; // [child3, child1, child2]
     * ```
     *
     * @param children The children to prepend.
     * @returns The Block instance.
     */
    prependChildren(...children: Child[]): this;
    /**
     * Appends children to the block. This method will append the children to the
     * end of the existing children.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     * const block = new Block("div", { className: "test", children: [
     *  child1,
     *  child2,
     * ]});
     *
     * const child3 = new Block("div", { className: "test3", data-block-id: "test3" });
     *
     * block.appendChildren(child3);
     * block.children; // [child1, child2, child3]
     * ```
     *
     * @param children
     * @returns The Block instance.
     */
    appendChildren(...children: Child[]): this;
    /**
     * This method will search the entire tree of children and then inserts
     * children after the child with the given id. This method will insert the
     * children after the first child with the given id. If the child is not
     * found, the children will not be inserted.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     *
     * const block = new Block("div", { className: "test", children: [
     *  child1,
     *  child2,
     * ]});
     *
     * const child3 = new Block("div", { className: "test3", data-block-id: "test3" });
     * block.insertAfter(child2.id, child3);
     * block.children; // [child1, child2, child3]
     * ```
     *
     * @param block The id of the child block or the block to insert the children
     *   after.
     * @param children The children to insert.
     * @returns The Block instance.
     */
    insertBefore(block: string | Block, ...children: Child[]): this;
    /**
     * This method will search the entire tree of children and then inserts
     * children after the child with the given id. This method will insert the
     * children after the first child with the given id. If the child is not
     * found, the children will not be inserted.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     * const block = new Block("div", { className: "test", children: [child1, child2] });
     *
     * const child3 = new Block("div", { className: "test3", data-block-id: "test3" });
     *
     * block.insertAfter(child1.id, child3);
     * block.children; // [child1, child3, child2]
     * ```
     *
     * @param block
     * @param children The children to insert.
     * @returns The Block instance.
     */
    insertAfter(block: string | Block, ...children: Child[]): this;
    /**
     * This method will search the entire tree of children and then replaces the
     * child with the given id with the new children. This method will replace the
     * first child with the given id. If the child is not found, the children will
     * not be inserted.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     * const block = new Block("div", { className: "test", children: [child1, child2] });
     *
     * const child3 = new Block("div", { className: "test3", data-block-id: "test3" });
     *
     * block.replace(child1.id, child3);
     * block.children; // [child3, child2]
     * ```
     *
     * @param block The id of the child block or the block to replace.
     * @param children The children to insert.
     * @returns The Block instance.
     */
    replace(block: string | Block, ...children: Child[]): this;
    /**
     * Finds a child block by its id. This method will search the entire tree of
     * children. If the child is not found, undefined is returned.
     *
     * ```ts
     * const child1 = new Block("div", {
     *   className: "test1",
     *   "data-block-id": "test1",
     * });
     * const child2 = new Block("div", {
     *   className: "test2",
     *   "data-block-id": "test2",
     * });
     * const block = new Block("div", { className: "test" }, child1, child2);
     *
     * block.getBlockById(child2.id); // child2
     * ```
     *
     * @param id The id of the child to find.
     * @returns The child block or undefined.
     */
    getBlockById<T extends AnyComponent>(id: string): Block<T> | undefined;
    /**
     * Finds the blocks by the component. This method will search the entire tree
     * of children. If the child is not found, undefined is returned.
     *
     * ```ts
     * const child1 = new Block("div", {
     *   className: "test1",
     *   "data-block-id": "test1",
     * });
     * const child2 = new Block("div", {
     *   className: "test2",
     *   "data-block-id": "test2",
     * });
     * const slider = new Block(Slider, {
     *   className: "test",
     *   "data-block-id": "test",
     * });
     *
     * const block = new Block(
     *   "div",
     *   { className: "test" },
     *   child1,
     *   child2,
     *   slider,
     * );
     *
     * block.getBlocksByComponent(Slider); // [slider]
     * ```
     *
     * @param component
     * @returns An array of blocks.
     */
    getBlocksByComponent<T extends AnyComponent>(component: T): Block<T>[];
    private _getChild;
    private _removeChild;
    /**
     * Removes a child block by its id. This method will search the entire tree of
     * children. If the child is not found, undefined is returned.
     *
     * ```ts
     * const child1 = new Block("div", { className: "test1", data-block-id: "test1" });
     * const child2 = new Block("div", { className: "test2", data-block-id: "test2" });
     *
     * const block = new Block("div", { className: "test", children: [child1, child2] });
     *
     * block.removeChildById(child2.id);
     * block.children; // [child1]
     * ```
     *
     * @param id
     */
    removeChildById(id: string): void;
    /**
     * Returns a DOM Node that can be added directly to the DOM. This method will
     * create a DOM Node from the block and all of its children.
     */
    createDOMNode(container?: HTMLElement): HTMLElement;
    /**
     * This method will merge the props of the block with the new props.
     *
     * ```ts
     * const block = new Block("div", { className: "test", id: "testid" });
     *
     * block.mergeProps({ className: "test2" });
     * block.props; // { className: "test2", id: "testid" }
     * ```
     *
     * @param props The new props to use.
     * @returns The Block instance.
     */
    mergeProps(props: Partial<Props<T>>): this;
    /**
     * Sets a single prop on the component. This method will not re-render the
     * component.
     *
     * ```ts
     * const block = new Block("div", { className: "test", id: "testid" });
     *
     * block.setProp("className", "test2");
     * block.props; // { className: "test2", id: "testid" }
     * ```
     *
     * @param key
     * @param value
     * @returns The Block instance.
     */
    setProp<U extends keyof Props<T>>(key: U, value: Props<T>[U]): this;
    /**
     * This method will return a JSON representation of the block and all of its
     * children.
     */
    toJS(): IJSON;
}
interface IJSON {
    id?: string;
    component: string;
    props: IRecord$1;
    children: (IJSON | {
        value: string | number | ((...args: Any$1[]) => React__default.ReactElement);
    })[];
}

type Any = any;
interface BlockId {
    "data-block-id"?: string;
}
/**
 * Creates a new Block instance.
 *
 * @param component The component to render.
 * @param props The props to pass to the component.
 * @param children
 */
declare function createBlock<const T extends keyof React__default.ReactHTML>(component: T, props?: Omit<React__default.ComponentPropsWithRef<T>, "children"> & BlockId, ...children: Child[]): Block<T>;
declare function createBlock<T extends React__default.ForwardRefExoticComponent<Any>>(component: T, props?: Omit<React__default.ComponentPropsWithRef<T>, "children"> & BlockId, ...children: Child[]): Block<T>;
declare function createBlock<T extends (...args: Any[]) => Any>(component: T, props?: Omit<Parameters<T>[0], "children"> & BlockId, ...children: Child[]): Block<T>;

type Messages = {
    addLink: string;
    addSignature: string;
    backgroundColor: string;
    black: string;
    blue: string;
    bold: string;
    cancel: string;
    chat: string;
    chooseColor: string;
    clearSignature: string;
    close: string;
    color: string;
    copy: string;
    createStamp: string;
    customStamp: string;
    darkBlue: string;
    date: string;
    delete: string;
    done: string;
    draw: string;
    editLink: string;
    fontColor: string;
    fonts: string;
    image: string;
    italic: string;
    linkAnnotation: string;
    loading: string;
    pause: string;
    play: string;
    preview: string;
    readMore: string;
    removeLink: string;
    save: string;
    saveSignature: string;
    selectDragImage: string;
    showMore: string;
    signature: string;
    signatures: string;
    signHere: string;
    stampAnnotationTemplatesDialog: string;
    stampText: string;
    storeSignature: string;
    time: string;
    type: string;
    typeSomething: string;
    underline: string;
    useAnExistingStampDesign: string;
};

interface State<T> {
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    toJS: () => T;
}
interface RecipeResult<T> {
    intl: I18nResult<Messages>;
    state: State<T>;
    device: "mobile" | "tablet" | "desktop";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IRecord = Record<string, any>;

interface BaseChildrenArgs<T = Record<string, never>>
  extends RecipeResult<T> {
  /** The block component that can be modified */
  ui: Block;

  /** The ref of the block component */
  ref?: ForwardedRef<HTMLDivElement>;
}

interface BaseRecipeProps<
  State extends IRecord,
  ChildArgs extends IRecord,
> {
  /**
   * The initial state of the component. This is useful for controlling the
   * component.
   */
  initialState?: Partial<State>;

  /**
   * The state of the component. This is useful for controlling the component.
   * If this is provided, the property with non-defined values will be
   * controlled.
   */
  state?: Partial<State>;

  /** The function that is called when the state of the component changes. */
  onStateChange?: (changes: Partial<State>) => void;

  /** Optional prop for rendering child components. */
  children?: (props: ChildArgs) => React__default.ReactElement;
}

interface SharedProps$4 extends StylingProps {
    /**
     * The items to display in the list. Each item can be an image, svg, or text.
     * Each item must have a unique id. The signature list will display the items
     * in the order they are provided.
     */
    items: (PreviewProps & {
        id: Key$1;
    })[];
    /**
     * Callback fired when the user clicks the button to add a signature to the
     * list.
     */
    onAdd?: () => void;
    /**
     * Callback fired when the user clicks the add button on a preview. The delete
     * button is only displayed when this callback is provided.
     *
     * @param id
     */
    onAddFromPreview?: (id: Key$1) => void;
    /**
     * Callback fired when the user clicks the remove button on a preview.
     *
     * @param id
     */
    onRemoveFromPreview?: (id: Key$1) => void;
    /** Callback fired when the user clicks the cancel button. */
    onCancel?: () => void;
    /** The id of the title element. */
    titleId?: string;
    /**
     * The variant of the component. This changes the styling of the component.
     *
     * @default "wide"
     */
    variant?: "wide" | "narrow";
}
type ChildrenArgs$4 = SharedProps$4 & BaseChildrenArgs<IRecord>;
interface SignaturesListProps extends SharedProps$4, BaseRecipeProps<IRecord, ChildrenArgs$4> {
}

declare enum CREATE_SIGNATURE_ALLOWED_TABS {
    DRAW = "DRAW",
    TYPE = "TYPE",
    IMAGE = "IMAGE"
}
interface InternalState$2 extends IRecord {
    /**
     * The color of an object. This is a hex value that is applied to the points
     * in `FreehandCanvas` or `SignatureTextInput`
     */
    color: string;
    /**
     * The image that is uploaded. This is a `File` object that is uploaded to the
     * in the Image tab.
     */
    image?: File;
    /**
     * The ink variable represents the ink that is drawn on the canvas. The ink is
     * represented as an array of arrays of points. Each point is represented as
     * an array of two numbers, the x and y coordinates of the point.
     */
    ink?: number[][][];
    /**
     * The text variable represents the text that is input in the text input. The
     * text is represented as a string.
     */
    text?: string;
    /**
     * The current tab that is selected. The tab can be one of the following
     * values: "DRAW", "TYPE", or "IMAGE".
     */
    currentTab: keyof typeof CREATE_SIGNATURE_ALLOWED_TABS;
    /**
     * The selectedFont variable represents the currently selected font for text
     * input.
     */
    selectedFont: string;
    /**
     * Indicates whether the signature should be stored or not.
     *
     * @default false
     */
    shouldStoreSignature: boolean;
}
interface SharedProps$3 extends StylingProps {
    /**
     * Indicates whether it is possible to store the signature or not.
     *
     * @default true
     */
    allowStoringSignature?: boolean;
    /**
     * An array of color presets. If not provided, the default color presets will
     * be used.
     *
     * ```js
     * [
     *   { color: "#000000", label: "Black" },
     *   { color: "#2293fb", label: "Blue" },
     *   { color: "#4636e3", label: "Dark Blue" },
     * ];
     * ```
     */
    colorPresets: ColorPreset$1[];
    /**
     * The tabs that should be shown in the signature dialog. The tabs are
     * represented as a string of the tab names. The following tabs are available:
     * "DRAW", "TYPE", and "IMAGE".
     *
     * @default ["DRAW", "TYPE", "IMAGE"]
     */
    allowedTabs?: (keyof typeof CREATE_SIGNATURE_ALLOWED_TABS)[];
    /**
     * An array of font names. Make sure those fonts are available in the
     * application. The names should be the same as the ones used in the
     * application.
     */
    fonts: string[];
    /** The title ID of the component. This is used for accessibility purposes. */
    titleId?: string;
    /** Callback function that is called when a close event is triggered. */
    onCloseRequest: () => void;
    /** Callback function that is called when a signature is added. */
    onAdd: (state: Omit<InternalState$2, "image" | "text" | "ink"> & {
        canvasSize: {
            height: number;
            width: number;
        } | undefined;
        signature?: {
            type: CREATE_SIGNATURE_ALLOWED_TABS.TYPE;
            value?: string;
        } | {
            type: CREATE_SIGNATURE_ALLOWED_TABS.DRAW;
            value?: number[][][];
        } | {
            type: CREATE_SIGNATURE_ALLOWED_TABS.IMAGE;
            value?: File;
        };
    }) => void;
    /**
     * The variant of the variable.
     *
     * @typedef {"narrow" | "wide"} Variant
     */
    variant?: "narrow" | "wide";
}
interface ChildrenArgs$3 extends SharedProps$3, BaseChildrenArgs<InternalState$2> {
}
interface CreateSignatureProps extends SharedProps$3, BaseRecipeProps<InternalState$2, ChildrenArgs$3> {
}

interface InternalState$1 extends IRecord {
    text?: string;
    includeDate: boolean;
    includeTime: boolean;
    color: string;
}
interface SharedProps$2 extends StylingProps {
    /**
     * The `id` of the title of the component. This is useful for accessibility
     * when the component is used in a dialog.
     */
    titleId?: string;
    /** Callback function that is called when a close event is triggered. */
    onCloseRequest?: () => void;
    /**
     * Callback function that is called when a stamp is added.
     *
     * @param options
     */
    onCreate: (options: {
        text?: string;
        subText?: string;
        color: string;
        width: number;
    }) => void;
    /** An optional array of color presets. */
    colorPresets: {
        color: string;
        label: string;
    }[];
    /**
     * An optional function that returns a lighter variant of the color provided.
     * By default, the color is lightened by 80%.
     *
     * @param color
     */
    getLighterVariant?: (color: string) => string;
    /**
     * A callback function that is called when the user clicks on the "Use
     * existing stamp" button.
     */
    onExistingStampPress?: () => void;
}
type ChildrenArgs$2 = SharedProps$2 & BaseChildrenArgs<InternalState$1>;
interface CreateStampProps extends SharedProps$2, BaseRecipeProps<InternalState$1, ChildrenArgs$2> {
}

interface InternalState extends IRecord {
}
interface SharedProps$1 extends StylingProps, Omit<SignaturesListProps, "children" | "onRemoveFromPreview" | "variant" | "initialState" | "onAddFromPreview" | "disabledActions" | "onAdd"> {
    /**
     * Callback fired when the user clicks the preview
     *
     * @param id
     */
    onAdd?: (id: Key$1) => void;
    /** Callback fired when the user clicks the custom stamp button */
    onCustomStampPress?: () => void;
}
type ChildrenArgs$1 = SharedProps$1 & BaseChildrenArgs<InternalState>;
interface StampsListProps extends SharedProps$1, BaseRecipeProps<InternalState, ChildrenArgs$1> {
}

declare const Recipes: {
    readonly SignaturesList: React.ForwardRefExoticComponent<SignaturesListProps & React.RefAttributes<HTMLDivElement>>;
    readonly CreateSignature: React.ForwardRefExoticComponent<CreateSignatureProps & React.RefAttributes<HTMLDivElement>>;
    readonly StampsList: React.ForwardRefExoticComponent<StampsListProps & React.RefAttributes<HTMLDivElement>>;
    readonly CreateStamp: React.ForwardRefExoticComponent<CreateStampProps & React.RefAttributes<HTMLDivElement>>;
};
type InterfacesType = {
    [K in keyof typeof Recipes]: K;
};
declare const Interfaces: InterfacesType;

type documentEditorUIConfig = {
    thumbnailMinSize: number;
    thumbnailMaxSize: number;
    thumbnailDefaultSize: number;
};

declare const AutoSaveMode: {
    readonly IMMEDIATE: "IMMEDIATE";
    readonly INTELLIGENT: "INTELLIGENT";
    readonly DISABLED: "DISABLED";
};
type IAutoSaveMode = (typeof AutoSaveMode)[keyof typeof AutoSaveMode];

declare const PrintQuality: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
};
type IPrintQuality = (typeof PrintQuality)[keyof typeof PrintQuality];

declare const ToolbarPlacement: {
    readonly TOP: "TOP";
    readonly BOTTOM: "BOTTOM";
};
type IToolbarPlacement = (typeof ToolbarPlacement)[keyof typeof ToolbarPlacement];

declare const ModificationType: {
    readonly CREATED: "CREATED";
    readonly UPDATED: "UPDATED";
    readonly DELETED: "DELETED";
};
type IModificationType = (typeof ModificationType)[keyof typeof ModificationType];

type SaveErrorReason = {
    error: any;
    object: any;
    modificationType: IModificationType;
};
declare function PSPDFKitSaveError(messageOrError: string | Error, reason: Array<SaveErrorReason>): Error;
declare namespace PSPDFKitSaveError {
    var prototype: any;
}

type AnnotationTooltipCallback = (annotation: AnnotationsUnion) => Array<ToolItem>;

declare const FormFieldValue_base: Record$1.Factory<{
    name?: string | undefined;
    value?: string | number | List<string> | null | undefined;
    optionIndexes?: List<number> | undefined;
    isFitting?: boolean | undefined;
}>;
declare class FormFieldValue extends FormFieldValue_base {
    name: string;
    value: string | List<string> | null;
    optionIndexes?: List<number>;
    isFitting?: boolean;
    static defaultValues: IObject$1;
    constructor(args?: IObject$1);
}

type RenderPageCallback = (context: CanvasRenderingContext2D, pageIndex: number, pageSize: Size) => unknown;

type ColorPreset = {
    color: Color$2 | null;
    localization: {
        id: string;
        defaultMessage?: string;
        description?: string;
    };
};

type FontCallback = (arg0: string) => Promise<Blob>;

interface IFont {
    name: string | null;
    callback: FontCallback | null;
}
declare const Font_base: Record$1.Factory<IFont>;
declare class Font extends Font_base {
    constructor(args: {
        name: string;
        callback?: FontCallback;
    });
}

declare const ElectronicSignatureCreationMode: {
    readonly DRAW: "DRAW";
    readonly IMAGE: "IMAGE";
    readonly TYPE: "TYPE";
};
type IElectronicSignatureCreationMode = (typeof ElectronicSignatureCreationMode)[keyof typeof ElectronicSignatureCreationMode];

type OnOpenUriCallback = (uri: string, isUserInitiated: boolean) => boolean;

declare const UIDateTimeElement: {
    readonly COMMENT_THREAD: "COMMENT_THREAD";
    readonly ANNOTATIONS_SIDEBAR: "ANNOTATIONS_SIDEBAR";
};
type IUIDateTimeElement = (typeof UIDateTimeElement)[keyof typeof UIDateTimeElement];

type DateTimeStringCallback = (args: {
    dateTime: Date;
    element: IUIDateTimeElement;
    object: AnnotationsUnion | Comment;
}) => string;

declare const InkEraserMode: {
    readonly POINT: "POINT";
    readonly STROKE: "STROKE";
};
type IInkEraserMode = (typeof InkEraserMode)[keyof typeof InkEraserMode];

type BuiltInColorProperty = 'color' | 'stroke-color' | 'fill-color' | 'background-color' | 'font-color' | 'outline-color';
type AnnotationToolbarColorPresetConfig = {
    presets: ColorPreset[];
    showColorPicker?: boolean;
};
type AnnotationToolbarColorPresetsCallback = (options: {
    propertyName: BuiltInColorProperty;
    defaultAnnotationToolbarColorPresets: ColorPreset[];
}) => AnnotationToolbarColorPresetConfig | undefined;

type EnableRichTextCallback = (annotation: TextAnnotation) => boolean;

type ElectronicSignaturesConfiguration = {
    creationModes?: Readonly<IElectronicSignatureCreationMode[]>;
    fonts?: Readonly<Font[]>;
    setDefaultTypeText?: ElectronicSignatureDefaultTextCallback | string;
    colorPresets?: Readonly<ColorPreset[]>;
};
type ElectronicSignatureDefaultTextCallback = () => string | undefined | void;

declare const ProcessorEngine: {
    smallerSize: string;
    fasterProcessing: string;
};
type IProcessorEngine = (typeof ProcessorEngine)[keyof typeof ProcessorEngine];

type TrustedCAsCallback = () => Promise<Array<ArrayBuffer | string>>;

declare const Conformance: {
    readonly PDFA_1A: "pdfa-1a";
    readonly PDFA_1B: "pdfa-1b";
    readonly PDFA_2A: "pdfa-2a";
    readonly PDFA_2U: "pdfa-2u";
    readonly PDFA_2B: "pdfa-2b";
    readonly PDFA_3A: "pdfa-3a";
    readonly PDFA_3U: "pdfa-3u";
    readonly PDFA_3B: "pdfa-3b";
    readonly PDFA_4: "pdfa-4";
    readonly PDFA_4E: "pdfa-4e";
    readonly PDFA_4F: "pdfa-4f";
};
type IConformance = (typeof Conformance)[keyof typeof Conformance];

type TemplateDataToPopulateDocument = {
    config: DelimiterConfig;
    model: Array<Record<string, unknown>>;
};
type DelimiterConfig = {
    delimiter: DelimiterSettings;
};
type DelimiterSettings = {
    start: string;
    end: string;
};

declare const OfficeDocumentFormat: {
    docx: string;
    xlsx: string;
    pptx: string;
};
type IDocumentOfficeFormat = (typeof OfficeDocumentFormat)[keyof typeof OfficeDocumentFormat];

type SharedConfiguration = {
    container: string | HTMLElement;
    initialViewState?: ViewState;
    baseUrl?: string;
    serverUrl?: string;
    styleSheets?: Array<string>;
    toolbarItems?: Array<ToolbarItem>;
    annotationPresets?: Record<AnnotationPresetID$1, AnnotationPreset$1>;
    stampAnnotationTemplates?: Array<StampAnnotation | ImageAnnotation>;
    autoSaveMode?: IAutoSaveMode;
    disableHighQualityPrinting?: boolean;
    printMode?: IPrintMode;
    printOptions?: {
        mode?: IPrintMode;
        quality?: IPrintQuality;
    };
    disableTextSelection?: boolean;
    disableForms?: boolean;
    headless?: boolean;
    locale?: string;
    populateInkSignatures?: () => Promise<List<InkAnnotation | ImageAnnotation>>;
    populateStoredSignatures?: () => Promise<List<InkAnnotation | ImageAnnotation>>;
    formFieldsNotSavingSignatures?: Array<string>;
    password?: string;
    disableOpenParameters?: boolean;
    maxPasswordRetries?: number;
    enableServiceWorkerSupport?: boolean;
    preventTextCopy?: boolean;
    renderPageCallback?: RenderPageCallback;
    annotationTooltipCallback?: AnnotationTooltipCallback;
    editableAnnotationTypes?: Array<Class<AnnotationsUnion>>;
    isEditableAnnotation?: IsEditableAnnotationCallback;
    onAnnotationResizeStart?: AnnotationResizeStartCallback;
    customRenderers?: CustomRenderers;
    customUI?: CustomUI;
    theme?: ITheme;
    toolbarPlacement?: IToolbarPlacement;
    minDefaultZoomLevel?: number;
    maxDefaultZoomLevel?: number;
    isEditableComment?: IsEditableCommentCallback;
    restrictAnnotationToPageBounds?: boolean;
    electronicSignatures?: ElectronicSignaturesConfiguration;
    documentEditorFooterItems?: DocumentEditorFooterItem[];
    documentEditorToolbarItems?: DocumentEditorToolbarItem[];
    enableHistory?: boolean;
    onOpenURI?: OnOpenUriCallback;
    dateTimeString?: DateTimeStringCallback;
    annotationToolbarColorPresets?: AnnotationToolbarColorPresetsCallback;
    annotationToolbarItems?: AnnotationToolbarItemsCallback;
    enableClipboardActions?: boolean;
    renderPagePreview?: boolean;
    unstable_inkEraserMode?: IInkEraserMode;
    onWidgetAnnotationCreationStart?: OnWidgetAnnotationCreationStartCallback;
    inlineTextSelectionToolbarItems?: InlineTextSelectionToolbarItemsCallback;
    measurementSnapping?: boolean;
    measurementPrecision?: IMeasurementPrecision;
    measurementScale?: MeasurementScale;
    measurementValueConfiguration?: MeasurementValueConfigurationCallback;
    enableRichText?: EnableRichTextCallback;
    disableMultiSelection?: boolean;
    autoCloseThreshold?: number;
    useIframe?: boolean;
    fontSubstitutions?: FontSubstitution[];
    onCommentCreationStart?: OnCommentCreationStartCallback;
    documentEditorConfiguration?: documentEditorUIConfig;
};
type Instant = {
    public: boolean;
};
type ServerConfiguration = SharedConfiguration & {
    documentId: string;
    authPayload: {
        jwt: string;
    };
    instant: Instant[keyof Instant];
    anonymousComments?: boolean;
    mentionableUsers?: Array<MentionableUser$1>;
    maxMentionSuggestions?: number;
};
type StandaloneConfiguration = SharedConfiguration & {
    document: string | ArrayBuffer;
    baseCoreUrl?: string;
    baseProcessorEngineUrl?: string;
    licenseKey?: string;
    instantJSON?: InstantJSON;
    XFDF?: string;
    XFDFKeepCurrentAnnotations?: boolean;
    XFDFIgnorePageRotation?: boolean;
    disableWebAssemblyStreaming?: boolean;
    disableIndexedDBCaching?: boolean;
    enableAutomaticLinkExtraction?: boolean;
    standaloneInstancesPoolSize?: number;
    overrideMemoryLimit?: number;
    trustedCAsCallback?: TrustedCAsCallback;
    customFonts?: Array<Font>;
    electronAppName?: string;
    appName?: string;
    isSharePoint?: boolean;
    isSalesforce?: boolean;
    productId?: IProductId;
    processorEngine?: IProcessorEngine;
    dynamicFonts?: string;
    inlineWorkers?: boolean;
};
type Configuration = ServerConfiguration | StandaloneConfiguration;

type FormFieldFlags = Array<'readOnly' | 'required' | 'noExport'>;
type FormOptionJSON = {
    label: string;
    value: string;
};
type ExportPDFFlags = {
    flatten?: boolean;
    incremental?: boolean;
    includeComments?: boolean;
    saveForPrinting?: boolean;
    excludeAnnotations?: boolean;
    permissions?: {
        userPassword: string;
        ownerPassword: string;
        documentPermissions: Array<IDocumentPermissions>;
    };
    outputFormat?: boolean | PDFAFlags;
    optimize?: boolean | OptimizationFlags;
    flattenElectronicSignatures?: boolean;
};
type ExportOfficeFlags = {
    format: IDocumentOfficeFormat;
};
type PDFAFlags = {
    conformance?: IConformance;
    vectorization?: boolean;
    rasterization?: boolean;
};
type OptimizationFlags = {
    documentFormat?: 'pdf' | 'pdfa';
    grayscaleText?: boolean;
    grayscaleGraphics?: boolean;
    grayscaleFormFields?: boolean;
    grayscaleAnnotations?: boolean;
    grayscaleImages?: boolean;
    disableImages?: boolean;
    mrcCompression?: boolean;
    imageOptimizationQuality?: 1 | 2 | 3 | 4;
    linearize?: boolean;
};

type FormFieldAdditionalActionsType = {
    onChange?: Action;
    onCalculate?: Action;
};
type FormFieldEventTriggerType = keyof FormFieldAdditionalActionsType;
type FormFieldInputAdditionalActionsType = FormFieldAdditionalActionsType & {
    onInput?: Action;
    onFormat?: Action;
};
type FormFieldInputEventTriggerType = keyof FormFieldInputAdditionalActionsType;
type FormFieldName = string;
interface IFormField {
    id?: ID;
    pdfObjectId?: number | null;
    annotationIds?: List<string>;
    name?: FormFieldName;
    label?: string;
    readOnly?: boolean;
    required?: boolean;
    noExport?: boolean;
    additionalActions?: any;
    group?: string | null;
    isEditable?: boolean;
    isFillable?: boolean;
    isDeletable?: boolean;
    canSetGroup?: boolean;
    [key: string]: any;
}
declare const FormField_base: Record$1.Factory<IFormField>;
declare class FormField extends FormField_base {
    id: ID;
    name: FormFieldName;
    pdfObjectId: number;
    annotationIds: List<string>;
    label: string;
    readOnly: boolean;
    required: boolean;
    noExport: boolean;
    additionalActions: any;
    group?: string | null;
    isEditable?: boolean;
    isFillable?: boolean;
    isDeletable?: boolean;
    canSetGroup?: boolean;
    static defaultValues: IObject$1;
    constructor(args?: IFormField);
}

declare class ButtonFormField extends FormField {
    buttonLabel: string | null;
    static defaultValues: IObject$1;
}

declare const FormOption_base: Record$1.Factory<{
    label: string;
    value: string;
}>;
declare class FormOption extends FormOption_base {
}

declare class CheckBoxFormField extends FormField {
    values: List<string>;
    defaultValues: List<string>;
    options: List<FormOption>;
    optionIndexes?: List<number>;
    static defaultValues: IObject$1;
}

declare class ChoiceFormField extends FormField {
    options: List<FormOption>;
    values: List<string>;
    defaultValues: List<string>;
    multiSelect: boolean;
    commitOnChange: boolean;
    static defaultValues: IObject$1;
}

declare class ComboBoxFormField extends ChoiceFormField {
    edit: boolean;
    doNotSpellCheck: boolean;
    static defaultValues: IObject$1;
}

declare class ListBoxFormField extends ChoiceFormField {
    additionalActions: FormFieldInputAdditionalActionsType | null | undefined;
}

declare class RadioButtonFormField extends FormField {
    noToggleToOff: boolean;
    radiosInUnison: boolean;
    value: string;
    defaultValue: string;
    options: List<FormOption>;
    optionIndexes?: List<number>;
    static defaultValues: IObject$1;
}

declare class TextFormField extends FormField {
    value: string;
    defaultValue: string;
    password: boolean;
    maxLength?: number | null;
    doNotSpellCheck: boolean;
    doNotScroll: boolean;
    multiLine: boolean;
    comb: boolean;
    additionalActions: FormFieldInputAdditionalActionsType | null | undefined;
    static defaultValues: IObject$1;
}

declare class SignatureFormField extends FormField {
}

interface IComparisonOperation {
    type: IComparisonOperationType;
    options?: {
        numberOfContextWords?: number;
    };
}
declare const ComparisonOperation_base: Record$1.Factory<IComparisonOperation>;
declare class ComparisonOperation extends ComparisonOperation_base {
    constructor(type: IComparisonOperationType, options?: {
        numberOfContextWords?: number;
    });
}

interface IDocumentDescriptor {
    filePath?: string | ArrayBuffer;
    password?: string;
    pageIndexes: Array<number | [number, number]>;
    jwt?: string;
}
declare const DocumentDescriptor_base: Record$1.Factory<IDocumentDescriptor>;
declare class DocumentDescriptor extends DocumentDescriptor_base {
    constructor(documentDescriptorOptions: IDocumentDescriptor);
}

type AnnotationPreset = AnnotationPreset$1;
type AnnotationPresetID = AnnotationPresetID$1;

declare class __dangerousImmutableRecordFactory<TProps extends Record<string, unknown>> {
    has(key: unknown): boolean;
    get<K extends keyof TProps>(key: K): TProps[K];
    set<K extends keyof TProps>(key: K, value: TProps[K]): this;
    delete<K extends keyof TProps>(key: K): this;
    clear(): this;
    update<K extends keyof TProps>(key: K, updater: (value: TProps[K]) => TProps[K]): this;
    merge(...collections: Array<Partial<TProps>>): this;
    mergeWith(merger: (previous?: unknown, next?: unknown, key?: string) => unknown, ...collections: Array<Partial<TProps> | Iterable<[string, unknown]>>): this;
    mergeDeep(...collections: Array<Partial<TProps> | Iterable<[string, unknown]>>): this;
    mergeDeepWith(merger: (previous?: unknown, next?: unknown, key?: string) => unknown, ...collections: Array<Partial<TProps> | Iterable<[string, unknown]>>): this;
    setIn(keyPath: Iterable<unknown>, value: unknown): this;
    deleteIn(keyPath: Iterable<unknown>): this;
    removeIn(keyPath: Iterable<unknown>): this;
    updateIn(keyPath: Iterable<unknown>, notSetValue: unknown, updater: (value: unknown) => unknown): this;
    updateIn(keyPath: Iterable<unknown>, updater: (value: unknown) => unknown): this;
    mergeIn(keyPath: Iterable<unknown>, ...collections: Array<Partial<TProps> | Iterable<[string, unknown]>>): this;
    mergeDeepIn(keyPath: Iterable<unknown>, ...collections: Array<Partial<TProps> | Iterable<[string, unknown]>>): this;
    withMutations(mutator: (mutable: this) => unknown): this;
    asMutable(): this;
    asImmutable(): this;
    getIn(keyPath: Iterable<unknown>, notSetValue?: unknown): unknown;
    toJS(): TProps;
    toJSON(): TProps;
    equals(other: unknown): boolean;
    toSeq(): Seq.Keyed<string, unknown>;
}
declare const InheritableImmutableRecord_base: any;
declare class InheritableImmutableRecord<T extends Record<string, unknown>> extends InheritableImmutableRecord_base {
    constructor(values?: Partial<T> | Iterable<[string, unknown]>);
}
interface InheritableImmutableRecord<T extends Record<string, unknown>> extends __dangerousImmutableRecordFactory<T> {
}

type ID = string;
type AnnotationProperties = {
    id: string | null;
    name: string | null;
    subject: string | null;
    pdfObjectId: number | null;
    pageIndex: number | null;
    boundingBox: Rect | null;
    opacity: number | null;
    note: string | null;
    creatorName: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    customData: Record<string, unknown> | null;
    noView: boolean | null;
    noPrint: boolean | null;
    locked: boolean | null;
    lockedContents: boolean | null;
    readOnly: boolean | null;
    hidden: boolean | null;
    group: string | null | undefined;
    isEditable: boolean | undefined;
    isDeletable: boolean | undefined;
    canSetGroup: boolean | undefined;
    canReply: boolean | undefined;
    rotation: number;
    additionalActions: any;
    noZoom: boolean;
    noRotate: boolean;
    isCommentThreadRoot: boolean;
    isAnonymous: boolean;
    APStreamCache: {
        cache: string;
    } | {
        attach: string;
    } | undefined;
    blendMode: IBlendMode;
    action: any;
    [key: string]: unknown;
};
declare class Annotation<T extends AnnotationProperties = AnnotationProperties> extends InheritableImmutableRecord<T> {
    id: ID;
    name: null | string;
    subject: null | string;
    pdfObjectId: null | number;
    pageIndex: number;
    boundingBox: Rect;
    opacity: number;
    note: null | string;
    creatorName: null | string;
    createdAt: Date;
    updatedAt: Date;
    noView: boolean;
    noPrint: boolean;
    locked: boolean;
    lockedContents: boolean;
    readOnly: boolean;
    hidden: boolean;
    customData: null | Record<string, unknown>;
    noZoom: boolean;
    noRotate: boolean;
    additionalActions: any;
    rotation: number;
    blendMode: IBlendMode;
    isCommentThreadRoot: boolean;
    isAnonymous: boolean;
    group?: string | null;
    isEditable?: boolean;
    isDeletable?: boolean;
    canSetGroup?: boolean;
    canReply?: boolean;
    APStreamCache?: {
        cache: string;
    } | {
        attach: string;
    };
    action: any;
    static defaultValues: IObject$1;
    constructor(record?: Partial<T>);
}

type StampKind = 'Approved' | 'NotApproved' | 'Draft' | 'Final' | 'Completed' | 'Confidential' | 'ForPublicRelease' | 'NotForPublicRelease' | 'ForComment' | 'Void' | 'PreliminaryResults' | 'InformationOnly' | 'Rejected' | 'Accepted' | 'InitialHere' | 'SignHere' | 'Witness' | 'AsIs' | 'Departmental' | 'Experimental' | 'Expired' | 'Sold' | 'TopSecret' | 'Revised' | 'RejectedWithText' | 'Custom';
interface IStampAnnotation extends AnnotationProperties {
    stampType: string | StampKind | null;
    title: string | null;
    subtitle: string | null;
    color: Color$2 | null;
    xfdfAppearanceStream: string | null;
    xfdfAppearanceStreamOriginalPageRotation: number | null;
}
declare class StampAnnotation<T extends IStampAnnotation = IStampAnnotation> extends Annotation<T> {
    stampType: StampKind;
    title: null | string;
    subtitle: null | string;
    color: null | Color$2;
    xfdfAppearanceStream: null | string;
    xfdfAppearanceStreamOriginalPageRotation: null | number;
    static defaultValues: IObject$1;
    static readableName: string;
}

declare function preloadWorker(configuration: StandaloneConfiguration): Promise<void>;
declare function load(configuration: Configuration): Promise<Instance>;
declare function convertToPDF(configuration: StandaloneConfiguration, conformance?: IConformance): Promise<ArrayBuffer>;
declare function convertToOffice(configuration: StandaloneConfiguration, format: IDocumentOfficeFormat): Promise<ArrayBuffer>;
declare function populateDocumentTemplate(configuration: StandaloneConfiguration, templateData: TemplateDataToPopulateDocument): Promise<ArrayBuffer>;

declare function serializeAnnotation(annotation: InkAnnotation): AnnotationBackendJSON<InkAnnotationJSON>;
declare function serializeAnnotation(annotation: LineAnnotation): AnnotationBackendJSON<LineAnnotationJSON>;
declare function serializeAnnotation(annotation: RectangleAnnotation): AnnotationBackendJSON<RectangleAnnotationJSON>;
declare function serializeAnnotation(annotation: EllipseAnnotation): AnnotationBackendJSON<EllipseAnnotationJSON>;
declare function serializeAnnotation(annotation: PolygonAnnotation): AnnotationBackendJSON<PolygonAnnotationJSON>;
declare function serializeAnnotation(annotation: PolylineAnnotation): AnnotationBackendJSON<PolylineAnnotationJSON>;
declare function serializeAnnotation(annotation: TextAnnotation): AnnotationBackendJSON<TextAnnotationJSON>;
declare function serializeAnnotation(annotation: NoteAnnotation): AnnotationBackendJSON<NoteAnnotationJSON>;
declare function serializeAnnotation(annotation: StampAnnotation): AnnotationBackendJSON<StampAnnotationJSON, 'color'>;
declare function serializeAnnotation(annotation: ImageAnnotation): AnnotationBackendJSON<ImageAnnotationJSON>;
declare function serializeAnnotation(annotation: MediaAnnotation): AnnotationBackendJSON<MediaAnnotationJSON>;
declare function serializeAnnotation(annotation: LinkAnnotation): AnnotationBackendJSON<LinkAnnotationJSON>;
declare function serializeAnnotation(annotation: WidgetAnnotation): AnnotationBackendJSON<WidgetAnnotationJSON>;
declare function serializeAnnotation(annotation: TextMarkupAnnotation): AnnotationBackendJSON<TextMarkupAnnotationJSON>;
declare function serializeAnnotation(annotation: RedactionAnnotation): AnnotationBackendJSON<RedactionAnnotationJSON>;
declare function serializeAnnotation(annotation: CommentMarkerAnnotation): AnnotationBackendJSON<CommentMarkerAnnotationJSON>;
declare function serializeAnnotation(annotation: UnknownAnnotation): AnnotationBackendJSON<UnknownAnnotationJSON>;
declare function serializeAnnotation(annotation: AnnotationsUnion): AnnotationsBackendJSONUnion;
declare function serializeFormField(formField: FormField): FormFieldJSON;
declare function serializePreset(preset: AnnotationPreset$1): Record<string, any>;
declare function unserializePreset(presetJSON: Record<string, any>): AnnotationPreset$1;

type TargetType = string | HTMLElement | Instance | null;
declare function unload(target: TargetType): boolean;

declare function viewStateFromOpenParameters(viewState: ViewState, hash?: string | null | undefined): ViewState;

type RotatableAnnotation = TextAnnotation | StampAnnotation;

declare const PSPDFKit: {
    UI: {
        Core: typeof Core;
        createBlock: typeof createBlock;
        Recipes: {
            readonly SignaturesList: React.ForwardRefExoticComponent<SignaturesListProps & React.RefAttributes<HTMLDivElement>>;
            readonly CreateSignature: React.ForwardRefExoticComponent<CreateSignatureProps & React.RefAttributes<HTMLDivElement>>;
            readonly StampsList: React.ForwardRefExoticComponent<StampsListProps & React.RefAttributes<HTMLDivElement>>;
            readonly CreateStamp: React.ForwardRefExoticComponent<CreateStampProps & React.RefAttributes<HTMLDivElement>>;
        };
        Interfaces: InterfacesType;
    };
    Immutable: {
        List: typeof List;
    };
    version: string;
    Geometry: {
        Point: typeof Point;
        DrawingPoint: typeof DrawingPoint;
        Rect: typeof Rect;
        Size: typeof Size;
        Inset: typeof Inset;
    };
    Actions: {
        Action: typeof Action;
        GoToAction: typeof GoToAction;
        GoToEmbeddedAction: typeof GoToEmbeddedAction;
        GoToRemoteAction: typeof GoToRemoteAction;
        HideAction: typeof HideAction;
        JavaScriptAction: typeof JavaScriptAction;
        LaunchAction: typeof LaunchAction;
        NamedAction: typeof NamedAction;
        ResetFormAction: typeof ResetFormAction;
        SubmitFormAction: typeof SubmitFormAction;
        URIAction: typeof URIAction;
    };
    Annotations: {
        Annotation: typeof Annotation;
        CommentMarkerAnnotation: typeof CommentMarkerAnnotation;
        HighlightAnnotation: typeof HighlightAnnotation;
        InkAnnotation: typeof InkAnnotation;
        ShapeAnnotation: typeof ShapeAnnotation;
        LineAnnotation: typeof LineAnnotation;
        RectangleAnnotation: typeof RectangleAnnotation;
        EllipseAnnotation: typeof EllipseAnnotation;
        PolygonAnnotation: typeof PolygonAnnotation;
        PolylineAnnotation: typeof PolylineAnnotation;
        LinkAnnotation: typeof LinkAnnotation;
        NoteAnnotation: typeof NoteAnnotation;
        MarkupAnnotation: typeof TextMarkupAnnotation;
        RedactionAnnotation: typeof RedactionAnnotation;
        SquiggleAnnotation: typeof SquiggleAnnotation;
        StampAnnotation: typeof StampAnnotation;
        StrikeOutAnnotation: typeof StrikeOutAnnotation;
        TextAnnotation: typeof TextAnnotation;
        UnderlineAnnotation: typeof UnderlineAnnotation;
        ImageAnnotation: typeof ImageAnnotation;
        UnknownAnnotation: typeof UnknownAnnotation;
        WidgetAnnotation: typeof WidgetAnnotation;
        MediaAnnotation: typeof MediaAnnotation;
        toSerializableObject: typeof serializeAnnotation;
        fromSerializableObject: <K extends AnnotationJSONUnion>(annotation: K) => AnnotationJSONToAnnotation<K>;
        rotate: (annotation: RotatableAnnotation, rotation: number, contentSize?: Size) => RotatableAnnotation;
    };
    AnnotationPresets: {
        toSerializableObject: typeof serializePreset;
        fromSerializableObject: typeof unserializePreset;
    };
    Comment: typeof Comment;
    Bookmark: typeof Bookmark;
    CustomOverlayItem: typeof CustomOverlayItem;
    OutlineElement: typeof OutlineElement;
    FormFields: {
        FormField: typeof FormField;
        ButtonFormField: typeof ButtonFormField;
        CheckBoxFormField: typeof CheckBoxFormField;
        ChoiceFormField: typeof ChoiceFormField;
        ComboBoxFormField: typeof ComboBoxFormField;
        ListBoxFormField: typeof ListBoxFormField;
        RadioButtonFormField: typeof RadioButtonFormField;
        TextFormField: typeof TextFormField;
        SignatureFormField: typeof SignatureFormField;
        toSerializableObject: typeof serializeFormField;
        fromSerializableObject: (formField: FormFieldJSON) => FormField;
    };
    FormFieldValue: typeof FormFieldValue;
    FormOption: typeof FormOption;
    Callout: typeof Callout;
    Color: typeof Color$2;
    Instance: typeof Instance;
    preloadWorker: typeof preloadWorker;
    load: typeof load;
    unload: typeof unload;
    convertToOffice: typeof convertToOffice;
    convertToPDF: typeof convertToPDF;
    populateDocumentTemplate: typeof populateDocumentTemplate;
    Error: any;
    SaveError: typeof PSPDFKitSaveError;
    ViewState: typeof ViewState;
    PageInfo: typeof PageInfo;
    TextLine: typeof TextLine;
    InstantClient: typeof InstantClient;
    TextSelection: typeof PublicTextSelection;
    SearchResult: typeof SearchResult;
    SearchState: typeof SearchState;
    AutoSaveMode: {
        readonly IMMEDIATE: "IMMEDIATE";
        readonly INTELLIGENT: "INTELLIGENT";
        readonly DISABLED: "DISABLED";
    };
    SignatureSaveMode: {
        readonly ALWAYS: "ALWAYS";
        readonly NEVER: "NEVER";
        readonly USING_UI: "USING_UI";
    };
    LayoutMode: {
        readonly SINGLE: "SINGLE";
        readonly DOUBLE: "DOUBLE";
        readonly AUTO: "AUTO";
    };
    PrintMode: {
        readonly DOM: "DOM";
        readonly EXPORT_PDF: "EXPORT_PDF";
    };
    PrintQuality: {
        readonly LOW: "LOW";
        readonly MEDIUM: "MEDIUM";
        readonly HIGH: "HIGH";
    };
    ScrollMode: {
        readonly CONTINUOUS: "CONTINUOUS";
        readonly PER_SPREAD: "PER_SPREAD";
        readonly DISABLED: "DISABLED";
    };
    ZoomMode: {
        readonly AUTO: "AUTO";
        readonly FIT_TO_WIDTH: "FIT_TO_WIDTH";
        readonly FIT_TO_VIEWPORT: "FIT_TO_VIEWPORT";
        readonly CUSTOM: "CUSTOM";
    };
    InteractionMode: {
        readonly TEXT_HIGHLIGHTER: "TEXT_HIGHLIGHTER";
        readonly INK: "INK";
        readonly INK_SIGNATURE: "INK_SIGNATURE";
        readonly SIGNATURE: "SIGNATURE";
        readonly STAMP_PICKER: "STAMP_PICKER";
        readonly STAMP_CUSTOM: "STAMP_CUSTOM";
        readonly SHAPE_LINE: "SHAPE_LINE";
        readonly SHAPE_RECTANGLE: "SHAPE_RECTANGLE";
        readonly SHAPE_ELLIPSE: "SHAPE_ELLIPSE";
        readonly SHAPE_POLYGON: "SHAPE_POLYGON";
        readonly SHAPE_POLYLINE: "SHAPE_POLYLINE";
        readonly INK_ERASER: "INK_ERASER";
        readonly NOTE: "NOTE";
        readonly COMMENT_MARKER: "COMMENT_MARKER";
        readonly TEXT: "TEXT";
        readonly CALLOUT: "CALLOUT";
        readonly PAN: "PAN";
        readonly SEARCH: "SEARCH";
        readonly DOCUMENT_EDITOR: "DOCUMENT_EDITOR";
        readonly MARQUEE_ZOOM: "MARQUEE_ZOOM";
        readonly REDACT_TEXT_HIGHLIGHTER: "REDACT_TEXT_HIGHLIGHTER";
        readonly REDACT_SHAPE_RECTANGLE: "REDACT_SHAPE_RECTANGLE";
        readonly DOCUMENT_CROP: "DOCUMENT_CROP";
        readonly BUTTON_WIDGET: "BUTTON_WIDGET";
        readonly TEXT_WIDGET: "TEXT_WIDGET";
        readonly RADIO_BUTTON_WIDGET: "RADIO_BUTTON_WIDGET";
        readonly CHECKBOX_WIDGET: "CHECKBOX_WIDGET";
        readonly COMBO_BOX_WIDGET: "COMBO_BOX_WIDGET";
        readonly LIST_BOX_WIDGET: "LIST_BOX_WIDGET";
        readonly SIGNATURE_WIDGET: "SIGNATURE_WIDGET";
        readonly DATE_WIDGET: "DATE_WIDGET";
        readonly FORM_CREATOR: "FORM_CREATOR";
        readonly LINK: "LINK";
        readonly DISTANCE: "DISTANCE";
        readonly PERIMETER: "PERIMETER";
        readonly RECTANGLE_AREA: "RECTANGLE_AREA";
        readonly ELLIPSE_AREA: "ELLIPSE_AREA";
        readonly POLYGON_AREA: "POLYGON_AREA";
        readonly CONTENT_EDITOR: "CONTENT_EDITOR";
        readonly MULTI_ANNOTATIONS_SELECTION: "MULTI_ANNOTATIONS_SELECTION";
        readonly MEASUREMENT: "MEASUREMENT";
        readonly MEASUREMENT_SETTINGS: "MEASUREMENT_SETTINGS";
    };
    unstable_InkEraserMode: {
        readonly POINT: "POINT";
        readonly STROKE: "STROKE";
    };
    SidebarMode: {
        readonly ANNOTATIONS: "ANNOTATIONS";
        readonly BOOKMARKS: "BOOKMARKS";
        readonly DOCUMENT_OUTLINE: "DOCUMENT_OUTLINE";
        readonly THUMBNAILS: "THUMBNAILS";
        readonly SIGNATURES: "SIGNATURES";
        readonly LAYERS: "LAYERS";
        readonly CUSTOM: "CUSTOM";
    };
    UIElement: {
        readonly Sidebar: "Sidebar";
    };
    Alignment: {
        readonly START: "START";
        readonly END: "END";
    };
    BlendMode: {
        readonly normal: "normal";
        readonly multiply: "multiply";
        readonly screen: "screen";
        readonly overlay: "overlay";
        readonly darken: "darken";
        readonly lighten: "lighten";
        readonly colorDodge: "colorDodge";
        readonly colorBurn: "colorBurn";
        readonly hardLight: "hardLight";
        readonly softLight: "softLight";
        readonly difference: "difference";
        readonly exclusion: "exclusion";
    };
    BorderStyle: {
        readonly solid: "solid";
        readonly dashed: "dashed";
        readonly beveled: "beveled";
        readonly inset: "inset";
        readonly underline: "underline";
    };
    LineCap: {
        readonly square: "square";
        readonly circle: "circle";
        readonly diamond: "diamond";
        readonly openArrow: "openArrow";
        readonly closedArrow: "closedArrow";
        readonly butt: "butt";
        readonly reverseOpenArrow: "reverseOpenArrow";
        readonly reverseClosedArrow: "reverseClosedArrow";
        readonly slash: "slash";
    };
    SidebarPlacement: {
        readonly START: "START";
        readonly END: "END";
    };
    SignatureAppearanceMode: {
        readonly signatureOnly: "signatureOnly";
        readonly signatureAndDescription: "signatureAndDescription";
        readonly descriptionOnly: "descriptionOnly";
    };
    ShowSignatureValidationStatusMode: {
        readonly IF_SIGNED: "IF_SIGNED";
        readonly HAS_WARNINGS: "HAS_WARNINGS";
        readonly HAS_ERRORS: "HAS_ERRORS";
        readonly NEVER: "NEVER";
    };
    NoteIcon: {
        readonly COMMENT: "COMMENT";
        readonly RIGHT_POINTER: "RIGHT_POINTER";
        readonly RIGHT_ARROW: "RIGHT_ARROW";
        readonly CHECK: "CHECK";
        readonly CIRCLE: "CIRCLE";
        readonly CROSS: "CROSS";
        readonly INSERT: "INSERT";
        readonly NEW_PARAGRAPH: "NEW_PARAGRAPH";
        readonly NOTE: "NOTE";
        readonly PARAGRAPH: "PARAGRAPH";
        readonly HELP: "HELP";
        readonly STAR: "STAR";
        readonly KEY: "KEY";
    };
    Theme: {
        readonly LIGHT: "LIGHT";
        readonly DARK: "DARK";
        readonly AUTO: "AUTO";
    };
    ToolbarPlacement: {
        readonly TOP: "TOP";
        readonly BOTTOM: "BOTTOM";
    };
    ElectronicSignatureCreationMode: {
        readonly DRAW: "DRAW";
        readonly IMAGE: "IMAGE";
        readonly TYPE: "TYPE";
    };
    I18n: {
        locales: any;
        messages: {};
        preloadLocalizationData: (locale: string, options?: {
            baseUrl?: string | undefined;
        }) => Promise<void>;
    };
    baseUrl: string | undefined;
    DocumentIntegrityStatus: {
        readonly ok: "ok";
        readonly tampered_document: "tampered_document";
        readonly failed_to_retrieve_signature_contents: "failed_to_retrieve_signature_contents";
        readonly failed_to_retrieve_byterange: "failed_to_retrieve_byterange";
        readonly failed_to_compute_digest: "failed_to_compute_digest";
        readonly failed_retrieve_signing_certificate: "failed_retrieve_signing_certificate";
        readonly failed_retrieve_public_key: "failed_retrieve_public_key";
        readonly failed_encryption_padding: "failed_encryption_padding";
        readonly tampered_or_invalid_timestamp: "tampered_or_invalid_timestamp";
        readonly general_failure: "general_failure";
    };
    SignatureValidationStatus: {
        readonly valid: "valid";
        readonly warning: "warning";
        readonly error: "error";
    };
    SignatureType: {
        CMS: string;
        CAdES: string;
    };
    SignatureContainerType: {
        raw: string;
        pkcs7: string;
    };
    PAdESLevel: {
        readonly b_b: "b-b";
        readonly b_t: "b-t";
        readonly b_lt: "b-lt";
    };
    CertificateChainValidationStatus: {
        readonly ok: "ok";
        readonly ok_but_self_signed: "ok_but_self_signed";
        readonly ok_but_could_not_check_revocation: "ok_but_could_not_check_revocation";
        readonly untrusted: "untrusted";
        readonly expired: "expired";
        readonly not_yet_valid: "not_yet_valid";
        readonly invalid: "invalid";
        readonly revoked: "revoked";
        readonly failed_to_retrieve_signature_contents: "failed_to_retrieve_signature_contents";
        readonly general_validation_problem: "general_validation_problem";
    };
    AnnotationsWillChangeReason: typeof AnnotationsWillChangeReason;
    DocumentComparisonSourceType: {
        readonly USE_OPEN_DOCUMENT: "USE_OPEN_DOCUMENT";
        readonly USE_FILE_DIALOG: "USE_FILE_DIALOG";
    };
    MeasurementScaleUnitFrom: {
        readonly INCHES: "in";
        readonly MILLIMETERS: "mm";
        readonly CENTIMETERS: "cm";
        readonly POINTS: "pt";
    };
    MeasurementScaleUnitTo: {
        readonly INCHES: "in";
        readonly MILLIMETERS: "mm";
        readonly CENTIMETERS: "cm";
        readonly POINTS: "pt";
        readonly FEET: "ft";
        readonly METERS: "m";
        readonly YARDS: "yd";
        readonly KILOMETERS: "km";
        readonly MILES: "mi";
    };
    MeasurementPrecision: {
        readonly WHOLE: "whole";
        readonly ONE: "oneDp";
        readonly TWO: "twoDp";
        readonly THREE: "threeDp";
        readonly FOUR: "fourDp";
        readonly HALVES: "1/2";
        readonly QUARTERS: "1/4";
        readonly EIGHTHS: "1/8";
        readonly SIXTEENTHS: "1/16";
    };
    MeasurementScale: typeof MeasurementScale;
    ProductId: {
        SharePoint: string;
        Salesforce: string;
        Maui_Android: string;
        Maui_iOS: string;
        Maui_MacCatalyst: string;
        Maui_Windows: string;
        FlutterForWeb: string;
        Electron: string;
    };
    ProcessorEngine: {
        smallerSize: string;
        fasterProcessing: string;
    };
    Conformance: {
        readonly PDFA_1A: "pdfa-1a";
        readonly PDFA_1B: "pdfa-1b";
        readonly PDFA_2A: "pdfa-2a";
        readonly PDFA_2U: "pdfa-2u";
        readonly PDFA_2B: "pdfa-2b";
        readonly PDFA_3A: "pdfa-3a";
        readonly PDFA_3U: "pdfa-3u";
        readonly PDFA_3B: "pdfa-3b";
        readonly PDFA_4: "pdfa-4";
        readonly PDFA_4E: "pdfa-4e";
        readonly PDFA_4F: "pdfa-4f";
    };
    DocumentPermissions: {
        readonly annotationsAndForms: "annotationsAndForms";
        readonly assemble: "assemble";
        readonly extract: "extract";
        readonly extractAccessibility: "extractAccessibility";
        readonly fillForms: "fillForms";
        readonly modification: "modification";
        readonly printHighQuality: "printHighQuality";
        readonly printing: "printing";
    };
    ComparisonOperation: typeof ComparisonOperation;
    DocumentDescriptor: typeof DocumentDescriptor;
    ComparisonOperationType: {
        readonly TEXT: "text";
    };
    OfficeDocumentFormat: {
        docx: string;
        xlsx: string;
        pptx: string;
    };
    viewStateFromOpenParameters: typeof viewStateFromOpenParameters;
    readonly defaultElectronicSignatureColorPresets: ColorPreset[];
    readonly defaultToolbarItems: readonly [{
        readonly type: "sidebar-thumbnails";
    }, {
        readonly type: "sidebar-document-outline";
    }, {
        readonly type: "sidebar-annotations";
    }, {
        readonly type: "sidebar-bookmarks";
    }, {
        readonly type: "sidebar-signatures";
    }, {
        readonly type: "sidebar-layers";
    }, {
        readonly type: "pager";
    }, {
        readonly type: "multi-annotations-selection";
    }, {
        readonly type: "pan";
    }, {
        readonly type: "zoom-out";
    }, {
        readonly type: "zoom-in";
    }, {
        readonly type: "zoom-mode";
    }, {
        readonly type: "spacer";
    }, {
        readonly type: "annotate";
    }, {
        readonly type: "ink";
    }, {
        readonly type: "highlighter";
    }, {
        readonly type: "text-highlighter";
    }, {
        readonly type: "ink-eraser";
    }, {
        readonly type: "signature";
    }, {
        readonly type: "image";
    }, {
        readonly type: "stamp";
    }, {
        readonly type: "note";
    }, {
        readonly type: "text";
    }, {
        readonly type: "callout";
    }, {
        readonly type: "line";
    }, {
        readonly type: "link";
    }, {
        readonly type: "arrow";
    }, {
        readonly type: "rectangle";
    }, {
        readonly type: "ellipse";
    }, {
        readonly type: "polygon";
    }, {
        readonly type: "cloudy-polygon";
    }, {
        readonly type: "polyline";
    }, {
        readonly type: "print";
    }, {
        readonly type: "document-editor";
    }, {
        readonly type: "document-crop";
    }, {
        readonly type: "search";
    }, {
        readonly type: "export-pdf";
    }, {
        readonly type: "debug";
    }];
    readonly defaultDocumentEditorFooterItems: {
        type: BuiltInDocumentEditorFooterItem;
    }[];
    readonly defaultDocumentEditorToolbarItems: {
        type: BuiltInDocumentEditorToolbarItem;
    }[];
    readonly defaultAnnotationPresets: {
        [key: string]: Record<string, unknown>;
    };
    readonly defaultStampAnnotationTemplates: StampAnnotation<IStampAnnotation>[];
    readonly defaultAnnotationsSidebarContent: readonly [typeof EllipseAnnotation, typeof HighlightAnnotation, typeof ImageAnnotation, typeof InkAnnotation, typeof LineAnnotation, typeof NoteAnnotation, typeof PolygonAnnotation, typeof PolylineAnnotation, typeof RectangleAnnotation, typeof SquiggleAnnotation, typeof StampAnnotation, typeof StrikeOutAnnotation, typeof TextAnnotation, typeof UnderlineAnnotation, typeof WidgetAnnotation];
    defaultEditableAnnotationTypes: readonly (typeof TextAnnotation | typeof CommentMarkerAnnotation)[];
    defaultElectronicSignatureCreationModes: readonly ("DRAW" | "IMAGE" | "TYPE")[];
    defaultSigningFonts: readonly Font[];
    Options: {
        MIN_TEXT_ANNOTATION_SIZE: number;
        MIN_INK_ANNOTATION_SIZE: number;
        MIN_SHAPE_ANNOTATION_SIZE: number;
        MIN_IMAGE_ANNOTATION_SIZE: number;
        MIN_STAMP_ANNOTATION_SIZE: number;
        MIN_WIDGET_ANNOTATION_SIZE: number;
        ENABLE_INK_SMOOTH_LINES: boolean;
        INK_EPSILON_RANGE_OPTIMIZATION: number;
        SIGNATURE_SAVE_MODE: ISignatureSaveMode;
        INITIAL_DESKTOP_SIDEBAR_WIDTH: number;
        IGNORE_DOCUMENT_PERMISSIONS: boolean;
        SELECTION_OUTLINE_PADDING: (viewportSize: Size) => number;
        RESIZE_ANCHOR_RADIUS: (viewportSize: Size) => number;
        SELECTION_STROKE_WIDTH: number;
        TEXT_ANNOTATION_AUTOFIT_TEXT_ON_EXPORT: boolean;
        TEXT_ANNOTATION_AUTOFIT_BOUNDING_BOX_ON_EDIT: boolean;
        DISABLE_KEYBOARD_SHORTCUTS: boolean;
        DEFAULT_INK_ERASER_CURSOR_WIDTH: number;
        COLOR_PRESETS: ColorPreset[];
        LINE_CAP_PRESETS: string[];
        LINE_WIDTH_PRESETS: number[] | null | undefined;
        HIGHLIGHT_COLOR_PRESETS: ColorPreset[];
        TEXT_MARKUP_COLOR_PRESETS: ColorPreset[];
        NOTE_COLOR_PRESETS: ColorPreset[];
        PDF_JAVASCRIPT: boolean;
        BREAKPOINT_MD_TOOLBAR: number;
        BREAKPOINT_SM_TOOLBAR: number;
    };
    SearchPattern: {
        readonly CREDIT_CARD_NUMBER: "credit_card_number";
        readonly DATE: "date";
        readonly TIME: "time";
        readonly EMAIL_ADDRESS: "email_address";
        readonly INTERNATIONAL_PHONE_NUMBER: "international_phone_number";
        readonly IP_V4: "ipv4";
        readonly IP_V6: "ipv6";
        readonly MAC_ADDRESS: "mac_address";
        readonly NORTH_AMERICAN_PHONE_NUMBER: "north_american_phone_number";
        readonly SOCIAL_SECURITY_NUMBER: "social_security_number";
        readonly URL: "url";
        readonly US_ZIP_CODE: "us_zip_code";
        readonly VIN: "vin";
    };
    SearchType: {
        readonly TEXT: "text";
        readonly PRESET: "preset";
        readonly REGEX: "regex";
    };
    UIDateTimeElement: {
        readonly COMMENT_THREAD: "COMMENT_THREAD";
        readonly ANNOTATIONS_SIDEBAR: "ANNOTATIONS_SIDEBAR";
    };
    generateInstantId: typeof generateInstantId;
    Font: typeof Font;
};

export { Action, Annotation, type AnnotationToolbarItem, type AnnotationsUnion, AnnotationsWillChangeReason, Bookmark, ButtonFormField, CheckBoxFormField, ChoiceFormField, Color$2 as Color, ComboBoxFormField, Comment, CommentMarkerAnnotation, type Configuration, Conformance, CustomOverlayItem, type DocumentEditorFooterItem, type DocumentEditorToolbarItem, DrawingPoint, EllipseAnnotation, type EllipseAnnotationJSON, Font, FormField, FormFieldValue, FormOption, GoToAction, GoToEmbeddedAction, GoToRemoteAction, HideAction, HighlightAnnotation, ImageAnnotation, type ImageAnnotationJSON, InkAnnotation, type InkAnnotationJSON, Inset, Instance, InstantClient, Interfaces, JavaScriptAction, LaunchAction, LineAnnotation, type LineAnnotationJSON, LinkAnnotation, List, ListBoxFormField, type MentionableUser$1 as MentionableUser, NamedAction, NoteAnnotation, type NoteAnnotationJSON, OutlineElement, PageInfo, Point, PolygonAnnotation, type PolygonAnnotationJSON, PolylineAnnotation, type PolylineAnnotationJSON, RadioButtonFormField, Rect, RectangleAnnotation, type RectangleAnnotationJSON, RedactionAnnotation, type RedactionAnnotationJSON, ResetFormAction, SearchResult, SearchState, type ServerConfiguration, ShapeAnnotation, type ShapeAnnotationsUnion, SignatureFormField, Size, SquiggleAnnotation, StampAnnotation, type StampAnnotationJSON, type StandaloneConfiguration, StrikeOutAnnotation, SubmitFormAction, type TemplateDataToPopulateDocument, TextAnnotation, type TextAnnotationJSON, TextFormField, TextLine, TextMarkupAnnotation, type TextMarkupAnnotationJSON, type TextMarkupAnnotationsUnion, PublicTextSelection as TextSelection, type ToolbarItem, URIAction, UnderlineAnnotation, UnknownAnnotation, type UnknownAnnotationJSON, ViewState, WidgetAnnotation, type WidgetAnnotationJSON, PSPDFKit as default };
