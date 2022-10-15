# Einleitung

Diese interaktive Anleitung führt Dich durch die Hauptfunktionen von Solid. Du kannst auch die API und Anleitung verwenden, um mehr über Solids Funktionsweise zu erfahren.

Schau auch mal in unserem neuen Einsteiger-Tutorial (in Arbeit!) [hier](https://docs.solidjs.com/tutorials/getting-started-with-solid/) vorbei.

# Was ist Solid?

Solid ist ein JavaScript-Framework, um interaktive Webanwendungen zu erstellen.
Mit Solid kannst Du Deine vorhandenen HTML- und JavaScript-Kenntnisse nutzen, um Komponenten zu erstellen, die innerhalb Deiner Anwendung wiederverwendet werden können.
Solid bietet die Werkzeuge, um Deine Komponenten mit _Reaktivität_ zu versehen: deklarativer JavaScript-Code, der die Benutzeroberfläche mit den Daten verbindet, die er nutzt und erzeugt.

# Anatomie einer Solid-Anwendung

Eine Solid-Anwendung besteht aus Funktionen, die wir Komponenten nennen. Schau Dir die `HelloWorld`-Funktion auf der rechten Seite an: sie gibt direkt ein `div` zurück! Dieser Mix von HTML und JavaScript nennt sich JSX. Solid bringt einen Compiler mit, der diese Tags später in DOM-Knoten umwandelt.

JSX erlaubt es Dir, die meisten HTML-Elemente in Deiner Anwendung zu verwenden, aber es lässt Dich auch neue Elemente erstellen. Sobald wir unsere `HelloWorld`-Funktion deklariert haben, können wir sie als `<HelloWorld>`-Tag überall in unserer Anwendung benutzen.

Der Einstiegspunkt für jede Solid-Anwendung ist die `render`-Funktion. Sie nimmt 2 Argumente entgegen, eine Funktion, in der unser Anwendungscode steckt und ein existierendes DOM-Element im HTML, um ihn daran einzuhängen:

```jsx
render(() => <HelloWorld />, document.getElementById('app'))
```

# Dieses Lernprogramm benutzen

Jede Lektion in diesem Lernprogramm präsentiert eine Solid-Funktionalität und ein Szenario, um sie auszuprobieren. Man kann zu jeder Zeit den Lösen-Knopf drücken, um sich die Lösung anzusehen oder auf Zurücksetzen klicken, um neu zu starten. Der Code-Editor selbst hat eine Konsole und einen Ausgabe-Reiter, in dem man den kompilierten Ausgabe-Code ansehen kann, der aus dem Code erzeugt wird. Schau nach, wenn Du neugierig bist, wie Solid Code generiert.

Viel Spaß!
