---
title: TypeScript
description: Tips for typing Solid code
sort: 4
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
[`.tsconfig`](https://github.com/solidjs/templates/blob/master/ts/tsconfig.json).
In particular, to use TypeScript with the Solid JSX compiler,
you need to configure TypeScript to leave JSX constructs alone via
`"jsx": "preserve"`, and tell TypeScript about where the JSX types come from
via `"jsxImportSource": "solid-js"`.
Thus a minimal `.tsconfig` would look like this:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

## API Types

Solid is written in TypeScript, so everything is typed out of the box.
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

Another common pattern is to define a factory function that produces the
value for a context.  In this case, we can type the context using TypeScript's
[`ReturnValue`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)
type helper:

```ts
export const makeCountNameContext = (initialCount = 0, initialName = '') => {
  const [count, setCount] = createSignal(initialCount);
  const [name, setName] = createSignal(initialName);
  return [{count, name}, {setCount, setName}];
};
type CountNameContextType = ReturnType<makeCountNameContext>;
export const CountNameContext = createContext<CountNameContextType>;
export const useCountNameContext = () => useContext(CountNameContext);
```

In this case, `CountNameContextType` is automatically
`[{count: Accessor<number>, name: Accessor<string>}, {setCount: Setter<number>, Setter<string>}]`,
and `useCountNameContext` has type `() => CountNameContextType | undefined`.
If you want to avoid the `undefined` possibility by asserting that the
context is always provided when used (*this is dangerous!*), you could define
`useCountNameContext` as `() => useContext(CountNameContext)!`.
But it would be safer to actually provide a default argument to
`createContext` so that the context is definitely always defined.

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
You can use this to type any event handlers you define outside JSX.
For example:

```ts
const onInput: JSX.EventHandler<HTMLInputElement> = (event) => {
  console.log('input changed to', event.currentTarget.value);
};

<input onInput={onInput}/>
```

Handlers defined inline within
[`on___` JSX attributes](https://www.solidjs.com/docs/latest/api#on___)
(with built-in event types) are automatically typed as the appropriate
`JSX.EventHandler`:

```ts
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
This is the nature of DOM events: `currentTarget` is the element that the
event handler was attached to, so has a known type, whereas `target` is
whatever the user interacted with that caused the event to bubble to or get
captured by the event handler, which can be any DOM element.

## Custom Events, Properties, Attributes, and Directives

If you use custom event handlers via Solid's
[`on:___`/`oncapture:___` attributes](https://www.solidjs.com/docs/latest/api#on%3A___%2Foncapture%3A___),
you should define corresponding types for the resulting `Event` objects,
by overriding the `CustomEvents` and `CustomCaptureEvents` interfaces
within module `"solid-js"`'s `JSX` namespace, like so:

```ts
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
      "Name": NameEvent,
    }
    interface CustomCaptureEvents { // oncapture:Name
      "Name": NameEvent,
    }
  }
}

<div on:Name={(event) => console.log('name is', event.detail.name)}/>
```

If you use forced properties via Solid's
[`prop:___` attributes](https://www.solidjs.com/docs/latest/api#prop%3A___),
or custom attributes via Solid's
[`attr:___` attributes](https://www.solidjs.com/docs/latest/api#attr%3A___),
you can define their types in the `ExplicitProperties` and
`ExplicitAttributes` interfaces, respectively:

```ts
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

If you define custom directives for Solid's
[`use:___` attributes](https://www.solidjs.com/docs/latest/api#use%3A___),
you can type them in the `Directives` interface, like so:

```ts
function model(element: HTMLInputElement, value: Accessor<Signal<string>>) {
  const [field, setField] = value();
  createRenderEffect(() => (element.value = field()));
  element.addEventListener("input", (e) => setField(e.target.value));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {  // use:model
      model: Signal<string>,
    }
  }
}

let [name, setName] = createSignal('');

<input type="text" use:model={[name, setName]} />;
```

## ref

Here is the typical pattern for using `ref` with TypeScript:

```ts
let divRef: HTMLDivElement;
let buttonRef: HTMLButtonElement;

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
