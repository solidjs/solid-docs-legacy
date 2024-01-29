# Testeando Solid

Para usar su código Solid en producción, necesita probarse. Como no desea probar todo manualmente, necesita pruebas automatizadas. Probar el código sólido puede ser simple, una vez que haya configurado todo y conozca algunos patrones útiles para las pruebas.

## Configuración de pruebas

Ofrecemos soporte para dos herramientas para correr tests:

- jest - Muy bien establecida y con muchas funcionalidades

- uvu - Solo tiene lo mínimo y necesario

Ambas opciones están basadas en [solid-testing-library](https://github.com/solidjs/solid-testing-library), que integra which integrates [Testing Library](https://testing-library.com/) a Solid. Testing Library simula un navegador liviano y provee una API para interactuar con el mismo desde tus tests.

Mantenemos un template para empezar a usar tests con Jest en Solid. Recomendamos que tu proyecto se base en este template, o también puedes instalar el template en un proyecto nuevo y copiar su configuración a tu proyecto existente.

Los templates usan la herramienta [degit](https://github.com/Rich-Harris/degit) para su instalación.

### Configurando Jest

La intragración de Jest se basa en la configuración de Jest [solid-jest/preset/browser](https://github.com/solidjs/solid-jest), la cual le permite usar Solid como si lo utilizara en el navegador. Esto usa Babel para transformar a código Solid.

Utiliza [jest-dom](https://github.com/testing-library/jest-dom) para extender `expect` con muchos matchers personalizados para ayudarlo a escribir sus tests.

#### Jest con Typescript (`ts-jest`)

```bash
$ npx degit solidjs/templates/ts-jest my-solid-project
$ cd my-solid-project
$ npm install # o pnpm install o yarn install
```

Notar que este template no tiene chequeo de tipos durante el testing; puedes usar un IDE o un comando personalizado `tsc --noEmit` en el archivo `package.json` para activar dichos chequeos.

### Configurando uvu

También mantenemos un template para comenzar para `uvu`.

Incluye [solid-dom-testing](https://www.npmjs.com/package/solid-dom-testing) para ayudar a escribir aserciones útiles con Testing Library.

#### Uvu con Typescript (`ts-uvu`)

```bash
$ npx degit solidjs/templates/ts-uvu my-solid-project
$ cd my-solid-project
$ npm install # o pnpm install o yarn install
```

#### Reportes de cobertura con Uvu

> Desafortunadamente, debido a una [limitación de babel](https://github.com/babel/babel/issues/4289) no podemos obtener mapas de origen desde un JSX transpilado, lo que resulta en que los componentes muestren 0% de cobertura. Sí funciona para código que no contiene JSX.

Si deseas tener cobertura de código en tus tests, la herramienta preferida para uvu es c8. Para instalarla y configurarla, corre:

```sh
> npm i --save-dev c8 # or yarn add -D or pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

Ahora, al correr `npm run test:coverage`, podrás ver la cobertura de tests para tu código.

Si deseas tener buenos reportes de cobertura para HTML, puedes usar `c8 -r html` en lugar de `c8` para habilitar los reportes html.

#### Modo Watch

`uvu` no tiene un modo watch por defecto, pero puedes usar `chokidar-cli` para conseguir lo mismo:

```sh
> npm i --save-dev chokidar-cli # o yarn add -D o pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx en lugar de .ts/.tsx
```

Ahora, si corres `npm run test:watch`, las pruebas correran cada vez que cambies un archivo.

## Patrones de Prueba y Mejores Prácticas

Ahora que ha instalado sus herramientas de prueba, debe comenzar a usarlas. Para hacer esto más fácil, Solid admite algunos patrones agradables.

### Prueba de estado reactivo

Es posible que desee mantener partes de su estado separadas de los componentes para facilitar el mantenimiento o poder admitir múltiples vistas. En este caso, la interfaz contra la que estarás probando es el propio estado. Tenga en cuenta que fuera de una [raíz reactiva] (https://www.solidjs.com/docs/latest/api#createroot) no se realiza un seguimiento del estado y las actualizaciones no dispararán efectos ni memos.

Además, dado que los efectos se activan asincrónicamente, puede ser útil envolver nuestras afirmaciones en un efecto final. Alternativamente, para observar una secuencia de efectos sobre múltiples cambios, puede ayudar retornar las herramientas necesarias desde `createRoot` y ejecutarlas en una función de prueba asíncrona (ya que `createRoot` en sí no puede tomar una función `asíncrona`).

Como ejemplo, probemos `createLocalStore` del [ejemplo de tareas pendientes](https://www.solidjs.com/examples/todos):

```ts
import { createEffect } from "solid-js";
import { createStore, Store, SetStoreFunction } from "solid-js/store";

export function createLocalStore<T>(initState: T): [Store<T>, SetStoreFunction<T>] {
	const [state, setState] = createStore(initState);
	if (localStorage.todos) setState(JSON.parse(localStorage.todos));
	createEffect(() => (localStorage.todos = JSON.stringify(state)));
	return [state, setState];
}
```

En lugar de crear un componente TODO, podemos probar este modelo de forma aislada; cuando hacemos eso, debemos tener en cuenta que 1. los cambios reactivos solo funcionan cuando tienen un contexto de rastreo proporcionado por `render` o `createRoot` y 2. son asíncronos, pero podemos usar `createEffect` para detectarlos. El uso de `createRoot` tiene la ventaja de que podemos activar la eliminación manualmente:

#### Pruebas en Jest

```ts
import { createLocalStore } from "./main.tsx";
import { createRoot, createEffect } from "solid-js";

describe("createLocalStore", () => {
	beforeEach(() => {
		localStorage.removeItem("todos");
	});

	const initialState = {
		todos: [],
		newTitle: "",
	};

	test("lee el estado pre-existente de localStorage", () =>
		createRoot((dispose) => {
			const savedState = { todos: [], newTitle: "saved" };
			localStorage.setItem("todos", JSON.stringify(savedState));
			const [state] = createLocalStore(initialState);
			expect(state).toEqual(savedState);
			dispose();
		}));

	test("almacena nuevo estado en el localStorage", () =>
		createRoot((dispose) => {
			const [state, setState] = createLocalStore(initialState);
			setState("newTitle", "updated");
			// to catch an effect, use an effect
			return new Promise<void>((resolve) =>
				createEffect(() => {
					expect(JSON.parse(localStorage.todos || "")).toEqual({ todos: [], newTitle: "updated" });
					dispose();
					resolve();
				})
			);
		}));

	test("actualiza el estado múltiples veces", async () => {
		const { dispose, setState } = createRoot((dispose) => {
			const [state, setState] = createLocalStore(initialState);
			return { dispose, setState };
		});
		setState("newTitle", "first");
		// wait a tick to resolve all effects
		await new Promise((done) => setTimeout(done, 0));
		expect(JSON.parse(localStorage.todos || "")).toEqual({ todos: [], newTitle: "first" });
		setState("newTitle", "second");
		await new Promise((done) => setTimeout(done, 0));
		expect(JSON.parse(localStorage.todos || "")).toEqual({ todos: [], newTitle: "first" });
		dispose();
	});
});
```

#### Pruebas en uvu

```ts
import { createLocalStore } from "./main";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createEffect, createRoot } from "solid-js";

const todoTest = suite("createLocalStore");

todoTest.before.each(() => {
	localStorage.removeItem("todos");
});

const initialState = {
	todos: [],
	newTitle: "",
};

todoTest("lee el estado pre-existente de localStorage", () =>
	createRoot((dispose) => {
		const savedState = { todos: [], newTitle: "saved" };
		localStorage.setItem("todos", JSON.stringify(savedState));
		const [state] = createLocalStore(initialState);
		assert.equal(state, savedState);
		dispose();
	})
);

todoTest("almacena nuevo estado en el localStorage", () =>
	createRoot((dispose) => {
		const [_, setState] = createLocalStore(initialState);
		setState("newTitle", "updated");
		// to catch an effect, we need an effect
		return new Promise<void>((resolve) =>
			createEffect(() => {
				assert.equal(JSON.parse(localStorage.todos || ""), { todos: [], newTitle: "updated" });
				dispose();
				resolve();
			})
		);
	})
);

todoTest.run();
```

### Directivas de Pruebas

[Directivas](https://www.solidjs.com/docs/latest/api#use%3A___) permiten usar refs de forma reutilizable. Son básicamente funciones que siguen el patrón `(ref: HTMLElement, data: Accessor<any>) => void`. En nuestro [tutorial de directivas] (https://www.solidjs.com/tutorial/bindings_directives?solved), definimos la directiva `clickOutside` que debe llamar al callback envuelto en el argumento de acceso.

Ahora podríamos crear un componente y usar la directiva allí, pero luego estaríamos probando el uso de directivas en lugar de probar directamente la directiva. Es más sencillo probar la superficie de la directiva al proporcionar un nodo montado y el descriptor de acceso:

#### Pruebas en Jest

```ts
// click-outside.test.ts
import clickOutside from "click-outside";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

describe("clickOutside", () => {
	const ref = document.createElement("div");

	beforeAll(() => {
		document.body.appendChild(ref);
	});

	afterAll(() => {
		document.body.removeChild(ref);
	});

	test("se disparará al dar click afuera", () =>
		createRoot(
			(dispose) =>
				new Promise<void>((resolve) => {
					let clickedOutside = false;
					clickOutside(ref, () => () => {
						clickedOutside = true;
					});
					document.body.addEventListener("click", () => {
						expect(clickedOutside).toBeTruthy();
						dispose();
						resolve();
					});
					fireEvent.click(document.body);
				})
		));

	test("no se disparará al hacer click dentro", () =>
		createRoot(
			(dispose) =>
				new Promise<void>((resolve) => {
					let clickedOutside = false;
					clickOutside(ref, () => () => {
						clickedOutside = true;
					});
					ref.addEventListener("click", () => {
						expect(clickedOutside).toBeFalsy();
						dispose();
						resolve();
					});
					fireEvent.click(ref);
				})
		));
});
```

#### Pruebas en uvu

```ts
// click-outside.test.ts
import clickOutside from "click-outside.tsx";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

const clickTest = suite("clickOutside");

const ref = document.createElement("div");

clickTest.before(() => {
	document.body.appendChild(ref);
});

clickTest.after(() => {
	document.body.removeChild(ref);
});

clickTest("se disparará al dar click afuera", () =>
	createRoot(
		(dispose) =>
			new Promise<void>((resolve) => {
				let clickedOutside = false;
				clickOutside(ref, () => () => {
					clickedOutside = true;
				});
				document.body.addEventListener("click", () => {
					assert.ok(clickedOutside);
					dispose();
					resolve();
				});
				fireEvent.click(document.body);
			})
	)
);

clickTest("no se disparará al hacer click dentro", () =>
	createRoot(
		(dispose) =>
			new Promise<void>((resolve) => {
				let clickedOutside = false;
				clickOutside(ref, () => () => {
					clickedOutside = true;
				});
				ref.addEventListener("click", () => {
					assert.is(clickedOutside, false);
					dispose();
					resolve();
				});
				fireEvent.click(ref);
			})
	)
);

clickTest.run();
```

### Probando Componentes

Tomemos un componente muy simple de contador de clics que queremos probar:

```ts
// main.tsx
import { createSignal, Component } from "solid-js";

export const Counter: Component = () => {
	const [count, setCount] = createSignal(0);

	return (
		<div role='button' onClick={() => setCount((c) => c + 1)}>
			Count: {count()}
		</div>
	);
};
```

Aquí usamos `solid-testing-library`. Es muy importante que los helpers sean `render` para renderizar un componente de una forma controlada, `fireEvent` para despachar eventos de una forma similar a los eventos de usuario y `screen` para proveer selectores globales. También usamos aserciones útiles que fueron agregadas a `expect` provistas por `@testing-library/jest-dom`.

#### Pruebas en Jest

```ts
// main.test.tsx
import { Counter } from "./main";
import { cleanup, fireEvent, render, screen } from "solid-testing-library";

describe("Counter", () => {
	afterEach(cleanup);

	test("comienza en cero", () => {
		render(() => <Counter />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Count: 0");
	});

	test("aumenta su valor cada click", async () => {
		render(() => <Counter />);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		// el bucle de eventos requiere una Promesa para resolver y finalizar
		await Promise.resolve();
		expect(button).toHaveTextContent("Count: 1");
		fireEvent.click(button);
		await Promise.resolve();
		expect(button).toHaveTextContent("Count: 2");
	});
});
```

#### Pruebas en uvu

```ts
// main.test.tsx
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Counter } from "main";
import { fireEvent, render, screen } from "solid-testing-library";
import { isInDocument, hasTextContent } from "solid-dom-testing";

const testCounter = suite("Counter");

testCounter.after.each(cleanup);

testCounter("comienza en cero", () => {
	const { getByRole } = render(() => <Counter />);
	const button = getByRole("button");
	assert.ok(isInDocument(button), "el botón no está en el DOM");
	assert.ok(hasTextContent(button, "Count: 0"), "contiene texto incorrecto");
});

testCounter("aumenta su valor cada click", async () => {
	render(() => <Counter />);
	const button = screen.getByRole("button");
	fireEvent.click(button);
	// el bucle de eventos requiere una Promesa para resolver y finalizar
	await Promise.resolve();
	assert.ok(hasTextContent(button, "Count: 1"), "el conteo no es 1 después del primer click");
	fireEvent.click(button);
	await Promise.resolve();
	assert.ok(hasTextContent(button, "Count: 2"), "el conteo no es 2 después del segundo click");
});

testCounter.run();
```
