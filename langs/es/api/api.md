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

Ejecuta la función dada bajo el propietario proporcionado, en lugar de (y sin afectar) al propietario del scope externo. De forma predeterminada, los cálculos creados por `createEffect`, `createMemo`, etc. pertenecen al propietario del código que se está ejecutando actualmente (el valor de retorno de `getOwner`), por lo que, en particular, se eliminarán cuando lo haga su propietario. Llamar a `runWithOwner` proporciona una forma de anular este valor predeterminado a un propietario especificado manualmente (normalmente, el valor de retorno de una llamada anterior a `getOwner`), lo que permite un control más preciso de cuándo se eliminan los cálculos.

Tener un propietario (correcto) es importante por dos razones:

- Los cálculos sin propietario no se pueden limpiar. Por ejemplo, si llama a `createEffect` sin un propietario (por ejemplo, en el ámbito global), el efecto continuará ejecutándose para siempre, en lugar de eliminarse cuando su propietario se elimine.

- [`useContext`](#usecontext) obtiene el contexto recorriendo el árbol de propietarios para encontrar el ancestro más cercano que proporcione el contexto deseado. Entonces, sin un propietario, no puede buscar ningún contexto proporcionado (y con el propietario incorrecto, puede obtener el contexto incorrecto).

La configuración manual del propietario es especialmente útil cuando se realiza una reactividad fuera del scope de cualquier propietario. En particular, la computación asíncrona (a través de funciones `async` o devoluciones de llamada como `setTimeout`) automáticamente pierde el propietario establecido, por lo que es necesario recordar el propietario original a través de `getOwner` y restaurarlo a través de `runWithOwner` en estos casos. Por ejemplo:

```js
const owner = getOwner();
setTimeout(() => {
	// Este callback se ejecuta sin propietario/dueño.
	// Restaura el propietario/dueño via runWithOwner:
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

`merge` Es un método de objeto reactivo. Útil para configurar props predeterminados para componentes en caso de que en el llamado se proporcionen. O clonando el objeto props incluyendo propiedades reactivas.

Este método funciona utilizando un proxy y resolviendo las propiedades en orden inverso. Esto permite el seguimiento dinámico de propiedades que no están presentes cuando el objeto prop se fusiona por primera vez.

```js
// props por default
props = mergeProps({ nombre: "Smith" }, props);

// clonar props
newProps = mergeProps(props);

// merge props / fusionar props
props = mergeProps(props, otrasProps);
```

## `splitProps`

```ts
export function splitProps<T>(props: T, ...keys: Array<(keyof T)[]>): [...parts: Partial<T>];
```

Divide un objeto reactivo por claves.

Toma un objeto reactivo y cualquier número de arrays de claves; para cada array de claves, devolverá un objeto reactivo con solo esas propiedades del objeto original. El último objeto reactivo en el array devuelto tendrá las propiedades sobrantes del objeto original.

Esto puede ser útil si desea consumir un subconjunto de props y pasar el resto a un hijo.

```js
const [local, otros] = splitProps(props, ["hijo"]);

<>
  <Child {...otros} />
  <div>{local.hijo}<div>
</>
```

## `useTransition`

```ts
export function useTransition(): [
	pending: () => boolean,
	startTransition: (fn: () => void) => Promise<void>
];
```

Se utiliza para procesar por lotes actualizaciones asíncronas dentro de una transacción aplazada hasta que se completen todos los procesos asíncronos. Esto está vinculado a Suspense y solo rastrea los recursos leídos dentro de los límites de Suspense.

```js
const [isPending, start] = useTransition();

// checkar si está en transición
isPending();

// envuelto en transición
start(() => setSignal(nuevoValor), () => /* se hace la transicion */)
```

## `startTransition`

**Nuevo en la v1.1.0**

```ts
export function startTransition: (fn: () => void) => Promise<void>;
```

Similar a `useTransition` excepto que no hay un estado pendiente asociado. Este solo puede usarse directamente para iniciar la transición.

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

Este método toma una señal y produce un Observable simple. Consúmalo de la librería Observable de su elección, normalmente con el operador `from`.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `from`

**Nuevo en la v1.1.0**

```ts
export function from<T>(
	producer:
		| ((setter: (v: T) => T) => () => void)
		| {
				subscribe: (fn: (v: T) => void) => (() => void) | { unsubscribe: () => void };
		  }
): () => T;
```

Un auxiliar simple para facilitar la interoperabilidad con productores externos como observables RxJS o con Svelte Stores. Básicamente, esto convierte cualquier suscribible (objeto con un método de suscripción) en una señal y gestiona la suscripción y la eliminación.

```js
const signal = from(obsv$);
```

Tambien puede tener una funcion productora personalizada donde la función es pasada una funcion setter, retorna una funcion que cancela la suscripción.

```js
const clock = from((set) => {
	const t = setInterval(() => set(1), 1000);
	return () => clearInterval(t);
});
```

> Nota: Las señales creadas por `from` tienen controles de igualdad desactivados para interactuar mejor con flujos y fuentes externos.

## `mapArray`

```ts
export function mapArray<T, U>(
	list: () => readonly T[],
	mapFn: (v: T, i: () => number) => U
): () => U[];
```

Asistente de mapa reactivo que almacena en caché cada elemento por referencia para reducir el mapeo innecesario en las actualizaciones. Solo ejecuta la función de mapeo una vez por valor y luego la mueve o elimina según sea necesario. El argumento index es una señal. La función de mapa en sí no está rastreando.

Auxiliar subyacente para el control de flujo `<For>`.

```js
const mapeado = mapArray(fuente, (modelo) => {
  const [nombre, setNombre] = createSignal(modelo.nombre);
  const [descripcion, setDescripcion] = createSignal(modelo.descripcion);

  return {
    id: modelo.id,
    get Nombre() {
      return Nombre();
    },
    get descripcion() {
      return descripcion();
    }
    setNombre,
    setDescripcion
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

Similar a `mapArray` excepto que mapea por índice. El elemento es una señal y el índice es ahora la constante.

Auxiliar subyacente para el control de flujo `<Index>`.

```js
const mapeado = indexArray(fuente, (modelo) => {
  return {
    get id() {
      return modelo().id
    }
    get inicialNombre() {
      return modelo().nombre[0];
    },
    get nombreCompleto() {
      return `${modelo().nombre} ${modelo().apellido}`;
    },
  }
});
```

# Stores

Estas API están disponibles en `solid-js/store`. Permiten la creación de almacenes: [objetos proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) que permiten rastrear y modificar un árbol de señales de forma independiente .

## Usando Stores

### `createStore`

```ts
export function createStore<T extends StoreNode>(
	state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
```

La función de creación toma un estado inicial, lo envuelve en un almacén y devuelve un objeto de proxy de solo lectura y una función de establecimiento.

```js
import { createStore } from "solid-js/store";
const [estado, setEstado] = createStore(valorInicial);

// get/leer valor
estado.algunValor;

// set/establecer valor
setEstado({ merge: "esteValor" });

setEstado("ruta", "al", "valor", nuevoValor);
```

Como proxies, los objetos del almacén solo se rastrean cuando se accede a una propiedad.

Cuando se accede a los objetos anidados, los almacenes producirán objetos de almacén anidados, y esto se aplica a todo el árbol. Sin embargo, esto solo se aplica a arrays y objetos simples. Las clases no están envueltas, por lo que objetos como `Date`, `HTMLElement`, `RegExp`, `Map`, `Set` no serán granularmente reactivos como propiedades en un almacén.

El objeto de estado de nivel superior no se puede rastrear, por lo tanto, coloque las listas en una clave de estado en lugar de usar el objeto de estado en sí.

```js
// put the list as a key on the state object
// pon la lista como una clave en objeto del estado
const [estado, setEstado] = createStore({ lista: [] });

// access the `list` property on the state object
// accede a la propiedad 'lista' en el objeto del estado
<For each={estado.lista}>{item => /*...*/}</For>
```

### Getters

Los objetos Store admiten el uso de getters para almacenar valores calculados.

```js
import { createStore } from "solid-js/store";
const [estado, setEstado] = createStore({
	usuario: {
		nombre: "John",
		apellido: "Smith",
		get nombreCompleto() {
			return `${this.nombre} ${this.apellido}`;
		},
	},
});
```

Estos son getters simples, por lo que aún necesita usar un memo si desea almacenar un valor en caché:

```js
let nombreCompleto;
const [estado, setEstado] = createStore({
	usuario: {
		nombre: "John",
		apellido: "Smith",
		get nombreCompleto() {
			return nombreCompleto();
		},
	},
});
nombreCompleto = createMemo(() => `${estado.usuario.nombre} ${estado.usuario.apellido}`);
```

### Actualizando Stores

Los cambios pueden tomar la forma de una función que pasa el estado anterior y devuelve un estado o valor nuevo. Los objetos siempre se fusionan superficialmente. Establezca los valores en `undefined` para eliminarlos de la Tienda.

```js
import { createStore } from "solid-js/store";
const [estado, setEstado] = createStore({
	nombre: "John",
	apellido: "Miller",
});

setEstado({ nombre: "Johnny", segundoNombre: "Lee" });
// ({ nombre: 'Johnny', segundoNombre: 'Lee', apellido: 'Miller' })

setEstado((estado) => ({ nombrePreferido: estado.nombre, apellido: "Milner" }));
// ({ nombre: 'Johnny', nombrePreferido: 'Johnny', segundoNombre: 'Lee', apellido: 'Milner' })
```

Admite rutas que incluyen arrays de claves, rangos de objetos y funciones de filtro.

setState también admite la configuración anidada donde puede indicar la ruta al cambio. Cuando está anidado, el estado que está actualizando puede ser otros valores que no sean Objeto. Los objetos aún se fusionan, pero se reemplazan otros valores (arrays incluidos).

```js
const [estado, setEstado] = createStore({
  contador: 2,
  lista: [
    { id: 23, titulo: 'Aves' }
    { id: 27, titulo: 'Peses' }
  ]
});

setEstado('contador', c => c + 1);
setEstado('lista', l => [...l, {id: 43, titulo: 'Marsupiales'}]);
setEstado('lista', 2, 'leer', true);
// {
//   contador: 3,
//   lista: [
//     { id: 23, titulo: 'Aves' }
//     { id: 27, titulo: 'Peses' }
//     { id: 43, titulo: 'Marsupiales', leer: true }
//   ]
// }
```

La ruta puede ser claves en string, un array de claves, objetos iterativos ({from, to, by}) o funciones de filtro. Esto le da un poder expresivo increíble para describir cambios de estado.

```js
const [estado, setEstado] = createStore({
  tareas: [
    { tarea: 'Terminar trabajo', completado: false }
    { tarea: 'Surtir la despensa', completado: false }
    { tarea: 'Preparar la cena', completado: false }
  ]
});

setEstado('tareas', [0, 2], 'completado', true);
// {
//   tareas: [
//     { tarea: 'Terminar trabajo', completado: true }
//     { tarea: 'Surtir la despensa', completado: false }
//     { tarea: 'Preparar la cena', completado: true }
//   ]
// }

setEstado('tareas', { from: 0, to: 1 }, 'completado', c => !c);
// {
//   tareas: [
//     { tarea: 'Terminar trabajo', completado: false }
//     { tarea: 'Surtir la despensa', completado: true }
//     { tarea: 'Preparar la cena', completado: true }
//   ]
// }

setEstado('tareas', tarea => tarea.completado, 'tarea', t => t + '!')
// {
//   tareas: [
//     { tarea: 'Terminar trabajo', completado: false }
//     { tarea: 'Surtir la despensa!', completado: true }
//     { tarea: 'Preparar la cena!', completado: true }
//   ]
// }

setEstado('tareas', {}, tarea => ({ marcado: true, completado: !tarea.completado }))
// {
//   tareas: [
//     { tarea: 'Terminar trabajo', completado: true, marcado: true }
//     { tarea: 'Surtir la despensa!', completado: false, marcado: true }
//     { tarea: 'Preparar la cena!', completado: false, marcado: true }
//   ]
// }
```

## Utilidades Store/Almacén

### `produce`

```ts
export function produce<T>(
	fn: (state: T) => void
): (state: T extends NotWrappable ? T : Store<T>) => T extends NotWrappable ? T : Store<T>;
```

API inspirada en Immer para objetos del almacén de Solid que permite la mutación localizada.

```js
setState(
	produce((s) => {
		s.usuario.nombre = "Frank";
		s.lista.push("Pluma Crayola");
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

Diferencia los cambios de datos cuando no podemos aplicar actualizaciones granulares. Útil para cuando se trata de datos inmutables de tiendas o respuestas de API grandes.

La clave se usa cuando está disponible para hacer coincidir los elementos. Por defecto, `merge` false realiza comprobaciones referenciales cuando es posible para determinar la igualdad y reemplaza los elementos donde los elementos no son referencialmente iguales. `merge` true empuja todas las diferencias a las hojas y efectivamente transforma los datos anteriores al nuevo valor.

```js
// subscribiendo a un observable
const unsubscribe = store.subscribe(({ tareas }) => (
  setState('tareas', reconcile(tareas)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
export function unwrap(store: Store<T>): T;
```

Devuelve los datos subyacentes en el almacén sin un proxy.

### `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T> {
```

Crea un nuevo objeto proxy de Store mutable. Las tiendas solo activan actualizaciones cuando los valores cambian. El seguimiento se realiza interceptando el acceso a la propiedad y rastrea automáticamente la anidación profunda a través de un proxy.

Útil para integrar sistemas externos o como capa de compatibilidad con MobX/Vue.

> **Nota:** Un estado mutable se puede pasar y mutar en cualquier lugar, lo que puede hacer que sea más difícil de seguir y más fácil romper el flujo unidireccional. En general, se recomienda usar `createStore` en su lugar. El modificador `produce` puede brindar muchos de los mismos beneficios sin ninguna de las desventajas.

```js
const state = createMutable(valorInicial);

// read value
// leer valor
state.algunValor;

// set value
// establecer valor
state.algunValor = 5;

state.list.push(otroValor);
```

Los mutables admiten setters junto con getters.

```js
const usuario = createMutable({
	nombre: "John",
	apellido: "Smith",
	get nombreCompleto() {
		return `${this.nombre} ${this.apellido}`;
	},
	set nombreCompleto(valor) {
		[this.nombre, this.apellido] = valor.split(" ");
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

Context proporciona una forma de inyección de dependencias en Solid. Se utiliza para evitar la necesidad de pasar datos via props a través de componentes intermedios.

Esta función crea un nuevo objeto de contexto que se puede usar con `useContext` y proporciona el control de flujo `Provider`. El contexto predeterminado se utiliza cuando no se encuentra ningún 'Provider' en la jerarquía.

```js
export const ContextoContador = createContext([{ cuenta: 0 }, {}]);

export function ProveedorContador(props) {
	const [estado, setEstado] = createStore({ cuenta: props.count || 0 });
	const store = [
		estado,
		{
			incrementar() {
				setEstado("cuenta", (c) => c + 1);
			},
			disminuir() {
				setEstado("cuenta", (c) => c - 1);
			},
		},
	];

	return <ContextoContador.Provider value={store}>{props.children}</ContextoContador.Provider>;
}
```

El valor pasado al proveedor se pasa a `useContext` tal cual. Eso significa que envolver como una expresión reactiva no funcionará. Debe pasar Signals y Stores directamente en lugar de acceder a ellos en el JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Se usa para tomar contexto para permitir el paso profundo de props sin tener que pasarlos a través de cada función de Componente.

```js
const [estado, { incrementar, disminuir }] = useContext(ContextoContador);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Usado para facilitar la interacción con `props.children`. Este auxiliar resuelve cualquier reactividad anidada y retorna un memo. Es el enfoque recomendado para usar `props.children` en cualquier otra cosa que no sea pasarlos directamente mediante JSX.

```js
const lista = children(() => props.children);

// do something with them
// haz algo con ellos
createEffect(() => lista());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
	fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Se utiliza para cargar componentes de forma diferida para permitir la división de código. Los componentes no se cargan hasta que se renderizan. Los componentes cargados de forma diferida se pueden usar de la misma manera que su contraparte importada estáticamente, recibiendo props, etc. Los componentes perezosos o lazy activan `<Suspense>`

```js
// wrap import
// envuelve import
const ComponenteA = lazy(() => import("./ComponenteA"));

// use in JSX
// usalo en JSX
<ComponenteA title={props.title} />;
```

## `createUniqueId`

```ts
export function createUniqueId(): string;
```

Un generador de ID universal que es estable a lo largo del servidor/navegador.

```js
const id = createUniqueId();
```

> **Nota** en el servidor esto solo funciona bajo componentes hidratables

# Primitives Secundarios

Probablemente no los necesitará para su primera aplicación, pero estas son herramientas útiles para tener.

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

Crea un readonly que solo notifica los cambios posteriores cuando el navegador está inactivo. `timeoutMs` es el tiempo máximo de espera antes de forzar la actualización.

## `createComputed`

```ts
export function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

Crea un nuevo cálculo que rastrea automáticamente las dependencias y se ejecuta inmediatamente antes del procesamiento. Use esto para escribir en otras primitivas reactivas. Cuando sea posible, use `createMemo` en su lugar, ya que escribir en una señal a mitad de la actualización puede hacer que otros cálculos necesiten volver a calcularse.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

Crea un nuevo cálculo que realiza un seguimiento automático de las dependencias y se ejecuta durante la fase de renderizado a medida que se crean y actualizan los elementos DOM, pero no están necesariamente conectados. Todas las actualizaciones internas de DOM ocurren en este momento.

## `createReaction`

**Nuevo en la v1.3.0**

```ts
export function createReaction(onInvalidate: () => void): (fn: () => void) => void;
```

En ocasiones es util separar el seguimiento de la re-ejecución. Esta primitiva registra un efecto secundario que es ejecutado la primera vez que la función envuelta por la funcion de seguimiento es notificada de un cambio.

```js
const [s, set] = createSignal("inicio");

const track = createReaction(() => console.log("algo"));

// next time s changes run the reaction
// la próxima ocasión que s cambia ejecuta la reacción
track(() => s());

set("fin"); // "algo"

set("final"); // sin operar ya que la reaccion solo se ejecuta al primer update, necesitas volver a llamar "track"
```

## `createSelector`

```ts
export function createSelector<T, U>(
	source: () => T,
	fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

Crea una signal condicional que unicamente notifica a los subscriptores cuando ingresan o salen al valor de dicha clave. Útil para selección de estado delegada. Ya que hace la operación O(2) en lugar de O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
	{(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Renderizado

Estas importaciones se exponen desde `solid-js/web`.

## `render`

```ts
export function render(code: () => JSX.Element, element: MountableElement): () => void;
```

Este es el punto de entrada de la aplicación del navegador. Proporciona una definición o función de componente de nivel superior y un elemento para montar. Se recomienda que este elemento esté vacío ya que la función dispose devuelta borrará a todos los elementos secundarios.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(fn: () => JSX.Element, node: MountableElement): () => void;
```

Este metodo es similar a `render`excepto que intenta rehidratar lo que ya ha sido renderizado en el DOM. Cuando se está inicializando el el navegador una página ya ha sido renderizada en el servidor.

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

Renderiza en forma de string sincrónicamente. La función además genera una equieta script para hidratación progresiva. Las opciones incluyen eventNames que pueden ser escuchados antes de que la pagina cargue y reproducirse al hidratarse, y una vez para poner en la etiqueta script.

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

Igual que `renderToString` excepto que esta esperará a que todos los limites de `<Suspense>` sean resueltos antes de retornar los resultados. Los datos de los recursos serán automáticamente serializados dentro de la etiqueta script y será hidratado una vez el cliente cargue.

`renderId` se usa para renderizar espacios de nombres cuando se tienen varias raíces de nivel superior

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**Nuevo en la v1.3.0**

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

Este metodo renderiza una transmisión. Renderiza el contenido sincrónicamente incluyendo cualquier placeholder de respaldo en los Suspense, despúes continua transmitiendo los datos y el HTML de cualquier recurso asincrono conforme estos estén completos.

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` se dispara cuando se completa la renderización síncrona antes de escribir el primer vaciado de la transmisión al navegador. Se llama a `onCompleteAll` cuando todos los límites de suspenso del servidor se han establecido. `renderId` se usa para renderizar espacios de nombres cuando se tienen varias raíces de nivel superior.

> Tenga en cuenta que esta API reemplaza las API anteriores `pipeToWritable` y `pipeToNodeWritable`.

## `isServer`

```ts
export const isServer: boolean;
```

Esto indica que el código se ejecuta como paquete de servidor o navegador. Como los tiempos de ejecución subyacentes exportan esto como un booleano constante, permite a los empaquetadores eliminar el código y sus importaciones usadas de los paquetes respectivos.

```js
if (isServer) {
	// I will never make it to the browser bundle
	// Nunca llegaré al paquete del navegador
} else {
	// won't be run on the server;
	// no será ejecutado en el servidor;
}
```

## `HydrationScript`

```ts
export function generateHydrationScript(options: { nonce?: string; eventNames?: string[] }): string;

export function HydrationScript(props: { nonce?: string; eventNames?: string[] }): JSX.Element;
```

Hydration Script es un script especial que debe colocarse una vez en la página para iniciar la hidratación antes de que se cargue el tiempo de ejecución de Solid. Viene como una función que se puede llamar e insertar en su cadena HTML, o como un componente si está representando JSX desde la etiqueta `<html>`.

Las opciones son para que `nonce` se coloque en la etiqueta del script y cualquier nombre de evento para que Solid
los capture antes de que los scripts se hayan cargado y reproducirse durante la hidratación. Estos eventos están limitados a aquellos que delega Solid, que incluyen la mayoría de los eventos de interfaz de usuario que están compuestos y burbujean. De forma predeterminada, solo son eventos `click` e `input`.

# Control de Flujo

Para que el flujo de control reactivo tenga un buen rendimiento, tenemos que controlar cómo se crean los elementos. Por ejemplo, con las listas, un 'mapa' simple es ineficiente ya que siempre mapea el array completo.

Esto significan funciones auxiliares. Envolviendo estas en componentes es una manera conveniente para crear templates concisas y permite a los usuarios componer y construir sus propios componentes de control de flujo.

Estos componentes de control de flujo incorporados se importarán automáticamente. Todos excepto `Portal` y `Dynamic` se exportan desde `solid-js`. Esos dos, que son específicos de DOM, son exportados por `solid-js/web`.

> Nota: Todas las funciones callbacks/render hijas del flujo de control no son de seguimiento. Esto permite anidar la creación del estado y aisla las reacciones de mejor forma.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
	each: readonly T[];
	fallback?: JSX.Element;
	children: (item: T, index: () => number) => U;
}): () => U[];
```

Bucle simple con llave referencial. El callback toma el elemento actual como primer argumento:

```jsx
<For each={state.lista} fallback={<div>Cargando...</div>}>
	{(elemento) => <div>{elemento}</div>}
</For>
```

El segundo argumento opcional es una señal index:

```jsx
<For each={state.lista} fallback={<div>Cargando...</div>}>
	{(elemento, index) => (
		<div>
			#{index()} {elemento}
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

El control de flujo Show se usa para renderizar condicionalmente parte de la vista: renderiza `children` cuando el `when` es verdadero, de lo contrario renderiza el `fallback`. Es similar al operador ternario (`when ? children : fallback`) pero es ideal para crear plantillas JSX.

```jsx
<Show when={state.cuenta > 0} fallback={<div>Cargando...</div>}>
	<div>Mi Contenidio</div>
</Show>
```

Show también se puede utilizar como una forma de introducir bloques en un modelo de datos específico. Por ejemplo, la función se vuelve a ejecutar cada vez que se reemplaza el modelo de usuario.

```jsx
<Show when={state.usuario} fallback={<div>Cargando...</div>}>
	{(usuario) => <div>{usuario.nombre}</div>}
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

Útil para cuando hay más de 2 condiciones de exclusión mutua. Se puede usar para hacer cosas como enrutamiento simple.

```jsx
<Switch fallback={<div>No Encontrado</div>}>
	<Match when={state.route === "home"}>
		<Home />
	</Match>
	<Match when={state.route === "configuracion"}>
		<Configuracion />
	</Match>
</Switch>
```

Match tambien soporta la función children para servir como flujo codificado.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
	each: readonly T[];
	fallback?: JSX.Element;
	children: (item: () => T, index: number) => U;
}): () => U[];
```

Iteración de listas sin codificar (los nodos representados se codifican en un índice de array). Esto es útil cuando no hay una clave conceptual, como si los datos consisten en primitivas y es el índice el que está fijo en lugar del valor.

El elemento es una signal:

```jsx
<Index each={state.lista} fallback={<div>Cargando...</div>}>
	{(elemento) => <div>{elemento()}</div>}
</Index>
```

El segundo argumento opcional es un número de índice:

```jsx
<Index each={state.lista} fallback={<div>Cargando...</div>}>
	{(elemento, index) => (
		<div>
			#{index} {elemento()}
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

Captura errores no detectados y presenta contenido alternativo.

```jsx
<ErrorBoundary fallback={<div>Algo salió terriblemente mal</div>}>
	<MiComponente />
</ErrorBoundary>
```

Tambien soporta la forma de callback que pasa un error y una función reset.

```jsx
<ErrorBoundary fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}>
	<MiComponente />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: { fallback?: JSX.Element; children: JSX.Element }): JSX.Element;
```

Un componente que rastrea todos los recursos leídos dentro de él y muestra un estado alternativo hasta que se resuelven. Lo que hace que 'Suspense' sea diferente de 'Show' es que no bloquea, ya que ambas ramas existen al mismo tiempo, incluso si no están actualmente en el DOM.

```jsx
<Suspense fallback={<div>Cargando...</div>}>
	<ComponenteAsincrono />
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

`SuspenseList` permite coordinar múltiples componentes paralelos `Suspense` y `SuspenseList`. Controla el orden en el que se revela el contenido para reducir la hiperpaginación del diseño y tiene una opción para colapsar u ocultar estados alternativos.

```jsx
<SuspenseList revealOrder='forwards' tail='collapsed'>
	<PerfilDetalles usuario={recurso.usuario} />
	<Suspense fallback={<h2>Cargando posts...</h2>}>
		<PerfilTimeline posts={recurso.posts} />
	</Suspense>
	<Suspense fallback={<h2>Cargando hechos divertidos...</h2>}>
		<PerfilTrivia trivia={recurso.trivia} />
	</Suspense>
</SuspenseList>
```

SuspenseList aún es experimental y no tiene soporte SSR completo.

## `<Dynamic>`

```ts
function Dynamic<T>(
	props: T & {
		children?: any;
		component?: Component<T> | string | keyof JSX.IntrinsicElements;
	}
): () => JSX.Element;
```

Este componente le permite insertar un componente o etiqueta arbitraria y pasa los props a través de él.

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

Esto inserta el elemento en el nodo de montaje. Útil para insertar modales fuera del diseño de la página. Los eventos aún se propagan a través de la jerarquía de componentes.

El portal se monta en un `<div>` a menos que el objetivo sea el encabezado del documento. `useShadow` coloca el elemento en Shadow Root para el aislamiento de estilo, `isSVG` es necesario si se inserta en un elemento SVG para que `<div>` no sea insertado.

```jsx
<Portal mount={document.getElementById("modal")}>
	<div>Mi Contenido</div>
</Portal>
```

# Special JSX Attributes

En general, Solid intenta apegarse a las convenciones DOM. La mayoría de los accesorios se tratan como atributos en elementos nativos y propiedades en componentes web, pero algunos de ellos tienen un comportamiento especial.

Para los atributos de espacio de nombres personalizados con TypeScript, debe ampliar el espacio de nombres JSX de Solid:

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

Las refs son una forma de obtener acceso a los elementos DOM subyacentes en nuestro JSX. Si bien es cierto que uno podría simplemente asignar un elemento a una variable, es más óptimo dejar los componentes en el flujo de JSX. Las refs se asignan en el momento del renderizado, pero antes de que los elementos se conecten al DOM. Vienen en 2 sabores.

```js
// simple assignment
// asignación simple
let miDiv;

// use onMount or createEffect to read after connected to DOM
// use onMount o createEffect para leer después de conectarse al DOM
onMount(() => console.log(miDiv));
<div ref={miDiv} />

// Or, callback function (called before connected to DOM)
// O función de devolución de llamada (llamada antes de conectarse al DOM)
<div ref={el => console.log(el)} />
```

Las referencias también se pueden usar en componentes. Todavía tienen que estar conectados en el otro lado.

```jsx
function MiComp(props) {
	return <div ref={props.ref} />;
}

function App() {
	let miDiv;
	onMount(() => console.log(miDiv.anchoDelCliente));
	return <MiComp ref={miDiv} />;
}
```

## `classList`

Un auxiliar que aprovecha `element.classList.toggle`. Toma un objeto cuyas claves son nombres de clases y las asigna cuando el valor resuelto es verdadero.

```jsx
<div classList={{ active: state.active, editing: state.currentId === row.id }} />
```

## `style`

El asistente de estilo de Solid funciona con una cadena o con un objeto. A diferencia de la versión de React, Solid usa `element.style.setProperty` bajo el capó. Esto significa soporte para CSS vars, pero también significa que usamos la versión de propiedades en minúsculas y con guión. En realidad, esto conduce a un mejor rendimiento y consistencia con la salida del SSR.

```jsx
// string
// cadena
<div style={`color: green; background-color: ${state.color}; height: ${state.altura}px`} />

// object
// objeto
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.altura + "px" }}
/>

// css vars
// variables css
<div style={{ "--mi-color-personalizado": state.temaColor }} />
```

## `innerHTML`/`textContent`

Estos funcionan igual que su propiedad equivalente. Establezca una cadena y se configurarán. **¡¡Cuidado!!** Establecer `innerHTML` con cualquier dato que pueda estar expuesto a un usuario final, ya que podría ser un vector de ataque malicioso. `textContent`, aunque generalmente no es necesario, en realidad es una optimización del rendimiento cuando sabe que los elementos secundarios solo serán texto, ya que omite la rutina de diferenciación genérica.

```jsx
<div textContent={state.texto} />
```

## `on___`

Los controladores de eventos en Solid normalmente toman la forma de `onclick` u `onClick` dependiendo del estilo.

Solid utiliza la delegación de eventos semisintéticos para eventos de interfaz de usuario comunes que están compuestos y burbujeados. Esto mejora el rendimiento para estos eventos comunes.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid también admite pasar un array al controlador de eventos para enlazar un valor al primer argumento del controlador de eventos. Esto no usa `bind` ni crea un cierre adicional, por lo que es una forma altamente optimizada de delegar eventos.

```jsx
function handler(itemId, e) {
	/*...*/
}

<ul>
	<For each={state.lista}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Los eventos nunca se vuelven a vincular y los enlaces no son reactivos, ya que es costoso conectar y desconectar listeners.
Dado que los controladores de eventos se llaman como cualquier otra función cada vez que se activa un evento, no hay necesidad de reactividad; simplemente abre un atajo a tu controlador si lo deseas.

```jsx
// if defined call it, otherwised don't.
// si está definido, llámelo, de lo contrario, no lo haga.
<div onClick={() => props.handleClick?.()} />
```

Tenga en cuenta que `onChange` y `onInput` funcionan de acuerdo con su comportamiento nativo. `onInput` se activará inmediatamente después de que el valor haya cambiado; para los campos `<input>`, `onChange` solo se activará después de que el campo pierda el foco.

## `on:___`/`oncapture:___`

Para cualquier otro evento, tal vez aquellos con nombres inusuales, o aquellos que no desea que se deleguen, están los eventos de espacio de nombres `on`. Esto simplemente agrega un detector de eventos literal.

```jsx
<div on:Evento-Raro={(e) => alert(e.detail)} />
```

## `use:___`

Estas son directivas personalizadas. En cierto sentido, esto es solo syntax sugar sobre ref, pero nos permite adjuntar fácilmente varias directivas a un solo elemento. Una directiva es simplemente una función con la siguiente firma:

```ts
function directive(elemento: Elemento, accessor: () => any): void;
```

Las funciones directivas se llaman en el momento del procesamiento, pero antes de agregarse al DOM. Puede hacer lo que quiera en ellos, incluida la creación de señales, efectos, limpieza de registros, etc.

```js
const [nombre, setNombre] = createSignal("");

function modelo(el, valor) {
	const [campo, setCampo] = valor();
	createRenderEffect(() => (el.valor = campo()));
	el.addEventListener("input", (e) => setCampo(e.target.value));
}

<input type='text' use:modelo={[nombre, setNombre]} />;
```

Para registrar con TypeScript, extienda el espacio de nombres JSX.

```ts
declare module "solid-js" {
	namespace JSX {
		interface Directives {
			modelo: [() => any, (v: any) => any];
		}
	}
}
```

## `prop:___`

Obliga a que el prop se trate como una propiedad en lugar de como un atributo.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Obliga a que la propiedad se trate como un atributo en lugar de una propiedad. Útil para componentes web en los que desea establecer atributos.

```jsx
<mi-elemento attr:status={props.status} />
```

## `/* @once */`

El compilador de Solid utiliza una heurística simple para la envoltura reactiva y la evaluación diferida de expresiones JSX. ¿Contiene una llamada de función, un acceso de propiedad o JSX? En caso afirmativo, lo envolvemos en un getter cuando se pasa a componentes o en un efecto si se pasa a elementos nativos.

Sabiendo esto, podemos reducir la sobrecarga de cosas que sabemos que nunca cambiarán simplemente accediendo a ellas fuera de JSX. Una variable simple nunca se envolverá. También podemos decirle al compilador que no los envuelva al comenzar la expresión con un decorador de comentarios `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.noSeActualizara} />
```

Tambien funciona en los hijos.

```jsx
<MyComponent>{/*@once*/ state.noSeActualizara}</MyComponent>
```
