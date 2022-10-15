Ein JavaScript-Fehler aus der Benutzeroberfläche sollte nicht die ganze Anwendung kaputt machen. Fehlerbegrenzungen (Error Boundaries) sind Komponenten, die solche Fehler aus ihren Kind-Elementen auffangen, die Fehler vermerken und eine Ausweichansicht anzeigen statt des kaputten Komponentenbaumes.

Eine Komponente hat unser Beispiel kaputtgemacht. Wir stecken sie in eine Fehlerbegrenzung, die den Fehler anzeigt.

```jsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```
