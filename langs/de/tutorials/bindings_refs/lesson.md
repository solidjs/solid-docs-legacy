Man kann immer die Referenz eines DOM-Elements in Solid durch Zuweisung bekommen, da das JSX echte DOM-Elemente erzeugt. Zum Beispiel:

```jsx
const myDiv = <div>My Element</div>;
```

Allerdings ist es nützlich, nicht alle Elemente herauszubrechen und sie stattdessen in ein einzelnes JSX-Template zu packen, da dies es Solid erlaubt, die Erzeugung besser zu optimieren.

Stattdessen kann man die Referenz zu einem Element in Solid mit dem `ref`-Attribut bekommen. Refs sind grundsätzlich Zuweisungen wie im obigen Beispiel, die während der Erstellung, aber vor dem Einfügen ins DOM passieren. Man kann einfach eine Variable deklarieren und sie wird zugewiesen:

```jsx
let myDiv;

<div ref={myDiv}>My Element</div>
```

Also holen wir uns eine Referenz zum Canvas und animieren es:

```jsx
<canvas ref={canvas} width="256" height="256" />
```

Refs können auch die Form einer Callback-Funktion annehmen. Das kann nützlich sein, um Logik einzubauen, besonders wenn man nicht erst warten muss, bis das Element eingebunden ist. Zum Beispiel:

```jsx
<div ref={el => /* mache etwas mit el... */}>My Element</div>
```
