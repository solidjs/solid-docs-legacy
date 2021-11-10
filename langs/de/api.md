---
title: API
description: Alle Solid APIs im Überblick.
sort: 0
---

# Grundlegende Reaktivität

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Dies ist die grundsätzlichste Anweisung, um auf einen einzelnen Wert zu reagieren, der sich über die Zeit verändert. Die create-Funktion gibt ein Paar von get- und set-Funktionen zurück, um das Signal auszulesen und zu aktualisieren.

```js
const [getValue, setValue] = createSignal(initialValue);

// read value
getValue();

// set value
setValue(nextValue);

// set value with a function setter
setValue((prev) => prev + next);
```

Um auf Aktualisierungen zu reagieren, müssen diese Signale in einem überwachten Scopes verwendet werden. Überwachte Scopes sind Funktionen, die als Parameter von `createEffect` oder JSX-Properties verwendet werden.

> Um eine Funktion in einem Signal zu speichern, muss sie in eine weitere Funktion gekapselt werden:
>
> ```js
> setValue(() => myFunction);
> ```

## `createEffect`

```ts
export function createEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Erstellt einen neuen Effekt, der automatisch Abhängigkeiten überwacht und nach jedem Rendering abläuft, wenn ein Wert geändert wurde. Ideal, um `ref`s zu verwenden und andere Seiteneffekte zu handhaben.

```js
const [a, setA] = createSignal(initialValue);

// Effekt, der von dem Signal `a` abhängig ist
createEffect(() => doSideEffect(a()));
```

Die Effektfunktion wird mit dem Rückgabewert der letzten Ausführung aufgerufen. Dieser Wert kann als optionaler zweiter Parameter initialisiert werden; das kann nützlich sein, um Vergleiche ohne eine zusätzliche Closure durchzuführen.

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log(sum);
  return sum;
}, 0);
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Erstellt ein nur lesbares abgeleitetes Signal, das automatisch neu berechnet wird, wenn sich eine Abhängigkeit des darin ausgeführten Codes ändert.

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()));

// Wert auslesen
getValue();
```

Die memo-Funktion wird mit dem Rückgabewert der letzten Ausführung aufgerufen. Dieser Wert kann als optionaler zweiter Parameter initialisiert werden. Das ist nützlich, um Aufrufe zu reduzieren.

```js
const sum = createMemo((prev) => input() + prev, 0);
```

## `createResource`

```ts
type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: () => void;
  }
];

export function createResource<T, U = true>(
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;

export function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;
```

Erzeugt ein Signal, um asynchrone Anforderungen zu handhaben. Der `fetcher` ist eine asynchrone Function, die den Ausgabewert der `source`-Funktion entgegennimmt und ein Promise zurückgibt, dessen Ergebnis in der Resource gespeichert wird. Der `fetcher` ist nicht reaktiv, also muss die optionale `source`-Funktion genutzt werden, um ihn mehr als einmal zu starten. Wenn der `source` false, null oder undefined zurückgibt, wird die Resource nicht abgerufen.

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// Wert auslesen
data();

// Prüfe, ob noch geladen wird
data.loading;

// Prüfe, ob ein Fehler geworfen wurde
data.error;

// Setze den Wert direkt, ohne ein Promise zu erzeugen
mutate(optimisticValue);

// Wiederhole die letzte Anfrage einfach so
refetch();
```

`loading` und `error` sind reaktive getter und können verfolgt werden.

# Lifecycles

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Registriert eine Methode, die aufgerufen wirde, nachdem initial gerendert wurde bzw. Elemente geladen wurden. Ideal, um `ref`s zu benutzen oder einmalige Seiteneffekte aufzurufen. Es ist equivalent zu einem `createEffect` ohne Abhängigkeiten.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Registriert eine Aufräummethode, die nach dem Entfernen oder Neuberechnung des gegenwärtigen Scopes aufgerufen wird. Kann in jeder Komponente und in jedem Effekt genutzt werden.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Registriert eine Fehlerbehandlungsmethode, die aufgerufen wird, wenn innerhalb des Scopes der Kind-Elemente ein Fehler geworfen wird. Nur im jeweils nächsten Scope wird die Methode aufgerufen. Man kann den Fehler darin weiterwerfen, um die darüberliegende Methode zu erreichen.

# Reaktive Helfer

Diese Helfer bringen die Fähigkeit, Aktualisierungen und Reaktivität feingranularer zu kontrollieren.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

Ignoriert Änderungen von Abhängigkeiten innerhalb des ausführenden Code-Blocks und gibt den Wert zurück.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Verzögert Aktualisierungen innerhalb des Funktionsblocks bis zu dessen Ende, um unnötige Neuberechnungen zu vermeiden. Das bedeutet, dass die getter noch keine aktualisierten Werte enthalten. [Solid Store](#createstore)'s set-Methode und Effekte werden automatisch als batch behandelt.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` ist dazu gedacht, eine Berechnung mit definierten Abhängigkeiten auszuführen. Sofern ein Array von Abhängigkeiten übergeben wird, sind `input` und `prevInput` auch Arrays.

```js
createEffect(on(a, (v) => console.log(v, b())));

// ist das gleiche wie:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

Man kann sich auch entscheiden, den Effekt nicht sofort, sondern erst bei Änderungen auszuführen, dazu muss man die option `defer` auf `true` setzen.

```js
// läuft nicht sofort
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // Jetzt läuft der Effekt
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Erzeugt einen neuen nicht überwachten Kontext der nicht automatisch aufgeräumt wird. Das ist nützlich für verschachtelte reaktive Kontexte, die nicht aufgeräumt werden sollen, wenn die darüberliegende Komponente neu berechnet wird. Es ist eine mächtige Möglichkeit für Caching.

Aller Solid-code sollte in einem solchen Kontext eingebunden werden, um sicherzustellen, dass Speicher und Berechnungen aufgeräumt werden. Normalerweise braucht man sich aber nicht darum zu kümmern, da `createRoot` bereits in alle `render`-Funktionen eingebunden ist.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

Eine reaktive Methode, um Objekte zu vereinen (`merge`). Nützlich, um Standardwerte der Eigenschaften (default props) für Komponenten zu setzen, falls diese nicht vom Aufruf übergeben werden oder die Eigenschaften mit reaktiven Werten zu klonen (clone props).

Diese Methode funktioniert, indem ein Proxy verwendet wird, um Eigenschaften in umgekehrter Reihenfolge aufzulösen. Das ermöglicht eine dynamische Verfolgung von Eigenschaften, die noch nicht präsent waren, als die Eigenschaften das erste Mal zusammengeführt wurden.

```js
// Standardeinstellung
props = mergeProps({ name: "Smith" }, props);

// Props klonen
newProps = mergeProps(props);

// Props zusammenführen
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

Diese Methode ersetzt auf reaktive Weise das Auflösen von Objekten. Es teilt ein reaktives Objekt nach Schlüsseln (keys) und behält dabei die Reaktivität bei.

```js
const [local, others] = splitProps(props, ["children"]);

<>
  <Child {...others} />
  <div>{local.children}<div>
</>
```

## `useTransition`

```ts
export function useTransition(): [
  () => boolean,
  (fn: () => void, cb?: () => void) => void
];
```

Wird verwendet, um asynchrone Aktualisierungen gemeinsamen auszuführen in einer Transaktion, die solange verzögert wird, bis alle asynchronen Prozesse ausgeführt sind. Dies hängt mit Suspense zusammen und verfolgt ausschließlich Ressourcen innerhalb der Grenzen von Suspense.

```js
const [isPending, start] = useTransition();

// Prüfe, ob eine Transition stattfindet
isPending();

// Verpacke in Transition
start(() => setSignal(newValue), () => /* Transition ist abgeschlossen */)
```

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

Diese Methode nimmt ein Signal und erzeugt ein einfaches Observable. Man kann es mit der Bibliothek seiner Wahl konsumieren, typischerweise mit dem `from`-Operator.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `mapArray`

```ts
export function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

Eine reaktive Hilfsfunktion vergleichbar mit Array.map die jedes Element speichert, um unnötige Berechnungen von Aktualisierungen zu vermeiden. Die map-Funktion läuft nur einmal pro Element und wird dann ganz nach Bedarf ergänzt oder entfernt. Das Index-Argument ist ein Signal. Die map-Funktion selbst wird nicht verfolgt.

Diese Funktion unterstützt den `<For>`-Ablauf.

```js
const mapped = mapArray(source, (model) => {
  const [name, setName] = createSignal(model.name);
  const [description, setDescription] = createSignal(model.description);

  return {
    id: model.id,
    get name() {
      return name();
    },
    get description() {
      return description();
    }
    setName,
    setDescription
  }
});
```

## `indexArray`

```ts
export function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

Vergleichbar zu `mapArray`, außer das es über den Index iteriert. Der Wert ist ein Signal und der index ist nun eine Konstante.

Diese Funktion unterstützt den `<Index>`-Ablauf.

```js
const mapped = indexArray(source, (model) => {
  return {
    get id() {
      return model().id
    }
    get firstInitial() {
      return model().firstName[0];
    },
    get fullName() {
      return `${model().firstName} ${model().lastName}`;
    },
  }
});
```

# Stores

Diese APIs sind unter `solid-js/store` verfügbar.

## `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

Dieser Aufruf erzeugt eine Baumstruktur von Signalen als Proxy, der es erlaubt, individuelle Werte in verschachtelten Datenstrukturen unabhängig voneinander zu tracken. Die create-Funktion gibt ein nur lesbares Proxy-Objekt zurück und eine Funktion zum Überschreiben von Werten.

```js
const [state, setState] = createStore(initialValue);

// Wert auslesen
state.someValue;

// Wert setzen
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

Store-Objekte als Proxies verfolgen nur den Zugriff auf Eigenschaften. Auf Zugriff produziert der Store rekursiv Objekte mit verschachtelten Daten. Allerdings werden nur Arrays und einfache Objekte derart verarbeitet. Dinge wie `Date`, `HTMLElement`, `Regexp`, `Map`, `Set` sind nicht in Bezug auf ihre Daten reaktiv. Außerdem können die Store-Objekte selbst nicht verfolgt werden, ohne dass auf eine ihrer Eigenschaften zugegriffen wird. Dementsprechend ist es nicht dazu geeignet, darüber zu iterieren, da das Hinzufügen neuer Daten oder Indices keine Aktualisierungen auslösen. Somit sollte man Listen lieber als Datenpunkt eines Store-Objekts speichern, statt sie selbst als solches Objekt zu verwenden:

```js
// Nehme die Liste als eine Eigenschaft des State-Objekts
const [state, setState] = createStore({ list: [] });

// Greife auf `list` im State-Objekt zu
<For each={state.list}>{item => /*...*/}</For>
```

### Getter

Store-Objekte unterstützen die Verwendung von Getter-Funktionen, um berechnete Werte verfügbar zu machen.

```js
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});
```

Dies sind einfache Getter, daher muss man Memo verwenden, wenn ein Wert zwischengespeichert werden soll:

```js
let fullName;
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return fullName();
    },
  },
});
fullName = createMemo(() => `${state.firstName} ${state.lastName}`);
```

### Stores aktualsieren

Änderungen können die Form von Funktionen annehmen, die den vorherigen Zustand übergeben bekommen und den neuen Zustand oder Wert ausgeben. Objekte werden immer nur auf der obersten Ebene zusammengeführt. Man kann Werte auf `undefined` setzen, um sie aus dem Store zu entfernen.

```js
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

Es werden Pfade unterstützt, einschließlich Schlüssel-Arrays, Objekt-Teile und Filterfunktionen.

setState unterstützt verschachtelte Objekte, indem man den Pfad zu der Änderung angibt. Wenn der Zustand, der aktualisiert wird, in einem verschachtelten Objekt ist, kann der aktualisierte Wert auch ein anderer als ein Objekt sein. Objekte werden weiterhin zusammengeführt, andere Werte (einschließlich Arrays) werden überschrieben.

```js
const [state, setState] = createStore({
  counter: 2,
  list: [
    { id: 23, title: 'Birds' }
    { id: 27, title: 'Fish' }
  ]
});

setState('counter', c => c + 1);
setState('list', l => [...l, {id: 43, title: 'Marsupials'}]);
setState('list', 2, 'read', true);
// {
//   counter: 3,
//   list: [
//     { id: 23, title: 'Birds' }
//     { id: 27, title: 'Fish' }
//     { id: 43, title: 'Marsupials', read: true }
//   ]
// }
```

Der Pfad kann String-Keys, Arrays von String-Keys, Objekte mit Beschreibung einer Iteration ({from, to, by}), oder Filterfunktionen sein. Das gibt erstaundliche Ausdrucksvielfalt, Zustandsveränderungen zu beschreiben.

```js
const [state, setState] = createStore({
  todos: [
    { task: 'Finish work', completed: false }
    { task: 'Go grocery shopping', completed: false }
    { task: 'Make dinner', completed: false }
  ]
});

setState('todos', [0, 2], 'completed', true);
// {
//   todos: [
//     { task: 'Finish work', completed: true }
//     { task: 'Go grocery shopping', completed: false }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', { from: 0, to: 1 }, 'completed', c => !c);
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping', completed: true }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', todo => todo.completed, 'task', t => t + '!')
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping!', completed: true }
//     { task: 'Make dinner!', completed: true }
//   ]
// }

setState('todos', {}, todo => ({ marked: true, completed: !todo.completed }))
// {
//   todos: [
//     { task: 'Finish work', completed: true, marked: true }
//     { task: 'Go grocery shopping!', completed: false, marked: true }
//     { task: 'Make dinner!', completed: false, marked: true }
//   ]
// }
```

## `produce`

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Von Immer inspirierte API für Solids Store-Objekte, die eine lokalisierte Mutation erlauben.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

## `reconcile`

```ts
export function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Unterscheidet Datenveränderungen, für den Fall, dass granulare Veränderungen nicht anwendbar sind. Nützlich, wenn man mit unveränderlichen Daten aus Stores oder großen API-Antworten arbeitet.

Die key-Option wird verwendet, um Elemente zu finden. Normalerweise überprüft `merge` false nach Referenz, soweit möglich, um festzustellen, ob gleiche Werte vorliegen und ersetzt Werte, deren Referenz nicht übereinstimmt. `merge` true geht in die Tiefe und führt alle vorherigen Werte mit den neuen zusammen.

```js
// Ein observable anzapfen
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

## `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): Store<T> {
```

Erzeugt ein überschreibbares Store-Proxy-Objekt. Der Store wird dabei nur aktualisiert, wenn Werte geändert werden. Die Verfolgung wird über das Abfangen von Eigenschafts-Zugriffen vorgenommen und verfolgt automatisch Verschachtelungen per Proxy.

Nützlich um externe Systeme zu integrieren oder als Kompatibilitätsschicht zu MobX/Vue.

> **Hinweis:** Ein überschreibbarer Store kann überall übergeben und aktualisiert werden, was es erschweren kann, Änderungen nachzuvollziehen und es einfacher macht, den unidirektionalen Datenfluss zu brechen. Es wird generell empfohlen, stattdessen `createStore` zu verwenden. Der `produce`-Modifikator can die gleichen Vorteile erbringen, ohne die Nachteile.

```js
const state = createMutable(initialValue);

// Wert auslesen
state.someValue;

// Wert setzen
state.someValue = 5;

state.list.push(anotherValue);
```

Überschreibbare Stores unterstützen Setter und Getter.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

# Component APIs

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context erlaubt eine Art Abhängigkeitsinjektion in Solid. Es wird verwendet, um zu verhindern, dass Daten als Props durch dazwischen liegende Komponenten hindurch weitergegeben werden muss.

Diese Funktion erzeugt ein neues Kontext-Objekt, das mit `useContext` verwerdet werden kann und den `Provider`-Kontrollfluss enthält. Der Standardwert des Kontexts wird verwendet, wenn kein `Provider` in der Hierarchie gefunden werden kann.

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const store = [
    state,
    {
      increment() {
        setState("count", (c) => c + 1);
      },
      decrement() {
        setState("count", (c) => c - 1);
      },
    },
  ];

  return (
    <CounterContext.Provider value={store}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

Der Wert, der dem Provider übergeben wird, wird so, wie er ist, an `useContext` weitergegeben. Das bedeutet, dass die Verwendung des Werts als reaktiver Ausdruck nicht funktioniert. Signals und Stores sollten komplett übergeben werden, anstatt einzelne Datenpunkte im JSX zu übergeben.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Wird verwendet, um Daten aus einem Kontext zu erhalten, statt sie über alle dazwischen liegenden Komponenten als props durchzuleiten.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Wird verwendet, um die Interaktion mit `props.children` zu vereinfachen. Dieser Helfer löst verschachtelte Reaktivität auf und gibt ein Memo zurück. Der bevorzugte Weg, um `props.children` in allen Fällen zu verwenden, in denen die Kind-Elemente nicht einfach an das JSX durchgereicht werden.

```js
const list = children(() => props.children);

// Mache etwas damit
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Wird benutzt, um Komponenten verzögert zu laden, damit man den Code aufteilen kann. Komponenten werden nicht geladen, bis sie gerendert werden. Verzögert geladene Komponenten können genauso genutzt werden wie ihre statisch importierten Geschwister, können props empfangen etc... Verzögert geladene Komponenten basieren auf `<Suspense>`.

```js
// Verzögerter Import
const ComponentA = lazy(() => import("./ComponentA"));

// Im JSX verwenden
<ComponentA title={props.title} />;
```

# Sekundäre Primitiven

Für eine erste Anwendung wird man diese vermutlich nicht brauchen, aber es nützlich, diese Werkzeuge zu haben.

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    name?: string;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

Erzeugt einen nur lesbaren Wert, der reaktive Aktualisierungen so lange verzögert, bis der Browser untätig ist. `timeoutMs` ist die maximale Zeit, die gewartet wird, bis die Aktualisierung in jedem Fall ausgeführt wird.

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Erzeutt eine neue Berechnung, die automatisch Abhängigkeiten verfolgt und direkt vor dem Rendern läuft. Wird verwendet, um in andere reaktive Primitiven zu schreiben. Wenn möglich, sollte stattdessen `createMemo` verwendet werden, da das Schreiben in ein Signal während einer Aktualisierung andere Berechnungen neu starten lassen kann.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Erzeugt eine neue Berechnung, die automatisch Abhängigkeiten verfolgt und während der Render-Phase läuft, wenn DOM-Elemente erstellt und aktualisiert werden, aber noch nicht notwendigerweise verbunden sind. Alle internen DOM-Aktualisierungen laufen während dieser Zeit.

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

Erzeugt ein bedingtes Signal, das nur dann die Verfolger aktualisieren lässt, wenn ihr Schlüssel dem Wert entspricht oder nicht mehr entspricht. Nützlich für delegierten Auswahlzustand, da es die Operation in O(2) statt O(n) ausführt.

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

Diese Importe sind in `solid-js/web` verfügbar.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

Das ist der Einstiegspunkt für den Browser. Man übergebe eine übergeordnete Componenten-Definition oder -Funktion und ein Element, in welches diese eingehängt wird. Es ist empfohlen, dass dieses Element leer ist, da die zurückgegebene Dispose-Funktion alle Kind-Elemente entfernt.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

Diese Methode ist ähnlich wie `render`, außer dass es versucht, den vorhandenen Inhalt des DOMs zu rehydrieren. Für den Fall, dass im Browser eine Seite geladen ist, die bereits vom Server gerendert wurde.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    nonce?: string;
  }
): string;
```

Rendert synchron zu einem String. Die Funktion generiert auch ein Script für die fortlaufende Hydration. In options kann man die eventNames der events definieren, die aufgezeichnet werden, während die Seite hydriert wird, und nach der Hydration abgespielt werden und einen Content-Security-Policy nonce-String, der an das Script-Tag angefügt wird.

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    timeoutMs?: number;
    nonce?: string;
  }
): Promise<string>;
```

Das gleiche wie `renderToString`, außer dass es auf die Auflösung aller `<Suspense>`-Promises wartet, bevor das Ergebnis zurückgegeben wird. Resource-Daten werden automatisch in das Script-Tag serialisiert und nach dem Laden im Client hydriert.

```js
const html = await renderToStringAsync(App);
```

## `pipeToNodeWritable`

```ts
export type PipeToWritableResults = {
  startWriting: () => void;
  write: (v: string) => void;
  abort: () => void;
};
export function pipeToNodeWritable<T>(
  fn: () => T,
  writable: { write: (v: string) => void },
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (r: PipeToWritableResults) => void;
    onComplete?: (r: PipeToWritableResults) => void | Promise<void>;
  }
): void;
```

Diese Methode rendert in einen Node-Stream. Sie rendert den Inhalt synchron einschließlich eller Suspense-Platzhalter und fährt danach fort, die weiteren Daten von jeder asynchronen Ressource, sobald sie vollständig ist.

```js
pipeToNodeWritable(App, res);
```

Die `onReady`-Option ist nützlich, um in den Stream zu schreiben, während die App gerendert wird. Man bedenke, dass bei Benutzung von `onReady` die Methode `startWriting` manuell aufgerufen werden muss.

## `pipeToWritable`

```ts
export type PipeToWritableResults = {
  write: (v: string) => void;
  abort: () => void;
  script: string;
};
export function pipeToWritable<T>(
  fn: () => T,
  writable: WritableStream,
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
    onComplete?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
  }
): void;
```

Diese Methode rendert in einen Web Stream. Sie rendert den Inhalt synchron, einschließlich der Suspense-Platzhalter und fährt dann fort, die Inhalte der asynchronen Ressourcen zu rendern, sobald sie verfügbar werden.

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

Die `onReady`-Option ist nützlich, um in den Stream zu schreiben, während die App gerendert wird. Man bedenke, dass bei Benutzung von `onReady` die Methode `startWriting` manuell aufgerufen werden muss.

## `isServer`

```ts
export const isServer: boolean;
```

Erlaubt die Unterscheidung, ob der Code gerade auf dem Server oder im Browser ausgeführt wird. Da die darunterliegenden Runtimes den Wert als bool'sche Konstante exportieren, können Bundler den darunterliegenden Code und dessen verwendeten Importe von bestimmten Bundles eliminieren.

```js
if (isServer) {
  // Das hier wird nie im Browser ausgeführt
} else {
  // und das hier nicht auf dem Server
}
```

# Kontrollfluss

Solid verwendet Komponenten für den Kontrollfluss. Das liegt daran, dass wir für performante Reaktivität kontrollieren müssen, wie Elemente erzeugt werden. Zum Beispiel mit Listen, eine einfache `map` ist ineffizient, da darin immer alles gemappt wird. Das bedeutet, wir brauchen dazu Helfer-Funktionen.

Diese in Komponenten zu verpacken ist ein bequemer Weg, um kurze und bündige Templates mit der Möglichkeit für Nutzer zu verbinden, Kontrollfluss-Komponenten zu kombinieren oder eigene zu erstellen.

Diese eingebauten Kontrollfluss-Komponenten werden automatisch importiert. Alle ausser `Portal` und `Dynamic` werden von `solid-js` verfügbar gemacht. Diese beiden sind spezifisch für das DOM und werden von `solid-js/web` exportiert.

> Hinweis: Alle fallback-Elemente und Kinder aus der children-render-Funktion werden nicht reaktiv verfolgt. Das ermöglicht die Verwendung von verschachtelten States und isoliert die Reaktivität besser.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Einfacher referentiell-gebundener Iterations-Kontrollfluss.

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

Der optionale zweite Parameter ist ein index-Signal:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

## `<Show>`

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

Der Show-Kontrollfluss wird verwendet, um das Rendern einer Komponente von einer Bedingung abhängig zu machen. Sie ist vergleichbar mit dem ternären Operator (`a ? b : c`) in der Form eines JSX-Templates.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show kann auch benutzt werden, um Inhalte an ein bestimmtes Datenmodell zu koppeln. Bspw. wird die Funktion erneut ausgeführt, wennn das User-Model ersetzt wird.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Nützlich für Fälle, in denen es mehr als 2 einander ausschließende Bedingungen gibt. Kann benutzt werden, um Dinge wie einfaches Routing zu machen.

```jsx
<Switch fallback={<div>Not Found</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

Match unterstützt auch Kind-Elemente als bedingten Kontrollfluss.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Unbedingte Listen-Iteration (Reihen werden nach Index iteriert). Das ist nützlich, wenn es konzeptionell keinen Schlüssel gibt, etwa wenn die Daten aus Primitiven bestehen und der Index gleichbleibend sein soll statt die darin referenzierten Werte.

Das Listenelement (im Beispiel item) ist ein Signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Als optionalen zweiten Parameter wird der Index als Zahl übergeben:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Fängt ungefangene Fehler und rendert Fallback-Inhalte.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Unterstützt auch eine Callback-Form, die den Fehler und eine Reset-Funktion übergibt.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

Eine Komponente, die alle Ressourcen verfolgt, die darunter gelesen werden und einen Fallback-Platzhalter anzeigt, bis diese aufgelöst sind. Was `Suspense` von `Show` unterscheidet ist, dass es nicht-blockierend funktioniert, so dass beide Zweige gleichzeitig existieren, selbst wenn sie nicht gegenwärtig im DOM eingehängt sind.

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Experimentell)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` erlaubt es, parallel mehrere `Suspense` und `SuspenseList` Komponenten zu nutzen. Es kontrolliert die Reihenfolge, in welcher der Inhalt gezeigt wird, um Layout-Flackern zu vermeiden und hat Optionen, Fallback-Zustände auszuhängen oder zu verstecken.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

SuspenseList ist noch experimentell und hat keine volle SSR-Unterstützung.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

Diese Komponente lässt eine änderbare beliebige Komponente oder Tag einfügen und leitet die Props an diese weiter.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

Dieser Fluss hängt das Element im Mount-Node ein. Nützlich, um modale Dialoge außerhalb des Seitenlayouts einzufügen. Events propagieren weiterhin durch die Komponentenhierarchie.

Das Portal wird automatisch in ein `<div>` eingehängt, es sei denn, das Ziel ist document.head. `useShadow` platziert das Element in ein Shadow-Root, um die Styles zu isolieren und `isSVG` wird benötigt, um in ein SVG-Element einzufügen, da dabei kein`<div>` eingefügt werden darf.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Spezielle JSX-Attribute

Generell versucht Solid, sich an die DOM-Konventionen zu halten. Die meisten Props werden als Attribute für native Elemente gehandhabt und Eigenschaften von Web Components, aber ein paar von ihnen haben ein besonderes Verhalten.

Für benutzerdefinierte Attribute innerhalb eines Namespaces in Typescript muss man Solid's JSX-Namespace erweitern:

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:____
    }
    interface ExplicitProperties {
      // prop:____
    }
    interface ExplicitAttributes {
      // attr:____
    }
    interface CustomEvents {
      // on:____
    }
    interface CustomCaptureEvents {
      // oncapture:____
    }
  }
}
```

## `ref`

Refs sind ein Weg, um Zugriff auf die unterliegenden DOM-Elemente vom JSX aus zu bekommen. Während es richtig ist, dass man einfach ein Element in eine Variable speichern kann, ist es besser, die Komponenten im JSX-Fluss zu belassen. Refs werden beim Rendern befüllt, aber bevor die Elemente ins DOM eingehängt werden. Es gibt sie in zwei Sorten.

```js
// Einfache Variable
let myDiv;

// Man verwende onMount oder createEffect, um die ref nach dem Einhängen ins DOM zu verwenden
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Oder eine Callback-Function (die vor dem Einhängen ins DOM ausgeführt wird)
<div ref={el => console.log(el)} />
```

Refs können auch in Komponenten verwendet werden. Sie müssen darin aber auch verbunden werden.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />;
}

function App() {
  let myDiv;
  onMount(() => console.log(myDiv.clientWidth));
  return <MyComp ref={myDiv} />;
}
```

## `classList`

Ein Helfer, der `element.classList.toggle` nutzt. Er nimmt ein Objekt, dessen Schlüssel CSS-Klassennamen sind und setzt diese, wenn der damit referenzierte Wert true ist.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Der Style-Helfer von Solid funktioniert entweder mit einem String oder einem Objekt. Anders als Reacts version nutzt Solid `element.style.setProperty` unter der Haube. Somit werden CSS-Variablen unterstützt, allerdings auch die klein geschriebenen, mit Bindestrichen getrennten CSS-Attributnamen. Dies führt tatsächlich zu mehr Geschwindigkeit und Konsistenz mit der SSR-Ausgabe.

```jsx
// string
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// object
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// css variable
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

Die beiden funktionieren genauso wie die entsprechenden Eigenschaften. Wenn man einen String übergibt, wird dieser gesetzt. **Vorsicht!!** `innerHTML` mit irgendwelchen Daten zu füttern, die der Nutzer beeinflussen kann, macht einen potentiellen Angriffsvektor für bösartige Attacken auf. `textContent` wird normalerweise nicht benötigt, ist aber tatsächlich eine Geschwindigkeitsoptimierung, wenn die Kind-Inhalte ausschließlich Text sind, da damit die normale Abgleichsroutine umgangen werden kann.

```jsx
<div textContent={state.text} />
```

## `on___`

Event-Handler in Solid haben typischerweise die Form von `onclick` oder `onClick` je nach Stil. Der Event-Name ist immer klein geschrieben. Solid verwendet halb-synthetische Event-Delegation für normale UI-Events, die zusammengesetzt werden und bubbeln. Das verbessert die Geschwindigkeit dieser gewöhnlichen Events.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid unterstützt auch die Möglichkeit, ein Array an Stelle eines Event-Handlers zu übergeben, um einen Wert an den ersten Parameter des Event-Handlers zu binden. Dabei wird kein `bind` verwendet oder eine zusätzliche Closure erzeugt, daher ist es eine hochgradig optimierte Möglichkeit, Events zu delegieren.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events können nicht neu gebunden werden und die Bindungen sind nicht reaktiv. Der Grund dafür ist, dass es generell mehr Zeit kostet, Event-Listener anzubinden und zu entfernen. Da Events natürlich aufgerufen werden, gibt es keine Notwendigkeit für Reaktivität - falls gewünscht, kann man den Handler einfach optional machen.

```jsx
// Falls definiert, wird der Handler aufgerufen, ansonsten nicht.
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

Für andere Events, etwa welche mit unüblichen Namen oder welche, die nicht delegiert werden sollen, gibt es den `on`-Namespace. Dieser gibt eine zusätzliche Möglichkeit, Event-Listener einzuhängen.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

Das sind benutzerdefinierte Direktiven. Auf eine Art sind sie ein syntaktischer Zucker über ref, aber erlauben es, sehr einfach, multiple Direktiven an ein einzelnes Element zu binden. Eine Direktive ist einfach eine Funktion mit der folgenden Signatur:

```ts
function directive(element: Element, accessor: () => any): void;
```

Directive Funktionen werden während des Renders aufgerufen, aber bevor das Element ins DOM eingebunden wird. Man kann darinnen alles machen, was man möchte, einschließlich Signale erzeugen, Effekte, Clean-Up-Funktionen registrieren, etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

Um Direktiven mit TypeScript zu verwenden, muss man den JSX-Namespace erweitern.

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      model: [() => any, (v: any) => any];
    }
  }
}
```

## `prop:___`

Erzwingt die Behandlung als Eigenschaft statt als Attribut.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Erzwingt die Behandlung als Attribut statt als Eigenschaft. Nützlich für Web Components, bei denen man Attribute setzen möchte.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solids JSX-Compiler verwendet eine einfache Heuristik für reaktives Verpacken und verzögerte Evaluierung von JSX-Ausdrücken. Erhält er einen Funktionsaufruf, ein Zugriff auf Props, oder JSX? Falls ja, werden diese in einen getter verpackt, wenn sie an native Elemente, Komponenten oder Effekte übergeben werden.

Das zu wissen, hilft uns, die unnötige Behandlung von Dingen zu vermeiden, von denen wir wissen, dass sie sich nicht ändern werden, indem wir sie außerhalb des JSX addressieren. Eine einfache Variable wird nicht verpackt. Wir können dem Compiler auch manuell mitteilen, dass er einen Wert nicht verpacken soll, indem wir ihm einen einfachen Dekorator `/* @once */` voranstellen.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

Das funktioniert auch bei Kind-Elementen.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
