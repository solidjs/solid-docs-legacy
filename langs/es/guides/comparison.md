# Comparaciones con otros frameworks

Esta sección no puede escapar a cierto sesgo, pero creo que es importante entender dónde se encuentra la solución de Solid en comparación con otras bibliotecas. Esto no se trata de rendimiento. Para obtener una visión definitiva del rendimiento, no dude en consultar [JS Framework Benchmark] (https://github.com/krausest/js-framework-benchmark).

## React

React ha tenido una gran influencia en Solid. Su flujo unidireccional y segregación explícita de lectura y escritura de su API Hooks orientó a la API de Solid. Más que el objetivo de ser solo una "Biblioteca de renderizado" en lugar de un framework. Solid tiene opiniones fuertes sobre cómo abordar la gestión de datos en el desarrollo de aplicaciones, pero no busca limitar su ejecución.

Sin embargo, por mucho que Solid se alinee con la filosofía de diseño de React, funciona de manera fundamentalmente diferente. React usa un DOM virtual y Solid no. La abstracción de React es una partición de componentes de arriba hacia abajo donde los métodos de renderizado se llaman repetidamente y son diferenciados. Solid, en cambio, representa cada template una vez en su totalidad, construye su reactivo gráfico y solo entonces ejecuta instrucciones relacionadas con cambios de granularidad fina.

#### Consejo para migrar:

El modelo de actualización de Solid no se parece en nada a React, o incluso a React + MobX. En lugar de pensar en los componentes de la función como la función `render`, piense en ellos como un `constructor`.

En Solid, los props y las stores son [objetos proxy] (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) que dependen del acceso a la propiedad para el rastreo y las actualizaciones reactivas. Tenga cuidado con la desestructuración o el acceso temprano a la propiedad, lo que puede generar que estas propiedades pierdan reactividad o se disparen en el momento equivocado.

Los primitivos de Solid no tienen restricciones como las Reglas de Hooks, por lo que puede anidarlas como mejor le parezca.

En las listas no necesitas utilizar keys explícitamente para obtener un comportamiento con `keys`

En React, `onChange` se activa cada vez que se modifica un campo de entrada, pero no es así como `onChange` [funciona de forma nativa](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/ onchange). En Solid, use `onInput` para suscribirse a cada cambio de valor.

Finalmente, no hay VDOM, por lo que las API de VDOM imperativas como `React.Children` y `React.cloneElement` no tienen equivalente en Solid. En lugar de crear o modificar elementos DOM directamente, exprese sus intenciones de forma declarativa.

## Vue

Solid no está particularmente influenciado por Vue en cuanto al diseño, pero son comparables en su enfoque. Ambos usan Proxies en su sistema Reactivo con seguimiento automático basado en lectura. Pero ahí es donde terminan las similitudes. La detección de dependencias de granularidad fina de Vue solo alimenta un DOM virtual y un sistema de componentes menos granulares, mientras que Solid mantiene su granularidad hasta sus actualizaciones directas de DOM.

Vue valora la facilidad donde Solid valora la transparencia. Aunque la nueva dirección de Vue con Vue 3 se alinea más con el enfoque que toma Solid. Estas bibliotecas pueden alinearse más con el tiempo dependiendo de cómo continúen evolucionando.

#### Consejo para migrar:

Como otra biblioteca reactiva moderna migrar desde Vue 3 debería sentirse familiar. Los componentes de Solid son muy parecidos a etiquetar la plantilla al final de la función `setup` de Vue. Tenga cuidado de envolver las derivaciones de estado con computaciones, pruebe una función. La reactividad es generalizada. Los proxies de Solid son intencionalmente de solo lectura. No lo golpees antes de probarlo.

## Svelte

Svelte fue pionera en el marco de desaparición precompilado que Solid también emplea hasta cierto punto. Ambas bibliotecas son realmente reactivas y pueden producir paquetes de código de ejecución realmente pequeños, aunque Svelte es el ganador aquí para demostraciones pequeñas. Solid requiere un poco más de claridad en sus declaraciones, confiando menos en el análisis implícito del compilador, pero eso es parte de lo que le da a Solid un rendimiento superior. Solid también mantiene más en el entorno de ejecución, lo que escala mejor en aplicaciones más grandes. La implementación de demostración RealWorld de Solid es un 25 % más pequeña que la de Svelte.

Ambas bibliotecas tienen como objetivo ayudar a sus desarrolladores a escribir menos código, pero lo abordan de manera completamente diferente. Svelte 3 se centra en la optimización de la facilidad para tratar con cambios localizados centrándose en la interacción de objetos simples y binding bidireccional. En contraste, Solid se enfoca en el flujo de datos adoptando deliberadamente CQRS y una interfaz inmutable. Con una composición de plantillas funcional, en muchos casos, Solid permite a los desarrolladores escribir incluso menos código que Svelte, aunque la sintaxis de la plantilla de Svelte es definitivamente más concisa.

#### Consejo para migrar:

La experiencia del desarrollador es lo suficientemente diferente que, si bien algunas cosas son análogas, es una experiencia muy diferente. Los componentes de Solid son baratos, así que no dudes en tener más.

## Knockout.js

Esta biblioteca debe su existencia a Knockout. La modernización de su modelo para la detección detallada de dependencias fue la motivación de este proyecto. Knockout se lanzó en 2010 y es compatible con Microsoft Explorer hasta IE6, mientras que gran parte de Solid no es compatible con IE en absoluto.

Los enlaces de Knockout son solo cadenas en HTML que se recorren en tiempo de ejecución. Dependen del contexto de clonación ($parent, etc.). Mientras que Solid utiliza JSX o literales de plantillas etiquetadas para crear plantillas y optar por una API de JavaScript.

La mayor diferencia podría ser que el enfoque de Solid para el procesamiento por lotes de cambios garantiza la sincronía, mientras que Knockout tiene deferUpdates, que utiliza una cola de microtareas diferidas.

#### Consejo para migrar:

Si está acostumbrado a Knockout, las primitivas de Solid pueden parecer extrañas. La separación de lectura/escritura es intencional y no solo para hacer la vida más difícil. Busque adoptar un modelo mental de estado/acción (Flux). Si bien las bibliotecas se ven similares, promueven diferentes mejores prácticas.

## Lit & LighterHTML

Estas bibliotecas son increíblemente similares y han tenido cierta influencia en Solid. Principalmente, el código compilado de Solid utiliza un método muy similar para representar inicialmente el DOM de manera eficaz. La clonación de elementos de plantilla y el uso de marcadores de posición de comentarios son algo que Solid y estas bibliotecas comparten.

La mayor diferencia es que, si bien estas bibliotecas no usan Virtual DOM, tratan el renderizado de la misma manera, de arriba hacia abajo, lo que requiere la partición de componentes para mantener las cosas en orden. En contraste, Solid usa su gráfico reactivo de granularidad fina para actualizar solo lo que ha cambiado y, al hacerlo, solo comparte esta técnica para su renderizado inicial. Este enfoque aprovecha la velocidad inicial solo disponible para el DOM nativo y también tiene el enfoque más eficaz para las actualizaciones.

#### Consejo para migrar:

Estas bibliotecas son bastante mínimas y fáciles de construir encima. Sin embargo, tenga en cuenta que `<MyComp/>` no es solo HTMLElement (arreglo o función). Intenta mantener tus cosas en la plantilla JSX. La elevación funciona en su mayor parte, pero es mejor pensar mentalmente en esto como una biblioteca de renderizado y no como una fábrica de HTMLElement.

## S.js

Esta biblioteca tuvo la mayor influencia en el diseño reactivo de Solid. Solid usó S.js internamente durante un par de años hasta que el conjunto de funciones los colocó en caminos diferentes. S.js es una de las bibliotecas reactivas más eficientes hasta la fecha. Modela todo a partir de pasos de tiempo sincrónicos como un circuito digital y garantiza la consistencia sin tener que hacer muchos de los mecanismos más complicados que se encuentran en bibliotecas como MobX. La reactividad de Solid al final es una especie de híbrido entre S y MobX. Esto le da un mayor rendimiento que la mayoría de las bibliotecas reactivas (Knockout, MobX, Vue) al tiempo que conserva la facilidad del modelo mental para el desarrollador. S.js, en última instancia, sigue siendo la biblioteca reactiva de mayor rendimiento, aunque la diferencia apenas se nota en todos los puntos de referencia excepto en los más agotadores benchmarks sintéticos.

## RxJS

RxJS es una biblioteca reactiva. Si bien Solid tiene una idea similar de los datos observables, utiliza una aplicación muy diferente del patrón del observador. Si bien las señales son como una versión simple de un Observable (solo el siguiente), el patrón de detección de dependencia automática reemplaza a los cien o más operadores de RxJS. Solid podría haber adoptado este enfoque y, de hecho, las versiones anteriores de la biblioteca incluían operadores similares, pero en la mayoría de los casos es más sencillo escribir su propia lógica de transformación en una computación. Mientras que los Observables son de arranque en frío, unidifusión y basados en push, muchos problemas en el cliente se prestan a un arranque en caliente y multidifusión, que es el comportamiento predeterminado de Solid.

## Otros

Angular y algunas otras bibliotecas populares faltan notablemente en esta comparación. La falta de experiencia con ellos impide hacer comparaciones adecuadas. En general, Solid tiene poco en común con Frameworks más grandes y es mucho más difícil compararlos de frente.
