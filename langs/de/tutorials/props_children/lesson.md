Ein Teil davon, was Solid so performant macht, ist, dass unsere Komponenten grundsätzlich nur Funktionsaufrufe sind. Die Art, wie wir Aktualisierungen verteilen ist, dass der Compiler potentiell reaktive Ausdrücke in Objekt-Getter steckt. Man kann sich die Compiler-Ausgabe so vorstellen:

```jsx
// dieses JSX
<MyComp dynamic={mySignal()}>
  <Child />
</MyComp>

// wird zu
MyComp({
  get dynamic() { return mySignal() },
  get children() { return Child() }
});
```
Das heisst, dass diese Props verzögert evaluiert werden können. Mit dem Zugriff wird solange gewartet, bis sie tatsächlich verwendet werden. Das behält die Reaktivität bei, ohne dass fremde Filter oder Synchronisierungen eingeführt werden müssen. Allerdings bedeutet das, dass wiederholter Zugriff dazu führen kann, dass Kind-Komponenten oder -Elemente neu erzeugt werden.

Die meiste Zeit über wirst Du nur Props ins JSX einfügen, so dass sich daraus kein Problem ergibt. Wenn man allerdings mit Kind-Elementen arbeitet, muss man vorsichtig sein, diese nicht mehrmals zu erzeugen.

Aus diesem Grund hat Solid den `children`-Helfer. Diese Methode erzeugt ein Memo um das `children`-Prop und löst die reaktiven Referenzen der Kinder auf, so dass man direkt mit Ihnen interagieren kann.

In diesem Beispiel haben wir eine dynamische Liste und wollen in jedes Kind-Element die `color`-Style-Eigenschaft setzen. Wenn wir direkt mit `props.children` interagieren, würden wir nicht nur die Nodes mehrmals erstellen, sondern könnten auch in `props.children` eine Funktion finden, das Memo, das von `<For>` zurückgegeben wird.

Lass uns stattdessen den `children`-Helfer innerhalb `colored-list.tsx` verwenden:
```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```
Um unsere Elemente zu aktualisieren, benutzen wir einen Effekt:
```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
