JSX utilizza una sintassi simile al HTML che abbiamo visto negli esempi precedenti ed è fondamentale
per creare componenti in Solid.

JSX aggiunge espressioni dinamiche che ti permette di riferire variabili e funzioni nel tuo HTML,
utilizzando la sintassi `{ }`.

In questo esempio, includiamo la stringa `name` nel nostro HTML usando `{name}` in un div.
Allo stesso modo, includiamo un elemento HTML che è stato assegnato direttamente alla variabile `svg`.

A differenza di altre framework che utilizzano JSX, Solid cerca di rispettare gli standard HTML
il più possibile, permettendoti di fare copia e incolla da Stack Overflow oppure dai template builders che i tuoi designer utilizzano.

Ci sono 3 cose principali che previene JSX a essere visto come un superset di HTML:

1. JSX non ha elementi void. Questo significa che tutti gli elementi devono avere una tag che gli chiude oppure
   che si chiudono da soli. Ricordati questo quando copi elementi come `<input>` oppure `<br>`.

2. JSX deve ritornare un solo elemento. Per rappresentare più elementi insieme, utilizza un Fragment:

   ```jsx
   <>
     <h1>Title</h1>
     <p>Some Text</p>
   </>
   ```

3. JSX non sopporta commenti HTML `<!--...-->` oppure tag speciali come `<!DOCTYPE>`.

Però JSX supporta gli SVG. Proviamo a copiare un paio di SVG nel nostro componente:

```jsx
<svg height='300' width='400'>
  <defs>
    <linearGradient id='gr1' x1='0%' y1='60%' x2='100%' y2='0%'>
      <stop offset='5%' style='stop-color:rgb(255,255,3);stop-opacity:1' />
      <stop offset='100%' style='stop-color:rgb(255,0,0);stop-opacity:1' />
    </linearGradient>
  </defs>
  <ellipse cx='125' cy='150' rx='100' ry='60' fill='url(#gr1)' />
  Sorry but this browser does not support inline SVG.
</svg>
```
