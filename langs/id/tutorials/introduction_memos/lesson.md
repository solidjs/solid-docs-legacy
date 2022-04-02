Biasanya, membungkus signal turunan adalah hal yang cukup. Namun, terkadang berguna juga untuk mengcache value yang bertujuan untuk mengurangi pekerjaan yang terduplikasi. Kita bisa menggunakan memo untuk mengevaluasi sebuah fungsi dan menyimpan haslnya sampai dependensi-dependensinya berubah. Hal ini bagus untuk mencache kalkulasi untuk effect yang memiliki dependensi yang lain dan memitigasi beban pekerjaan yang dibutuhkan untuk operasi yang "mahal" seperti membuat node DOM.

Memo juga bagaikan sebuah penganmat, sama seperti effect, dan juga hanya membaca signal. Sejak mereka mengetahui dependensi dan pengamat, mereka bisa memastikan bahwa mereka hanya berjalan ketika ada perubahan. Ini membuat mereka lebih baik untuk mendaftarkan effect yang mengubah signal. Umumnya, apa yang bisa diturunkan, seharusnya diturunkan juga.

Membuat sebuah Memo semudah kita memasukan fungsi ke `createMemo`, di import dari `solid-js`. Di contoh ini, menghitung value yang semakin lama semakin berat tiap disentuh. Jika kita membungkusnya ke dalam `createMemo`, perhitungannya hanya dilakukan setiap sentuhan:

```jsx
const fib = createMemo(() => fibonacci(count()));
```

Tempatkan `console.log` didalam fungsi `fib` untuk mengonfirmasi sesering apa dia berjalan:

```jsx
const fib = createMemo(() => {
  console.log("Calculating Fibonacci");
  return fibonacci(count());
});
```
