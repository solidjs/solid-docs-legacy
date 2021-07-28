---
title: Começando
description: Um guia para começar a usar o Solid.
sort: 0
---

# Começando

## Experimente Solid

De longe, a maneira mais fácil de começar a usar o Solid é experimentá-lo online. Nosso REPL em https://playground.solidjs.com é a maneira perfeita de experimentar ideias. Assim como https://codesandbox.io/, onde você pode modificar qualquer um de nossos exemplos.

Como alternativa, você pode usar nossos modelos simples [Vite](https://vitejs.dev/) executando estes comandos em seu terminal:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # ou yarn ou pnpm
> npm run dev # ou yarn ou pnpm
```

Ou para TypeScript:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # ou yarn ou pnpm
> npm run dev # ou yarn ou pnpm
```

## Aprenda Solid

Sólido tem tudo a ver com pequenas peças compostas que servem como blocos de construção para aplicações. Essas peças são principalmente funções que constituem muitas APIs de nível superior superficiais. Felizmente, você não precisará saber sobre a maioria deles para começar.

Os dois principais tipos de blocos de construção que você tem à sua disposição são Componentes e Primitivos Reativos.

Componentes são funções que aceitam um objeto props e retornam elementos JSX, incluindo elementos DOM nativos e outros componentes. Eles podem ser expressos como elementos JSX em PascalCase:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Os componentes são leves no sentido de que eles próprios não têm estado e não têm instâncias. Em vez disso, eles servem como funções de fábrica para elementos DOM e primitivos reativos.

A reatividade de granulação fina do Solid é construída em 3 primitivos simples: Signals, Memos e Effects. Juntos, eles formam um mecanismo de sincronização de rastreamento automático que garante que sua visualização permaneça atualizada. Os cálculos reativos assumem a forma de expressões simples agrupadas por função que são executadas de forma síncrona.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Você pode aprender mais sobre [Solid's Reactivity](#reactivity) e [Solid's Rendering](#rendering).

## Pense como Solid

O design da Solid carrega várias opiniões sobre quais princípios e valores nos ajudam a construir sites e aplicativos da melhor maneira. É mais fácil aprender e usar o Solid quando você está ciente da filosofia por trás dele.

### 1. Dados Declarativos

Dados declarativos são a prática de vincular a descrição do comportamento dos dados à sua declaração. Isso permite uma composição fácil, empacotando todos os aspectos do comportamento dos dados em um único lugar.

### 2. Componentes de Desaparecimento

Já é difícil estruturar seus componentes sem levar as atualizações em consideração. As atualizações Solid são completamente independentes dos componentes. As funções do componente são chamadas uma vez e depois deixam de existir. Os componentes existem para organizar seu código e não muito mais.

### 3. Segregação de leitura/escrita

Controle preciso e previsibilidade tornam os sistemas melhores. Não precisamos da verdadeira imutabilidade para impor o fluxo unidirecional, apenas a capacidade de tomar decisões conscientes que os consumidores podem escrever ou não.

### 4. Simples é melhor que fácil

Uma lição difícil para reatividade refinada. Convenções explícitas e consistentes, mesmo que exijam mais esforço, valem a pena. O objetivo é fornecer ferramentas mínimas para servir de base para a construção.

## Web Components

A Solid nasceu com o desejo de ter Web Components como cidadãos de primeira classe. Com o tempo, seu design evoluiu e os objetivos mudaram. No entanto, Solid ainda é uma ótima maneira de criar componentes da Web. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) permite que você escreva e envolva componentes de função do Solid para produzir componentes da Web pequenos e de alto desempenho. Dentro dos aplicativos do Solid, o Solid Element ainda é capaz de alavancar a API de Contexto do Solid, e os Portals do Solid suportam o estilo isolado do Shadow DOM.

## Renderização de Servidor

O Solid tem uma solução de renderização dinâmica do lado do servidor que permite uma experiência de desenvolvimento verdadeiramente isomórfica. Através do uso de nossa primitiva Resource, as solicitações de dados assíncronas são feitas facilmente e, mais importante, serializadas e sincronizadas automaticamente entre o cliente e o navegador.

Como o Solid oferece suporte à renderização assíncrona e de fluxo no servidor, você pode escrever seu código de uma maneira e executá-lo no servidor. Isso significa que recursos como [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) e a divisão de código funciona apenas em Solid.

Para obter mais informações, leia o [Server guide](#server-side-rendering).

## Sem Compilação?

Não gosta de JSX? Não se importa em fazer trabalho manual para agrupar expressões, piorar o desempenho e ter tamanhos de pacote maiores? Alternativamente, você pode criar um aplicativo Solid usando Tagged Template Literals ou HyperScript em ambientes não compilados.

Você pode executá-los diretamente do navegador usando [Skypack](https://www.skypack.dev/):

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

Lembre-se de que você ainda precisa da biblioteca de expressões DOM correspondente para que funcionem com o TypeScript. Você pode usar os Literais de Template Tagged com [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) ou HyperScript com [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
