# Pengantar

Selamat datang ke tutorial Solid! Dalam tutorial ini kami akan mengantarkan kamu ke fitur utama Solid. Kamu juga bisa merujuk ke API dan panduan-panduan untuk mengatahui lebih lanjut bagaimana Solid bekerja.

# Apa itu Solid?

Solid adalah Kerangka Kerja (Framework) JavaScript untuk membuat aplikasi web yang interaktif.
Dengan Solid, kamu bisa menggunakan HTML yang ada dan Ilmu JavaScript untuk membuat komponen-komponen yang bisa digunakan berulang kali (reusable) di seluruh aplikasi kamu.
Solid menyediakan alat-alat untuk meningkatkan komponen-komponen kamu dengan _reaktivitas_: Kode deklaratif JavaScript yang menghubungkan user interface dengan data yang dibuat dan digunakan.

# Anatomi dari Aplikasi Solid

Sebuah aplikasi solid di bungkus dengan fungsi yang kita panggil "komponen". Coba lihatlah fungsi `HelloWorld` di sebelah kananmu! fungsi itu langsung mengembalikan sebuah `div`! Ini adalah campuran HTML dan JavaScript yang disebut JSX. Solid memiliki compiler yang mengubah tags ini ke DOM nodes setelahnya.

JSX memperbolehkan kamu untuk menggunakan kebanyakan elemen HTML ke dalam aplikasi kita, tapi karena itu juga membuat kamu dapat membuat elemen baru. Setelah kita mendeklarasikan fungsi `HelloWorld`, kita bisa menggunakannya sebagai tag `<HelloWorld>` di dalam aplikasi kita.

Pintu masuk (entry point) untuk Aplikasi Solid apapun adalah fungsi `render`. Fungsi ini membutuhkan 2 Argumen, sebuah fungsi yang membungkus kode aplikasi kita dan sebuah elemen HTML yang sudah ada di HTML yang ingin kita pasang:

```jsx
render(() => <HelloWorld />, document.getElementById("app"));
```

# Memanfaatkan Tutorial Ini

Setiap materi di sebuah tutorial menjelaskan fitur Solid dan sebuah skenario untuk di coba langsung. Kapan saja kamu bisa menekan tombol selesaikan atau atur ulang untuk memulai dari awal. Code editor itu sendiri memiliki console dan tab keluaran dimana kamu bisa melihat hasil compile yang dihasilkan dari kode kamu. Lihatlah jika kamu penasaran bagaimana Solid menghasilkan sebuah kode.

Bersenang-senanglah!
