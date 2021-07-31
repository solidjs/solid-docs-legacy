---
title: Comparação
description: Comparações de Solid com outros frameworks.
sort: 1
---

# Comparação com outras Bibliotecas

Esta seção não pode escapar de alguns preconceitos, mas acho que é importante entender onde a solução do Solid fica em comparação com outras bibliotecas. Não se trata de desempenho. Para uma visão definitiva do desempenho, sinta-se à vontade para olhar para o [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark).

## React

React teve uma grande influência no Solid. Seu fluxo unidirecional e segregação explícita de leitura e gravação em sua API Hooks informaram a API de Solid. Mais do que o objetivo de ser apenas uma "Biblioteca de Renderização" ao invés de um framework. Solid tem opiniões fortes sobre como abordar o gerenciamento de dados no desenvolvimento de aplicativos, mas não busca restringir sua execução.

No entanto, por mais que Solid se alinhe com a filosofia de design do React, ele funciona de maneira fundamentalmente diferente. O React usa um DOM Virtual e o Solid não. A abstração do React é a partição de componente de cima para baixo, onde os métodos de renderização são chamados repetidamente e comparados. Solid, em vez disso, renderiza cada Template uma vez em sua totalidade, construindo seu gráfico reativo e só então executa as instruções relacionadas a alterações refinadas.

#### Conselhos para migrar:

O modelo de atualização do Solid não se parece em nada com o React, ou mesmo com o React + MobX. Em vez de pensar nos componentes da função como a função `render`, pense neles como um `construtor`. Cuidado com a desestruturação ou com a perda de reatividade do acesso inicial à propriedade. Os primitivos do Solid não têm restrições como as Regras de Hook, então você é livre para aninhá-los como achar melhor. Você não precisa de chaves explícitas nas linhas da lista para ter um comportamento de "key". Finalmente, não há VDOM, então APIs VDOM obrigatórias como `React.Children` e `React.cloneElement` não fazem sentido. Eu encorajo encontrar maneiras diferentes de resolver problemas que usam isso declarativamente.

## Vue

Solid não é particularmente influenciado pelo design do Vue, mas eles são comparáveis na abordagem. Ambos usam Proxies em seu sistema reativo com rastreamento automático baseado em leitura. Mas é aí que as semelhanças terminam. A detecção de dependência de baixa granularidade do Vue apenas alimenta um Virtual DOM e sistema de componentes menos granular, enquanto o Solid mantém sua granularidade até suas atualizações diretas de DOM.

O Vue valoriza a facilidade, enquanto o Solid valoriza a transparência. Embora a nova direção do Vue com o Vue 3 se alinhe mais com a abordagem do Solid. Essas bibliotecas podem se alinhar mais com o tempo, dependendo de como continuam a evoluir.

#### Conselhos para migrar:

Como outra biblioteca reativa moderna, a migração do Vue 3 deve parecer familiar. Os componentes do Solid são muito parecidos com marcar o template no final da função `setup` do Vue. Desconfie de envolver derivações de estado com cálculos, tente uma função. A reatividade é generalizada. Os proxies do Solid são intencionalmente somente leitura. Não bata antes de tentar.

## Svelte

Svelte foi o pioneiro na estrutura de desaparecimento pré-compilada que o Solid também emprega até certo ponto. Ambas as bibliotecas são realmente reativas e podem produzir pacotes de código de execução realmente pequenos, embora Svelte seja o vencedor aqui para pequenas demonstrações. O Solid requer um pouco mais de clareza em suas declarações, confiando menos na análise implícita do compilador, mas isso é parte do que dá ao Solid um desempenho superior. O sólido também mantém mais no tempo de execução, o que é melhor escalonado em aplicativos maiores. A implementação de demonstração RealWorld do Solid é 25% menor que a do Svelte.

Ambas as bibliotecas têm como objetivo ajudar seus desenvolvedores a escrever menos código, mas abordá-lo de maneira completamente diferente. Svelte 3 foca na otimização da facilidade de lidar com mudanças localizadas com foco na interação de objeto simples e ligação bidirecional. Em contraste, o Solid se concentra no fluxo de dados ao adotar deliberadamente o CQRS e a interface imutável. Com a composição funcional do template, em muitos casos, o Solid permite que os desenvolvedores escrevam ainda menos código do que o Svelte, embora a sintaxe do template do Svelte seja definitivamente mais tersa.

#### Conselhos para migrar:

A experiência do desenvolvedor é diferente o suficiente para que, embora algumas coisas sejam análogas, é uma experiência muito diferente. Componentes em Solid são baratos, então não se intimide em ter mais deles.

## Knockout.js

Esta biblioteca deve sua existência a Knockout. Modernizar seu modelo para detecção de dependência de baixa granularidade foi a motivação para este projeto. O Knockout foi lançado em 2010 e oferece suporte ao Microsoft Explorer até o IE6, enquanto grande parte do Solid não oferece suporte ao IE de forma alguma.

As ligações do Knockout são apenas strings em HTML que são analisadas no tempo de execução. Eles dependem do contexto de clonagem ($parent etc...). Enquanto Solid usa JSX ou Tagged Template Literais para templates optando por uma API em JavaScript.

A maior diferença pode ser que a abordagem do Solid para alterações em lote, que garante a sincronicidade, enquanto o Knockout tem deferUpdates que usa uma fila de microtarefa adiada.

#### Conselhos para migrar:

Se você está acostumado com o Knockout, as primitivas do Solid podem parecer estranhas para você. A separação de leitura/escrita é intencional e não apenas para dificultar a vida. Procure adotar um modelo mental de estado/ação (Flux). Embora as bibliotecas pareçam semelhantes, elas promovem práticas recomendadas diferentes.

## Lit & LighterHTML

Essas bibliotecas são incrivelmente semelhantes e tiveram alguma influência no Solid. Principalmente, o código compilado do Solid usa um método muito semelhante para renderizar inicialmente o DOM com desempenho. A clonagem de elementos do Template e o uso de marcadores de posição de comentário são algo que o Solid e essas bibliotecas compartilham.

A maior diferença é que, embora essas bibliotecas não usem o Virtual DOM, elas tratam a renderização da mesma forma, de cima para baixo, exigindo o particionamento de componentes para manter as coisas sãs. Por outro lado, Solid usa seu gráfico reativo de granulação fina para atualizar apenas o que foi alterado e, ao fazer isso, apenas compartilha esta técnica para sua renderização inicial. Essa abordagem aproveita a velocidade inicial disponível apenas para o DOM nativo e também tem a abordagem de melhor desempenho para atualizações.

#### Conselhos para migrar:

Essas bibliotecas são mínimas e fáceis de construir. No entanto, tenha em mente que `<MyComp/>` não é apenas HTMLElement (array ou função). Tente manter suas coisas no modelo JSX. O hoisting funciona na maior parte, mas é melhor pensar nisso mentalmente ainda como uma biblioteca de renderização e não como uma fábrica HTMLElement.

## S.js

Esta biblioteca teve a maior influência no design reativo do Solid. O Solid usou S.js internamente por alguns anos até que o conjunto de recursos os colocasse em caminhos diferentes. S.js é uma das bibliotecas reativas mais eficientes até hoje. Ele modela tudo em etapas de tempo síncrono como um circuito digital e garante consistência sem ter que fazer muitos dos mecanismos mais complicados encontrados em bibliotecas como MobX. A reatividade do sólido no final é uma espécie de híbrido entre S e MobX. Isso dá a ele maior desempenho do que a maioria das bibliotecas reativas (Knockout, MobX, Vue) enquanto mantém a facilidade do modelo mental para o desenvolvedor. O S.js, em última análise, ainda é a biblioteca reativa com melhor desempenho, embora a diferença seja quase imperceptível em todos, exceto nos benchmarks sintéticos mais estafantes.

## RxJS

RxJS é uma biblioteca reativa. Embora o Solid tenha uma ideia semelhante de dados observáveis, ele usa uma aplicação muito diferente do padrão do observador. Embora os sinais sejam como uma versão simples de um observável (apenas o próximo), o padrão de detecção de dependência automática suplanta os cerca de cem operadores do RxJS. Solid poderia ter adotado essa abordagem e, de fato, versões anteriores da biblioteca incluíam operadores semelhantes, mas na maioria dos casos é mais simples escrever sua própria lógica de transformação em uma computação. Onde os observáveis são inicializados a frio, unicast e baseados em push, muitos problemas no cliente podem ser inicializados a quente e multicast, que é o comportamento padrão do Solid.

## Outros

O Angular e algumas outras bibliotecas populares estão ausentes nesta comparação. A falta de experiência com eles impede fazer comparações adequadas. Geralmente, Solid tem pouco em comum com Frameworks maiores e é muito mais difícil compará-los.
