---
title: API
description: Solid API
sort: 0
---

# Базовая реактивность

## `createSignal`

Это самый простой реактивный примитив, используемый для отслеживания одного значения, которое меняется с течением времени. Функция `createSignal` возвращает пару функций `get` и `set` для доступа к сигналу и его дальнейшего обновления.

```js
const [getValue, setValue] = createSignal(initialValue);

// Получить значение
getValue();

// Установить значение
setValue(nextValue);

// Установить значение используя сеттер
setValue((prev) => prev + next);
```

Не забудьте получить доступ к сигналам в области отслеживания, если вы хотите, чтобы они реагировали на обновления. Области отслеживания - это функции, которые передаются в вычисления, такие как `createffect` или выражения JSX.

Если вы хотите хранить функцию в сигнале, вы должны использовать форму функции:

```js
setValue(() => myFunction);
```

Стурктура:

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

## `createEffect`

Создает новое вычисление, которое автоматически отслеживает зависимости и выполняется после каждого рендеринга, в котором зависимость изменилась. Идеально подходит для использования `ref` и управления другими побочными эффектами.

```js
const [a, setA] = createSignal(initialValue);

// Эффект, зависящий от сигнала `а`
createEffect(() => doSideEffect(a()));
```

Функция эффекта вызывается со значением, возвращенным в результате последнего выполнения функции эффекта. Это значение может быть инициализировано как необязательный 2-й аргумент. Это может быть полезно для различения без создания дополнительного замыкания.

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log(sum);
  return sum;
}, 0);
```

Структура:

```ts
export function createEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

## `createMemo`

Создает производный сигнал только для чтения, который пересчитывает свое значение при каждом обновлении зависимостей выполняемого кода.

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()));

// Получить значение
getValue();
```

Функция memo вызывается со значением, возвращенным в результате последнего выполнения функции memo. Это значение может быть инициализировано как необязательный 2-й аргумент. Это полезно для сокращения вычислений.

```js
const sum = createMemo((prev) => input() + prev, 0);
```

Структура:

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

## `createResource`

Создает сигнал, который может управлять асинхронными запросами. `fetcher` - это асинхронная функция, которая принимает возвращаемое значение `source`, если оно предоставлено, и возвращает `Promise`, успешное выполненное значение которого задано в ресурсе. `fetcher` не реактивен, поэтому используйте необязательный первый аргумент, если вы хотите, чтобы он выполнялся более одного раза. Если source примет значение `false`, `null` или undefined `fetcher` не будет вызван.

`loading` и `error` являются реактивными геттерами и могут быть отслежены.

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// Получить значение
data();

// Получить состояние загрузки
data.Загрузка;

// Получить возможные ошибки
data.error;

// Установить значение без создания обещания
mutate(optimisticValue);

// Повторить последний запрос
refetch();
```

Стурктура:

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

# Жизненные циклы

## `onMount`

Регистрирует метод, который запускается после начальной визуализации и монтирования элементов. Идеально подходит для использования `ref` и управления другими одноразовыми побочными эффектами. Это эквивалентно `createEffect` без зависимостей.

Стурктура:

```ts
export function onMount(fn: () => void): void;
```

## `onCleanup`

Регистрирует метод очистки, который выполняется при удалении или пересчете текущей реактивной области. Может использоваться в любом компоненте или эффекте.

Стурктура:

```ts
export function onCleanup(fn: () => void): void;
```

## `onError`

Регистрирует метод обработчика ошибок, который выполняется при ошибках дочерней области. Выполняются только обработчики ошибок ближайшей области. Можете даже перевызвать данный метод чтобы пойти вверх по линии ошибок.

Стурктура:

```ts
export function onError(fn: (err: any) => void): void;
```

# Реактивные утилиты

Эти утилиты предоставляют возможность лучше планировать обновления и контролировать отслеживание реактивности.

## `untrack`

Игнорирует отслеживание любых зависимостей в блоке исполняемого кода и возвращает значение.

Структура:

```ts
export function untrack<T>(fn: () => T): T;
```

## `batch`

Удерживает фиксацию обновлений в блоке до конца, чтобы предотвратить ненужный пересчет. Это означает, что значения чтения в следующей строке еще не будут обновлены.

Сеттер принадлежащий [Solid Store](#createstore) и эффекты, автоматически упаковывают свой код.

Структура:

```ts
export function batch<T>(fn: () => T): T;
```

## `on`

Предназначен для передачи в какое-либо вычисление, для того чтобы сделать его зависимости явными.

Если передается массив зависимостей, `input` и `prevInput` являются массивами.

```js
// Данный код
createEffect(on(a, (v) => console.log(v, b())));

// Одно и тоже что это
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

Вы также можете не запускать вычисление немедленно, а вместо этого выбрать, чтобы оно выполнялось только при изменении, установив для параметра `defer` значение `true`.

```js
// Не запускается сразу
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // Теперь все работает
```

Структура:

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

## `createRoot`

Создает новый не отслеживаемый контекст, который не удаляется автоматически. Это полезно для вложенных реактивных контекстов, которые вы не хотите трогать при повторной оценке родителя. Это мощный шаблон для кэширования.

Весь сплошной код Solid должен быть заключен в один из этих верхних уровней, поскольку они гарантируют, что вся память/вычисления будут освобождена.

Обычно вам не нужно беспокоиться об этом, так как `createRoot` встроен во все функции `render`.

Структура:

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

## `mergeProps`

Данный метод слияет пропы. Полезно для настройки пропов по умолчанию для компонентов в случае, если вызывающий абонент их не предоставляет. Или же для клонирования пропов, включая реактивные свойства.

Этот метод работает с использованием прокси-сервера. Слияние происходит в обратном порядке. Это позволяет динамически отслеживать свойства, которых нет при первом слиянии объекта `prop`.

```js
// Установка значений по умолчанию
props = mergeProps({ name: "Smith" }, props);

// Клонирование
newProps = mergeProps(props);

// Объеденение
props = mergeProps(props, otherProps);
```

Структура:

```ts
export function mergeProps(...sources: any): any;
```

## `splitProps`

Это замена деструктуризации. Он разделяет реактивный объект по ключам, сохраняя при этом реактивность.

```js
const [local, others] = splitProps(props, ["children"]);

<>
  <Child {...others} />
  <div>{local.children}<div>
</>
```

Структура:

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

## `useTransition`

Используется для пакетного асинхронного обновления в транзакции, отложенной до завершения всех асинхронных процессов. Это связано с `Suspense` и отслеживает только ресурсы, полученные в границах `Suspense`.

```js
const [isPending, start] = useTransition();

// Получение данных о выполнении перехода
isPending();

// Обертывание
start(() => setSignal(newValue), () => /* переход завершен */)
```

Структура:

```ts
export function useTransition(): [
  () => boolean,
  (fn: () => void, cb?: () => void) => void
];
```

## `observable`

Этот метод принимает сигнал и производит тип `Observable`.

Пользуйтесь любой `Observable-библиотекой` на вкус. Библеотека, как правило, будет иметь функцию `from()` для дальнейшего использования.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

Структура:

```ts
export function observable<T>(input: () => T): Observable<T>;
```

## `mapArray`

Реактивный map-помощник, который кэширует каждый элемент по ссылке, чтобы уменьшить ненужное сопоставление при обновлениях. Помощник запускает `mapFn` только один раз для каждого значения, а затем перемещает или удаляет ее по мере необходимости. Аргумент индекса является сигналом. `mapFn` сама по себе не отслеживается.

Является неотъемлемым компонентом `<For>`.

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

Структура:

```ts
export function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

## `indexArray`

Похоже на `mapArray`, за исключением того, что он отображается по индексу. Внутренний элемент является сигналом, а индекс теперь является константой.

Является неотъемлемым компонентом `<Index>`.

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

Структура:

```ts
export function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

# Сторы

Эти API-интерфейсы доступны в `solid-js/store`.

## `createStore`

Cоздает дерево сигналов в качестве прокси-сервера, которое позволяет независимо отслеживать отдельные значения во вложенных структурах данных. Функция `createStore` возвращает прокси-объект только для чтения, а так же функцию сеттер.

```js
const [state, setState] = createStore(initialValue);

// Получить значение
state.someValue;

// Установить значение
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

Объекты Store, являющиеся прокси, отслеживаются только при доступе к свойству. И при доступе к Store рекурсивно создает вложенные объекты Store для вложенных данных. Однако он обертывает только массивы и простые объекты. Классы не заворачиваются.

Таким образом, такие вещи, как `Date`, `HTMLElement`, `RegExp`, `Map`, `Set`, не являются детально реактивными. Кроме того, объект состояния верхнего уровня не может быть отслежен без доступа к его свойству. Он не подходит для вещей где вы итерируете, поскольку добавление новых ключей или индексов не может запускать обновления.

Поэтому помещайте любые списки на ключ состояния, не пытайтесь использовать сам объект состояния.

```js
// Помещение списока в качестве ключа на объект `state`
const [state, setState] = createStore({ list: [] });

// Получение доступа к свойству `list` на объекте `state`
<For each={state.list}>{item => /*...*/}</For>
```

Структура:

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

### Геттеры

Объекты Store поддерживают использование геттеров для хранения вычисленных значений.

Однако это простые геттеры, поэтому вам все равно нужно использовать мемоизацию, если вы хотите кэшировать значение

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

Структура:

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

### Обновление Store

Изменения могут принимать форму функции, которая передает предыдущее состояние и возвращает новое состояние или значение. Объекты всегда объединяются неглубоко. Установите значения на `undefined`, чтобы удалить их из Store.

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

Так же имеется поддержка путей, включая массивы ключей, диапазоны объектов и функции фильтрации.

`setState` также поддерживает вложенные настройки, в которых вы можете указать путь к изменению. При вложенном состоянии, которое вы обновляете, могут быть другие значения, не являющиеся объектами. Объекты по-прежнему объединяются, но другие значения (включая массивы) заменяются.

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

Путь может быть строковыми ключами, массивом ключей, повторяющимися объектами ({от, до, по}) или функциями фильтрации. Это дает невероятную выразительную силу для описания изменений состояния.

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

Вдохновленный Immer API для объектов хранилища Solid, который допускает локализованную мутацию.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

Структура:

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

## `reconcile`

Ищет различия в изменении данных, когда мы не можем применить детальные обновления. Полезно при работе с неизменяемыми данными из Store или большими ответами API.

Ключ используется, когда доступен для сопоставления элементов. По умолчанию `merge: false` выполняет ссылочные проверки, где это возможно, для определения равенства и заменяет, где элементы не являются ссылочно равными. `merge: true` переносит все различия в листья и эффективно преобразовывает предыдущие данные в новое значение.

```js
// Подписка на объект наблюдения
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

Структура:

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

## `createMutable`

Создает новый изменяемый прокси-объект Store. Сохраняет только запускать обновления при изменении значений. Отслеживание осуществляется путем перехвата доступа к свойствам и автоматически отслеживает глубокую вложенность через прокси.

Полезно для интеграции внешних систем или в качестве уровня совместимости с `MobX` или `Vue`.

> **Заметка:** Изменяемое состояние может передаваться и видоизменяться где угодно, что может усложнить отслеживание и облегчить нарушение однонаправленного потока. Обычно рекомендуется использовать вместо него `createStore`. Модификатор `produce` может дать многие из тех же преимуществ без каких-либо недостатков.

```js
const state = createMutable(initialValue);

// Получить значение
state.someValue;

// Установить значение
state.someValue = 5;

state.list.push(anotherValue);
```

Изменяемые объекты поддерживают сеттеры вместе с геттерами.

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

Структура:

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): Store<T> {
```

# Компонентные API

## `createContext`

Контекст предоставляет форму внедрения зависимостей в Solid. Он используется для избавления от необходимости передавать данные в качестве props через промежуточные компоненты.

Эта функция создает новый объект контекста, который можно использовать с `useContext`, и обеспечивает поток управления `Provider`. Контекст по умолчанию используется, когда Provider не найден выше в иерархии.

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

Значение, переданное провайдеру, передается в `useContext` как есть. Это означает, что упаковка как реактивное выражение не будет работать. Вы должны передавать сигналы и магазины напрямую, а не обращаться к ним в JSX.

Структура:

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

## `useContext`

Используется для получения контекста, чтобы обеспечить глубокую передачу свойств без необходимости передавать их через каждую функцию компонента.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

Структура:

```ts
export function useContext<T>(context: Context<T>): T;
```

## `children`

Используется для упрощения взаимодействия с `props.children`. Этот помощник разрешает любую вложенную реактивность и возвращает Memo. Рекомендуемый подход к использованию `props.children` где угодно, кроме прямого перехода к `JSX`.

```js
const list = children(() => props.children);

createEffect(() => list());
```

Структура:

```ts
export function children(fn: () => any): () => any;
```

## `lazy`

Используется для отложенной загрузки компонентов для разделения кода. Компоненты не загружаются до визуализации. Компоненты с отложенной загрузкой могут использоваться так же, как их статически импортированные аналоги, получать props и подобное. Кроме того, еще данные компоненты еще и запускают `<Suspense>`.

```js
// Обвернуть импорт (ленивый импорт)
const ComponentA = lazy(() => import("./ComponentA"));

// Использование в JSX
<ComponentA title={props.title} />;
```

Структура:

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

# Вторичные примитивы

Вероятно, они вам не понадобятся для вашего первого приложения, но эти инстурменты полезно иметь.

## `createDeferred`

Создает значение исключительно только для чтения, которое уведомляет об изменениях в нисходящем направлении только тогда, когда браузер находится в режиме ожидания.

`timeoutMs` - максимальное время ожидания перед принудительным обновлением.

Структура:

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

## `createComputed`

Создает новое вычисление, которое автоматически отслеживает зависимости и запускается непосредственно перед рендерингом. Используйте это для записи в другие реактивные примитивы. По возможности используйте `createMemo`, так как запись в промежуточное обновление сигнала может привести к необходимости пересчета других вычислений.

Структура:

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

## `createRenderEffect`

Создает новое вычисление, которое автоматически отслеживает зависимости и запускается на этапе рендеринга. Все внутренние обновления DOM происходят в это время.

Структура:

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

## `createSelector`

Создает условный сигнал, который уведомляет подписчиков только при вводе или выходе их ключа, соответствующего значению. Полезно для делегированного состояния выбора, поскольку он выполняет операцию O(2) вместо O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

Структура:

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

# Рендеринг

Данные API-интерфейсы доступны в `solid-js/web`.

## `render`

Это точка входа в приложение с точки зрения браузера. Принимает в качестве аргументов определение компонента или функцию верхнего уровня и элемент для подключения. Рекомендуется, чтобы этот элемент был пустым, так как возвращенная функция удаления стирает все дочерние элементы.

```js
const dispose = render(App, document.getElementById("app"));
```

Структура:

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

## `hydrate`

Этот метод похож на `render`, за исключением того, что он пытается повторно гидратировать то, что уже визуализировано в DOM.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

Структура:

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

## `renderToString`

Выполняет рендеринг в строку синхронно. Функция также генерирует тег скрипта для прогрессивной гидратации. Параметры включают в себя `eventNames` для прослушивания перед загрузкой страницы и воспроизведением при гидратации, а так же `nonce` для добавления тега скрипта.

```js
const html = renderToString(App);
```

Структура:

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    nonce?: string;
  }
): string;
```

## `renderToStringAsync`

То же, что и `renderToString`, за исключением того, что данный метод будет ждать успешного выполнения `<Suspense>` перед возвратом результатов. Данные ресурса автоматически сериализуются в тег скрипта и будут гидратироваться при загрузке клиента.

```js
const html = await renderToStringAsync(App);
```

Структура:

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

## `pipeToNodeWritable`

Этот метод выполняет рендеринг в `Node stream`. Он отображает контент синхронно, включая любые заполнители `Suspense`, а затем продолжает потоковую передачу данных из любого асинхронного ресурса по завершении.

```js
pipeToNodeWritable(App, res);
```

Параметр `onReady` полезен для записи в поток вокруг рендеринга основного приложения. Не забудьте вручную вызвать `startWriting`, если вы используете `onReady`.

Структура:

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

## `pipeToWritable`

Этот метод выполняет рендеринг в веб-поток. Он отображает контент синхронно, включая любые запасные заполнители `Suspense`, а затем продолжает потоковую передачу данных из любого асинхронного ресурса по завершении.

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

Параметр `onReady` полезен для записи в поток вокруг рендеринга основного приложения. Не забудьте вручную вызвать `startWriting`, если вы используете `onReady`.

Структура:

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

## `isServer`

Это указывает на то, что код запускается как пакет сервера или браузера. Поскольку базовые среды выполнения экспортируют это как постоянное логическое значение, это позволяет сборщикам модулей исключать код и их использованный импорт из соответствующих пакетов.

```js
if (isServer) {
  // Только на сервере
} else {
  // Только в браузере
}
```

Структура:

```ts
export const isServer: boolean;
```

# Поток управления

Solid использует компоненты для управления потоком. Причина в том, что для того, чтобы быть производительными, мы должны контролировать создание элементов. Например, со списками простой `map` неэффективен, поскольку он всегда проходит по всему листу. Это говорит нам о нужде в использовании вспомогательных функций.

Объединение этих вспомогательных функций в компоненты - удобный способ создания кратких шаблонов, позволяющий пользователям составлять и строить свои собственные потоки управления.

Эти встроенные потоки управления будут автоматически импортированы. Все, кроме `Portal` и `Dynamic`, экспортируются из `solid-js`. Те два специфичны для DOM, и экспортируются из `solid-js/web`.

> Замечание: Все дочерние функции обратного вызова/рендеринга потока управления не отслеживаются. Это позволяет создавать состояние вложенности и лучше изолирует реакции.

## `<For>`

Простой цикл с ссылочным ключом.

```jsx
<For each={state.list} fallback={<div>Загрузка...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

Необязательный второй аргумент - это индексный сигнал:

```jsx
<For each={state.list} fallback={<div>Загрузка...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

Структура:

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

## `<Show>`

Используется для условного рендеринга. Когда `when` истинно, компонент будет рендерен. В противном случае будет рендерен `fallback`. Он похож на тернарный оператор (`when`? `children`: `fallback`), но идеально подходит для создания шаблонов JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Загрузка...</div>}>
  <div>My Content</div>
</Show>
```

Также можно использовать как способ привязки блоков к определенной модели данных. Например, функция повторно выполняется при каждой замене модели user:

```jsx
<Show when={state.user} fallback={<div>Загрузка...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

Структура:

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

## `<Switch>`/`<Match>`

Полезно, когда имеется более двух взаимоисключающих условий. Может использоваться для таких вещей, как простая маршрутизация.

```jsx
<Switch fallback={<div>Страница не найдена</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

`Match` также поддерживает дочерние функции, которые служат потоком с ключом.

Структура:

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

## `<Index>`

Итерация списка без ключа (строки привязаны к индексу). Это полезно, когда нет концептуального ключа, например, если данные состоят из примитивов и фиксируется индекс, а не значение.

`item` является сигналом:

```jsx
<Index each={state.list} fallback={<div>Загрузка...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Необязательный второй аргумент - порядковый номер:

```jsx
<Index each={state.list} fallback={<div>Загрузка...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

Структура:

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

## `<ErrorBoundary>`

Выявляет неперехваченные ошибки и отображает `fallback` в качестве резервного контента.

```jsx
<ErrorBoundary fallback={<div>Ошибка! Что-то пошло не так</div>}>
  <MyComp />
</ErrorBoundary>
```

Также поддерживает форму обратного вызова, которая передает ошибку, и функцию сброса.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

Структура:

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

## `<Suspense>`

Компонент, который отслеживает все ресурсы и показывает `fallback`, пока они не будут выполнены.

Что отличает `Suspense` от` Show`, так это то, что `Suspense` - неблокирующий, поскольку обе ветки существуют одновременно, даже если они не находятся в DOM.

```jsx
<Suspense fallback={<div>Загрузка...</div>}>
  <AsyncComponent />
</Suspense>
```

Структура:

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

## `<SuspenseList>` (Эксперементальная)

Позволяет координировать несколько параллельных компонентов `Suspense` и вложенных `SuspenseList`. Управляет порядком, в котором отображается контент, чтобы уменьшить разбиение лэйаута, и имеет возможность свернуть или скрыть `fallback`.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Загрузка постов...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Загрузка мемов...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

> **Внимание**! `SuspenseList` все еще является экспериментальным и не имеет полной поддержки `SSR`.

Структура:

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

## `<Dynamic>`

Позволяет вставлять произвольный компонент или тег и передавать ему пропсы.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

Структура:

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

## `<Portal>`

Внедряет элемент в узел монтирования. Полезно для вставки модальных окон вне лэйаута страницы. События по-прежнему распространяются через иерархию компонентов.

Портал монтируется в `<div>`, если целью не является заголовок документа. `useShadow` помещает элемент в теневой корень для изоляции стиля, а `isSVG` требуется при вставке в элемент `SVG`.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>Мой контент</div>
</Portal>
```

Структура:

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

# Специальные атрибуты JSX

В целом Solid пытается придерживаться соглашений DOM. Solid близок к DOM. Большинство свойств обрабатываются как атрибуты собственных элементов и свойств веб-компонентов, но некоторые из них все же имеют особое поведение.

Для настраиваемых атрибутов с пространством имен с помощью `TypeScript` вам необходимо расширить пространство имен `Solid JSX`:

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

Это способ получить доступ к базовым элементам DOM в JSX. Хотя верно, что можно просто присвоить элемент переменной, но все же более оптимальным вариантом будет оставить компоненты в потоке JSX. Ссылки назначаются во время рендеринга, до того, как элементы будут подключены к DOM. Они бывают двух видов.

```js
// 1. Простое присвоение
let myDiv;

// Используйте `onMount` или `createEffect` для работы с элементами уже подключенными к DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// 2. Функция обратного вызова (вызывается перед подключением к DOM)
<div ref={el => console.log(el)} />
```

`ref` также можно использовать для компонентов

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

Помощник, который использует `element.classList.toggle`. Он принимает объект, ключи которого являются именами классов, и назначает их, когда значение ключа истинно.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Помощник стилей Solid работает как со строкой, так и с объектом. В отличие от версии React, Solid под капотом использует `element.style.setProperty`. Это означает поддержку переменных CSS, но это также означает, что мы еще ближе к DOM. В итоге это приводит к повышению производительности и согласованности с SSR.

```jsx
// Строка
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// Объект
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// CSS переменные
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

Данные методы работают так же, как их эквивалент по свойствам.

Все очень просто! Вставьте строку, и все будет работать.

**Будьте осторожны !!!** Вставка в `innerHTML` любых данных, которые могут быть открыты конечному пользователю, могут быть вектором злонамеренной атаки.

`textContent` на самом деле является оптимизацией производительности. Просто когда вы знаете, что дочерние элементы будут только текстом, можно смело обходить обычную процедуру сравнения.

```jsx
<div textContent={state.text} />
```

## `on___`

Обработчики событий в Solid обычно имеют форму `onclick` или `onClick` в зависимости от стиля. А вот название самого события всегда в нижнем регистре.

Solid использует полусинтетическое делегирование событий для общих событий пользовательского интерфейса, которые состоят из пузырьков. Это улучшает производительность.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid также поддерживает передачу массива обработчику событий для привязки значения к первому аргументу обработчика событий. При этом не используется `bind` или создается дополнительное смыкание, поэтому делегирование событий сильно оптимизировано.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

События не могут быть повторно связаны, и привязки не являются реактивными. Причина в том, что подключение/отключение слушателей обычно обходится дороже. Поскольку события вызываются естественным образом, нет необходимости в реактивности, просто сокращайте свой обработчик, если хотите.

```jsx
// Лучше вызывайте `handleClick` только если он уже определен
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

Для любых других событий, возможно, с необычными именами или тех, которые вы не хотите делегировать, для этого есть события пространства имен `on`. Данный атрибут просто добавит слушатель к нужному событию.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

Это настраиваемые директивы. В некотором смысле это просто синтаксический сахар. По сравнению с `ref`, но он позволяет нам легко прикреплять несколько директив к одному элементу. Директива - это просто функция со следующей структурой:

```ts
function directive(element: Element, accessor: () => any): void;
```

Директивные функции вызываются во время рендеринга, перед добавлением в DOM. Вы можете делать в них все, что захотите, включая создание сигналов, эффектов, чистку регистров и т. Д.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

Чтобы зарегистрировать в TypeScript, расширьте пространство имен JSX.

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

Вопринимает проп как свойство, а не как атрибут.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Вопринимает проп как атрибут, а не как свойство. Полезно для веб-компонентов, на которые вы хотите установить атрибуты.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Компилятор Solid использует простую эвристику для реактивного обертывания и ленивого вычисления выражений JSX.

Выражение передаваемое в компонентy или эффект и содержащее вызов функции, доступ к свойству или JSX, заключается в геттер. Зная это, мы можем уменьшить накладные расходы на вещи, которые, никогда не изменятся, просто обращаясь к ним за пределами JSX. Простая переменная никогда не будет обернута.

Мы также можем сказать компилятору не заключать их в оболочку, установив декоратор комментариев `/ _ @once _ /`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

Это также работает с дочерними элементами

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
