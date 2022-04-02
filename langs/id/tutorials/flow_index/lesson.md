Kamu sudah tahu cara merender daftar di Solid menggunakan `<For>`, tetapi Solid juga memiliki komponen `<Index>`, yang akan menyebabkan lebih sedikit perenderan ulang dalam situasi tertentu.

Saat array diperbarui, komponen `<For>` menggunakan persamaan referensial untuk membandingkan elemen dengan status terakhir array. Tapi ini tidak selalu diinginkan.

Dalam JavaScript, primitif (seperti string dan angka) selalu dibandingkan berdasarkan nilai. Saat menggunakan `<For>` dengan nilai primitif atau array dari array, ini dapat menyebabkan banyak rendering yang tidak perlu. Jika menggunakan `<For>` untuk memetakan daftar string ke bidang `<input>` yang dapat diedit masing-masing, `<input>` akan dibuat ulang setiap kali kamu mengubah nilai tersebut.

Komponen `<Index>` disediakan untuk kasus ini. Sebagai aturan praktis, gunakan `<Index>` ketika berhadapan dengan primitif.

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```

Ini mirip dengan `<For>`, tetapi kali ini itemnya adalah _signal_ dan indeksnya tetap. Setiap node yang dirender sesuai dengan tempat dalam array. _Signal_ akan diperbarui setiap kali data di tempat itu berubah.

`<For>` menangani setiap bagian data dalam array, dan posisi data tersebut dapat berubah; `<Index>` bekerja dengan setiap indeks dalam array, dan konten di setiap indeks dapat berubah.