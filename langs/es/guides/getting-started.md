# Empezando

**Estamos trabajando en una nueva documentación. Puedes echar un vistazo a nuestro nuevo tutorial para principiantes [aquí](https://docs.solidjs.com/guides/getting-started-with-solid/welcome), y unete a nuestros esfuerzos en [Discord!](http://discord.com/invite/solidjs)

## Mira Solid

Para revisiones rápidas sore los conceptos principales de Solid, mira lo siguiente:
- [Solid en 100 segundos](https://youtu.be/hw3Bx5vxKl0)
- [Reactividad de Solid en 10 minutos](https://youtu.be/J70HXl1KhWE)

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

O puedes instalar las dependencias en tu propio proyecto. Para usar Solid con JSX (recomendado), neceistarás instalar la librería `solid-js` de NPM y el [compilador de Solid JSX](https://github.com/ryansolid/dom-expressions/tree/main/packages/babel-plugin-jsx-dom-expressions) para babel:

```sh
> npm install solid-js babel-preset-solid
```

Luego, agrega `babel-preset-solid` a tu `.babelrc`, o a tu configuración de Babel en webpack o:

```json
"presets": ["solid"]
```

Para TypeScript, configura tu `tsconfig.json` para manejar el JSX provisto por Solid de la siguiente manera (mira la [guía de TypeScript](https://www.solidjs.com/guides/typescript) para más detalles):

```json
"compilerOptions": {
  "jsx": "preserve",
  "jsxImportSource": "solid-js",
}
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

## Opciones sin compilar

Si necesitas o prefieres usar Solid en un entorno sin compilar, como archivos HTML, https://codepen.io, etc, puedes usar [` html`` ` Tagged Template Literals](https://github.com/solidjs/solid/tree/main/packages/solid/html) o [HyperScript `h()` functions](https://github.com/solidjs/solid/tree/main/packages/solid/h) usando JavaScript puro en lugar de la sintaxis JSX optimizada de Solid.

Puedes ejecutarlos directo en el navegador usando [Skypack](https://www.skypack.dev/):

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
        // o
        return h("div", {}, count);
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

Las ventajas de usar Solid sin compilar tiene algunos puntos a considerar:

- Las expresiones siempre tienen que estar contenidas en una función getter o no serán reactivas.
El siguiente ejemplo no se actualizará cuando los valores de `first` ni `last` cambien ya que los valores no están siendo accedidos dentro de un efecto que el template crea internamente, por lo tanto, las dependencias no serán observadas:
  ```js
  html` <h1>Hola ${first() + " " + last()}</h1> `;
  // o
  h("h1", {}, "Hola ", first() + " " + last());
  ```
El siguiente ejemplo se actualizará cómo se espera cuando los valores de `first` o `last` cambien porque el template va a leer dichos valores desde una función getter dentro de un effect y las dependencias se observarán:
  ```js
  html` <h1>Hola ${() => first() + " " + last()}</h1> `;
  // o
  h("h1", {}, "Hola ", () => first() + " " + last());
  ```
La sintaxis JSX de Solid no tiene este problema porque, gracias a sus habilidades en tiempo de compilación, una expresión como `<h1>Hola {first() + ' ' + last()}</h1>` va a ser reactiva.
- Las optimizaciónes en tiempo de build no estarán presentes a diferencia de si usaramos la sintáxis JSX de Solid, lo que significa que la aplicación empezará a correr en un tiempo un poco mayor ya que cada template es compilado en tiempo de ejecución la primera vez que es ejecutado, pero para muchos usos este golpe de rendimiento es casi inperceptible. La velocidad luego de que la aplicación está corriendo va a ser la misma tanto para templates ` html`` ` como para JSX. Las llamadas `h()` siempre serán más lentas debido a la que no se puede analizar estáticamente todas las templates antes de que sean ejecutadas.

Recuerda que aún necesitaras la correspondiente librería de expresiones DOM para que estos funciones con TypeScript. Puedes usar Tagged Template Literals con [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) o HyperScript usando [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
