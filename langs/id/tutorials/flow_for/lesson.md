Komponen `<For>` adalah cara terbaik untuk melakukan pengulangan array objek. Saat array berubah, `<For>` akan memperbarui atau memindahkan item di DOM daripada membuatnya ulang. Mari kita lihat contoh berikut ini.

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```

Komponen `<For>` memiliki satu properti yang disebut `each`, tempat kamu memberikan array untuk diulang.

Kemudian, alih-alih menulis node secara langsung antara `<For>` dan `</For>`, kamu akan memberikan _callback_. Ini adalah fungsi yang mirip dengan [`map` callback](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#parameters) pada JavaScript. Untuk setiap elemen dalam array, callback dipanggil dengan elemen sebagai argumen pertama dan indeks sebagai argumen kedua. (dalam contoh ini adalah `cat` dan `i`.) Kemudian kamu dapat menggunakan mereka yang ada di callback, yang akan mengembalikan node yang akan dirender.

Perlu diingat bahwa indeks adalah _signal_, bukan konstanta. Ini karena `<For>` "dikunci dengan referensi": setiap node yang dirender akan digabungkan ke elemen dalam array. Dengan kata lain, jika sebuah elemen mengubah penempatan dalam array, daripada dihancurkan dan dibuat ulang, node yang sesuai akan bergerak dan indeksnya akan berubah.

Prop `each` mengharapkan array, tetapi kamu dapat mengubah objek iterable lainnya menjadi array dengan utilitas seperti [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from), [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), atau [`spread syntax`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).