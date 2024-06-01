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
either a `number` or a
function taking the previous value (if there was one) and returning a `number`.

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
import type { JSX, Component } from 'solid-js';
type Component<P = {}> = (props: P) => JSX.Element;
```

To type a basic component function, use the `Component<P>` type,
where `P` is the type of the `props` argument and should be an [object type](https://www.typescriptlang.org/docs/handbook/2/objects.html).
This will enforce that correctly typed props get passed in as attributes,
and that the return value is something that can be rendered by Solid:
a `JSX.Element` can be a DOM node, an array of `JSX.Element`s,
a function returning a `JSX.Element`, a boolean, `undefined`/`null`, etc.
Here are some examples:

```tsx
const Counter: Component = () => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<Counter/>;              // good
<Counter initial={5}/>;  // type error: no initial prop
<Counter>hi</Counter>    // type error: no children prop

const InitCounter: Component<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<InitCounter initial={5}/>;  // good
```

If you want your component to take JSX children, you can either explicitly
add a type for `children` to `P`, or you can use the `ParentComponent` type
which automatically adds `children?: JSX.Element`.  Alternatively, if you'd
like to declare your component with `function` instead of `const`, you can
use the `ParentProps` helper to type `props`.  Some examples:

```tsx
import { JSX, ParentComponent, ParentProps } from 'solid-js';
type ParentProps<P = {}> = P & { children?: JSX.Element };
type ParentComponent<P = {}> = Component<ParentProps<P>>;

// Equivalent typings:
//const CustomCounter: Component<{children?: JSX.Element}> = ...
//function CustomCounter(props: ParentProps): JSX.Element { ...
const CustomCounter: ParentComponent = (props) => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};

// Equivalent typings:
//const CustomInitCounter: Component<{initial: number, children?: JSX.Element}> = ...
//function CustomInitCounter(props: ParentProps<{initial: number}>): JSX.Element { ...
const CustomInitCounter: ParentComponent<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};
```

In the latter example, the `props` parameter automatically gets typed as
`props: ParentProps<{initial: number}>` which is equivalent to
`props: {initial: number, children?: JSX.Element}`.
(Note that, before Solid 1.4, `Component` was equivalent to `ParentComponent`.)

Solid provides two other `Component` subtypes for dealing with `children`:

```ts
import {JSX, FlowComponent, FlowProps, VoidComponent, VoidProps} from 'solid-js';
type FlowProps<P = {}, C = JSX.Element> = P & { children: C };
type FlowComponent<P = {}, C = JSX.Element> = Component<FlowProps<P, C>>;
type VoidProps<P = {}> = P & { children?: never };
type VoidComponent<P = {}> = Component<VoidProps<P>>;
```

`VoidComponent` is for components that definitely do not support `children`.
`VoidComponent<P>` is equivalent to `Component<P>` when `P` doesn't provide
a type for `children`.

`FlowComponent` is intended for "control flow" components like Solid's
`<Show>` and `<For>`.  Such components generally require `children` to make
sense, and sometimes have specific types for `children`, such as requiring it
to be a single function.  For example:

```tsx
const CallMeMaybe: FlowComponent<{when: boolean}, () => void> = (props) => {
  createEffect(() => {
    if (props.when)
      props.children();
  });
  return <>{props.when ? 'Calling' : 'Not Calling'}</>;
};

<CallMeMaybe when={true}/>;  // type error: missing children
<CallMeMaybe when={true}>hi</CallMeMaybe>;  // type error: children
<CallMeMaybe when={true}>
  {() => console.log("Here's my number")}
</CallMeMaybe>;              // good
```

## Event Handlers

The namespace `JSX` offers a suite of useful types for working with HTML DOM
in particular.  See the
[definition of JSX in dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts)
for all the types provided.

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

console.log(divRef); // undefined

onMount(() => {
  console.log(divRef); // <div> element
})

return (
  <div ref={divRef}/>
)
```

This presents a challenge for typing that variable: should we type `divRef` 
as an `HTMLDivElement`, even though it's only set as such after rendering?
(Here we assume TypeScript's `strictNullChecks` mode is turned on;
otherwise, TypeScript ignores potentially `undefined` variables.)

The safest pattern in TypeScript is to acknowledge that `divRef` is `undefined`
for a period of time, and check when using it:

```tsx
let divRef: HTMLDivElement | undefined;

divRef.focus();  // correctly reported as an error at compile time

onMount(() => {
  if (!divRef) return;
  divRef.focus();  // correctly allowed
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

Alternatively, because we know `onMount` gets called only after the `<div>`
element gets rendered, we could use a
[non-null assertion (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
when accessing `divRef` within `onMount`:

```tsx
onMount(() => {
  divRef!.focus();
});
```

Another fairly safe pattern is to omit `undefined` from `divRef`'s type,
and use a
[definite assignment assertion (`!`)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions)
in the `ref` attribute:

```tsx
let divRef: HTMLDivElement;

divRef.focus();  // correctly reported as an error at compile time

onMount(() => {
  divRef.focus();  // correctly allowed
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

We need to use `ref={divRef!}` because TypeScript assumes that the `ref`
attribute is being set to the `divRef` variable, and thus `divRef` should
already be assigned.  In Solid, it's the other way around: `divRef` gets
assigned to by the `ref` attribute.  The definite assignment assertion
`divRef!` effectively convinces TypeScript that this is what's happening:
TypeScript will understand that `divRef` has been assigned after this line.

With this pattern, TypeScript will correctly flag any accidental uses of
refs inside the body of the function (before the JSX block where they get
defined).  However, TypeScript currently does not flag use of potentially
undefined variables within nested functions.  In the context of Solid,
you need to take care not to use refs inside `createMemo`, `createRenderEffect`,
and `createComputed` (before the JSX block that defines the refs),
because those functions are called immediately,
so the refs won't be defined yet (yet TypeScript won't flag this as an error).
By contrast, the previous pattern would catch these errors.

Another common, but less safe, pattern is to put the definite assignment
assertion at the point of variable declaration.

```tsx
let divRef!: HTMLDivElement;

divRef.focus();  // allowed despite causing an error

onMount(() => {
  divRef.focus();  // correctly allowed
});

return (
  <div ref={divRef}>
    ...
  </div>
);
```

This approach effectively turns off assignment checking for that variable,
which is an easy workaround, but requires additional care.
In particular, unlike the previous pattern, it incorrectly allows premature
use of the variable, even outside nested functions.

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
   from scratch every time `name()` changes, instead of doing this just when `name()` changes from a falsy to a truthy value.
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
