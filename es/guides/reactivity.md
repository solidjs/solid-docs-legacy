---
title: Reactividad
description: Resumen completo de reactividad de Solid.
sort: 1
---

# Reactividad

La gestión de datos de Solid se basa en un conjunto de primitivas reactivas flexibles que son responsables de todas las actualizaciones. Adopta un enfoque muy similar a MobX o Vue, excepto que nunca cambia su granularidad por un VDOM. Las dependencias se rastrean automáticamente cuando accede sus valores reactivos en su código de efectos y vista JSX.

Las primitivas de Solid vienen en forma de llamadas de `create` que a menudo devuelven tuplas, donde generalmente el primer elemento es una primitiva legible y el segundo es un setter. Es común referirse solo a la parte legible por el nombre primitivo.

Aquí hay un contador de incremento automático básico que se actualiza según la configuración de el Signal de `count`.

```jsx
import { createSignal, onCleanup } from "solid-js";
import { render } from "solid-js/web";

const App = () => {
  const [count, setCount] = createSignal(0),
    timer = setInterval(() => setCount(count() + 1), 1000);
  onCleanup(() => clearInterval(timer));

  return <div>{count()}</div>;
};

render(() => <App />, document.getElementById("app"));
```

## Introduciendo Primitivas

Solid se compone de 3 primitivas primarias, Signal, Memo, y Effect. En su núcleo está el patrón Observer donde los Signals (y Memos) se rastrean envolviendo los Memos y los Effects.

Signals son los primitivos más mas simples. Contienen valor, y funciones para obtener y establecer para que podamos interceptar cuando se leen y escriben.

```js
const [count, setCount] = createSignal(0);
```

Los efectos son funciones que envuelven las lecturas de nuestra señal y se vuelven a ejecutar cada vez que cambia el valor de una señal dependiente. Esto es útil para crear efectos secundarions, como renderizar.

```js
createEffect(() => console.log("The latest count is", count()));
```

Finalmente, Memos son valores derivados almacenados en caché. Comparten las propiedades de Signals y Effects. Rastrea sus propias señales dependientes, se vuelve a ejecutar solo cuando hay cambios, y son señales rastreables en sí mismas.

```js
const fullName = createMemo(() => `${firstName()} ${lastName()}`);
```

## Cómo Funciona

Signals son emisores de eventos que contienen una lista de suscripciones. Notifican a sus suscriptores cada vez que cambia su valor.

Donde las cosas se ponen más interesantes es cómo ocurren estas suscripciones. Solid utiliza el seguimiento automático de dependencias. Las actualizaciones ocurren automáticamente a medida que cambian los datos.

El truco es una pila global en tiempo de ejecución. Antes de que un Effect o Memo ejecute (o vulva a ejecutar) su función proporcionada por el desarrollador, se empuja a esa pila. Luego, cualquier Signal que se lea verifica si hay un oyente actual en la pila, y si es así, agrega el oyente a sus suscripciones.

Puedes pensarlo así:

```js
function createSignal(value) {
  const subscribers = new Set();

  const read = () => {
    const listener = getCurrentListener();
    if (listener) subscribers.add(listener);
    return value;
  };

  const write = (nextValue) => {
    value = nextValue;
    for (const sub of subscribers) sub.run();
  };

  return [read, write];
}
```

Ahora, cada vez que actualizamos la señal, sabemos qué efectos volver a ejecutar. Simple pero efectivo. La implementación real es mucho más complicada, pero esa es la esencia de lo que está sucediendo.

Para una comprensión más detallada de cómo funciona la reactividad, estos son artículos útiles:

[A Hands-on Introduction to Fine-Grained Reactivity](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf)

[Building a Reactive Library from Scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)

[SolidJS: Reactivity to Rendering](https://indepth.dev/posts/1289/solidjs-reactivity-to-rendering)

## Consideraciones

Este enfoque de la reactividad es muy poderoso y dinámico. Puede manejar las dependencias que cambian sobre la marcha mediante la ejecución de diferentes ramas de código condicional. También funciona a través de muchos niveles de indirección. También se realiza el seguimiento de cualquier función ejecutada dentro de un alcance de seguimiento.

Sin embargo, hay algunos comportamientos y compensaciones clave que debemos tener en cuenta.

1. Toda la reactividad se rastrea desde las llamadas a funciones, ya sea directamente u ocultas debajo del captador/proxy y activadas por el acceso a la propiedad. Esto significa que es importante acceder a las propiedades de los objetos reactivos.

2. Los componentes y las devoluciones de llamada de los flujos de control no realizan un seguimiento de los ámbitos y solo se ejecutan una vez. Esto significa que la desestructuración o la ejecución de lógica de nivel superior en sus componentes no se volverán a ejecutar. Debe acceder a estas señales, tiendas y accesorios desde otras primitivas reactivas o que el JSX de esa parte del código se reevalúe.

3. Este enfoque solo realiza un seguimiento sincrónico. Si tienes un setTimeout o usas una función async en tu Effect, el código que se ejecuta async después del hecho no será rastreado.
