---
title: Pendahuluan
description: Panduan untuk cara memulai menggunakan Solid.
sort: 0
---

# Pendahuluan

## Mencoba Solid

Sejauh ini cara termudah untuk mulai menggunakan Solid adalah dengan mencobanya secara online. REPL kami di https://playground.solidjs.com adalah cara terbaik untuk mencoba ide-ide kamu. Sama halnya dengan https://codesandbox.io/ dimana kamu dapat mengubah semua contoh yang kami sediakan.

Atau, kamu juga dapat menggunakan template-template [Vite](https://vitejs.dev/) sederhana kami dengan menjalankan perintah-perintah dibawah ini pada terminal kamu:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

Atau untuk pengguna TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

## Belajar Solid

Solid pada dasarnya adalah bagian-bagian kecil yang dapat di komposisikan sehingga kamu dapat menggunakannnya sebagai blok-blok bangunan untuk membuat sebuahaplikasi. Bagian-bagian ini pada umumnya terdiri dari fungsi-fungsi yang terbuat dari API tingkat-atas yang dangkal. Untungnya, kamu tidak perlu tahu tentang semua hal itu untuk memulai.

Dua tipe utama dari blok-blok bangunan yang kamu punya adalah Komponen dan Primitif-Primitif Reaktif.

Komponen adalah fungsi yang dapat menerima properti objek dan mengembalikan elemen JSX termasuk elemen DOM asli dan komponen lainnya. Mereka dapat di ekspresikan sebagai elemen JSX dalam bentuk PascalCase: 

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Komponen itu ringan karena mereka tidak stateful dan tidak memiliki instance. Sebaliknya, mereka berfungsi sebagai factory functions untuk element DOM dan Primitif-Primitif Reaktif.

Reaktivitas halus dari Solid dibangun di atas 3 primitif sederhana: Signals, Memo, dan Effects. Bersama-sama, mereka membentuk mesin pelacakan sinkronisasi otomatis yang memastikan tampilan kamu tetap terbarui. Komputasi-komputasi reaktif mengambil bentuk sebagai ekspresi-ekspresi yang terbungkus fungsi yang dieksekusi secara bersamaan.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Kamu dapat mempelajari lebih dalam tentang [Reaktifitas pada Solid](#reaktifitas) dan [Rendering pada Solid](#rendering).

## Berpikir dengan cara Solid

Desain Solid mengambil beberapa pendapat tentang prinsip dan nilai yang dapat membantu kita membuat website dan aplikasi yang terbaik. Akan lebih mudah untuk mempelajari dan menggunakan Solid ketika kamu paham tentang filosofi dibaliknya.

### 1. Data yang Deklaratif

Data yang deklaratif adalah praktik mengikat deskripsi dari sebuah perilaku data ke deklarasinya. Ini memungkinkan untuk komposisi yang mudah dengan mengemas semua aspek perilaku dari data tersebut pada satu tempat.

### 2. Komponen yang Hilang

Sudah cukup sulit untuk menyusun komponen-komponen kamu tanpa perlu mempertimbangkan pembaruan. Pembaruan di Solid betul-betul tidak bergantung terhadap komponen. Fungsi komponen hanya dipanggil satu kali saja lalu tidak ada lagi. Komponen-komponen ada hanya untuk mengatur kode kamu dan sedikit hal lainnya.

### 3. Pemisahan Membaca/Menulis

Kontrol yang presisi dan dapat diprediksi membuat sistem menjadi lebih baik. Kita tidak membutuhkan immutability yang sesungguhnya untuk memaksakan unidirectional flow, kita hanya perlu kemampuan untuk membuat keputusan sadar, yang mana yang mungkin ditulis dan yang mana yang tidak, oleh kostumer.

### 4. Sederhana lebih baik daripada mudah

Sebuah pelajaran yang dapat diambil dari Reaktifitas halus (fine-grained). Konvensi yang eksplisit dan konsisten bahkan jika membutuhkan lebih banyak usaha tidak akan sia-sia. Karena tujuannya adalah menyediakan alat-alat minimal sebagai dasar/pondasi untuk membangun.

## Web Components

Solid lahir dengan keinginan untuk membuat Web Components sebagai "first class citizens". Seiring waktu, desain dari solid berkembang dan tujuannya pun berganti. Tetapi, Solid tetap menjadi pilihan yang cocok untuk pengguna Web Components. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) membolehkan kamu untuk menulis dan membungkus fungsi komponen Solid untuk menghasilkan Web Components yang kecil dan mempunyai performa baik. Didalam aplikasi Solid, Solid Element tetap dapat memanfaatkan Context API dari Solid, dan dukungan Shadow DOM isolated styling dari Solid Portals. 

## Me-render di Server

Solid memiliki solusi untuk melakukan render di server yang dynamic yang memungkinkan kamu mendapatkan pengalaman isomorphic development yang sesungguhnya. Melalui penggunaan Resource Primitif kami, async data requests dapat dengan mudah dibuat dan yang lebih penting, secara otomatis diserialisasi dan disingkronkan antara klien dan browser.

Karena Solid mendukung rendering secara asinkron dan streaming di server, kamu dapat menulis kode kamu dengan satu cara dan membuatnya dapat dieksekusi di server. Yang berarti fitur seperti [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) dan pemecahan kode dapat bekerja begitu saja di Solid.

Untuk informasi lebih lanjut, silahkan baca [Panduan Server](#rendering-di-server)

## Tanpa Kompilasi?

Membenci JSX? Tidak keberatan melakukan pekerjaan manual untuk membungkus ekspresi-ekspresi, kinerja yang lebih buruk, dan ukuran bundel yang lebih besar? Secara alternatif, kamu dapat membuat aplikasi Solid menggunakan Tagged Template Literals atau HyperScript di lingkungan tanpa kompilasi.

Kamu dapat menjalankan langsung dari browser menggunakan [Skypack](https://www.skypack.dev/):

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

Ingat kamu tetap harus memerlukan library DOM Expressions yang sesuai untuk membuat mereka bekerja dengan TypeScript. Kamu dapat menggunakan Tagged Template Literals dengan [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) atau HyperScript dengan [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
