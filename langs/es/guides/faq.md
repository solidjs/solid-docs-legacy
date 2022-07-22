# FAQ

### ¿JSX sin un DOM virtual? ¿Es esto un vaporware? He escuchado voces prominentes decir que esto no es posible.

Es posible cuando no tienes el modelo de actualización de React. JSX es un lenguaje de plantillas como los de Svelte o Vue, solo que es más flexible en ciertos aspectos. Insertar arbitrariamente JavaScript a veces puede ser un desafío, pero no es diferente a admitir spread operators. Entonces, no: esto no es vaporware, sino un enfoque que ha demostrado ser uno de los más eficaces.

El verdadero beneficio viene en cuán extensible es. Tenemos un compilador trabajando para ti para brindarte actualizaciones DOM nativas óptimas, pero tienes toda la libertad de una biblioteca como React. Puede escribir componentes utilizando técnicas estándar como [render props](https://reactjs.org/docs/render-props.html) y componentes de orden superior junto con sus "ganchos" reactivos. ¿No le gusta cómo funciona el flujo de control de Solid? Escribe el tuyo.

### ¿Por qué Solid es tan eficaz?

Desearíamos poder señalar una sola cosa, pero en realidad es la combinación de varias decisiones de diseño importantes:

1. Reactividad explícita, por lo que solo se rastrean las cosas que deberían ser reactivas.
2. Compilación con la creación inicial en mente. Solid usa heurística y combina las expresiones correctas para reducir la cantidad de computaciones, pero mantiene las actualizaciones clave granulares y eficientes.
3. Las expresiones reactivas son solo funciones. Esto habilita "componentes que desaparecen" con evaluación perezosa de props eliminando envoltorios innecesarios y sobrecarga de sincronización.

Actualmente estas son las técnicas únicas que en combinación le dan a Solid una ventaja sobre la competencia.

### ¿Existe React-Compat, o alguna forma de usar mis bibliotecas React en Solid?

No. Y probablemente nunca lo habrá. Si bien las API son similares y los componentes a menudo se pueden mover con ediciones menores, el modelo de actualización es fundamentalmente diferente. React Components se procesan una y otra vez, por lo que el código fuera de los Hooks funciona de manera muy diferente. Las reglas de closure y hooks no solo son innecesarias en Solid: pueden prescribir código que no funciona aquí.

Vue-compat por otro lado, eso sería factible; aunque no hay planes para implementarlo actualmente.

### ¿Por qué no debería usar `map` en mi plantilla y cuál es la diferencia entre `<For>` e `<Index>`?

Si su array es estático, no hay nada de malo en usar map. Pero si está recorriendo una señal o una propiedad reactiva, `map` es ineficiente: si el array cambia por algún motivo, _el mapa completo_ se volverá a ejecutar y todos los nodos se volverán a crear.

Tanto `<For>` como `<Index>` proporcionan una solución de bucle que es más inteligente que esta. Acoplan cada nodo renderizado con un elemento del array, de modo que cuando cambia un elemento en el array, solo se volverá a renderizar el nodo correspondiente.

`<Index>` hará esto _by index_: cada nodo corresponde a un index del array; `<For>` hará esto _by value_: cada nodo corresponde a un dato del array. Por eso, el callback, `<Index>` le da una señal para el item: el index de cada elemento se considera fijo, pero los datos en ese index pueden cambiar. Por otro lado, `<For>` le da una señal para el index: el contenido del elemento se considera fijo, pero puede moverse si los elementos se mueven en el array.

Por ejemplo, si se intercambian dos elementos del array, `<For>` reubicará los dos nodos DOM correspondientes y actualizará sus señales `index()` en el camino. `<Index>` no cambiará la posición de ningún nodo DOM, pero actualizará las señales `item()` para los dos nodos DOM y hará que se vuelvan a renderizar.

Para ver una demostración detallada de la diferencia, consulte [este segmento](https://www.youtube.com/watch?v=YxroH_MXuhw&t=2164s) del stream de Ryan.

### ¿Por qué pierdo reactividad cuando uso desestructuración en el objeto props?

Con un objeto props, la reactividad se da gracias al seguimiento de acceso a una propiedad.
Si accedes a una propiedad dentro de un _tracking scope_,
como una expresión JSX o un efecto, entonces, la expresión JSX se volverá a renderizar o el efecto se volverá a ejecutar cuando esa propiedad cambie.

En este ejemplo, el acceso a la propiedad ocurre dentro de un template JSX, por lo tanto, se le realiza un seguimiento y el contenido del texto es actualizado cuando la señal cambia:

```jsx
function TextoAzul(props) {
  return (
    <span style="color: blue">{props.text}</span>
  );
}
...
<TextoAzul text={mySignal()}/>
```

Pero en ningúno de estos ejemplos se actualiza el texto debido a que la propiedad se accede por fuera del template:

```jsx
function TextoAzul(props) {
  const text = props.text;
  return (
    <span style="color: blue">{text}</span>
  );
}
...
<TextoAzul text={mySignal()}/>
```

```jsx
function TextoAzul({text}) {
  return (
    <span style="color: blue">{text}</span>
  );
}
...
<TextoAzul text={mySignal()}/>
```

Si prefieres usar desestructuración, existen dos plugins de Babel que permiten usar reactividad y desestructuración: [babel-plugin-solid-undestructure](https://github.com/orenelbaum/babel-plugin-solid-undestructure)
y [Solid Labels'](https://github.com/LXSMNSYC/solid-labels) [object features](https://github.com/LXSMNSYC/solid-labels/blob/main/docs/ctf.md#objects).

### ¿Por qué mi controlador de eventos `onChange` no se activa a tiempo?

En algunos marcos, el evento `onChange` para las entradas se modifica para que se active con cada pulsación de tecla. Pero no es así como el evento `onChange` [funciona de forma nativa] (https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onchange): está destinado a reflejar un cambio _entregado_ al input y generalmente se disparará cuando el input pierda el foco. Para manejar todos los cambios en el valor de un input, utilice `onInput`.

### ¿Puede agregar soporte para componentes de clase? Encuentro que los ciclos de vida son más fáciles de razonar.

No tenemos la intención de admitir componentes de clase. Los ciclos de vida de los componentes de Solid están vinculados a la programación del sistema reactivo y son artificiales. Podría crear una clase a partir de él, pero efectivamente todo el código del controlador que no es de eventos se ejecutaría en el constructor, incluida la función de renderizado. Es solo más sintaxis como excusa para hacer que sus datos sean menos granulares.

Agrupe los datos y sus comportamientos juntos, en lugar de ciclos de vida. Esta es una mejor práctica reactiva que ha funcionado durante décadas.

### Realmente no me gusta JSX, ¿hay alguna posibilidad de un lenguaje de plantilla diferente? Ah, veo tienes Tagged Template Literal/HyperScript. Tal vez use esos...

no Detente ahí mismo. Usamos JSX de la misma manera que Svelte usa sus plantillas, para crear instrucciones DOM optimizadas. Las soluciones Tagged Template Literal e HyperScript pueden ser realmente impresionantes por derecho propio, pero a menos que tenga una razón real como un requisito de no compilación, son inferiores en todos los sentidos. Paquetes más grandes, rendimiento más lento y la necesidad ajustes manuales para envolver los valores.

Es bueno tener opciones, pero JSX de Solid es realmente la mejor solución en este caso. Una plantilla DSL también sería excelente, aunque más restrictiva, pero JSX nos brinda mucho y de forma gratuita. Analizadores existentes como, Resaltado de sintaxis, Prettier, Autocompletado de Código y, por último, pero no menos importante, TypeScript.

Otras bibliotecas han estado agregando soporte para estas funciones, pero eso ha sido un esfuerzo enorme y aún es imperfecto y en mantenimiento un dolor de cabeza constante. Esto es realmente tomar una postura pragmática.

### ¿Cuándo uso Signal vs Store? ¿Por qué son diferentes?

Las stores envuelven automáticamente los valores anidados, lo que lo hace ideal para estructuras de datos profundas y para cosas como modelos. Para la mayoría de las otras cosas, las signals son livianas y hacen el trabajo maravillosamente.

Por mucho que nos encantaría envolverlos juntos como una sola cosa, no puede usar proxy para los primitivos. Las funciones son la interfaz más simple y cualquier expresión reactiva (incluido el acceso de estado) se puede envolver en una al transportarse por lo que proporciona una API universal. Puede nombrar sus signals y estado como elija y se mantiene mínimo. Lo último que nos gustaría hacer es forzar a escribir `.get()` `.set()` en el usuario final o incluso peor `.value`. Al menos, el primero puede tener un alias para mantenerlo breve, mientras que el segundo es solo la forma menos concisa de llamar a una función.

### ¿Por qué no puedo simplemente asignar un valor a Solid's Store como puedo hacerlo en Vue, Svelte o MobX? ¿Dónde está el enlace bidireccional?

La reactividad es una herramienta poderosa pero también peligrosa. MobX lo sabe e introdujo el modo estricto y las acciones para limitar dónde y cuándo ocurren las actualizaciones. En Solid, que se ocupa de árboles completos de datos de componentes, se hizo evidente que podemos aprender algo de React aquí. No necesita ser realmente inmutable siempre que proporcione los medios para tener el mismo contrato.

Podría decirse que poder pasar la capacidad de actualizar el estado es incluso más importante que decidir pasar el estado. Entonces, poder separarlo es importante, y solo es posible si la lectura es inmutable. Tampoco necesitamos pagar el costo de la inmutabilidad si aún podemos actualizar granularmente. Afortunadamente, hay toneladas de arte previo aquí entre ImmutableJS e Immer. Irónicamente, Solid actúa principalmente como un Immer inverso con sus componentes internos mutables y su interfaz inmutable.

### ¿Puedo usar la reactividad de Solid por sí sola?

Por supuesto. Si bien no hemos exportado un paquete independiente, es fácil instalar Solid sin el compilador y solo usar las primitivas reactivas. Uno de los beneficios de la reactividad granular es que es independiente de la biblioteca. De hecho, casi todas las bibliotecas reactivas funcionan de esta manera. Eso es lo que inspiró [Solid](https://github.com/solidjs/solid) y su [biblioteca subyacente DOM Expressions](https://github.com/ryansolid/dom-expressions) en primer lugar para hacer un renderizador exclusivamente del sistema reactivo.

Para enumerar algunos para probar: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github .com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https: //github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous), e incluso recientemente [Vue ](https://github.com/vuejs/vue). Se necesita mucho más para crear una biblioteca reactiva que etiquetarla en un renderizador como [lit-html](https://github.com/Polymer/lit-html), por ejemplo, pero es una buena manera de hacerse a la idea.

### ¿Solid tiene Next.js o Material Components como biblioteca que pueda usar?

Estamos trabajando en [SolidStart](https://github.com/solidjs/solid-start), que está en nuestra solución SSR para empezar similar a Next.js o SvelteKit.

En cuanto a librerías de componentes, tenemos [SUID](https://suid.io/) para Material, [Hope UI](https://hope-ui.com/) para soluciones similares a Chakra, [Solid Bootstrap](https://solid-libs.github.io/solid-bootstrap/) y muchas más. Echale un vistazo a nuestro [creciente ecosistema de librerías y herramientas](https://www.solidjs.com/ecosystem).

Si estás interesado en construir tu propio ecosistema de herramientas, estamos disponibles en nuestro [Discord](https://discord.com/invite/solidjs), donde puedes sumarte a los esfuerzos para ecosistemas existentes o comenzar el tuyo.

¡Están en proceso! Si está interesado en construir uno, estamos disponibles en nuestro [Discord] (https://discord.com/invite/solidjs), donde puede unirse a los esfuerzos del ecosistema existente o comenzar el suyo propio.
