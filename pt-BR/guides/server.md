---
title: Servidor
description: Uma explicação dos recursos do lado do servidor do Solid.
sort: 3
---

# Renderização do Lado do Servidor (SSR)

O Solid lida com a renderização do servidor compilando modelos JSX para um código de acréscimo de string ultra eficiente. Isso pode ser feito através do plugin ou preset do babel passando `generate: "ssr"`. Para cliente e servidor, você precisa passar `hydratable: true` para gerar o código compatível de hidratação.

Os tempos de execução `solid-js` e `solid-js/web` são trocados por contrapartes não reativas quando executados em um ambiente Node. Para outros ambientes, você precisará agrupar o código do servidor com exportações condicionais definidas como `node`. A maioria dos empacotadores tem uma maneira de fazer isso. Em geral, também recomendamos o uso das condições de exportação `solid`, bem como é recomendado que as bibliotecas enviem seu código-fonte sob a exportação `solid`.

Construir para SSR definitivamente requer um pouco mais de configuração, pois estaremos gerando 2 pacotes separados. A entrada do cliente deve usar `hydrate`:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_Observação: É possível renderizar e hidratar a partir da raiz do Documento. Isso nos permite descrever nossa visão completa em JSX._

A entrada do servidor pode usar uma das quatro opções de renderização oferecidas pelo Solid. Cada um produz a saída e uma tag de script a ser inserida no cabeçalho do documento.

```jsx
import {
  renderToString,
  renderToStringAsync,
  renderToNodeStream,
  renderToWebStream,
} from "solid-js/web";

// Renderização síncrona de string
const html = renderToString(() => <App />);

// Renderização assíncrona de string
const html = await renderToStringAsync(() => <App />);

// Node Stream API
pipeToNodeWritable(App, res);

// Web Stream API (como Cloudflare Workers)
const { readable, writable } = new TransformStream();
pipeToWritable(() => <App />, writable);
```

Para sua conveniência, `solid-js/web` exporta um sinalizador `isServer`. Isso é útil, pois a maioria dos empacotadores será capaz de fazer treeshake de qualquer coisa sob este sinalizador ou importações usadas apenas pelo código sob este sinalizador de seu pacote de cliente.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
  // só faça isso no servidor
} else {
  // só faça isso no browser
}
```

## Script de Hidratação

Para hidratar progressivamente antes mesmo do tempo de execução do Solid carregar, um script especial precisa ser inserido na página. Ele pode ser gerado e inserido via `generateHydrationScript` ou incluído como parte do JSX usando a tag `<HydrationScript />`.

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

Ao se hidratar a partir do documento, inserir ativos que não estão disponíveis na execução do cliente também pode bagunçar as coisas. O Solid fornece um componente `<NoHydration>` cujos filhos funcionarão normalmente no servidor, mas não se hidratarão no navegador.

```jsx
<NoHydration>
  {manifest.map((m) => (
    <link rel="modulepreload" href={m.href} />
  ))}
</NoHydration>
```

## SSR Assíncrono e Streaming

Esses mecanismos são construídos com base no conhecimento do Solid de como sua aplicação funciona. Ele faz isso usando Suspense e a API de recursos no servidor, em vez de buscar e renderizar. Solid busca à medida que são renderizadas no servidor, assim como no cliente. Seu código e padrões de execução são escritos exatamente da mesma maneira.

A renderização assíncrona espera até que todos os limites do Suspense sejam resolvidos e, em seguida, envia os resultados (ou os grava em um arquivo no caso de Geração de Site Estático - SSG).

O streaming começa a descarregar o conteúdo síncrono para o navegador, processando imediatamente seus Suspense Fallbacks no servidor. Então, quando os dados assíncronos terminam no servidor, ele os envia pelo mesmo fluxo para o cliente para resolver o Suspense onde o navegador termina o trabalho e substitui o fallback por conteúdo real.

A vantagem desta abordagem:

- O servidor não precisa esperar a resposta dos dados Async. Assets podem começar a carregar mais cedo no navegador e o usuário pode começar a ver o conteúdo mais cedo.
- Em comparação com a busca do cliente, como JAMStack, o carregamento de dados começa no servidor imediatamente e não precisa esperar o carregamento do JavaScript do cliente.
- Todos os dados são serializados e transportados do servidor para o cliente automaticamente.

## Ressalvas SSR

A solução Isomorphic SSR da Solid é muito poderosa, pois você pode escrever seu código principalmente como uma única base de código que roda de maneira semelhante em ambos os ambientes. No entanto, há expectativas de que isso coloque a hidratação. Principalmente porque a visualização renderizada no cliente é a mesma que seria renderizada no servidor. Não precisa ser exato em termos de texto, mas estruturalmente a marcação deve ser a mesma.

Usamos marcadores renderizados no servidor para combinar elementos e locais de recursos no servidor. Por isso, o Cliente e o Servidor devem ter os mesmos componentes. Normalmente, isso não é um problema, visto que o Solid renderiza da mesma maneira no cliente e no servidor. Mas atualmente não há como renderizar algo no servidor que não seja hidratado no cliente. Atualmente, não há como hidratar parcialmente uma página inteira, e não gerar marcadores de hidratação para ela. É tudo ou nada. A hidratação parcial é algo que queremos explorar no futuro.

Finalmente, todos os recursos precisam ser definidos na árvore `render`. Eles são serializados automaticamente e selecionados no navegador, mas isso funciona porque os métodos `render` ou `pipeTo` rastreiam o progresso da renderização. Algo que não podemos fazer se eles forem criados em um contexto isolado. Da mesma forma, não há reatividade no servidor, portanto, não atualize os signals na renderização inicial e espere que eles reflitam na parte superior da árvore. Embora tenhamos limites de suspense, o SSR do Solid é basicamente de cima para baixo.

## Começando com SSR

As configurações de SSR são complicadas. Temos alguns exemplos no pacote [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr).

No entanto, um novo iniciador está em desenvolvimento [SolidStart](https://github.com/solidjs/solid-start) que visa tornar essa experiência muito mais suave.

## Começando com Static Site Generation

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) também vem com um utilitário simples para gerar sites estáticos ou pré-renderizados. Leia o README para obter mais informações.
