---
title: API
description: 全 Solid API の概要
sort: 0
---

# 基本のリアクティビティ

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

これは時間の経過とともに変化する単一の値を追跡するために使用される、最も基本的なリアクティブプリミティブです。create 関数は Signal にアクセスしたり更新するための get と set のペアの関数を返します。

```js
const [getValue, setValue] = createSignal(initialValue);

// 値の読み取り
getValue();

// 値の設定
setValue(nextValue);

// 関数の setter を使って値を設定
setValue((prev) => prev + next);
```

Signal を更新に反応させたい場合は、追跡スコープの下でアクセスすることを忘れないでください。追跡スコープは、`createEffect` や JSX 式などの計算に渡される関数です。

> Signal に関数を格納したい場合は、関数の形式を使用する必要があります:
>
> ```js
> setValue(() => myFunction);
> ```

## `createEffect`

```ts
export function createEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

依存関係を自動的に追跡し、それらが変更された各レンダリングの後に実行される新しい計算を作成します。`ref` を使用したり、他の副作用を管理するのに理想的です。

```js
const [a, setA] = createSignal(initialValue);

// Signal `a` に依存する副作用
createEffect(() => doSideEffect(a()));
```

effect 関数は、その effect 関数の前回実行時に返された値で呼び出されます。この値はオプションの第二引数として初期化できます。これは追加のクロージャを作成せずに差分を取る場合に便利です。

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log(sum);
  return sum;
}, 0);
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

実行されたコードの依存関係が更新されるたびに、値を再計算する読み取り専用の派生 Signal を作成します。

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()));

// 値の読み取り
getValue();
```

memo 関数は、その memo 関数の前回実行時に返された値で呼び出されます。この値はオプションの第二引数として初期化できます。これは、計算量を減らすのに便利です。

```js
const sum = createMemo((prev) => input() + prev, 0);
```

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
    refetch: () => void;
  }
];

export function createResource<T, U = true>(
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;

export function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;
```

非同期のリクエストを管理できる Signal を作成します。`fetcher` は非同期関数で、`source` が提供されていればその戻り値を受け取り、Resource に設定された解決値を持つ Promise を返します。fetcher はリアクティブではないので、複数回実行させたい場合はオプションの第一引数を使用してください。source の解決値が false, null, undefined の場合は、フェッチしません。

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// 値の読み取り
data();

// 読み込み中か確認
data.loading;

// エラーが起きたか確認
data.error;

// プロミスを作成せずに直接値を設定
mutate(optimisticValue);

// ただ前回のリクエストを再取得
refetch();
```

`loading` や `error` はリアクティブなゲッターなので追跡できます。

# ライフサイクル

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

初期レンダリングと要素がマウントされた後に実行されるメソッドを登録します。`ref` の使用や、その他の一度きりの副作用を管理するのに最適です。これは依存関係のない `createEffect` と同等です。

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

現在のリアクティブスコープの廃棄または再計算時に実行されるクリーンアップメソッドを登録します。どんなコンポーネントや Effect でも使用できます。

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

子スコープのエラー時に実行されるエラーハンドラメソッドを登録します。最も近いスコープのエラーハンドラーのみ実行されます。ラインをトリガーするために再スローします。

# リアクティブのユーティリティ

これらのヘルパーは、更新のスケジュールをより適切に設定し、リアクティビティの追跡方法を制御する機能を提供します。

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

実行中のコードブロック内の依存関係の追跡を無視して、値を返します。

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

不必要な再計算を防ぐために、ブロック内の更新を最後まで待ちます。これは、次の行の値を読んでもまだ更新されていないことを意味します。[Solid Store](#createstore) の set メソッドと Effect は、コードを自動的に batch でラップしています。

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
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

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

自動廃棄されない新しい非追跡型コンテキストを作成します。これは、親の再評価時に解放したくない、ネストされたリアクティブコンテキストなどに便利です。これは、キャッシュのための強力なパターンです。

すべての Solid のコードは、すべてのメモリ/計算が解放されることを保証するため、これらのいずれかのトップレベルでラップされる必要があります。通常は、すべての `render` エントリー関数に `createRoot` が組み込まれているので、これを気にする必要はありません。

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
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
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

これは分割代入の代わりです。リアクティビティを維持しながら、リアクティブなオブジェクトをキーで分割します。

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
  () => boolean,
  (fn: () => void, cb?: () => void) => void
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

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

このメソッドは Signal を受け取り、シンプルな Observable を生成します。お好みの Observable ライブラリから、通常は `from` 演算子を使って取り込みます。

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `mapArray`

```ts
export function mapArray<T, U>(
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

# Stores

これらの API は `solid-js/store` で公開されています。

## `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

これにより、プロキシとして Signals のツリーが作成され、ネストしたデータ構造の個々の値を個別に追跡できるようになります。create 関数は、読み取り専用のプロキシオブジェクトと、セッター関数を返します。

```js
const [state, setState] = createStore(initialValue);

// 値の読み取り
state.someValue;

// 値の設定
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

プロキシであるストア オブジェクトは、プロパティへのアクセスを追跡するだけです。そして、アクセスがあると、Stores は再帰的に、ネストされたデータに対してネストされた Store オブジェクトを生成します。しかし、これは配列とプレーン オブジェクトしかラップしません。クラスはラップされません。つまり、`Date`, `HTMLElement`, `Regexp`, `Map`, `Set` のようなものは、きめ細かく反応しないということです。さらに、トップレベルの状態オブジェクトは、そのプロパティにアクセスしなければ追跡できません。そのため、新しいキーやインデックスを追加しても更新のトリガーにはならないので、反復処理を行なうものに使用するのには適していません。そのため、状態オブジェクト自体を使用するのではなく、状態のキーにリストを置くようにしてください。

```js
// list を状態オブジェクトのキーにする
const [state, setState] = createStore({ list: [] });

// 状態オブジェクトの `list` プロパティにアクセス
<For each={state.list}>{item => /*...*/}</For>
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

これらは単純なゲッターなので、値をキャッシュしたい場合は Memo を使用する必要があります;

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
fullName = createMemo(() => `${state.firstName} ${state.lastName}`);
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

setState は、変更へのパスを示すことができる、ネストされた設定もサポートしています。ネストされている場合、更新される状態は、オブジェクト以外の他の値である可能性があります。オブジェクトは引き続きマージされますが、その他の値（配列を含む）は置き換えられます。

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

## `produce`

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Immer にインスパイアされた Solid の Store オブジェクト用の API で、局所的なミューテーション変異を可能にします。

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

## `reconcile`

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

きめ細かい更新を適用できない場合に、データの変化を差分で表示します。ストアからの不変的なデータや、大きな API レスポンスを扱う場合に便利です。

アイテムをマッチさせるために、キーがあればそれを使用します。デフォルトでは、`merge` false は、可能な限り参照チェックを行って同等性を判断し、アイテムが参照的に等しくない場合には置換します。`merge` true は、すべての差分を葉ノードにプッシュし、以前のデータを新しい値に効果的に変換します。

```js
// observable の購読
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

## `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): Store<T> {
```

ミュータブルな Store プロキシオブジェクトを新規に作成します。ストアは、値が変化したときにのみ更新をトリガーします。追跡は、プロパティアクセスをインターセプトすることで行われ、プロキシ経由で深いネストを自動的に追跡します。

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

# コンポーネント API

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
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

Provider に渡された値は、そのまま `useContext` に渡されます。つまり、リアクティブな式としてのラッピングは機能しません。Signal や Store は、JSX でアクセスするのではなく、直接渡すべきです。

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

コンテキストを取得するために使用され、各 Component 関数にプロップを渡すことなく、props を深く渡すことができます。

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

`props.children` とのやりとりを容易にするために使用します。このヘルパーは、ネストされたリアクティビティを解決し、Memo を返します。JSX に直接渡す以外の方法で `props.children` を使用する際に推奨されるアプローチです。

```js
const list = children(() => props.children);

// それらを使って何かする
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
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

# 副次的なプリミティブ

おそらく初めてのアプリには必要ないでしょうが、あると便利なツールです。

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    name?: string;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

ブラウザがアイドル状態のときにダウンストリームの変更のみを通知する読み取り専用の変数を作成します。`timeoutMs` は、強制的に更新を行なうまでの最大待機時間です。

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

依存関係を自動的に追跡し、レンダリングの直前に実行する新しい計算を作成します。これは他のリアクティブプリミティブに書き込むために使用します。更新の途中で Signal に書き込むと、他の計算で再計算が必要になることがあるので、可能であれば代わりに `createMemo` を使用してください。

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

依存関係を自動的に追跡する新しい計算を作成し、DOM 要素が作成および更新されるが必ずしも結合されていないレンダリングフェーズで実行します。すべての内部 DOM の更新はこの時点で行われます。

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

値と一致するキーが入った、または出たときにのみサブスクライバに通知する条件付き Signal を作成します。委任された選択状態に便利です。演算が O(n) ではなく O(2) になるため。

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
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

これは、ブラウザアプリのエントリーポイントです。トップレベルのコンポーネント定義または関数と、マウントする要素を指定します。返された dispose 関数がすべての子を消去するので、この element は空にすることをお勧めします。

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

このメソッドは `render` と似ていますが、すでに DOM にレンダリングされているものを再利用しようとする点が異なります。ブラウザでの初期化時には、ページはすでにサーバーでレンダリングされています。

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    nonce?: string;
  }
): string;
```

文字列に同期的にレンダリングします。この関数は、プログレッシブハイドレーション用のスクリプトタグも生成します。オプションには、ページがロードされてハイドレーションの再生前に購読する eventNames と、スクリプトタグに付ける nonce があります。

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    timeoutMs?: number;
    nonce?: string;
  }
): Promise<string>;
```

結果を返す前に、すべての `<Suspense>` 境界が解決するのを待つという点を除いて、`renderToString` と同じです。リソースデータは自動的にスクリプトタグにシリアライズされ、クライアントのロード時にハイドレーションされます。

```js
const html = await renderToStringAsync(App);
```

## `pipeToNodeWritable`

```ts
export type PipeToWritableResults = {
  startWriting: () => void;
  write: (v: string) => void;
  abort: () => void;
};
export function pipeToNodeWritable<T>(
  fn: () => T,
  writable: { write: (v: string) => void },
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (r: PipeToWritableResults) => void;
    onComplete?: (r: PipeToWritableResults) => void | Promise<void>;
  }
): void;
```

このメソッドは、Node のストリームにレンダリングします。Suspense のフォールバックプレースホルダーを含むコンテンツを同期的にレンダリングし、完了すると任意の非同期リソースからデータをストリームし続けます。

```js
pipeToNodeWritable(App, res);
```

`onReady` オプションは、コアアプリのレンダリング前後にストリームに書き込む際に便利です。`onReady` を使用する場合は、手動で `startWriting` を呼び出すことを忘れないでください。

## `pipeToWritable`

```ts
export type PipeToWritableResults = {
  write: (v: string) => void;
  abort: () => void;
  script: string;
};
export function pipeToWritable<T>(
  fn: () => T,
  writable: WritableStream,
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
    onComplete?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
  }
): void;
```

このメソッドは、Web ストリームにレンダリングします。Suspense のフォールバックプレースホルダーを含むコンテンツを同期的にレンダリングし、完了すると任意の非同期リソースからデータをストリームし続けます。

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

`onReady` オプションは、コアアプリのレンダリング前後にストリームに書き込む際に便利です。`onReady` を使用する場合は、手動で `startWriting` を呼び出すことを忘れないでください。

## `isServer`

```ts
export const isServer: boolean;
```

これは、コードがサーバーまたはブラウザのバンドルとして実行されていることを示します。基礎となるランタイムがこの値を定数のブール値としてエクスポートするため、バンドラーはコードとその使用されるインポートをそれぞれのバンドルから取り除くことができます。

```js
if (isServer) {
  // 私はブラウザバンドルには入れません
} else {
  // サーバーでは実行されません;
}
```

# 制御フロー

Solid では制御フローにコンポーネントを使用しています。その理由は、リアクティビティのパフォーマンスを向上させるためには、要素の生成方法を制御する必要があるからです。例えばリストの場合、単純な `map` では、常にすべてをマッピングしてしまい、非効率です。これはヘルパー関数を意味します。

これらをコンポーネントでラップすることで、簡潔なテンプレートを作成するのに便利ですし、ユーザーが独自の制御フローを構成・構築することもできます。

これらの組み込み制御フローは自動的にインポートされます。`Portal` と `Dynamic` 以外のすべては `solid-js` からエクスポートされます。DOM に特化したこれらの 2 つは、`solid-js/web` からエクスポートされます。

> 注意: 制御フローのコールバック/レンダー関数の子はすべて追跡されません。これにより、状態をネストして作成でき、反応をよりよく分離できます。

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

シンプルな参照キー付きループ制御フローです。

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
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

Show 制御フローは、ビューの一部を条件付きでレンダリングするために使用されます。これは三項演算子（`a ? b : c`）に似ていますが、JSX のテンプレート化に最適です。

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

互いに排他的な条件が 2 つ以上ある場合に便利です。単純なルーティングなどにも利用できます。

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
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

キーを持たないリストの反復（インデックスをキーとする行）。これは、データがプリミティブで構成されていて、値ではなくインデックスが固定されている場合など、概念的なキーが存在しない場合に便利です。

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
export function Suspense(props: {
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
export function Portal(props: {
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
// 単純な代入
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

`element.classList.toggle` を利用したヘルパーです。クラス名をキーにしたオブジェクトを受け取り、解決した値が true の時にクラス名を割り当てます。

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Solid の style ヘルパーは、文字列とオブジェクトのどちらでも動作します。React のそれとは異なり、Solid は内部で `element.style.setProperty` を使用しています。これは、CSS 変数をサポートすることを意味しますが、同時にプロパティの小文字のダッシュケースを使用することを意味します。これは実際にパフォーマンスの向上と SSR 出力の一貫性につながります。

```jsx
// 文字列
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// オブジェクト
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// CSS 変数
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

これらは、同等のプロパティと同じように動作します。文字列を設定すると、これらが設定されます。**注意!!** 悪意のある攻撃のベクトルとなる可能性があるため、エンドユーザーに公開される可能性のあるデータは `innerHTML` を使用してください。`textContent` は一般的には必要ありませんが、一般的な差分ルーチンをバイパスするため、子がテキストのみであることがわかっている場合には、実際にはパフォーマンスの最適化になります。

```jsx
<div textContent={state.text} />
```

## `on___`

Solid のイベントハンドラは、スタイルに応じて、通常、`onclick` または `onClick` の形式をとります。イベント名は常に小文字で表記されます。Solid では、合成されてバブルが発生する一般的な UI イベントに対して、半合成のイベントデリゲーションを使用しています。これにより、これらの共通イベントのパフォーマンスが向上します。

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid は、イベントハンドラの第一引数に値をバインドするために、イベントハンドラに配列を渡すこともサポートしています。これは `bind` を使用せず、追加のクロージャも作成しないため、イベントのデリゲーション方法として高度に最適化されています。

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

イベントは再バインドさせることができず、バインディングはリアクティブではありません。その理由は、一般的にリスナーをアタッチ/デタッチする方がコストがかかるからです。イベントは自然に呼び出されるので、リアクティブにする必要はなく、必要に応じてハンドラーをショートカットするだけです。

```jsx
// 定義されている場合は呼び出し、そうでない場合は呼び出さない
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

その他のイベント、例えば変わった名前のイベントや、デリゲートしたくないイベントには、`on` 名前空間イベントがあります。これは単に、イベントリスナーをそのまま追加するだけです。

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

これらはカスタムディレクティブです。ある意味では ref のシンタックスシュガーに過ぎませんが、1 つの要素に複数のディレクティブを簡単に付けることができます．ディレクティブは、次のようなシグネチャを持つ関数に過ぎません:

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

Solid のコンパイラは、JSX 式のリアクティブなラッピングと遅延評価にシンプルなヒューリスティックを使用しています。関数の呼び出し、プロパティへのアクセス、または JSX が含まれていますか？ そうであれば、コンポーネントに渡される場合はゲッターでラップし、ネイティブ要素に渡される場合は Effect でラップします。

これを知っていれば、JSX の外からアクセスするだけで、変更されないことがわかっているもののオーバーヘッドを減らすことができます。単純な変数がラップされることはありません。また、式の最初にコメントデコレータ `/* @once */` を付けることで、ラップしないようにコンパイラに指示できます。

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

これは、子に対しても有効です。

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
