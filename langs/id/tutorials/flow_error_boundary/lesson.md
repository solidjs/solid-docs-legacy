Kesalahan/error JavaScript pada UI seharusnya tidak merusak seluruh aplikasi. Error boundaries adalah komponen yang menangkap error JavaScript di mana pun di pohon komponen turunannya, mencatat kesalahan tersebut, dan menampilkan UI fallback, bukan pohon komponen yang error.

Dalam contoh ini, ada komponen yang membuat aplikasi rusak/crash. Mari kita bungkus dalam Error boundaries yang menampilkan error.

```jsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```
