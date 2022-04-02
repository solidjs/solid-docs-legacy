Ini akan berguna untuk menyisipkan elemen di luar alur normal aplikasi. z-index terkadang tidak cukup untuk menangani konteks render untuk elemen mengambang seperti Modals.

Solid memiliki komponen `<Portal>` yang konten turunannya akan disisipkan di lokasi yang kamu pilih. Secara default, elemennya akan dirender dalam `<div>` di `document.body`.

Dalam contoh ini, ada popup informasi yang terpotong. Kita dapat mengatasi ini dengan menariknya keluar dari alur dengan membungkus elemen dalam `<Portal>`:

```jsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Some text you might need for something or other.</p>
  </div>
</Portal>
```
