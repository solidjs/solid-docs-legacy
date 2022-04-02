Seiring kamu membuat aplikasi, kamu ingin memecah kode kamu untuk modularitas dan reusabilitas yang lebih baik. Di Solid, cara utama untuk melakukan itu adalah membuat komponen.

Komponen itu hanya sebuah satu-satunya fungsi seperti `HelloWorld()` yang kita gunakan seajuh ini. Apa yang membuat mereka spesial biasanya mengembalikan JSX dan bisa dipanggil JSX di komponen lain.

Dalam contoh ini, kita coba tambahkan komponen `Nested` kedalam aplikasi kita. Kita akan mendefinisikannya di file lain, meskipun kamu bisa menuliskannya di file yang sama. Pertama kita harus mengimportnya:

```js
import Nested from "./nested";
```

Kemudian kita butuh menambahkan komponen kedalam JSX kita. Sama seperti sebelumnya, kita sekarang memiliki banyak elemen yang kita mau untuk kembalikan, jadi bungkus elemen-elemen tersebut kedalam Fragment:

```jsx
function App() {
  return (
    <>
      <h1>This is a Header</h1>
      <Nested />
    </>
  );
}
```

Ketika komponen parent melakukan render untuk pertama kalinya, peristiwa itu akan mengeksekusi fungsi `Nested()` dan tidak akan memanggilnya lagi. Semua pembaruan yang diterapkan oleh Sistem Reaktivitas Solid akan kita bahas dalam beberapa materi selanjutnya.
