---
title: FAQ
description: Pertanyaan-pertanyaan yang sering ditanyakan di komunitas.
sort: 2
---

# FAQ

### 1. JSX tanpa VDOM? Apa ini vaporware? Saya pernah mendengar penulis framewokr-framework lainnya mengatakan ini tidak mungkin bisa dilakukan.

Ini memungkinkan untuk dilakukan ketika kamu tidak memiliki model pembaruan seperti React. JSX adalah Template DSL seperti yang lainnya. Hanya satu yang lebih fleksibel dengan cara tertentu. Memasukkan JavaScript arbitrer terkadang sulit, tetapi tidak berbeda dengan mendukung spread operator. Jadi tidak, ini bukan vapourware tetapi pendekatan yang terbukti menjadi salah satu yang paling berkinerja.

Manfaat sebenarnya ada pada seberapa extensible (dapat diperluas) nya library ini. Kamu memiliki kompiler yang berfungsi untuk memberi kamu pembaruan DOM asli yang optimal tetapi kamu tetap memiliki semua kebebasan library seperti React untuk menulis Komponen menggunakan teknik seperti Render Props dan Komponen Orde Tinggi (Higher Order Components) di samping "hooks" reaktif Anda. Tidak suka cara kerja aliran kontrol Solid? Buat punyamu sendiri.

### 2. Bagaimana Solid bisa sangat cepat?

Kami berharap kami dapat menunjukkannya ke satu hal saja, tetapi semua ini benar-benar kombinasi dari banyak keputusan desain penting:

1. Reaktivitas eksplisit sehingga hanya hal-hal yang seharusnya reaktif yang dilacak.
2. Kompilasi dengan mempertimbangkan pembuatan awal. Solid menggunakan heuristik untuk melonggarkan granularitas guna mengurangi jumlah komputasi yang dilakukan tetapi tetap mempertahankan key pembaruan yang terperinci dan berkinerja.
3. Ekspresi reaktif hanyalah fungsi. Ini memungkinkan "Vanishing Components" dengan evaluasi lazy prop yang menghapus pembungkus yang tidak perlu dan overhead sinkronisasi.

Ini adalah teknik-teknik unik saat ini dalam kombinasi yang memberi Solid keunggulan dalam persaingan.

### 3. Apa ada semacam React-Compat?

Tidak. Dan kemungkinan besar tidak akan pernah ada. Meskipun API serupa dan komponen sering kali dapat dipindahkan dengan sedikit pengeditan, model pembaruannya pada dasarnya berbeda. Komponen-komponen React dirender berulang-ulang sehingga kode di luar Hooks bekerja dengan sangat berbeda. Aturan closures dan hook bukan hanya tidak perlu, tetapi juga dapat digunakan dengan cara yang tidak akan bekerja di sini.

Vue-compat di sisi lain, itu bisa dilakukan. Meskipun tidak ada rencana untuk diterapkan saat ini.

### 4. Mengapa destrukturisasi tidak berhasil? Saya menyadari bahwa saya dapat memperbaikinya dengan membungkus seluruh komponen saya dalam suatu fungsi.

Reaktivitas terjadi pada akses properti pada objek Prop dan Store. Merujuk (Referencing) mereka di luar komputasi yang mengikat atau reaktif tidak akan dilacak. Melakukan destrukturisasi boleh-boleh  saja di dalam mereka.

Namun, membungkus seluruh komponen kamu dalam suatu fungsi bukanlah hal yang ingin kamu lakukan secara tidak bertanggung jawab. Solid tidak memiliki VDOM. Jadi setiap perubahan yang dilacak akan menjalankan seluruh fungsi lagi menciptakan semuanya. Jangan lakukan itu.

### 5. Bisakah kamu menambahkan dukungan untuk class komponen? Saya menemukan lifecycles lebih mudah untuk dipikirkan.

Bukan niat kami untuk mendukung class komponen. Lifecycles Solid terkait dengan penjadwalan sistem reaktif dan buatan. Kamu bisa membuat kelas darinya, saya kira, tetapi secara efektif semua kode pengendali non-event pada dasarnya dijalankan di konstruktor, termasuk fungsi render. Ini hanya lebih banyak sintaks untuk alasan membuat data kamu kurang terperinci.

Kamu bisa mengelompokkan data dan perilakunya bersama-sama, daripada lifecycles. Ini adalah praktik terbaik reaktif yang telah berhasil selama beberapa dekade.

### 6. Saya sangat tidak menyukai JSX, apakah ada kemungkinan untuk menggunakan Template DSL? Oh, saya lihat kamu memiliki Tagged Template Literals/HyperScript. Mungkin saya akan menggunakan mereka ...

Jangan. Saya menghentikan kamu di sana. Kami menggunakan JSX sebagaimana Svelte menggunakan template mereka, untuk membuat instruksi-intruksi DOM yang telah dioptimalkan. Solusi Tagged Template Literal dan HyperScript mungkin benar-benar mengesankan, tetapi kecuali kamu memiliki alasan nyata seperti persyaratan no-build, mereka lebih rendah dalam segala hal. Bundel yang lebih besar, kinerja yang lebih lambat, dan kebutuhan akan nilai pembungkus solusi manual.

Memang baik untuk memiliki opsi, tetapi JSX Solid benar-benar solusi terbaik di sini. Template DSL juga bagus, meskipun lebih ketat, tetapi JSX memberi kita banyak hal secara gratis. TypeScript, Parser yang Ada, Syntax Highlighting, TypeScript, Prettier, Code Completion, dan yang terakhir dan tidak kalah pentingnya TypeScript.

Library-library lain telah menambahkan dukungan untuk fitur-fitur ini tetapi itu merupakan upaya yang sangat besar dan masih belum sempurna dan maintenance yang bikin sakit kepala terus. Ini bisa dibilang mengambil sikap pragmatis.

### 7. Kapan saya menggunakan Signal vs Store? Mengapa mereka berbeda?

Stores secara otomatis membungkus nilai bersarang (nested values) sehingga ideal untuk struktur data yang dalam, dan untuk hal-hal seperti model-model. Untuk sebagian besar hal lainnya, Signals itu ringan dan melakukan pekerjaan dengan luar biasa.

Kami juga sangat ingin membungkus/menjadikan mereka sebagai satu hal yang sama, tapi kita tidak bisa memproksikan primitif. Fungsi adalah antarmuka paling sederhana, dan ekspresi reaktif apa pun (termasuk akses state) dapat digabungkan menjadi satu, saat pengangkutan sehingga ini menyediakan API universal. Kamu dapat memberi nama sinyal dan state kamu sesuai pilihan dan mereka tetap minimal. Hal terakhir yang ingin kita lakukan adalah memaksa mengetik `.get()` `.set()` pada pengguna akhir (end user) atau lebih buruk lagi `.value`. Setidaknya yang signal bisa dialiaskan (aliased) untuk singkatnya, sedangkan yang terakhir hanyalah cara yang paling singkat untuk memanggil suatu fungsi.

### 8. Mengapa saya tidak bisa memberikan nilai ke Solid's Store seperti yang saya bisa lakukan di Vue, Svelte, atau MobX? Di mana pengikatan 2 arah (2-way bindings) nya?

Reaktivitas adalah alat yang ampuh tetapi juga berbahaya. MobX mengetahui hal ini dan memperkenalkan mode Ketat (Strict Mode) dan Actions untuk membatasi di mana/kapan pembaruan terjadi. Dalam Solid, yang berhubungan dengan seluruh pohon komponen data, sesuatu hal yang jelas bahwa kita dapat belajar sesuatu dari React di sini. Kamu tidak perlu benar-benar menjadikannya immutable selama kamu menyediakan sarana untuk memiliki kontrak yang sama.

Mampu melewati kemampuan untuk memperbarui state bisa dibilang lebih penting daripada memutuskan untuk mengoper state. Jadi, kemampuan untuk memisahkan itu penting, dan hanya mungkin jika membaca (reading) tidak dapat diubah (immutable). Kami juga tidak perlu membayar biaya dari (immutability) jika kami masih dapat memperbarui secara terperinci. Untungnya ada banyak karya sebelumnya di sini antara ImmutableJS dan Immer. Ironisnya Solid sebagian besar bertindak sebagai Immer terbalik dengan internal yang dapat berubah (mutable) dan antarmuka yang tidak dapat diubah (immutable).

### 9. Bisakah saya menggunakan reaktivitas Solid sendiri?

Tentu saja. Meskipun kami belum mengekspor packagenya secara mandiri/terpisah, mudah bagi kamu untuk menginstal Solid tanpa kompiler dan hanya menggunakan primitif reaktif. Salah satu manfaat reaktivitas granular adalah library agnostik. Dalam hal ini, hampir setiap perpustakaan reaktif bekerja dengan cara ini. Itulah yang mengilhami [Solid](https://github.com/solidjs/solid) dan [DOM Expressions library](https://github.com/ryansolid/dom-expressions) yang mendasarinya untuk membuat penyaji murni dari sistem reaktif.

Beberapa hal yang kamu dapat coba: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github.com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https://github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous), dan bahkan baru-baru ini [Vue](https://github.com/vuejs/vue). Lebih banyak lagi yang dilakukan untuk membuat library reaktif daripada menandainya ke perender seperti, [lit-html](https://github.com/Polymer/lit-html) misalnya, tetapi ini adalah cara yang baik untuk merasakannya.

### 10. Apakah Solid memiliki library seperti Next.js atau Material Components yang dapat saya gunakan?

Tidak sepengetahuan kami. Jika kamu tertarik untuk membuatnya, kami siap tersedia di [Discord](https://discord.com/invite/solidjs) kami untuk membantu membangunnya. Kami sudah memiliki dasar-dasarnya dan hanya perlu membangunnya dari dasar-dasar itu.