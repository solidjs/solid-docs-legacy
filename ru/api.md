---
title: API
description: Solid API
sort: 0
---

# Базовая реактивность

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Это самый простой реактивный примитив, используемый для отслеживания одного значения, которое меняется с течением времени. Функция `createSignal` возвращает кортеж с функцями `get` и `set` для доступа к `Сигналу` и его дальнейшего обновления.

```js
const [getValue, setValue] = createSignal(initialValue);

// Получить значение
getValue();

// Установить значение
setValue(nextValue);

// Установить значение используя функцию с предыдущим значением
setValue(prev => prev + next);
```

Не забудьте вызвать `Сигнал` в области отслеживания, если вы хотите, чтобы обновления срабатывали. Области отслеживания - это функции, которые передаются в вычисления, такие как `createffect` или выражения JSX.

Если вы хотите хранить функцию в Сигнале, оберните ее в еще одну функцию:

```js
setValue(() => myFunction)
```

## `createEffect`

```ts
export function createEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Создает новое вычисление - `Эффект`. Оно автоматически отслеживает зависимости и выполняется после каждого рендеринга, в котором зависимость изменилась. Идеально подходит для использования `ref` и управления другими побочными эффектами.

```js
const [a, setA] = createSignal(initialValue)

// Эффект, зависящий от Сигнала `а`
createEffect(() => doSideEffect(a()))
```

Функция `Эффекта` вызывается со значением, возвращенным в результате последнего выполнения функции эффекта. Это значение может быть инициализировано как необязательный 2-й аргумент. Это может быть полезно для получения предыдущего значения без создания дополнительного замыкания.

```js
createEffect(prev => {
  const sum = a() + b()
  if (sum !== prev) console.log(sum)
  return sum
}, 0)
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Создает производный `Сигнал` - `Мемо`. Его главное отличие - возвращаемое значение доступно исключительно для чтения, который пересчитывает свое значение при каждом обновлении зависимостей.

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()))

// Получить значение
getValue()
```

Функция `createMemo` вызывается со значением, возвращенным в результате последнего выполнения. Это значение может быть инициализировано как необязательный 2-й аргумент. Это полезно для сокращения вычислений.

```js
const sum = createMemo(prev => input() + prev, 0)
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

Создает `Сигнал` для работы с асинхронными запросами. `fetcher` - это асинхронная функция, которая принимает возвращаемое значение `source`, если оно предоставлено, и возвращает `Promise`. `fetcher` не реактивен, поэтому используйте необязательный первый аргумент, если вы хотите, чтобы он выполнялся более одного раза. Если `source` примет значение `false`, `null` или undefined `fetcher` не будет вызван.

`loading` и `error` являются реактивными геттерами и могут быть отслежены.

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData)

// Получить значение
data()

// Получить состояние загрузки
data.loading

// Получить возможные ошибки
data.error

// Установить значение без создания обещания
mutate(optimisticValue)

// Повторить последний запрос
refetch()
```

# Жизненные циклы

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Регистрирует метод, который запускается после начальной визуализации и монтирования элементов. Идеально подходит для использования `ref` и управления другими одноразовыми побочными эффектами. Это эквивалентно `createEffect` без зависимостей.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Регистрирует метод очистки, который выполняется при удалении или пересчете текущей реактивной области. Работает в любом компоненте или эффекте.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Регистрирует метод обработчика ошибок, который выполняется при ошибках дочерней области. Работает только в ближайшей области видимости. Можете даже вызывать его сколько угодно, чтобы обрабатывать ошибки на разных уровнях.

# Реактивные утилиты

Эти утилиты предоставляют возможность лучше планировать обновления и контролировать отслеживание реактивности.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T
```

Игнорирует отслеживание любых зависимостей в блоке исполняемого кода и возвращает значение.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Создает транзакцию обновлений в блоке, чтобы предотвратить ненужный пересчет. Это означает, что значения геттеров в следующей строке еще не будут обновлены.

Сеттеры из [Solid Store](#createstore) и эффекты автоматически оборачивают свой код в `batch`.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

Предназначен для передачи в какое-либо вычисление для того чтобы сделать его зависимости явными. Если передается массив зависимостей, `input` и `prevInput` являются массивами.

```js
createEffect(on(a, v => console.log(v, b())))

// Эквивалентен строке выше
createEffect(() => {
  const v = a()
  untrack(() => console.log(v, b()))
})
```

Вы также можете запускать вычисления не сразу, а, например, только при каких-либо изменениях, установив для параметра `defer` значение `true`.

```js
// Не запускается сразу
createEffect(on(a, v => console.log(v), { defer: true }));

// Теперь все работает
setA('new');
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Создает новый неотслеживаемый контекст, который не удаляется автоматически. Это полезно для вложенных реактивных контекстов, которые вы не хотите трогать при повторной оценке родителя. Это мощный шаблон для кэширования.

Весь сплошной код Solid может быть заключен в один из этих верхних уровней, поскольку они гарантируют, что вся память/вычисления будет освобождена.

Обычно вам не нужно беспокоиться об этом, так как `createRoot` встроен во все функции передаваемые в метод `render`.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

Данный метод позволяет нам объединять `пропсы`. Полезно для добавления значений по умолчанию. Или же для клонирования `пропсов`, включая реактивные свойства.

Этот метод работает с использованием прокси. Слияние происходит в обратном порядке. Это позволяет динамически отслеживать свойства, которых нет при первом слиянии объекта `пропсов`.

```js
// Установка значений по умолчанию
props = mergeProps({ name: 'Smith' }, props);

// Клонирование
newProps = mergeProps(props);

// Объединение
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

Это замена деструктуризации. `splitProps` делит реактивный объект на ключи, сохраняя при этом его реактивность.

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

Используется для создания единого асинхронного обновления, которое оповестит вас когда все асинхронные процессы внутри перехода (`transition`) будут выполнены. Функционал `useTransition` связан с `Suspense` в котором отслеживаются только те ресурсы, которые были прочитаны в границах `Suspense`.

```js
const [isPending, start] = useTransition();

// Получение данных о статусе перехода
isPending();

// Обертка setSignal:
start(() => setSignal(newValue), () => /* переход завершен */);
```

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

Этот метод принимает Сигнал и производит `Observable`.

Пользуйтесь любой `Observable-библиотекой` на вкус. Библиотека, как правило, будет иметь функцию `from()`.

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

Реактивный помощник напоминающий `Array.map`, который кэширует каждый элемент по его ссылке, чтобы уменьшить количество ненужной работы при обновлениях. Помощник запускает `mapFn` только один раз для каждого значения, а затем перемещает или удаляет ее по мере необходимости. Аргумент `i` является Сигналом. `mapFn` сама по себе не отслеживается.

Используется в встроенном компоненте `<For>`.

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

Похоже на `mapArray`, за исключением того, что он сопоставляет по индексу. Внутренний элемент является `Сигналом`, а индекс теперь является константой.

Используется в встроенном компоненте `<Index>`.

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

# `Сторы`

Эти API-интерфейсы доступны в `solid-js/store`.

## `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

Создает дерево `Сигналов` в качестве прокси, которое позволяет независимо отслеживать отдельные значения во вложенных структурах данных. Функция `createStore` возвращает прокси-объект исключительно для чтения, а так же функцию-сеттер.

```js
const [state, setState] = createStore(initialValue);

// Получить значение
state.someValue;

// Установить значение
setState({ merge: 'thisValue' });

setState('path', 'to', 'value', newValue);
```

`Сторы`, отслеживаются только при доступе к свойству. При доступе к какому-либо значению, Store рекурсивно создает вложенные объекты Store для вложенных данных. Однако он оборачивает только массивы и простые объекты. Классы вроде `Date`, `HTMLElement`, `RegExp`, `Map`, `Set`, не подлежат реактивной обертке. Кроме того, объект состояния верхнего уровня не может быть отслежен без доступа к его свойству. Поэтому верхний объект не подходит для вещей которые вы собираетесь итерировать, поскольку добавление новых ключей или индексов не запустит обновления. По этой причине мы рекомендуем помещать подобные списки в свойства объекта.

```js
// Список в качестве ключа на объекте `state`
const [state, setState] = createStore({ list: [] });

// Получение доступа к свойству `list` на объекте `state`
<For each={state.list}>{item => /*...*/}</For>
```

### Геттеры

`Сторы` поддерживают использование геттеров для хранения вычисленных значений.

```js
const [state, setState] = createStore({
  user: {
    firstName: 'John',
    lastName: 'Smith',
    get fullName() {
      return `${this.firstName} ${this.lastName}`
    },
  },
})
```

Однако это простые геттеры, поэтому вам все равно нужно использовать `createMemo`, если вы хотите кэшировать значение

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

### Обновление сторов

Обновление может иметь вид функции, которая передает предыдущее состояние и возвращает новое состояние или значение. Объекты объединяются неглубоко. Установите значения на `undefined`, чтобы удалить их из Store.

```js
const [state, setState] = createStore({
  firstName: 'John',
  lastName: 'Miller',
});

setState({ firstName: 'Johnny', middleName: 'Lee' });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState(state => ({ preferredName: state.firstName, lastName: 'Milner' }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

Так же имеется поддержка `путей` (`paths`), включая массивы ключей, диапазоны объектов и функции фильтрации.

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

`Путь` может быть строкой, массивом ключей, повторяющимися объектами ({от, до, по}) или функциями фильтрации. Это дает невероятную выразительную силу для описания изменений состояния.

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

Вдохновленный `Immer` API для объектов `Сторов` Solid, который допускает мутабельную запись изменений.

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

Ищет различия в изменении данных, когда мы не можем применить точные обновления. Полезно при работе с неизменяемыми (`immutable`) хранилищами (вроде `Redux`) или большими из API данными.

Ключ используется, когда он доступен для сопоставления элементов. По умолчанию `merge: false` выполняет ссылочные проверки, где это возможно, для определения равенства и заменяет, где элементы не являются ссылочно равными. `merge: true` переносит все различия и эффективно преобразовывает предыдущие данные в новое значение.

```js
// Подписка на объект наблюдения
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

Создает новый изменяемый прокси `Стор`. `Стор` запускает обновления только при изменении значений. Отслеживание осуществляется путем перехвата доступа к свойствам и автоматическим отслеживаем глубокой вложенности с помощью прокси.

Полезно для интеграции внешних систем или в качестве слоя для совместимости с `MobX` или `Vue`.

> **Замечание:** Изменяемое состояние может передаваться и видоизменяться где угодно, что может усложнить отслеживание и облегчить нарушение однонаправленного потока. Обычно вместо этого рекомендуется использовать `createStore`. Модификатор `produce` может дать многие из тех же преимуществ без каких-либо недостатков.

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

# API-Компоненты

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Контекст предоставляет форму внедрения зависимостей в Solid. Он используется для избежания необходимости передавать данные в качестве `пропсов` через промежуточные компоненты.

`createContext` создает новый объект контекста, который можно использовать с `useContext`, и обеспечивает поток управления `Provider`. Контекст установленный по умолчанию будет использован, если `Provider` не будет найден выше в иерархии.

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

Значение, переданное провайдеру, передается в `useContext` как есть. Это означает, что передача сырых реактивных выражений не будет работать. Вы должны передавать `Сигналы` и `Сторы` напрямую, а не обращаться к ним в JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Используется для получения контекста. Подробнее выше в разделе `createContext`.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Используется для упрощения взаимодействия с `props.children`. Этот помощник разрешает любую вложенную реактивность и возвращает `Мемо`. Рекомендуемый подход к использованию `props.children` где угодно, кроме прямого перехода к `JSX`.

```js
const list = children(() => props.children);

createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Используется для отложенной загрузки компонентов для [разделения кода](https://ru.reactjs.org/docs/code-splitting.html). Компоненты не прогружаются до рендеринга. Компоненты с отложенной загрузкой могут использоваться так же, как их статически импортированные аналоги, они все еще могут получать `пропсы` и подобное. Кроме того, данные компоненты еще и запускают `<Suspense>`.

```js
// Обернуть импорт (ленивый импорт)
const ComponentA = lazy(() => import("./ComponentA"));

// Использование в JSX
<ComponentA title={props.title} />;
```

# Вторичные примитивы

Вероятно, они вам не понадобятся для вашего первого приложения, однако их полезно иметь под рукой.

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

Создаёт отложенное значение только для чтения, которое уведомляет об изменениях, когда браузер находится в режиме ожидания. `timeoutMs` - максимальное время ожидания перед принудительным обновлением.

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Создаёт новое вычисление, которое автоматически отслеживает зависимости и запускается непосредственно перед рендерингом. Используйте это для записи в другие реактивные примитивы. По возможности используйте `createMemo`, так как запись в промежуточное обновление Сигнала может привести к обновлению других вычислений.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Создаёт новое вычисление, которое автоматически отслеживает зависимости и запускается на этапе рендеринга. Все внутренние обновления DOM происходят в это время.

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

Создаёт условный Сигнал, который уведомляет подписчиков только при вводе или выходе их ключа, соответствующего значению. Полезно для делегированного состояния выбора, поскольку выполняет операцию за O(2) вместо O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Рендеринг

Данные импорты доступны в `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

Это точка входа в приложение (в браузере). Принимает в качестве аргументов компонент или функцию и элемент, в которой нужно смонтировать приложение. Рекомендуется, чтобы этот элемент был пустым, так как возвращаемая функция удаления стирает все дочерние элементы.

```js
const dispose = render(App, document.getElementById('app'))
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

Этот метод похож на `render`, за исключением того, что он пытается повторно гидрировать то, что уже отрендерено в DOM.

```js
const dispose = hydrate(App, document.getElementById('app'))
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

Выполняет синхронный рендеринг в строку. А также генерирует тег скрипта для прогрессивной гидрации. Параметры включают в себя `eventNames` для прослушивания перед загрузкой страницы и воспроизведением при гидрации, а также значение `nonce`, добавляемое к тегу скрипта.

```js
const html = renderToString(App)
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

То же, что и `renderToString`, но данный метод будет ждать успешного выполнения `<Suspense>` перед тем как вернуть результаты. Данные автоматически сериализуются в тег скрипта и гидрируются при загрузке клиента.

```js
const html = await renderToStringAsync(App)
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

Этот метод выполняет рендеринг в `Node` поток. Контент рендерится синхронно, включая любые `Suspense` заглушки (`placeholders`), а затем продолжает потоковую передачу данных из любого асинхронного ресурса по завершении.

```js
pipeToNodeWritable(App, res)
```

Параметр `onReady` полезен для записи в поток в обход рендеринга основного приложения. Не забудьте вручную вызвать `startWriting`, если вы используете `onReady`.

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

Этот метод выполняет рендеринг в веб-поток. Он отображает контент синхронно, включая любые `Suspense` заглушки (`placeholders`), а затем продолжает потоковую передачу данных из любого асинхронного ресурса по завершении.

```js
const { readable, writable } = new TransformStream()
pipeToWritable(App, writable)
```

Параметр `onReady` полезен для записи в обход рендеринга основного приложения. Не забудьте вручную вызвать `startWriting`, если вы используете `onReady`.

## `isServer`

```ts
export const isServer: boolean;
```

Эта константа указывает на то, в какой среде выполняется код — на сервере или в браузере. Это позволяет бандлерам исключать неиспользованный код и импорты из конечного бандла.

```js
if (isServer) {
  // Только на сервере
} else {
  // Только в браузере
}
```

# Порядок выполнения (Control flow)

Solid использует компоненты в качестве управляющих инструкций. Чтобы сделать реактивность производительной, мы должны контролировать создание элементов. Например, со списками простой `map` неэффективен, поскольку он будет проходить по всем элементам списка. Отсюда возникает потребность во вспомогательных функциях.

Обернув их в компоненты, мы получаем удобные и знакомые в использовании управляющие инструкции, что позволяет конечным пользователям легко их использовать для управления порядком выполнения.

Все встроенные компоненты импортируются автоматически из `solid-js` (за исключением `Portal` и `Dynamic`, которые специфичны для DOM и импортируются из `solid-js/web`).

> **Замечание**: Все колбэки и функции рендеринга дочерних элементов не являются отслеживающими. Это позволяет создавать вложенные состояния и лучше изолировать реакции.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Простой цикл с ссылочным ключом.

```jsx
<For each={state.list} fallback={<div>Загрузка...</div>}>
  {item => <div>{item}</div>}
</For>
```

Необязательный второй аргумент — индекс элемента (Сигнал):

```jsx
<For each={state.list} fallback={<div>Загрузка...</div>}>
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

Используется для условного рендеринга. Когда `when` истинно, компонент будет отображен. В противном случае будет зарендерен `fallback` компонент. Он похож на тернарный оператор (`when ? children : fallback`), но идеально подходит для создания шаблонов JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Загрузка...</div>}>
  <div>My Content</div>
</Show>
```

`Show` также можно использовать как способ привязки блоков к определенной модели данных. Например, функция повторно выполняется при каждой замене модели _user_:

```jsx
<Show when={state.user} fallback={<div>Загрузка...</div>}>
  {user => <div>{user.firstName}</div>}
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

Полезно для случаев когда имеется более двух взаимоисключающих условий. Может быть использован для таких вещей как, например, простая маршрутизация.

```jsx
<Switch fallback={<div>Страница не найдена</div>}>
  <Match when={state.route === 'home'}>
    <Home />
  </Match>
  <Match when={state.route === 'settings'}>
    <Settings />
  </Match>
</Switch>
```

`Match` также поддерживает дочерние функции, которые служат потоком с ключом.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Итерация списка без ключа (строки привязаны к индексу). Это полезно, когда данные состоят из примитивов, и поэтому фиксируется индекс, а не значение.

`item` является Сигналом:

```jsx
<Index each={state.list} fallback={<div>Загрузка...</div>}>
  {item => <div>{item()}</div>}
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

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Выявляет всплывающие ошибки и отображает `fallback` в качестве резервного контента.

```jsx
<ErrorBoundary fallback={<div>Ошибка! Что-то пошло не так</div>}>
  <MyComp />
</ErrorBoundary>
```

Также поддерживает форму обратного вызова, которая передает ошибку, и функцию сброса.

```jsx
<ErrorBoundary fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}>
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

Компонент, который отслеживает все свои ресурсы и показывает `fallback`, пока они не будут выполнены.

Что отличает `Suspense` от` Show`, так это то, что `Suspense` — неблокирующий, поскольку обе ветки существуют одновременно, даже если они не находятся в DOM.

```jsx
<Suspense fallback={<div>Загрузка...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Экспериментальный)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

Позволяет координировать несколько параллельных компонентов `Suspense` и вложенных `SuspenseList`. Управляет порядком отображения контента, чтобы уменьшить пересчёт макета (layout thrashing). Имеет возможность свернуть или скрыть `fallback`.

```jsx
<SuspenseList revealOrder='forwards' tail='collapsed'>
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Загрузка постов...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Загрузка постов...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

> **Внимание**! `SuspenseList` все ещё является экспериментальным и не имеет полной поддержки `SSR`.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

Позволяет вставить произвольный компонент или тег и передать им `пропсы`.

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

Внедряет элемент в элемент, к которому примонтировано приложение. Полезно для вставки модальных окон вне основной структуры приложения. События по-прежнему распространяются через иерархию компонентов.

Портал монтируется в `<div>`, если целью не является заголовок документа. `useShadow` помещает элемент в теневой корень для изоляции стилей, а `isSVG` требуется при вставке в элемент `SVG`.

```jsx
<Portal mount={document.getElementById('modal')}>
  <div>Мой контент</div>
</Portal>
```

# Специальные атрибуты JSX

В целом Solid пытается придерживаться соглашений DOM. Solid очень близок к DOM. Большинство свойств обрабатываются как атрибуты нативных элементов и свойств веб-компонентов, но некоторые из них всё же имеют особое поведение.

Для настраиваемых атрибутов с помощью `TypeScript` вам необходимо расширить пространство имен `Solid JSX`:

```ts
declare module 'solid-js' {
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

Это способ получить доступ к базовым элементам DOM в JSX. Можно, конечно, просто присвоить элемент переменной, но все же более оптимальным вариантом будет оставить компоненты в потоке JSX. Ссылки назначаются во время рендеринга, до того, как элементы будут подключены к DOM. Ссылки можно использовать двумя способами.

```js
// 1. Простое присвоение
let myDiv;

// Используйте `onMount` или `createEffect` для работы с элементами уже подключенными к DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// 2. Колбэк (вызывается перед подключением к DOM)
<div ref={el => console.log(el)} />
```

`ref` также можно использовать для компонентов.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />
}

function App() {
  let myDiv
  onMount(() => console.log(myDiv.clientWidth))
  return <MyComp ref={myDiv} />
}
```

## `classList`

Вспомогательный атрибут, который использует `element.classList.toggle`. Он принимает объект, ключи которого являются именами классов, и назначает их, когда значение ключа истинно.

```jsx
<div classList={{ active: state.active, editing: state.currentId === row.id }} />
```

## `style`

Вспомогательный атрибут для стилей работает как со строкой, так и с объектом. В отличие от React, Solid внутри использует `element.style.setProperty`. Это не только позволяет поддерживать переменные CSS, но и придерживаться стандартов DOM. В итоге это приводит к повышению производительности и согласованности с SSR.

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

Данные атрибуты работают так же, как их эквиваленты-свойства. Просто передайте строку — и готово.

**Будьте осторожны !!!** Вставка в `innerHTML` любых непроверенных данных, которые приходят от конечного пользователя, является уязвимостью и может стать источником атаки.

Несмотря на то, что `textContent` в целом не нужен, он может использоваться для оптимизации производительности, когда вы уверены, что дочерние элементы будут являться текстом, что позволяет обойти обычный процесс сравнения.

```jsx
<div textContent={state.text} />
```

## `on___`

Обработчики событий в Solid обычно имеют форму `onclick` или `onClick` в зависимости от стиля. А вот название самого события всегда в нижнем регистре.

Solid использует полусинтетическое делегирование событий для общих событий пользовательского интерфейса, являющихся составными и всплывающими. Это улучшает производительность.

```jsx
<div onClick={e => console.log(e.currentTarget)} />
```

Solid также поддерживает передачу массива обработчику событий для привязки значения к первому аргументу обработчика событий. При этом не используется `bind` и не создается дополнительное замыкание, поэтому делегирование событий сильно оптимизировано.

```jsx
function handler(itemId, e) {
  /*...*/
}

;<ul>
  <For each={state.list}>{item => <li onClick={[handler, item.id]} />}</For>
</ul>
```

События не могут быть повторно привязаны, и привязки не являются реактивными. Причина в том, что добавление/удаление слушателей обычно «дорогая» операция. Поскольку события вызываются естественным образом, нет необходимости в реактивности, просто сокращайте свой обработчик, если хотите.

```jsx
// Лучше вызывайте `handleClick` только если он уже определен
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

Для любых других событий (возможно, с необычными именами или тех, которые вы не хотите делегировать) есть события пространства имен `on`. Данный атрибут просто добавит слушатель к нужному событию.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

Это настраиваемые `директивы`. В некотором смысле это просто синтаксический сахар для `ref`, но он позволяет нам легко прикреплять несколько директив к одному элементу. `Директива` — это просто функция со следующей сигнатурой:

```ts
function directive(element: Element, accessor: () => any): void;
```

Директивные функции вызываются во время рендеринга, перед добавлением в DOM. Вы можете делать в них все, что захотите, включая создание `Сигналов`, `Эффектов` и так далее.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

Чтобы зарегистрировать их в TypeScript, расширьте пространство имен JSX.

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

Воспринимает `пропс` как свойство, а не как атрибут.

```jsx
<div prop:scrollTop={props.scrollPos + 'px'} />
```

## `attr:___`

Воспринимает `пропс` как атрибут, а не как свойство. Полезно для веб-компонентов, на которые вы хотите установить атрибуты.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Компилятор Solid использует простую эвристику для реактивного оборачивания и отложенного вычисления выражений JSX.

Выражение, передаваемое в компонент или Эффект и содержащее вызов функции, доступ к свойству или JSX, заключается в геттер. Зная это, мы можем уменьшить расходы по ресурсам на вещи, которые никогда не изменятся, просто обращаясь к ним за пределами JSX. Простая переменная никогда не будет обернута.

Мы также можем сказать компилятору не оборачивать их, установив комментарий-декоратор `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

Это также работает с дочерними элементами.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
