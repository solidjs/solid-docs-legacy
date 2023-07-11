# 响应性基础

Solid 响应性原理大致上是将任何响应性计算封装在函数中，并在其依赖关系更新时重新运行该函数。Solid JSX 编译器还用一个函数包装了大多数 JSX 表达式（括号中的代码），因此当依赖关系发生变化时，它们会自动更新（并触发相应的 DOM 更新）。更准确地说，每当函数在跟踪范围内被调用时，就会自动重新运行该函数，例如 JSX 表达式或构建 “计算” 的 API 调用（`createEffect`, `createMemo` 等）。默认情况下，在跟踪范围内调用函数时，通过检测函数何时读取反应状态（例如，通过 signal getter 或 Store 属性），自动跟踪函数的依赖关系。因此，您通常不需要担心依赖关系。（但是，如果自动依赖项跟踪无法产生您想要的结果，您可以 [覆盖依赖项跟踪](#reactive-utilities)）这种方法使响应性可组合：在另一个函数中调用一个函数通常会导致调用函数继承被调用函数的依赖关系。

## `createSignal`

```ts
import { createSignal } from "solid-js";

function createSignal<T>(
  initialValue: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];

// createSignal 的返回值的可用类型:
import type { signal, Accessor, Setter } from "solid-js";
type signal<T> = [get: Accessor<T>, set: Setter<T>];
type Accessor<T> = () => T;
type Setter<T> = (v: T | ((prev?: T) => T)) => T;
```

 signal 是最基本的响应性 API。它们跟踪随时间变化的单个值（可以是任何 JavaScript 对象）。Signal 的值开始时等于传递的第一个参数 `initialValue`（如果没有参数，则为 `undefined` ）。`createSignal` 函数返回两个元素的数组：getter（或 accessor）和 setter。您可以将此数组分解为命名的 Signal，如下所示：


```js
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);
```
调用 getter（例如 `count()` 或 `ready()`）返回 signal 的当前值。对于自动依赖性跟踪至关重要，在跟踪范围内调用 getter 会导致调用函数依赖于这个 signal，因此如果 signal 更新，该函数将重新运行。

调用 setter（例如 `setCount(nextCount)` 或 `setReady(nextReady)`）设置 signal 的值，并在该值实际更改时更新 signal（触发依赖项重新运行）（请参见下文详细信息）。作为其唯一的参数，setter 要么取 signal 的新值，要么取将signal 的最后一个值映射到新值的函数。setter 还返回更新的值。例如：

```js
// 读取信号的当前值，如果在跟踪范围内则依赖 signal (在跟踪范围外无反应)
const currentCount = count();

// 或者用一个函数包装任何计算，这个函数可以在跟踪范围内使用：
const doubledCount = () => 2 * count();

// 或建立一个跟踪范围并依赖于 signal ：
const countDisplay = <div>{count()}</div>;

// 通过提供一个值，写入signal：
setReady(true);

// 通过提供一个函数，写入 signal：
const newCount = setCount((prev) => prev + 1);
```

> 如果要在 signal 中存储函数，必须使用函数形式：
>
> ```js
> setValue(() => myFunction);
> ```
>
> 然而，函数不被特别视为 `createSignal` 的 `initialValue` 参数，因此您应该按原样传递函数初始值：
> ```js
> const [func, setFunc] = createSignal(myFunction);
> ```

##### Options

Solid 中的几个 API 将 "options" 对象作为可选的最后一个参数。

`createSignal` 的选项对象允许您提供 `equals` 选项。例如：

```js
const [getValue, setValue] = createSignal(initialValue, { equals: false });
```

默认情况下，当调用 signal 的 setter 时，根据 JavaScript 的 `===` 运算符，仅当新值实际上不同于旧值时，signal 才会更新（并导致依赖项重新运行）。

或者，您可以将 `equals` 设置为 `false` 以在调用 setter 后始终重新运行依赖项，或者您可以传递自己的函数来测试相等性。一些例子：

```js
// 使用 { equals: false } 允许就地修改对象； 通常这不会被视为更新，因为对象在更改前后具有相同的身份
const [object, setObject] = createSignal({ count: 0 }, { equals: false });
setObject((current) => {
  current.count += 1;
  current.updated = new Date();
  return current;
});

// 使用 { equals: false } signal 作为没有值的触发器：
const [depend, rerun] = createSignal(undefined, { equals: false });
// 现在在跟踪范围内调用 depend() 使该范围在 rerun() 被调用时重新运行

// 根据字符串长度定义相等：
const [myString, setMyString] = createSignal("string", {
  equals: (oldVal, newVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // 被认为等于最后一个值并且不会导致更新
setMyString("stranger"); // 被认为不同，将导致更新
```

## `createEffect`

```ts
import { createEffect } from "solid-js";

function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Effect 是一种使任意代码（“副作用”）在依赖项发生变化时运行的通用方法，例如，手动修改 DOM。`createEffect` 创建一个新的计算，在跟踪范围内运行给定函数，从而自动跟踪其依赖关系，并在依赖关系更新时自动重新运行函数。例如：

```js
const [a, setA] = createSignal(initialValue);

// 依赖于 signal `a` 的 effect
createEffect(() => doSideEffect(a()));
```

调用 effect 函数时，参数等于 effect 函数上次执行或第一次调用时返回的值，等于 `createEffect` 的可选第二个参数。这允许您计算差异，而无需创建额外的闭包来记住最后计算的值。例如：

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log("sum 更改为: ", sum);
  return sum;
}, 0);
```

effect 主要用于读取但不写入反应系统的副作用：最好避免在 effect 中设置 signal，如果不小心可能会导致额外的渲染甚至无限 effect 循环。相反，更喜欢使用 [`createMemo`](#creatememo) 来计算依赖于其他响应式值的新值，因此响应式系统知道什么依赖于什么，并可以相应地进行优化。

effect 函数的第一次执行不是立即执行的；它计划在当前渲染阶段之后运行（例如，在调用传递给 [`render`](#render)、[`createRoot`](#createroot) 或 [`runWithOwner`](#runwithowner) 的函数之后）。如果要等待第一次执行发生，请使用 [`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)（在浏览器呈现 DOM 之前运行）或 `await Promise.resolve()` 或 `setTimeout(..., 0)`（在浏览器渲染）。

```js
// 假设此代码在组件函数中，因此是渲染阶段的一部分
const [count, setCount] = createSignal(0);

// 这个 effect 在开始时和更改时打印 count 
createEffect(() => console.log("count =", count()));
// effect 还没有运行
console.log("hello");
setCount(1); // effect 仍然不会运行
setCount(2); // effect 仍然不会运行

queueMicrotask(() => {
  // 现在将打印 `count = 2` 
  console.log("microtask");
  setCount(3); // 立即打印 `count = 3`
  console.log("goodbye");
});

// --- 所有的打印输出: ---
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

首次执行的延迟很有用，因为它意味着在组件范围内定义的 effect 在组件返回的 JSX 被添加到 DOM 之后运行。特别是，[`ref`](#ref) 已经被设置了。因此，您可以使用 effect 手动操作 DOM、调用原生 JS 库或其他副作用。

请注意，effect 的第一次运行仍然在浏览器将 DOM 渲染到屏幕之前运行（类似于 React 的 `useLayoutEffect`）。如果你需要等到渲染之后（例如，测量渲染），你可以使用 `await Promise.resolve()` （或 `Promise.resolve().then(...)`），但注意后续使用响应状态（例如 signal）不会触发 effect 重新运行，因为在 `async` 函数使用 `await` 后无法进行跟踪。因此，您应该在 promise 之前使用所有依赖项。

如果您希望 effect 在第一次运行时立即运行，使用 [`createRenderEffect`](#createrendereffect) 或 [`createComputed`](#createcomputed)。

您可以通过在 effect 函数中调用 `onCleanup` 来清理 effect 函数执行之间的副作用。这样的清理函数在 effect 执行之间和 effect 被释放时都会被调用（例如，卸载包含的组件）。例如：

```js
// 监听由 eventName signal 动态给出的事件
createEffect(() => {
  const event = eventName();
  const callback = (e) => console.log(e);
  ref.addEventListener(event, callback);
  onCleanup(() => ref.removeEventListener(event, callback));
});
```

## `createMemo`

```ts
import { createMemo } from "solid-js";

function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

memo 让您在许多响应式计算中有效地使用派生值。`createMemo` 创建一个与给定函数的返回值相等的只读响应值，并确保该函数仅在其依赖关系发生变化时才被执行。

```js
const value = createMemo(() => computeExpensiveValue(a(), b()));

// 读取 value
value();
```

在 Solid 中，您通常不需要将函数包装在 memo 中。您也可以只定义并调用一个常规函数来获得类似的响应行为。主要区别在于您在多个响应设置中调用该函数时。在这种情况下，当函数的依赖项更新时，函数将被多次调用，除非它被包装在 `createMemo` 中。例如：

```js
const user = createMemo(() => searchForUser(username()));
// 与它比较: const user = () => searchForUser(username());
return (
  <ul>
    <li>Your name is "{user()?.name}"</li>
    <li>
      Your email is <code>{user()?.email}</code>
    </li>
  </ul>
);
```

当 `username` 信号更新时，`searchForUser` 只会被调用一次。如果返回的用户确实发生了变化，则 `user` memo 会更新，然后两个列表项都会自动更新。

如果我们将 `user` 定义为普通函数 `() => searchForUser(username())`，那么 `searchForUser` 将被调用两次，在更新每个列表项时执行一次。

另一个关键区别是，当 memo 的依赖项发生变化但生成的 memo 值不变时， memo 可以屏蔽依赖项进行更新。与[`createSignal`](#createsignal) 一样，根据 JavaScript 的 `===` 运算符，`createMemo` 生成的派生 signal 仅在 memo 函数返回的值实际从前一个值更改时才更新（并触发依赖项重新运行）。或者，您可以传递一个将 `equals` 设置为 `false` 的选项对象，以便在其依赖项更改时始终更新 memo ，或者您可以传递自己的 `equals` 函数来测试相等性。

调用 memo 函数时，参数等于 memo 函数上次执行或第一次调用时返回的值，等于 `createMemo` 的可选第二个参数。这对于减少计算很有用，例如：

```js
// 跟踪 `input()` 在更新时获取的所有值的总和
const sum = createMemo((prev) => input() + prev, 0);
```

memo 函数不应该通过调用 setter 来改变其他 signal（它应该是“纯的”）。这使得 Solid 能够根据其依赖关系图优化 memo 更新的执行顺序，以便所有 memo 最多可以更新一次以响应依赖关系的变化。

## `createResource`

```ts
import { createResource } from "solid-js";
import type { ResourceReturn } from "solid-js";

type ResourceReturn<T> = [
  {
    (): T | undefined;
    state: "unresolved" | "pending" | "ready" | "refreshing" | "errored"
    loading: boolean;
    error: any;
    latest: T | undefined;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: (info: unknown) => Promise<T> | T;
  }
];

export type ResourceOptions<T, S = unknown> = {
  initialValue?: T;
  name?: string;
  deferStream?: boolean;
  ssrLoadFrom?: "initial" | "server";
  storage?: (init: T | undefined) => [Accessor<T | undefined>, Setter<T | undefined>];
  onHydrated?: (k: S | undefined, info: { value: T | undefined }) => void;
};

function createResource<T, U = true>(
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: ResourceOptions<T, U>
): ResourceReturn<T>;

function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: ResourceOptions<T, U>
): ResourceReturn<T>;
```

创建一个反映异步请求结果的 signal。

`createResource` 接受一个异步 fetcher 函数并返回一个信号，当 fetcher 完成时，该 signal 会使用结果数据进行更新。

有两种使用 `createResource` 的方法：您可以将 fetcher 函数作为唯一参数传递，或者您可以另外传递一个源 signal 作为第一个参数。每当源 signal 发生变化时，它都会重新触发 fetcher，并将其值传递给 fetcher。

```js
const [data, { mutate, refetch }] = createResource(fetchData);
```

```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData);
```

在这些片段中，fetcher 是函数 `fetchData` ，并且 `data()` 在 `fetchData` 完成解析之前是 undefined。在第一种情况下，`fetchData` 将被立即调用。

在第二种情况下，一旦 `sourceSignal` 具有除 `false`、`null` 或 `undefined` 之外的任何值，`fetchData` 将被调用。

每当 `sourceSignal` 的值发生变化时，都会再次调用它，并且该值将始终作为第一个参数传递给 `fetchData`。

您可以调用 `mutate` 来直接更新 `data` signal（它的工作方式与任何其他 signal setter 一样）。您还可以调用 `refetch` 直接重新运行 fetcher，并传递一个可选参数以向 fetcher 提供附加信息：`refetch(info)`。

`data` 像一个普通的 signal getter 一样工作：使用 `data()` 来读取 `fetchData` 的最后一个返回值。但它还有额外的响应属性：`data.loading` 告诉你是否调用了 fetcher 但没有返回。`data.error` 告诉你请求是否出错，如果出错，它将包含 fetcher 抛出的错误。（注意：如果您预计会出现错误，您可能需要将 `createResource` 包装在 [ErrorBoundary](#<errorboundary>) 中

从 **1.4.0** 开始，`data.latest` 将返回最后一个返回值，不会触发 [Suspense](#<suspense>) 和 [transitions](#usetransition)。如果还没有返回值，`data.latest` 的行为与 `data()` 相同。如果您想在加载新数据时显示过期数据，这将很有用。

`loading`、`error` 和 `latest` 是响应式 getter，可以被跟踪。

`fetcher` 是您提供给 `createResource` 以实际获取数据的异步函数。它被传递了两个参数：源 signal 的值（如果提供），以及一个具有两个属性的信息对象：`value` 和 `refetching`。`value` 告诉你之前获取的值。如果使用 `refetch` 函数触发了 fetcher，则 `refetching` 为 `true`，否则为 `false`。如果使用参数 (`refetch(info)`) 调用 `refetch` 函数，则将 `refetching` 设置为该参数。

```js
async function fetchData(source, { value, refetching }) {
  // 获取数据并返回一个值。
  // `source` 告诉你源 signal 的当前值
  // `value` 告诉你 fetcher 的最后一个返回值；
  // 当调用 `refetch()` 触发 fetcher 时，`refetching` 为 true，
  // 或等于传递的可选数据：`refetch(info)`
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// 读取 value
data();

// 检查是否正在 loading
data.loading;

// 检查是否报错 
data.error;

// 直接设置 value 而不创建 promise
mutate(optimisticValue);

// 显式重新获取最后一个请求
refetch();
```

**v1.4.0 中的新功能**

如果你使用 `renderToStream`，你可以告诉 Solid 在使用 `deferStream` 选项刷新流之前等待资源：

```js
// 尽快获取用户并流式传输内容
const [user] = createResource(() => params.id, fetchUser);

// 获取 user，但仅在加载此资源后才流式传输内容
const [user] = createResource(() => params.id, fetchUser, {
  deferStream: true,
});
```

**v1.5.0 中的新功能**

我们添加了一个新的 `state` 字段，它涵盖了 `loading` 和 `error` 之外的更详细的资源状态。您现在可以检查资源是否为 `"unresolved"`、`"pending"` 、`"ready"`、`"refreshing"` 或 `"error"`。

| state      | value resolved | loading | has error |
| ---------- | -------------- | ------- | --------- |
| unresolved | No             | No      | No        |
| pending    | No             | Yes     | No        |
| ready      | Yes            | No      | No        |
| refreshing | Yes            | Yes     | No        |
| errored    | No             | No      | Yes       |

**v1.5.0 中的新功能**

当服务器渲染资源时，尤其是在将 Solid 嵌入在渲染前获取的其他系统中进行获取时，您可能希望使用此预取值启动资源，而不是再次获取并且让资源序列化它不是自己的状态。您可以为此使用新的 `ssrLoadFrom` 选项。除了使用默认的 `"server"` 值，您可以传递 `"initial"`，资源将使用 `initialValue`，就好像它是第一次获取 SSR 和 hydration 的结果一样。

**v1.5.0 中的新功能** *实验性*

资源可以通过使用 `storage` 选项设置为具有与 signal 相同签名的自定义存储。例如，可以通过以下方式使用自定义协调存储：

```ts
function createDeepSignal<T>(value: T): signal<T> {
  const [store, setStore] = createStore({
    value
  });
  return [
    () => store.value,
    (v: T) => {
      const unwrapped = unwrap(store.value);
      typeof v === "function" && (v = v(unwrapped));
      setStore("value", reconcile(v));
      return store.value;
    }
  ] as signal<T>;
}

const [resource] = createResource(fetcher, {
  storage: createDeepSignal
});
```

# 生命周期

## `onMount`

```ts
import { onMount } from "solid-js";

function onMount(fn: () => void): void;
```

注册一个在初始渲染和元素安装后运行的方法。非常适合使用 `ref` 和管理其他一次性副作用。它相当于一个没有任何依赖关系的 `createEffect`。

## `onCleanup`

```ts
import { onCleanup } from "solid-js";

function onCleanup(fn: () => void): void;
```

注册一个清理方法，该方法在当前反应范围的清除或重新计算时执行。可以在任何组件或 Effect 中使用。

## `onError`

```ts
import { onError } from "solid-js";

function onError(fn: (err: any) => void): void;
```

注册在子作用域出错时执行的错误处理程序方法。仅执行最近的作用域错误处理程序。重新抛出可以向上触发。

# 响应性工具类

这些工具类提供了更好地安排更新和控制如何跟踪响应性的能力。

## `untrack`

```ts
import { untrack } from "solid-js";

function untrack<T>(fn: () => T): T;
```

忽略跟踪执行代码块中的任何依赖项并返回值。

## `batch`

```ts
import { batch } from "solid-js";

function batch<T>(fn: () => T): T;
```

在块内保持执行下游计算直到结束，以防止不必要的重新计算。[Solid Store](#createstore) 的 set 方法、[Mutable Store](#createmutable) 的数组方法和 effect 会自动将它们的代码打包成批处理。

## `on`

```ts
import { on } from "solid-js";

function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` 用来将其传递到计算行为中以使其依赖项更加清晰明了。如果传递依赖项是数组，则 `input` 和 `prevInput` 也是数组。

```js
createEffect(on(a, (v) => console.log(v, b())));

// 等同于：
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

你也可以不用立即执行计算，而是通过将 defer 选项设置为 true 来选择仅在更改时运行计算。

```js
// 现在会运行了
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // 现在会运行了
```

请注意，在 `stores` 和 `mutable` 上，从父对象中添加或删除属性会触发 effect。参见[`createMutable`](#createMutable)

## `createRoot`

```ts
import { createRoot } from "solid-js";

function createRoot<T>(fn: (dispose: () => void) => T): T;
```

创建一个崭新的，不自动释放的，非跟踪上下文。在嵌套响应式上下文的情况下，如果你不希望在父级重新求值时释放资源这个特性会很有用。这是一种强大的缓存模式。

所有 Solid 代码都应被 createRoot 包裹，因为它们确保释放所有内存/计算。通常你不需要担心这个，因为 `createRoot` 被嵌入到所有的 `render` 入口函数中。

## `getOwner`

```ts
import { getOwner } from "solid-js";

function getOwner(): Owner;
```

获取拥有当前运行代码的响应范围，例如，用于在当前范围之外传递到稍后对 `runWithOwner` 的调用。

在内部，计算（effect、memo 等）创建的所有者（effect、memo 等）是其所有者的孩子，一直到由 `createRoot` 或 `render` 创建的根所有者。此所有权树允许 Solid 通过遍历其子树并调用所有 [`onCleanup`](#oncleanup) 回调来自动清理已处理的计算。例如，当 `createEffect` 的依赖项发生变化时，效果会在再次运行效果函数之前调用所有后代的 `onCleanup` 回调。调用 `getOwner` 返回负责处理当前执行块的当前所有者节点。

组件不是计算，所以不要创建所有者节点，但它们通常是从 `createEffect` 渲染的，所以结果是相似的：当组件被卸载时，所有后代的 `onCleanup` 回调都会被调用。从组件范围调用 `getOwner` 会返回负责渲染和卸载该组件的所有者。

请注意，拥有的响应范围不一定是跟踪。例如，[`untrack`](#untrack) 关闭函数期间的跟踪（不创建新的响应范围），通过 JSX 创建的组件（`<Component ...>`）也是如此。

## `runWithOwner`

```ts
import { runWithOwner } from 'solid-js';

function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

在提供的所有者下执行给定的函数，而不是（并且不影响）外部范围的所有者。默认情况下，由 `createEffect`、`createMemo` 等创建的计算归当前执行代码的所有者所有（`getOwner` 的返回值），因此特别是当它们的所有者这样做时会被释放。调用 `runWithOwner` 提供了一种方法来将此默认值覆盖为手动指定的所有者（通常是先前调用 `getOwner` 的返回值），从而可以更精确地控制何时处理计算。

拥有（正确的）所有者很重要，原因有两个：

- 没有所有者的计算不能被清理。例如，如果您在没有所有者的情况下调用 `createEffect`（例如，在全局范围内），effect 将永远持续运行，而不是在其所有者被释放时被释放。
- [`useContext`](#usecontext) 通过在所有者树上查找提供所需上下文的最近祖先来获取上下文。因此，如果没有所有者，您将无法查找任何提供的上下文（如果所有者错误，您可能会获得错误的上下文）。

在任何所有者范围之外进行响应时，手动设置所有者特别有用。特别是，异步计算（通过 `async` 函数或 `setTimeout` 之类的回调）会丢失自动设置的所有者，因此在这些情况下需要通过 `getOwner` 记住原始所有者并通过 `runWithOwner` 恢复它。例如：

```js
const owner = getOwner();
setTimeout(() => {
  // 此回调在没有所有者的情况下运行。
  // 通过 runWithOwner 恢复所有者：
  runWithOwner(owner, () => {
    const foo = useContext(FooContext);
    createEffect(() => {
      console.log(foo);
    });
  });
}, 1000);
```

请注意，所有者不是决定依赖跟踪的因素，因此 `runWithOwner` 对异步函数中的跟踪没有帮助； 在异步部分（例如，在第一个 `await` 之后）使用响应状态将不会作为依赖项进行跟踪。

## `mergeProps`

```ts
import { mergeProps } from "solid-js";

function mergeProps(...sources: any): any;
```

一个合并响应性对象的方法。用于为组件设置默认 props，以防调用者不提供这些属性值。或者克隆包含响应属性的 props 对象。

此方法通过使用代理并以相反的顺序解析属性来工作。这可以对首次合并 props 对象时不存在的属性进行动态跟踪。


```js
// 默认 props
props = mergeProps({ name: "Smith" }, props);

// 克隆 props
newProps = mergeProps(props);

// 合并 props
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
import { splitProps } from "solid-js";

function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

按照提供的 keys 参数来拆分响应对象。

它需要一个响应对象和任意数量的数组。它将返回数组中指定的那些响应对象，返回的数组中最后一个响应对象将拥有原始对象的所有剩余属性。

如果您想使用 props 的 children，并将剩余属性传递给 Child 组件，这将很有用，如下所示：

```js
function MyComponent(props) {
  const [local, others] = splitProps(props, ["children"]);

  return (
    <>
      <div>{local.children}</div>
      <Child {...others} />
    </>
  );
}
```

因为 `splitProps` 可以接收任意数量的数组，所以我们可以根据需要拆分一个 props 对象（例如，如果我们有多个子组件，每个子组件都需要一个 props 的子集）。

假设一个组件传递了 6 个 props 属性：

```js
<MyComponent a={1} b={2} c={3} d={4} e={5} foo="bar" />;
function MyComponent(props) {
  console.log(props); // {a: 1, b: 2, c: 3, d: 4, e: 5, foo: "bar"}
  const [vowels, consonants, leftovers] = splitProps(
    props,
    ["a", "e"],
    ["b", "c", "d"]
  );
  console.log(vowels); // {a: 1, e: 5}
  console.log(consonants); // {b: 2, c: 3, d: 4}
  console.log(leftovers.foo); // bar
}
```

## `useTransition`

```ts
import { useTransition } from "solid-js";

function useTransition(): [
  pending: () => boolean,
  startTransition: (fn: () => void) => Promise<void>
];
```

用于批量异步更新延迟提交，直到所有异步进程完成。这与 Suspense 相关联，并且仅跟踪在 Suspense 边界下读取的资源。

```js
const [isPending, start] = useTransition();

// 检查是否在 transition 中
isPending();

// 包裹到 transition 中
start(() => setSignal(newValue), () => /* transition 已完成 */)
```

## `startTransition`

**v1.1.0 中的新功能**

```ts
import { startTransition } from 'solid-js';

function startTransition: (fn: () => void) => Promise<void>;
```

类似于`useTransition`，除了没有关联的 pending 状态。这个可以直接用来启动 Transition。

## `observable`

```ts
import { observable } from "solid-js";

function observable<T>(input: () => T): Observable<T>;
```

这个方法接受一个 signal 并产生一个 Observable。您可以从您选择的另一个 Observable 库中使用它，通常使用 `from` 运算符。

```js
// 如何将 rxjs 与 solid.js signal 集成
import { observable } from "solid-js";
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

你也可以使用不带 `rxjs` 的 `from`； 见下文。

## `from`

**v1.1.0 中的新功能**

```ts
import { from } from "solid-js";

function from<T>(
  producer:
    | ((setter: (v: T) => T) => () => void)
    | {
        subscribe: (
          fn: (v: T) => void
        ) => (() => void) | { unsubscribe: () => void };
      }
): () => T;
```

可以更轻松地与外部生产者进行互操作（如 RxJS observables 或 Svelte Store）。这基本上将任何可订阅（具有 `subscribe` 方法的对象）转换为 signal 并管理订阅和释放。

```js
const signal = from(obsv$);
```

它还可以采用自定义生产者函数，其中传递函数一个 setter 函数返回一个取消订阅函数：

```js
const clock = from((set) => {
  const t = setInterval(() => set(1), 1000);
  return () => clearInterval(t);
});
```

> 注意：由 `from` 创建的 signal 关闭了相等性检查，以便更好地与外部交互。

## `mapArray`

```ts
import { mapArray } from "solid-js";

function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

通过引用缓存每个 item，以减少不必要的更新映射。它只对每个值运行一次映射函数，然后根据需要移动或删除它。index 参数是一个 signal。map 函数本身不跟踪。

`<For>` 控制流的底层工具类。

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
    },
    setName,
    setDescription,
  };
});
```

## `indexArray`

```ts
import { indexArray } from "solid-js";

function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

类似于`mapArray`，除了它按 index 映射。该 item 是一个 signal，index 现在是常数。

`<Index>` 控制流的底层工具类。

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

这些 API 在 `solid-js/store` 中可用。它们允许创建存储：允许独立跟踪和修改信号树的 [proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)。

## 使用 Stores

### `createStore`

```ts
import { createStore } from "solid-js/store";
import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
type Store<T> = T;  // conceptually readonly, but not typed as such
```

create 函数将 state 包装在 store 中，并返回一个只读代理对象和一个 setter 函数。

```js
const [state, setState] = createStore(initialValue);

// 读取 value
state.someValue;

// 设置 value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

作为代理，store 对象仅在访问属性时进行跟踪。

当访问嵌套对象时，store 将生成嵌套 store 对象，这适用于整个树。但是，这只适用于数组和普通对象。类没有被包装，所以像 `Date`、`HTMLElement`、`RegExp`、`Map`、`Set` 这样的对象不会像 store 上的属性一样被细粒度地响应。

#### store 中的数组

从 **1.4.0** 版本开始，顶级 state 对象可以是数组。在以前的版本中，需要创建一个对象来包装数组：

```jsx
// Solid 1.4.0 之后
const [todos, setTodos] = createStore([
  { id: 1, title: "Thing I have to do", done: false },
  { id: 2, title: "Learn a New Framework", done: false },
]);
...
<For each={todos}>{todo => <Todo todo={todo} />}</For>;
```

```jsx
// 1.4.0 之前
const [state, setState] = createStore({
  todos: [
    { id: 1, title: "Thing I have to do", done: false },
    { id: 2, title: "Learn a New Framework", done: false },
  ],
});
<For each={state.todos}>{(todo) => <Todo todo={todo} />}<For>;
```

请注意，修改存储中的数组不会触发直接订阅数组的计算（effect，memo 等）。例如：

```js
createEffect(() => {
  console.log(state.todos);
});

// 这不会触发 effect:
setState(todos, state.todos.length, { id: 3 });
// 这将触发 effect，因为数组引用发生了变化：
setState("todos", (prev) => [...prev, { id: 3 }]);
```

### Getters

store 对象支持使用 getter 来存储计算值。

```js
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

这些是在访问时重新运行的 getter，所以如果你想缓存一个值，你仍然需要使用 memo：

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

### 修改 Store

可以采用传递先前状态并返回新状态或值的函数的形式。对象总是浅合并。将值设置为 `undefined` 可以把它们从 store 中删除。

```js
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

它支持的路径包括 key arrays、object ranges 和 filter 函数。

setState 还支持嵌套设置，你可以在其中指明要修改的路径。在嵌套的情况下，要更新的状态可能是非对象值。对象仍然合并，但其他值（包括数组）将会被替换。

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

路径可以是 string keys、array 的 keys、迭代对象（{from、to、by}）或 filter 函数。这为描述状态变化提供了令人难以置信的表达能力。

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

## Store 工具类

### `produce`

```ts
import { produce } from "solid-js/store";

function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Solid Store 对象的 API 受 Immer 启发，允许使用下面的代码修改数据

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
import { reconcile } from "solid-js/store";

function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

当对比数据变更时，我们不能应用细粒度更新。`reconcile` 在处理来自 store 或巨大 API 响应这些不可变数据时很有用。

当 key 可用于匹配项目时，将使用该 key。默认情况下，`merge` 为 `false` 会在可能的情况下进行引用检查以确定是否相等，并在项目引用不相等的地方进行替换。`merge` 为 `true` 时，`reconcile` 会将所有差异推送到叶子节点，并高效地将先前的数据修改为新值。

```js
// 订阅 observable
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
import { unwrap } from "solid-js/store";

function unwrap(store: Store<T>): T;
```

在没有代理的情况下返回 store 中的基础数据。

### `createMutable`

```ts
import { createMutable } from 'solid-js/store';

function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T>;
```

创建一个新的可变 store 代理对象。store 仅在值更改时触发更新。跟踪是通过拦截属性访问来完成的，并通过代理自动跟踪深度嵌套。

用于集成外部系统或作为与 MobX/Vue 的兼容层。

> **注意：** 可变状态可以在任何地方传递和改变，这会使跟踪变得更难，也更容易打破单向流。一般建议改用`createStore`。`produce` 修饰符可以提供许多相同的好处而没有任何缺点。

```js
const state = createMutable(initialValue);

// 读取 value
state.someValue;

// 设置 value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables 支持 setter 和 getter。

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

### `modifyMutable`

**v1.4.0 中的新功能**

```ts
import { modifyMutable } from 'solid-js/store';

function modifyMutable<T>(mutable: T, modifier: (state: T) => T): void;
```

这个工具函数简化了在单个 [`batch`](#batch) 中对可变 store（由 [`createMutable`](#createmutable) 返回）进行多次更改，因此相关计算只更新一次，而不是每次更新一次。第一个参数是要修改的可变 store，第二个参数是 store 修饰符，例如由 [`reconcile`](#reconcile) 或 [`produce`](#produce) 返回的那些。（如果您传入自己的修饰函数，请注意它的参数是 store 的未包装版本。）

例如，假设我们有一个 UI 依赖于一个可变的多个字段：

```tsx
const state = createMutable({
  user: {
    firstName: "John",
    lastName: "Smith",
  },
});

<h1>Hello {state.user.firstName + ' ' + state.user.lastName}</h1>
```

依次修改 *n* 字段将导致 UI 更新 *n* 次：

```ts
state.user.firstName = "Jake";  // 触发更新
state.user.lastName = "Johnson";  // 触发另一个更新 
```

为了只触发一次更新，我们可以在 `batch` 中修改字段：

```ts
batch(() => {
  state.user.firstName = "Jake";
  state.user.lastName = "Johnson";
});
```

`modifyMutable` 结合 `reconcile` 或 `produce` 提供了两种替代方法来做类似的事情：

```ts
// 将 state.user 替换为指定的对象（删除任何其他字段）
modifyMutable(state.user, reconcile({
  firstName: "Jake",
  lastName: "Johnson",
});

// 批量修改两个字段，只触发一次更新
modifyMutable(state.user, produce((u) => {
  u.firstName = "Jake";
  u.lastName = "Johnson";
});
```

# 组件 API

## `createContext`

```ts
import { createContext } from "solid-js";
import type { Context } from "solid-js";

interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}

function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context 在 Solid 中提供了一种依赖注入的形式。它用于避免需要通过中间组件将数据作为 props 传递。

`createContext` 创建一个新的 context 对象，可以与 `useContext` 一起使用，并提供 `Provider` 控制流。当在层次结构的上方找不到 `Provider` 时，使用默认 context。

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const counter = [
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
    <CounterContext.Provider value={counter}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

传递给 provider 的值按原样传递给 `useContext`。这意味着包装为响应式表达式将不起作用。您应该直接传入 signal 和 store，而不是在 JSX 中访问它们。

## `useContext`

```ts
import { useContext } from "solid-js";

function useContext<T>(context: Context<T>): T;
```

用于获取 context 以允许深层传递 props，而不必通过每个组件函数传递它们。

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
import { children } from "solid-js";
import type { JSX, ResolvedChildren } from "solid-js";

function children(fn: () => JSX.Element): () => ResolvedChildren;
```

`children` 工具类用来和 `props.children` 进行复杂交互，当您不只是在 JSX 中使用 `{props.children}` 将子级传递给另一个组件时。通常你会像这样为 `props.children` 传递一个 getter：

```js
const resolved = children(() => props.children);
```

返回值是对已解决子项进行评估的 [memo](#creatememo)，每当子项更改时，它都会更新。在某些场景下，使用这个 memo 而不是直接访问 `props.children` 有一些重要的优势。潜在的问题是，当您通过 JSX 指定子组件时，Solid 会自动将 `props.children` 定义为属性获取器，以便在访问 `props.children` 时创建子项（特别是创建 DOM）。两个特别的后果：

- 如果您多次访问 `props.children`，则子项（和关联的 DOM）会被创建多次。如果您希望复制 DOM（因为 DOM 节点只能出现在一个父元素中），这很有用，但在许多情况下它会创建冗余 DOM 节点。如果您改为多次调用 `resolved()`，则会重用相同的子代。
- 如果您在跟踪范围之外访问 `props.children`（例如，在事件处理程序中），那么您将创建永远不会被清理的子项。如果您改为调用 `resolved()`，则重新使用已解决的子项。您还保证在当前组件中跟踪子项，而不是在另一个跟踪范围（例如另一个组件）中。

此外，`children` 工具类通过调用无参数函数并将数组的数组展平为数组来“解析”子对象。例如，用JSX指定的子函数，如`{signal() * 2}`，被包装到 `props.children` 中的 getter 函数 `() => count() * 2`。但根据 `count` signal 正确地计算为 `resolved` 中的实际数字。

如果给定的 `props.children` 不是一个数组（当 JSX 标签有一个 children 时会发生这种情况），那么 `children` 助手不会将其规范化为一个数组。这是有用的行为，例如 当打算将单个函数作为子函数传递时，可以通过 `typeof resolved() === 'function'` 检测到。如果你想标准化为一个数组，返回的 memo 有一个 `toArray` 方法（*1.5 中的新方法*）。

下面的示例是设置所有 children 的 `class` 属性：

```tsx
const resolved = children(() => props.children);

createEffect(() => {
  let list = resolved.toArray();
  for (let child of list) child?.setAttribute?.("class", myClass());
});

return <div>{resolved()}</div>;
```

（注意，不特别推荐这种方法：通常最好采用声明性方法，通过 props 或上下文将所需类传递给子组件。）

另一方面，如果您只是通过 JSX 将 `props.children` 传递给另一个组件或元素，则不需要（在某些情况下，不希望）使用 `children` 助手：

```tsx
const Wrapper = (props) => {
  return <div>{props.children}</div>;
};
```

`children` 工具类的一个重要方面是它强制创建和解析 children，因为它立即访问 `props.children`。这对于条件渲染可能是不可取的，例如，在 [`<Show>`](#<show>) 组件中使用 children 时。下面的代码总是计算 children：

```tsx
const resolved = children(() => props.children);

return <Show when={visible()}>{resolved()}</Show>;
```

要仅在 `<Show>` 渲染它们时计算 children，您可以将调用推送到组件内的 `children` 或 `<Show>` 内的函数，它仅在 `when` 条件为 true 时评估其子项 . 另一个不错的解决方法是仅在您真正想要评估 children 时才将 `props.children` 传递给 `children` 工具类：

```ts
const resolved = children(() => visible() && props.children);
```

## `lazy`

```ts
import { lazy } from "solid-js";

function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

用于延迟加载组件以允许代码拆分。在渲染之前不会加载组件。延迟加载的组件可以与静态导入的组件一样使用，接收 props 等，延迟加载的组件还会触发 `<Suspense>`

```js
// 包裹 import
const ComponentA = lazy(() => import("./ComponentA"));

// 在 JSX 中使用
<ComponentA title={props.title} />;
```

## `createUniqueId`

```ts
import { createUniqueId } from "solid-js";

function createUniqueId(): string;
```

跨服务器/浏览器稳定的通用 ID 生成器。

```js
const id = createUniqueId();
```

> **注意** 在服务器上这仅适用于可水合组件

# 次要的 API

您的第一个应用程序可能不需要它们，但这些都是有用的工具。

## `createDeferred`

```ts
import { createDeferred } from "solid-js";

function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

创建一个只读值，仅在浏览器空闲时通知下游变更。`timeoutMs` 是强制更新前等待的最长时间。

## `createRenderEffect`

```ts
import { createRenderEffect } from "solid-js";

function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

render effect 是一种类似于常规 effect 的计算（由 [`createEffect`](#createeffect)) 创建），但在 Solid 计划第一次执行 effect 函数时有所不同。当 `createEffect` 等待当前渲染阶段完成时，`createRenderEffect` 立即调用该函数。因此，effect 在创建和更新 DOM 元素时运行，但可能在创建特定的感兴趣元素之前，并且可能在这些元素连接到文档之前。特别是，[`ref`](#ref) 不会在初始 effect 调用之前设置。事实上，Solid 使用`createRenderEffect` 来实现渲染阶段本身，包括 `ref` 的设置。

render effect 的响应式更新与 effect 相同：它们排队以响应响应式更改（例如，单个 single 更新，或 `batch` 更改，或整个渲染阶段期间的集体更改）并在单个 [`batch`](#batch) 之后（连同效果）。特别是，render effect 中的所有 single 更新都是批处理的。

这是该行为的示例。（与 [`createEffect`](#createeffect) 中的示例进行比较。）

```js
// 假设此代码在组件函数中，因此是渲染阶段的一部分
const [count, setCount] = createSignal(0);

// 这个 effect 在开始时和更改时打印 count
createRenderEffect(() => console.log("count =", count()));
// render effect 立即运行，打印 `count = 0`
console.log("hello");
setCount(1); // effect 还没有运行
setCount(2); // effect 还没有运行

queueMicrotask(() => {
  // 现在 `count = 2` 将打印
  console.log("microtask");
  setCount(3); // 立即打印 `count = 3`
  console.log("goodbye");
});

// --- 完整的输出: ---
// count = 0   [与 createEffect 相比，这是唯一添加的行]
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

就像 `createEffect` 一样，render effect 的调用参数等于 effect 函数上次执行或第一次调用时返回的值，等于 `createRenderEffect` 的可选第二个参数。

## `createComputed`

```ts
import { createComputed } from "solid-js";

function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

`createComputed` 创建一个新的计算，该计算立即在跟踪范围内运行给定函数，从而自动跟踪其依赖关系，并在依赖关系发生变化时自动重新运行该函数。该函数被调用的参数等于函数上次执行或第一次调用时返回的值，等于 `createComputed` 的可选第二个参数。请注意，函数的返回值不会以其他方式暴露； 特别是，`createComputed` 没有返回值。

`createComputed` 是 Solid 中最直接的响应形式，对于构建其他响应性 API 最有用。（例如，其他一些 Solid API 是从 `createComputed` 构建的。）但应该小心使用，因为 `createComputed` 很容易导致比其他响应性 API 更多不必要的更新。在使用它之前，请考虑密切相关的 API [`createMemo`](#creatememo) 和 [`createRenderEffect`](#createrendereffect)。


与 `createMemo` 一样，`createComputed` 会在更新时立即调用其函数（除非您在 [batch](#batch)、[effect](#createEffect) 或 [transition](#use-transition) 中）。然而，虽然 `createMemo` 函数应该是纯函数（不修改任何 signal），但 `createComputed` 函数可以修改 signal。相关的，`createMemo` 为函数的返回值提供了一个只读 signal，而要对 `createComputed` 做同样的事情，你需要在函数中修改一个 signal。如果可以使用纯函数和`createMemo`，这可能更有效，因为 Solid 优化了 memo 更新的执行顺序，而更新 `createComputed` 中的信号将立即触发响应更新，其中一些可能会变成不必要。


与 `createRenderEffect` 一样，`createComputed` 第一次立即调用它的函数。但它们在更新的执行方式上有所不同。虽然 `createComputed` 通常会立即更新，但 `createRenderEffect` 会更新队列以在当前渲染阶段之后运行（与 `createEffect` 一起）。因此，`createRenderEffect` 可以执行更少的整体更新，但稍微不那么即时。

## `createReaction`

**v1.3.0 中的新功能**

```ts
import { createReaction } from "solid-js";

function createReaction(onInvalidate: () => void): (fn: () => void) => void;
```

有时将跟踪与重新执行分开是有用的。该 API 注册了一个副作用，该副作用在返回的跟踪函数包装的表达式第一次收到更改通知时运行。

```js
const [s, set] = createSignal("start");

const track = createReaction(() => console.log("something"));

// 下一次 s 改变时运行反应
track(() => s());

set("end"); // "something"

set("final"); // 没有输出，因为 reaction 只在第一次更新时运行，需要再次调用跟踪。
```

## `createSelector`

```ts
import { createSelector } from "solid-js";

function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

创建一个条件 signal，仅在输入或退出与值匹配的 key 时通知订阅者。对于委派的选择状态很有用。因为它使操作 O(1) 而不是 O(n)。

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# 渲染

这些 API 从 `solid-js/web` 导入。

## `render`

```ts
import { render } from "solid-js/web";
import type { JSX, MountableElement } from "solid-js/web";

function render(code: () => JSX.Element, element: MountableElement): () => void;
```

这是浏览器应用程序入口点。提供顶级组件功能和要挂载到的 element。建议 element 的子元素为空，因为虽然 `render` 只会添加子元素，但返回的 `dispose` 函数将删除所有子元素。（也就是`<div id='app'></div>` 中间不建议有子元素，会被 dispose 全部清空）

```js
const dispose = render(App, document.getElementById("app"));
// or
const dispose = render(() => <App />, document.getElementById("app"));
```

重要的是第一个参数是一个函数：不要直接传递 JSX（如 `render(<App/>, ...)`），因为这会在 `render` 设置 root 之前调用 `App`，跟踪 `App` 中的 signal 依赖关系。

## `hydrate`

```ts
import { hydrate } from "solid-js/web";

function hydrate(fn: () => JSX.Element, node: MountableElement): () => void;
```

此方法类似于 `render`，只是它尝试对已渲染到 DOM 的内容进行再水化。在浏览器中初始化时，页面已经被服务器渲染。

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
import { renderToString } from "solid-js/web";

function renderToString<T>(
  fn: () => T,
  options?: {
    nonce?: string;
    renderId?: string;
  }
): string;
```

同步渲染到字符串。该函数还生成一个用于渐进式水合作用的 script 标签。选项包括在页面加载和播放水合之前监听的 eventNames，以及放在 script 标签上的 nonce。

当有多个顶级根时，`renderId` 用于命名空间渲染。

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
import { renderToStringAsync } from "solid-js/web";

function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    timeoutMs?: number;
    renderId?: string;
    nonce?: string;
  }
): Promise<string>;
```

与 `renderToString` 相同，只是它会在返回结果之前等待所有 `<Suspense>` 边界解决。资源数据会自动序列化到 script 标签中，并在客户端加载时进行水合。

当有多个顶级根时，`renderId` 用于命名空间渲染。

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**v1.3.0 中的新功能**

```ts
import { renderToStream } from "solid-js/web";

function renderToStream<T>(
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

此方法渲染到流 它同步渲染内容，包括任何 Suspense fallback 占位符，然后在完成时继续从任何异步资源流式传输数据和 HTML。

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` 在同步渲染完成时触发，然后将第一个 flush 写入流到浏览器。`onCompleteAll` 在所有服务器 Suspense 边界都解决后调用。

当有多个顶级根时，`renderId` 用于命名空间渲染。

> 请注意，此 API 替换了之前的 `pipeToWritable` 和 `pipeToNodeWritable` API。

## `isServer`

```ts
import { isServer } from "solid-js/web";

const isServer: boolean;
```

这表明代码正在作为服务器或浏览器包运行。由于底层运行时将其导出为常量布尔值，它允许打包程序从各自的包中消除代码及其使用的导入。

```js
if (isServer) {
  // 我永远不会进入浏览器捆绑包
} else {
  // 不会在服务器上运行;
}
```

## `DEV`

```ts
import { DEV } from "solid-js";

const DEV: object | undefined;
```

在客户端，Solid 提供（通过 [条件导出](https://nodejs.org/api/packages.html#conditional-exports)）不同的构建，具体取决于是否设置了 `development` 条件。开发模式提供了一些额外的检查——例如 检测意外使用了多个 Solid 实例——这些实例在生产构建中被删除。

如果您希望代码仅在开发模式下运行（在 libraries 中最有用），您可以检查是否定义了 `DEV` 导出。请注意，它始终在服务器上定义，因此您可能希望与 [`isServer`](#isserver) 结合使用：

```ts
import { DEV } from "solid-js";
import { isServer } from "solid-js/web";

if (DEV && !isServer) {
  console.log(...);
}
```

## `HydrationScript`

```ts
import { generateHydrationScript, HydrationScript } from "solid-js/web";

function generateHydrationScript(options: {
  nonce?: string;
  eventNames?: string[];
}): string;

function HydrationScript(props: {
  nonce?: string;
  eventNames?: string[];
}): JSX.Element;
```

Hydration Script 是一个特殊的脚本，应该在页面上放置一次以在 Solid 的运行时加载之前引导水合。它既可以作为一个可以被调用并插入到 HTML 字符串中的函数，也可以作为一个组件出现，如果你从 `<html>` 标记呈现 JSX。

options 是将 `nonce` 放在脚本标签上，并且该 Solid 的任何事件名称都应在脚本加载之前捕获并在水合期间重放。这些事件仅限于 Solid 委托的事件，其中包括大多数组合和冒泡的 UI 事件。默认情况下只有 `click` 和 `input` 事件。

# 控制流

为了使响应式控制流发挥作用，我们必须控制元素的创建方式。例如，调用 `array.map` 是低效的，因为它总是映射整个数组。

这意味着需要一个工具函数。将这些包装在组件中既能很方便地简化模板，也允许用户组合和构建自己的控制流。

这些内置的控制流将被自动导入。除了 `Portal` 和 `Dynamic` 之外的所有内容都是从 `solid-js` 导出的。这两个 DOM 特定的组件由 `solid-js/web` 导出。

> 注意：控制流的所有回调/渲染函数子项都是非跟踪性的。这允许创建嵌套状态，并更好地隔离响应。

## `<For>`

```ts
import { For } from "solid-js";

function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

一个引用键控循环，仅高效更新已更改的 item。回调的第一个参数是当前 item：

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

可选的第二个参数是 index signal：

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
import { Show } from "solid-js";

function Show<T>(props: {
  when: T | undefined | null | false;
  keyed: boolean;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

Show 控制流用于有条件地渲染视图的一部分：当 `when` 为 true 时渲染 `children`，否则渲染 `fallback`。它类似于三元运算符（`when ? children : fallback`），但非常适合模板化 JSX。

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show 也可以用作将块键控到特定 data model 的一种方式。例如，每当替换 user model 时，都会重新执行该方法。

```jsx
<Show when={state.user} fallback={<div>Loading...</div>} keyed>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
import { Switch, Match } from "solid-js";
import type { MatchProps } from "solid-js";

function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
function Match<T>(props: MatchProps<T>);
```

当有超过 2 个互斥条件时很有用。例如，它可用于执行基本路由：

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

Match 还支持子函数作为键控流。

## `<Index>`

```ts
import { Index } from "solid-js";

function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

非键控列表迭代（渲染节点键控到数组索引）。当没有概念键时，这很有用，例如数据由基元组成，并且它是固定的索引而不是值。

这个 item 是一个 signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

可选的第二个参数是 index:

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
import { ErrorBoundary } from "solid-js";

function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

捕获未捕获的错误并渲染 fallback 内容。

```jsx
<ErrorBoundary fallback={<div>出现了严重的错误</div>}>
  <MyComp />
</ErrorBoundary>
```

还支持具有 error 和 reset 的回调形式。

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
import { Suspense } from "solid-js";

function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

跟踪在其下读取的所有资源并显示 fallback 占位符状态直到它们被解决的组件。`Suspense` 与 `Show` 的不同之处在于它是非阻塞的，因为两个分支同时存在，即使当前不在 DOM 中。

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (实验性的功能)

```ts
import { SuspenseList } from "solid-js";

function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` 允许协调多个并行的 `Suspense` 和 `SuspenseList` 组件。它控制显示内容的顺序以减少布局抖动，并具有折叠或隐藏 fallback 状态的选项。

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

SuspenseList 仍处于试验阶段，没有完全的 SSR 支持。

## `<Dynamic>`

```ts
import { Dynamic } from "solid-js/web";

function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

该组件允许您插入任意组件或标签并将 props 传递给它。

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
import { Portal } from "solid-js/web";

function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

这会将元素插入到 mount 节点中。用于在页面布局之外插入模态框。事件仍然通过组件层次结构传播。

除非目标是 document head，否则 portal 会安装在 `<div>` 中。`useShadow` 将元素放置在 Shadow Root 中以进行样式隔离，如果插入到 SVG 元素中，则需要 `isSVG` 以便不插入 `<div>`。

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# 特殊的 JSX 属性

一般来说，Solid 尝试坚持 DOM 约定。大多数 props 被视为原生元素的属性和 Web 组件的属性，但其中一些具有特殊行为。

对于带有 TypeScript 的自定义命名空间属性，您需要扩展 Solid 的 JSX 命名空间：

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

ref 是访问 JSX 中底层 DOM 元素的一种方式。虽然确实可以将一个元素分配给一个变量，但将组件留在 JSX 流程中更为理想。ref 是在渲染时但在元素连接到 DOM 之前分配的。它们有 2 种口味。

```js
// 由 ref 直接分配的变量
let myDiv;

// 连接到 DOM 后使用 onMount 或 createEffect 读取
onMount(() => console.log(myDiv));

<div ref={myDiv} />

// 或者，回调函数（在连接到 DOM 之前调用）
<div ref={el => console.log(el)} />
```

ref 也可以用在组件上。它们仍然需要在另一侧连接。

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


Solid 提供了 `class` 和 `classList` 两个属性来设置元素的 class。

首先，您可以像设置任何其他属性一样设置 `class=...`。例如：

```jsx
// 两个静态的 class
<div class="active editing" />

// 一个动态 class，如果不需要，删除 class 属性
<div class={state.active ? 'active' : undefined} />

// 两个动态的 class
<div class={`${state.active ? 'active' : ''} ${state.currentId === row.id ? 'editing' : ''}} />
```

（注意 `className=...` 在 Solid 1.4 中已弃用。）

或者，`classList` 伪属性允许您指定一个对象，其中每个 key 都是一个类，值被视为表示是否包含该 class 的布尔值。例如（匹配最后一个例子）：

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

这个例子编译成一个 [render effect](#createrendereffect) 动态调用 [`element.classList.toggle`](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle) 来打开或关闭每个类，只有当相应的布尔值改变时。例如，当 `state.active` 变为 `true/false` 时，元素 `获得/失去`  `active` 类。

传递给 `classList` 的值可以是任何表达式（包括 signal getter），其计算结果为适当的对象。一些例子：

```jsx
// 动态 class name 和 value
<div classList={{ [className()]: classOn() }} />;

// signal class 列表
const [classes, setClasses] = createSignal({});
setClasses((c) => ({ ...c, active: true }));
<div classList={classes()} />;
```

混合 `class` 和 `classList` 也是可能的，但很危险。主要的安全情况是当 `class` 设置为静态字符串（或什么都没有），并且 `classList` 是响应式的。（`class` 也可以设置为静态计算值，如 `class={baseClass()}`，但它应该出现在任何 `classList` 伪属性之前。）如果 `class` 和 `classList` 都是 响应式，你会得到意想不到的行为：当 `class` 值发生变化时，Solid 会设置整个 `class` 属性，因此将覆盖 `classList` 所做的任何切换。

因为 `classList` 是一个编译时伪属性，所以它不适用于像 `<div {...props} />` 或 `<Dynamic>` 这样的 props 传播。

## `style`

Solid 的 `style` 属性允许你提供一个 CSS 字符串或一个对象，其中对象的 key 是 CSS 属性名称：

```jsx
// 字符串
<div style={`color: green; height: ${state.height}px`} />

// 对象
<div style={{
  color: "green",
  height: state.height + "px" }}
/>
```

与 [React 的 `style` 属性](https://reactjs.org/docs/dom-elements.html#style) 不同，Solid 在底层使用了 `element.style.setProperty`。这意味着您需要使用小写、破折号分隔的属性名称版本，而不是 JavaScript 驼峰式版本，例如 `"background-color"` 而不是 `backgroundColor`。这实际上会导致更好的性能和与 SSR 输出的一致性。

```jsx
// 字符串
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// 对象
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>
```

这也意味着您可以设置 CSS 变量！ 例如：

```jsx
// 设置 css 变量
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

它们的工作原理与它们的等效属性相同。设置一个字符串，它们将被设置。小心使用可能暴露给最终用户的任何数据设置 `innerHTML` ，因为它可能是恶意攻击的载体。`textContent` 虽然通常不需要，但实际上是一种性能优化，因为您知道子元素将仅为文本，它绕过了通用的差异例行程序（例行程序是指完成一个处理过程并产生多个处理结果且通过 CALL 语句调用执行的程序）。

```jsx
<div textContent={state.text} />
```

## `on___`

Solid 中的事件处理程序通常采用 `onclick` 或 `onClick` 的形式，具体取决于分割。

Solid 对组合和冒泡的常见 UI 事件使用半合成事件委托。这提高了这些常见事件的性能。

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid 还支持将数组传递给事件处理程序以将值绑定到事件处理程序的第一个参数。这不使用 `bind` 或创建额外的闭包，因此它是一种高度优化的委派事件的方式。

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

事件不能被重新绑定并且绑定不是响应式。因为附加和移除 listeners 的成本很高。由于每次触发事件时都会像其他任何函数一样调用事件处理程序，因此不需要响应性； 如果需要，可以像下面的例子一样进行操作：

```jsx
// 如果已定义，则调用它;否则不要。
<div onClick={() => props.handleClick?.()} />
```

请注意，`onChange` 和 `onInput` 根据它们的原生行为工作。`onInput` 将在值更改后立即触发； 对于 `<input>` 字段，`onChange` 只会在字段失去焦点后触发。

## `on:___`/`oncapture:___`

对于任何其他事件，可能是具有不寻常名称的事件，或者您不希望被委托的事件，都有 `on` 命名空间事件。此属性逐字添加事件 listener。

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

这些是自定义指令。从某种意义上说，这只是对 ref 的语法糖，但允许我们轻松地将多个指令附加到单个元素。指令是具有以下签名的函数：

```ts
function directive(element: Element, accessor: () => any): void;
```

指令函数在渲染时调用，但在添加到 DOM 之前。您可以在其中做任何您想做的事情，包括创建 signal、effect、注册清理等。

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

要注册 TypeScript，请扩展 JSX 命名空间。

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

强制将 prop 视为 property 而不是 attribute （原生dom）。

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`


强制将道具视为 attribute（原生 dom）而不是 property 对于要设置 attributes 的 Web Components 很有用。

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid 的编译器使用启发式方法对 JSX 表达式进行响应式包装和惰性求值。它是否包含函数调用、属性访问或 JSX？ 如果是，我们在传递给组件时将其包装在 getter 中，如果传递给原生元素，则将其包装在 effect 中。

了解这种启发式方法及其局限性，我们可以通过在 JSX 之外访问它们来减少我们知道永远不会改变的事物的开销。永远不会包装一个单独的变量。我们还可以通过使用注释装饰器 `/* @once */` 来告诉编译器不要包装它们。

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

这也适用于 children。

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
