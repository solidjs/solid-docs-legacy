---
title: API
description: Ringkasan tentang semua API dari Solid.
sort: 0
---

# Reaktifitas Dasar

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Ini adalah primitif reaktifitas paling dasar yang digunakan untuk melacak nilai tunggal yang berganti tiap saat. Fungsi ini mengembalikan sebuah pasangan fungsi get dan set untuk mengakses dan memperbarui signalnya.

```js
const [getValue, setValue] = createSignal(initialValue);

// mengakses nilai
getValue();

// memperbarui nilai
setValue(nextValue);

// mengeset nilai dengan fungsi setter
setValue((prev) => prev + next);
```

Ingat untuk mengakses signals di bawah cakupan dari pelacakan jika kamu mengharapkan mereka untuk diperbarui. Cakupan-cakupan pelacakan adalah sebuah fungsi-fungsi yang dioper ke komputasi seperti `createEffect` atau ekspresi-ekspresi JSX.

> Jika kamu berharap untuk menyimpan sebuah fungsi di Signal kamu bisa menggunakan bentuk fungsinya:
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

Membuat sebuah komputasi baru yang akan secara otomatis melacak dependencies dan jalan setiap setelah render dimana dependency terganti. Ideal saat digunakan untuk `ref` dan mengelola side effect lainnya.

```js
const [a, setA] = createSignal(initialValue);

// effect that depends on signal `a`
createEffect(() => doSideEffect(a()));
```

Fungsi effectnya akan dipanggil dengan nilai eksekusi terakhir yang dikembalikan dari fungsi effectnya. Nilai ini diinisialisasi sebagai argumen ke-2 yang opsional. Ini berguna untuk melakukan diffing tapi harus membuat closure tambahan.

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

Membuat signal turunan yang hanya dapat dibaca/akses, yang akan mengkalkulasi nilainya ketika dependencies kode yang tereksekusi memperbarui.

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()));

// mengakses nilai
getValue();
```

Fungsi memo dipanggil dengan nilai eksekusi terakhir fungsi yang dikembalikan dari fungsi memonya. Nilai ini diinisialisasi sebagai argumen ke-2 yang opsional. Ini berguna untuk mengurangi melakukan komputasi-komputasi.

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

Membuat sebuah signal yang dapat mengelola permintaan-permintaan asinkron. `fetcher` adalah fungsi asinkron yang menerima nilai dari `source` jika tersedia dan mengembalikan sebuah Promise yang dimana nilai terselesaikannya si set di resource. `fetcher` ini tidaklah reaktif jadi gunakan argumen opsional pertama jika kamu ingin menjalankannya lebih dari satu kali. Jika source terselesaikan sebagai false, null, atau undefined ia tidak akan menjalankan fetch.

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// akses nilai
data();

// cek jika loading
data.loading;

// cek jika error
data.error;

// set nilai secara langsung tanpa membuat promise
mutate(optimisticValue);

// meng-fetch ulang permintaan
refetch();
```

`loading` dan `error` adalah getters reaktif dan dapat di lacak.

# Siklus Hidup (Lifecycles)

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Mendaftarkan method yang akan jalan setelah render awal dan semua elemen telah terpasang (mounted). Ideal untuk menggunakan `ref` dan mengelola side effect lainnya yang berjalan satu kali saja. Ia setara dengan `createEffect` yang tidak memiliki dependencies apapun.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Mendaftarkan method cleanup yang akan tereksekusi saat disposal atau mekalkulasi ulang cakupan reaktif saat ini. Dapat digunakan di segala Komponen atau Effect.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Mendaftarkan method error handler yang akan tereksekusi ketika cakupan turunan (child scope) mempunyai error. Hanya error handler pada cakupan terdekat yang tereksekusi. Rethrow untuk memicu linenya.

# Utilitas Reaktif

Fungsi bantuan berikut akan membantu menyediakan kemampuan untuk memperbagus schedule pembaruan dan mengontrol bagaimana reaktifitas di lacak.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

Mengabaikan lacakan terhadap semua dependencies yang terdapat di blok kodenya dan mengembalikan nilainya.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Menahan melakukan pembaruan didalam blok sampai akhir untuk mencegah pengitungan ulang yang tidak perlu. Ini berarti pembacaan nilai pada baris berikutnya belum akan diperbarui. Method-method set dari [Solid Store](#createstore) dan Effect akan secara otomatis membungkus kode mereka didalam `batch`.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` di desain untuk dioper kedalam sebuah komputasi untuk membuat dependenciesnya menjadi explisit. Jika sebuah dependencies array dioper/masukkan, `input` dan `prevInput` akan menjadi array.

```js
createEffect(on(a, (v) => console.log(v, b())));

// sama dengan:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

Kamu juga tidak dapat langsung menjalankan komputasi dan hanya bisa memilih untuk menjalankannya hanya saat perubahan dengan menyetel opsi `defer` ke `true`.

```js
// tidak langsung jalan
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // sekarang akan jalan
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Membuat sebuah konteks baru yang tidak terlacak dan tidak ter-dispose secara otomatis. Ini berguna untuk nested konteks yang reaktif yang kamu tidak ingin bebaskan ketika parent ter-evaluasi ulang. Ini adalah pola yang kuat untuk caching.

Semua kode Solid harus terbungkus dengan salah satu tingat-atas ini karena mereka memastikan semua memori/komputasi terbebaskan (freed up). Biasanya kamu tidak perlu memikirkan hal ini karena `createRoot` telah disematkan kedalam semua fungsi entry `render`.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

Adalah sebuah method `merge` objek reaktif. Berguna untuk menyetel default props untuk komponen-komponen pada kasus pemanggil mereka tidak menyediakannya. Atau meng-kloning objek `props` termasuk properti-properti reaktif.

Method ini bekerja dengan cara menggunakan proxy dan menyelesaikan (resolving) properti-properti dalam urutan yang terbalik. Ini memungkinkan untuk melakukan pelacakan dinamis untuk properti-properti yang tidak ada saat objek `props` pertama kali di gabungkan (merged).

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

Ini adalah pengganti untuk destructuring. Ia akan membagi objek reaktif dengan kunci sambil mempertahankan reaktifitas.

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

Digunakan untuk mengelompokkan pembaruan asinkron didalam commit transaksi yang ter-defer sampai semua proses asinkron selesai. Ini terkait dengan Suspense dan hanya melacak read resources dibawah batas Suspense.

```js
const [isPending, start] = useTransition();

// cek jika mentransisi
isPending();

// bungkus di dalam transisi
start(() => setSignal(newValue), () => /* transisi selesai */)
```

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

Method ini mengambil signal dan menghasilkan sebuah Observable sederhana. Gunakan dari library Observable pilihan kamu biasanya dengan fungsi operator `from`.

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

Bantuan map reaktif yang dapat men-cache tiap item dari referensi untuk mengurangi mapping yang tidak perlu pada pembaruan. Ia hanya akan menjalankan fungsi mapping satu kali per nilai dan berpindah atau menghapus sesuai keperluan. Argumen indexnya adalah sebuah signal. Fungsi map sendiri tidak akan dilacak.

Fungsi bantuan yang mendasari control flow `<For>`.

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

Mirip seperti `mapArray` kecuali ia me-map dengan index. Itemnya adalah sebuah signal dan index-nya sekarang adalah constant.

Fungsi bantuan yang mendasari control flow `<Index>`.

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

API-API berikut ini tersedia di `solid-js/store`.

## `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

Method ini membuat sebuah sebuah Signal-signal pohon (tree of Signals) sebagai proxy yang membolehkan nilai-nilai individu didalam struktur-struktur data yang ter-nested untuk dilacak secara individu. Fungsi create ini mengembalikan sebuah objek proxy readonly dan sebuah fungsi setter.

```js
const [state, setState] = createStore(initialValue);

// read value
state.someValue;

// set value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

Objek-objek Store sebagai proxy hanya akan melacak saat property di akses. Dan pada saat diakses, Stores secara rekursif menghasilkan objek Store pada nested data. Tetapi itu hanya membungkus array-array dan objek-objek polos. Classes tidak akan dibungkus. Jadi hal-hal seperti `Date`, `HTMLElement`, `Regexp`, `Map`, `Set` tidak akan reaktif. Selain itu, objek state tingkat atas tidak dapat dilacak tanpa mengakses properti didalamnya. Jadi ia tidak cocok untuk digunakan untuk hal-hal yang kamu ulangi (iterate) karena menambahkan key atau index baru tidak dapat memicu pembaruan. Jadi letakkan list pada key dari statenya daripada mencoba untuk menggunakan objek statenya sendiri.

```js
// taruh list sebagai key dari objek state
const [state, setState] = createStore({ list: [] });

// akses properti `list` pada objek state
<For each={state.list}>{item => /*...*/}</For>
```

### Getters

Objek Store mendukung penggunaan getters untuk menyimpan nilai yang telah dikalkulasi.

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

Itu adalah getters sedrhana, jadi kamu tetap harus menggunakan Memo jika kamu mau meng-cache sebuah nilai;

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

### Memperbarui Stores

Perubahan dapat berupa fungsi yang mengoper state sebelumnya dan mengembalikan state baru atau sebuah nilai. Objek-objek akan selalu digabungkan secara dangkal (shallowly merged). Setel nilai ke `undefined` untuk menghapusnya dari Store.

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

Ia mendukung paths termasuk key array, objek ranges, dan fungsi filter.

`setState` juga mendukung nested setting dimana kamu dapat mengindikasi path untuk ke tempat yang mau diubah. Ketika melakukan nested, state yang kamu akan perbarui nybgjub saja merupakan nilai-nilai yang bukan objek. Objek-objek akan tetap di gabung (merged) tapi nilai lainnya (termasuk Arrays) akan di ganti.

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

Path dapat berupa key string, key dari array, objek iterasi ({from, to, by}), atau fungsi filter. Ini memberikan kekuatan ekspresi yang luar biasa untuk menggambarkan perubahan suatu state.

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

API yang terinspirasi dari Immer untuk objek Store Solid yang memungkinkan mutasi lokal.

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

Membandingkan perubahan data ketika kita tidak dapat menerapkan pembaruan terperinci. Berguna untuk saat menangani data immutable dari stores atau respon API yang besar.

Key-nya akan digunakan ketika tersedia untuk mencocokkan item-item. Secara default `merge` false melakukan pemeriksaan referensial jika memungkinkan untuk menentukan kesetaraan dan mengganti item yang tidak sama secara referensial. `merge` true mendorong semua diff ke daun-daun (leaves) dan secara efektif mengubah data sebelumnya ke nilai baru.

```js
// subscribing to an observable
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

Membuat objek proxy mutable Store baru. Stores hanya memicu pembaruan pada saat nilai-nilai berubah. Pelacakan dilakukan dengan mencegat akses properti dan secara otomatis melacak deep nesting melalui proxy.

Berguna untuk mengintegrasi eksternal system atau sebagai lapisan kompatibilitas dengan MobX/Vue.

> **Catatan:** Sebuah state mutable dapat dioper kesana kemari dan di mutasi dimana saja, yang dapat membuat ia lebih susah di ikuti dan mudah untuk menghancurkan flow unidirectional. Biasanya disarankan untuk menggunakan `createStore` saja. `produce` modifier dapat memberikan manfaat yang sama tanpa kerugian yang ada.

```js
const state = createMutable(initialValue);

// read value
state.someValue;

// set value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutable mendukung setters bersamaan dengan getters.

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

# API-API Komponen

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context menyediakan bentuk injeksi di Solid. Ia digunakan untuk menghemat dari kebutuhan untuk mengoper data sebagai props melalui komponen-komponen perantara.

Fungsi ini membuat sebuah objek konteks baru yang dapat digunakan dengan `useContext` dan menyediakan control flow `Provider`. Default Context digunakan ketika tidak ada `Provider` ditemukan di atas dalam hierarki.

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

Nilai yang dioper ke provider dioper ke `useContext` secara apa adanya. Itu berarti membungkusnya dengan ekspresi reaktif tidak akan bekerja. Kamu harus mengoper di Signals dan Stores secara langsung daripada mengaksesnya di JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Digunakan untuk mengambil context untuk memungkinkan pengoperan props secara dalam (deep passing of props) tanpa harus mengopernya ke tiap-tiap fungsi Komponen.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Digunakan untuk membuat interaksi dengan `props.children` lebih mudah. Helper ini menyelesaikan semua reaktivitas bersarang dan mengembalikan memo. Pendekatan yang disarankan untuk menggunakan `props.children` selain melalui langsung ke JSX.

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

Digunakan untuk memuat komponen-komponen secara lazy untuk memungkinkan 'code splitting'. Komponen-komponen tidak dimuat sampai dirender. Komponen-komponen yang dimuat secara lazy dapat digunakan sebagai mana kita menggunakannya ketika dia di import secara statis, mengoper props, dan sebagainya... Komponen-komponen yang Lazy memicu `<Suspense>`

```js
// membungkus import
const ComponentA = lazy(() => import("./ComponentA"));

// gunakan di JSX
<ComponentA title={props.title} />;
```

# Primitif-primitif Sekunder

Kamu mungkin tidak membutuhkan mereka untuk aplikasi pertama kamu, tapi mereka adalah alat-alat yang berguna untuk dimiliki.

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

Membuat sebuah hanya-baca (readonly) yang hanya akan menotifikasi perubahan downstream saat browser tidak digunakan. `timeoutMs` adalah waktu maksimum untuk menunggu sebelum memaksa pembaruannya.

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Membuat sebuah komputasi baru yang secara otomatis melacak dependencies dan jalan secara langsung sebelum render. Gunakan ini untuk menulis ke primitif reaktif lain. Bila memungkinkan gunakan `createMemo` daripada menulis ke sebuah signal pada pertengahan pembaruan (mid update) dapat menyebabkan komputasi-komputasi lainnya membutuhkan kalkulasi ulang (re-calculate).

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Membuat sebuah komputasi baru yang melacak secara otomatis dependencies dan jalan pada fase merender saat elemen-elemen DOM telah terbuat dan diperbarui tapi belum tentu terhubung. Semua pembaruan internal DOM terjadi pada saat ini.

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

Membuat sebuah signal kondisional yang hanya akan menotifikasi subscriber-subscriber ketika memasuki atau mengeluari key mereka menyesuakan nilainya. Berguna untuk state selection yang didelegasikan. Karena itu membuat operasi O(2) daripada O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Me-render

Import-import berikut terekspos dari `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

Ini adalah entry point aplikasi browser. Menyediakan definisi komponen tingkat atas atau fungsi dan sebuah elemen untuk di-mount. Sebaiknya elemen ini dikosongkan karena fungsi dispose yang dikembalikan akan menghapus semua bawahan (children).

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

Method ini mirip dengan `render` kecuali ia mencoba untuk meng-hydrate apa yang telah terender di DOM. Ketika menginisialisasi di browser sebuah halaman telah ter-server rendered.

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

Merender kedalam sebuah string yang secara sinkron. Fungsi ini juga mengenerate sebuah tag script untuk hydration yang progresif. Options-nya termasuk `eventNames` untuk me-listen ke sebelum halaman termuat dan menjalankan kembali pada saat hydration, dan `nonce` untuk dimasukkan pada tag script.

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

Sama seperti `renderToString` kecauli fungsi ini akan menunggu semua batasan (boundaries) `<Suspense>` untuk selesai sebelum mengembalikan hasilnya. Data resource akan secara otomatis di serialisasikan kedalam tag script dan akan di hydrate saat client load.

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

Method ini akan me-render ke sebuah stream Node. Ia akan me-render konten secara sinkron termasuk semua placeholder fallback Suspense, dan akan melanjutkan men-stream datanya dari semua resource asinkron saat ia selesai.

```js
pipeToNodeWritable(App, res);
```

Opsi `onReady` ini berguna untuk menulis ke dalam stream sekitar perenderan inti aplikasi. Ingat, jika kamu menggunakan `onReady`, panggil `startWriting` secara manual.

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

Method ini me-render ke sebuah stream web. Ia me-render kontennya secara sinkron termasuk semua placeholder fallback Suspense, dan akan melanjutkan men-stream datanya dari semua resource asinkron saat ia selesai.

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

Opsi `onReady` ini berguna untuk menulis ke dalam stream sekitar perenderan inti aplikasi. Ingat, jika kamu menggunakan `onReady`, panggil `startWriting` secara manual.

## `isServer`

```ts
export const isServer: boolean;
```

Konstan ini mengindikasi bahwa kode kita sedang berjalan sebagai bundle server atau browser. Karena underlying runtimes mengekspor ini sebagai boolean konstan, ini memungkinkan bundler untuk menghilangkan kode dan impor yang digunakan dari bundel masing-masing.

```js
if (isServer) {
  // Kode disini tidak akan dimasukkan ke bundle browser
} else {
  // Tidak akan berjalan di server;
}
```

# Aliran Kontrol (Control Flow)

Solid menggunakan komponen-kompone untuk aliran kontrol. Alasannya adalah karena untuk reaktifitas dapat ber-performa kita harus mengontrol bagaimana elemen-elemen dibuat. Sebagai contoh dengan lists, sebuah `map` sederhana tidak effisien karena selalu memetakan (map) semunya. Ini berarti fungsi-fungsi bantuan.

Membungkus mereka didalam komponen-komponen adalah cara yang sesuai untuk terse templating dan memungkinkan pengguna untuk menyusun dan membuat aliran kontrol mereka sendiri.

Aliran kontrol bawaan ini akan secara otomatis ter-impor. Semua kecuali `Portal` dan `Dynamic`, mereka diekspor dari `solid-js`. Kedua komponen ini yang khusus untuk DOM, diekspor dari `solid-js/web`.

> Catatan: Semua bawahan fungsi callback/render dari aliran kontrol tidak akan dilacak (non-tracking). Ini memungkinkan untuk pembuat nesting state, dan mengisolasi reaksi lebih baik.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Aliran kontrol loop sederhana yang dikunci secara referensial.

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

Argumen kedua opsional adalah signal index:

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

Aliran kontrol `Show` digunakan untuk merender bagian dari view secara kondisional. Ia mirip dengan operasi ternary (`a ? b : c`) tapi ideal untuk templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show juga dapat digunakan sebagai cara untuk keying blocks kepada model data tertentu. Contoh, fungsinya akan tereksekusi ulang setiap kali model `user` diganti.

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

Berguna untuk ketika ada lebih dari 2 kondisi-kondisi mutual ekslusif. Dapat digunakan untuk hal-hal seperti routing sederhana.

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

Match juga mendukung fungsi bawahan untuk me-serve sebagai keyed flow.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Iterasi non-keyed list (rows keyed ke index). Ini berguna ketika tidak ada key yang konseptual, seperti jukga datanya terdiri dari primitif-primitf dan dia adalah index yang tetap daripada nilainya.

Itemnya adalah sebuah signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Argumen kedua opsional adalah nomor index:

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

Menangkap error-error yang tidak tertangkap dan merender konten fallback.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Juga mendukung bentuk callback yang mengoper error dan fungsi reset.

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

Sebuah komponen yang melacak semua resource read dibawahnya dan memunculkan placeholder fallback sampai mereka terselesaikan. Apa yang membuat `Suspense` berbeda dengan `Show` adalah dia non-blocking dimana kedua cabang ada secara bersamaan bahkan jika belum ada di DOM.

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

`SuspenseList` memungkinkan untuk mengkoordinasikan beberapa paralel komponen-komponen `Suspense` dan `SuspenseList`. Ini mengontrol urutan dari konten apa yang terlebih dahulu terbuka untuk mengurangi layout thrashing dan memiliki opsi untuk mengciutkan atau menyembunyikan fallback state.

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

SuspenseList masih dalam tahap eksperimen dan belum memiliki dukungan SSR secara utuh.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

Komponen ini membolehkan kamu untuk memasukkan Komponen arbitrari atau tag dan mengoper props kedalamnya.

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

Ini memasukkan elemen kedalam node `mount`. Berguna untuk memasukkan (inserting) Modal diluar dari halaman layout. Event-event tetap ter-propagate melalui Hirearki Komponen.

Portalnya akan di mount di sebuah `<div>` kecauli targetnya adalah document head. `useShadow` menaruh elemennya dalam sebuah Shadow Root untuk mengisolasi style, dan `isSVG` dibutuhkan jika dimasukkan kedalam sebuah elemen SVG agar `<div>` tidak termasukkan (not inserted).

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Atribut-atribut Spesial JSX

Pada dasarnya Solid mencoba untuk tetap pada konvensi DOM. Sebagian besar props diperlaukan sebagai atribut pada elemen-elemen asli (native elements) dan properti pada Web Components, tapi ada beberapa darinya memiliki perilaku khusus.

Untuk 'custom namespaced attributes' dengan TypeScript kamu perlu memperluas (extend) namespace JSX Solid:

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

Refs adalah cara untuk mengambil akses ke underlying elemen-elemen DOM pada JSX kita. Meskipun itu benar kamu hanya bisa menetapkan elemen ke variabel, akan lebih optimal untuk membiarkan komponen pada aliran dari JSX. Refs di assign pada waktu render tapi sebelum terkoneksi ke DOM. Mereka datang dalam 2 rasa.

```js
// simple assignment
let myDiv;

// menggunakan onMount atau createEffect untuk membaca setelah terkoneksi ke DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Atau, fungsi callback (terpanggil sebelum terkoneksi ke DOM)
<div ref={el => console.log(el)} />
```

Refs juga dapat digunakan pada Kompone-komponen. Mereka tetap harus di ikat (attached) ke sisi lainnya.

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

Sebuah fungsi bantua yang memanfaatkan `element.classList.toggle`. Ia membutuhkan objek dimana key-nya adalah nama class dan meng-assign mereka ketika nilai yang terselesaikan (resolved value) itu true.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

fungsi bantuan `style` Solid bekerja dengan string maupun objek. Tidak seperti varsi React, Solid menggunakan `element.style.setProperty` di belakangnya (under the hood). Ini berarti dukungan untuk CSS variables, tapi ini juga berarti kita menggunakan versi lower, dash-case untuk propertinya. Ini sebenarnya dapat membuat performa yang lebih baik dan hasil SSR yang konsisten.

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

Mereka bekerja sama seperti ekualiven properti mereka. Menyetel sebuah string dan mereka akan ter-setel. **Hati-hati!!** Menyetel `innerHTML` dengan data apapun dapat terekspos ke pengguna akhir (end user) dan itu dapat menjadi vektor serangan berbahaya (malicious attack). `textContent`, meskipun pada dasarnya tidak dibutuhkan dapat mengoptimalkan performa ketika kamu tahu bawahan (children) hanya akan berupa teks karena melewati rutinitas diffing umum.

```jsx
<div textContent={state.text} />
```

## `on___`

Event handlers pada Solid biasanya berbentuk `onclick` or `onClick` sesuai dengan code style. Nama event akan selalu di lowercase kan. Solid menggunakan delegasi semi-synthetic event untuk event-event UI umum yang disusun dan bubble. Ini meningkatkan performa untuk event-event umum ini.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid juga mendukung mengoper sebuah array ke event handler untuk mengikat sebuah nilai ke argumen pertama dari event handler. Ini tidak menggunakan `bind` atau membuat closure tambahan, sehingga ini cara delegasi event yang sangat dioptimalkan.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events tidak dapat rebound dan binding-binding tidak reaktif. Alasannya adalah pada umumnya akan lebih expensive untuk meng-attach/detach listeners. Karena events secara alami dipanggil, tidak perlu untuk reaktifitas, cukup shortcut handler kamu jika menginginkannya.

```jsx
// jika didefinisikan panggil, jika tidak jangan.
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

Untuk events lainnya, mungkin mereka yang punya nama-nama yang tidak biasa, atau yang kamu tidak ingin didelegasikan, terdapat `on` namespace events. Ini hanya menambahkan event listener secara harafiah (verbatim).

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

Ini adalah custom directives. Pada dasarnya ini hanyalah pemanis syntax (syntax sugar) untuk ref tapi memungkinkan kita untuk lebih mudah meng-attach banyak directives kepada satu elemen. Sebuah directive hanyalah sebuah fungsi dengan signature seperti berikut:

```ts
function directive(element: Element, accessor: () => any): void;
```

Fungsi directive dipanggil pada waktu render tapi sebelum ditambahkan ke DOM. Kamu dapat melakukan apa saja yang kamu mau padanya termasuk membuat signals, effects, mendaftarkan clean-up dan sebagainya.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

Untuk mendaftarkan dengan TypeScript extend namespace JSXnya.

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

Memaksa prop untuk diperlakukan sebagai sebuah properti daripada sebuah atribut.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Memaksa prop untuk diperlakukan sebagai atribut daripada properti. Berguna untuk Web Components dimana kamu mau menyetel atribut-atribut.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Kompiler Solid menggunakan heuristik sederhana untuk pembungkusan reaktif dan lazy evaluation dari ekspresi JSX. Apakah itu berisi panggilan fungsi, akses properti, atau JSX? Jika iya, kita membungkusnya kedalam getter ketika dioper ke komponen atau dalam sebuah effect jika di dioper ke elemen-elemen asal (native elements).

Mengetahu ini kita dapat mengurangi overhead dari hal-hal yang kita tahu tidak akan pernah berubah hanya dengan mengakses mereka diluar JSXnya. Sebuah variabel sederhana tidak akan dibungkus. Kita juga dapat memberi tahu kompilernya untuk tidak membungkus mereka dengan memulai ekspresi dengan dekorasi komen `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

Ini juga dapat bekerja di bawahan (children).

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
