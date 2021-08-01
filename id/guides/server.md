---
title: Server
description: Penjelasan tentang kemampuan sisi-server Solid.
sort: 3
---

# Rendering di Server

Solid menghandel rendering di Server dengan mengkompilasi template JSX menjadi kode string yang akan ditambahkan yang sangat effisien. Kita dapat melakukannya dengan menggunakan plugin babel atau dengan memasukkan `generate: "ssr"` ke presetnya. Untuk mengenerasi kode hydration yang cocok untuk klien dan server kamu bisa memasukkan `hydratable: true`.

Runtime `solid-js` dan `solid-js/web` ditukar dengan non-reaktif counterparts mereka ketika dijalankan di lingkungan node. Untuk lingkungan-lingkungan yang lain kamu harus membundel kode servernya dengan mengeset kondisional eksport ke `node`. Kebanyakan bundlers punya cara masing-masing untuk melakukan ini. Secara umum, kami juga menyarankan untuk menggunakan kondisional eksport `solid` karena kami menyarankan untuk tiap library mengirimkan source mereka dibawah export `solid`.

Membangun untuk SSR pastinya akan membutuhkan sedikit lebih banyak konfigurasi karena kita akan mengenerate ke 2 bundle yang terpisah. Untuk entry klien harus menggunakan `hydrate`:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_Catatan: Kamu bisa merender dan meng-hydrate langsung dari root Document-nya. Ini memungkinkan kita untuk menggambarkan view kita secara utuh di JSX_

Entry server dapat menggunakan satu dari empat pilihan rendering yang sediakan oleh Solid. Tiap pilihan akan menghasilkan output dan sebuah script tag yang nantinya akan di masukkan ke bagian `head` dari `document`.

```jsx
import {
  renderToString,
  renderToStringAsync,
  renderToNodeStream,
  renderToWebStream,
} from "solid-js/web";

// Synchronous string rendering
const html = renderToString(() => <App />);

// Asynchronous string rendering
const html = await renderToStringAsync(() => <App />);

// Node Stream API
pipeToNodeWritable(App, res);

// Web Stream API (Untuk seperti Cloudflare Workers)
const { readable, writable } = new TransformStream();
pipeToWritable(() => <App />, writable);
```

Untuk memudahkan kamu, `solid-js/web` juga mengekspor sebuah fungsi flag `isServer`. Ini berguna karena kebanyakan bundler dapat melakukan 'treeshake' kepada apapun yang berada di dalam flag ini atau mengimpor hanya digunakan oleh kode di bawah flag ini dari klien bundle kamu.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
  // kode disini hanya jalan di server saja
} else {
  // kode disini hanya jalan di browser saja
}
```

## Hydration Script

Untuk bisa meng-hydrate secara progresif bahkan sebelum Solid runtime terload, sebuah script spesial harus di masukkan ke dalam pagenya. Bisa dengan cara digenerate dan dimasukkan melalui `generateHydrationScript` atau disertakan sebagai bagian dari JSX dengan menggunakan tag `<HydrationScript />`.

```js
import { generateHydrationScript } from "solid-js/web";

const app = renderToString(() => <App />);

const html = `
  <html lang="en">
    <head>
      <title>🔥 Solid SSR 🔥</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      ${generateHydrationScript()}
    </head>
    <body>${app}</body>
  </html>
`;
```

```jsx
import { HydrationScript } from "solid-js/web";

const App = () => {
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <HydrationScript />
      </head>
      <body>{/*... rest of App*/}</body>
    </html>
  );
};
```

Ketika meng-hydrate dari document, memasukkan aset-aset (assets) yang tidak tersedia di klien juga dapat mengacaukan beberapa hal. Solid menyediakan komponen `<NoHydration>` yang dimana turunannya dapat bekerja secara normal di server, tapi tidak akan dihydrate di browser.

```jsx
<NoHydration>
  {manifest.map((m) => (
    <link rel="modulepreload" href={m.href} />
  ))}
</NoHydration>
```

## Async dan Streaming SSR

Mekanisme-mekanisme ini dibuat atas pengetahuan Solid tentang bagaimana aplikasi kamu bekerja. Dengan cara menggunakan Suspense dan Resource API di server, daripada melakukan fetching terlebih dahulu lalu me-rendering. Solid men-fetch bersamaan dengan me-render di server sebagaimana yang dilakukan di klien. Kode kamu dan pola-pola eksekusi akan di tulis dengan cara yang sama persis.

Rendering asinkron menunggu sampai semua Suspense selesai dan mengirim hasilnya (atau menulisnya ke dalam sebuah file pada kasus seperti "Static Site Generation").

Streaming memulai flusing konten synchronous ke browser dengan langsung me-rendering Suspense Fallbacks kamu di server. Lalu saat data asinkron selesai di server dia akan mengirimkan data ke stream yang sama, lalu ke klien untuk menyelesaikan Suspense dimana browser menyelesaikan jobnya dan mengganti fallback dengan konten aslinya.

Keuntungan dengan cara ini:

- Server tidak harus mengunggu sampai data asinkron merespon. Aset-aset (Assets) dapat langsung terload lebih cepat di browser, dan user dapat langsung melihat kontennya lebih cepat juga.
- Dibandingkan dengan "clien fetching" seperti JAMStack, pemuatan data mulai di server secara langsung dan tidak perlu menunggu untuk Javascript klien terload.
- Semua data telah diserialisasikan dan di pindahkan dari server ke klien secara otomatis.

## Kekurangan SSR

Solusi "Isomorphic SSR" Solid sangat kuat dimana kamu dapat menulis kode kamu kebanyakan dalam kode basis tunggal (single code base) yang berjalan dengan serupa di kedua lingkungan. Tetapi ada beberapa ekspektasi yang diharapkan dari hydration. Sebagian besar adalah, tampilan yang telah terender di klien akan sama dengan yang terender di server. Tidak perlu sampai dalam hal seperti teksnya, yang penting struktur markupnya harus sama.

Kami menggunakan marker-marker yang terender di server untuk mencocokkan elemen dan "resource locations" di server. Untuk alasan ini klien dan server harus punya komponen-komponen yang sama. Ini biasanya bukanlah masalah, mengingat Solid merender dengan cara yang sama di klien dan server. Tetapi saat ini belum ada cara untuk merender sesuatu di server yang tidak akan terhydrate di klien. Saat ini, belum ada cara untuk meng-hydrate secara partial seluruh halaman, dan tidak mengenerate marker hydration untuk itu. Bisa dibilang, Hydrate semuanya atau tidak sama sekali. Partial Hydration adalah sesuatu yang kami ingin untuk selidiki lebih dalam di masa yang akan datang.

Terakhir, semua resources harus di definisikan di dalam `render` tree. Mereka secara otomatis diserialisasi dan diambil di browser, tapi itu bekerja karena method `render` dan `pipeTo` melacak progres dari rendernya. Sesuatu yang tidak bisa kita lakukan jika mereka dibuat di konteks yang terisolasi. Sama halnya dengan tidak ada reaktifitas di server jadi jangan memperbarui signals di render awal dan mengharapkan mereka ter-refleksi di tree yang lebih atas. Meskipun kita memiliki batasan Suspense, SSR Solid pada dasarnya dari atas ke bawah.

## Memulai dengan SSR

Mengkonfigurasi SSR memang sedikit sulit. Jadi kita mempunyai beberapa contoh di package [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr).

Tetapi, starter baru sedang dalam pembuatan [SolidStart](https://github.com/solidjs/solid-start) yang bertujuan untuk membuat semuanya lebih mudah dan lancar dilakukan.

## Memulai dengan Static Site Generation

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) juga mempunyai sebuah utility sederhana untuk mengenerate static atau sites yang telah di render. Baca README-nya untuk informasi yang lebih banya.
