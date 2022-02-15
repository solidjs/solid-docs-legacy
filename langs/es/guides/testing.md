---
title: Testeando Solid
description: Como realizar pruebas a tu app Solid
sort: 4
---

# Testeando Solid

Para usar su código Solid en producción, necesita probarse. Como no desea probar todo manualmente, necesita pruebas automatizadas. Probar el código sólido puede ser simple, una vez que haya configurado todo y conozca algunos patrones útiles para las pruebas.

## Configuración de pruebas

Antes de configurar las pruebas, debe elegir su framework de pruebas. Hay una gran cantidad de opciones, pero nos centraremos en dos proyectos muy diferentes que son extremos opuestos, jest y uvu. Jest está fuertemente integrado, uvu solo trae lo básico necesario. Si desea utilizar otro corredor de pruebas, la configuración de uvu debería funcionar para la mayoría de los demás framework de pruebas.

### Configurando Jest

Desafortunadamente, aunque esté integrado, jest no admitirá esm o typescript de forma inmediata, sino que necesita configurar su transformador.

Las opciones principales son solid-jest, que usa babel para transformar el código de Solid, omitiendo las comprobaciones de tipo al probar si se usa TypeScript, y ts-jest, que usa el compilador de TypeScript y comprueba los tipos dentro de las pruebas.

Si no está utilizando TypeScript, use solid-jest; de lo contrario, elija si desea verificar los tipos mientras ejecuta sus pruebas o no.

#### Usando solid-jest

Instala las dependencias requeridas:

```sh
> npm i --save-dev jest solid-jest # o yarn add -D o pnpm
```

Para TypeScript:

```sh
> npm i --save-dev jest solid-jest @types/jest # o yarn add -D o pnpm
```

A continuación, debe definir su `.babelrc` si aún no lo ha hecho:

```js
{
  "presets": [
    "@babel/preset-env",
    "babel-preset-solid",
    // solo si usas TS con solid-jest
    "@babel/preset-typescript"
  ]
}
```

Y modifique su `package.json` para que se vea así:

```js
{
  "scripts": {
    // tus otros scripts van aquí
    "test": "jest"
  },
  "jest": {
    "preset": "solid-jest/preset/browser",

    // inserte archivos de configuración y otras configuraciones
  }
}
```

#### Usando ts-jest

Para usar ts-jest, necesitas instalarlo primero:

```sh
> npm i --save-dev jest ts-jest @types/jest # o yarn add -D o pnpm
```

Y después configurarlo en `package.json`:

```js
{
  "scripts": {
    // tus otros scripts van aquí
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "globals": {
      "ts-jest": {
        "tsconfig": "tsconfig.json",
        "babelConfig": {
          "presets": [
            "babel-preset-solid",
            "@babel/preset-env"
          ]
        }
      }
    },
    // inserte archivos de configuración y otras configuraciones
    // probablemente quieras realizar las pruebas en modo navegador:
    "testEnvironment": "jsdom",
    // desafortunadamente, solid no puede detectar el modo navegador aquí,
    // así que necesitamos indicarle las versiones correctas:
    "moduleNameMapper": {
      "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
      "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs"
    }
    // los usuarios de windows tienen que reemplazar "/" con "\"
  }
}
```

### TypeScript y Jest

Dado que jest está inyectando sus instalaciones de prueba en el ámbito global, debe cargar sus tipos en tsconfig.json para satisfacer el compilador de TypeScript:

```js
{
  // parte de tsconfig.json
  "types": ["jest"]
}
```

Esto requiere la instalación de `@types/jest` como se mencionó anteriormente.

### Configurando uvu

Primero, necesita instalar los paquetes requeridos:

```sh
> npm i --save-dev uvu solid-register jsdom # o yarn add -D o pnpm
```

Then setup your test script in `package.json`:

```sh
> npm set-script test "uvu -r solid-register"
```

Se pueden agregar archivos de configuración adicionales a través de `-r setup.ts`, ignore los que no son pruebas con `-i not-a-test.test.ts`.

### Informes de cobertura

Si desea verificar la cobertura de código de sus pruebas, la herramienta favorita para uvu es c8. Para instalarlo y configurarlo, ejecute:

```sh
> npm i --save-dev c8 # o yarn add -D o pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

Ahora, si ejecutas `npm run test:coverage`, verá la cobertura de la prueba.

Si desea buenos informes de cobertura en HTML, puede

### Modo Watch

Ni `uvu` ni `tape` tienen un modo watch listo para usar, pero puedes usar `chokidar-cli` para hacer lo mismo:

```sh
> npm i --save-dev chokidar-cli # o yarn add -D o pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx instead of .ts/.tsx
```

Ahora, si ejecuta `npm run test:watch`, las pruebas se ejecutarán cada vez que cambie un archivo.

### solid-testing-library

Si desea probar componentes, definitivamente debe instalar `solid-testing-library`:

```sh
> npm i --save-dev solid-testing-library # o yarn add -D o pnpm
```

Esto le permite renderizar sus componentes, disparar eventos y seleccionar elementos desde la perspectiva del usuario.

### @testing-library/jest-dom

Si estás usando jest, `solid-testing-library` funciona muy bien con `@testing-library/jest-dom`:

```sh
> npm i --save-dev @testing-library/jest-dom # o yarn add -D o pnpm
```

E importe las extensiones esperadas en un archivo de instalación:

```ts
// test/jest-setup.ts
import "@testing-library/jest-dom/extend-expect";
```

Y carga eso en jest usando la siguiente entrada en package.json:

```js
{
  "jest": {
    // tus otros settings aquí
    setupFiles: ["@testing-library/jest-dom/extend-expect", "regenerator-runtime"]
  }
}
```

Tampoco olvides incluir los types en `tsconfig.json`:

```js
{
  // parte de tsconfig.json
  "types": ["jest", "@testing-library/jest-dom"]
}
```

### solid-dom-testing

Si está utilizando otro framework de prueba como uvu o tape, hay algunos helpers de afirmación en `solid-dom-testing` que admiten afirmaciones similares:

```sh
> npm i --save-dev solid-dom-testing # o yarn add -D o pnpm
```

No se requiere configuración, puedes simplemente importar y usar los helpers en sus pruebas como mejor le parezca.

## Patrones de Prueba y Mejores Prácticas

Ahora que ha instalado sus herramientas de prueba, debe comenzar a usarlas. Para hacer esto más fácil, Solid admite algunos patrones agradables.

### Prueba de estado reactivo

Es posible que desee mantener partes de su estado separadas de los componentes para facilitar el mantenimiento o poder admitir múltiples vistas. En este caso, la interfaz contra la que estarás probando es el propio estado. Tenga en cuenta que fuera de una [raíz reactiva] (https://www.solidjs.com/docs/latest/api#createroot) no se realiza un seguimiento del estado y las actualizaciones no dispararán efectos ni memos.

Además, dado que los efectos se activan asincrónicamente, puede ser útil envolver nuestras afirmaciones en un efecto final. Alternativamente, para observar una secuencia de efectos sobre múltiples cambios, puede ayudar retornar las herramientas necesarias desde `createRoot` y ejecutarlas en una función de prueba asíncrona (ya que `createRoot` en sí no puede tomar una función `asíncrona`).

Como ejemplo, probemos `createLocalStorage` del [ejemplo de tareas pendientes](https://www.solidjs.com/examples/todos):

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

Definitivamente deberías instalar `solid-testing-library`, si aún no lo has hecho. Sus helpers más importantes son `render` para representar un componente en el dom de forma controlada, `fireEvent` para enviar eventos de forma que se asemeje a los eventos reales del usuario y `screen` para proporcionar selectores globales. Si usa jest, también debe instalar `@testing-library/jest-dom` y configurarlo para que tenga algunas afirmaciones útiles; de lo contrario, instale `solid-dom-testing` como se describe anteriormente.

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
