---
title: FAQ
description: Perguntas frequentes da comunidade.
sort: 2
---

# FAQ

### 1. JSX sem VDOM? Isso é vaporware? Já ouvi vozes proeminentes como os autores dos outros frameworks dizerem que isso não é possível.

É possível quando você não tem o modelo de atualização do React. JSX é um Template DSL como qualquer outro. Apenas aquele que é mais flexível em certos aspectos. Inserir JavaScript arbitrário pode ser desafiador às vezes, mas não é diferente do suporte a operadores de propagação. Portanto, não, este não é um vaporware, mas uma abordagem comprovada como uma das mais eficazes.

O verdadeiro benefício vem em como ele é extensível. Você tem o compilador trabalhando para você, fornecendo atualizações DOM nativas ideais, mas tem toda a liberdade de uma biblioteca como React para escrever componentes usando técnicas como Render Props e Componentes de ordem superior ao lado de seus "hooks" reativos. Não gosta de como funciona o fluxo de controle do Solid? Escreva o seu próprio.

### 2. Como o Solid tem um desempenho tão bom?

Gostaríamos de apontar para uma única coisa, mas realmente é a combinação de muitas decisões de design importantes:

1. Reatividade explícita para que apenas as coisas que deveriam ser reativas sejam rastreadas.
2. Compile com a criação inicial em mente. O Solid usa heurística para afrouxar a granularidade e reduzir o número de cálculos feitos, mas mantém as atualizações principais granulares e de alto desempenho.
3. Expressões reativas são apenas funções. Isso habilita "Vanishing Components" com avaliação preguiçosa da propriedade, removendo invólucros desnecessários e sobrecarga de sincronização.

Atualmente, essas são técnicas únicas em uma combinação que dá a Solid uma vantagem sobre a concorrência.

### 3. Existe React-Compat?

Não. E provavelmente nunca haverá. Embora as APIs sejam semelhantes e os componentes muitas vezes possam ser movidos com pequenas edições, o modelo de atualização é fundamentalmente diferente. Os componentes React são renderizados continuamente, de forma que o código fora dos Hooks funcione de maneira muito diferente. As closures e regras de hook não são apenas desnecessários, mas podem ser usados de maneiras que não funcionam aqui.

Vue-compat, por outro lado, seria possível. Embora não haja planos de implementação atualmente.

### 4. Por que a desestruturação não funciona? Percebi que posso consertá-lo envolvendo todo o meu componente em uma função.

A reatividade ocorre no acesso à propriedade em objetos Prop e Store. Referenciá-los fora de uma computação reativa ou vinculativa não será rastreado. A desestruturação está perfeitamente bem dentro deles.

No entanto, envolver todo o seu componente em uma função não é o que você deseja fazer de forma irresponsável. Solid não possui um VDOM. Portanto, qualquer alteração controlada executará toda a função novamente, recriando tudo. Não faça isso.

### 5. Você pode adicionar suporte para componentes de classe? Acho que os ciclos de vida são mais fáceis de raciocinar.

Não é a intenção de oferecer suporte a componentes de classe. Os ciclos de vida do Solid estão ligados à programação do sistema reativo e são artificiais. Suponho que você poderia fazer uma classe disso, mas efetivamente todo o código do manipulador de não evento está basicamente sendo executado no construtor, incluindo a função de renderização. É apenas mais sintaxe como uma desculpa para tornar seus dados menos granulares.

Agrupe dados e seus comportamentos juntos, em vez de ciclos de vida. Esta é uma prática recomendada reativa que funcionou por décadas.

### 6. Eu realmente não gosto de JSX, alguma chance de um Template DSL? Oh, vejo que você tem Tagged Template Literals/HyperScript. Talvez eu use aqueles ...

Não. Pare você aí mesmo. Usamos JSX da mesma forma que o Svelte usa seus modelos, para criar instruções DOM otimizadas. As soluções Tagged Template Literal e HyperScript podem ser realmente impressionantes por si mesmas, mas a menos que você tenha um motivo real como um requisito de não construção, elas são inferiores em todos os sentidos. Pacotes maiores, desempenho mais lento e a necessidade de valores de agrupamento de solução alternativa manual.

É bom ter opções, mas o JSX do Solid é realmente a melhor solução aqui. Um modelo DSL também seria ótimo, embora mais restritivo, mas o JSX nos dá muito de graça. TypeScript, Parsers existentes, Realce de sintaxe, TypeScript, Prettier, Code Completion e, por último, e não menos importante, TypeScript.

Outras bibliotecas têm adicionado suporte para esses recursos, mas isso tem sido um esforço enorme e ainda é imperfeito e uma dor de cabeça de manutenção constante. Isso é realmente assumir uma postura pragmática.

### 7. Quando eu uso um Signal vs Store? Por que são diferentes?

Os Stores agrupam automaticamente os valores aninhados, tornando-os ideais para estruturas de dados profundas e para coisas como modelos. Para a maioria das outras coisas, Signals são leves e fazem o trabalho maravilhosamente.

Por mais que adoraríamos agrupá-los como uma única coisa, você não pode proxy de primitivas. As funções são a interface mais simples e qualquer expressão reativa (incluindo acesso de estado) pode ser agrupada em uma no transporte, portanto, isso fornece uma API universal. Você pode nomear seus sinais e estado como você escolher e permanecerá mínimo. A última coisa que gostaríamos de fazer é forçar a digitação de `.get()` `.set()` no usuário final ou, pior ainda, `.value`. Pelo menos o primeiro pode ter um alias para brevidade, enquanto o último é apenas a maneira menos concisa de chamar uma função.

### 8. Por que não posso simplesmente atribuir um valor ao Solid's Store como faço no Vue. Svelte ou MobX? Onde está a ligação bidirecional?

A reatividade é uma ferramenta poderosa, mas também perigosa. MobX sabe disso e introduziu o modo estrito e ações para limitar onde/quando as atualizações ocorrem. No Solid, que lida com árvores de componentes inteiras de dados, tornou-se aparente que podemos aprender algo com o React aqui. Você não precisa ser realmente imutável, desde que forneça os meios para ter o mesmo contrato.

Ser capaz de aprovar a capacidade de atualizar o estado é indiscutivelmente ainda mais importante do que decidir aprovar o estado. Portanto, ser capaz de separá-lo é importante e só é possível se a leitura for imutável. Também não precisamos pagar o custo da imutabilidade se ainda pudermos fazer uma atualização granular. Felizmente, existem toneladas de arte anterior aqui entre ImmutableJS e Immer. Ironicamente, Solid atua principalmente como um Immer reverso com seus internos mutáveis e interface imutável.

### 9. Posso usar a reatividade do Solid por conta própria?

É claro. Embora não tenhamos exportado um pacote autônomo, é fácil instalar o Solid sem o compilador e apenas usar os primitivos reativos. Um dos benefícios da reatividade granular é que ela é agnóstica para a biblioteca. Por falar nisso, quase todas as bibliotecas reativas funcionam dessa maneira. Isso é o que inspirou [Solid](https://github.com/solidjs/solid) e sua [biblioteca de expressões DOM](https://github.com/ryansolid/dom-expressions) subjacente em primeiro lugar para fazer um renderizador puramente do sistema reativo.

Para listar alguns para tentar: [Solid](https://github.com/solidjs/solid), [MobX](https://github.com/mobxjs/mobx), [Knockout](https://github.com/knockout/knockout), [Svelte](https://github.com/sveltejs/svelte), [S.js](https://github.com/adamhaile/S), [CellX](https://github.com/Riim/cellx), [Derivable](https://github.com/ds300/derivablejs), [Sinuous](https://github.com/luwes/sinuous) e até recentemente [Vue](https://github.com/vuejs/vue). Muito mais é necessário para fazer uma biblioteca reativa do que marcá-la em um renderizador como [lit-html](https://github.com/Polymer/lit-html) por exemplo, mas é uma boa maneira de ter uma ideia.

### 10. O Solid tem um Next.js ou uma biblioteca de componentes de material que eu possa usar?

Não é do nosso conhecimento. Se você estiver interessado em construir um, estamos prontamente disponíveis em nosso [Discord](https://discord.com/invite/solidjs) para ajudar a construí-los. Temos os fundamentos e apenas precisamos desenvolvê-los.
