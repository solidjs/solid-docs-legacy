---
title: API
description: Resumen de todas las APIs de Solid.
sort: 0
---

# Reactividad Básica

## `createSignal`

```ts
export function createSignal<T>(
	value: T,
	options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Esta es la primitiva reactiva más básica que se usa para dar seguimiento a un solo valor que cambia con el tiempo. La función `createSignal` devuelve un par de funciones en array: un getter (u _obtenedor_) y un setter (o _asignador_).

El getter devuelve el valor actual de la señal. Cuando se llama dentro de un scope de seguimiento (como funciones pasadas a `createEffect` o usadas en expresiones JSX), el contexto de llamada se re-ejecutará cuando se actualice la señal.

El setter actualiza la señal. Como único argumento, toma el nuevo valor de la señal o una función que asigna el último valor de la señal a un nuevo valor. El setter devuelve el valor actualizado. Son usualmente utilizados como `valor`, `setValor`.

```js
const [getValor, setValor] = createSignal(valorInicial);

// leet el valor
getValor();

// asignar el valor
setValor(valorSiguiente);

// asignar un valor con un setter/asignador
setValor((prev) => prev + siguiente);
```

> Si deseas almacenar una función en una Signal debes emplear la siguiente forma:
>
> ```js
> setValor(() => miFuncion);
> ```

##### Options

Varias primitivas en Solid toman un objeto de "opciones" como último argumento opcional. El objeto de opciones de `createSignal` le permite proporcionar una opción `equals`.

```js
const [getValor, setValor] = createSignal(valorInicial, { equals: false });
```

De forma predeterminada, cuando se llama al setter de una señal, las dependencias solo se vuelven a ejecutar si el nuevo valor es realmente diferente al valor anterior. Puede establecer `equals` `false` para ejecutar siempre las dependencias después de llamar al setter, o puede pasar su propia función de igualdad.

```js
const [miString, setMiString] = createSignal("string", {
	equals: (newVal, oldVal) => newVal.length === oldVal.length,
});

setMyString("strung"); //es considerado igual al ultimo valor y no generará actualizaciones
setMyString("stranger"); //es considerado diferente y generará actualizaciones
```

## `createEffect`

```ts
export function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Crea un nuevo cálculo que realiza un seguimiento automático de las dependencias y se ejecuta después de cada procesamiento en el que haya cambiado una dependencia. Ideal para usar `ref`s y manejar otros efectos secundarios.

```js
const [a, setA] = createSignal(valorInicial);

// effect que depende de la señal `a`
createEffect(() => doSideEffect(a()));
```

La función effect se llama con el valor devuelto desde la última ejecución de la función effect. Este valor se puede inicializar como un segundo argumento opcional. Esto puede ser útil para diferenciar sin crear un closure adicional.

```js
createEffect((prev) => {
	const suma = a() + b();
	if (suma !== prev) console.log(suma);
	return suma;
}, 0);
```

Cambios de señal dentro del _batch_ de los efectos: no se propagará ninguna actualización de una señal hasta que el efecto termine de ejecutarse.

## `createMemo`

```ts
export function createMemo<T>(
	fn: (v: T) => T,
	value?: T,
	options?: { equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Crea una señal derivada de solo lectura que vuelve a calcular su valor cada vez que se actualizan las dependencias del código ejecutado.

```js
const getValor = createMemo(() => computeExpensiveValue(a(), b()));

// leer el valor
getValor();
```

La función memo se llama con el valor devuelto por la última ejecución de la función memo. Este valor se puede inicializar como un segundo argumento opcional. Esto es útil para reducir los cálculos.

```js
const suma = createMemo((prev) => input() + prev, 0);
```

La función de memo no debe cambiar otras señales al llamar a los setters (debe ser "puro"). Esto permite que el orden de ejecución de los memos sea optimizado de acuerdo con las dependencias de lectura.

## `createResource`

```ts
type RecursoRetornado<T> = [
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
	fetcher: (k: U, info: { valor: T | undefined; refetching: boolean | unknown }) => T | Promise<T>,
	options?: { valorInicial?: T }
): RecursoRetornado<T>;

export function createResource<T, U>(
	source: U | false | null | (() => U | false | null),
	fetcher: (k: U, info: { valor: T | undefined; refetching: boolean | unknown }) => T | Promise<T>,
	options?: { valorInicial?: T }
): RecursoRetornado<T>;
```

Crea una señal que refleja el resultado de una solicitud asíncrona.

`createResource` toma una función fetcher asíncrona y devuelve una señal que se actualiza con los datos resultantes cuando se completa el fetch.

Hay dos formas de usar `createResource`: puede pasar la función de búsqueda de recursos como único argumento, o también puede pasar una signal de origen como primer argumento. La signal de fuente volverá a activar el fetcher cada vez que cambie, y su valor se pasará al fetcher.

```js
// const [datos, { mutar, buscarDeNuevo}] = createResource(buscarDatos)
const [data, { mutate, refetch }] = createResource(fetchData);
```

```js
// const [datos, { mutar, buscarDeNuevo}] = createResource(signalDeOrigen, buscarDatos)
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData);
```

En estos fragmentos, el buscador es la función `fetchData`. En ambos casos, `data()` no está definido hasta que `fetchData` termina de resolverse. En el primer caso, `fetchData` será llamado inmediatamente.
En el segundo, se llamará a `fetchData` tan pronto como `sourceSignal` tenga cualquier valor que no sea `false`, `null` o `undefined`. Se volverá a llamar cada vez que cambie el valor de `sourceSignal`, siempre se pasará a `fetchData` como su primer argumento.

De cualquier manera, puede llamar a `mutate` para actualizar directamente la signal `data` (funciona como cualquier otro emisor de signals). También puede llamar a `refetch` para volver a ejecutar el buscador directamente y pasar un argumento opcional para proporcionar información adicional al buscador: `refetch(info)`.

`data` funciona como un receptor de señal normal: usa `data()` para leer el último valor devuelto de `fetchData`.
Pero también tiene dos propiedades extra: `data.loading` te dice si el buscador ha sido llamado pero no devuelto, y `data.error` te dice si la solicitud ha fallado; si es así, contiene el error arrojado por el buscador. (Nota: si prevé errores, es posible que desee incluir `createResource` en un [ErrorBoundary](#<errorboundary>).)

`loading` y `error` son getters reactivos y pueden recibir seguimiento.

El `fetcher` es la función asíncrona que proporcionas a `createResource` para obtener los datos.
Se pasan dos argumentos: el valor de la señal de origen (si se proporciona) y un objeto de información con dos propiedades: "value" y "refetching". `value` te dice el valor obtenido previamente.
`refetching` es `true` si el buscador se activó mediante la función `refetch` y `false` en caso contrario.
Si se llamó a la función `refetch` con un argumento (`refetch(info)`), `refetch` se establece en ese argumento.

```js
async function fetchData(source, { value, refetching }) {
	//
	// Obtener los datos y devolver un valor.
	//`source` te dice el valor actual de la señal fuente;
	//`valor` te dice el último valor devuelto por el fetcher;
	//`refetching` es verdadero cuando el buscador se activa al llamar `refetch()`,
	// o igual a la información opcional pasada: `refetch(info)`
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// leer valor
data();

// checa si esta cargando
data.loading;

// checa si hubo error
data.error;

// establece el valor directamente sin devolver una prom
mutate(optimisticValue);

// volver a recuperar la última solicitud explícitamente
refetch();
```

# Ciclos de vida

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Registra un método que se ejecuta después de que se hayan montado la representación inicial y los elementos. Ideal para usar `ref`s y manejar otros efectos secundarios de una sola vez. Es equivalente a un `createEffect` que no tiene dependencias.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Registra un método de limpieza que se ejecuta al desechar o volver a calcular el scope reactivo actual. Se puede utilizar en cualquier Component o Effect.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Registra un método de manejo de errores que se ejecuta cuando se producen errores en el scope secundario. Solo se ejecutan los controladores de error de scope más cercano. Vuelve a lanzar para disparar la línea.

# Utilidades Reactivas

Estos asistentes brindan la capacidad de programar mejor las actualizaciones y controlar cómo se realiza el seguimiento de la reactividad.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

Ignora el seguimiento de cualquiera de las dependencias en el bloque de código de ejecución y devuelve el valor.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Retiene la confirmación de actualizaciones dentro del bloque hasta el final para evitar un nuevo calculo innecesario. Esto significa que los valores de lectura en la siguiente línea aún no se habrán actualizado. El método set y los efectos de [Solid Store](#createstore) envuelven automáticamente su código en un lote.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
	deps: T,
	fn: (input: T, prevInput: T, prevValue?: U) => U,
	options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` está diseñado para pasar a un cálculo para hacer explícitas sus dependencias. Si se pasa un array de dependencias, `input` y `prevInput` son arrays.

```js
createEffect(on(a, (v) => console.log(v, b())));

// es equivalente a:
createEffect(() => {
	const v = a();
	untrack(() => console.log(v, b()));
});
```

También puedes no ejecutar el calculo de inmediato y en su lugar, optar porque se ejecute cuando cambie configurando la opción defer a true.

```js
// no se ejecuta de inmediato
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // ahora si se ejecuta
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Crea un nuevo scope de propietario sin seguimiento que no se auto-desecha. Esto es útil para los scopes reactivos anidados que no desee liberar cuando el padre vuelve ser calculado.

Todo el código de Solid debe incluirse en uno de estos niveles superiores, ya que aseguran que toda la memoria/cálculos se liberen. Normalmente no necesita preocuparse por esto ya que `createRoot` está incrustado en todas las funciones de entrada `render`.

## `getOwner`

```ts
export function getOwner(): Owner;
```

Obtiene el scope reactivo que posee el código que se está ejecutando, por ejemplo, para pasar a una llamada posterior a `runWithOwner` fuera del scope actual.

Internamente, los cálculos (effects, memos, etc.) crean owners que son hijos de su owner, hasta llegar al owner raíz creado por `createRoot` o `render`. En particular, este árbol posesiones permite que Solid limpie automáticamente un cómputo descartado atravesando su sub-árbol y llamando a todas las devoluciones de llamada [`onCleanup`](#oncleanup). Por ejemplo, cuando las dependencias de `createEffect` cambian, el efecto llama a todas las devoluciones de llamada descendientes de `onCleanup` antes de volver a ejecutar la función de efecto. Llamar a `getOwner` devuelve el nodo propietario actual que es responsable de la eliminación del bloque de ejecución actual.

Los componentes no son cálculos, por lo tanto, no cree un nodo propietario ahí, generalmente se procesan desde un `createEffect` que sí lo hace, por lo que el resultado es similar: cuando un componente se desmonta, se llaman todas las devoluciones de llamada `onCleanup` descendientes. Llamar a `getOwner` desde el scope de un componente devuelve el propietario responsable de renderizar y desmontar ese componente.

Tenga en cuenta que el scope reactivo propietario no es necesariamente _seguimiento_. Por ejemplo, [`untrack`](#untrack) desactiva el seguimiento durante la duración de una función (sin crear un nuevo scope reactivo), al igual que los componentes creados a través de JSX (`<Componente ...>`).

## `runWithOwner`

```ts
export function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

Executes the given function under the provided owner,
instead of (and without affecting) the owner of the outer scope.
By default, computations created by `createEffect`, `createMemo`, etc.
are owned by the owner of the currently executing code (the return value of
`getOwner`), so in particular will get disposed when their owner does.
Calling `runWithOwner` provides a way to override this default to a manually
specified owner (typically, the return value from a previous call to
`getOwner`), enabling more precise control of when computations get disposed.

Having a (correct) owner is important for two reasons:

- Computations without an owner cannot be cleaned up. For example, if you call
  `createEffect` without an owner (e.g., in the global scope), the effect will
  continue running forever, instead of being disposed when its owner gets
  disposed.
- [`useContext`](#usecontext) obtains context by walking up the owner tree
  to find the nearest ancestor providing the desired context.
  So without an owner you cannot look up any provided context
  (and with the wrong owner, you might obtain the wrong context).

Manually setting the owner is especially helpful when doing reactivity outside
of any owner scope. In particular, asynchronous computation
(via either `async` functions or callbacks like `setTimeout`)
lose the automatically set owner, so remembering the original owner via
`getOwner` and restoring it via `runWithOwner` is necessary in these cases.
For example:

```js
const owner = getOwner();
setTimeout(() => {
	// This callback gets run without owner.
	// Restore owner via runWithOwner:
	runWithOwner(owner, () => {
		const foo = useContext(FooContext);
		createEffect(() => {
			console.log(foo);
		});
	});
}, 1000);
```

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

A reactive object `merge` method. Useful for setting default props for components in case caller doesn't provide them. Or cloning the props object including reactive properties.

This method works by using a proxy and resolving properties in reverse order. This allows for dynamic tracking of properties that aren't present when the prop object is first merged.

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
export function splitProps<T>(props: T, ...keys: Array<(keyof T)[]>): [...parts: Partial<T>];
```

Splits a reactive object by keys.

It takes a reactive object and any number of arrays of keys; for each array of keys, it will return a reactive object with just those properties of the original object. The last reactive object in the returned array will have any leftover properties of the original object.

This can be useful if you want to consume a subset of props and pass the rest to a child.

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

Used to batch async updates in a transaction deferring commit until all async processes are complete. This is tied into Suspense and only tracks resources read under Suspense boundaries.

```js
const [isPending, start] = useTransition();

// check if transitioning
isPending();

// wrap in transition
start(() => setSignal(newValue), () => /* transition is done */)
```

## `startTransition`

**New in v1.1.0**

```ts
export function startTransition: (fn: () => void) => Promise<void>;
```

Similar to `useTransition` except there is no associated pending state. This one can just be used directly to start the Transition.

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

This method takes a signal and produces a simple Observable. Consume it from the Observable library of your choice with typically with the `from` operator.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `from`

**New in v1.1.0**

```ts
export function from<T>(
	producer:
		| ((setter: (v: T) => T) => () => void)
		| {
				subscribe: (fn: (v: T) => void) => (() => void) | { unsubscribe: () => void };
		  }
): () => T;
```

A simple helper to make it easier to interopt with external producers like RxJS observables or with Svelte Stores. This basically turns any subscribable (object with a `subscribe` method) into a Signal and manages subscription and disposal.

```js
const signal = from(obsv$);
```

It can also take a custom producer function where the function is passed a setter function returns a unsubscribe function:

```js
const clock = from((set) => {
	const t = setInterval(() => set(1), 1000);
	return () => clearInterval(t);
});
```

> Note: Signals created by `from` have equality checks turned off to interface better with external streams and sources.

## `mapArray`

```ts
export function mapArray<T, U>(
	list: () => readonly T[],
	mapFn: (v: T, i: () => number) => U
): () => U[];
```

Reactive map helper that caches each item by reference to reduce unnecessary mapping on updates. It only runs the mapping function once per value and then moves or removes it as needed. The index argument is a signal. The map function itself is not tracking.

Underlying helper for the `<For>` control flow.

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

Similar to `mapArray` except it maps by index. The item is a signal and the index is now the constant.

Underlying helper for the `<Index>` control flow.

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

These APIs are available at `solid-js/store`. They allow the creation of stores: [proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that allow a tree of signals to be independently tracked and modified.

## Using Stores

### `createStore`

```ts
export function createStore<T extends StoreNode>(
	state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
```

The create function takes an initial state, wraps it in a store, and returns a readonly proxy object and a setter function.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore(valorInicial);

// read value
state.someValue;

// set value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

As proxies, store objects only track when a property is accessed.

When nested objects are accessed, stores will produce nested store objects, and this applies all the way down the tree. However, this only applies to arrays and plain objects. Classes are not wrapped, so objects like `Date`, `HTMLElement`, `RegExp`, `Map`, `Set` won't be granularly reactive as properties on a store.

The top level state object cannot be tracked, so put any lists on a key of state rather than using the state object itself.

```js
// put the list as a key on the state object
const [state, setState] = createStore({ list: [] });

// access the `list` property on the state object
<For each={state.list}>{item => /*...*/}</For>
```

### Getters

Store objects support the use of getters to store calculated values.

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

These are simple getters, so you still need to use a memo if you want to cache a value:

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

### Updating Stores

Changes can take the form of function that passes previous state and returns new state or a value. Objects are always shallowly merged. Set values to `undefined` to delete them from the Store.

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

It supports paths including key arrays, object ranges, and filter functions.

setState also supports nested setting where you can indicate the path to the change. When nested the state you are updating may be other non Object values. Objects are still merged but other values (including Arrays) are replaced.

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

Path can be string keys, array of keys, iterating objects ({from, to, by}), or filter functions. This gives incredible expressive power to describe state changes.

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

## Store Utilities

### `produce`

```ts
export function produce<T>(
	fn: (state: T) => void
): (state: T extends NotWrappable ? T : Store<T>) => T extends NotWrappable ? T : Store<T>;
```

Immer inspired API for Solid's Store objects that allows for localized mutation.

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
): (state: T extends NotWrappable ? T : Store<T>) => T extends NotWrappable ? T : Store<T>;
```

Diffs data changes when we can't apply granular updates. Useful for when dealing with immutable data from stores or large API responses.

The key is used when available to match items. By default `merge` false does referential checks where possible to determine equality and replaces where items are not referentially equal. `merge` true pushes all diffing to the leaves and effectively morphs the previous data to the new value.

```js
// subscribing to an observable
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
export function unwrap(store: Store<T>): T;
```

Returns the underlying data in the store without a proxy.

### `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T> {
```

Creates a new mutable Store proxy object. Stores only trigger updates on values changing. Tracking is done by intercepting property access and automatically tracks deep nesting via proxy.

Useful for integrating external systems or as a compatibility layer with MobX/Vue.

> **Note:** A mutable state can be passed around and mutated anywhere, which can make it harder to follow and easier to break unidirectional flow. It is generally recommended to use `createStore` instead. The `produce` modifier can give many of the same benefits without any of the downsides.

```js
const state = createMutable(valorInicial);

// read value
state.someValue;

// set value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables support setters along with getters.

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

# Component APIs

## `createContext`

```ts
interface Context<T> {
	id: symbol;
	Provider: (props: { value: T; children: any }) => any;
	defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context provides a form of dependency injection in Solid. It is used to save from needing to pass data as props through intermediate components.

This function creates a new context object that can be used with `useContext` and provides the `Provider` control flow. Default Context is used when no `Provider` is found above in the hierarchy.

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

	return <CounterContext.Provider value={store}>{props.children}</CounterContext.Provider>;
}
```

The value passed to provider is passed to `useContext` as is. That means wrapping as a reactive expression will not work. You should pass in Signals and Stores directly instead of accessing them in the JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Used to grab context to allow for deep passing of props without having to pass them through each Component function.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Used to make it easier to interact with `props.children`. This helper resolves any nested reactivity and returns a memo. Recommended approach to using `props.children` in anything other than passing directly through to JSX.

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

Used to lazy load components to allow for code splitting. Components are not loaded until rendered. Lazy loaded components can be used the same as its statically imported counterpart, receiving props etc... Lazy components trigger `<Suspense>`

```js
// wrap import
const ComponentA = lazy(() => import("./ComponentA"));

// use in JSX
<ComponentA title={props.title} />;
```

## `createUniqueId`

```ts
export function createUniqueId(): string;
```

A universal id generator that is stable across server/browser.

```js
const id = createUniqueId();
```

> **Note** on the server this only works under hydratable components

# Secondary Primitives

You probably won't need them for your first app, but these are useful tools to have.

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

Creates a readonly that only notifies downstream changes when the browser is idle. `timeoutMs` is the maximum time to wait before forcing the update.

## `createComputed`

```ts
export function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs immediately before render. Use this to write to other reactive primitives. When possible use `createMemo` instead as writing to a signal mid update can cause other computations to need to re-calculate.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs during the render phase as DOM elements are created and updated but not necessarily connected. All internal DOM updates happen at this time.

## `createReaction`

**New in v1.3.0**

```ts
export function createReaction(onInvalidate: () => void): (fn: () => void) => void;
```

Sometimes it is useful to separate tracking from re-execution. This primitive registers a side effect that is run the first time the expression wrapped by the returned tracking function is notified of a change.

```js
const [s, set] = createSignal("start");

const track = createReaction(() => console.log("something"));

// next time s changes run the reaction
track(() => s());

set("end"); // "something"

set("final"); // no-op as reaction only runs on first update, need to call track again.
```

## `createSelector`

```ts
export function createSelector<T, U>(
	source: () => T,
	fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

Creates a conditional signal that only notifies subscribers when entering or exiting their key matching the value. Useful for delegated selection state. As it makes the operation O(2) instead of O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
	{(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

These imports are exposed from `solid-js/web`.

## `render`

```ts
export function render(code: () => JSX.Element, element: MountableElement): () => void;
```

This is the browser app entry point. Provide a top level component definition or function and an element to mount to. It is recommended this element be empty as the returned dispose function will wipe all children.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(fn: () => JSX.Element, node: MountableElement): () => void;
```

This method is similar to `render` except it attempts to rehydrate what is already rendered to the DOM. When initializing in the browser a page has already been server rendered.

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

Renders to a string synchronously. The function also generates a script tag for progressive hydration. Options include eventNames to listen to before the page loads and play back on hydration, and nonce to put on the script tag.

`renderId` is used to namespace renders when having multiple top level roots.

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

Same as `renderToString` except it will wait for all `<Suspense>` boundaries to resolve before returning the results. Resource data is automatically serialized into the script tag and will be hydrated on client load.

`renderId` is used to namespace renders when having multiple top level roots.

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**New in v1.3.0**

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

This method renders to a stream. It renders the content synchronously including any Suspense fallback placeholders, and then continues to stream the data and HTML from any async resource as it completes.

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` fires when synchronous rendering is complete before writing the first flush to the stream out to the browser. `onCompleteAll` is called when all server Suspense boundaries have settled. `renderId` is used to namespace renders when having multiple top level roots.

> Note this API replaces the previous `pipeToWritable` and `pipeToNodeWritable` APIs.

## `isServer`

```ts
export const isServer: boolean;
```

This indicates that the code is being run as the server or browser bundle. As the underlying runtimes export this as a constant boolean it allows bundlers to eliminate the code and their used imports from the respective bundles.

```js
if (isServer) {
	// I will never make it to the browser bundle
} else {
	// won't be run on the server;
}
```

## `HydrationScript`

```ts
export function generateHydrationScript(options: { nonce?: string; eventNames?: string[] }): string;

export function HydrationScript(props: { nonce?: string; eventNames?: string[] }): JSX.Element;
```

Hydration Script is a special script that should be placed once on the page to bootstrap hydration before Solid's runtime has loaded. It comes both as a function that can be called and inserted in an your HTML string, or as a Component if you are rendering JSX from the `<html>` tag.

The options are for the `nonce` to be put on the script tag and any event names for that Solid should capture before scripts have loaded and replay during hydration. These events are limited to those that Solid delegates which include most UI Events that are composed and bubble. By default it is only `click` and `input` events.

# Control Flow

For reactive control flow to be performant, we have to control how elements are created. For example, with lists, a simple `map` is inefficient as it always maps the entire array.

This means helper functions. Wrapping these in components is convenient way for terse templating and allows users to compose and build their own control flow components.

These built-in control flow components will be automatically imported. All except `Portal` and `Dynamic` are exported from `solid-js`. Those two, which are DOM-specific, are exported by `solid-js/web`.

> Note: All callback/render function children of control flow are non-tracking. This allows for nesting state creation, and better isolates reactions.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
	each: readonly T[];
	fallback?: JSX.Element;
	children: (item: T, index: () => number) => U;
}): () => U[];
```

Simple referentially keyed loop. The callback takes the current item as the first argument:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
	{(item) => <div>{item}</div>}
</For>
```

The optional second argument is an index signal:

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

The Show control flow is used to conditional render part of the view: it renders `children` when the `when` is truthy, an `fallback` otherwise. It is similar to the ternary operator (`when ? children : fallback`) but is ideal for templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
	<div>My Content</div>
</Show>
```

Show can also be used as a way of keying blocks to a specific data model. Ex the function is re-executed whenever the user model is replaced.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
	{(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: { fallback?: JSX.Element; children: JSX.Element }): () => JSX.Element;

type MatchProps<T> = {
	when: T | undefined | null | false;
	children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Useful for when there are more than 2 mutual exclusive conditions. Can be used to do things like simple routing.

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

Match also supports function children to serve as keyed flow.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
	each: readonly T[];
	fallback?: JSX.Element;
	children: (item: () => T, index: number) => U;
}): () => U[];
```

Non-keyed list iteration (rendered nodes are keyed to an array index). This is useful when there is no conceptual key, like if the data consists of primitives and it is the index that is fixed rather than the value.

The item is a signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
	{(item) => <div>{item()}</div>}
</Index>
```

Optional second argument is an index number:

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

Catches uncaught errors and renders fallback content.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
	<MyComp />
</ErrorBoundary>
```

Also supports callback form which passes in error and a reset function.

```jsx
<ErrorBoundary fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}>
	<MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: { fallback?: JSX.Element; children: JSX.Element }): JSX.Element;
```

A component that tracks all resources read under it and shows a fallback placeholder state until they are resolved. What makes `Suspense` different than `Show` is it is non-blocking in that both branches exist at the same time even if not currently in the DOM.

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

`SuspenseList` allows for coordinating multiple parallel `Suspense` and `SuspenseList` components. It controls the order in which content is revealed to reduce layout thrashing and has an option to collapse or hide fallback states.

```jsx
<SuspenseList revealOrder='forwards' tail='collapsed'>
	<ProfileDetails user={resource.user} />
	<Suspense fallback={<h2>Loading posts...</h2>}>
		<ProfileTimeline posts={resource.posts} />
	</Suspense>
	<Suspense fallback={<h2>Loading fun facts...</h2>}>
		<ProfileTrivia trivia={resource.trivia} />
	</Suspense>
</SuspenseList>
```

SuspenseList is still experimental and does not have full SSR support.

## `<Dynamic>`

```ts
function Dynamic<T>(
	props: T & {
		children?: any;
		component?: Component<T> | string | keyof JSX.IntrinsicElements;
	}
): () => JSX.Element;
```

This component lets you insert an arbitrary Component or tag and passes the props through to it.

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

This inserts the element in the mount node. Useful for inserting Modals outside of the page layout. Events still propagate through the Component Hierarchy.

The portal is mounted in a `<div>` unless the target is the document head. `useShadow` places the element in a Shadow Root for style isolation, and `isSVG` is required if inserting into an SVG element so that the `<div>` is not inserted.

```jsx
<Portal mount={document.getElementById("modal")}>
	<div>My Content</div>
</Portal>
```

# Special JSX Attributes

In general Solid attempts to stick to DOM conventions. Most props are treated as attributes on native elements and properties on Web Components, but a few of them have special behavior.

For custom namespaced attributes with TypeScript you need to extend Solid's JSX namespace:

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

Refs are a way of getting access to underlying DOM elements in our JSX. While it is true one could just assign an element to a variable, it is more optimal to leave components in the flow of JSX. Refs are assigned at render time but before the elements are connected to the DOM. They come in 2 flavors.

```js
// simple assignment
let myDiv;

// use onMount or createEffect to read after connected to DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Or, callback function (called before connected to DOM)
<div ref={el => console.log(el)} />
```

Refs can also be used on Components. They still need to be attached on the otherside.

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

A helper that leverages `element.classList.toggle`. It takes an object whose keys are class names and assigns them when the resolved value is true.

```jsx
<div classList={{ active: state.active, editing: state.currentId === row.id }} />
```

## `style`

Solid's style helper works with either a string or with an object. Unlike React's version Solid uses `element.style.setProperty` under the hood. This means support for CSS vars, but it also means we use the lower, dash-case version of properties. This actually leads to better performance and consistency with SSR output.

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

These work the same as their property equivalent. Set a string and they will be set. **Be careful!!** Setting `innerHTML` with any data that could be exposed to an end user as it could be a vector for malicious attack. `textContent` while generally not needed is actually a performance optimization when you know the children will only be text as it bypasses the generic diffing routine.

```jsx
<div textContent={state.text} />
```

## `on___`

Event handlers in Solid typically take the form of `onclick` or `onClick` depending on style.

Solid uses semi-synthetic event delegation for common UI events that are composed and bubble. This improves performance for these common events.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid also supports passing an array to the event handler to bind a value to the first argument of the event handler. This doesn't use `bind` or create an additional closure, so it is a highly optimized way of delegating events.

```jsx
function handler(itemId, e) {
	/*...*/
}

<ul>
	<For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events are never rebound and the bindings are not reactive, as it is expensive to attach and detach listeners.
Since event handlers are called like any other function each time an event fires, there is no need for reactivity; simply shortcut your handler if desired.

```jsx
// if defined call it, otherwised don't.
<div onClick={() => props.handleClick?.()} />
```

Note that `onChange` and `onInput` work according to their native behavior. `onInput` will fire immediately after the value has changed; for `<input>` fields, `onChange` will only fire after the field loses focus.

## `on:___`/`oncapture:___`

For any other events, perhaps ones with unusual names, or ones you wish not to be delegated there are the `on` namespace events. This simply adds an event listener verbatim.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

These are custom directives. In a sense this is just syntax sugar over ref but allows us to easily attach multiple directives to a single element. A directive is simply a function with the following signature:

```ts
function directive(element: Element, accessor: () => any): void;
```

Directive functions are called at render time but before being added to the DOM. You can do whatever you'd like in them including create signals, effects, register clean-up etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
	const [field, setField] = value();
	createRenderEffect(() => (el.value = field()));
	el.addEventListener("input", (e) => setField(e.target.value));
}

<input type='text' use:model={[name, setName]} />;
```

To register with TypeScript extend the JSX namespace.

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

Forces the prop to be treated as a property instead of an attribute.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Forces the prop to be treated as a attribute instead of an property. Useful for Web Components where you want to set attributes.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid's compiler uses a simple heuristic for reactive wrapping and lazy evaluation of JSX expressions. Does it contain a function call, a property access, or JSX? If yes we wrap it in a getter when passed to components or in an effect if passed to native elements.

Knowing this we can reduce overhead of things we know will never change simply by accessing them outside of the JSX. A simple variable will never be wrapped. We can also tell the compiler not to wrap them by starting the expression with a comment decorator `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

This also works on children.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
