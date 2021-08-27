---
title: Perbandingan
description: Perbandingan Solid dengan framework-framework lainnya.
sort: 1
---

# Perbandingan dengan Library lainnya

Bagian ini tidak dapat lepas dari beberapa bias tetapi saya pikir penting untuk memahami di mana solusi Solid berada dibandingkan dengan library lain. Ini bukan tentang performa. Untuk melihat yang lebih definitif pada permorfa silahkan lihat ke [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark).

## React

React mempunya pengaruh yang besar kepada Solid. Aliran tidak searah (unidirectional flow) react dan pemisahan yang eksplisit tentang baca dan tulis (read and write) pada Hooks API nya membentuk Solid API. Lebih dari sekedar tujuan untuk menjadi sebuah "Render Library" daripada sebuah framework. Solid punya opini yang kuat pada bagaimana cara mengelola data pada pembuatan aplikasi tapi tidak berusaha membatasi pelaksanaannya.

Tetapi, walaupun Solid selaras dengan filosofi desain React, ia bekerja berbeda secara fundamental. React menggunakan sebuah Virtual DOM dan Solid tidak. Abstraksi React adalah partisi komponen tingkat atas dimana method render dipanggil berulang kali dan dibandingkan. Sedangkan Solid, me-render tiap Template sekali secara keseluruhan, membangun grafik reaktif dan baru kemudian mengeksekusi instruksi terkait dengan perbuahan fine-grained.

#### Saran untuk migrasi:

Model pembaruan Solid tidaklah sama dengan React, ataupun React + MobX. Daripada memikirkan fungsi komponen sebagai fungsi `render`, pikirkan mereka sebagai sebuah `constructor`. Hati-hati terhadap destructuring atau mengakses properti lebih awal hilang reaktifitas. Primitif-primitif Solid tidak mempunyai batasan seperti Aturan Hook (Hook Rules), jadi kamu bebas untuk menyusun (nest) mereka sesuai keinginan kamu. Kamu tidak memerlukan key eksplisit pada list rows untuk mempunya perilaku "keyed". Terakhir, tidak ada VDOM sehingga API VDOM yang penting seperti `React.Children` dan `React.cloneElement` tidak akan masuk akal. Kami menganjurkan untuk mencari cara lain untuk menyelesaikan masalah yang menggunakan API-API itu secara deklaratif.

## Vue

Solid tidak terlalu dipengaruhi dengan desain Vue, tapi mereka sebanding pada pendeketannya. Mereka berdua menggunakan Proxies pada sistem Reaktif mereka dengan lacak-otomatis berbasis baca (read based auto-tracking). Tapi disitulah kesamaannya berhenti. Pendeteksi dependency "fine-grained" Vue hanya dimasukkan kedalam Virtual DOM yang kurang "fine-grained" dan sistem Komponen dimana Solid menjaga granularitasnya sampai ke pembaruan DOMnya langsung.

Vue menghargai kemudahan dimana Solid menghargai transparansi. Meskipun arah baru Vue dengan Vue 3 lebih selaras dengan pendekatan yang diambil Solid. Library-library ini mungkin akan lebih selaras dari waktu ke waktu tergantung pada bagaimana mereka terus berkembang.

#### Saran untuk migrasi:

Sebagai library reaktif modern lainnya, melakukan migrasi dari Vue 3 harusnya terasa familiar. Komponen-komponen Solid sangat mirip dengan menandai template di akhir fungsi `setup` Vue. Berhati-hatilah dengan "overwrapping state derivations" dengan komputasi, coba fungsi. Reaktifitas itu menyebar. Proxy-proxy Solid sengaja dibuat hanya-baca (read-only). Jangan mengetuknya sebelum kamu mencobanya.

## Svelte

Svelte memelopori "precompiled disappearing" framework yang juga digunakan Solid sampai tingkat tertentu. Kedua library ini benar-benar reaktif dan dapat menghasilkan bundel kode eksekusi yang sangat kecil meskipun Svelte adalah pemenang di sini untuk demo-demo kecil. Solid membutuhkan sedikit lebih eksplisit dalam deklarasinya, kurang mengandalkan analisis implisit dari kompiler, tetapi itu adalah bagian dari apa yang memberikan Solid kinerja superior. Solid juga menyimpan kelebihan lebih banyak di runtime yang skalanya lebih baik di aplikasi yang lebih besar. Implementasi demo RealWorld Solid 25% lebih kecil dari Svelte.

Kedua library bertujuan untuk membantu developer-developer mereka menulis kode lebih sedikit tetapi melakukan pendekatan yang sama sekali berbeda. Svelte 3 berfokus pada optimalisasi kemudahan menangani perubahan lokal yang berfokus pada interaksi objek biasa dan pengikatan dua arah (two-way binding). Sebaliknya Solid berfokus pada aliran data dengan sengaja merangkul CQRS dan antarmuka yang tidak dapat diubah. Dengan komposisi template yang fungsional, dalam banyak kasus, Solid memungkinkan developer untuk menulis kode yang lebih sedikit daripada Svelte meskipun sintaks template Svelte jelas lebih ringkas.

#### Saran untuk migrasi:

Pengalaman developer cukup berbeda sehingga walau beberapa hal mungkin serupa, keduanya adalah pengalaman yang sangat berbeda. Komponen-komponen di Solid itu murah, jadi jangan ragu untuk memilikinya lebih banyak.

## Knockout.js

Library ini berutang keberadaannya kepada Knockout. Modernisasi modelnya untuk deteksi dependency yang "fine-grained" adalah motivasi untuk proyek ini. Knockout dirilis pada tahun 2010 dan mendukung Microsoft Explorer sampai ke IE6 sementara Solid tidak mendukung IE sama sekali.

Binding di Knockout hanyalah string dalam HTML yang dilewati saat runtime. Mereka bergantung pada konteks kloning ($parent dll...). Sedangkan Solid menggunakan JSX atau Tagged Template Literals untuk memilih template dalam API JavaScript.

Perbedaan terbesar mungkin adalah pendekatan Solid terhadap perubahan batch yang memastikan sinkronisitas, sedangkan Knockout memiliki deferUpdates yang menggunakan antrian (queue) microtask yang ditangguhkan.

#### Saran untuk migrasi:

Jika kamue terbiasa dengan Knockout, primitif Solid mungkin terlihat aneh bagi kamu. Pemisahan baca/tulis-nya disengaja dan bukan hanya untuk membuat hidup lebih sulit. Lihatlah untuk mengadopsi model mental state/action (Flux). Walau library-library ini terlihat serupa, mereka mempromosikan praktik terbaik yang berbeda.

## Lit & LighterHTML

Library-library ini sangat mirip dan memiliki pengaruh pada Solid. Sebagian besar kode yang dikompilasi Solid menggunakan metode yang sangat mirip untuk merender DOM secara performa. Mengkloning elemen Template dan menggunakan placeholder komentar adalah sesuatu yang sama-sama dimiliki Solid dan library ini.

Perbedaan terbesar adalah bahwa sementara library ini tidak menggunakan DOM Virtual, mereka memperlakukan rendering dengan cara yang sama, dari atas ke bawah, membutuhkan partisi komponen untuk menjaga semuanya tetap waras. Sebaliknya, Solid menggunakan Grafik Reaktif fine-grained untuk hanya memperbarui apa yang telah berubah dan dengan demikian hanya membagikan teknik ini untuk render awalnya. Pendekatan ini memanfaatkan kecepatan awal yang hanya tersedia untuk DOM asli dan juga memiliki pendekatan pembaruan yang paling berkinerja.

#### Saran untuk migrasi:

Library ini cukup minim dan mudah dibangun di atasnya. Namun, perlu diingat bahwa `<MyComp/>` bukan hanya HTMLElement (array atau fungsi). Cobalah untuk menyimpan barang-barang kamu di template JSX. Hoisting dapat bekerja untuk sebagian besar, tetapi yang terbaik adalah secara mental memikirkan ini sebagai library render dan bukan pabrik HTMLElement.

## S.js

Library ini memiliki pengaruh terbesar pada desain reaktif Solid. Solid menggunakan S.js secara internal selama beberapa tahun hingga set fitur menempatkannya di jalur yang berbeda. S.js adalah salah satu library reaktif paling efisien hingga saat ini. Ia memodelkan semuanya dari langkah waktu sinkron seperti sirkuit digital dan memastikan konsistensi tanpa harus melakukan banyak mekanisme yang lebih rumit yang ditemukan di perpustakaan seperti MobX. Reaktivitas Solid pada akhirnya adalah semacam campuran antara S dan MobX. Ini memberikan kinerja yang lebih besar daripada kebanyakan perpustakaan reaktif (Knockout, MobX, Vue) sambil mempertahankan kemudahan model mental untuk para developer. S.js pada akhirnya masih merupakan perpustakaan reaktif yang lebih berkinerja meskipun perbedaannya hampir tidak terlihat tetapi benchmarks sintetis yang melelahkan.

## RxJS

RxJS adalah library Reaktif. Walau Solid memiliki ide serupa tentang data yang dapat diamati, ia menggunakan aplikasi pola observer yang jauh berbeda. Sementara Signals bisa dibilang versi sederhana dari Observable (hanya yang next), pola deteksi ketergantungan otomatis menggantikan ratusan operator RxJS. Solid bisa mengambil pendekatan ini, dan memang sebelumnya, versi dari library-nya menyertakan operator serupa, tetapi dalam banyak kasus lebih mudah untuk menulis logika transformasi kamu sendiri dalam perhitungan. Di mana Observables adalah cold starting, unicast dan berbasis push (push-based), banyak masalah pada klien memungkinkan hot startup dan menjadi multicast yang merupakan perilaku default Solid.

## Lainnya

Angular dan beberapa library populer lainnya tidak ada dalam perbandingan ini. Kurangnya pengalaman menggunakan mereka, mencegah membuat perbandingan yang memadai. Secara umum, Solid memiliki sedikit kesamaan dengan Framework-framework yang lebih besar dan akan jauh lebih sulit untuk membandingkannya secara langsung.
