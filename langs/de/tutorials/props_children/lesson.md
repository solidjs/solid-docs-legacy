Einer der Gründe für die Performanz von Solid ist, dass unsere Komponenten grundsätzlich nur Funktionsaufrufe sind. Aktualisierungen werden weitergegeben, indem der Compiler potenziell reaktive Ausdrücke in Objekt-Getter – Props-Attribute – packt. Man kann sich die Compiler-Ausgabe so vorstellen:

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
Das heißt, dass diese Props-Attribute verzögert – _lazy_ – ausgewertet werden können. Mit dem Zugriff wird so lange gewartet, bis sie tatsächlich verwendet werden. Das behält die Reaktivität bei, ohne Extra-Wrapper oder -Synchronisierungen zu benötigen. Allerdings bedeutet das auch, dass wiederholter Zugriff dazu führen kann, dass Kind-Komponenten oder -Elemente neu erzeugt werden.

Die meiste Zeit über wirst Du nur Attribute ins JSX einfügen, sodass sich daraus kein Problem ergibt. Wenn man allerdings mit Kind-Elementen arbeitet, muss man vorsichtig sein, diese nicht mehrmals zu erzeugen.

Aus diesem Grund hat Solid den `children`-Helfer. Diese Methode erzeugt ein Memo um das `children`-Prop-Attribut und wertet alle verschachtelten reaktiven Referenzen auf Kinder aus, sodass man direkt mit ihnen arbeiten kann.

In diesem Beispiel haben wir eine dynamische Liste und wollen in jedem Kind-Element die `color`-Style-Eigenschaft setzen. Wenn wir direkt mit `props.children` arbeiten, würden wir nicht nur die DOM-Knoten mehrmals erzeugen, sondern `props.children` wäre auch eine Funktion, nämlich das Memo, das von `<For>` zurückgegeben wird.

Lass uns stattdessen den `children`-Helfer innerhalb von `colored-list.tsx` verwenden:
```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```
Um unsere Elemente nun zu aktualisieren, benutzen wir einen Effekt:
```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
