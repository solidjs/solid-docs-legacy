JSX dapat menggunakan JavaScript untuk mengontrol aliran logika di template. Namun, tanpa Virtual DOM, penggunaan hal-hal naif seperti `Array.prototype.map` akan sia-sia saja untuk membuat ulang semua node DOM pada setiap pembaruan. Alih-alih, pustaka Reaktif biasanya menggunakan pembantu template. Pada Solid, kami membungkusnya dalam komponen.

Aliran kontrol yang paling dasar adalah percabangan bersyarat. Kompiler Solid cukup pintar untuk menangani ekspresi ternaries (`a ? b : c`) dan boolean (`a && b`) secara optimal. Namun, sering kali lebih mudah dibaca menggunakan komponen `<Show>` pada Solid.

Dalam contoh ini, kami hanya ingin menampilkan tombol yang sesuai dan mencerminkan keadaan saat ini (apakah pengguna login atau tidak). Perbarui JSX menjadi:
```jsx
<Show
  when={loggedIn()}
  fallback={<button onClick={toggle}>Log in</button>}
>
  <button onClick={toggle}>Log out</button>
</Show>
```
Prop `fallback` bertindak sebagai `else` dan akan ditampilkan jika kondisi yang diteruskan ke `when` tidak benar/false.

Sekarang ketika kamu mengklik tombol, itu akan berubah bolak-balik seperti yang diharapkan.
