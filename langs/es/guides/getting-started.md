---
title: Empezando
description: Una guía sobre cómo empezar con Solid.
sort: 0
---

# Empezando

## Prueba Solid

Por mucho, la forma mas fácil de empezar con Solid es probarlo online. Nuestro REPL en https://playground.solidjs.com es el lugar perfecto para probar ideas. Igual que https://codesandbox.io/ donde puedes modificar cualquiera de [nuestros Ejemplos](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md).

Otra alternativa es usar nuestros [templates Vite](https://github.com/solidjs/templates) corriendo los siguientes comandos en tu terminal:

```sh
> npx degit solidjs/templates/js nombre-app
> cd nombre-app
> npm i # o yarn o pnpm
> npm run dev # o yarn o pnpm
```

Si necesitas TypeScript:

```sh
> npx degit solidjs/templates/ts nombre-app
> cd nombre-app
> npm i # o yarn o pnpm
> npm run dev # o yarn o pnpm
```

## Aprende Solid

Solid es todo sobre pequeñas piezas componibles que sirven como bloques de construcción de aplicaciones. Estas piezas son en su mayoría funciones que componen muchas API's top-level. Afortunadamente, tu no necesitas conocer la mayoría para empezar.

Los dos tipos principales de bloques de construcción que tienes a tu disposición son Componentes y Primitivos Reactivos.

Los Componentes son funciones que aceptan un objeto de propiedades o props y retornan elementos JSX incluyendo elementos nativos del DOM y otros componentes. Pueden ser representados como elementos JSW en PascalCase

```jsx
function MiComponente(props) {
	return <div>Hola {props.nombre}</div>;
}

<MyComponent nombre='Solid' />;
```

Los componentes son muy ligeros dado que no tienen estado y no tienen instancias. En cambio, sirven como fábrica de funciones para elementos del DOM y Primitivos Reactivos.

La reactividad finamente detallada de Solid está construida en 3 simples primitivos: Signals, Memos y Effects. Juntos, forman un motor de auto-rastreo sincronizado que se asegura de que tus vistas se mantengan actualizadas. Las computaciones reactivas toman la form de simples expresiones envueltas en funciones que se ejecutan de forma sincronizada.

```js
const [nombre, setNombre] = createSignal("JSON");
const [apellido, setApellido] = createSignal("Bourne");

createEffect(() => console.log(`${nombre()} ${apellido()}`));
```

Puedes aprender mas sobre [Reactividad Solid](/guides/reactivity) y [Renderizado Solid](/guides/rendering).

## Piensa Solid

El diseño de Solid tiene varias opiniones sobre que principios y valores nos ayudan mas a construir sitios web y aplicaciones. Es mas fácil aprender y usar Solid cuando estás al tanto de la filosofía detrás.

### 1. Datos Declarativos

Los datos declarativos es la practica de atar la descripción del comportamiento de los datos a su declaración. Esto permite una composición fácil al envolver de todos los aspectos del comportamiento de los datos en un solo lugar.

### 2. Desaparición de Componentes

Ya es lo suficientemente duro tener que estructurar tus componentes sin tomar en cuenta las actualizaciones. Las actualizaciones de Solid son completamente independientes de los componentes. Las funciones de componentes son llamadas una sola vez y dejan de existir. Los componentes existen para organizar tu código y poco mas.

### 3. Segregación de Lectura/Escritura

Control preciso y predictibilidad permiten mejores sistemas. No necesitamos verdadera inmutabilidad para forzar flujo unidireccional, solo la habilidad de hacer decisiones conscientes de que clientes pueden escribir y cuales no podrán.

### 4. Simple es mejor que fácil

Una lección que puede seguir a la reactividad finamente detallada. Convenciones explicitas y consistentes incluso si requieren mas esfuerzo, valen la pena. La meta es proveer herramientas mínimas para servir de base sobre la cual construir.

## Web Components

Solid nació con el deseo de tener Web Components como ciudadanos de primera clase. Con el tiempo su diseño ha evolucionado y las metas cambiado. Sin embargo, Solid sigue siendo una gran forma de escribir Web Components. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) te permite escribir y envolver componentes funcionales de Solid para producir pequeños y eficaces Web Components. Dentro de las apps Solid, Solid Element es capaz de aprovechar el API Context de Solid y los Portals Solid soportan estilizado isolado del Shadow DOM.

## Renderizado de Servidor

Solid tiene una solución dinámica de renderizado de servidor que habilita una experiencia de desarrollo verdaderamente isomorfa. Mediante el uso de nuestros recursos primitivos, las peticiones asíncronas de datos son hechas fácilmente y aún mas importante, automáticamente serializadas y sincronizadas entre el cliente y el navegador.

Ya que Solid soporta renderizado asíncrono y streameable en el servidor, puedes escribir tu código de una forma y ejecutarlo en el servidor. Esto significa que funciones como [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) y separación de código simplemente funcionan en Solid.

Para mas información, lee la [Guía de Servidor](/guides/server#server-side-rendering).

## Sin compilar?

Te desagrada JSX? No te molesta hacer trabajo manual para envolver expresiones, experimentando un peor desempeño, tener tamaños de bundle mas grandes? Alternativamente, puedes crear una App Solid usando Tagged Template Literals o HyperScript en entornos no compilados.

Puedes ejecutarlos directo en el navegador usando [Skypack](https://www.skypack.dev/):

```html
<html>
	<body>
		<script type="module">
			import { createSignal, onCleanup } from "https://cdn.skypack.dev/solid-js";
			import { render } from "https://cdn.skypack.dev/solid-js/web";
			import html from "https://cdn.skypack.dev/solid-js/html";

			const App = () => {
				const [contador, setContador] = createSignal(0),
					timer = setInterval(() => setCount(count() + 1), 1000);
				onCleanup(() => clearInterval(timer));
				return html`<div>${contador}</div>`;
			};
			render(App, document.body);
		</script>
	</body>
</html>
```

Recuerda que aún necesitaras la correspondiente librería de expresiones DOM para que estos funciones con TypeScript. Puedes usar Tagged Template Literals con [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) o HyperScript usando [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
