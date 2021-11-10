---
title: Vergleich
description: Vergleich zwischen Solid und anderen Frameworks.
sort: 1
---

# Vergleich mit anderen Libraries

Dieser Abschnitt wird nicht vollständig vorurteilsfrei sein, aber ich denke, dass es wichtig ist, zu verstehen, wo die Lösungsansatze von Solid stehen im Vergleich mit anderen Libraries. Dabei geht es nicht um Geschwindigkeit. Für einen abschließenden Blick auf Performance möge man einen Blick auf den [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark) werfen.

## React

React hatte einen großen Einfluss auf Solid. Sein unidirektionaler Datenfluss und explizite Unterteilung von Lesen und Schreiben in der Hooks-API inspirierte Solids API; mehr als den Anspruch, nur eine "Render-Library" anstelle eines Frameworks zu sein. Solid hat feste Meinungen bezüglich der Datenverwaltung in der Anwendungsentwicklung, versucht aber nicht, diese in der Ausführung zu beschränken.

Jedenfalls, so sehr Solid auch mit der Design-Philosophie von React übereinstimmt, so fundamental unterscheidet es sich in seiner Funktionsweise. React verwendet ein virtuelles DOM, Solid nicht. Reacts Abstraktion ist eine von oben nach unten gehende Unterteilung in getrennte Komponenten, deren render-Methoden immer wieder aufgerufen und das Ergebnis abgeglichen wird. Solid rendert hingegen jedes Template nur einmal, konstruiert seinen reaktiven Graph und erst dann werden die Anweisungen für feinere Änderungen ausgeführt.

#### Migrationshilfe:

Solids Aktualisierungsmethode ist ganz anders als die von React, oder als React + MobX. Statt an Funktionale Komponenten als Render-Funktion zu denken, denke man an einen `constructor`. Man sollte sich vor Destructuring oder verfrühtem Zugriff auf Props in Acht nehmen, durch die man die Reaktivität verlieren kann. Solids Primitiven haben keine Beschränkungen wie die Hooks-Regeln, also kann man sie ganz nach Belieben einsetzen. Man braucht keine keys bei Listen, um ein korrektes Verhalten zu ermöglichen. Zuguterletzt gibt es kein VDOM, also ergeben imperative VDOM APIs wie `React.Children` und `React.cloneElement` keinen Sinn. Ich ermutige gern dazu, unterschiedliche Wege zur Lösung von Problemen zu finden, die diese auf deklarative Weise nutzen.

## Vue

Solid ist nicht besonders von Vue im Hinsich auf Design beeinflusst, aber die Herangehensweise ist vergleichbar. Beide benutzen Proxies in ihrem jeweiligen reaktiven System mit getter-basierter automatischer Verfolgung. Aber da enden die Gemeinsamkeiten auch schon. Vues feingranulare Abhängigkeitserkennung führt nur zu einem weniger feingranularen virtuellen DOM und Komponenten-System, während Solid die Granularität bis hin zu den direkten DOM-Aktualisierungen beibehält.

Vue bevorzugt Einfachheit, während für Solid Transparenz zählt; obwohl Vues neue Ausrichtung mit Vue 3 eher mit der Herangehensweise von Solid vergleichbar wird. Diese Libraries werden mit der Zeit mehr Ähnlichkeiten aufweisen, je nachdem, wie sie sich weiterentwickeln.

#### Migrationshilfe:

Als eine andere moderne reaktive Library sollte die Migration von Vue 3 ein gewohntes Umfeld bieten. Solids Komponenten sind ziemlich wie die Tag-Templates am Ende von Vues `setup`-Funktion. Man sollte vorsichtig sein, nicht zu viele State-Ableitungen in Berechnungen zu verpacken, stattdessen lieber einfache Funktionen probieren. Reaktivität ist andauernd. Solids Proxies sind absichtlich nur lesbar. Schimpfe nicht darüber, bevor du es nicht probiert hast.

## Svelte

Svelte hat Pionierarbeit bei den vorkompilierten Frameworks geleistet, das Solid ebenfalls zu einem gewissen Grad verwendet. Beide Libraries sind wirklich reaktiv und können sehr kleine Code-Bündel erzeugen, obwohl Svelte hierbei der Gewinner für kleine Demos ist. Solid braucht etwas mehr Explizitheit der Deklarationen, weil es weniger auf implizite Analyse durch den Kompiler setzt, was aber ein Teil dessen ist, was Solid seine überlegene Geschwindigkeit verleiht. Solid macht mehr während der Laufzeit, was bei größeren Anwendungen besser skaliert. Solid's realistische Demo-Anwendung ist 25% kleiner als die gleiche in Svelte.

Beide libraries versuchen, den Entwicklern zu helfen, weniger Code zu schreiben, aber die Herangehensweise ist vollkommen unterschiedlich. Svelte 3 konzentriert sich auf die Optimierung der Einfachheit im Umgang mit lokalen Änderungen, einfache Objekt-Interaktion und bidirektionales Data-Binding. Im Gegensatz dazu fokussiert sich Solid auf den Datenfluss, indem absichtlich CQRS und Unveränderlichkeit der Interfaces verwendet wird. Mit funktionaler Template-Berechnung erlaubt Solid in vielen Fällen den Entwicklern, noch weniger Code zu schreiben als Svelte, obwohl Sveltes Template-Syntax definitiv kürzer ist.

#### Migrationshilfe:

Das Erlebnis für Entwickler ist ausreichend unterschiedlich, dass es trotz einiger weniger Analogien eine sehr andere Erfahrung ist. Komponenten sind in Solid billig, also schrecke man nicht davor zurück, mehr davon zu benutzen.

## Knockout.js

Diese Library verdankt ihre Existenz Knockout. Die ursprüngliche Motivation bestand darin, dessen Modell für feingranulare Abhängigkeitserkennung zu modernisieren. Knockout wurde 2010 veröffentlicht unter unterstützt Microsoft Internet Explorer bis zurück zu IE6, während Solid diesen überhaupt nicht unterstützt.

Knockouts bindings sind nur Strings in HTML, die während der Laufzeit durchlaufen werden. Sie hängen ab von geklontem Kontext ($parent usw...). Solid hingegen nutzt JSX oder Tagged Template Literals für das Templating für eine JS-gebundene API.

Der größte Unterschied ist vermutlich Solids Herangehensweise, Änderunngen zu staffeln, was deren Gleichzeitigkeit gewährleistet, während Knockout mit deferUpdates eine verzögerte Micro-Task-Warteschlange hat.

#### Migrationshilfe:

Wenn du an Knockout gewohnt bist, werden dir Solids Primitiven seltsam vorkommen. Die Aufteilung zwischen Lesen und Schreiben ist absichtlich und nicht nur dazu gedacht, dein Leben zu erschweren. Versuche, ein auf State/Action basierendes mentales (Flux) Modell anzunehmen. Während diese Libraries ähnlich aussehen, bevorzugen sie unterschiedliche empfohlene Vorgehensweisen.

## Lit & LighterHTML

Diese Libraries sind unglaublich ähnlich mit und hatten einigen Einfluss auf Solid. Vor allem, dass der von Solid kompilierte Code eine sehr ähnliche Methode verwendet, um das DOM zu rendern. Template-Elemente zu klonen und Kommentar-Platzhalter zu verwenden ist eine Gemeinsamkeit zwischen Solid und diesen Libraries.

Der größte Unterschied ist, dass während diese Libraries kein virtuelles DOM verwendet, rendern sie wie dieses auch von oben nach unten, was es erfordert, die Komponenten zu partitionieren, um die Dinge vernünftig zu halten. Im Gegensatz dazu verwendet Solid eine feingranulare Reaktivität, um nur die Dinge zu ändern, die sich auch tatsächlich ändern sollen und damit diese Technik nur für das initiale Rendern benötigt. Diese Herangehensweise Diese Herangehensweise profitiert von der anfänglichen Geschwindigkeit, die nur nativem DOM zur Verfügung steht und hat gleichzeitig den performantesten Weg, Änderungen vorzunehmen.

#### Migrationshilfe:

Diese Libraries sind ziemlich minimal und es ist leicht, darauf aufzubauen. Allerdings sollte man bedenken, dass `<MyComp/>` nicht nur ein HTMLElement (Array oder Funktion) ist. Man sollte versuchen, die Dinge im JSX-Template zu behalten. Hoisting funktioniert meistenteils, aber es ist am Besten, dies als eine render-Library zu behandeln und nicht als HTMLElement-Fabrik.

## S.js

Diese Library hatte den größten Einfluss auf Solids reaktives Design. Solid verwendete S.js intern für ein paar Jahre, bis sich die Wege der beiden Libraries aufgrund des unterschiedlichen Funktionsumfangs trennten. S.js ist heute eine der effizientesten reaktiven Libraries. Sie modelliert alles aus synchronen Zeitschritten wie ein digitaler Schaltkreis und sichert die Konsistenz ohne die komplizierteren Mechanismen, die man in Libraries wie MobX findet. Solids Reaktivität ist eine Art Hybrid zwischen S.js und MobX. Das ergibt bessere Performance als die meisten reaktiven Libraries (Knockout, MobX, Vue), während die Einfachheit des mentalen Modells für die Entwickler beibehalten wird. S.js ist letztendlich dennoch die performantere reaktive Library, obwohl der Unterschied kaum merklich ist, von den gekünstelten Benchmarks einmal abgesehen.

## RxJS

RxJS ist eine reaktive Library. Während Solid eine ähnliche Idee von Observable-Datenströmen hatte, nutzt es eine deutlich andere Anwendung des Beobachter-Patterns. Während Signals wie eine einfache Version eines Observables sind (nur die next-Methode), das Muster der automatischen Erkennung von Abhängigkeiten ersetzt RxJS hunderte oder so Operatoren. Solid hätte den gleichen Ansatz wählen können, und tatsächlich gab es in einer früheren Version ähnliche Operatoren, aber in den meisten Fällen ist es eher unkompliziert, die eigene Transformations-Logik in einer Berechnung zu schreiben. Während Observables kalt starten, an einzelne Empfänger und Push-basiert sind, ist bei vielen clientseitigen Problemen ein warmer Start und mehrere Empfänger nützlicher, wie es bei Solid standardmäßig gemacht wird.

## Andere

Angular und ein paar andere populäre Libraries fehlen auffallend in diesen Vergleichen. Mangel an Erfahrung damit verhindern einen adäquaten Vergleich. Generell hat Solid wenig gemeinsam mit größeren Frameworks, was einen direkten Vergleich erschwert.
