Tag `<Dynamic>` berguna saat kamu merender sesuatu dari data. Ini dapat meneruskan string untuk elemen asli atau fungsi komponen dan akan merendernya dengan sisa props yang diberikan.

Ini lebih ringkas daripada menulis banyak komponen `<Show>` atau `<Switch>`.

Di contoh ini, kita dapat mengganti `<Switch>` dengan:

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

dengan:

```jsx
<Dynamic component={options[selected()]} />
```
