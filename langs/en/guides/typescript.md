---
title: TypeScript
description: Tips for typing Solid code
sort: 4
---
# TypeScript

Solid is written in TypeScript, so everything is typed out of the box.
This guide covers some useful tips for working with types in your Solid code.

## API Types

The [API documentation](https://www.solidjs.com/docs/latest/api) details the
types for all API calls, as well as several helpful type definitions to make it
easier to refer to Solid notions when you need to specify explicit types.
Here we walk through the usage of a few core primitives.

### Signals

`createSignal<T>` is parameterized by the type `T` of the object stored in the
signal.  For example:

```ts
const [count, setCount] = createSignal<number>();
const [name, setName] = createSignal<string>();
```

In this case, the signal getter `count` has type
`Accessor<number | undefined>`, where `Accessor<T>` is a type definition
provided by Solid, in this case equivalent to `() => number | undefined`.
The `| undefined` gets added in this example because we did not provide a
default value to `createSignal`, so the signal value indeed starts out as
`undefined`.

The signal setter `setCount` has type `Setter<number>`, which is a more
complicated type definition provided by Solid corresponding roughly to
`(value?: number | ((prev?: number) => number)) => number`, representing the
two possibilities for the passed argument to be either a simple `number` or a
function taking the previous value (if there was one) and returning a number.

Collectively, `[count, setCount]` (the return value of `createSignal`)
has type `Signal<number>`.

#### Defaults

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

## Context

Similar to signals,
[`createContext<T>`](https://www.solidjs.com/docs/latest/api#createcontext)
is parameterized by the type `T` of the context value.
We can provide this type explicitly:

```ts
type Data = {count: number, name: string};
const dataContext = createContext<Data>();
```

In this case, `dataContext` has type `Context<Data | undefined>`,
causing `useContext(dataContext)` to have return type `Data | undefined`.
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

## Component Types

```ts
import type {PropsWithChildren, Component} from 'solid-js';
type PropsWithChildren<P = {}> = P & { children?: JSX.Element };
type Component<P = {}> = (props: PropsWithChildren<P>) => JSX.Element
```

Solid provides the `Component<P>` type to represent a component function,
where the `props` argument has type `P`.  Here `P` should be an object type,
and doesn't need to explicitly mention the `children` property;
`{ children?: JSX.Element }` is automatically added to the type
(via the `PropsWithChildren<P>` type definition).  For example:

```ts
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
and forces a return value of `JSX.Element`
(which can be a DOM node, an array of `JSX.Element`s,
a function returning a `JSX.Element`, a boolean, or anything
else the renderer can handle).

The namespace `JSX` offers a suite of useful types for working with HTML DOM
in particular.  See the 
[definition of JSX in dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts)
for all the types provided.

## Event Handlers

One useful helper type provided by the `JSX` namespace is `JSX.EventHandler<T>`,
which represents a single-argument event handler for a DOM element type `T`.
For example:

```ts
const onInput: JSX.EventHandler<HTMLInputElement> = (event) => {
  console.log('input changed to', event.currentTarget.value);
};
//...
<input onInput={onInput}/>
```

Note that `JSX.EventHandler<T>` constrains the event's
[`currentTarget`](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
attribute to be of type `T`, but its
[`target`](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)
attribute could be any `DOMEvent`.
This is the nature of DOM events: `currentTarget` gives the element that the
event handler was attached to, so has a known type, whereas `target` is
whatever the user interacted with that caused the event to bubble to or get
captured by the event handler.

## ref

Here is the typical pattern for using `ref` with TypeScript:

```ts
let divRef: HTMLDivElement;
let buttonRef: HTMLButtonElement;
//...
return (
  <div ref={divRef!}>
    <button ref={buttonRef!}>...</button>
  </div>
);
```

Note the explicit types on the declarations, and the
[non-null assertions (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
when using the `ref`.  (Without the non-null assertion, TypeScript thinks
that the `ref` attribute is being given the ref variable, when in fact it's
setting the ref variable.  This is a workaround until TypeScript can understand
assignments to variables through JSX attributes.)

Alternatively, you can declare the ref variables as non-null from the get go:

```ts
let divRef!: HTMLDivElement;
let buttonRef!: HTMLButtonElement;
```

But be careful: these ref variables won't actually be set (and non-null)
until after the rendering phase.  You can safely use them in a
[`createEffect`](https://www.solidjs.com/docs/latest/api#createeffect),
for example, but not in the body of the component function.

## Control Flow Narrowing

A common pattern is to use
[`<Show>`](https://www.solidjs.com/docs/latest/api#%3Cshow%3E)
to display data only when that data is defined:

```ts
const [name, setName] = createSignal<string>();
//...
return (
  <Show when={name()}>
    GREETINGS {name().toUpperCase()}!
  </Show>
);
```

In this case, TypeScript can't determine that the two calls to `name()` will
return the same value, and that the second call will happen only if the first
call returned a truthy value.  Thus it will complain that `name()` might be
`undefined` when trying to call `.toUpperCase()`.

Here are two workarounds for this issue:

1. You can manually assert that `name()` will be non-null in the second call
   using TypeScript's
   [non-null assertion operator `!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-):

   ```ts
   return (
    <Show when={name()}>
      GREETINGS {name()!.toUpperCase()}!
    </Show>
  );
   ```

2. You can use the callback form of `<Show>`, which passes in the value of the
   `when` prop when it is truthy:

   ```ts
   return (
    <Show when={name()}>
      {(n) =>
        <>GREETINGS {n.toUpperCase()}!</>
      }
    </Show>
  );
   ```

   In this case, the typing of the `Show` component is clever enough to tell
   TypeScript that `n` is truthy, so can't be `undefined` (or `null` or
   `false`).

   Note, however, that this form of `<Show>` forces the children to render
   from scratch every time `name()` changes, instead of just rendering from
   scratch when `name()` changes from a falsey to a truthy value.
   This prevents the children from the benefits of fine-grained
   reactivity (re-using unchanged parts and updating just what changed).
