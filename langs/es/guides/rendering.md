---
title: Renderizado
description: Habla de las diferentes opciones de templating y renderizado en Solid.
sort: 2
---

# Renderizado

Solid soporta templating en 3 formas JSX, Tagged Template Literals y la variable HyperScript de Solid, JSX es la forma predominante. Por qué? JSX es un DSL hecho para la compilación. Tiene una sintaxis clara, soporta TypeScript, funciona con Babel y soporta otras herramientas como Code Syntax Highlighting y Prettier. Era simplemente pragmático usar una herramienta que básicamente te otorga todo eso, gratis. Como una solución compilada provee una experiencia de desarrollo asombrosa. Porque luchar con sintaxis personalizados de DSL cuando puedes usar uno con tan amplio soporte?

## Compilación JSX

Renderizar involucra precompilado de templates JSX hacia código nativo de JS. El código JSX construye:

- Plantillas de elementos del DOM que son clonados en cada instanciación
- Una serie de declaraciones referenciales usando unicamente firstChild y nextSibling
- Computaciones finamente detalladas para actualizar los elementos creados.

Este enfoque permite un mejor desempeño y produce menos código que creando cada elemento, uno por uno, con document.createElement.

## Atributos y Props

Solid intenta imitar las convenciones HTML tanto como sea posible incluyendo insensibilidad de mayúsculas y minúsculas de los atributos.

La mayoría de todos los atributos en los elementos nativos de JSX son establecidos como atributos del DOM. Los valores estáticos son construidos justo dentro del template que está clonado. Hay un número de excepciones como `class`, `style`, `value`, `innerHTML` que proveen de funcionalidades extra.

Sin embargo, los elementos personalizados (con la excepción de los incorporados de forma nativa) por default se convierten en propiedades cuando estos son dinámicos. Hace esta conversión de atributos en snake-case por camelCase por ejemplo `some-attr` lo convierte a `someAttr`.

Sin embargo es posible controlar este comportamiento directamente con directivas de namespace. Puedes forzar un atributo con `attr:` o forzar prop `prop`:

However, it is possible to control this behavior directly with namespace directives. You can force an attribute with `attr:` or force prop `prop:`

```jsx
<mi-elemento prop:AccUnico={state.valor} attr:titulo={state.titulo} />
```

> **Nota:** Los atributos estáticos son creados com parte del template HTML que está clonado. Las expresiones fijas y dinámicas son aplicadas después en el orden vinculante del JSX. Mientras esto está bien para la mayoría de los elementos del DOM, hay algunos como los elementos de entrada con `type='range'`, donde el orden importa. Ten esto en cuenta cuando vincules elementos.

## Entrada

La forma mas fácil de montar Solid es importando render desde 'solid-js/web'. `render` toma una función como primer argumento y el contenedor donde se montará como el segundo y retorna un método de desechos. Este `render` automáticamente crea una raíz reactiva y maneja el renderizado dentro del contenedor donde se monta. Para mayor desempeño usa un elemento sin hijos.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **Importante** El primer argumento debe ser una función. De otra forma no podremos rastrear adecuadamente ni programar el sistema reactivo. Esta simple omisión hará que tus Effects no se ejecuten.

## Componentes

Los componentes en Solid son funciones escritas en Pascal case (Capital). Su primer argumento es un objeto props y retornan nodos DOM reales.

```jsx
const Padre = () => (
	<section>
		<Etiqueta saludo='Hola'>
			<div>John</div>
		</Etiqueta>
	</section>
);

const Etiqueta = (props) => (
	<>
		<div>{props.saludo}</div>
		{props.children}
	</>
);
```

Debido a que todos los nodos JSX son nodos DOM, la única responsabilidad de los Components de nivel superior es anexarlos al DOM.

## Props

Parecido a React, Vue, Angular y otros frameworks, Solid te permite definir propiedades en tus componentes para pasar data a los components hijos. Aquí un padre está pasando el string "Hola" al componente `Etiqueta` a través de una propiedad `saludo`.

```jsx
const Padre = () => (
	<section>
		<Etiqueta saludo='Hola'>
			<div>John</div>
		</Etiqueta>
	</section>
);
```

En el ejemplo de arriba, el valor establecido en `saludo` es estático, pero también podemos establecer valores dinámicos. Por ejemplo:

```jsx
const Padre = () => {
	const [saludo, setSaludo] = createSignal("Hola");

	return (
		<section>
			<Etiqueta saludo={saludo()}>
				<div>John</div>
			</Etiqueta>
		</section>
	);
};
```

Los componentes pueden acceder a las propiedades que reciben via el argumento `props`.

```jsx
const Etiqueta = (props) => (
	<>
		<div>{props.saludo}</div>
		{props.children}
	</>
);
```

A diferencia de otros frameworks, no puedes usar desestructuración de objetos en los `props` de un componente. Esto es debido a que el objeto `props`, detrás de escenas, depende de Object getters para obtener valores en carga lenta. Usar la desestructuración de objetos rompe la reactividad de `props`.

Este ejemplo muestra la manera correcta de acceder a los props en Solid:

```jsx
// Aquí, `props.nombre` se actualizará como esperarías
const MiComponente = (props) => <div>{props.nombre}</div>;
```

Este ejemplo muestra la forma incorrecta de acceder a los props en Solid:

```jsx
// Esto está mal
// Aquí, `props.nombre` no se actualizará (no es reactivo) pues está desestructurado en `nombre`
const MyComponent = ({ nombre }) => <div>{nombre}</div>;
```

Mientras el objeto de props parece un objeto normal, cuando lo usas (y los usuarios de TypeScript notarán que está tipado como un objeto normal), en realidad es reactivo - de alguna forma similar a una Signal. Esto tiene unas cuantas implicaciones.

Porque a diferencia de la mayoría de frameworks JSX, los componentes funcionales de Solid sólo se ejecutan una vez (en lugar de cada ciclo de renderizado), el siguiente ejemplo no funcionará como esperarías.

```jsx
import { createSignal } from "solid-js";

const ComponenteBasico = (props) => {
	const valor = props.valor || "default";

	return <div>{valor}</div>;
};

export default function Form() {
	const [valor, setValor] = createSignal("");

	return (
		<div>
			<ComponenteBasico valor={valor()} />
			<input type='text' oninput={(e) => setValor(e.currentTarget.value)} />
		</div>
	);
}
```

En este ejemplo, lo que probablemente queremos que suceda es que el `ComponenteBasico` muestre el valor actual escrito dentro del `input`. Pero, como recordatorio, la función del `ComponenteBasico` solo se ejecutará una vez cuando el componente es creado inicialmente. En este momento (en la creación), `props.valor` será igual a `''`. Esto significa que `const valor` en el `ComponenteBasico` resolverá `'default'` y nunca se actualizará. Si bien el objeto `props` es reactivo, acceder al valor en `const valor = props.valor || `'default';` está fuera del ámbito observable de Solid, así que no es automáticamente re-evaluado con los props cambian.

Entonces, cómo podemos corregir nuestro problema?

Bueno, en general, necesitamos acceder a `props` en algún lugar donde Solid pueda observarlo. Generalmente esto significa dentro del JSX o dentro de un `createMemo`, `createEffect`, o un thunk(`() => ...`). Aquí se muestra una solución que funciona como se espera:

```jsx
const ComponenteBasico = (props) => {
	return <div>{props.valor || "default"}</div>;
};
```

Esto, equivalentemente, puede ser elevado a una function:

```jsx
const ComponenteBasico = (props) => {
	const valor = () => props.valor || "default";

	return <div>{valor()}</div>;
};
```

Otra opción, si es una computación costosa, puedes usar `createMemo`. Por ejemplo:

```jsx
const ComponenteBasico = (props) => {
	const valor = createMemo(() => props.valor || "default");

	return <div>{valor()}</div>;
};
```

O usando un helper

```jsx
const ComponenteBasico = (props) => {
	props = mergeProps({ valor: "default" }, props);

	return <div>{props.valor}</div>;
};
```

Como recordatorio, los siguientes ejemplos _no_ funcionarán:

```jsx
// Mal
const ComponenteBasico = (props) => {
	const { valor: valorProp } = props;
	const valor = createMemo(() => valorProp || "default");
	return <div>{valor()}</div>;
};

// Mal
const ComponenteBasico = (props) => {
	const valorProp = props.valor;
	const valor = createMemo(() => valorProp || "default");
	return <div>{valor()}</div>;
};
```

Los componentes de Solid son la pieza clave de su desempeño. El enfoque de "Desvanecimiento" de Componentes es posible por la evaluación lazy de props. En lugar de evaluar expresiones de prop inmediatamente y pasar los valores, la ejecución es diferida hasta que el prop es accedido en el hijo. Hacer esto pospone la ejecución hasta el ultimo momento, típicamente, justo en el vinculamiento con el DOM, maximizando el desempeño. Esto aplana la jerarquía y elimina la necesidad de mantener un árbol de Components.

```jsx
<Componente prop1='estático' prop2={state.dinamico} />;

// Se compila burdamente en:
// dejar de rastrear el cuerpo del componente para aislarlo y prevenir las actualizaciones costosas

untrack(() =>
	Componente({
		prop1: "estático",
		// Expresión dinámica, entonces la envolvemos en un getter
		get prop2() {
			return state.dinamico;
		},
	})
);
```

Para ayudar a mantener la reactividad, Solid tiene un par de prop helpers:

```jsx
// Props default
props = mergeProps({ nombre: "Smith" }, props);

// Clonar props
const nuevasProps = mergeProps(props);

// Unir props
props = mergeProps(props, otherProps);

// Separar props en multiples objetos de props
const [local, otros] = splitProps(props, ["className"])
<div {...otros} className={cx(local.className, theme.component)} />
```

## Hijos

Solid maneja los hijos JSX similar a React. Un solo hijo es un solo valor en `props.children` y múltiples hijos se maneja mediante un arreglo de valores. Normalmente, los pasas a través de la vista JSX. Sin embargo, si quieres interactuar con ellos el método sugerido es el helper `children` que resuelve cualquier control de flujo rio abajo y retorna un memo.

```jsx
// Hijo único
const Etiqueta = (props) => <div class="label">Hola, { props.children }</div>

<Etiqueta><span>Josie</span></Etiqueta>

// Múltiples hijos
const Lista = (props) => <div>{props.children}</div>;

<Lista>
  <div>Nombre</div>
  {state.expresion}
  <Etiqueta>Judith</Etiqueta>
</Lista>

// Map de hijos
const Lista = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// Modificar y mappear children usando el helper
const Lista = (props) => {
  // El helper children memoriza el valor y resuelve toda la reactividad intermedia

  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("lista-hijos"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**Importante: ** Solid trata las etiquetas de children como expresiones costosas y las envuelve de la misma manera que a las expresiones reactivas dinámicas. Esto significa que se evalúan de manera diferida los accesos a `props`. Ten cuidado con acceder a ellos múltiples veces o desestructurarlos antes de ponerlos en la vista donde los quieras usar. Esto es porque Solid no tiene el lujo de crear nodos del DOM Virtual antes de tiempo y después compararlos, así que la resolución de estos `props` debe ser diferida y deliberada. Usa el helper `children` si necesitas hacer esto pues así son memorizados.
