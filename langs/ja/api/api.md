# 基本のリアクティビティ

Solid のリアクティビティについての全体的なアプローチは、リアクティビティの計算をすべて関数でラップし、依存関係が更新されたときにその関数を再実行することです。

Solid の JSX コンパイラーは、ほとんどの JSX 式（中括弧内のコード）を関数でラップし、依存関係が変更されたときに自動的に更新 (および対応する DOM 更新のトリガー) します。


より正確には、JSX 式や「計算」を構築する API 呼び出し（`createEffect`、`createMemo` など）の追跡スコープで関数が呼び出されるたびに、関数の自動再実行が行われます。


デフォルトでは、関数が追跡スコープで呼び出されたときに、関数がリアクティブな状態を（例えば Signal ゲッターや Store 属性を通じて）読み取るタイミングを検出することで、関数の依存関係を自動的に追跡します。


その結果、通常は依存関係のことを気にする必要はありません。
（しかし、自動的な依存関係追跡が目的の結果をもたらさない場合は、[依存関係追跡をオーバーライド](#reactive-utilities)できます）

このアプローチにより、リアクティビティがコンポーザブルになります。ある関数を別の関数内で呼び出すと、一般に呼び出した関数は呼び出された関数の依存関係を継承することになります。



## `createSignal`

```ts
import { createSignal } from "solid-js";

function createSignal<T>(
  initialValue: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];

// available types for return value of createSignal:
import type { Signal, Accessor, Setter } from "solid-js";
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
type Accessor<T> = () => T;
type Setter<T> = (v: T | ((prev?: T) => T)) => T;
```

Signal は最も基本的なリアクティブプリミティブです。このプリミティブは時間とともに変化する 1 つの値（任意の JavaScript のオブジェクト）を追跡します。

Signal の値は最初、渡された最初の引数 `initialValue`（引数がない場合は `undefined`）と同じになります。

関数 `createSignal` はゲッター（またはアクセサー）とセッターの関数のペアを 2 要素の配列で返します。典型的な使い方としては、この配列を以下のように名前付き Signal に分解します:



```js
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);
```

ゲッター（例えば `count()` や `ready()`）を呼び出すと、Signal の現在の値が返されます。

自動的な依存関係にとって重要なことは、追跡スコープ内でゲッターを呼び出すと、呼び出し側の関数がこの Signal に依存するようになり、Signal が更新されるとその関数が再実行されるようになることです。



セッター（例えば `setCount(nextCount)` や `setReady(nextReady)`）を呼び出すと Signal の値を設定し、値が実際に変更されたら Signal を更新（依存関係の再実行をトリガー）します（詳細は以下を参照ください）。



唯一の引数として、セッターはシグナルの新しい値か、シグナルの最後の値を新しい値にマップする関数を取ります。

セッターはまた、更新された値を返します。例えば:

```js
// Signal の現在の値を読み取り、
// 追跡スコープ内であれば Signal に依存する
// （ただし、追跡スコープ外では非リアクティブ）:
const currentCount = count();

// もしくは、任意の計算を関数でラップすると、
// この関数は追跡スコープ内で使用できます:
const doubledCount = () => 2 * count();

// または追跡スコープを作り、Signal に依存します:
const countDisplay = <div>{count()}</div>;

// 値を与えて Signal を書き込む:
setReady(true);

// 関数のセッターを与えて Signal を書き込む:
const newCount = setCount((prev) => prev + 1);
```

> Signal に関数を格納したい場合は、関数の形式を使用する必要があります:
>
> ```js
> setValue(() => myFunction);
> ```
>
> ただし、関数は `createSignal` の `initialValue` 引数として特別に扱われないので、
> 関数の初期値をそのまま渡す必要があります:
>
> ```js
> const [func, setFunc] = createSignal(myFunction);
> ```

[バッチ](#batch)、[Effect](#createEffect)、[トランジション](#use-transition)の中でなければ、Signal は設定するとすぐに更新されます。

例えば:

```js
setReady(false);
console.assert(ready() === false);
setReady(true);
console.assert(ready() === true);
```

コードがバッチで実行されるかトランジションで実行されるかわからない場合（例えばライブラリーのコードなど）、この仮定は避けた方がよいでしょう。


##### Options

Solid のいくつかのプリミティブは、省略可能な最後の引数として "options" オブジェクトを取ります。`createSignal` の options オブジェクトには `equals` オプションを指定できます。例えば:




```js
const [getValue, setValue] = createSignal(initialValue, { equals: false });
```

Signal のセッターを呼び出したとき、デフォルトでは JavaScript の `===` 演算子に従って新しい値が古い値と実際に異なる場合にのみ、Signal は更新されます（そして依存関係を再実行させます）。



代わりに `equals` を `false` に設定して、セッターが呼ばれた後に依存関係を常に再実行することもできますし、等価性をテストするための独自の関数を渡すこともできます。

いくつかの例:

```js
// { equals: false } を使用すると、オブジェクトを適切に変更できます。
// オブジェクトは変更前と変更後で同じ ID を持っているので、
// 通常これは更新とはみなされません。
const [object, setObject] = createSignal({ count: 0 }, { equals: false });
setObject((current) => {
  current.count += 1;
  current.updated = new Date();
  return current;
});

// { equals: false } の Signal を値なしのトリガーとして使用:
const [depend, rerun] = createSignal(undefined, { equals: false });
// 追跡スコープで depend() を呼び出すと、rerun() が呼ばれるたびに
// そのスコープが再実行されるようになりました

// 文字列の長さに基づいて「等しいかどうか」を定義する:
const [myString, setMyString] = createSignal("string", {
  equals: (oldVal, newVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // 最後の値と等しいと見なされ、更新は発生しません
setMyString("stranger"); // 異なると見なされ、更新が発生します
```

## `createEffect`

```ts
import { createEffect } from "solid-js";

function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Effect は、例えば DOM を手動で変更するなど、依存関係が変わるたびに任意のコード (「副作用」) を実行させるための一般的な方法です。

`createEffect` は、与えられた関数を追跡スコープで実行する新しい計算を作成します。それによって自動的に依存関係を追跡し、依存関係が更新されるたびに自動的にその関数が再実行されます。


例えば:

```js
const [a, setA] = createSignal(initialValue);

// Signal `a` に依存する Effect
createEffect(() => doSideEffect(a()));
```

effect 関数は、effect 関数の直近の実行から返された値を引数として呼び出されます。最初の呼び出しでは `createEffect` の省略可能な第 2 引数の値で呼び出されます。


これにより、最後に計算された値を記憶するためのクロージャを追加で作成することなく、差分を計算できます。例えば:


```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log("sum changed to", sum);
  return sum;
}, 0);
```

Effect は主に、リアクティブシステムを読み取るが書き込まない副作用のためのものです。Effect 内で Signal を変更するのは避けた方が良いでしょう。気をつけないと、追加のレンダリングや Effect の無限ループの原因になります。



代わりに、他のリアクティブな値に依存する新しい値を計算するためには、[`createMemo`](#creatememo)を使うことをお勧めします。そうすれば、リアクティブシステムは何が何に依存しているかを把握し、それに応じて最適化できます。


Effect の中で Signal を変更する場合、Effect 関数は自動的に [`batch`](#batch) でラップされます。これは、Effect 内のすべての Signal の変更が、Effect が終了した後にのみ伝搬されることを意味します。これにより、いくつかの Signal の更新が 1 つの更新だけをトリガーするようになり、副作用の途中で望ましくない副作用が起こるのを避けることができます。





実際、複数の Effect が一度にトリガーされた場合、それらはまとめて 1 つの `batch` にラップされます。


Effect 関数の最初の実行は即時ではありません。現在のレンダリングフェーズの後に実行されるようにスケジュールされます（例えば、[`render`](#render) や [`createRoot`](#createroot) 、あるいは [`runWithOwner`](#runwithowner) に渡された関数を呼び出した後など）。



最初の実行が発生するのを待ちたい場合は、[`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)（ブラウザが DOM をレンダリングする前に実行されます）や `await Promise.resolve()` や `setTimeout(..., 0)`（ブラウザのレンダリング後に実行されます）を使用します。




この最初の実行の後、通常、Effect は依存関係が更新されるとすぐに実行されます（[batch](#batch) や [transition](#use-transition) をしている場合を除く）。例えば:



```js
// このコードはコンポーネント関数内にあると想定しているため、レンダリングフェーズの一部です
const [count, setCount] = createSignal(0);

// この Effect は、開始時と変更時にカウントを表示します
createEffect(() => console.log("count =", count()));
// Effect はまだ実行されません
console.log("hello");
setCount(1); // Effect はまだ実行されません
setCount(2); // Effect はまだ実行されません

queueMicrotask(() => {
  // これで `count = 2` が表示されます
  console.log("microtask");
  setCount(3); // すぐに `count = 3` と表示されます
  console.log("goodbye");
});

// --- 全体的な出力: ---
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

この最初の実行の遅れは、コンポーネントが返す JSX が DOM に追加された後、コンポーネントスコープで定義された Effect が実行されることを意味するので便利です。
特に、[`ref`](#ref) はすでに設定されていることになります。

このため、Effect を使用して手動で DOM を操作したり、バニラ JS ライブラリを呼び出したり、その他の副作用を使用できます。



Effect の最初の実行は、ブラウザが DOM を画面にレンダリングする前に実行されることに注意してください（React の `useLayoutEffect` に似ています）。

レンダリングの後まで待つ必要がある場合（例えば、レンダリングを計測する場合）、`await Promise.resolve()`（または `Promise.resolve().then(...)`）を使用できますが、 `async` 関数が `await` を使った後は追跡できないため、その後のリアクティブな状態（例えば Signal）の使用は、Effect を再実行するきっかけにならないので注意してください。




したがって、promise の前にすべての依存関係を使用する必要があります。

もし、初回の実行でもすぐに Effect を実行したい場合は、[`createRenderEffect`](#createrendereffect) や [`createComputed`](#createcomputed) を使用してください。



Effect 関数内で [`onCleanup`](#oncleanup) を呼び出すことにより、Effect 関数の実行の合間に副作用をクリーンアップできます。

このようなクリーンアップ関数は、Effect の実行の間と、Effect が破棄された時（例えば、含むコンポーネントがアンマウントされた時）の両方に呼び出されます。

例えば:

```js
// eventName という Signal で指定されたイベントを動的にリッスンする
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

Memo を使用すると、多くのリアクティブな計算で派生する値を効率的に使用できます。
`createMemo` は、与えられた関数の戻り値に等しい読み取り専用のリアクティブな値を作成し、依存関係が変更されたときのみその関数が実行されるようにします。


```js
const value = createMemo(() => computeExpensiveValue(a(), b()));

// 値の読み取り
value();
```

Solid では多くの場合、関数を Memo でラップする必要はありません。
代わりに、通常の関数を定義して呼び出すだけで、同様のリアクティブな挙動を得ることができます。

主な違いは、複数のリアクティブな設定で関数を呼び出す場合です。
この場合、関数の依存関係が更新されると、 `createMemo` でラップしていない限り、関数は複数回呼び出されることになります。例えば:


```js
const user = createMemo(() => searchForUser(username()));
// compare with: const user = () => searchForUser(username());
return (
  <ul>
    <li>Your name is "{user()?.name}"</li>
    <li>
      Your email is <code>{user()?.email}</code>
    </li>
  </ul>
);
```

`username` Signal が更新されると、`searchForUser` が一度だけ呼び出されます。
もし、返されたユーザーが実際に変更された場合、`user` Memo が更新され、両方のリストアイテムが自動的に更新されます。


もし、`user` をプレーンな関数 `() => searchForUser(username())` として定義していたら、`searchForUser` は 2 回、それぞれのリストアイテムを更新するときに呼び出されたことでしょう。



もう 1 つの重要な違いは、Memo の依存関係が変更されても、結果として得られる Memo の値が変わらない場合、Memo が依存関係の更新を遮ることができるということです。

[`createSignal`](#createsignal) と同様に、`createMemo` によって作られた派生 Signal は、JavaScript の `===` 演算子に従って、メモ関数が返す値が実際に以前の値から変化したときのみ更新されます（そして依存関係を再実行するようにトリガーします）。



また、`equals` を `false` に設定したオプションオブジェクトを渡すことで、依存関係が変化したときに常に Memo を更新したり、等価性をテストするための独自の `equals` 関数を渡すことも可能です。



メモ関数は、メモ関数の最後の実行から返された値と等しい引数で呼び出されます。または、最初の呼び出しでは、`createMemo` の省略可能な第 2 引数の値で呼び出されます。


これは、計算を減らすのに便利です。例えば:

```js
// input() が更新したときに、取得したすべての値の合計を追跡する
const sum = createMemo((prev) => input() + prev, 0);
```

メモ関数は、セッターを呼び出すことによって他の Signal を変更してはいけません（"純粋" でなければなりません）。

これにより、Solid は依存関係グラフに応じて Memo 更新の実行順序を最適化し、依存関係の変更に対応してすべての Memo が最大 1 回で更新できるようにします。



## `createResource`

```ts
import { createResource } from "solid-js";
import type { ResourceReturn } from "solid-js";

type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
    latest: T | undefined;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: (info: unknown) => Promise<T> | T;
  }
];

function createResource<T, U = true>(
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;

function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;
```

非同期リクエストの結果を Signal するシグナルを作成します。

`createResource` は非同期のフェッチャー関数を受け取り、フェッチャーが完了したときに結果のデータで更新される Signal を返します。

`createResource` を使用するには、2 つの方法があります。フェッチャー関数を唯一の引数として渡すか、または、最初の引数としてソース Signal を渡すことができます。ソース Signal は、それが変更されるたびにフェッチャーを再トリガーし、その値がフェッチャーに渡されます。

```js
const [data, { mutate, refetch }] = createResource(fetchData);
```

```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData);
```

これらのスニペットでは、フェッチャーは関数 `fetchData` であり、`fetchData` が解決を終えるまで `data()` は undefined です。最初のケースでは、`fetchData` はすぐに呼び出されます。
2 番目のケースでは、`sourceSignal` が `false`, `null`, `undefined` 以外の値を持つとすぐに `fetchData` が呼び出されます。
また、`sourceSignal` の値が変更されるたびに再度呼び出され、その値は常に `fetchData` に第一引数として渡されます。

`mutate` を呼び出すことで、`data` Signal を直接更新できます（他の Signal セッターと同じように動作します）。また、`refetch` を呼び出すことでフェッチャーを直接再実行でき、`refetch(info)` のように追加の引数を渡すことで、フェッチャーに追加情報を提供できます。

`data` は通常の Signal のゲッターのように動作します。 `fetchData` の最後の戻り値を読み取るには `data()` を使用します。
しかし、これには追加のリアクティブなプロパティがあり、`data.loading` はフェッチャーが呼び出されたが返されていないかどうかを示します。そして、`data.error` はリクエストがエラーになったかどうかを示します（注意: もしエラーが予想される場合は `createResource` を [ErrorBoundary](#<errorboundary>)でラップするとよいでしょう）。

**1.4.0** では、`data.latest` は最後に返された値を返し、[Suspension](#<suspense>) や [transitions](#usetransition) をトリガーしません。まだ値が返されていない場合は `data()` と同じ動作をします。これは、新しいデータを読み込んでいる間、古くなったデータを表示させたい場合に便利です。

`loading` と `error` と `latest` はリアクティブゲッターで、追跡が可能です。

`fetcher` は `createResource` に提供する非同期関数で、実際にデータを取得するために使用します。
2 つの引数が渡されます。ソースシグナルの値（提供されている場合）と、`value` と `refetching` の 2 つのプロパティを持つ info オブジェクトです。`value` は以前にフェッチした値を示します。
`refetching` は、フェッチャーが `refetch` 関数を使用してトリガーされた場合は `true` で、そうでない場合は `false` です。
もし、`refetch` 関数が引数付きで呼ばれた場合 (`refetch(info)`) には、`refetching` にその引数がセットされます。

```js
async function fetchData(source, { value, refetching }) {
  // データをフェッチして値を返します。
  //`source` は、ソース Signal の現在の値を示します。
  //`value` は、フェッチャーの最後の戻り値を示します。
  //`refetching` は、`refetch()` を呼び出してフェッチャーがトリガーされたときに true になります。
  // または渡されたオプションのデータと等しい: `refetch(info)`
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// 値の読み取り
data();

// 読み込み中か確認
data.loading;

// エラーが起きたか確認
data.error;

// プロミスを作成せずに直接値を設定
mutate(optimisticValue);

// 最後のリクエストを明示的に再フェッチ
refetch();
```

**v1.4.0 の新機能**

`renderToStream` を使用している場合、`deferStream` オプションを使用して、ストリームをフラッシュする前にリソースを待機するように Solid に指示できます。

```js
// ユーザーを取得し、できるだけ早くコンテンツをストリームします
const [user] = createResource(() => params.id, fetchUser);

// ユーザーをフェッチしますが、このリソースが読み込まれた後にのみコンテンツをストリームします
const [user] = createResource(() => params.id, fetchUser, {
  deferStream: true,
});
```

# ライフサイクル

## `onMount`

```ts
import { onMount } from "solid-js";

function onMount(fn: () => void): void;
```

初期レンダリングと要素がマウントされた後に実行されるメソッドを登録します。`ref` の使用や、その他の一度きりの副作用を管理するのに最適です。これは依存関係のない `createEffect` と同等です。

## `onCleanup`

```ts
import { onCleanup } from "solid-js";

function onCleanup(fn: () => void): void;
```

現在のリアクティブスコープの廃棄または再計算時に実行されるクリーンアップメソッドを登録します。どんなコンポーネントや Effect でも使用できます。

## `onError`

```ts
import { onError } from "solid-js";

function onError(fn: (err: any) => void): void;
```

子スコープのエラー時に実行されるエラーハンドラメソッドを登録します。最も近いスコープのエラーハンドラーのみ実行されます。ラインをトリガーするために再スローします。

# リアクティブのユーティリティ

これらのヘルパーは、更新のスケジュールをより適切に設定し、リアクティビティの追跡方法を制御する機能を提供します。

## `untrack`

```ts
import { untrack } from "solid-js";

function untrack<T>(fn: () => T): T;
```

実行中のコードブロック内の依存関係の追跡を無視して、値を返します。

## `batch`

```ts
import { batch } from "solid-js";

function batch<T>(fn: () => T): T;
```

不必要な再計算を防ぐために、ブロック内の更新を最後まで待ちます。これは、次の行の値を読んでもまだ更新されていないことを意味します。[Solid Store](#createstore) の set メソッド、[Mutable Store](#createmutable) の配列メソッド、Effect は、コードを自動的に batch でラップしています。

## `on`

```ts
import { on } from "solid-js";

function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` は、依存関係を明示的にするため計算に渡されるよう設計されています。依存関係の配列が渡される場合、`input` と `prevInput` は配列になります。

```js
createEffect(on(a, (v) => console.log(v, b())));

// これと同等:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

また、defer オプションを true に設定することで、すぐに計算を実行せず、変更があった場合にのみ計算を実行するように設定することもできます。

```js
// すぐには実行されません
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // ここで実行される
```

なお、 `stores` と `mutable` では、親オブジェクトのプロパティを追加したり削除したりすると、Effect が発生することに注意してください。[`createMutable`](#createMutable) を参照してください。

## `createRoot`

```ts
import { createRoot } from "solid-js";

function createRoot<T>(fn: (dispose: () => void) => T): T;
```

自動廃棄されない新しい非追跡の所有者スコープを作成します。これは、親の再評価時に解放したくない、ネストされたリアクティブスコープなどに便利です。

すべての Solid のコードは、すべてのメモリ/計算が解放されることを保証するため、これらのいずれかのトップレベルでラップされる必要があります。通常は、すべての `render` エントリー関数に `createRoot` が組み込まれているので、これを気にする必要はありません。

## `getOwner`

```ts
import { getOwner } from "solid-js";

function getOwner(): Owner;
```

現在実行中のコードを所有するリアクティブスコープを取得します。例えば、現在のスコープ外で後から `runWithOwner` を呼び出す際に渡します。


内部的には、計算 (Effect、Memo など）は自分のオーナーの子であるオーナーを作成し、`createRoot` や `render` で作成したルートオーナーまでさかのぼります。特に、このオーナーシップツリーによって、Solid はそのサブツリーをトラバースして、すべての [`onCleanup`](#oncleanup) コールバックを呼び出すことによって、破棄された計算を自動的にクリーンアップできます。




例えば、`createEffect` の依存関係が変更された場合、Effect はエフェクト関数を再度実行する前にすべての子孫の `onCleanup` コールバックを呼び出します。

`getOwner` を呼び出すと、現在の実行ブロックの廃棄を担当するオーナーノードが返されます。


コンポーネントは計算ではないので、オーナーノードは作成されませんが、通常は計算を行う `createEffect` からレンダリングされるので、結果は同じになります。

コンポーネントがアンマウントされると、すべての子孫の `onCleanup` コールバックが呼び出されます。コンポーネントスコープから `getOwner` を呼び出すと、そのコンポーネントのレンダリングとアンマウントを担当するオーナーを返します。



所有するリアクティブスコープは、必ずしも追跡する必要はないことに注意してください。
例えば、[`untrack`](#untrack) は、JSX で作成されたコンポーネント（`<Component ...>`）と同様に、関数の間、（新しいリアクティブスコープを作成せずに）追跡をオフにします。



## `runWithOwner`

```ts
import { runWithOwner } from 'solid-js';

function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

外部スコープのオーナーの代わりに（影響を与えずに）、与えられたオーナーの下で与えられた関数を実行します。

デフォルトでは、 `createEffect` や `createMemo` などによって作成された計算は、現在実行中のコードのオーナー（`getOwner` の戻り値）が所有しているので、特にそのオーナーが破棄したときに破棄されることに注意してください。


`runWithOwner` を呼び出すことで、このデフォルトを上書きして、手動で指定したオーナー（通常は、以前に `getOwner` を呼び出したときの戻り値）にでき、計算が破棄されるタイミングをより正確にコントロールできるようになります。



（正しい）所有者を持つことは、2 つの理由で重要です。

- オーナーを持たない計算はクリーンアップできません。例えば、オーナーなしで（例えば、グローバルスコープで）`createEffect` を呼び出すと、Effect はオーナーが破棄されたときに破棄されるのではなく、永遠に実行し続けることになります。



- [`useContext`](#usecontext) は、オーナーツリーを辿って、目的のコンテキストを提供する最も近い祖先を見つけることで、コンテキストを取得します。
  そのため、オーナーがいなければ提供されたコンテキストを調べることができません（オーナーが間違っていると、間違ったコンテキストを取得してしまうかもしれません）。



手動でオーナーを設定することは、オーナースコープの外でリアクティブな処理を行う場合に特に便利です。特に、非同期計算（`async` 関数や `setTimeout` などのコールバック）では、自動的に設定されたオーナーが失われるため、`getOwner` で元のオーナーを記憶して、 `runWithOwner` で復元することが必要です。




例えば:

```js
const owner = getOwner();
setTimeout(() => {
  // このコールバックはオーナーなしで実行されます。
  // runWithOwner でオーナーをリストアします:
  runWithOwner(owner, () => {
    const foo = useContext(FooContext);
    createEffect(() => {
      console.log(foo);
    });
  });
}, 1000);
```

オーナーは依存関係の追跡を決定するものではないので、 `runWithOwner` は非同期関数での追跡には役立ちません。非同期部分でのリアクティブステートの使用（例えば、最初の `await` の後）は依存関係として追跡されないことに注意てください。




## `mergeProps`

```ts
import { mergeProps } from "solid-js";

function mergeProps(...sources: any): any;
```

リアクティブなオブジェクトの `merge` メソッドです。呼び出し元から提供されなかった場合のために、コンポーネントにデフォルトの props を設定するのに便利です。あるいは、リアクティブなプロパティを含む props オブジェクトを複製します。

このメソッドは、プロキシを使用してプロパティを逆順に解決することで動作します。これにより、prop オブジェクトが最初にマージされたときには存在しなかったプロパティを動的に追跡できます。

```js
// デフォルト props
props = mergeProps({ name: "Smith" }, props);

// props の複製
newProps = mergeProps(props);

// props のマージ
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

リアクティブオブジェクトをキーで分割します。

リアクティブオブジェクトと任意の数のキーの配列を取ります。キーの配列ごとに、元のオブジェクトのプロパティだけを持つリアクティブオブジェクトが返されます。返された配列の最後のリアクティブオブジェクトは、元のオブジェクトの残りのプロパティがあります。

これは、props のサブセットを利用し、残りを子に渡したい場合に便利です。

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

`splitProps` は任意の数の配列を受け取るので、props オブジェクトを好きなだけ分割できます（たとえば、複数の子コンポーネントがあり、それぞれが props のサブセットを必要とする場合など）。



例えば、あるコンポーネントに 6 つの props が渡されたとします:

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

すべての非同期処理が完了するまでコミットを延期するため、非同期更新をトランザクションで一括して行なうのに使用します。この機能は Suspense と連動しており、Suspense の境界下で読み込まれたリソースのみを追跡します。

```js
const [isPending, start] = useTransition();

// トランジション中か確認
isPending();

// トランジションでラップ
start(() => setSignal(newValue), () => /* トランジションが完了 */)
```

## `startTransition`

**v1.1.0 の新機能**

```ts
import { startTransition } from 'solid-js';

function startTransition: (fn: () => void) => Promise<void>;
```

`useTransition` と似ていますが、関連する保留状態はありません。これは単にトランジションを開始するために直接使用できます。

## `observable`

```ts
import { observable } from "solid-js";

function observable<T>(input: () => T): Observable<T>;
```

このメソッドは Signal を受け取り、Observable を生成します。
通常は `from` 演算子を使って、他の Observable ライブラリから利用できます。


```js
// rxjs と solid.js の Signal を統合する方法
import { observable } from "solid-js";
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

また、 `rxjs` を使わずに `from` を使用することもできます。下記参照。

## `from`

**v1.1.0 の新機能**

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

RxJS observables や Svelte Stores のような外部プロデューサーとの連携を容易にするためのヘルパーです。これは基本的に、任意の購読可能なもの（`subscribe` メソッドを持つオブジェクト）を Signal に変え、購読と廃棄を管理します。

```js
const signal = from(obsv$);
```

また、カスタムプロデューサー関数を使用することもでき、セッター関数に渡された関数はアンサブスクライブ関数を返します:

```js
const clock = from((set) => {
  const t = setInterval(() => set(1), 1000);
  return () => clearInterval(t);
});
```

> 注意: `from` によって生成された Signal は、外部ストリームやソースとのインターフェイスを良くするために、等値性チェックがオフになっています。

## `mapArray`

```ts
import { mapArray } from "solid-js";

function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

更新時の不要なマッピングを減らすために、各アイテムを参照によってキャッシュするリアクティブなマップヘルパーです。値ごとに一度だけマッピング関数を実行し、必要に応じて移動や削除を行います。index 引数は Signal です。map 関数自体は追跡しません。

`<For>` 制御フローの基礎となるヘルパーです。

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

`mapArray` と似ていますが、index でマッピングする点が異なります。アイテムは Signal で、index は定数となります。

`<Index>` 制御フローの基礎となるヘルパーです。

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

# ストア

これらの API は `solid-js/store` で公開されています。これにより、Signal のツリーを個別に追跡・変更できる[プロキシオブジェクト](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy)であるストアを作成できます。

## ストアの使用

### `createStore`

```ts
import { createStore } from "solid-js/store";
import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
type Store<T> = T;  // 概念的には読み取り専用だが、そのように型付けされていない
```

create 関数は初期状態を受け取り、それをストアでラップし、読み取り専用のプロキシオブジェクトとセッター関数を返します。

```js
const [state, setState] = createStore(initialValue);

// 値の読み取り
state.someValue;

// 値の設定
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

プロキシとしてのストアオブジェクトは、プロパティがアクセスされたときのみ追跡します。

ネストしたオブジェクトがアクセスされると、ストアはネストしたストアオブジェクトを生成し、これはツリーの下まで適用されます。ただし、これは配列とプレーンオブジェクトにのみ適用されます。クラスはラップされないので、`Date`, `HTMLElement`, `RegExp`, `Map`, `Set` といったオブジェクトは、ストアのプロパティとしてきめ細かく反応しません。

#### ストアにおける配列

バージョン **1.4.0** 以降、トップレベルの状態オブジェクトは配列にできます。以前のバージョンでは、配列をラップするオブジェクトを作成します。

```jsx
//Solid 1.4.0 以降
const [todos, setTodos] = createStore([
  { id: 1, title: "Thing I have to do", done: false },
  { id: 2, title: "Learn a New Framework", done: false },
]);
...
<For each={todos}>{todo => <Todo todo={todo} />}</For>;
```

```jsx
//1.4.0 以前
const [state, setState] = createStore({
  todos: [
    { id: 1, title: "Thing I have to do", done: false },
    { id: 2, title: "Learn a New Framework", done: false },
  ],
});
<For each={state.todos}>{(todo) => <Todo todo={todo} />}<For>;
```

ストア内の配列を変更しても、配列に直接サブスクライブする計算はトリガーされないことに注意してください。たとえば:

```js
createEffect(() => {
  console.log(state.todos);
});

//これは Effect をトリガーしない:
setState(todos, state.todos.length, { id: 3 });
//これは配列の参照が変更されるため Effect がトリガーされます:
setState("todos", (prev) => [...prev, { id: 3 }]);
```

### ゲッター

Store オブジェクトは、計算した値を格納するためのゲッターをサポートしています。

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

これらは、アクセスされると再実行されるゲッターなので、値をキャッシュしたい場合は Memo を使用する必要があります:


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

### ストアの更新

変更は、以前の状態を渡して新しい状態または値を返す関数の形をとることができます。オブジェクトは常に浅くマージされます。ストアから値を削除するには、値を `undefined` に設定します。

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

キー配列、オブジェクトの範囲、およびフィルタ関数を含むパスをサポートしています。

setState は変更へのパスを示すことができる、ネストされた設定もサポートしています。ネストされている場合、更新される状態は、オブジェクト以外の他の値である可能性があります。オブジェクトは引き続きマージされますが、その他の値（配列を含む）は置き換えられます。

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

パスは、文字列キー、キーの配列、反復オブジェクト ({from, to, by})、またはフィルタ関数です。これにより、状態の変化を表す表現力が飛躍的に向上します。

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

## ストアユーティリティ

### `produce`

```ts
import { produce } from "solid-js/store";

function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Immer にインスパイアされた Solid の Store オブジェクト用の API で、局所的なミューテーションを可能にします。

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

きめ細かい更新を適用できない場合に、データの変化を差分で表示します。ストアからのイミュータブルなデータや、大きな API レスポンスを扱う場合に便利です。

アイテムをマッチさせるために、キーがあればそれを使用します。デフォルトでは、`merge` false は、可能な限り参照チェックを行って同等性を判断し、アイテムが参照的に等しくない場合には置換します。`merge` true は、すべての差分を葉ノードにプッシュし、以前のデータを新しい値に効果的に変換します。

```js
// observable の購読
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

ストアの基となるデータをプロキシなしで返します。

### `createMutable`

```ts
import { createMutable } from 'solid-js/store';

function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T>;
```

ミュータブルなストアプロキシオブジェクトを新規に作成します。ストアは、値が変化したときにのみ更新をトリガーします。追跡は、プロパティアクセスをインターセプトすることで行われ、プロキシ経由で深いネストを自動的に追跡します。

外部システムとの統合や、MobX/Vue との互換性レイヤーとしても有効です。

> **注意:** ミュータブルな状態は、どこにでも渡したり変更が可能なので、追跡が困難になり、単方向フローを壊しやすくなったりします。一般的には、代わりに `createStore` を使用することをお勧めします。`produce` 修飾子を使用すると、多くの同じメリットがありますが、デメリットはありません。

```js
const state = createMutable(initialValue);

// 値の読み取り
state.someValue;

// 値の設定
state.someValue = 5;

state.list.push(anotherValue);
```

Mutable はゲッターだけでなくセッターもサポートしています。

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

**v1.4.0 の新機能**

```ts
import { modifyMutable } from 'solid-js/store';

function modifyMutable<T>(mutable: T, modifier: (state: T) => T): void;
```

このヘルパー関数は、（[`createMutable`](#createmutable) が返すような）ミュータブルストアに複数の変更を 1 つの [`batch`](#batch) で行うことを簡素化します。これにより、依存関係のある計算が更新ごとに 1 回ではなく、1 回だけで更新されるようになります。



最初の引数は変更するミュータブルストアで、2 番目の引数は [`reconcile`](#reconcile) や [`produce`](#produce) が返すようなストアモディファイアを指定します。


（独自のモディファイア関数を渡す場合、その引数はラップされていないバージョンのストアであることに注意してください）。


例えば、Mutable の複数のフィールドに依存する UI があるとします:

```tsx
const state = createMutable({
  user: {
    firstName: "John",
    lastName: "Smith",
  },
});

<h1>Hello {state.user.firstName + ' ' + state.user.lastName}</h1>
```

*n* 個のフィールドを順番に変更すると、UI は *n* 回更新されます。

```ts
state.user.firstName = "Jake";  // 更新をトリガー
state.user.lastName = "Johnson";  // 別の更新をトリガー
```

単一の更新をトリガーするには、`batch` 内でフィールドを変更します:

```ts
batch(() => {
  state.user.firstName = "Jake";
  state.user.lastName = "Johnson";
});
```

`modifyMutable` と `reconcile` または `produce` を組み合わせることで、同様のことを行うための 2 つの代替方法を提供します:


```ts
// state.user を指定されたオブジェクトに置き換える（他のフィールドは削除される）
modifyMutable(state.user, reconcile({
  firstName: "Jake",
  lastName: "Johnson",
});

// 2 つのフィールドを一括で変更し、1回だけ更新をトリガーする
modifyMutable(state.user, produce((u) => {
  u.firstName = "Jake";
  u.lastName = "Johnson";
});
```

# コンポーネント API

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

コンテキストは、Solid での依存性注入の方式を提供します。これは、中間コンポーネントを介してデータを props として渡す必要がないようにするために使用されます。

この関数は、`useContext` で使用できる新しいコンテキストオブジェクトを作成し、`Provider` 制御フローを提供します。階層構造の上位に `Provider` が見つからない場合には、デフォルトのコンテキストが使用されます。

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

Provider に渡された値は、そのまま `useContext` に渡されます。つまり、リアクティブな式としてのラッピングは機能しません。Signal やストアは、JSX でアクセスするのではなく、直接渡すべきです。

## `useContext`

```ts
import { useContext } from "solid-js";

function useContext<T>(context: Context<T>): T;
```

コンテキストを取得して、各 Component 関数を通過させることなく props を深く渡すことができるようにするために使用されます。

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
import { children } from "solid-js";
import type { JSX, ResolvedChildren } from "solid-js";

function children(fn: () => JSX.Element): () => ResolvedChildren;
```

`children` ヘルパーは JSX で一度 `{props.children}` を使って別のコンポーネントに子を渡すだけではない場合の、`props.children` との複雑なインタラクションのためにあります。


通常は、次のように `props.children` のゲッターを渡します:

```js
const resolved = children(() => props.children);
```

戻り値は、解決された子を評価する [Memo](#creatememo) であり、子が変更されるたびに更新されます。

`props.children` に直接アクセスする代わりにこの Memo を使用することは、いくつかのシナリオで重要な利点があります。

根本的な問題は、JSX でコンポーネントの子を指定すると、Solid は自動的に `props.children` をプロパティゲッターとして定義するため、`props.children` にアクセスがあるたびに子が作成される（特に、DOM が作成される）ことです。特に 2 つの結果があります:




- もし `props.children` に複数回アクセスすると、子（と関連する DOM）が複数回作成されます。
  これは、DOM を重複させたい場合に有効ですが（DOM ノードは 1 つの親要素にしか出現しないため）、多くの場合、冗長な DOM ノードを生成してしまいます。
  その代わりに `resolved()` を複数回呼び出すと、同じ子を再利用することになります。


- もし、追跡スコープの外（イベントハンドラー内など）で `props.children` にアクセスすると、決してクリーンアップされない子を作成することになります。
  その代わりに `resolved()` を呼び出すと、すでに解決済みの子を再利用します。
  また、別のコンポーネントなどの別の追跡スコープではなく、現在のコンポーネントで子が追跡されることも保証されます。



さらに、 `children` ヘルパーは、引数のない関数を呼び出したり、配列の配列を配列にフラット化したりして、子を「解決」します。

例えば、 `{signal() * 2}` のように JSX で指定された子は、`props.children` ではゲッター関数 `() => count() * 2` にラップされますが、`resolved` では実際の数値に評価され、`count` というシグナルに適切に依存できます。



指定された `props.children` が配列でない場合（JSX タグが 1 つの子タグの場合に発生します）、`children` ヘルパーはそれを配列に正規化することはありません。


これは、例えば単一の関数を子として渡したい場合に便利な動作で、`typeof resolved() === 'function'` によって検出できます。

配列に正規化したい場合は、`Array.isArray(resolved()) ? resolved() : [resolved()]`とします。


ここでは、子要素をレンダリングするだけでなく、`Element` に解決された子要素の `class` 属性を自動的に設定する例を示します:


```tsx
const resolved = children(() => props.children);

createEffect(() => {
  let list = resolved();
  if (!Array.isArray(list)) list = [list];
  for (let child of list) child?.setAttribute?.("class", myClass());
});

return <div>{resolved()}</div>;
```

（この方法は特に推奨されないことに注意してください。通常は、子コンポーネントに props やコンテキストを介して目的のクラスを渡す宣言的なアプローチに従う方がよいでしょう）。



一方、JSX を介して `props.children` を他のコンポーネントや要素に渡すだけであれば、 `children` ヘルパーを使用する必要はありません（場合によっては、使用したくないこともあるでしょう）。



```tsx
const Wrapper = (props) => {
  return <div>{props.children}</div>;
};
```

`children` ヘルパーの重要な点は、 `props.children` にすぐにアクセスして、強制的に子を作成し解決することです。

これは、例えば、[`<Show>`](#<show>) コンポーネント内で子を使用する場合など、条件付きレンダリングには望ましくない場合があります。

たとえば、次のコードは常に子を評価します:

```tsx
const resolved = children(() => props.children);

return <Show when={visible()}>{resolved()}</Show>;
```

`<Show>` が子をレンダリングするときだけ子を評価するには、`<Show>` 内のコンポーネントや関数に `children` の呼び出しを押し込み、`when` 条件が true のときだけ子を評価するようにします。


もう 1 つの良い回避策は、実際に子を評価するときだけ `children` ヘルパーに `props.children` を渡すことです:


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

コードの分割を可能にするため、コンポーネントを遅延ロードするのに使用されます。コンポーネントはレンダリングされるまでロードされません。遅延ロードされたコンポーネントは、静的にインポートされたものと同じように、props などを受け取って使用できます。遅延コンポーネントは `<Suspense>` をトリガーします。

```js
// import をラップ
const ComponentA = lazy(() => import("./ComponentA"));

// JSX で使用
<ComponentA title={props.title} />;
```

## `createUniqueId`

```ts
import { createUniqueId } from "solid-js";

function createUniqueId(): string;
```

サーバ/ブラウザにまたがって変動のない汎用 ID ジェネレータです。

```js
const id = createUniqueId();
```

> **注意** サーバ上では、ハイドレート可能なコンポーネントでのみ動作します。

# 副次的なプリミティブ

おそらく初めてのアプリには必要ないでしょうが、あると便利なツールです。

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

ブラウザがアイドル状態のときにダウンストリームの変更のみを通知する読み取り専用の変数を作成します。`timeoutMs` は、強制的に更新を行なうまでの最大待機時間です。

## `createRenderEffect`

```ts
import { createRenderEffect } from "solid-js";

function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

レンダーエフェクトは、通常のエフェクト（[`createEffect`](#createeffect)で作成）と同様の計算ですが、Solid がエフェクト関数の最初の実行をスケジュールするタイミングが異なっています。


`createEffect` が現在のレンダリングフェーズが完了するのを待つ一方、`createRenderEffect` は即座にこの関数を呼び出します。

したがって、このエフェクトは DOM 要素が作成されたり更新されたりするときに実行されますが、おそらく特定の目的の要素が作成される前、そしておそらくそれらの要素が document に接続される前に実行されます。


特に、最初のエフェクト呼び出しの前に [`ref`](#ref) が設定されることはありません。
実際、Solid は `ref` の設定を含むレンダリングフェーズそのものを実装するために `createRenderEffect` を使用します。


レンダーエフェクトのリアクティブな更新は、エフェクトと同じです。リアクティブな変更（例えば、単一のシグナルの更新、または変更の `batch`、またはレンダーフェーズ全体における集団の変更）に応答してキューに入れ、その後単一の [`batch`](#batch) で実行します（エフェクトと一緒です）。



特に、レンダーエフェクト内のすべてのシグナルの更新は、バッチ処理されます。

以下は、その動作の一例です。
（[`createEffect`](#createeffect) の例と比較してみてください）。

```js
// このコードはコンポーネント関数内にあると想定しているため、レンダリングフェーズの一部です
const [count, setCount] = createSignal(0);

// この Effect は、開始時と変更時にカウントを表示します
createRenderEffect(() => console.log("count =", count()));
// レンダーエフェクトはすぐに実行され、`count = 0` と表示します
console.log("hello");
setCount(1); // エフェクトはまだ実行されません
setCount(2); // エフェクトはまだ実行されません

queueMicrotask(() => {
  // これで `count = 2` が表示されます
  console.log("microtask");
  setCount(3); // すぐに `count = 3` と表示されます
  console.log("goodbye");
});

// --- 全体的な出力: ---
// count = 0   [createEffect と比較して、追加された行はこれだけです]
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

`createEffect` と同様に、effect 関数の最後の実行から返された値、または最初の呼び出しでは `createRenderEffect` の省略可能な第 2 引数の値で呼び出されます。




## `createComputed`

```ts
import { createComputed } from "solid-js";

function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

`createComputed` は新しい計算を作成し、与えられた関数を追跡スコープですぐに実行します。したがって、自動的にその依存関係を追跡し、依存関係が変更されるたびに自動的にその関数を再実行します。


この関数は、関数の最後の実行から返された値、または最初の呼び出しでは `createComputed` の省略可能な第 2 引数の値で呼び出されます。


この関数の戻り値は、それ以外では公開されないことに注意してください。特に、 `createComputed` は戻り値を持ちません。


`createComputed` は Solid で最も直接的なリアクティブの形であり、他のリアクティブプリミティブを構築する際に最も有用です。

（例えば、他のいくつかの Solid プリミティブは `createComputed` で構築されています）。
しかし、`createComputed` は他のリアクティブプリミティブに比べて不必要な更新を引き起こしやすいので、注意して使用する必要があります。

使用する前に、密接に関連するプリミティブである [`createMemo`](#creatememo) と [`createRenderEffect`](#createrendereffect) を検討してみてください。


`createMemo` と同様に、 `createComputed` は更新があるとすぐにその関数を呼び出します（ただし、[batch](#batch)、[effect](#createEffect)、または [transition](#use-transition) を使用している場合は除く）。


ただし、`createMemo` 関数は純粋であるべき（シグナルを更新してはいけません）である一方、 `createComputed` 関数はシグナルを更新できます。

関連することとして、 `createMemo` は関数の戻り値に対して読み取り専用のシグナルを提供しますが、`createComputed` で同じことを行うには、関数内でシグナルを更新する必要があります。


純粋な関数と `createMemo` を使用できる場合は、Solid がメモの更新の実行順序を最適化するので、こちらの方がより効率的でしょう。
一方、`createComputed` 内でシグナルを更新すると、即座にリアクティブな更新が行われ、そのうちのいくつかは不要であることが判明します（[`batch`](#batch) や [`untrack`](#untrack) などでラップして注意しなければなりません）。





`createRenderEffect` と同様に、 `createComputed` は最初の関数をすぐに呼び出します。しかし、両者は更新の方法が異なります。

一般的に `createComputed` はすぐに更新されますが、`createRenderEffect` は現在のレンダーフェーズの後に、（`createEffect` と共に）単一の `batch` で実行するキューに更新します。


したがって、 `createRenderEffect` は全体的な更新をより少なくできますが、即時性は若干劣ります。


## `createReaction`

**v1.3.0 の新機能**

```ts
import { createReaction } from "solid-js";

function createReaction(onInvalidate: () => void): (fn: () => void) => void;
```

追跡と再実行を分離することが便利な場合があります。このプリミティブは、返された追跡関数によってラップされた式が初めて変更を通知されたときに実行される副作用を登録します。

```js
const [s, set] = createSignal("start");

const track = createReaction(() => console.log("something"));

// 次に s が変化したときにリアクションを実行する
track(() => s());

set("end"); // "something"

set("final"); // 最初の更新時のみ反応するため、何もしません。再度 track を呼び出す必要があります。
```

## `createSelector`

```ts
import { createSelector } from "solid-js";

function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

値と一致するキーが入った、または出たときにのみサブスクライバに通知する条件付き Signal を作成します。委任された選択状態に便利です。演算が O(n) ではなく O(1) になるため。

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# レンダリング

これらのインポートは `solid-js/web` から公開されています。

## `render`

```ts
import { render } from "solid-js/web";
import type { JSX, MountableElement } from "solid-js/web";

function render(code: () => JSX.Element, element: MountableElement): () => void;
```

これは、ブラウザアプリのエントリーポイントです。
トップレベルのコンポーネント関数と、マウントする要素を指定します。
この要素は空であることが推奨されます。
 `render` は単に子要素を追加するだけですが、返される `dispose` 関数はすべての子要素を削除します。


```js
const dispose = render(App, document.getElementById("app"));
// or
const dispose = render(() => <App />, document.getElementById("app"));
```

最初の引数が関数であることが重要です。JSX を直接渡さないでください（`render(<App/>, ...)`のように）。これは、`render` が `App` 内のシグナルの依存関係を追跡するためのルートを設定する前に `App` を呼び出すことになるからです。



## `hydrate`

```ts
import { hydrate } from "solid-js/web";

function hydrate(fn: () => JSX.Element, node: MountableElement): () => void;
```

このメソッドは `render` と似ていますが、すでに DOM にレンダリングされているものを再利用しようとする点が異なります。ブラウザでの初期化時には、ページはすでにサーバーでレンダリングされています。

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

文字列に同期的にレンダリングします。この関数は、プログレッシブハイドレーション用のスクリプトタグも生成します。オプションには、ページがロードされてハイドレーションの再生前に購読する eventNames と、スクリプトタグに付ける nonce があります。

`renderId` は、複数のトップレベルルートがある場合に、レンダリングの名前空間を作成するために使用されます。

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

結果を返す前に、すべての `<Suspense>` 境界が解決するのを待つという点を除いて、`renderToString` と同じです。リソースデータは自動的にスクリプトタグにシリアライズされ、クライアントのロード時にハイドレーションされます。

`renderId` は、複数のトップレベルルートがある場合に、レンダリングの名前空間を作成するために使用されます。

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**v1.3.0 の新機能**

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

このメソッドは、ストリームにレンダリングします。Suspense のフォールバックプレースホルダーを含むコンテンツを同期的にレンダリングし、完了すると任意の非同期リソースからデータと HTML をストリームし続けます。

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` は、同期レンダリングが完了してから、最初のフラッシュをストリームに書き出し、ブラウザに出力するときに発生します。`onCompleteAll` は、すべてのサーバーの Suspense 境界が確定したときに呼び出されます。`renderId` は、複数のトップレベルルートがある場合に、レンダリングの名前空間を作成するために使用されます。

> この API は、以前の `pipeToWritable` と `pipeToNodeWritable` API を置き換えるものであることに注意してください。

## `isServer`

```ts
import { isServer } from "solid-js/web";

const isServer: boolean;
```

これは、コードがサーバーまたはブラウザのバンドルとして実行されていることを示します。基礎となるランタイムがこの値を定数のブール値としてエクスポートするため、バンドラーはコードとその使用されるインポートをそれぞれのバンドルから取り除くことができます。

```js
if (isServer) {
  // 私はブラウザバンドルには入れません
} else {
  // サーバーでは実行されません;
}
```

## `DEV`

```ts
import { DEV } from "solid-js";

const DEV: object | undefined;
```

クライアントでは、Solid は `development` 条件が設定されているかどうかによって異なるビルドを（[conditional exports](https://nodejs.org/api/packages.html#conditional-exports) を介して）提供します。


開発モードでは、Solid の複数インスタンスの偶発的な使用を検出するなど、いくつかの追加チェックが行われますが、製品版ビルドでは削除されます。


もし、開発モードでのみコードを実行させたい場合（ライブラリで最も有用）、`DEV` エクスポートが定義されているかどうかを確認できます。これは常にサーバー上で定義されるので、[`isServer`](#isserver) と組み合わせるとよいでしょう:



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

Hydration Script は、Solid のランタイムがロードされる前に Hydration を起動するために、ページ上に一度配置される特別なスクリプトです。HTML 文字列に挿入して呼び出す関数として、または `<html>` タグから JSX をレンダリングする場合はコンポーネントとして提供されます。

オプションは、スクリプトscript タグに付けられる `nonce` と、スクリプトがロードされる前に Solid が取得し、ハイドレーション中に再生されるイベント名です。これらのイベントは Solid が委譲するものに限定され、合成やバブルなどの UI イベントが含まれます。デフォルトでは、`click` および `input` イベントのみです。

# 制御フロー

リアクティブな制御フローがパフォーマンスを発揮するためには、要素がどのように作成されるかを制御する必要があります。例えば、`array.map` を呼び出すと、常に配列全体がマップされるので非効率的です。

これはヘルパー関数を意味します。これらをコンポーネントでラップすることによって、簡潔なテンプレートを作成するのに便利ですし、ユーザーが独自の制御フローを構成・構築することもできます。

これらの組み込み制御フローコンポーネントは自動的にインポートされます。`Portal` と `Dynamic` 以外のすべては `solid-js` と `solid-js/web` の両方からエクスポートされます。DOM 固有のものである `Portal` と `Dynamic` は `solid-js/web` からエクスポートされます。

> 注意: 制御フローのコールバック/レンダー関数の子はすべて追跡されません。これにより、状態をネストして作成でき、反応をよりよく分離できます。

## `<For>`

```ts
import { For } from "solid-js";

function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

変更されたアイテムのみを効率的に更新する参照キー付きループです。
コールバックは第一引数として現在のアイテムを受け取ります:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

オプションの第二引数はインデックスの Signal です:

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
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

Show 制御フローは、ビューの一部を条件付きでレンダリングするために使用されます。これは `when` が truthy の場合には `children` を、そうでない場合は `fallback` をレンダリングします。これは三項演算子（`when ? children : fallback`）に似ていますが、JSX のテンプレート化に最適です。

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show は、ブロックを特定のデータモデルにキーイングする方法としても使用できます。例: ユーザーモデルが置き換えられるたびに、この関数が再実行されます。

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
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

互いに排他的な条件が 2 つ以上ある場合に便利です。
例えば、基本的なルーティングの実行に使用できます:

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

Match は、キー付きフローとして機能する関数の子もサポートしています。

## `<Index>`

```ts
import { Index } from "solid-js";

function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

キーを持たないリストの反復（レンダリングされたノードは配列のインデックスがキーとなります）。これは、データがプリミティブで構成されていて、値ではなくインデックスが固定されている場合など、概念的なキーが存在しない場合に便利です。

item は Signal です:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

オプションの第二引数はインデックスです:

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

キャッチされなかったエラーを捕捉し、フォールバックコンテンツをレンダリングします。

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

また、エラーとリセット関数を渡すコールバック方式もサポートしています。

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

その下で読み込まれたすべてのリソースを追跡し、それらが解決されるまでフォールバックのプレースホルダー状態を表示するコンポーネントです。`Suspense` が `Show` と異なる点は、ノンブロッキングであることです。つまり、現在 DOM に存在しなくても、両方のブランチが同時に存在します。

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Experimental)

```ts
import { SuspenseList } from "solid-js";

function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` では、複数の並列した `Suspense` と `SuspenseList` コンポーネントを調整できます。コンテンツの表示順を制御してレイアウトの乱れを抑え、フォールバックの状態を折りたたんだり非表示にするオプションも備えています。

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

SuspenseList はまだ実験的なもので、SSR を完全にはサポートしていません。

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

このコンポーネントでは、任意のコンポーネントやタグを挿入し、その props を渡すことができます。

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

これにより、要素がマウントノードに挿入されます。ページレイアウトの外側にモーダルを挿入するのに便利です。イベントはコンポーネント階層を伝搬します。

ターゲットがドキュメントヘッドでない限り、ポータルは `<div>` の中にマウントされます。`useShadow` はスタイルを分離するためにシャドウルートに要素を配置し、SVG 要素に挿入する場合は、`<div>` が挿入されないように、`isSVG` が必要です。

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# 特別な JSX 属性

一般的に、Solid は DOM の規則に忠実であろうとします。ほとんどの props は、ネイティブ要素の属性や Web Components のプロパティとして扱われますが、いくつかの props には特別な動作があります。

TypeScript でカスタムの名前空間付き属性を使用するには、Solid の JSX 名前空間を拡張する必要があります:

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

ref は、JSX の中で基礎となる DOM 要素にアクセスするための手段です。確かに、要素を変数に割り当てることもできますが、JSX のフローの中にコンポーネントを残しておく方が最適です。ref は、要素が DOM に結合される前のレンダリング時に割り当てられます。ref には 2 つの種類があります。

```js
// ref で直接代入される変数
let myDiv;

// onMount または createEffect を使って、DOM に結合された後に読み取り
onMount(() => console.log(myDiv));

<div ref={myDiv} />

// もしくは、コールバック関数（DOM に結合する前に呼び出されます）
<div ref={el => console.log(el)} />
```

ref はコンポーネントにも使用できます。ただし、相手側に取り付ける必要があります。

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

Solid では要素の `class` を設定する方法として、`class` 属性と `classList` 属性の 2 つがあります。


まず、他の属性と同様に `class=...` を設定することができます。例えば:

```jsx
// 2 つの静的クラス
<div class="active editing" />

// 動的クラス 1 個、不要な場合はクラス属性は削除されます
<div class={state.active ? 'active' : undefined} />

// 2 つの動的クラス
<div class={`${state.active ? 'active' : ''} ${state.currentId === row.id ? 'editing' : ''}} />
```

（`className=...` は Solid 1.4 で非推奨になったので注意してください）

また、 `classList` 擬似属性では、各キーがクラスで、値がそのクラスを含めるかどうかを表すブール値として扱われるオブジェクトを指定することができます。


例えば（前回の例と一致）:

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

この例は、対応するブール値が変化したときだけ、動的に [`element.classList.toggle`](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle) を呼び出して各クラスをオン/オフする[レンダーエフェクト](#createrendereffect)にコンパイルされます。



例えば、 `state.active` が `true` になった場合、その要素は `active` クラスを獲得します（`false` なら喪失）。


`classList` に渡す値は、適切なオブジェクトに評価される任意の式（シグナルのゲッターを含む）にできます。いくつかの例:


```jsx
// 動的なクラス名と値
<div classList={{ [className()]: classOn() }} />;

// シグナルのクラスリスト
const [classes, setClasses] = createSignal({});
setClasses((c) => ({ ...c, active: true }));
<div classList={classes()} />;
```

また、 `class` と `classList` を混ぜることも可能ですが、危険です。
主な安全な状況は、`class` に静的な文字列（または何もなし）が設定されていて、`classList` がリアクティブな状態である場合です。

（`class` には `class={baseClass()}` のように静的な計算値を設定することもできますが、その場合は `classList` 擬似属性の前に記述される必要があります）。もし、 `class` と `classList` の両方がリアクティブであれば、予期しない振る舞いをする可能性があります。




`class` の値が変更されると、Solid は `class` 属性全体を設定するので、`classList` によるトグルはすべて上書きされます。


`classList` はコンパイル時の擬似属性なので、`<div {...props} />` のような prop スプレッドや `<Dynamic>` の中では動作しません。



## `style`

Solid の `style` 属性には、CSS 文字列またはオブジェクトのいずれかを指定できます:


```jsx
// 文字列
<div style={`color: green; height: ${state.height}px`} />

// オブジェクト
<div style={{
  color: "green",
  height: state.height + "px" }}
/>
```

[React の `style` 属性](https://reactjs.org/docs/dom-elements.html#style) とは異なり、Solid は内部で `element.style.setProperty` を使用します。つまり、プロパティ名には `backgroundColor` のような JavaScript のキャメルケースのバージョンではなく、`"background-color"` のようにダッシュで区切られた小文字のバージョンを使用する必要があります。




これにより、実際にパフォーマンスが向上し、SSR 出力との一貫性が向上しています。

```jsx
// 文字列
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// オブジェクト
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>
```

これは、CSS 変数を設定できることも意味します。例えば:

```jsx
// CSS 変数を設定
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

これらは、同等のプロパティと同じように動作します。文字列を設定すると、これらが設定されます。**注意!!** 悪意のある攻撃のベクトルとなる可能性があるため、エンドユーザーに公開される可能性のあるデータは `innerHTML` を使用してください。`textContent` は一般的には必要ありませんが、一般的な差分ルーチンをバイパスするため、子がテキストのみであることがわかっている場合には、実際にはパフォーマンスの最適化になります。

```jsx
<div textContent={state.text} />
```

## `on___`

Solid のイベントハンドラは、スタイルに応じて、通常、`onclick` または `onClick` の形式をとります。

Solid では、合成されてバブルが発生する一般的な UI イベントに対して、半合成のイベント委譲を使用しています。これにより、これらの共通イベントのパフォーマンスが向上します。

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid は、イベントハンドラの第一引数に値をバインドするために、イベントハンドラに配列を渡すこともサポートしています。これは `bind` を使用せず、追加のクロージャも作成しないため、イベントを委譲するための高度に最適化された方法です。

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

リスナーのアタッチ/デタッチにはコストがかかるため、イベントは再バインドされず、バインディングはリアクティブではありません。
イベントハンドラーは、イベントが発生するたびに他の関数と同様に呼び出されるので、リアクティビティは必要ありません。必要に応じてハンドラーをショートカットします。

```jsx
// 定義されている場合は呼び出し、そうでない場合は呼び出さない
<div onClick={() => props.handleClick?.()} />
```

`onChange` と `onInput` はそれぞれのネイティブな動作に基づいて動作することに注意してください。`onInput` は、値が変更された直後に発生します。`<input>` フィールドの場合、`onChange` はフィールドがフォーカスを失った後にのみ発生します。

## `on:___`/`oncapture:___`

その他のイベント、例えば変わった名前のイベントや、委譲したくないイベントには、`on` 名前空間イベントがあります。この属性はイベントリスナーをそのまま追加します。

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

これらはカスタムディレクティブです。ある意味では ref のシンタックスシュガーに過ぎませんが、1 つの要素に複数のディレクティブを簡単に付けることができます．ディレクティブは、次のようなシグネチャを持つ関数です:

```ts
function directive(element: Element, accessor: () => any): void;
```

ディレクティブ関数は、DOM に追加される前のレンダリング時に呼び出されます。Signal や Effect の作成、クリーンアップの登録など、やりたいことは何でもできます。

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

TypeScript で登録するには、JSX 名前空間を拡張します。

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

props を属性ではなくプロパティとして処理するように強制します。

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

props をプロパティではなく属性として処理するように強制します。属性を設定する Web コンポーネントに便利です。

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid のコンパイラは、JSX 式のリアクティブなラッピングと遅延評価にヒューリスティックを使用しています。関数の呼び出し、プロパティへのアクセス、または JSX が含まれていますか？ そうであれば、コンポーネントに渡される場合はゲッターでラップし、ネイティブ要素に渡される場合は Effect でラップします。

このヒューリスティックとその限界を知ることで、JSX の外からアクセスすることで、変更されないことがわかっているもののオーバーヘッドを減らすことができます。孤立した変数がラップされることはありません。また、式の最初にコメントデコレータ `/* @once */` を付けることで、ラップしないようにコンパイラに指示できます。

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

これは、子に対しても有効です。

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
