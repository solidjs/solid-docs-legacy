Signal adalah nilai yang dapat dilacak, tetapi mereka hanya satu setengah dari persamaan. Untuk melengkapi itu sebuah pengamat (observer) yang bisa diperbarui oleh value tersebut. Sebuah _effect_ adalah salah satu pengamat; dimana berjalan yang bergantung pada signal.

Sebuah effect bisa dibuat dengan mengimport `createEffect` dari `solid-js` dan menyediakannya sebuah fungsi. Effect akan otomatis menganut ke signal apapun yang dibaca selama eksekusi fungsi dan menjalankan kembali ketika ada perubahan.

Jadi ayo buat sebuah Effect yang berjalan kembali kapanpun `count` berubah:

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

Untuk memperbarui Signal `count`, kita akan memberikan handler ketika tombol ditekan (click handler) ke tombol kita:

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

Sekarang jika ditekan tombolnya akan menampilkan tulisan ke console. Ini relatif contoh sederhana, tapi untuk paham bagaimana Solid bekerja, kamu harus membayangkan bahwa setiap expression di JSX memiliki effect tersendiri dan di eksekusi kembali kapanpun tergantung dari signal yang berubah. Inilah cara bagaimana semua rendering bekerja di Solid: dari perspektif Solid, _semua rendering hanya sebuah efek samping dari sistem yang reaktif_

> Effect yang dibuat developer dengan `createEffect` berjalan setelah proses rendering telah selesai dan kebanyakan digunakan untuk menjadwalkan sebuah pembaruan yang berinteraksi dengan DOM. Jika kamu ingin memodifikasi DOM lebih awal, gunakan [`createRenderEffect`](https://www.solidjs.com/docs/latest/api#createrendereffect).
