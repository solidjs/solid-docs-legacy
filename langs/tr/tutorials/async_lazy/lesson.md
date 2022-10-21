Bütün bundler'lar (Webpack, Rollup, Parcel, Vite) dinamik import'lar kullandığından kod bölme (code splitting) işlemini otomatik olarak gerçekleştirir. Solid'in lazy metodu, ertelenmiş lazy yükleme için bileşenin dinamik import'unu wrap etmenizi sağlar. Çıktı, JSX'te normal bir şekilde kullanılabilen bileşendir ve tek fark ilk kez render edilişinde import ettiği kodu dinamik olarak yüklemesi ve kod elde edilene kadar render branch'ını durdurmasıdır.

`lazy` kullanmak için aşağıdaki satırı:
```js
import Greeting from "./greeting";
```
Aşağıdaki ile değiştirelim:
```js
const Greeting = lazy(() => import("./greeting"));
```

Büyük olasılıkla hala gözle fark edilemeyecek kadar hızlı olacaktır, fakat yüklenmeyi görmek isterseniz bir miktar sahte gecikme ekleyebilirsiniz.

```js
const Greeting = lazy(async () => {
  // simulate delay
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
