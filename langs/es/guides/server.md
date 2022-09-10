# Server Side Rendering

Solid maneja el renderizado en servidor compilando los templates JSX a un código ultra eficiente de adición de cadenas de texto. Esto puede ser logrado mediante el _plugin_ de Babel o un _preset_ añadiendo `generate: "ssr"`. Para ambos, cliente y servidor es necesario añadirle `hydratable: true` para generar el código compatible con la hidratación.

Los entornos de ejecución `solid-js` y `solid-js/web` se intercambian por contrapartes no-reactivas cuando se ejecutan en un entorno de node. Para otros ambientes necesitas empaquetar el código de servidor con exportaciones condicionales establecidos a `node`. La mayoría empaquetadores tienen una manera de hacer esto. En general también recomendamos usar las condiciones de exportación `solid`, así como también se recomienda que las librerías envíen su fuente bajo la exportación `solid`.

Construir para SSR definitivamente toma un poco mas de configuración pues estaremos generando 2 _bundles_ separados. La entrada del cliente debería usar `hydrate`:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_Nota: Es posible renderizar e hidratar desde la raíz del documeno. Esto permite que describamos nuestra vista completa en JSX._

La entrada del servidor puede usar una de cuatro opciones de renderizado ofrecidas por Solid. Cada una produce el _output_ y una etiqueta de script para ser insertado en el `head` del documento.

```jsx
import { renderToString, renderToStringAsync, renderToStream } from "solid-js/web";

//Renderizado síncrono de strings
const html = renderToString(() => <App />);

//Renderizado asíncrono de strings
const html = await renderToStringAsync(() => <App />);

// Renderizado en Stream
const stream = renderToStream(() => <App />);

// Node
stream.pipe(res);

// Streams web (para servicios como Cloudflare Workers)
const { readable, writable } = new TransformStream();
stream.pipeTo(writable);
```

Para su comodidad `solid-js/web` exporta un indicador `isServer`. Esto es útil ya que la mayoría de los _bundlers_ podrán realizar _treeshaking_ en cualquier recurso que este bajo esta indicador o importar solo el código utilizado bajo este indicador fuera de su _bundle_ de cliente.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
	// solo ejecuta esto en el servidor
} else {
	// solo ejecuta esto en el navegador
}
```

## Hydration Script

Para hidratar progresivamente incluso antes de que se cargue el entorno de ejecución de Solid, se debe insertar un script especial en la página. Puede generarse e insertarse a través de `generateHydrationScript` o incluirse como parte del JSX usando la etiqueta `<HydrationScript />`.

```js
import { generateHydrationScript } from "solid-js/web";

const app = renderToString(() => <App />);

const html = `
  <html lang="en">
    <head>
      <title>🔥 Solid SSR 🔥</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      ${generateHydrationScript()}
    </head>
    <body>${app}</body>
  </html>
`;
```

```jsx
import { HydrationScript } from 'solid-js/web';

const App = () => {
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <HydrationScript />
      </head>
      <body>{/*... el resto de la App*/}</body>
    </html>
  );
};
```

Cuando se hidrata desde el documento, la inserción de recursos que no están disponibles en la ejecución del cliente también puede arruinar el proceso cuando no están bajo la etiqueta `<head>`. Solid proporciona un componente `<NoHydration>` cuyos hijos funcionarán normalmente en el servidor pero no se hidratarán en el navegador.

```jsx
<NoHydration>
  <ImNotHydrated />
</NoHydration>
```

## Async y Streaming SSR

Estos mecanismos se basan en el conocimiento de Solid sobre cómo funciona tu aplicación. Utiliza Suspense y Resource API en el servidor, en lugar de obtener datos y luego renderizar. Solid obtiene los recursos al mismo tiempo que renderiza en el servidor, de la misma forma que lo hace en el cliente. Tu código está escrito exactamente de la misma manera.

El renderizado asíncrono espera hasta que todos los límites del Suspense sean resueltos y entonces envía los resultados (o los escribe en un archivo en caso de ser Generación de Sitios Estáticos).

El streaming envía contenido síncrono al navegador inmediatamente. Inicialmente, renderiza en el servidor tus respaldos del Suspense y los envía al cliente. Después, en el momento en que los datos asíncronos terminan de cargar en el servidor, enviamos al cliente los datos y el HTML usando el mismo stream. El navegador finaliza el trabajo, resuelve el componente Suspense, y reemplaza el respaldo con contenido real. 

La ventaja de este enfoque:

- El servidor no tiene que esperar la respuesta de los datos asíncronos. Los recursos pueden empezar a cargar antes en el navegador, así el usuario puede empezar a ver contenido antes.
- Comparado con la obtención de datos del lado del cliente como en JAMStack, la carga de datos en el servidor comienza inmediatamente y no necesita esperar a que el cliente JavaScript cargue.
- Todos los datos son serializados y transportados desde el servidor al cliente de forma automática.

## Advertencias sobre el SSR

La solución SSR isomorfa de Solid es muy poderosa porque puede escribir su código principalmente como una base de código único que se ejecuta de manera similar en ambos entornos. Sin embargo esto genera expectativas en la hidratación. Principalmente, la vista renderizada en el cliente es la misma que se renderizaría en el servidor. No es necesario que sea exacto en términos de texto, pero estructuralmente el etiquetado debe ser el mismo.

En el servidor usamos indicadores renderizados para igualar los elementos y las ubicaciones de los recursos en el servidor. Por este motivo el cliente y el servidor deberán tener los mismos componentes. Esto no es usualmente un problema dado que Solid renderiza de la misma forma en el cliente y en el servidor. Pero actualmente no existe una forma de renderizar algo en el servidor que no sea hidratado en el cliente. En este momento no hay forma de hidratar parcialmente una página completa, y no generar indicadores para ello. Es todo o nada. La hidratación parcial es algo que queremos explorar en el futuro.

Finalmente, todos los recursos deben definirse bajo el árbol `render`. Estos se serializan automáticamente y son captados en el navegador, pero eso funciona porque los métodos de `render` realizan un seguimiento del progreso de la renderización. Algo que no podemos hacer si se crean en un contexto aislado. Del mismo modo, no hay reactividad en el servidor, por lo que no debe actualizar las señales en el renderizado inicial y esperar que se reflejen más arriba en el árbol. Si bien tenemos límites de Suspense, el SSR de Solid es básicamente de arriba hacia abajo.

## Iniciando con SSR

Las configuraciones de SSR son complicadas. Tenemos algunos ejemplos en el paquete [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr).

Sin embargo, se está trabajando en un nuevo _starter_ [SolidStart](https://github.com/solidjs/solid-start) que tiene como objetivo hacer que esta experiencia sea mucho más amigable.

## Iniciando con la Generación de Sitios Estáticos SSG

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) también viene con una sencilla utilidad para generar sitios estáticos o renderizados previamente. Lea el README para obtener más información.
