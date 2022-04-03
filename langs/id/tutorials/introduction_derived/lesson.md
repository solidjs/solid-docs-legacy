Kita telah melihat bahwa kapanpun kita mengakses sebuah signal didalam JSX, secara otomatis akan memperbarui tampilan dengan signal yang berubah. Tapi fungsi komponen itu sendiri hanya tereksekusi satu kali.

Kita bisa membuat ekspresi baru yang tergantung dengan signal dengan membungkus signal tersebut dengan sebuah fungsi. Fungsi yang mengakses sebuah signal juga secara efektif merupakan signal juga: ketika signal yang dibungkusnya berubah ia akan mengembalikan hasil pembaruannya ke manapun yang membaca nilainya.

Mari kita perbarui Counter kita untuk mengalikannya dengan 2 yang dibuat oleh fungsi `doubleCount`:

```jsx
const doubleCount = () => count() * 2;
```

Selanjutnya kita bisa memanggil `doubleCount` seperti sebuah sigmal didalam JSX:

```jsx
return <div>Count: {doubleCount()}</div>;
```

Kita memanggil fungsi seperti ini _derived signals_ (signal turunan) karena mereka mendapatkan reaktivitas mereka dari signal yang mereka akses. Mereka tidak menyimpan nilainya sendiri (jika kamu membuat signal turunan tapi tidak pernah memanggilnya, itu akan dihilangkan dari hasil keluaran Solid seperti fungsi apapun yang tidak digunakan) tapi mereka akan memperbarui effect apaapun yang bergantung kepada mereka, dan mereka akan memicu rerender jika termasuk dalam sebuah view.
