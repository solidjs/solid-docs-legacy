---
title: Renderização
description: Discute os diferentes modelos e opções de renderização em Solid.
sort: 2
---

# Renderização

Solid oferece suporte a modelos em 3 formas JSX, Tagged Template Literals e variante de HyperScript do Solid, embora JSX seja a forma predominante. Por quê? JSX é um ótimo DSL feito para compilação. Tem sintaxe clara, suporta TypeScript, funciona com Babel e suporta outras ferramentas como Code Syntax Highlighting e Prettier. Foi muito pragmático usar uma ferramenta que basicamente oferece tudo isso de graça. Como uma solução compilada, fornece excelente DX. Por que lutar com DSLs de sintaxe personalizados quando você pode usar um com suporte tão amplo?

## Compilaçao JSX

A renderização envolve a pré-compilação de modelos JSX em código js nativo otimizado. O código JSX constrói:

- Elementos DOM do modelo que são clonados em cada instanciação
- Uma série de declarações de referência usando apenas firstChild e nextSibling
- Cálculos refinados para atualizar os elementos criados.

Essa abordagem tem mais desempenho e produz menos código do que criar cada elemento, um por um, com document.createElement.

## Atributos e Props

Solid tenta refletir as convenções de HTML tanto quanto possível, incluindo não diferenciação de maiúsculas e minúsculas de atributos.

A maioria de todos os atributos no elemento nativo JSX são configurados como atributos DOM. Os valores estáticos são integrados ao modelo que é clonado. Existem várias exceções como `class`, `style`, `value`,`innerHTML` que fornecem funcionalidade extra.

No entanto, os elementos personalizados (com exceção dos integrados nativos) assumem as propriedades quando dinâmicos. Isso é para lidar com tipos de dados mais complexos. Ele faz essa conversão pelos nomes de atributo padrão snake case para camel case `some-attr` para `someAttr`.

No entanto, é possível controlar esse comportamento diretamente com as diretivas de namespace. Você pode forçar um atributo com `attr:` ou forçar prop `prop:`

```jsx
<my-element prop:UniqACC={state.value} attr:title={state.title} />
```

> **Nota:** Atributos estáticos são criados como parte do modelo html que é clonado. As expressões fixas e dinâmicas são aplicadas posteriormente na ordem de vinculação JSX. Embora isso seja adequado para a maioria dos elementos DOM, existem alguns, como elementos de entrada com `type='range'`, onde a ordem é importante. Lembre-se disso ao vincular elementos.

## Entrada

A maneira mais fácil de montar o Solid é importar renderização de 'solid-js/web'. `render` recebe uma função como o primeiro argumento e o recipiente de montagem para o segundo e retorna um método de descarte. Este `render` cria automaticamente a raiz reativa e lida com a renderização no contêiner de montagem. Para obter o melhor desempenho, use um elemento sem filhos.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **Importante** O primeiro argumento precisa ser uma função. Caso contrário, não podemos rastrear e programar adequadamente o sistema reativo. Esta simples omissão fará com que seus efeitos não sejam executados.

## Componentes

Componentes em Solid são apenas funções cased Pascal (Letra maiúscula). Seu primeiro argumento é um objeto props e eles retornam nós DOM reais.

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

Como todos os nós JSX são nós DOM reais, a única responsabilidade dos componentes de nível superior é anexá-los ao DOM.

## Props

Muito parecido com React, Vue, Angular e outros frameworks, Solid permite que você defina propriedades em seus componentes para passar dados para componentes filhos. Aqui, um pai está passando a string "Hello" para o componente `Label` por meio de uma propriedade `greeting`.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);
```

No exemplo acima, o valor definido em `greeting` é estático, mas também podemos definir valores dinâmicos. Por exemplo:

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

Os componentes podem acessar as propriedades passadas a eles por meio de um argumento `props`.

```jsx
const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Ao contrário de alguns outros frameworks, você não pode usar a desestruturação de objetos nos 'props' de um componente. Isso ocorre porque o objeto `props`, nos bastidores, depende de getters de objetos para recuperar valores lentamente (lazily). Usar a desestruturação de objetos quebra a reatividade de `props`.

Este exemplo mostra a maneira "correta" de acessar os props em Solid:

```jsx
// Aqui, `props.name` será atualizado como você espera
const MyComponent = (props) => <div>{props.name}</div>;
```

Este exemplo mostra a maneira errada de acessar os props em Solid:

```jsx
// Isto é ruim
// Aqui, `props.name` não será atualizado (ou seja, não é reativo), pois é desestruturado em `name`
const MyComponent = ({ name }) => <div>{name}</div>;
```

Embora o objeto props pareça um objeto normal quando você o usa (e os usuários de Typescript notarão que ele é digitado como um objeto normal), na realidade ele é reativo - algo semelhante a um Signal. Isso tem algumas implicações.

Como, ao contrário da maioria dos frameworks JSX, os componentes de função do Solid são executados apenas uma vez (em vez de cada ciclo de renderização), o exemplo a seguir não funcionará conforme o esperado.

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

Neste exemplo, o que provavelmente queremos que aconteça é que `BasicComponent` exiba o valor atual digitado no `input`. Mas, como um lembrete, a função `BasicComponent` só será executada uma vez quando o componente for inicialmente criado. Neste momento (na criação), `props.value` será igual a `''`. Isso significa que `const value` em `BasicComponent` será resolvido como `'default'` e nunca será atualizado. Enquanto o objeto `props` é reativo, acessando os props em `const value = props.value || 'default';` está fora do escopo observável de Solid, então não é reavaliado automaticamente quando os props mudam.

Então, como podemos resolver nosso problema?

Bem, em geral, precisamos acessar `props` em algum lugar onde o Solid possa observá-lo. Geralmente, isso significa dentro de JSX ou dentro de um `createMemo`, `createEffect` ou thunk(`() => ...`). Aqui está uma solução que funciona conforme o esperado:

```jsx
const BasicComponent = (props) => {
  return <div>{props.value || "default"}</div>;
};
```

Isso, de forma equivalente, pode ser içado (hoisted) em uma função:

```jsx
const BasicComponent = (props) => {
  const value = () => props.value || "default";

  return <div>{value()}</div>;
};
```

Outra opção, se for um cálculo custoso, é usar `createMemo`. Por exemplo:

```jsx
const BasicComponent = (props) => {
  const value = createMemo(() => props.value || "default");

  return <div>{value()}</div>;
};
```

Ou usando um helper

```jsx
const BasicComponent = (props) => {
  props = mergeProps({ value: "default" }, props);

  return <div>{props.value}</div>;
};
```

Como um lembrete, os exemplos a seguir _não_ funcionarão:

```jsx
// bad
const BasicComponent = (props) => {
  const { value: valueProp } = props;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};

// bad
const BasicComponent = (props) => {
  const valueProp = prop.value;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};
```

Os componentes de Solid são a parte principal de seu desempenho. A abordagem de "desaparecimento" de componentes de Solid é possível graças à avaliação preguiçosa do suporte. Em vez de avaliar expressões prop imediatamente e passar valores, a execução é adiada até que o prop seja acessado no filho. Fazendo isso, adiamos a execução até o último momento, normalmente bem nas ligações do DOM, maximizando o desempenho. Isso nivela a hierarquia e elimina a necessidade de manter uma árvore de componentes.

```jsx
<Component prop1="static" prop2={state.dynamic} />;

// compila aproximadamente para:

// não rastreamos o corpo do componente para isolá-lo e evitar atualizações custosas
untrack(() =>
  Component({
    prop1: "static",
    // expressão dinâmica, então envolvemos em um getter
    get prop2() {
      return state.dynamic;
    },
  })
);
```

Para ajudar a manter a reatividade, o Solid tem alguns helpers de prop:

```jsx
// props padrão
props = mergeProps({ name: "Smith" }, props);

// clonar props
const newProps = mergeProps(props);

// mesclar props
props = mergeProps(props, otherProps);

// dividir props em vários objetos de props
const [local, others] = splitProps(props, ["className"])
<div {...others} className={cx(local.className, theme.component)} />
```

## Filhos

Solid lida com JSX Children semelhante ao React. Um único filho é um único valor em `props.children` e vários filhos são tratados por meio de uma matriz de valores. Normalmente, você os passa para a visualização JSX. No entanto, se você quiser interagir com eles, o método sugerido é o auxiliar `children` que resolve qualquer fluxo de controle downstream e retorna um memo.

```jsx
// filho único
const Label = (props) => <div class="label">Hi, { props.children }</div>

<Label><span>Josie</span></Label>

// vários filhos
const List = (props) => <div>{props.children}</div>;

<List>
  <div>First</div>
  {state.expression}
  <Label>Judith</Label>
</List>

// map de filhos
const List = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// modificar um map de filhos usando helper
const List = (props) => {
  // o helper de filhos memoriza o valor e resolve toda a reatividade intermediária
  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("list-child"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**Importante:** Solid trata as tags filhas como expressões custosas e as envolve da mesma forma que as expressões reativas dinâmicas. Isso significa que eles avaliam lentamente o acesso `prop`. Tenha cuidado ao acessá-los várias vezes ou desestruturá-los antes do local em que os usaria na visualização. Isso ocorre porque o Solid não tem o luxo de criar nós DOM virtuais com antecedência e, em seguida, diferenciá-los, então a resolução desses `props` deve ser preguiçosa e deliberada. Use o auxiliar `children` se desejar fazer isso, pois ele os memoriza.
