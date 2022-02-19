---
title: API
description: Description of all of Solid's API
sort: 0
---

# Basic Reactivity

Solid's overall approach to reactivity is to wrap any reactive computation in
a function, and rerun that function when its dependencies update.
The Solid JSX compiler also wraps most JSX expressions (code in braces) with a
function, so they automatically update (and trigger corresponding DOM updates)
when their dependencies change.
More precisely, automatic rerunning of a function happens whenever the function
gets called in a *tracking scope*, such as a JSX expression
or API calls that build "computations" (`createEffect`, `createMemo`, etc.).
By default, the dependencies of a function get tracked automatically
when they're called in a tracking scope, by detecting when the function reads
reactive state (e.g., via a Signal getter or Store attribute).
As a result, you generally don't need to worry about dependencies yourselves.
(But if automatic dependency tracking ever doesn't produce the results you
want, you can also [override dependency tracking](#reactive-utilities).)
This approach makes reactivity *composable*: calling one function
within another function generally causes the calling function
to inherit the dependencies of the called function.

## `createSignal`

```ts
export function createSignal<T>(
  initialValue: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Signals are the most basic reactive primitive.  They track a single value
(which can be any JavaScript object) that changes over time.
The Signal's value starts out equal to the passed first argument
`initialValue` (or `undefined` if there are no arguments).
The `createSignal` function returns a pair of functions as a two-element array:
a *getter* (or *accessor*) and a *setter*.  In typical use, you would
destructure this array into a named Signal like so:

```js
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);
```

Calling the getter (e.g., `count()` or `ready()`)
returns the current value of the Signal.
Crucial to automatic dependency tracking, calling the getter
within a tracking scope causes the calling function to depends on this Signal,
so that function will rerun if the Signal gets updated.

Calling the setter (e.g., `setCount(nextCount)` or `setReady(nextReady)`)
sets the Signal's value and *updates* the Signal
(triggering dependents to rerun)
if the value actually changed (see details below).
As its only argument, the setter takes either the new value for the signal,
or a function that maps the last value of the signal to a new value.
The setter also returns the updated value.  For example:

```js
// read signal's current value, and
// depend on signal if in a tracking scope
// (but nonreactive outside of a tracking scope):
const currentCount = count();

// or wrap any computation with a function,
// and this function can be used in a tracking scope:
const doubledCount = () => 2 * count();

// or build a tracking scope and depend on signal:
const countDisplay = <div>{count()}</div>;

// write signal by providing a value:
setReady(true);

// write signal by providing a function setter:
const newCount = setCount((prev) => prev + 1);
```

> If you want to store a function in a Signal you must use the function form:
>
> ```js
> setValue(() => myFunction);
> ```
>
> However, functions are not treated specially as the `initialValue` argument
> to `createSignal`, so you should pass a function initial value as is:
>
> ```js
> const [func, setFunc] = createSignal(myFunction);
> ```

Unless you're in a [batch](#batch), [effect](#createEffect), or
[transition](#use-transition), signals update immediately when you set them.
For example:

```js
setReady(false);
console.assert(ready() === false);
setReady(true);
console.assert(ready() === true);
```

If you're not sure whether your code will be run in a batch or transition
(e.g., library code), you should avoid making this assumption.

##### Options

Several primitives in Solid take an "options" object
as an optional last argument.
`createSignal`'s options object allows you to provide an
`equals` option.  For example:

```js
const [getValue, setValue] = createSignal(initialValue,
  { equals: false });
```

By default, when calling a signal's setter, the signal only updates (and causes
dependents to rerun) if the new value is actually different than the old value,
according to JavaScript's `===` operator.

Alternatively, you can set `equals` to `false` to always rerun dependents after
the setter is called, or you can pass your own function for testing equality.
Some examples:

```js
// use { equals: false } to allow modifying object in-place;
// normally this wouldn't be seen as an update because the
// object has the same identity before and after change
const [object, setObject] = createSignal(
  { count: 0 }, { equals: false });
setObject((current) => {
  current.count += 1;
  current.updated = new Date;
  return current;
});

// use { equals: false } signal as trigger without value:
const [depend, rerun] = createSignal(undefined,
  { equals: false });
// now calling depend() in a tracking scope
// makes that scope rerun whenever rerun() gets called

// define equality based on string length:
const [myString, setMyString] = createSignal("string", {
  equals: (newVal, oldVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // considered equal to the last value and won't cause updates
setMyString("stranger"); // considered different and will cause updates
```

## `createEffect`

```ts
export function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Effects are a general way to make arbitrary code run whenever dependencies
change.  `createEffect` creates a new computation that runs the given function
in a tracking scope, thus automatically tracking its dependencies,
and automatically reruns the function whenever the dependencies update.
For example:

```js
const [a, setA] = createSignal(initialValue);

// effect that depends on signal `a`
createEffect(() => doSideEffect(a()));
```

The effect function gets called with an argument equal to the value returned
from the effect function's last execution, or on the first call,
equal to the optional second argument to `createEffect`.
This allows you to compute diffs without creating an additional closure
to remember the last computed value.  For example:

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev)
    console.log('sum changed to', sum);
  return sum;
}, 0);
```

The effect function is automatically wrapped in [`batch`](#batch),
meaning that all signal changes inside the effect propagate only after the
effect finishes.  This lets you update several signals while triggering only
one update, and avoids unwanted side-effects from happening in the middle
of your side effects.

The *first* execution of the effect function is not immediate;
it's scheduled to run after the current synchronous task via
[`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask).
If you want to wait for the first execution to occur,
use `queueMicrotask` (which runs before render) or
`await Promise.resolve()` or `setTimeout(..., 0)` (which run after render).
After this first execution, effects generally run immediately when
their dependencies update (unless you're in a [batch](#batch) or
[transition](#use-transition)).  For example:

```js
const [count, setCount] = createSignal(0);

// this effect prints count at the beginning and when it changes
createEffect(() => console.log('count =', count()));
// effect won't run yet
console.log('hello');
setCount(1);  // effect still won't run yet
setCount(2);  // effect still won't run yet

queueMicrotask(() => {
  // now `count = 2` will print
  console.log('microtask');
  setCount(3);  // immediately prints `count = 3`
  console.log('goodbye');
});

// --- overall output: ---
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

This delay in first execution is useful because it means
an effect defined in a component scope runs after
the JSX returned by the component gets added the DOM.
In particular, [`ref`s](#ref) will already be set.
Thus you can use an effect to manipulate the DOM manually,
call vanilla JS libraries, or other side effects.

Note that the first run of the effect still runs before the browser renders
the DOM to the screen (similar to React's `createLayoutEffect`).
If you need to wait until after rendering (e.g., to measure the rendering),
you can use `await Promise.resolve()` (or `Promise.resolve().then(...)`),
but note that subsequent use of reactive state (such as signals)
will not trigger the effect to rerun, as tracking is not
possible after an `async` function uses `await`.
Thus you should use all dependencies before the promise.

If you'd rather an effect run immediately even for its first run,
use [`createComputed`](#createcomputed).

You can clean up your side effects in between executions of the effect function
by calling [`onCleanup`](#oncleanup) *inside* the effect function.
Such a cleanup function gets called both in between effect executions and
when the effect gets disposed (e.g., the containing component unmounts).
For example:

```js
// listen to event dynamically given by eventName signal
createEffect(() => {
  const event = eventName();
  const callback = (e) => console.log(e);
  ref.addEventListener(event, callback);
  onCleanup(() => ref.removeEventListener(event, callback));
});
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Memos let you efficiently re-use a derived value as a dependency in multiple
other reactive computations.
`createMemo` creates a readonly derived signal equal to the return value of
the given function, which gets called immediately and whenever the
executed code's dependencies update.  It returns a getter for this signal.

```js
const value = createMemo(() => computeExpensiveValue(a(), b()));

// read value
value();
```

In Solid, you often don't need to wrap functions in memos;
you can alternatively just define and call a regular function
to get similar reactive behavior.
The main difference is when you call the function in multiple reactive settings.
In this case, when the function's dependencies update, the function will get
called multiple times unless it is wrapped in `createMemo`.  For example:

```js
const user = createMemo(() => searchForUser(username()));
// compare with: const user = () => searchForUser(username());
return (
  <ul>
  <li>Your name is "{user()?.name}"</li>
  <li>Your email is <code>{user()?.email}</code></li>
  </div>
);
```

When the `username` signal updates, `searchForUser` will get called just once
to update the `user` memo, and then both list items will update automatically
(if the returned user actually changed).
If we had instead defined `user` as a plain function
`() => searchForUser(username())`, then `searchForUser` would have been
called twice, once when updating each list item.

Another key difference is that a memo can shield dependents from updating
when the memo's dependencies change but the resulting memo value doesn't.
Like [`createSignal`](#createsignal), the derived signal made by `createMemo`
*updates* (and triggers dependents to rerun) only when the value returned by
the memo function actually changes from the previous value,
according to JavaScript's `===` operator.
Alternatively, you can pass an options object with `equals` set to `false`
to always update the memo when its dependencies change,
or you can pass your own `equals` function for testing equality.

The memo function gets called with an argument equal to the value returned
from the memo function's last execution, or on the first call,
equal to the optional second argument to `createMemo`.
This is useful for reducing computations, for example:

```js
// track the sum of all values taken on by input() as it updates
const sum = createMemo((prev) => input() + prev, 0);
```

The memo function should not change other signals by calling setters
(it should be "pure").
This enables Solid to optimize the execution order of memo updates
according to their dependency graph, so that all memos can update
at most once in response to a dependency change.

## `createResource`

```ts
type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: (info: unknown) => Promise<T> | T;
  }
];

export function createResource<T, U = true>(
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;

export function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;
```

Creates a signal that reflects the result of an async request. 

`createResource` takes an asynchronous fetcher function and returns a signal that is updated with the resulting data when the fetcher completes.

There are two ways to use `createResource`:  you can pass the fetcher function as the sole argument, or you can additionally pass a source signal as the first argument. The source signal will retrigger the fetcher whenever it changes, and its value will be passed to the fetcher.
```js
const [data, { mutate, refetch }] = createResource(fetchData)
```
```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData)
```
In these snippets, the fetcher is the function `fetchData`. In both cases, `data()` is undefined until `fetchData` finishes resolving. In the first case, `fetchData` will be called immediately. 
In the second, `fetchData` will be called as soon as `sourceSignal` has any value other than `false`, `null`, or `undefined`. 
It will be called again whenever the value of `sourceSignal` changes, it will always be passed to `fetchData` as its first argument.

Either way, you can call `mutate` to directly update the `data` signal (it works like any other signal setter). You can also call `refetch` to rerun the fetcher directly, and pass an optional argument to provide additional info to the fetcher: `refetch(info)`.

`data` works like a normal signal getter: use `data()` to read the last returned value of `fetchData`. 
But it also has two extra properties: `data.loading` tells you if the fetcher has been called but not returned, and `data.error` tells you if the request has errored out; if so, it contains the error thrown by the fetcher. (Note: if you anticipate errors, you may want to wrap `createResource` in an [ErrorBoundary](#<errorboundary>).)

`loading` and `error` are reactive getters and can be tracked. 

The `fetcher` is the async function that you provide to `createResource` to actually fetch the data.
It is passed two arguments: the value of the source signal (if provided), and an info object with two properties: `value` and `refetching`. `value` tells you the previously fetched value.
`refetching` is `true` if the fetcher was triggered using the `refetch` function and `false` otherwise. 
If the `refetch` function was called with an argument (`refetch(info)`), `refetching` is set to that argument.

```js
async function fetchData(source, { value, refetching }) {
  // Fetch the data and return a value.
  //`source` tells you the current value of the source signal; 
  //`value` tells you the last returned value of the fetcher;
  //`refetching` is true when the fetcher is triggered by calling `refetch()`,
  // or equal to the optional data passed: `refetch(info)`
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// read value
data();

// check if loading
data.loading;

// check if errored
data.error;

// directly set value without creating promise
mutate(optimisticValue);

// refetch the last request explicitly
refetch();
```

# Lifecycles

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Registers a method that runs after initial render and elements have been mounted. Ideal for using `ref`s and managing other one time side effects. It is equivalent to a `createEffect` which does not have any dependencies.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Registers a cleanup method that executes on disposal or recalculation of the current reactive scope. Can be used in any Component or Effect.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Registers an error handler method that executes when child scope errors. Only the nearest scope error handlers execute. Rethrow to trigger up the line.

# Reactive Utilities

These helpers provide the ability to better schedule updates and control how reactivity is tracked.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

Ignores tracking any of the dependencies in the executing code block and returns the value.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Holds committing updates within the block until the end to prevent unnecessary recalculation. This means that reading values on the next line will not have updated yet. [Solid Store](#createstore)'s set method and Effects automatically wrap their code in a batch.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` is designed to be passed into a computation to make its dependencies explicit. If an array of dependencies is passed, `input` and `prevInput` are arrays.

```js
createEffect(on(a, (v) => console.log(v, b())));

// is equivalent to:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

You can also not run the computation immediately and instead opt in for it to only run on change by setting the defer option to true.

```js
// doesn't run immediately
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // now it runs
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Creates a new non-tracked owner scope that doesn't auto-dispose. This is useful for nested reactive scopes that you do not wish to release when the parent re-evaluates.

All Solid code should be wrapped in one of these top level as they ensure that all memory/computations are freed up. Normally you do not need to worry about this as `createRoot` is embedded into all `render` entry functions.

## `getOwner`

```ts
export function getOwner(): Owner;
```

Gets the reactive scope that owns the currently running code, e.g.,
for passing into a later call to `runWithOwner` outside of the current scope.

Internally, computations (effects, memos, etc.) create owners which are
children of their owner, all the way up to the root owner created by
`createRoot` or `render`.  In particular, this ownership tree lets Solid
automatically clean up a disposed computation by traversing its subtree
and calling all [`onCleanup`](#oncleanup) callbacks.
For example, when a `createEffect`'s dependencies change, the effect calls
all descendant `onCleanup` callbacks before running the effect function again.
Calling `getOwner` returns the current owner node that is responsible
for disposal of the current execution block.

Components are not computations, so do not create an owner node, but they are
typically rendered from a `createEffect` which does, so the result is similar:
when a component gets unmounted, all descendant `onCleanup` callbacks get
called.  Calling `getOwner` from a component scope returns the owner that is
responsible for rendering and unmounting that component.

Note that the owning reactive scope isn't necessarily *tracking*.
For example, [`untrack`](#untrack) turns off tracking for the duration
of a function (without creating a new reactive scope), as do
components created via JSX (`<Component ...>`).

## `runWithOwner`

```ts
export function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

Executes the given function under the provided owner,
instead of (and without affecting) the owner of the outer scope.
By default, computations created by `createEffect`, `createMemo`, etc.
are owned by the owner of the currently executing code (the return value of
`getOwner`), so in particular will get disposed when their owner does.
Calling `runWithOwner` provides a way to override this default to a manually
specified owner (typically, the return value from a previous call to
`getOwner`), enabling more precise control of when computations get disposed.

Having a (correct) owner is important for two reasons:

* Computations without an owner cannot be cleaned up.  For example, if you call
  `createEffect` without an owner (e.g., in the global scope), the effect will
  continue running forever, instead of being disposed when its owner gets
  disposed.
* [`useContext`](#usecontext) obtains context by walking up the owner tree
  to find the nearest ancestor providing the desired context.
  So without an owner you cannot look up any provided context
  (and with the wrong owner, you might obtain the wrong context).

Manually setting the owner is especially helpful when doing reactivity outside
of any owner scope.  In particular, asynchronous computation
(via either `async` functions or callbacks like `setTimeout`)
lose the automatically set owner, so remembering the original owner via
`getOwner` and restoring it via `runWithOwner` is necessary in these cases.
For example:

```js
const owner = getOwner();
setTimeout(() => {
  // This callback gets run without owner.
  // Restore owner via runWithOwner:
  runWithOwner(owner, () => {
    const foo = useContext(FooContext);
    createEffect(() => {
      console.log(foo);
    });
  });
}, 1000)
```

Note that owners are not what determines dependency tracking,
so `runWithOwner` does not help with tracking in asynchronous functions;
use of reactive state in the asynchronous part (e.g. after the first `await`)
will not be tracked as a dependency.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

A reactive object `merge` method. Useful for setting default props for components in case caller doesn't provide them. Or cloning the props object including reactive properties.

This method works by using a proxy and resolving properties in reverse order. This allows for dynamic tracking of properties that aren't present when the prop object is first merged.

```js
// default props
props = mergeProps({ name: "Smith" }, props);

// clone props
newProps = mergeProps(props);

// merge props
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

Splits a reactive object by keys.

It takes a reactive object and any number of arrays of keys; for each array of keys, it will return a reactive object with just those properties of the original object. The last reactive object in the returned array will have any leftover properties of the original object.

This can be useful if you want to consume a subset of props and pass the rest to a child.

```js
const [local, others] = splitProps(props, ["children"]);

<>
  <Child {...others} />
  <div>{local.children}<div>
</>
```

## `useTransition`

```ts
export function useTransition(): [
  pending: () => boolean,
  startTransition: (fn: () => void) => Promise<void>
];
```

Used to batch async updates in a transaction deferring commit until all async processes are complete. This is tied into Suspense and only tracks resources read under Suspense boundaries.

```js
const [isPending, start] = useTransition();

// check if transitioning
isPending();

// wrap in transition
start(() => setSignal(newValue), () => /* transition is done */)
```

## `startTransition`

**New in v1.1.0**

```ts
export function startTransition: (fn: () => void) => Promise<void>;
```

Similar to `useTransition` except there is no associated pending state. This one can just be used directly to start the Transition.

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

This method takes a signal and produces a simple Observable. Consume it from the Observable library of your choice with typically with the `from` operator.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `from`

**New in v1.1.0**

```ts
export function from<T>(
  producer:
    | ((setter: (v: T) => T) => () => void)
    | {
        subscribe: (
          fn: (v: T) => void
        ) => (() => void) | { unsubscribe: () => void };
      }
): () => T;
```

A simple helper to make it easier to interopt with external producers like RxJS observables or with Svelte Stores. This basically turns any subscribable (object with a `subscribe` method) into a Signal and manages subscription and disposal.

```js
const signal = from(obsv$);
```

It can also take a custom producer function where the function is passed a setter function returns a unsubscribe function:

```js
const clock = from((set) => {
  const t = setInterval(() => set(1), 1000);
  return () => clearInterval(t);
});
```

> Note: Signals created by `from` have equality checks turned off to interface better with external streams and sources.

## `mapArray`

```ts
export function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

Reactive map helper that caches each item by reference to reduce unnecessary mapping on updates. It only runs the mapping function once per value and then moves or removes it as needed. The index argument is a signal. The map function itself is not tracking.

Underlying helper for the `<For>` control flow.

```js
const mapped = mapArray(source, (model) => {
  const [name, setName] = createSignal(model.name);
  const [description, setDescription] = createSignal(model.description);

  return {
    id: model.id,
    get name() {
      return name();
    },
    get description() {
      return description();
    }
    setName,
    setDescription
  }
});
```

## `indexArray`

```ts
export function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

Similar to `mapArray` except it maps by index. The item is a signal and the index is now the constant.

Underlying helper for the `<Index>` control flow.

```js
const mapped = indexArray(source, (model) => {
  return {
    get id() {
      return model().id
    }
    get firstInitial() {
      return model().firstName[0];
    },
    get fullName() {
      return `${model().firstName} ${model().lastName}`;
    },
  }
});
```

# Stores

These APIs are available at `solid-js/store`. They allow the creation of stores: [proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that allow a tree of signals to be independently tracked and modified.

## Using Stores

### `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
```

The create function takes an initial state, wraps it in a store, and returns a readonly proxy object and a setter function.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore(initialValue);

// read value
state.someValue;

// set value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

As proxies, store objects only track when a property is accessed.

When nested objects are accessed, stores will produce nested store objects, and this applies all the way down the tree. However, this only applies to arrays and plain objects. Classes are not wrapped, so objects like `Date`, `HTMLElement`, `RegExp`, `Map`, `Set` won't be granularly reactive as properties on a store.

The top level state object cannot be tracked, so put any lists on a key of state rather than using the state object itself.

```js
// put the list as a key on the state object
const [state, setState] = createStore({ list: [] });

// access the `list` property on the state object
<For each={state.list}>{item => /*...*/}</For>
```

### Getters

Store objects support the use of getters to store calculated values.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});
```

These are simple getters, so you still need to use a memo if you want to cache a value:

```js
let fullName;
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return fullName();
    },
  },
});
fullName = createMemo(() => `${state.user.firstName} ${state.user.lastName}`);
```

### Updating Stores

Changes can take the form of function that passes previous state and returns new state or a value. Objects are always shallowly merged. Set values to `undefined` to delete them from the Store.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

It supports paths including key arrays, object ranges, and filter functions.

setState also supports nested setting where you can indicate the path to the change. When nested the state you are updating may be other non Object values. Objects are still merged but other values (including Arrays) are replaced.

```js
const [state, setState] = createStore({
  counter: 2,
  list: [
    { id: 23, title: 'Birds' }
    { id: 27, title: 'Fish' }
  ]
});

setState('counter', c => c + 1);
setState('list', l => [...l, {id: 43, title: 'Marsupials'}]);
setState('list', 2, 'read', true);
// {
//   counter: 3,
//   list: [
//     { id: 23, title: 'Birds' }
//     { id: 27, title: 'Fish' }
//     { id: 43, title: 'Marsupials', read: true }
//   ]
// }
```

Path can be string keys, array of keys, iterating objects ({from, to, by}), or filter functions. This gives incredible expressive power to describe state changes.

```js
const [state, setState] = createStore({
  todos: [
    { task: 'Finish work', completed: false }
    { task: 'Go grocery shopping', completed: false }
    { task: 'Make dinner', completed: false }
  ]
});

setState('todos', [0, 2], 'completed', true);
// {
//   todos: [
//     { task: 'Finish work', completed: true }
//     { task: 'Go grocery shopping', completed: false }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', { from: 0, to: 1 }, 'completed', c => !c);
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping', completed: true }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', todo => todo.completed, 'task', t => t + '!')
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping!', completed: true }
//     { task: 'Make dinner!', completed: true }
//   ]
// }

setState('todos', {}, todo => ({ marked: true, completed: !todo.completed }))
// {
//   todos: [
//     { task: 'Finish work', completed: true, marked: true }
//     { task: 'Go grocery shopping!', completed: false, marked: true }
//     { task: 'Make dinner!', completed: false, marked: true }
//   ]
// }
```

## Store Utilities

### `produce`

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Immer inspired API for Solid's Store objects that allows for localized mutation.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

### `reconcile`

```ts
export function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Diffs data changes when we can't apply granular updates. Useful for when dealing with immutable data from stores or large API responses.

The key is used when available to match items. By default `merge` false does referential checks where possible to determine equality and replaces where items are not referentially equal. `merge` true pushes all diffing to the leaves and effectively morphs the previous data to the new value.

```js
// subscribing to an observable
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
export function unwrap(store: Store<T>): T;
```

Returns the underlying data in the store without a proxy.

### `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T> {
```

Creates a new mutable Store proxy object. Stores only trigger updates on values changing. Tracking is done by intercepting property access and automatically tracks deep nesting via proxy.

Useful for integrating external systems or as a compatibility layer with MobX/Vue.

> **Note:** A mutable state can be passed around and mutated anywhere, which can make it harder to follow and easier to break unidirectional flow. It is generally recommended to use `createStore` instead. The `produce` modifier can give many of the same benefits without any of the downsides.

```js
const state = createMutable(initialValue);

// read value
state.someValue;

// set value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables support setters along with getters.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

# Component APIs

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context provides a form of dependency injection in Solid. It is used to save from needing to pass data as props through intermediate components.

This function creates a new context object that can be used with `useContext` and provides the `Provider` control flow. Default Context is used when no `Provider` is found above in the hierarchy.

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const store = [
    state,
    {
      increment() {
        setState("count", (c) => c + 1);
      },
      decrement() {
        setState("count", (c) => c - 1);
      },
    },
  ];

  return (
    <CounterContext.Provider value={store}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

The value passed to provider is passed to `useContext` as is. That means wrapping as a reactive expression will not work. You should pass in Signals and Stores directly instead of accessing them in the JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Used to grab context to allow for deep passing of props without having to pass them through each Component function.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Used to make it easier to interact with `props.children`. This helper resolves any nested reactivity and returns a memo. Recommended approach to using `props.children` in anything other than passing directly through to JSX.

```js
const list = children(() => props.children);

// do something with them
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Used to lazy load components to allow for code splitting. Components are not loaded until rendered. Lazy loaded components can be used the same as its statically imported counterpart, receiving props etc... Lazy components trigger `<Suspense>`

```js
// wrap import
const ComponentA = lazy(() => import("./ComponentA"));

// use in JSX
<ComponentA title={props.title} />;
```

## `createUniqueId`

```ts
export function createUniqueId(): string;
```

A universal id generator that is stable across server/browser.

```js
const id = createUniqueId();
```

> **Note** on the server this only works under hydratable components

# Secondary Primitives

You probably won't need them for your first app, but these are useful tools to have.

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

Creates a readonly that only notifies downstream changes when the browser is idle. `timeoutMs` is the maximum time to wait before forcing the update.

## `createComputed`

```ts
export function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs immediately before render. Use this to write to other reactive primitives. When possible use `createMemo` instead as writing to a signal mid update can cause other computations to need to re-calculate.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs during the render phase as DOM elements are created and updated but not necessarily connected. All internal DOM updates happen at this time.

## `createReaction`

**New in v1.3.0**

```ts
export function createReaction(
  onInvalidate: () => void
): (fn: () => void) => void;
```

Sometimes it is useful to separate tracking from re-execution. This primitive registers a side effect that is run the first time the expression wrapped by the returned tracking function is notified of a change.

```js
const [s, set] = createSignal("start");

const track = createReaction(() => console.log("something"));

// next time s changes run the reaction
track(() => s());

set("end"); // "something"

set("final"); // no-op as reaction only runs on first update, need to call track again.
```

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

Creates a conditional signal that only notifies subscribers when entering or exiting their key matching the value. Useful for delegated selection state. As it makes the operation O(2) instead of O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

These imports are exposed from `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

This is the browser app entry point. Provide a top level component definition or function and an element to mount to. It is recommended this element be empty as the returned dispose function will wipe all children.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

This method is similar to `render` except it attempts to rehydrate what is already rendered to the DOM. When initializing in the browser a page has already been server rendered.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    nonce?: string;
    renderId?: string;
  }
): string;
```

Renders to a string synchronously. The function also generates a script tag for progressive hydration. Options include eventNames to listen to before the page loads and play back on hydration, and nonce to put on the script tag.

`renderId` is used to namespace renders when having multiple top level roots.

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    timeoutMs?: number;
    renderId?: string;
    nonce?: string;
  }
): Promise<string>;
```

Same as `renderToString` except it will wait for all `<Suspense>` boundaries to resolve before returning the results. Resource data is automatically serialized into the script tag and will be hydrated on client load.

`renderId` is used to namespace renders when having multiple top level roots.

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**New in v1.3.0**

```ts
export function renderToStream<T>(
  fn: () => T,
  options?: {
    nonce?: string;
    renderId?: string;
    onCompleteShell?: () => void;
    onCompleteAll?: () => void;
  }
): {
  pipe: (writable: { write: (v: string) => void }) => void;
  pipeTo: (writable: WritableStream) => void;
};
```

This method renders to a stream. It renders the content synchronously including any Suspense fallback placeholders, and then continues to stream the data and HTML from any async resource as it completes.

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` fires when synchronous rendering is complete before writing the first flush to the stream out to the browser. `onCompleteAll` is called when all server Suspense boundaries have settled. `renderId` is used to namespace renders when having multiple top level roots.

> Note this API replaces the previous `pipeToWritable` and `pipeToNodeWritable` APIs.

## `isServer`

```ts
export const isServer: boolean;
```

This indicates that the code is being run as the server or browser bundle. As the underlying runtimes export this as a constant boolean it allows bundlers to eliminate the code and their used imports from the respective bundles.

```js
if (isServer) {
  // I will never make it to the browser bundle
} else {
  // won't be run on the server;
}
```

## `HydrationScript`

```ts
export function generateHydrationScript(options: {
  nonce?: string;
  eventNames?: string[];
}): string;

export function HydrationScript(props: {
  nonce?: string;
  eventNames?: string[];
}): JSX.Element;
```

Hydration Script is a special script that should be placed once on the page to bootstrap hydration before Solid's runtime has loaded. It comes both as a function that can be called and inserted in an your HTML string, or as a Component if you are rendering JSX from the `<html>` tag.

The options are for the `nonce` to be put on the script tag and any event names for that Solid should capture before scripts have loaded and replay during hydration. These events are limited to those that Solid delegates which include most UI Events that are composed and bubble. By default it is only `click` and `input` events.

# Control Flow

For reactive control flow to be performant, we have to control how elements are created. For example, with lists, a simple `map` is inefficient as it always maps the entire array.

This means helper functions. Wrapping these in components is convenient way for terse templating and allows users to compose and build their own control flow components.

These built-in control flow components will be automatically imported. All except `Portal` and `Dynamic` are exported from `solid-js`. Those two, which are DOM-specific, are exported by `solid-js/web`.

> Note: All callback/render function children of control flow are non-tracking. This allows for nesting state creation, and better isolates reactions.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Simple referentially keyed loop. The callback takes the current item as the first argument:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

The optional second argument is an index signal:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

## `<Show>`

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

The Show control flow is used to conditional render part of the view: it renders `children` when the `when` is truthy, an `fallback` otherwise. It is similar to the ternary operator (`when ? children : fallback`) but is ideal for templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show can also be used as a way of keying blocks to a specific data model. Ex the function is re-executed whenever the user model is replaced.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Useful for when there are more than 2 mutual exclusive conditions. Can be used to do things like simple routing.

```jsx
<Switch fallback={<div>Not Found</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

Match also supports function children to serve as keyed flow.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Non-keyed list iteration (rendered nodes are keyed to an array index). This is useful when there is no conceptual key, like if the data consists of primitives and it is the index that is fixed rather than the value.

The item is a signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Optional second argument is an index number:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Catches uncaught errors and renders fallback content.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Also supports callback form which passes in error and a reset function.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

A component that tracks all resources read under it and shows a fallback placeholder state until they are resolved. What makes `Suspense` different than `Show` is it is non-blocking in that both branches exist at the same time even if not currently in the DOM.

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Experimental)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` allows for coordinating multiple parallel `Suspense` and `SuspenseList` components. It controls the order in which content is revealed to reduce layout thrashing and has an option to collapse or hide fallback states.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

SuspenseList is still experimental and does not have full SSR support.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

This component lets you insert an arbitrary Component or tag and passes the props through to it.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

This inserts the element in the mount node. Useful for inserting Modals outside of the page layout. Events still propagate through the Component Hierarchy.

The portal is mounted in a `<div>` unless the target is the document head. `useShadow` places the element in a Shadow Root for style isolation, and `isSVG` is required if inserting into an SVG element so that the `<div>` is not inserted.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Special JSX Attributes

In general Solid attempts to stick to DOM conventions. Most props are treated as attributes on native elements and properties on Web Components, but a few of them have special behavior.

For custom namespaced attributes with TypeScript you need to extend Solid's JSX namespace:

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:____
    }
    interface ExplicitProperties {
      // prop:____
    }
    interface ExplicitAttributes {
      // attr:____
    }
    interface CustomEvents {
      // on:____
    }
    interface CustomCaptureEvents {
      // oncapture:____
    }
  }
}
```

## `ref`

Refs are a way of getting access to underlying DOM elements in our JSX. While it is true one could just assign an element to a variable, it is more optimal to leave components in the flow of JSX. Refs are assigned at render time but before the elements are connected to the DOM. They come in 2 flavors.

```js
// simple assignment
let myDiv;

// use onMount or createEffect to read after connected to DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Or, callback function (called before connected to DOM)
<div ref={el => console.log(el)} />
```

Refs can also be used on Components. They still need to be attached on the otherside.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />;
}

function App() {
  let myDiv;
  onMount(() => console.log(myDiv.clientWidth));
  return <MyComp ref={myDiv} />;
}
```

## `classList`

A helper that leverages `element.classList.toggle`. It takes an object whose keys are class names and assigns them when the resolved value is true.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Solid's style helper works with either a string or with an object. Unlike React's version Solid uses `element.style.setProperty` under the hood. This means support for CSS vars, but it also means we use the lower, dash-case version of properties. This actually leads to better performance and consistency with SSR output.

```jsx
// string
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// object
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// css variable
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

These work the same as their property equivalent. Set a string and they will be set. **Be careful!!** Setting `innerHTML` with any data that could be exposed to an end user as it could be a vector for malicious attack. `textContent` while generally not needed is actually a performance optimization when you know the children will only be text as it bypasses the generic diffing routine.

```jsx
<div textContent={state.text} />
```

## `on___`

Event handlers in Solid typically take the form of `onclick` or `onClick` depending on style.

Solid uses semi-synthetic event delegation for common UI events that are composed and bubble. This improves performance for these common events.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid also supports passing an array to the event handler to bind a value to the first argument of the event handler. This doesn't use `bind` or create an additional closure, so it is a highly optimized way of delegating events.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events are never rebound and the bindings are not reactive, as it is expensive to attach and detach listeners.
Since event handlers are called like any other function each time an event fires, there is no need for reactivity; simply shortcut your handler if desired.

```jsx
// if defined call it, otherwised don't.
<div onClick={() => props.handleClick?.()} />
```

Note that `onChange` and `onInput` work according to their native behavior. `onInput` will fire immediately after the value has changed; for `<input>` fields, `onChange` will only fire after the field loses focus.

## `on:___`/`oncapture:___`

For any other events, perhaps ones with unusual names, or ones you wish not to be delegated there are the `on` namespace events. This simply adds an event listener verbatim.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

These are custom directives. In a sense this is just syntax sugar over ref but allows us to easily attach multiple directives to a single element. A directive is simply a function with the following signature:

```ts
function directive(element: Element, accessor: () => any): void;
```

Directive functions are called at render time but before being added to the DOM. You can do whatever you'd like in them including create signals, effects, register clean-up etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

To register with TypeScript extend the JSX namespace.

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      model: [() => any, (v: any) => any];
    }
  }
}
```

## `prop:___`

Forces the prop to be treated as a property instead of an attribute.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Forces the prop to be treated as a attribute instead of an property. Useful for Web Components where you want to set attributes.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid's compiler uses a simple heuristic for reactive wrapping and lazy evaluation of JSX expressions. Does it contain a function call, a property access, or JSX? If yes we wrap it in a getter when passed to components or in an effect if passed to native elements.

Knowing this we can reduce overhead of things we know will never change simply by accessing them outside of the JSX. A simple variable will never be wrapped. We can also tell the compiler not to wrap them by starting the expression with a comment decorator `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

This also works on children.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
