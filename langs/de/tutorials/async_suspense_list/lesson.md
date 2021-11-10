Manchmal hat man mehrere `Suspense`-Komponenten, die man koordinieren möchte. Ein möglicher Ansatz ist, alles unter ein einzelnes `Suspense` zu packen, aber das limitiert uns zu einem einzigen Ladeschritt. Ein einzelner Fallback-Zustand bedeutet, dass alles immer warten muss, bis der letzte Teil geladen ist. Stattdessen bietet Solid die `SuspenseList`-Komponente, um das Laden zu koordinieren.

Man stelle sich vor, es gibt mehrere `Suspense`-Komponenten wie in unserem Beispiel. Wenn wir sie in eine `SuspenseList` kapseln, die mit der `revealOrder` auf `forwards` eingestellt ist, werden sie in der Reihenfolge, in der sie in der Komponentenstruktur stehen, dargestellt, unabhängig davon, in welcher Reihenfolge sie geladen werden. Das reduziert das Herumspringen der Seite. Man kann `revealOrder` auf `backwards` oder `together` setzen, was die Reihenfolge umkehrt oder wartet, bis alle `Suspense`-Komponenten geladen sind. Zusätzlich gibt es eine `tail`-Option, die man auf `hidden` oder `collapsed` setzen kann. Das überschreibt das normale Verhalten, alle Fallbacks anzuzeigen, damit, kein oder nur das nächste Fallback anzuzeigen, in der Reihenfolge, die `revealOrder` vorgibt.

Unser Beispiel ist derzeit ein wenig unordentlich, was Lade-Platzhalter angeht. Während es alle Daten unabhängig voneinander lädt, zeigen wir oft mehrere Platzhalter an, je nachdem, in welcher Reihenfolge geladen wird. Schachteln wir unsere `ProfilePage`-Komponenten im JSX in eine `<SuspenseList>`:

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={props.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={props.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={props.trivia} />
  </Suspense>
</SuspenseList>
```
