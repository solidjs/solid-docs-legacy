# 基本のリアクティビティ

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

これは時間の経過とともに変化する単一の値を追跡するために使用される、最も基本的なリアクティブプリミティブです。`createSignal` 関数は、ゲッター (またはアクセサー) とセッターの 2 つの関数を配列として返します。

ゲッターは Signal の現在の値を返します。追跡スコープ内（`createEffect` に渡される関数や、JSX 式で使用される関数など）で呼び出された場合、Signal が更新されると呼び出し側のコンテキストが再実行されます。

セッターは Signal を更新します。唯一の引数として、Signal の新しい値か、Signal の前回の値を新しい値にマップする関数を受け取ります。セッターは更新された値を返します。

```js
const [getValue, setValue] = createSignal(initialValue);

// 値の読み取り
getValue();

// 値の設定
setValue(nextValue);

// 関数の setter を使って値を設定
setValue((prev) => prev + next);
```

> Signal に関数を格納したい場合は、関数の形式を使用する必要があります:
>
> ```js
> setValue(() => myFunction);
> ```

##### Options

Solid のいくつかのプリミティブは、省略可能な最後の引数として "options" オブジェクトを取ります。`createSignal` の options オブジェクトには `equals` オプションを指定できます。

```js
const [getValue, setValue] = createSignal(initialValue, { equals: false });
```

デフォルトでは、シグナルのセッターが呼び出されたとき、新しい値が古い値と実際に異なる場合にのみ依存関係が再実行されます。`equals` を `false` に設定することで、セッターが呼ばれた後に依存関係を常に再実行できます。また、独自の等価関数を渡すこともできます。

```js
const [myString, setMyString] = createSignal("string", {
  equals: (newVal, oldVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // 最後の値と等しいと見なされ、更新は発生しません
setMyString("stranger"); // 異なると見なされ、更新が発生します
```

## `createEffect`

```ts
export function createEffect<T>(fn: (v: T) => T, value?: T): void;
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

Effect バッチ内の Signal の変更: Effect の実行が終了するまで、Signal の更新は行われません。

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
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

memo 関数は、セッターを呼び出すことによって他の Signal を変更してはいけません（それは "純粋" でなければなりません）。これにより、読み込まれた依存関係に応じて Memo の実行順序を最適化できます。

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

非同期リクエストの結果を Signal するシグナルを作成します。

`createResource` は非同期のフェッチャー関数を受け取り、フェッチャーが完了したときに結果のデータで更新される Signal を返します。

`createResource` を使用するには、2 つの方法があります。フェッチャー関数を唯一の引数として渡すか、または、最初の引数としてソース Signal を渡すことができます。ソース Signal は、それが変更されるたびにフェッチャーを再トリガーし、その値がフェッチャーに渡されます。
```js
const [data, { mutate, refetch }] = createResource(fetchData)
```
```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData)
```
これらのスニペットでは、フェッチャーは関数 `fetchData` です。どちらの場合も、`fetchData` が解決を終えるまで `data()` は undefined です。最初のケースでは、`fetchData` はすぐに呼び出されます。
2 番目のケースでは、`sourceSignal` が `false`, `null`, `undefined` 以外の値を持つとすぐに `fetchData` が呼び出されます。
また、`sourceSignal` の値が変更されるたびに再度呼び出され、常に `fetchData` に第一引数として渡されます。

どちらの方法でも、`mutate` を呼び出すことで、`data` Signal を直接更新できます（他の Signal セッターと同じように動作します）。また、`refetch` を呼び出すことでフェッチャーを直接再実行でき、`refetch(info)` のように追加の引数を渡すことで、フェッチャーに追加情報を提供できます。

`data` は通常の Signal のゲッターのように動作します。 `fetchData` の最後の戻り値を読み取るには `data()` を使用します。
しかし、これには 2 つの追加プロパティがあり、`data.loading` はフェッチャーが呼び出されたが返されていないかどうかを示します。そして、`data.error` はリクエストがエラーになったかどうかを示します（注意: もしエラーが予想される場合は `createResource` を [ErrorBoundary](#%3Cerrorboundary%3E) でラップするとよいでしょう）。

`loading` と `error` はリアクティブゲッターで、追跡が可能です。

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

自動廃棄されない新しい非追跡の所有者スコープを作成します。これは、親の再評価時に解放したくない、ネストされたリアクティブスコープなどに便利です。

すべての Solid のコードは、すべてのメモリ/計算が解放されることを保証するため、これらのいずれかのトップレベルでラップされる必要があります。通常は、すべての `render` エントリー関数に `createRoot` が組み込まれているので、これを気にする必要はありません。

## `getOwner`

```ts
export function getOwner(): Owner;
```

実行中のリアクティブスコープの現在の所有している計算を取得します。このスコープは必ずしも追跡しているわけではなく、現在の実行ブロックの廃棄を担当するスコープです。

## `runWithOwner`

```ts
export function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

提供された所有者の下でコードを実行してから、外側のスコープの所有者に復元します。

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

リアクティブオブジェクトをキーで分割します。

リアクティブオブジェクトと任意の数のキーの配列を取ります。キーの配列ごとに、元のオブジェクトのプロパティだけを持つリアクティブオブジェクトが返されます。返された配列の最後のリアクティブオブジェクトは、元のオブジェクトの残りのプロパティがあります。

これは、props のサブセットを利用し、残りを子に渡したい場合に便利です。

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
export function startTransition: (fn: () => void) => Promise<void>;
```

`useTransition` と似ていますが、関連する保留状態はありません。これは単にトランジションを開始するために直接使用できます。

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

## `from`

**v1.1.0 の新機能**

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

RxJS observables や Svelte Stores のような外部プロデューサーとの相互運用を容易にするためのシンプルなヘルパーです。これは基本的に、任意の購読可能なもの（`subscribe` メソッドを持つオブジェクト）を Signal に変え、購読と廃棄を管理します。

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

# ストア

これらの API は `solid-js/store` で公開されています。これにより、Signal のツリーを個別に追跡・変更できる[プロキシオブジェクト](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy)であるストアを作成できます。

## ストアの使用

### `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
```

create 関数は初期状態を受け取り、それをストアでラップし、読み取り専用のプロキシオブジェクトとセッター関数を返します。

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore(initialValue);

// 値の読み取り
state.someValue;

// 値の設定
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

プロキシとしてのストアオブジェクトは、プロパティがアクセスされたときのみ追跡します。

ネストしたオブジェクトがアクセスされると、ストアはネストしたストアオブジェクトを生成し、これはツリーの下まで適用されます。ただし、これは配列とプレーンオブジェクトにのみ適用されます。クラスはラップされないので、`Date`, `HTMLElement`, `RegExp`, `Map`, `Set` といったオブジェクトは、ストアのプロパティとしてきめ細かく反応しません。

トップレベルの状態オブジェクトは追跡できないので、状態オブジェクト自体を使用するのではなく、状態のキーにリストを置くようにしてください。

```js
// list を状態オブジェクトのキーにする
const [state, setState] = createStore({ list: [] });

// 状態オブジェクトの `list` プロパティにアクセス
<For each={state.list}>{item => /*...*/}</For>
```

### ゲッター

Store オブジェクトは、計算した値を格納するためのゲッターをサポートしています。

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

これらは単純なゲッターなので、値をキャッシュしたい場合は Memo を使用する必要があります:

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
export function produce<T>(
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
export function unwrap(store: Store<T>): T;
```

ストアの基となるデータをプロキシなしで返します。

### `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T> {
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

Provider に渡された値は、そのまま `useContext` に渡されます。つまり、リアクティブな式としてのラッピングは機能しません。Signal やストアは、JSX でアクセスするのではなく、直接渡すべきです。

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

コンテキストを取得して、各 Component 関数を通過させることなく props を深く渡すことができるようにするために使用されます。

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

## `createUniqueId`

```ts
export function createUniqueId(): string;
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
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

ブラウザがアイドル状態のときにダウンストリームの変更のみを通知する読み取り専用の変数を作成します。`timeoutMs` は、強制的に更新を行なうまでの最大待機時間です。

## `createComputed`

```ts
export function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

依存関係を自動的に追跡し、レンダリングの直前に実行する新しい計算を作成します。これは他のリアクティブプリミティブに書き込むために使用します。更新の途中で Signal に書き込むと、他の計算で再計算が必要になることがあるので、可能であれば代わりに `createMemo` を使用してください。

## `createRenderEffect`

```ts
export function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

依存関係を自動的に追跡する新しい計算を作成し、DOM 要素が作成および更新されるが必ずしも結合されていないレンダリングフェーズで実行します。すべての内部 DOM の更新はこの時点で行われます。

## `createReaction`

**New in v1.3.0**

```ts
export function createReaction(
  onInvalidate: () => void
): (fn: () => void) => void;
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
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean
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
export function renderToStringAsync<T>(
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

Hydration Script は、Solid のランタイムがロードされる前に Hydration を起動するために、ページ上に一度配置される特別なスクリプトです。HTML 文字列に挿入して呼び出す関数として、または `<html>` タグから JSX をレンダリングする場合はコンポーネントとして提供されます。

オプションは、スクリプトscript タグに付けられる `nonce` と、スクリプトがロードされる前に Solid が取得し、ハイドレーション中に再生されるイベント名です。これらのイベントは Solid が委譲するものに限定され、合成やバブルなどの UI イベントが含まれます。デフォルトでは、`click` および `input` イベントのみです。

# 制御フロー

リアクティブな制御フローがパフォーマンスを発揮するためには、要素がどのように作成されるかを制御する必要があります。例えば、リストの場合、単純な `map` は常に配列全体をマップしてしまうので、非効率的です。

これはヘルパー関数を意味します。これらをコンポーネントでラップすることによって、簡潔なテンプレートを作成するのに便利ですし、ユーザーが独自の制御フローを構成・構築することもできます。

これらの組み込み制御フローコンポーネントは自動的にインポートされます。`Portal` と `Dynamic` 以外のすべては `solid-js` からエクスポートされます。DOM に特化したこれらの 2 つは、`solid-js/web` からエクスポートされます。

> 注意: 制御フローのコールバック/レンダー関数の子はすべて追跡されません。これにより、状態をネストして作成でき、反応をよりよく分離できます。

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

単純な参照キー付きループ。コールバックは第一引数として現在のアイテムを受け取ります。

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
イベントハンドラーは、イベントが発生するたびに他の関数と同様に呼び出されるので、リアクティビティは必要ありません。必要に応じてハンドラーをショートカットするだけです。

```jsx
// 定義されている場合は呼び出し、そうでない場合は呼び出さない
<div onClick={() => props.handleClick?.()} />
```

`onChange` と `onInput` はそれぞれのネイティブな動作に基づいて動作することに注意してください。`onInput` は、値が変更された直後に発生します。`<input>` フィールドの場合、`onChange` はフィールドがフォーカスを失った後にのみ発生します。

## `on:___`/`oncapture:___`

その他のイベント、例えば変わった名前のイベントや、委譲したくないイベントには、`on` 名前空間イベントがあります。これは単に、イベントリスナーをそのまま追加するだけです。

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
