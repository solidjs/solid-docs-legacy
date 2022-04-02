JSX adalah syntax yang seperti HTML yang kita sudah lihat sebelumnya di dalam banyak contoh yang sudah ada dan itu adalah hal inti untuk membangun komponen-komponen di Solid.
JSX menambahkan _dynamic expressions_ yang memperbolehkan kamu untuk mereferensikan variabel-variabel dan fungsi-fungsi ke dalam HTML menggunakan syntax `{ }`.
Di contoh ini, kita akan memasukan string `name` kedalam HTML kita menggunakan `{name}` didalam sebuah div. Dengan cara yang sama, kita akan memasukan elemen HTML yang langsung ditetapkan ke variabel `svg`.

Tidak seperti framework lain yang menggunakan JSX, Solid mencoba untuk sebisa mungkin mengikuti standar HTML, memperbolehkan sebuah copy paste yang simpel dari jawaban Stack Overflow atau dari template builder dari designer.

Ada 3 perbedaan utama dari JSX dan HTML yang mencegah JSX dilihat sebagai superset dari HTML:
1. JSX tidak memberikan _void element_. Ini artinya semua element harus memiliki sebuah tag penutup atau sebuah _self-close_. Ingat ini ketika mengcopykan sebuah element seperti `<input>` atau `<br>`.
2. JSX harus mengembalikan sebuah Elemen. Untuk merepresentasikan beberapa elemen top level yang banyak, gunakan Fragment element:

   ```jsx
   <>
     <h1>Title</h1>
     <p>Some Text</p>
   </>
   ```
3. JSX tidak mendukung komen HTML `<!--...-->` atau tag spesial seperti `<!DOCTYPE>`

Tapi JSX mendukung SVG. Coba copykan beberapa SVG ke komponen kita:
```jsx
<svg height="300" width="400">
  <defs>
    <linearGradient id="gr1" x1="0%" y1="60%" x2="100%" y2="0%">
      <stop offset="5%" style="stop-color:rgb(255,255,3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <ellipse cx="125" cy="150" rx="100" ry="60" fill="url(#gr1)" />
  Sorry but this browser does not support inline SVG.
</svg>
```
