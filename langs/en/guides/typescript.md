---
title: TypeScript
description: Tips for using Solid with TypeScript 
sort: 3
---
# TypeScript

Solid is designed to be easy to use with TypeScript:
its use of standard JSX makes code largely understood by TypeScript,
and it provides sophisticated built-in types for its API.
This guide covers some useful tips for working with TypeScript and
typing your Solid code.

## Configuring TypeScript

The [Solid starter templates](https://github.com/solidjs/templates/)
offer good starting points for
[`tsconfig.json`](https://github.com/solidjs/templates/blob/master/ts/tsconfig.json).

Most importantly, to use TypeScript with the Solid JSX compiler,
you need to configure TypeScript to leave JSX constructs alone via
[`"jsx": "preserve"`](https://www.typescriptlang.org/tsconfig#jsx),
and tell TypeScript where the JSX types come from via
[`"jsxImportSource": "solid-js"`](https://www.typescriptlang.org/tsconfig#jsxImportSource).
So, a minimal `tsconfig.json` would look like this:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

If your code base uses a mix of JSX types (e.g., some files are React
while other files are Solid), you can set the default `jsxImportSource`
in `tsconfig.json` for the majority of your code, and then
[override the `jsxImportSource` option](https://www.typescriptlang.org/tsconfig#jsxImportSource)
in specific `.tsx` files using the following pragma:

```ts
/** @jsxImportSource solid-js */
```

or

```ts
/** @jsxImportSource react */
```

## API Types

Solid is written in TypeScript, so everything is typed out of the box.
The [API documentation](https://www.solidjs.com/docs/latest/api) details the
types for all API calls, as well as several helpful type definitions to make it
easier to refer to Solid notions when you need to specify explicit types.
Here, we explore the resulting types when using a few core primitives.

### Signals

`createSignal<T>` is parameterized by the type `T` of the object stored in the
signal.  For example:

```ts
const [count, setCount] = createSignal<number>();
```

The first `createSignal` has return type `Signal<number>`, corresponding to 
the type we passed to it. This is a tuple of the getter and 
setter, which each have a generic type: 

```ts 
import type { Signal, Accessor, Setter } from 'solid-js';
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
```

In this case, the signal getter `count` has type
`Accessor<number | undefined>`. `Accessor<T>` is a type definition
provided by Solid, in this case equivalent to `() => number | undefined`.
The `| undefined` gets added in this example because we did not provide a
default value to `createSignal`, so the signal value indeed starts out as
`undefined`.

The signal setter `setCount` has type `Setter<number>`, which is a more
complicated type definition corresponding roughly to
`(value?: number | ((prev?: number) => number)) => number`, representing the
two possibilities for the passed argument: you can call `setCount` with 
a simple `number`, or a
function taking the previous value (if there was one) and returning a number.

The actual `Setter` type is more complicated, to detect accidentally passing
a function to the setter when you might have wanted to set the signal to that
function value instead of calling the function to determine the new value.
If you're getting a TypeScript error "Argument ... is not assignable to
parameter" when calling `setCount(value)`, then try wrapping the setter
argument as in `setCount(() => value)` to make sure that `value` isn't called.

##### Defaults

We can avoid having to explicitly provide the type of the signal when calling
`createSignal`, and avoid the `| undefined` part of the type, by providing
a default value to `createSignal`:

```ts
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('');
```

In this case, TypeScript infers that the signal types are `number` and `string`
respectively.  Thus, for example, `count` obtains type `Accessor<number>`
and `name` obtains type `Accessor<string>` (without `| undefined`).

### Context

Similar to signals,
[`createContext<T>`](https://www.solidjs.com/docs/latest/api#createcontext)
is parameterized by the type `T` of the context value.
We can provide this type explicitly:

```ts
type Data = {count: number, name: string};
const dataContext = createContext<Data>();
```

In this case, `dataContext` has type `Context<Data | undefined>`,
causing `useContext(dataContext)` to have matching return type `Data | 
undefined`.
The reason for `| undefined` is that the context might not be provided in the
ancestors of the current component, in which case `useContext` returns
`undefined`.

If we instead provide a default value to `createContext`, we avoid the
`| undefined` part of the type, and often avoid having to explicitly specify
the type of the `createContext` as well:

```ts
const dataContext = createContext({count: 0, name: ''});
```

In this case, TypeScript infers that `dataContext` has type
`Context<{count: number, name: string}>`, which is equivalent to
`Context<Data>` (without `| undefined`).

Another common pattern is to define a factory function that produces the
value for a context.  Then we can grab the return type of that function using 
TypeScript's
[`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)
type helper, and use that to type the context:

```ts
export const makeCountNameContext = (initialCount = 0, initialName = '') => {
  const [count, setCount] = createSignal(initialCount);
  const [name, setName] = createSignal(initialName);
  return [{count, name}, {setCount, setName}] as const;
    // `as const` forces tuple type inference
};
type CountNameContextType = ReturnType<typeof makeCountNameContext>;
export const CountNameContext = createContext<CountNameContextType>();
export const useCountNameContext = () => useContext(CountNameContext);
```

In this example, `CountNameContextType` corresponds to the return value of 
`makeCountNameContext`:
```ts
[
  {readonly count: Accessor<number>, readonly name: Accessor<string>},
  {readonly setCount: Setter<number>, readonly setName: Setter<string>}
]
```

and `useCountNameContext` has type `() => CountNameContextType | undefined`.

If you want to avoid the `undefined` possibility, you could assert that the
context is always provided when used:
```ts
export const useCountNameContext = () => useContext(CountNameContext)!;
```

This is a dangerous assumption; it would be safer to actually provide a 
default argument to `createContext` so that the context is always 
defined.

## Component Types

```ts
import type { JSX, PropsWithChildren, Component } from 'solid-js';
type PropsWithChildren<P = {}> = P & { children?: JSX.Element };
type Component<P = {}> = (props: PropsWithChildren<P>) => JSX.Element
```

To type a component function, use the `Component<P>` type,
where `P` is the type of the `props` argument and should be an [object type](https://www.typescriptlang.org/docs/handbook/2/objects.html).
`P` doesn't need to explicitly mention the `children` property;
`{ children?: JSX.Element }` is automatically added to the type
(via the `PropsWithChildren<P>` wrapper).  For example:

```tsx
const Counter: Component<{initialValue: number}> = (props) => {
  [count, setCount] = createSignal(props.initialValue);
  return (
    <button onClick={setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>;
};
```

This code automatically types `props` to
`{initialValue: number, children?: JSX.Element}`
and forces the return value of `Counter` to be `JSX.Element`
(which can be a DOM node, an array of `JSX.Element`s,
a function returning a `JSX.Element`, a boolean, or anything
else the renderer can handle).

The namespace `JSX` offers a suite of useful types for working with HTML DOM
in particular.  See the
[definition of JSX in dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts)
for all the types provided.

## Event Handlers

One useful helper type provided by the `JSX` namespace is
`JSX.EventHandler<T, E>`,
which represents a single-argument event handler for a DOM element type `T`
and event type `E`.
You can use this to type any event handlers you define outside JSX.
For example:

```tsx
import type { JSX } from 'solid-js';
const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
  console.log('input changed to', event.currentTarget.value);
};

<input onInput={onInput}/>
```

Handlers defined inline within
[`on___` JSX attributes](https://www.solidjs.com/docs/latest/api#on___)
(with built-in event types) are automatically typed as the appropriate
`JSX.EventHandler`:

```tsx
<input onInput={(event) => {
  console.log('input changed to', event.currentTarget.value);
}}/>;
```

Note that `JSX.EventHandler<T>` constrains the event's
[`currentTarget` attribute](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
to be of type `T` (in the example, `event.currentTarget` is typed
as `HTMLInputEvent`, so has attribute `value`).  However, the event's
[`target` attribute](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)
could be any `DOMElement`.
This is because `currentTarget` is the element that the
event handler was attached to, so has a known type, whereas `target` is
whatever the user interacted with that caused the event to bubble to or get
captured by the event handler, which can be any DOM element.

## The ref Attribute

When we use the `ref` attribute with a variable, we tell Solid to assign the
DOM element to 
the variable once the element is rendered. Without TypeScript, this looks like:

```jsx
let divRef;

console.log(divRef); //undefined

onMount(() => {
  console.log(divRef) //<div></div>
})

return (
  <div ref={divRef}></div>
)
```

This presents a challenge for typing that variable: should we type `divRef` 
as an `HTMLDivElement`, even though it's only set as such after rendering?

Here is one common pattern for using `ref` variables with TypeScript:

```tsx
let divRef!: HTMLDivElement;
let buttonRef!: HTMLButtonElement;

return (
  <div ref={divRef}>
    <button ref={buttonRef}>...</button>
  </div>
);
```

The [non-null assertions (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
on the declarations effectively tell TypeScript to assume that the refs have 
been set, allowing you to call `HTMLDivElement` properties (e.g. `divRef.offsetWidth`) without a type assertion.

The downside to this approach is that it doesn't reflect the full picture: 
these ref variables 
won't actually be set (and will still be undefined)
until after the rendering phase.  You can safely use them in [`onMount`](/docs/latest/api#onmount) or a
[`createEffect`](/docs/latest/api#createeffect),
for example, but not in the body of the component function.

Instead, you can leave off the non-null assertion in the declaration, and 
check for nullity when you access the variable later on.
Additionally, due 
to a quirk with 
TypeScript and JSX, you'll need to add the non-null assertion using the `ref` 
attribute in JSX:

```tsx
let divRef: HTMLDivElement;
let buttonRef: HTMLButtonElement;

return (
  <div ref={divRef!}>
    <button ref={buttonRef!}>...</button>
  </div>
);
```

This is because TypeScript assumes 
that the variable is being used to set the ref attribute (and thus 
believes 
that the variable must be defined), 
when in fact the `ref` attribute tells Solid to 
set _the variable_ later on. 

With this pattern, TypeScript will correctly flag any accidental uses of the
refs inside the body of the function (before the JSX block where they get
defined).  However, TypeScript currently does not flag use of refs inside
`createMemo` and `createRenderEffect`, even though they won't be defined there,
so you still need to be careful.

## Control Flow Narrowing

A common pattern is to use
[`<Show>`](https://www.solidjs.com/docs/latest/api#%3Cshow%3E)
to display data only when that data is defined:

```tsx
const [name, setName] = createSignal<string>();

return (
  <Show when={name()}>
    Hello {name().replace(/\s+/g, '\xa0')}!
  </Show>
);
```

In this case, TypeScript can't determine that the two calls to `name()` will
return the same value, and that the second call will happen only if the first
call returned a truthy value.  Thus it will complain that `name()` might be
`undefined` when trying to call `.replace()`.

Here are two workarounds for this issue:

1. You can manually assert that `name()` will be non-null in the second call
   using TypeScript's
   [non-null assertion operator `!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-):

   ```tsx
   return (
     <Show when={name()}>
       Hello {name()!.replace(/\s+/g, '\xa0')}!
     </Show>
   );
   ```

2. You can use the callback form of `<Show>`, which passes in the value of the
   `when` prop when it is truthy:

   ```tsx
   return (
     <Show when={name()}>
       {(n) =>
         <>Hello {n.replace(/\s+/g, '\xa0')}!</>
       }
     </Show>
   );
   ```

   In this case, the typing of the `Show` component is clever enough to tell
   TypeScript that `n` is truthy, so it can't be `undefined` (or `null` or
   `false`).

   Note, however, that this form of `<Show>` forces the entirety of the 
   children to render
   from scratch every time `name()` changes, instead of doing this just when `name()` changes from a falsey to a truthy value.
   This means that the children don't have the full benefits of fine-grained
   reactivity (re-using unchanged parts and updating just what changed).

## Special JSX Attributes and Directives

### `on:___`/`oncapture:___`

If you use custom event handlers via Solid's
[`on:___`/`oncapture:___` attributes](https://www.solidjs.com/docs/latest/api#on%3A___%2Foncapture%3A___),
you should define corresponding types for the resulting `Event` objects
by overriding the `CustomEvents` and `CustomCaptureEvents` interfaces
within module `"solid-js"`'s `JSX` namespace, like so:

```tsx
class NameEvent extends CustomEvent {
  type: 'Name';
  detail: {name: string};

  constructor(name: string) {
    super('Name', {detail: {name}});
  }
}

declare module "solid-js" {
  namespace JSX {
    interface CustomEvents { // on:Name
      "Name": NameEvent;
    }
    interface CustomCaptureEvents { // oncapture:Name
      "Name": NameEvent;
    }
  }
}

<div on:Name={(event) => console.log('name is', event.detail.name)}/>
```

### `prop:___`/`attr:___`

If you use forced properties via Solid's
[`prop:___` attributes](https://www.solidjs.com/docs/latest/api#prop%3A___),
or custom attributes via Solid's
[`attr:___` attributes](https://www.solidjs.com/docs/latest/api#attr%3A___),
you can define their types in the `ExplicitProperties` and
`ExplicitAttributes` interfaces, respectively:

```tsx
declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties { // prop:___
      count: number;
      name: string;
    }
    interface ExplicitAttributes { // attr:___
      count: number;
      name: string;
    }
  }
}

<Input prop:name={name()} prop:count={count()}/>
<my-web-component attr:name={name()} attr:count={count()}/>
```

### `use:___`

If you define custom directives for Solid's
[`use:___` attributes](https://www.solidjs.com/docs/latest/api#use%3A___),
you can type them in the `Directives` interface, like so:

```tsx
function model(element: HTMLInputElement, value: Accessor<Signal<string>>) {
  const [field, setField] = value();
  createRenderEffect(() => (element.value = field()));
  element.addEventListener("input", (e) => setField(e.target.value));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {  // use:model
      model: Signal<string>;
    }
  }
}

let [name, setName] = createSignal('');

<input type="text" use:model={[name, setName]} />;
```

If you're `import`ing a directive `d` from another module, and `d` is used only
as a directive `use:d`, then TypeScript (or more precisely,
[`babel-preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript))
will by default remove the `import` of `d` (for fear that `d` is a type,
as TypeScript doesn't understand `use:d` as a reference to `d`).
There are two ways around this issue:

1. Use
   [`babel-preset-typescript`'s `onlyRemoveTypeImports: true`](https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports)
   configuration option,
   which prevents it from removing any `import`s except for `import type ...`.
   If you're using `vite-plugin-solid`, you can specify this option via
   `solidPlugin({ typescript: { onlyRemoveTypeImports: true } })`
   in `vite.config.ts`.

   Note that this option can be problematic if you don't vigilantly use
   `export type` and `import type` throughout your codebase.

2. Add a fake access like `false && d;` to every module `import`ing
   directive `d`.
   This will stop TypeScript from removing the `import` of `d`, and assuming
   you're tree-shaking via e.g. [Terser](https://terser.org/),
   this code will be omitted from your final code bundle.

   The simpler fake access `d;` will also prevent the `import` from being
   removed, but will typically not be tree-shaken away, so will end up in
   your final code bundle.
