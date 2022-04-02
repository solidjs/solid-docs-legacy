Dalam beberapa kasus, kamu perlu berurusan dengan ekspresi bersyarat yang memiliki lebih dari 2 hasil eksklusif. Untuk kasus ini, kami memiliki komponen `<Switch>` dan `<Match>` yang secara kasar memodelkan `switch`/`case` dari JavaScript.

Ini akan mencoba untuk mencocokkan setiap kondisi, jika yang dievaluasi pertama benar, maka akan berhenti. Jika semua gagal, maka akan merender fallback.

Dalam contoh ini, kita dapat mengganti komponen `<Show>` bersarang dengan ini:

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
