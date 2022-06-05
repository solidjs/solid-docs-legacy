# Introduzione

Questo tutorial interattivo ti guiderà e ti aiuterà a capire come funzionano gli API di Solid. Puoi anche guardare la lista di API e guide per imparare di più su come funziona Solid.

Abbiamo anche un tutorial fatto a posta per qualcuno che ha appena iniziato (work-in-progress!)
[qua](https://docs.solidjs.com/guides/getting-started-with-solid/welcome).

# Cos'è Solid?

Solid è una libreria JavaScript per costruire applicazioni web interattive.
Con Solid, puoi utilizzare la tua conoscenza di HTML e JavaScript per costruire componenti che potranno essere riutilizzabili nella tua applicazione.
Solid ti da tutti gli strumenti per rendere i tuoi componenti _reattivi_ : codice JavaScript dichiarativo che collega l'interfaccia utente con i dati che usa e che crea.

# Anatomia di un' applicazione SolidJs

Un'applicazione SolidJs è composta da funzioni che noi chiameremmo componenti. Guardiamo la nostra funziona `HelloWorld` sulla destra: ritorna direttamente un `div`! Questa combinazione di HTML e JavaScript è chiamata JSX. Solid utilizza un compiler che trasforma queste tag in un DOM node.

JSX ti permette di utilizzare la maggior parte degli elementi HTML nella nostra applicazione, però ti permette anche di crearne. Una volta che abbiamo dichiarato la nostra funzione `HelloWorld`, possiamo utilizzarla all' interno della nostra applicazione con la tag `<HelloWorld>`.

Il punto principale per una qualsiasi applicazione che utilizzi Solid, è la funzione `render`.
Prende une argomenti, una funzione che rappresenta il codice della nostra applicazione e un elemento già esistente nel HTML, che utilizzerà per montare la nostra applicazione.

```jsx
render(() => <HelloWorld />, document.getElementById('app'));
```

# Come affrontare questi tutorial.

Ogni lezione nel tutorial rappresenta una funzionalità di Solid e un esempio per provarlo.
Puoi fare un click sul bottone "Risolvi" per vedere la soluzione oppure "Ripristina" per tornare indietro. Il code editor stesso ha una console e un output dove puoi vedere il codice compilato.
Guardalo se sei curioso come Solid genera il codice.

Divertiti!
