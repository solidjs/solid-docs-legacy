# Einleitung

Willkommen zum Solid-Lernprogramm! Dieses Programm führt Dich an Solids Hauptfunktionen heran. Du kannst auch die API und Anleitung verwenden, um mehr über Solids Funktionsweise zu erfahren.

# Was ist Solid?
Solid ist ein JavaScript-Framework, um interaktive Webanwendungen zu erstellen.
Mit Solid kannst Du deine HTML- und JavaScript-Kenntnisse nutzen, um Komponenten zu erstellen, die innerhalb Deiner App wiederverwendet werden können.
Solid bietet die Werkzeuge, um Deine Komponenten mit _Reaktivität_ zu verbessern: deklarativer JavaScript-Code, der die Benutzerobefläche mit den Daten verbindet, die es nutzt und erzeugt.

# Anatomie einer Solid-Anwendung

Eine Solid-Anwendung besteht aus Funktionen, die wir Komponenten nennen. Schau Dir die `HelloWorld`-Funktion auf der rechten Seite an: sie gibt direkt ein `div` zurück! Dieser Mix von HTML und JavaScript nennt sich JSX. Solid bringt einen Compiler mit, der diese Tags später in DOM-Nodes umwandelt.

JSX erlaubt uns, die meisten HTML-Elemente in unserer Anwendung zu verwenden, aber es lässt uns auch neue Elemente erstellen. Sobald wir unsere `HelloWorld`-Funktion deklariert haben, können wir sie als `<HelloWorld>`-Tag überall in unserer Anwendung benutzen.

Der Einstiegspunkt für jede Solid-Anwendung ist die `render`-Funktion. Sie nimmt 2 Parameter, eine Funktion, in der unser Anwendungscode steckt und ein existierendes DOM-Element im HTML, um diese darin einzubinden:
```jsx
render(() => <HelloWorld />, document.getElementById('app'))
```
# Dieses Lernprogramm benutzen

Jede Lektion in diesem Lernprogramm präsentiert eine Solid-Funktion und ein Szenario, um sie auszuprobieren. Man kann zu jeder Zeit den Lösen-Knopf drücken, um sich die Lösung anzeigen zu lassen oder auf Zurücksetzen klicken, um neu zu starten. Der Code-Editor selbst hat eine Konsole und einen Ausgabe-Reiter, in dem man den kompilierten Ausgabe-Code ansehen kann, der aus dem Code erzeugt wird. Schau nach, wenn Du neugierig bist, wie Solid Code generiert.

Viel Spass!
