---
title: Rendering
description: Bespricht die verschiedenen Templating- und Rendering-Optionen in Solid.
sort: 2
---

# Rendering

Solid unterstützt Templating in 3 Formen: JSX, Tagged Template Literals und Solids HyperScript-Variante, obwohl JSX die bevorzugte Form ist. Warum? JSX ist eine großartige DSL für Kompilation. Es hat eine klare Syntax, unterstützt TypeScript, läuft mit Babel und unterstützt andere Werkzeuge wie Syntax Highlighting und Prettier. Es war nur pragmatisch, ein Werkzeug zu verwenden, das einem all das kostenlos zur Verfügung stellt. Als kompilierte Lösung bietet es eine großartige Entwicklererfahrung. Warum soll man sich mit eigenen Syntax DSLs herumschlagen, wenn man eine verwenden kann, die so weitläufig unterstützt wird?

## JSX kompilieren

Rendering beinhaltet das Vorkomplieren von JSX-Templates zu optimiertem nativen JS-Code. Der JSX-Code erzeugt:

- DOM Templates, die bei der Erstellung der Instanz geklont werden
- Eine Reihe von Referenzdeklarationen die nur firstChild und nextSibling verwenden
- Feingranulare Berechnngen, um die so erzeugten Elemente zu aktualisieren.

Diese Herangehensweise ist einerseits performanter und erzeugt andererseits auch weniger Code als jedes Element einzeln eins nach dem anderen mit document.createElement zu erzeugen.

## Attribute und Props

Solid versucht, die HTML-Konventionen so weit wie möglich beizubehalten, einschließlich der wahlweisen Groß-/Kleinschreibung der Attribute.

Die Mehrzahl aller Attribute von nativen JSX-Elementen werden als DOM-Attribute gesetzt. Statische Werte werden direkt in das geklonte Template geschrieben. Es gibt eine Reihe von Ausnahmen wie `class`, `style`, `value`, `innerHTML`, die zusätzliche Funktionalität bereitstellen.


However, custom elements (with exception of native built-ins) default to properties when dynamic. This is to handle more complex data types. It does this conversion by camel casing standard snake case attribute names `some-attr` to `someAttr`.

Jedenfalls ist es möglich, dieses Verhalten direkt mit Namespace-Direktiven zu kontrollieren. Man kann die Behandlung als Attribut mit `attr:` erzwingen oder als Prop mit `prop:`

```jsx
<my-element prop:UniqACC={state.value} attr:title={state.title} />
```

> **Hinweis:** Statische Attribute werden als Teil vom HTML-Template erzeugt, das geklont wird. Evaluierte Werte, ob fest oder dynamisch, werden nachträglich in der JSX-Bindungsreihenfolge hinzugefügt. Während das für manche DOM-Elemente in Ordnung ist, gibt es manche, wie `input type="range"`, wo die Reihenfolge wichtig ist. Daran sollte man denken, wenn man Elemente bindet.

## Einstieg

Der einfachste Weg, Solid-Komponenten einzubinden, besteht darin, render von 'solid-js/web' einzubinden. `render` nimmt eine Funktion als ersten Parameter und den Container, in den eingehängt werden soll, als zweiten und gibt eine Entfernungs-Methode zurück. Dieses `render` erzeugt automatisch den Reaktiven Ausgangspunkt und übernimmt das Rendern in den Container. Für die beste Performance wähle man dafür ein Element ohne Children.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **Wichtig** Der Erste Parameter muss eine Funktion sein. Andernfalls können wir das reaktive System nicht komplett verfolgen und planen. Diese einfache Auslassung wird dazu führen, dass Effekte nicht laufen.

## Komponenten

Komponenten sind in Solid einfach Pascal-case-benannte (am Anfang groß geschrieben) Funktionen. Ihr erster Parameter ist ein props-Objekt und sie geben echte DOM-Nodes aus.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);

const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Da alle JSX-Nodes echte DOM-Nodes sind, ist die einzige Aufgabe der obersten Komponente, diese alle ins DOM einzuhängen.

## Props

Ähnlich wie bei React, Vue, Angular und anderen Frameworks erlaubt es Solid einem, Props in den Komponenten zu definieren, um Daten an Kind-Komponenten zu übergeben. Hier gibt ein Parent den String "Hello" an die `Label`-Komponente mit dem `greeting`-Prop weiter.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);
```

Im obigen Beispiel ist der Wert, der in `greeting` gesetzt wird, statisch, aber man kann auch dynamische Werte setzen. Zum Beispiel:

```jsx
const Parent = () => {
  const [greeting, setGreeting] = createSignal("Hello");

  return (
    <section>
      <Label greeting={greeting()}>
        <div>John</div>
      </Label>
    </section>
  );
};
```

Komponenten können auf props über das `props`-Argument zugreifen.

```jsx
const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Anders als in anderen Frameworks kann man auf das `props`-Objekt einer Komponente nicht mit destructuring zugreifen. Das liegt daran, dass das `props`-Objekt hinter den Kulissen Getter und Setter benutzt, um verzögert auf Werte zuzugreifen. Destrukturierung zerstört dabei die Reaktivität von `props`.

Dieses Beispiel zeigt den "korrekten" Weg, auf Props in Solid zuzugreifen:

```jsx
// Hier wird `props.name` so aktualisiert, wie man es erwartet
const MyComponent = (props) => <div>{props.name}</div>;
```

Dieses Beispiel zeigt den falschen Weg, auf Props in Solid zuzugreifen:

```jsx
// Das ist schlecht;
// Hier wird `props.name` nicht aktualisiert (bzw. ist nicht reaktiv), da es in `name` destrukturiert wird
const MyComponent = ({ name }) => <div>{name}</div>;
```

Während das props-Objekt wie ein normales Objekt aussieht, während man es verwendet (und Typescript-Nutzern wird auffallen, dass es wie ein normales Objekt typisiert ist), ist es tatsächlich reaktiv – etwa vergleichbar mit einem Signal. Das hat ein paar Auswirkungen.

Da Solids Funktions-Komponenten anders als bei anderen JSX-Frameworks nur einmal ausgeführt werden (statt jeden Render-Zyklus), wird das folgende Beispiel nicht funktionieren, wie man es erwarten würde.

```jsx
import { createSignal } from "solid-js";

const BasicComponent = (props) => {
  const value = props.value || "default";

  return <div>{value}</div>;
};

export default function Form() {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <BasicComponent value={value()} />
      <input type="text" oninput={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}
```

In diesem Beispiel ist vermutlich beabsichtigt, dass die `BasicComponent` den gegenwärtigen Wert anzuzeigen, der in das `input`-Feld geschrieben wurde. Aber, man erinnere sich, die `BasicComponent` wird nur ein einziges Mal aufgerufen, wenn sie erzeugt wird. Zu dieser Zeit ist `props.value` gleich `''`. Das heißt, dass `const value` in `BasicComponent` immer `default` enthalten und nie aktualisiert wird. Während das `props`-Objekt reaktiv ist, ist der Zugriff auf sie in `const value = props.value || 'default';` außerhalb des überwachten Bereichs von Solid und wird daher nicht neu ausgeführt, wenn props sich ändern.

Wie können wir unser Problem beheben?

Nun, generell müssen wir auf `props` so zugreifen, dass Solid es verfolgen kann. Generell heisst das, innerhalb vom JSX oder innerhalb von `createMemo`, `createEffekt` oder thunk(`() => ...`). Hier ist eine Lösung die wie erwartet funktioniert:

```jsx
const BasicComponent = (props) => {
  return <div>{props.value || "default"}</div>;
};
```

Das kann äquivalent in eine Funktion ausgelagert werden:

```jsx
const BasicComponent = (props) => {
  const value = () => props.value || "default";

  return <div>{value()}</div>;
};
```

Eine andere Option für besonders aufwendige Berechnungen ist die Nutzung von `createMemo`. Zum Beispiel:

```jsx
const BasicComponent = (props) => {
  const value = createMemo(() => props.value || "default");

  return <div>{value()}</div>;
};
```

Oder einen Helfer benutzen:

```jsx
const BasicComponent = (props) => {
  props = mergeProps({ value: "default" }, props);

  return <div>{props.value}</div>;
};
```

Zur Erinnerung, die folgenden Beispiele funktionieren _nicht_:

```jsx
// schlecht
const BasicComponent = (props) => {
  const { value: valueProp } = props;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};

// schlecht
const BasicComponent = (props) => {
  const valueProp = prop.value;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};
```

Solids Komponenten machen einen wesentlicher Teil von dessen Performance aus. Solids Herangehensweise, Komponenten "verschwinden" zu lassen wird durch verzögerte Prop-Berechnung möglich. Statt sofort alle Prop-Ausdrücke zu berechnen und die Werte weiterzugeben, wird die Ausführung verzögert, bis auf die Prop im Kind-Element zugegriffen wird. Damit wird die Ausführung bis zum letzten möglichen Moment verzögert, typischerweise direkt bei den DOM-Einbindungen, was die Performance maximiert. Das sorgt für flache Hierarchien und entfernt die Notwendigkeit, einen Komponenten-Baum zu behandeln.

```jsx
<Component prop1="static" prop2={state.dynamic} />;

// kompiliert ungefähr zu:

// Wir untracken das Compoonent-Objekt, um es zu isolieren und kostspielige Updates zu vermeiden
untrack(() =>
  Component({
    prop1: "static",
    // ein dynamischer Ausdruck wird in einem Getter verschachtelt
    get prop2() {
      return state.dynamic;
    },
  })
);
```

Um Reaktivität beizubehalten, hat Solid ein paar Prop-Helfer:

```jsx
// Default-Props
props = mergeProps({ name: "Smith" }, props);

// Props klonen
const newProps = mergeProps(props);

// Props zusammenführen
props = mergeProps(props, otherProps);

// Props in verschiedene Objekte aufspalten
const [local, others] = splitProps(props, ["className"])
<div {...others} className={cx(local.className, theme.component)} />
```

## Children

Solid behandelt JSX-Children ähnlich wie React. Ein einzelnes Kind-Element ist ein einzelner Wert in `props.children` und mehrere Kind-Elemente wird als Array von Werten behandelt. Normalerweise werden sie im JSX durchgereicht. Allerdings gibt es für den Fall, dass man mit ihnen interagieren möchte, den `children`-Helfer, der alle Kontrollflüsse auflöst und ein Memo zurückgibt.

```jsx
// Einzelnes Kind-Element
const Label = (props) => <div class="label">Hi, { props.children }</div>

<Label><span>Josie</span></Label>

// Mehrere Kind-Elemente
const List = (props) => <div>{props.children}</div>;

<List>
  <div>First</div>
  {state.expression}
  <Label>Judith</Label>
</List>

// Kind-Elemente mappen
const List = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// Kind-Elemente mit Helfer modifizieren und mappen
const List = (props) => {
  // children-Helfer macht ein Memo aus dem Wert und löst die reaktiven Zwischenschritte auf
  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("list-child"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**Wichtig:** Solid behandelt Kind-Tags als kostspielige Ausdrücke und verpackt sie auf dem gleichen Weg als dynamische reaktive Ausdrücke. Das bedeutet, dass sie verzögert auf `props`-Zugriff diesen berechnen. Man sei vorsichtig, auf diese mehrfach zuzugreifen oder zu destrukturieren, bevor sie im JSX verwendet werden. Das liegt daran, dass sich Solid nicht den Luxus gönnt, vorher virtuelle DOM-Nodes zu erstellen und diese abzugleichen, also muss die Berechnung der `props` verzögert und auf absichtlichen Zugriff erfolgen. Nutze den `children`-Helfer, wenn diese memoized werden sollen.
