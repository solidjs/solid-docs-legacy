# TypeScript

Solid 被设计为易于与 TypeScript 一起使用：它使用标准 JSX 使代码在很大程度上被 TypeScript 理解，并且它为其 API 提供了复杂的内置类型。本指南涵盖了使用 TypeScript 和编写 Solid 代码的一些有用技巧。

## 配置 TypeScript

[Solid starter templates](https://github.com/solidjs/templates/) 为 [`tsconfig.json`](https://github.com/solidjs/templates/blob/master/ts/tsconfig.json) 提供了良好的起点

最重要的是，要将 TypeScript 与 Solid JSX 编译器一起使用，您需要通过 [`"jsx": "preserve"`](https://www.typescriptlang.org/tsconfig#jsx) 配置 TypeScript 以单独保留 JSX 结构， 并通过 [`"jsxImportSource": "solid-js"`](https://www.typescriptlang.org/tsconfig#jsxImportSource) 告诉 TypeScript JSX 类型来自哪里。所以，一个最小的 `tsconfig.json` 看起来像这样：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

如果您的代码库混合使用 JSX 类型（例如，一些文件是 React 而其他文件是 Solid），您可以在 `tsconfig.json` 中为大部分代码设置默认的 `jsxImportSource`，然后 [覆盖 `jsxImportSource` 选项](https://www.typescriptlang.org/tsconfig#jsxImportSource) 在特定 `.tsx` 文件中使用以下编译指示：

```ts
/** @jsxImportSource solid-js */
```

或

```ts
/** @jsxImportSource react */
```

## API 类型

Solid 是用 TypeScript 编写的，所以一切都是开箱即用的。[API 文档](https://www.solidjs.com/docs/latest/api) 详细介绍了所有 API 调用的类型，以及几个有用的类型定义，以便在需要指定显式类型时更轻松地引用 Solid 概念。在这里，我们在使用一些核心 API 时探索生成的类型。

### Signals

`createSignal<T>` 由存储在 signal 中的对象的类型 `T` 参数化。例如：

```ts
const [count, setCount] = createSignal<number>();
```

第一个 `createSignal` 的返回类型为 `Signal<number>`，对应于我们传递给它的类型。这是 getter 和 setter 的元组，它们都有一个泛型类型：

```ts 
import type { Signal, Accessor, Setter } from 'solid-js';
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
```

在这种情况下，signal getter `count` 的类型为 `Accessor<number | undefined>`。`Accessor<T>` 是 Solid 提供的类型定义，在这种情况下等同于 `() => number | undefined`。在这个例子中添加了 `| undefined`，因为我们没有为 `createSignal` 提供默认值，所以 signal 值确实以 `undefined` 开头。

signal setter `setCount` 的类型是 `Setter<number>`，这是一个比较复杂的类型定义，大致对应于 `(value?: number | ((prev?: number) => number)) => number`，表示传递参数的两种可能性：您可以使用 `number` 调用`setCount` 或使用前一个值（如果有的话）并返回 `number` 的函数。

实际的 `Setter` 类型更复杂，当您可能希望将 signal 设置为该函数值而不是调用函数以确定新值时，检测意外将函数传递给 setter。如果在调用 `setCount(value)` 时遇到 TypeScript 错误 “Argument ... is not assignable to parameter”，请尝试将 setter 参数包装为 `setCount(() => value)` 以确保 `value` 没有被调用。

##### 默认

我们可以避免在调用 `createSignal` 时显式提供信号的类型，并通过为 `createSignal` 提供默认值来避免类型的 `| undefined` 部分：

```ts
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('');
```

在这种情况下，TypeScript 推断信号类型分别是 `number` 和 `string`。因此，例如，`count` 获得类型 `Accessor<number>` 并且 `name` 获得类型 `Accessor<string>`（没有 `| undefined`）。

### Context

与 signal 类似，[`createContext<T>`](https://www.solidjs.com/docs/latest/api#createcontext) 由上下文值的类型 `T` 参数化。我们可以明确地提供这种类型：


```ts
type Data = {count: number, name: string};
const dataContext = createContext<Data>();
```

在这种情况下，`dataContext` 的类型为 `Context<Data | undefined>`，导致 `useContext(dataContext)` 具有匹配的返回类型 `Data | undefined`。`| undefined` 的原因是当前组件的祖先可能没有提供上下文，在这种情况下，`useContext` 返回 `undefined`。

如果我们改为为 `createContext` 提供默认值，我们避免了类型的 `| undefined` 部分，并且通常还避免了显式指定 `createContext` 的类型：

```ts
const dataContext = createContext({count: 0, name: ''});
```

在这种情况下，TypeScript 推断 `dataContext` 的类型为 `Context<{count: number, name: string}>`，相当于 `Context<Data>`（没有 `| undefined`）。

另一种常见的模式是定义一个为上下文生成值的工厂函数。然后我们可以使用 TypeScript 的 [`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype) 类型助手获取该函数的返回类型，并使用它来键入上下文 ：

```ts
export const makeCountNameContext = (initialCount = 0, initialName = '') => {
  const [count, setCount] = createSignal(initialCount);
  const [name, setName] = createSignal(initialName);
  return [{count, name}, {setCount, setName}] as const;
    // `as const` 强制元组类型推断
};
type CountNameContextType = ReturnType<typeof makeCountNameContext>;
export const CountNameContext = createContext<CountNameContextType>();
export const useCountNameContext = () => useContext(CountNameContext);
```

在本例中，`CountNameContextType` 对应于 `makeCountNameContext` 的返回值：

```ts
[
  {readonly count: Accessor<number>, readonly name: Accessor<string>},
  {readonly setCount: Setter<number>, readonly setName: Setter<string>}
]
```

并且 `useCountNameContext` 的类型为 `() => CountNameContextType | undefined`。

如果您想避免 `undefined` 的可能性，您可以断言在使用时始终提供上下文：

```ts
export const useCountNameContext = () => useContext(CountNameContext)!;
```

这是一个危险的假设。实际上为`createContext`提供一个默认参数会更安全，以便始终定义上下文。

## 组件类型

```ts
import type { JSX, Component } from 'solid-js';
type Component<P = {}> = (props: P) => JSX.Element;
```

要键入基本组件函数，请使用 `Component<P>` 类型，其中 `P` 是 `props` 参数的类型，应该是 [object type](https://www.typescriptlang.org/docs/handbook/2/objects.html)。这将强制正确类型的 props 作为属性传入，并且返回值可以由 Solid 呈现：`JSX.Element` 可以是 DOM 节点、`JSX.Element` 的数组、函数返回一个`JSX.Element`、一个布尔值、`undefined`/`null`等。这里有一些例子：

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

如果您希望组件采用 JSX children，您可以显式地将 `children` 类型添加到 `P` 中，或者您可以使用自动添加 `children?: JSX.Element` 的 `ParentComponent` 类型。或者，如果你想用 `function` 而不是 `const` 来声明你的组件，你可以使用 `ParentProps` 帮助器来输入 `props`。一些例子：

```tsx
import { JSX, ParentComponent, ParentProps } from 'solid-js';
type ParentProps<P = {}> = P & { children?: JSX.Element };
type ParentComponent<P = {}> = Component<ParentProps<P>>;

// 等效类型:
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

// 等效类型:
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

在后一个示例中，`props` 参数自动输入为 `props: ParentProps<{initial: number}>`，相当于 `props: {initial: number, children?: JSX.Element}`。（注意，在 Solid 1.4 之前，`Component` 等同于 `ParentComponent`。）

Solid 提供了另外两个 `Component` 子类型来处理 `children`：

```ts
import {JSX, FlowComponent, FlowProps, VoidComponent, VoidProps} from 'solid-js';
type FlowProps<P = {}, C = JSX.Element> = P & { children: C };
type FlowComponent<P = {}, C = JSX.Element> = Component<FlowProps<P, C>>;
type VoidProps<P = {}> = P & { children?: never };
type VoidComponent<P = {}> = Component<VoidProps<P>>;
```

`Void Component` 适用于绝对不支持 `children` 的组件。当 `P` 没有为 `children` 提供类型时，`Void Component<P>` 等价于 `Component<P>`。

`FlowComponent` 用于 “控制流” 组件，例如 Solid 的 `<Show>` 和 `<For>`。这样的组件通常需要 `children` 才有意义，并且有时有 `children` 的特定类型，例如要求它是单个函数。例如：

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

## 事件处理程序

命名空间 `JSX` 提供了一套特别适用于 HTML DOM 的有用类型。请参阅 [dom-expressions 中 JSX 的定义](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts) 了解提供的所有类型。

`JSX` 命名空间提供的一种有用的帮助类型是 `JSX.EventHandler<T, E>`，它表示 DOM 元素类型 `T` 和事件类型 `E` 的单参数事件处理程序。您可以使用它来键入您在 JSX 之外定义的任何事件处理程序。例如：

```tsx
import type { JSX } from 'solid-js';
const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
  console.log('input changed to', event.currentTarget.value);
};

<input onInput={onInput}/>
```

在 [`on___` JSX 属性](https://www.solidjs.com/docs/latest/api#on___) 中内联定义的处理程序（具有内置事件类型）会自动键入适当的 `JSX.EventHandler`：

```tsx
<input onInput={(event) => {
  console.log('input changed to', event.currentTarget.value);
}}/>;
```

请注意，`JSX.EventHandler<T>` 将事件的 [`currentTarget` 属性](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget) 限制为类型为 `T `（在示例中，`event.currentTarget` 的类型为 `HTMLInputEvent`，因此具有属性 `value`）。但是，事件的 [`target` 属性](https://developer.mozilla.org/en-US/docs/Web/API/Event/target) 可以是任何 `DOMElement`。这是因为 `currentTarget` 是事件处理程序附加到的元素，因此具有已知类型，而 `target` 是用户与之交互的任何内容，导致事件冒泡或被事件处理程序捕获，这可以是任何 DOM 元素。


## ref 属性

当我们使用带有变量的 `ref` 属性时，我们告诉 Solid 在元素渲染后将 DOM 元素分配给变量。如果没有 TypeScript，这看起来像：

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

这对键入该变量提出了挑战：我们是否应该将 `divRef` 键入为 `HTMLDivElement`，即使它只是在渲染后才设置的？（这里我们假设 TypeScript 的 `strictNullChecks` 模式已打开；否则，TypeScript 会忽略潜在的 `undefined` 变量。）

TypeScript 中最安全的模式是在一段时间内确认 `divRef` 为 `undefined`，并在使用时进行检查：

```tsx
let divRef: HTMLDivElement | undefined;

divRef.focus();  // 在编译时正确报告为错误

onMount(() => {
  if (!divRef) return;
  divRef.focus();  // 正确允许
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

或者，因为我们知道 `onMount` 仅在 `<div>` 元素被渲染后才被调用，在 `onMount` 中访问 `divRef` 时，我们可以使用 [非空断言 (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-) ：

```tsx
onMount(() => {
  divRef!.focus();
});
```

另一个相当安全的模式是从 `divRef` 的类型中省略 `undefined`，并在 `ref` 属性中使用 [确定赋值断言 (`!`)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions)：

```tsx
let divRef: HTMLDivElement;

divRef.focus();  // 在编译时正确报告为错误

onMount(() => {
  divRef.focus();  // 正确允许
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

我们需要使用 `ref={divRef!}`，因为 TypeScript 假定 `ref` 属性被设置为 `divRef` 变量，因此应该已经分配了 `divRef`。在 Solid 中，情况正好相反：`divRef` 由 `ref` 属性分配。明确的赋值断言 `divRef!` 有效地让 TypeScript 相信这是正在发生的事情：TypeScript 将理解在这一行之后已经分配了 `divRef`。

使用这种模式，TypeScript 将正确地标记函数体内任何意外使用 refs（在定义它们的 JSX 块之前）。但是，TypeScript 目前没有标记嵌套函数中潜在未定义变量的使用。在 Solid 的上下文中，您需要注意不要在 `createMemo`、`createRenderEffect` 和 `createComputed` 中使用 refs（在定义 refs 的 JSX 块之前），因为这些函数会立即调用，所以 refs 不会被定义（但 TypeScript 不会将此标记为错误）。相比之下，之前的模式会捕获这些错误。

另一种常见但不太安全的模式是将明确的赋值断言放在变量声明的位置。

```tsx
let divRef!: HTMLDivElement;

divRef.focus();  // 尽管导致错误，但仍允许

onMount(() => {
  divRef.focus();  // 正确允许
});

return (
  <div ref={divRef}>
    ...
  </div>
);
```

这种方法有效地关闭了对该变量的赋值检查，这是一种简单的解决方法，但需要额外注意。特别是，与之前的模式不同，它错误地允许过早使用变量，甚至在嵌套函数之外。

## 控制流缩小

一种常见的模式是仅在定义数据时使用 [`<Show>`](https://www.solidjs.com/docs/latest/api#%3Cshow%3E) 来显示数据：

```tsx
const [name, setName] = createSignal<string>();

return (
  <Show when={name()}>
    Hello {name().replace(/\s+/g, '\xa0')}!
  </Show>
);
```

在这种情况下，TypeScript 无法确定对 `name()` 的两次调用是否会返回相同的值，并且只有在第一次调用返回真值时才会发生第二次调用。因此它会在尝试调用 `.replace()` 时抱怨 `name()` 可能是 `undefined`。

以下是针对此问题的两种解决方法：

1. 您可以使用 TypeScript 的 [非空断言运算符 `!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-) 在第二次调用中手动断言 `name()` 将是非空的：

   ```tsx
   return (
     <Show when={name()}>
       Hello {name()!.replace(/\s+/g, '\xa0')}!
     </Show>
   );
   ```

2. 可以使用 `<Show>` 的回调形式，当它为真时传入 `when` 属性的值：

   ```tsx
   return (
     <Show when={name()}>
       {(n) =>
         <>Hello {n.replace(/\s+/g, '\xa0')}!</>
       }
     </Show>
   );
   ```

   在这种情况下，`Show` 组件的类型足够聪明，可以告诉 TypeScript `n` 是真的，所以它不能是 `undefined`（或 `null` 或 `false`）。

   但是请注意，这种形式的 `<Show>` 会在每次 `name()` 更改时强制所有子级从头开始渲染，而不是只在 `name()` 从假值变为真值时这样做。这意味着 children 没有获得细粒度响应性的全部好处（重新使用未更改的部分并更新已更改的部分）。

## Special JSX Attributes and Directives

### `on:___`/`oncapture:___`

如果您通过 Solid 的 [`on:___`/`oncapture:___` 属性](https://www.solidjs.com/docs/latest/api#on%3A___%2Foncapture%3A___) 使用自定义事件处理程序，您应该通过覆盖模块 `"solid -js"`的`JSX`命名空间，像这样：

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

如果您通过 Solid 的 [`prop:___` 属性](https://www.solidjs.com/docs/latest/api#prop%3A___) 使用强制属性，或通过 Solid 的 [`attr:___` 属性](https://www.solidjs.com/docs/latest/api#attr%3A___) 使用自定义属性，则可以分别在 `ExplicitProperties` 和 `ExplicitAttributes` 接口中定义它们的类型：

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

如果您为 Solid 的 [`use:___` 属性](https://www.solidjs.com/docs/latest/api#use%3A___) 定义自定义指令，您可以在 `Directives` 界面中键入它们，如下所示 ：

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

如果你从另一个模块中导入指令 `d`，并且 `d` 仅用作指令 `use:d`，那么 TypeScript（或更准确地说，[`babel-preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript)） 默认情况下会删除 `d` 的 `import`（因为担心 `d` 是一种类型，因为 TypeScript 不理解 `use:d` 作为对 `d` 的引用）。有两种方法可以解决这个问题：

1. 使用 [`babel-preset-typescript` 的 `onlyRemoveTypeImports: true`] 配置选项，它可以防止删除除 `import type ...` 之外的任何 `import`。如果你使用 `vite-plugin-solid`，你可以通过 `vite.config.ts` 中的 `solidPlugin({ typescript: { onlyRemoveTypeImports: true } })` 指定这个选项。

   请注意，如果您没有在整个代码库中谨慎地使用 `export type` 和 `import type`，则此选项可能会出现问题。

2. 为每个模块 `import` 指令 `d` 添加一个虚假访问，例如 `false && d;`。这将阻止 TypeScript 删除 `d` 的 `import`，并假设您通过例如 `Terser` 进行 tree-shaking，此代码将从您的最终代码包中省略。

   更简单的假访问 `d;` 也将阻止 `import` 被删除，但通常不会被摇树掉，因此最终会出现在您的最终代码包中。




    