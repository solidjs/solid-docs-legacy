---
title: Rendering
description: Mendiskusikan perbedaan dari pilihan-pilihan templating dan rendering di Solid.
sort: 2
---

# Rendering

Solid mendukung templating dalam 3 bentuk, JSX, Tagged Template Literals dan variasi HyperScript Solid, walaupun JSX yang paling paling dominan digunakan. Kenapa? Karena JSX adalah DSL yang dibuat untuk kompilasi. Dia memiliki syntax yang jelas, mendukung TypeScript, dapat bekerja dengan Babel dan mendukung alat-alat lain seperti Code Syntax Highlighting dan Prettier. Jadi hal yang wajar untuk menggunakan alat yang pada dasarnya memberikan semua itu secara gratis. Sebagai solusi yang dikompilasi ia memberikan DX (Developer Experience) yang baik. Jadi kenapa harus menyusahkan diri dengan custom Syntax DSLs ketika kamu bisa menggunakan pilihan yang didukung secara luas?

## Kompilasi JSX

Rendering melibatkan prakompilasi template-template JSX kedalam kode native js yang dioptimalkan. Konstruksi dari kode JSX:

- Elemen-elemen Template DOM yang dikloning pada setiap instansiasi
- Serangkaian deklarasi referensi hanya menggunakan `firstChild` dan `nextSibling`
- Komputasi fine-grained untuk memperbarui elemen-elemen yang telah dibuat.

Pendekatan ini lebih berkinerja dan menghasilkan kode yang lebih sedikit daripada ketika kita membuat tiap elemen, satu per satu, dengan `document.createElement`.

## Attributes dan Props

Solid mencoba untuk mencerminkan konvensi HTML sebisa mungkin termasuk kasus insensitifitas dari attributes.

Mayoritas dari semua attributes pada elemen asli dari JSX telah terset sebagai attributes dari DOM. Nilai-nilai statis dibangun langsung ke dalam template yang dikloning. Tapi ada beberapa pengecualian seperti `class`, `style`, `value`, `innerHTML` yang menyediakan fungsionalitas tambahan.

Namun, elemen-elemen kustom (dengan pengecualian dari native built-in) default ke properti saat dinamis. Ini untuk menangani tipe-tipe data yang lebih kompleks. Ia melakukan konversi ini dengan mengubah nama-nama attribute snake case standar (seperti `some-attr`) menjadi camel case (seperti `someAttr`).

Namun, hal yang memungkinkan untuk mengontrol perilaku ini secara langsung dengan namespace directives. Kamu bisa memaksanya mejadi attribute dengan `attr:` atau prop dengan `prop:`

```jsx
<my-element prop:UniqACC={state.value} attr:title={state.title} />
```

> **Note:** Attributes statis dibuat sebagai bagian dari template html yang telah dikloning. Ekspresi-ekspresi tetap dan dinamis akan diaplikasikan di urutan binding JSX. Walau ini mungkin baik-baik saja di sebagian besar elemen-elemen DOM, ada beberapa seperti elemen input dengan `type='range'`, dimana urutan sangatlah penting. Ingat hal ini ketika kamu mem-binding elemen-elemen.

## Entry

Cara termudah untuk memasang Solid adalah dengan mengimpor `render` method dari `solid-js/web`. `render` membutuhkan fungsi sebagai argumen pertamanya dan mounting container sebagai argumen keduanya dan akan mengembalikan sebuah method disposal. `render` ini akan secara otomatis membuat root reaktif dan akan menangani rendering ke dalam container mountnya. Untuk performa yang terbaik gunakan elemen yang tidak memiliki turunan.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **Important** Argumen pertama haruslah sebuah fungsi. Jika tidak, Solid tidak akan bisa melacak dan meng-schedule sistem reaktifnya dengan baik. Kesalahan yang sederhana ini dapat menyebabkan Effect kamu tidak dapat bekerja. 

## Komponen-komponen

Komponen-komponen di Solid hanyalah fungsi-fungsi yang memiliki nama dengan PascalCase (huruf awal yang dikapitalisasi). Argumen pertamanya adalah objek properti dan mengembalikan node-node asli DOM.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);

const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Karena semua node-node JSX adalah sebuah node-node asli DOM, responsibilitas dari komponen-komponen tingkat atas hanyalah menambahkannya ke DOM.

## Props

Sama halnya seperti React, Vue, Angular dan framework-framework lainnya, Solid memperbolehkan kamu untuk menentukan properti di komponen-komponen kamu untuk dioper ke turunan dari komponen-komponennya. Pada contoh dibawah, parent mengoper string "Hello" ke komponent `Label` melalui properti `greeting`.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);
```
Pada contoh diatas, nilai yang terset di `greeting` adalah nilai statis, tapi kita juga bisa menset nilai yang dinamis. Sebagai contoh:

```jsx
const Parent = () => {
  const [greeting, setGreeting] = createSignal("Hello");

  return (
    <section>
      <Label greeting={greeting()}>
        <div>John</div>
      </Label>
    </section>
  );
};
```

Komponen-komponen dapat mengakses properti-properti yang dioper ke komponen tersebut melalui argumen `props`.

```jsx
const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Tidak seperti beberapa framework lainnya, kamu tidak bisa menggunakan "object destructuring" pada `props` dari komponen. Ini karena objek `props`, di belakangnya, bergantung kepada getter-getter objek untuk secara malas mengambil nilai-nilainya. Menggunakan "object destructuring" akan menghancurkan reaktifitas pada objek `props`.

Contoh dibawah ini menunjukkan cara yang "benar" untuk mengakses props di Solid:

```jsx
// Disini, `props.name` akan memperbarui seperti yang kamu ekspektasikan
const MyComponent = (props) => <div>{props.name}</div>;
```

Contoh dibawah ini menunjukkan cara yang tidak benar untuk mengakses props di Solid:

```jsx
// Ini buruk
// Disini, `props.name` tidak akan memperbarui (yang berarti tidak reaktif) karena dia destructure ke `name` variabel
const MyComponent = ({ name }) => <div>{name}</div>;
```

Meskipun objek `props` terlihat seperti objek biasa ketika kamu menggunakannya (dan pengguna Typescript mungkin akan mengatakan itu typed seperti objek normal pada umumnya), tapi nyatanya dia reaktif - sedikit mirip dengan Signal. Ini memiliki beberapa implikasi.

Karena tidak seperti kebanyakan framework-framework JSX, fungsi komponen di Solid hanya untuk di eksekusi satu kali (bukan setiap siklus render), contoh berikut tidak akan bekerja seperti yang kita ekspektasikan.

```jsx
import { createSignal } from "solid-js";

const BasicComponent = (props) => {
  const value = props.value || "default";

  return <div>{value}</div>;
};

export default function Form() {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <BasicComponent value={value()} />
      <input type="text" oninput={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}
```

Di contoh ini, apa yang kita mungkin ingin terjadai adalah agar `BasicComponent` bisa memunculkan nilai saat ini yang di ketikkan ke `input`. Namun, sebagai pengingat, fungsi `BasicComponent` hanya akan tereksekusi satu kali saja ketika componennya pertama kali dibuat. Di saat ini (saat pembuatan), `props.value` akan sama saja dengan `''`. Ini berarti `const value` di `BasicComponent` akan menjadi `'default'` dan tidak akan pernah ter-update. Walau mungkin objek `props` itu reaktif, mengakses props di `const value = props.value || 'default';` adalah diluar lingkup dari observable Solid, jadi dia tidak akan secara otomatis ter-evaluasi ulang ketika props terganti.

Terus bagiamana kita memperbaiki masalah ini?

Yah, secara umum, kita perlu mengakses `props` ditempat dimana Solid dapat meng-observenya. Biasanya ini berarti didalam JSX atau didalam `createMemo`, `createEffect`, atau thunk(`() => ...`). Berikut salah satu solusi yang akan bekerja sesuai harapan kita:

```jsx
const BasicComponent = (props) => {
  return <div>{props.value || "default"}</div>;
};
```

Ini, secara ekuavilen, dapat di hoist menjadi sebuah fungsi:

```jsx
const BasicComponent = (props) => {
  const value = () => props.value || "default";

  return <div>{value()}</div>;
};
```

Pilihan lain, jika kamu memiliki komputasi yang kompleks atau expensive, adalah dengan menggunakan `createMemo`. Sebagai contoh:

```jsx
const BasicComponent = (props) => {
  const value = createMemo(() => props.value || "default");

  return <div>{value()}</div>;
};
```

Atau menggunakan sebuah bantuan

```jsx
const BasicComponent = (props) => {
  props = mergeProps({ value: "default" }, props);

  return <div>{props.value}</div>;
};
```

Sebagai peringatan, contoh berikut ini _tidak_ akan bekerja:

```jsx
// buruk
const BasicComponent = (props) => {
  const { value: valueProp } = props;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};

// buruk
const BasicComponent = (props) => {
  const valueProp = prop.value;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};
```

Komponen-komponen dari Solid adalah bagian kunci dari performanya. Pendekatan Solid yaitu, "Menghilangkan" ("Vanishing") Komponen-komponen, dapat dibuat dengan mengevaluasi secara malas propertinya. Daripada mengevaluasi ekspresi prop secara langsung dan meneruskan nilainya, eksekusi akan di tahan sampai properti di akses didalam turunannya. Dengan begitu kita menghambat eksekusi sampai momen terakhir, biasanya tepat saat binding DOM terjadi, dan memaksimalkan performa. Ini juga meratakan hirearki dan menghilangkan kebutuhan untuk memelihara susunan Komponen-komponen.

```jsx
<Component prop1="static" prop2={state.dynamic} />;

// kira-kira terkompilasi ke:

// kita meng-untrack badan komponen untuk mengisolasinya dan menghindari update yang mahal
untrack(() =>
  Component({
    prop1: "static",
    // ekspresi dinamis jadi kita membungkusnya di dalam getter
    get prop2() {
      return state.dynamic;
    },
  })
);
```

Untuk membantu memelihara reaktifitas, Solid mempunya beberapa fungsi bantuan untuk prop:

```jsx
// default props
props = mergeProps({ name: "Smith" }, props);

// clone props
const newProps = mergeProps(props);

// merge props
props = mergeProps(props, otherProps);

// split props into multiple props objects
const [local, others] = splitProps(props, ["className"])
<div {...others} className={cx(local.className, theme.komponen)} />
```

## Turunan (Children)

Solid menangani JSX Children mirip seperti React. Satu child adalah satu nilai di `props.children` dan banyak children akan di handel melalui nilai-nilai array. Biasanya, kamu akan mengoper mereka melalui view JSX. Tetapi, jika kamu mau berinteraksi dengan mereka metode yang kami sarankan adalah menggunakan bantuan `children` dimana akan menyelesaikan setiap downstream control flows dan mengembalikan sebuah memo.

```jsx
// single child
const Label = (props) => <div class="label">Hi, { props.children }</div>

<Label><span>Josie</span></Label>

// multi child
const List = (props) => <div>{props.children}</div>;

<List>
  <div>First</div>
  {state.expression}
  <Label>Judith</Label>
</List>

// map children
const List = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// modify and map children using helper
const List = (props) => {
  // children helper memoizes value and resolves all intermediate reactivity
  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("list-child"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**Important:** Solid memperlakukan child tags sebagai ekspresi yang expensive dan membungkus mereka sama seperti ekspresi-ekspresi reaktif dinamis. Ini berarti mereka ter-evaluasi secara malas ketika `props` diakses. Hati-hati ketika mengakses mereka berkali-kali atau men-destructure ditempat sebelum kamu menggunakan mereka di tampilannya. Ini karena Solid tidak mempunya kemewahan dari membuat node-node Virtual DOM sebelum waktunya lalu melakukan diffing ke mereka, jadi resolusi dari `props` ini adalah harus malas dan deliberate. Gunakan fungsi bantuan `children` jika kamu berharap untuk melakukan ini karenaia akan me-memoize mereka. 
