---
title: Empezando
description: Una guía sobre cómo empezar con Solid.
sort: 0
---

# Empezando

## Intenta Solid

Con mucho, la forma más fácil de comenzar con Solid es probándolo en línea. Nuestro REPL en https://playground.solidjs.com es la forma perfecta de probar ideas. Como es https://codesandbox.io/ donde puedes modificar cualquiera de [nuestros Ejemplos](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md).

Alternativamente, pedes usar nuestras simples templates de [Vite](https://vitejs.dev/) ejecutando estos commandos en tu terminal:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

O para TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

## Aprende Solid

Solid se trata de pequeñas piezas componibles que sirven como bloques para aplicaciones. Estas piezas son en su mayoría funciones que componen muchos APIs de alto nivel. Afortunadamente, no se necesitará conocer la mayoría de ellos pa comenzar.

Los dos tipos principales de bloques que tienen a su disposición son Componentes y Primitivas Reactivas.

Los componentes son funciones que aceptan un objeto props y devuelven elementos JSX, incluyendo elementos DOM nativos, y otros componentes. Pueden ser expresados como elementos JSX en PascalCase:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Los componentes son livianos en el sentido de que no tienen estado en sí mismos y no tienen instancias. En cambio, sirven como funciones de fábrica para elementos DOM y primitivas reactivas.

La reactividad de grano fino de Solid se basa en 3 primitivas simples: Signals, Memos, and Effects. Juntos, forman un motor de sincronización de seguimiento automático que garantiza que su vista se mantenga actualizada. Los cálculos reactivos toman la forma de expresiones simples envueltas en funciones que se ejecutan de forma sincrónica.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Puedes aprender más sobre la [Reactividad de Solid](#reactivity) y la [Representación de Solid](#rendering).

## Piensa Solid

El diseño de Solid tiene varias opiniones sobre qué principios y valores nos ayudan a construir sitios de web y aplicaciones mejor. Es más fácil aprender y usar Solid cuando se conoce la filosofía que hay detrás.

### 1. Datos Declarativos

Los datos declarativos son la práctica de vincular la descripción del comportamiento de los datos a su declaración. Esto permite una composición fácil al empaquetar todos los aspectos del comportamiento de los datos en un solo lugar.

### 2. Desvanecimiento de Componentes

Ya es bastante difícil estructurar sus components sin tener en cuenta la actualizaciones. Las actualizaciones de Solid completamente independientes de los componentes. Las funciones componentes se llaman una vez y luego dejan de existir. Los componentes existen para organizar su código y no mucho más.

### 3. Leer/Escribir Segregación

El control y la previsibilidad precisos hacen que los sistemas sean mejores. No necesitamos una verdadera inmutabilidad para hacer cumplir el flujo unidireccional, solo la capacidad de tomar la decisión consciente que los consumidores pueden escribir y cuáles no.

### 4. Simple es mejor que fácil

Una lección que resulta difícil para la reactividad de grano fino. Las convenciones explícitas y coherentes, incluso si requieren más esfuerzo, valen la pena. El objetivo es proporcionar herramientas mínimas que sirven como base para construir.

## Web Components

Solid nació con el deseo de tener Web Components como cuidadanos de primer nivel. Con el tiempo su diseño ha evolucionado y los objetivos han cambiado. Sin embargo, Solid sigue siendo una excelente manera de crear Web Components. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) les permite escribir y ajustar los componentes de funcion de Solid para producir Web Components pequeños y de alto rendimiento. Dentro de las aplicaciones de Solid, Solid Element puede sequir aprovechando el API de contexto de Solid, y los portales de Solid son compatibles con el estilo aislado de Shadow DOM.

## Server Rendering

Solid tiene una solución de renderización dinámica del lado del servidor que permite una experiencia de desarrollo verdaderamente isomórfica. Mediante el uso de nuestra primitiva de recursos, las solicitudes de datos asíncronos se realizan fácilmente, y lo que es más importante es que se serializan y sincronizan automáticamente entre el cliente y el navegador.

Dado que solid admite renderizado asíncrono y de flujo en el servidor, puedes escribir tu código de una manera y hacer que se ejecute en el servidor. Esto significa que características como [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) y la división de código simplemente funciona en Solid.

Para más información, lee [Server guide](#server-side-rendering).

## No Compilacion?

No te gusta JSX? ¿No te importa hacer trabajo manual para envolver expresiones, peor rendimiento, y tener tamaños de paquete más grandes? Alternativaente, puedes crear una aplicación Solid usando Tagged Template Literals o HyperScript en entornos no compilados.

Puedes ejecutar directamente desde el navegador usando [Skypack](https://www.skypack.dev/):

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

Recuerda que todavía necesitas la biblioteca de expresiones DOM correspondientes para que esto funcione con TypeScript. Puedes usar Tagged Template Literals con [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) o HyperScript con [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
