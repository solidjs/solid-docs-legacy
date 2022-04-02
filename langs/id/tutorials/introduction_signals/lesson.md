_Signals_ adalah fondasi reaktivitas Solid. Mereka terdapat nilai yang dapat berubah seiiring waktu; ketika kamu mengubah nilai sebuah signal, otomatis akan memperbarui apapun yang menggunakannya.

Untuk membuat sebuah signal, cobalah import `createSignal` dari `solid-js` dan memamnggilnya dari komponen Counter kita seperti ini:

```jsx
const [count, setCount] = createSignal(0);
```

Argumen diberikan ke inisiator adalah nilai inisial (awal), dan akan mengembalikan nilai berupa array dengan dua fungsi, sebuah getter (pengambil) dan setter (penyetel/pengatur). Dengan [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), kita bisa menamakan kedua fungsi ini apapun yang kita mau, kita bisa menamakan getternya `count` dan setternya `setCount`.

Ini penting untuk diperhatikan bahwa value pertama yang dikembalikan adalah sebuah getter (sebuah fungsi pengembali value saat ini) dan bukanlah value itu sendiri. Ini dikarenakan framework butuh melacak dimana saja signal dibaca dan karena itu bisa diperbarui dengan nilai yang sesuai.

Di dalam materi ini, kita akan menggunakan fungsi `setInterval` JavaScript untuk membuat sebuah penghitung yang secara periodik bertambah.Kita bisa memperbarui signal `count` kita setiap detik dengan menambahkan kode ini ke komponen Counter kita:

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

Setiap detik, kita membaca hitungan yang sebelumnya, menambahkannya dengan satu, dan menetapkan nilai yang baru.

> Signal Solid juga menerima sebuah bentuk fungsi dimana kamu bisa menggunakan nilai sebelumnya untuk menetapkan nilai yang baru
>
> ```jsx
> setCount((c) => c + 1);
> ```

Akhirnya, kita membaca signal kedalam kode JSX kita:

```jsx
return <div>Count: {count()}</div>;
```
