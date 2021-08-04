---
title: FAQ
description: Häufig gestellte Fragen aus der Gemeinschaft.
sort: 2
---

# FAQ

### 1. JSX ohne ein VDOM? Ist das Vapourware? Ich habe prominente Stimmen wie die der Autoren anderer Frameworks sagen gehört, dies sei nicht möglich.

Es ist möglich, wenn man nicht das Aktualisierungsmodell von React hat. JSX ist eine Template-Domain-spezifische-Sprache wie jede andere. Nur eine, die gewisser Weise flexibler ist. Willkührlichen JavaScript-Code einzufügen kann teilweise eine Herausforderung sein, was aber nicht anders ist als etwa die Unterstützung von Spread-Operatoren. Also nein, das ist keine Vapourware, sondern ein Ansatz, der erwiesenermaßen der Performanteste ist.

Der wahre Vorteil kommt aus der Erweiterbarkeit. Der Kompiler arbeitet für einen, indem er optimale native DOM-Aktualisierungen gibt, man aber die Freiheit von Libraries wie React hat, Komponenten mit Techniken wie Render Props und Komponenten höherer Ordnung an der Seite reaktiver "Hooks" zu schreiben. Magst du nicht, wie der Kontrollfluss von Solid arbeitet? Schreib' deinen eigenen.

### 2. Wie ist Solid so performant?

Wir wünschten, wir könnten es an einer einzelnen Sache festmachen, aber es ist wirklich die Kombination mehrerer wichtiger Designentscheidungen:

1. Explizite Reaktivität, so dass nur die Dinge, die auch reaktiv sind, verfolgt werden.
2. Kompilierung mit Fokus auf die initiale Erstellung. Solid verwendet Heuristiken, um die Granularität zu lockern, damit die Zahl der Berechnungen reduziert werden kann, aber Aktualisierungen granular und performant durchgeführt werden.
3. Reaktive Ausdrücke sind nur Funktionen. Das ermöglicht "verschwindende Komponenten" mit verzögerter Prop-Auswertung ohne unnötige Wrapper und Synchronisationsaufwände.

Dies sind derzeit einzigartige Techniken in einer Kombination, die Solid einen Vorteil gegenüber der Konkurrenz gibt.

### 3. Gibt es React-Compat?

Nein, und wahrscheinlich wird es das nie geben. Während die APIs ähnlich sind und man Komponenten oft mit wenigen Änderungen übertragen kann, ist das Aktualisierungs-Modell fundamental unterschiedlich. React-Komponenten werden wieder und wieder gerendert, so dass Code außerhalb der Hooks sehr anders funktioniert. Die Closures- und Hook-Regeln sind in Solid unnötig, erlauben aber auch Anwendungsweisen, die hier nicht funktionieren.

Vue-compat wäre andererseits machbar. Allerdings gibt es derzeit nocht keine Pläne zur Umsetzung.

### 4. Warum funktioniert Destructuring nicht? Ich habe festgestellt, dass ich das beheben kann, indem ich meine ganze Komponente in eine Funktion verpacke.

Reaktivität findet beim Zugriff auf props und Store-Objekteigenschaften statt. Auf diese von außerhalb einer Verbindung oder reaktiven Komponente zuzugreifen, wird nicht verfolgt. Darinnen ist Destructuring jedoch in Ordnung.

Allerdings sollte man nicht so verantwortungslos sein, seine Komponenten unnötig in Funktionen zu schachteln. Solid hat kein VDOM. Daher lassen alle verfolgten Änderungen die Funktion noch einmal neu laufen, was es zu vermeiden gilt.

### 5. Kannst du Unterstützung für Komponentenklassen hinzufügen? Ich finde die Lifecycles einfacher zu verstehen.

Ich habe nicht die Absicht, Komponentenklassen zu unterstützen. Die Lifecycles von Solid sind an das Timing des reaktiven Systems gebunden und sind künstlich. Man hätte vermutlich eine Klasse daraus machen können, aber aller Code, der keine Event-Handler betrifft, läuft ohnehin im Constructor, einschließlich der Render-Funktion. Es wäre nur mehr Syntax für eine Entschuldigung, die Daten weniger granular zu behandeln.

Man sollte Daten eher anhand deren Verhalten zusammenfassen als anhand der Lifecycles der Komponente. Diese empfohlene Herangehensweise für reaktive Programmierung hat sich seit Jahrzehnten bewährt.

### 6. I hasse JSX wirklich, gibt es vielleicht eine Template-DSL? Oh, ich sehe, du hast Tagged Template Literals/Hyperscript. Vielleicht nehme ich einfach die...

Nein. Keinen Schritt weiter. Wir nutzen JSX auf die gleiche Art wie Svelte seine Templates benutzt, um optimierte DOM-Instruktionen zu erstellen. Die Tagged Template Literal und HyperScript-Lösungen sind auf ihre eigene Art beeindruckend, aber solange es keinen guten Grund gibt wie etwa die Anforderung, dass nicht kompiliert werden darf, sind sie in jeder Hinsicht schlechter. Größere Bundles, langsamere Performance und die Notwendigkeit, Werte manuell zu schachteln.

Es ist gut, Optionen zu haben, aber Solid's JSX ist wirklich die beste Lösung hier. Eine Template-DSK könnte auch toll sein, obwohl sie restriktiver wäre, aber JSX gibt uns so viel kostenlos. TypeScript, existierende Parser, Syntax Highlighting, TypeScript, Prettiert, Autovervollständigung und nicht zuletzt TypeScript.

Andere Libraries haben Unterstützung für diese Features anderweitig hinzugefügt, aber das war ein enormer Aufwand und ist immer noch unperfekt und ein konstanter Wartungsaufwand. Hier nehme ich einen pragmatischen Standpunkt ein.

### 7. Wann benutze ich ein Signal und wann einen Store? Warum sind diese unterschiedlich?

Stores verwalten verschachtelte Datenstrukturen, was sie ideal für Objekte und Modelle macht. Für die meisten anderen Anwendungsfälle sind Signals eine leichtgewichtige und effektive Lösung.

So gern wir die beiden auch in eine einzelne API verschmelzen würden, kann man Primitiven nicht in einen Proxy stecken. Funktionen sind das einfachste Interface und jeder reaktive Ausdruck (einschließlich Zugriff auf den Zustand) kann einfach in eine gesteckt werden, so dass eine universale API zur Verfügung gestellt werden kann. Man kann seine Signale und States benennen, wie man möchte und der Aufwand bleibt minimal. Das Letzte, was wir wollen, ist, dich zu zwingen, `.get()` oder `.set()` zu tippen oder noch schlimmer, `.value`. Immerhin kann das erste in einem Alias gekürzt werden, während das letzte die am wenigsten prägnante Methode ist, eine Funktion aufzurufen.

### 8. Warum kann ich nicht einfach einen Wert in Solids Store zuweisen, wie ich es in Vue, Svelte oder MobX kann? Wo ist das bidirektionale Data-Binding?

Reaktivität ist ein machtvolles Werkzeug, aber auch ein gefährliches. MobX weiß das und hat den strikten Modus und Actions eingeführt, um zu beschränken, wann und wo Aktualisierungen passieren. In Solid, welches mit ganzen Komponentenstrukturen voll Daten arbeitet, wurde es klar, dass wir etwas von React lernen können. Man muss nicht unbedingt unveränderlich sein, so lange man die gleichen Vereinbarungen trifft.

In der Lage zu sein, den State zu aktualisieren ist wohl weit weniger wichtig als die Entscheidung, den State weiterzugeben. Die Möglichkeit, ihn zu unterteilen, ist wichtiig und nur möglich, wenn Lesezugriffe unveränderlich sind. Wir müssen auch nicht die Kosten der Unveränderlichkeit aufbringen, wenn wir trotzdem granular aktualisieren können. Glücklicherweise gibt es reichlich Beispiele, wie man das macht, wie ImmutableJS und Immer. Ironischerweise agiert Solid meistens wie ein umgekehrtes Immer mit seinen veränderbaren Interna und unveränderbaren Schnittstellen.

### 9. Kann ich nur die Reaktivität von Solid ohne den Rest verwenden?

Natürlich. Obwohl es noch kein einzelnes Paket gibt, ist es einfach, Solid ohne den Kompiler zu installieren und nur die reaktiven Primitiven zu verwenden. Eine der Vorteile der granularen Reaktivität ist, dass sie Library-agnostisch ist. In dieser Hinsicht funktioniert nahezu jede reaktive Library auf die gleiche Weise. Das ist die ursprüngliche Inspiration hinter [Solid](https://github.com/solidjs/solid) und der darunterliegenden [DOM Expressions library](https://github.com/ryansolid/dom-expressions), um einen Renderer direkt aus dem reaktiven System zu machen.

Um ein paar Libraries zum Probieren aufzulisten: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github.com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https://github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous), und neuerdings sogar [Vue](https://github.com/vuejs/vue). Es gehört mehr zu einer reaktiven Library als sie an einen Renderer zu hängen wie zum Beispiel [lit-html](https://github.com/Polymer/lit-html), aber dies ist trotzdem eine gute Möglichkeit, sich eine Vorstellung zu verschaffen.

### 10. Hat Solid eine Next.js oder Material-Komponenten-artige Library, die ich benutzen kann?

Unseres Wissens nach nicht. Wenn du Interesse daran haben solltest, eine zu bauen, kannst du uns gern auf unserem [Discord](https://discord.com/invite/solidjs) um Hilfe fragen. Wir haben die Grundlagen, auf die du nur noch aufbauen musst.
