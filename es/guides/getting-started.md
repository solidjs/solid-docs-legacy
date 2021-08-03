---
title: Empezando
description: Una guia sobre como comenzar con Solid.
sort: 0
---

# Empezando

## Probando Solid

Una de las mejores maneras de comenzar con Solid es probarlo online. Nuestro REPL en https://playground.solidjs.com es la manera perfecta de probar algunas ideas. Asi como tambien https://codesandbox.io/ donde puedes modificar cualquiera de nuestros ejemplos.

Como alternativa, puedes probar una de nuestras simples plantillas en [Vite](https://vitejs.dev) corriendo estos comandos en tu terminal:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # o yarn o pnpm
> npm run dev # o yarn o pnpm
```

O con TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # o yarn o pnpm
> npm run dev # o yarn o pnpm
```

## Aprendiendo Solid

Solid se trata de pequeños modulos que sirven como bloques de construccion para aplicaciones. Estas piezas son, en su mayor parte, funciones que componen multiples APis superficiales. Afortunadamente no hace falta conocer mucho sobre estas funciones para comenzar.

Los dos tipos de bloques de construccion que tienes a disposicion son Componentes y Primitivos Reactivos.

Los componentes son funciones que aceptan un objeto props y devuelven elementos JSX incluyendo elementos nativos del DOM asi como otros componentes. Estos componentes pueden ser expresados como Elementos JSX en PascalCase:

```jsx
function MyComponent(props) {
  return <div>Hola {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Los componentes son livianos en el sentido de que no tienen estado por ellos mismos asi como tampoco tienen instancias. En lugar de eso, ellos sirven como funciones fábrica para elementos del dom y primitivas reactivas.

La reactividad granualar de Solid esta construida sobre 3 simples primitivas: Señales, Memos y Efectos.
Juntas, forman un motor de sincronizacion que detecta automaticamente los cambios y se encarga de que tus vistas siempre se mantengan al dia. Los computos reactivos toman forma de simples expresiones envueltas por funciones que se ejecutan sincronicamente.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Para profundizar estos conocimientos puedes visitar [Reactividad en Solid](https://www.solidjs.com/docs/latest#reactivity) y [Renderizado en Solid](https://www.solidjs.com/docs/latest#rendering)

## Pensando Solido

El diseño de Solid lleva muchas opiniones sobre que principios y valores son mas utiles a la hora de construir sitios web y aplicaciones. Es mas facil aprender y usar Solid cuando eres conciente sobre la filosofia que lo acompaña.

### 1. Datos declarativos

Cuando hablamos de datos declarativos hablamos de la practica de escribir una descripcion de los datos en su declaracion. Esto produce un empaquetamiento de todos los aspectos de esos datos en un solo lugar.

### 2. Componentes efimeros

Estructurar tus componentes ya es lo suficientemente dificil sin tomar en consideracion las actualizaciones de los mismos. Por eso en Solid las actualizaciones son completamente independientes de sus componentes. Las funciones de los componentes son llamadas una sola vez y para luego dejar de existir. En resumen, los componentes existen para organizar tu codigo y no mucho mas.

### 3. Segregacion de Lectura/Escritura

La predictibilidad y un control preciso hacen mejores sistemas. No necesitamos una inmutabilidad pura para forzar flujos unidireccionales, solo la habilidad para tomar la decision conciente sobre que los consumidores pueden escribir y que no.

### 4. Simplicidad es mejor que facilidad

Una leccion que golpea duro con la reactividad granular. Las convenciones explicitas y concisas valen la pena incluso si requieren mayor esfuerzo. Apuntamos a proveer herramientas minimalistas que sirvan como base para construir sobre ellas.

## Web Components

Solid nacio con el deseo de tener Web Components como ciudadanos de primera clase. Con el tiempo su diseño evoluciono y los objetivos fueron cambiando. Sin embargo, Solid sigue siendo una muy buena manera de construir Web Components. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) permite escribir y envolver un componente funcional de Solid para producir pequeños y performantes Web Components. Dentro de aplicaciones Solid, los elementos Solid pueden seguir usando la API de contexto Solid y los portales Solid, para dar soporte al estilizado de Shadow DOM en aislamiento.

## Renderizado en servidor

Solid provee una solucion de renderizado dinamico en servidor que permite una verdadera experiencia de desarrollo isomorfico. A traves del uso de nuestros recursos primitivos, solicitudes de datos asincronas son faciles de desarrollar y, mas importante, son automaticamente serializadas y sincronizadas entre el cliente y el navegador.

Ya que solid soporta la renderizacion asyncrona y por flujos en el servidor, Solid te permite escribir tu codigo de una forma y ejecutarlo directamente en el servidor. Esto significa que funcionalidades como [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) y division de codigo simplemente funcionan en Solid.

Para mas informacion, consulta la [Guia de servidor](https://www.solidjs.com/docs/latest#server-side-rendering).

## Sin compilacion?

No te gusta JSX? No te importa realizar trabajo manual para envolver expresiones, perder rendimiento, y tener paquetes enormes en tamaño? Alternativamente, puedes crear una aplicacion en Solid utilizando plantillas literales o HyperScript en entornos no compilados.

Puedes correrlo directamente desde el navegador utilizando [Skypack](https://www.skypack.dev/):

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

Recuerda que necesitas la libreria de expresiones DOM correspondientes para que estas funcionen con Typescript. Puedes utilizar plantillas literales con [Lit Dom Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) o HyperScript con [Hyper Dom Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
