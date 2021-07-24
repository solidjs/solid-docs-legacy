---
title: API
description: Esboço de todas as APIs Solid.
sort: 0
---

# Reatividade Básica

## `createSignal`

```ts
export function createSignal<T>(
  value: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Este é o reativo primitivo mais básico usado para rastrear um único valor que muda com o tempo. A função `create` retorna um par de funções `get` e `set` para acessar e atualizar o sinal.

```js
const [getValue, setValue] = createSignal(initialValue);

// ler valor
getValue();

// definir valor
setValue(nextValue);

// definir o valor com uma função
setValue((prev) => prev + next);
```

Lembre-se de acessar os sinais em um escopo de rastreamento se desejar que eles reajam às atualizações. Os escopos de rastreamento são funções passadas para cálculos como `createEffect` ou expressões JSX.

> Se você deseja armazenar uma função em um Signal, você deve usar a forma de função:
>
> ```js
> setValue(() => myFunction);
> ```

## `createEffect`

```ts
export function createEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Cria um novo cálculo que rastreia automaticamente as dependências e é executado após cada renderização em que uma dependência foi alterada. Ideal para usar `ref`s e gerenciar outros efeitos colaterais.

```js
const [a, setA] = createSignal(initialValue);

// efeito que depende do sinal `a`
createEffect(() => doSideEffect(a()));
```

A função de efeito é chamada com o valor retornado da última execução da função de efeito. Este valor pode ser inicializado como um segundo argumento opcional. Isso pode ser útil para diferenciar sem criar um closure adicional.

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log(sum);
  return sum;
}, 0);
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string; equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Cria um sinal derivado somente leitura que recalcula seu valor sempre que as dependências do código executado são atualizadas.

```js
const getValue = createMemo(() => computeExpensiveValue(a(), b()));

// ler valor
getValue();
```

A função de memo é chamada com o valor retornado da última execução da função de memo. Este valor pode ser inicializado como um segundo argumento opcional. Isso é útil para reduzir cálculos.

```js
const sum = createMemo((prev) => input() + prev, 0);
```

## `createResource`

```ts
type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: () => void;
  }
];

export function createResource<T, U = true>(
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;

export function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (k: U, getPrev: () => T | undefined) => T | Promise<T>,
  options?: { initialValue?: T; name?: string }
): ResourceReturn<T>;
```

Cria um sinal que pode gerenciar solicitações assíncronas. O `fetcher` é uma função assíncrona que aceita o valor de retorno da `source` se fornecida e retorna um Promise cujo valor resolvido é definido no recurso. O fetcher não é reativo, portanto, use o primeiro argumento opcional se quiser que ele seja executado mais de uma vez. Se o source for falsa, null ou undefined, não será feita a busca.

```js
const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// ler valor
data();

// verifique se está carregando
data.loading;

// verifique se errou
data.error;

// definir valor diretamente sem criar Promise
mutate(optimisticValue);

// buscar novamente a última solicitação
refetch();
```

`loading` e `error` são getters reativos e podem ser rastreados.

# Ciclos de vida

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

Registra um método que é executado após a renderização inicial e os elementos foram montados. Ideal para usar `ref`s e gerenciar outros efeitos colaterais ocasionais. É equivalente a um `createEffect` que não possui dependências.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

Registra um método de limpeza que é executado no descarte ou recálculo do escopo reativo atual. Pode ser usado em qualquer Componente ou Effect.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

Registra um método de tratamento de erros que é executado quando ocorrem erros de escopo filho. Apenas os manipuladores de erro de escopo mais próximos são executados. Reinicie para acionar a linha.

# Utilitários Reativos

Esses auxiliares fornecem a capacidade de programar melhor as atualizações e controlar como a reatividade é rastreada.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

Ignora o rastreamento de qualquer uma das dependências no bloco de código em execução e retorna o valor.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

Retém a confirmação de atualizações dentro do bloco até o final para evitar recálculos desnecessários. Isso significa que os valores de leitura na próxima linha ainda não serão atualizados. O método definido e os efeitos do [Solid Store](#createstore) agrupam automaticamente seu código em um lote.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` é projetado para ser passado em uma computação para tornar suas dependências explícitas. Se um array de dependências é passado, `input` e` prevInput` são arrays.

```js
createEffect(on(a, (v) => console.log(v, b())));

// é equivalente a:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

Você também não pode executar o cálculo imediatamente e, em vez disso, optar por que ele seja executado apenas na alteração, definindo a opção defer como true.

```js
// não executa imediatamente
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // agora executa
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Cria um novo contexto não rastreado que não descarta automaticamente. Isso é útil para contextos reativos aninhados que você não deseja liberar quando o pai reavaliar. É um padrão poderoso para armazenamento em cache.

Todo o código Solid deve ser agrupado em um desses níveis superiores, pois eles garantem que toda a memória/cálculos sejam liberados. Normalmente você não precisa se preocupar com isso, pois `createRoot` está embutido em todas as funções de entrada` render`.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

Um método de objeto reativo `merge`. Útil para definir adereços padrão para componentes, caso o chamador não os forneça. Ou clonando o objeto de adereços incluindo propriedades reativas.

Este método funciona usando um proxy e resolvendo propriedades na ordem inversa. Isso permite o rastreamento dinâmico de propriedades que não estão presentes quando o objeto prop é mesclado pela primeira vez.

```js
// props padrão
props = mergeProps({ name: "Smith" }, props);

// clonar props
newProps = mergeProps(props);

// fundir props
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

Este é o substituto da desestruturação. Ele divide um objeto reativo por chaves, mantendo a reatividade.

```js
const [local, others] = splitProps(props, ["children"]);

<>
  <Child {...others} />
  <div>{local.children}<div>
</>
```

## `useTransition`

```ts
export function useTransition(): [
  () => boolean,
  (fn: () => void, cb?: () => void) => void
];
```

Usado para enviar atualizações assíncronas em lote em uma transação que adia a confirmação até que todos os processos assíncronos sejam concluídos. Isso está vinculado ao Suspense e rastreia apenas os recursos lidos sob os limites do Suspense.

```js
const [isPending, start] = useTransition();

// verifique se está em transição
isPending();

// envolver na transição
start(() => setSignal(newValue), () => /* transição está feita */)
```

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

Este método recebe um sinal e produz um Observable simples. Consuma-o da biblioteca Observable de sua escolha normalmente com o operador `from`.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `mapArray`

```ts
export function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

Helper de mapa reativo que armazena em cache cada item por referência para reduzir o mapeamento desnecessário nas atualizações. Ele executa a função de mapeamento apenas uma vez por valor e, em seguida, move ou remove conforme necessário. O argumento do índice é um sinal. A função de mapa em si não está rastreando.

Auxiliar subjacente para o fluxo de controle `<For>`.

```js
const mapped = mapArray(source, (model) => {
  const [name, setName] = createSignal(model.name);
  const [description, setDescription] = createSignal(model.description);

  return {
    id: model.id,
    get name() {
      return name();
    },
    get description() {
      return description();
    }
    setName,
    setDescription
  }
});
```

## `indexArray`

```ts
export function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

Semelhante ao `mapArray`, exceto que mapeia por índice. O item é um sinal e o índice agora é a constante.

Auxiliar subjacente para o fluxo de controle `<Index>`.

```js
const mapped = indexArray(source, (model) => {
  return {
    get id() {
      return model().id
    }
    get firstInitial() {
      return model().firstName[0];
    },
    get fullName() {
      return `${model().firstName} ${model().lastName}`;
    },
  }
});
```

# Stores

Essas APIs estão disponíveis em `solid-js/store`.

## `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): [get: Store<T>, set: SetStoreFunction<T>];
```

Isso cria uma árvore de Signals como proxy que permite que valores individuais em estruturas de dados aninhadas sejam rastreados de forma independente. A função `create` retorna um objeto proxy somente leitura e uma função setter.

```js
const [state, setState] = createStore(initialValue);

// read value
state.someValue;

// set value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

Store objetos sendo proxies rastreiam apenas no acesso à propriedade. E no acesso Stores produz recursivamente objetos Store aninhados em dados aninhados. No entanto, ele envolve apenas matrizes e objetos simples. Classes não são agrupadas. Portanto, coisas como `Date`,` HTMLElement`, `Regexp`, `Map`, `Set` não são granularmente reativas. Além disso, o objeto de estado de nível superior não pode ser rastreado sem acessar uma propriedade nele. Portanto, não é adequado para uso em coisas nas quais você itera, pois a adição de novas chaves ou índices não pode acionar atualizações. Portanto, coloque qualquer lista em uma chave de estado em vez de tentar usar o próprio objeto de estado.

```js
// coloque a lista como uma chave no objeto de estado
const [state, setState] = createStore({ list: [] });

// acessar a propriedade `list` no objeto de estado
<For each={state.list}>{item => /*...*/}</For>
```

### Getters

Store objetos suportam o uso de getters para armazenar valores calculados.

```js
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});
```

Esses são getters simples, portanto, você ainda precisará usar um Memo se quiser armazenar um valor em cache;

```js
let fullName;
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return fullName();
    },
  },
});
fullName = createMemo(() => `${state.firstName} ${state.lastName}`);
```

### Atualizando Stores

As alterações podem assumir a forma de uma função que passa do estado anterior e retorna um novo estado ou um valor. Os objetos são sempre mesclados superficialmente. Defina os valores como `undefined` para excluí-los da Store.

```js
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

Ele oferece suporte a caminho incluindo key arrays, object ranges e funções de filtro.

setState também suporta configuração aninhada onde você pode indicar o caminho para a mudança. Quando aninhado, o estado que você está atualizando pode ser outro valor não Object. Os objetos ainda são mesclados, mas outros valores (incluindo Arrays) são substituídos.

```js
const [state, setState] = createStore({
  counter: 2,
  list: [
    { id: 23, title: 'Birds' }
    { id: 27, title: 'Fish' }
  ]
});

setState('counter', c => c + 1);
setState('list', l => [...l, {id: 43, title: 'Marsupials'}]);
setState('list', 2, 'read', true);
// {
//   counter: 3,
//   list: [
//     { id: 23, title: 'Birds' }
//     { id: 27, title: 'Fish' }
//     { id: 43, title: 'Marsupials', read: true }
//   ]
// }
```

Path pode ser keys de string, array de keys, objetos iterativos ({from, to, by}) ou funções de filtro. Isso dá um poder expressivo incrível para descrever as mudanças de estado.

```js
const [state, setState] = createStore({
  todos: [
    { task: 'Finish work', completed: false }
    { task: 'Go grocery shopping', completed: false }
    { task: 'Make dinner', completed: false }
  ]
});

setState('todos', [0, 2], 'completed', true);
// {
//   todos: [
//     { task: 'Finish work', completed: true }
//     { task: 'Go grocery shopping', completed: false }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', { from: 0, to: 1 }, 'completed', c => !c);
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping', completed: true }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', todo => todo.completed, 'task', t => t + '!')
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping!', completed: true }
//     { task: 'Make dinner!', completed: true }
//   ]
// }

setState('todos', {}, todo => ({ marked: true, completed: !todo.completed }))
// {
//   todos: [
//     { task: 'Finish work', completed: true, marked: true }
//     { task: 'Go grocery shopping!', completed: false, marked: true }
//     { task: 'Make dinner!', completed: false, marked: true }
//   ]
// }
```

## `produce`

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

API inspirada no Immer para objetos da Store do Solid que permite a mutação localizada.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

## `reconcile`

```ts
export function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Difere as alterações de dados quando não podemos aplicar atualizações granulares. Útil para lidar com dados imutáveis de lojas ou grandes respostas de API.

A chave é usada quando disponível para combinar itens. Por padrão, `merge` false faz verificações referenciais sempre que possível para determinar a igualdade e substitui onde os itens não são referencialmente iguais. `merge` true empurra todos os diffing para as folhas e transforma efetivamente os dados anteriores para o novo valor.

```js
// inscrevendo-se em um observable
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

## `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
  options?: { name?: string }
): Store<T> {
```

Cria um novo objeto proxy de Store mutável. As Stores só acionam atualizações na mudança de valores. O rastreamento é feito pela interceptação do acesso à propriedade e rastreia automaticamente o aninhamento profundo por meio de proxy.

Útil para integração de sistemas externos ou como camada de compatibilidade com MobX/Vue.

> **Observação:** um estado mutável pode ser transmitido e modificado em qualquer lugar, o que pode tornar mais difícil seguir e quebrar o fluxo unidirecional. Geralmente é recomendado usar `createStore` em seu lugar. O modificador `produce` pode dar muitos dos mesmos benefícios sem nenhuma das desvantagens.

```js
const state = createMutable(initialValue);

// ler valor
state.someValue;

// defina valor
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables suportam setters junto com getters.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

# APIs de Componentes

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context fornece uma forma de injeção de dependência em Solid. Ele é usado para evitar a necessidade de passar dados como props por meio de componentes intermediários.

Esta função cria um novo objeto de contexto que pode ser usado com `useContext` e fornece o fluxo de controle do `Provider`. Context padrão é usado quando nenhum `Provider` é encontrado acima na hierarquia.

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const store = [
    state,
    {
      increment() {
        setState("count", (c) => c + 1);
      },
      decrement() {
        setState("count", (c) => c - 1);
      },
    },
  ];

  return (
    <CounterContext.Provider value={store}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

O valor passado para o provedor é passado para `useContext` como está. Isso significa que o agrupamento como uma expressão reativa não funcionará. Você deve passar sinais e armazenamentos diretamente em vez de acessá-los no JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Usado para capturar o contexto para permitir a passagem profunda de adereços sem ter que passá-los por cada função do Componente.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Usado para facilitar a interação com `props.children`. Este auxiliar resolve qualquer reatividade aninhada e retorna um memo. Abordagem recomendada para usar `props.children` em qualquer coisa que não seja passar diretamente para JSX.

```js
const list = children(() => props.children);

// do something with them
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Used to lazy load components to allow for code splitting. Components are not loaded until rendered. Lazy loaded components can be used the same as its statically imported counterpart, receiving props etc... Lazy components trigger `<Suspense>`

Usado para carregar componentes preguiçosos para permitir a divisão de código. Os componentes não são carregados até serem renderizados. Os componentes de carregamento lento podem ser usados da mesma forma que sua contraparte importada estaticamente, recebendo props etc... Os componentes preguiçosos acionam o `<Suspender>`

```js
// wrap import
const ComponentA = lazy(() => import("./ComponentA"));

// use in JSX
<ComponentA title={props.title} />;
```

# Primitivas Secundárias

Você provavelmente não precisará deles para seu primeiro aplicativo, mas sim dessas ferramentas úteis.

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    name?: string;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

Cria um somente leitura que notifica apenas as alterações posteriores quando o navegador está ocioso. `timeoutMs` é o tempo máximo de espera antes de forçar a atualização.

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Creates a new computation that automatically tracks dependencies and runs immediately before render. Use this to write to other reactive primitives. When possible use `createMemo` instead as writing to a signal mid update can cause other computations to need to re-calculate.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Creates a new computation that automatically tracks dependencies and runs during the render phase as DOM elements are created and updated but not necessarily connected. All internal DOM updates happen at this time.

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

Creates a conditional signal that only notifies subscribers when entering or exiting their key matching the value. Useful for delegated selection state. As it makes the operation O(2) instead of O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

These imports are exposed from `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

This is the browser app entry point. Provide a top level component definition or function and an element to mount to. It is recommended this element be empty as the returned dispose function will wipe all children.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

This method is similar to `render` except it attempts to rehydrate what is already rendered to the DOM. When initializing in the browser a page has already been server rendered.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    nonce?: string;
  }
): string;
```

Renders to a string synchronously. The function also generates a script tag for progressive hydration. Options include eventNames to listen to before the page loads and play back on hydration, and nonce to put on the script tag.

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    timeoutMs?: number;
    nonce?: string;
  }
): Promise<string>;
```

Same as `renderToString` except it will wait for all `<Suspense>` boundaries to resolve before returning the results. Resource data is automatically serialized into the script tag and will be hydrated on client load.

```js
const html = await renderToStringAsync(App);
```

## `pipeToNodeWritable`

```ts
export type PipeToWritableResults = {
  startWriting: () => void;
  write: (v: string) => void;
  abort: () => void;
};
export function pipeToNodeWritable<T>(
  fn: () => T,
  writable: { write: (v: string) => void },
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (r: PipeToWritableResults) => void;
    onComplete?: (r: PipeToWritableResults) => void | Promise<void>;
  }
): void;
```

This method renders to a Node stream. It renders the content synchronously including any Suspense fallback placeholders, and then continues to stream the data from any async resource as it completes.

```js
pipeToNodeWritable(App, res);
```

The `onReady` option is useful for writing into the stream around the the core app rendering. Remember if you use `onReady` to manually call `startWriting`.

## `pipeToWritable`

```ts
export type PipeToWritableResults = {
  write: (v: string) => void;
  abort: () => void;
  script: string;
};
export function pipeToWritable<T>(
  fn: () => T,
  writable: WritableStream,
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
    onComplete?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
  }
): void;
```

This method renders to a web stream. It renders the content synchronously including any Suspense fallback placeholders, and then continues to stream the data from any async resource as it completes.

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

The `onReady` option is useful for writing into the stream around the the core app rendering. Remember if you use `onReady` to manually call `startWriting`.

## `isServer`

```ts
export const isServer: boolean;
```

This indicates that the code is being run as the server or browser bundle. As the underlying runtimes export this as a constant boolean it allows bundlers to eliminate the code and their used imports from the respective bundles.

```js
if (isServer) {
  // I will never make it to the browser bundle
} else {
  // won't be run on the server;
}
```

# Control Flow

Solid uses components for control flow. The reason is that with reactivity to be performant we have to control how elements are created. For example with lists, a simple `map` is inefficient as it always maps everything. This means helper functions.

Wrapping these in components is convenient way for terse templating and allows users to compose and build their own control flows.

These built-in control flows will be automatically imported. All except `Portal` and `Dynamic` are exported from `solid-js`. Those two which are DOM specific are exported by `solid-js/web`.

> Note: All callback/render function children of control flow are non-tracking. This allows for nesting state creation, and better isolates reactions.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Simple referentially keyed loop control flow.

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

Optional second argument is an index signal:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

## `<Show>`

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

The Show control flow is used to conditional render part of the view. It is similar to the ternary operator(`a ? b : c`) but is ideal for templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show can also be used as a way of keying blocks to a specific data model. Ex the function is re-executed whenever the user model is replaced.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Useful for when there are more than 2 mutual exclusive conditions. Can be used to do things like simple routing.

```jsx
<Switch fallback={<div>Not Found</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

Match also supports function children to serve as keyed flow.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Non-keyed list iteration (rows keyed to index). This is useful when there is no conceptual key, like if the data consists of primitives and it is the index that is fixed rather than the value.

The item is a signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Optional second argument is an index number:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Catches uncaught errors and renders fallback content.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Also supports callback form which passes in error and a reset function.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

A component that tracks all resources read under it and shows a fallback placeholder state until they are resolved. What makes `Suspense` different than `Show` is it is non-blocking in that both branches exist at the same time even if not currently in the DOM.

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Experimental)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` allows for coordinating multiple parallel `Suspense` and `SuspenseList` components. It controls the order in which content is revealed to reduce layout thrashing and has an option to collapse or hide fallback states.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

SuspenseList is still experimental and does not have full SSR support.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

This component lets you insert an arbitrary Component or tag and passes the props through to it.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

This inserts the element in the mount node. Useful for inserting Modals outside of the page layout. Events still propagate through the Component Hierarchy.

The portal is mounted in a `<div>` unless the target is the document head. `useShadow` places the element in a Shadow Root for style isolation, and `isSVG` is required if inserting into an SVG element so that the `<div>` is not inserted.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Special JSX Attributes

In general Solid attempts to stick to DOM conventions. Most props are treated as attributes on native elements and properties on Web Components, but a few of them have special behavior.

For custom namespaced attributes with TypeScript you need to extend Solid's JSX namespace:

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:____
    }
    interface ExplicitProperties {
      // prop:____
    }
    interface ExplicitAttributes {
      // attr:____
    }
    interface CustomEvents {
      // on:____
    }
    interface CustomCaptureEvents {
      // oncapture:____
    }
  }
}
```

## `ref`

Refs are a way of getting access to underlying DOM elements in our JSX. While it is true one could just assign an element to a variable, it is more optimal to leave components in the flow of JSX. Refs are assigned at render time but before the elements are connected to the DOM. They come in 2 flavors.

```js
// simple assignment
let myDiv;

// use onMount or createEffect to read after connected to DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Or, callback function (called before connected to DOM)
<div ref={el => console.log(el)} />
```

Refs can also be used on Components. They still need to be attached on the otherside.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />;
}

function App() {
  let myDiv;
  onMount(() => console.log(myDiv.clientWidth));
  return <MyComp ref={myDiv} />;
}
```

## `classList`

A helper that leverages `element.classList.toggle`. It takes an object whose keys are class names and assigns them when the resolved value is true.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Solid's style helper works with either a string or with an object. Unlike React's version Solid uses `element.style.setProperty` under the hood. This means support for CSS vars, but it also means we use the lower, dash-case version of properties. This actually leads to better performance and consistency with SSR output.

```jsx
// string
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// object
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// css variable
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

These work the same as their property equivalent. Set a string and they will be set. **Be careful!!** Setting `innerHTML` with any data that could be exposed to an end user as it could be a vector for malicious attack. `textContent` while generally not needed is actually a performance optimization when you know the children will only be text as it bypasses the generic diffing routine.

```jsx
<div textContent={state.text} />
```

## `on___`

Event handlers in Solid typically take the form of `onclick` or `onClick` depending on style. The event name is always lowercased. Solid uses semi-synthetic event delegation for common UI events that are composed and bubble. This improves performance for these common events.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid also supports passing an array to the event handler to bind a value to the first argument of the event handler. This doesn't use `bind` or create an additional closure, so it is highly optimized way delegating events.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events cannot be rebound and the bindings are not reactive. The reason is that it is generally more expensive to attach/detach listeners. Since events naturally are called there is no need for reactivity simply shortcut your handler if desired.

```jsx
// if defined call it, otherwised don't.
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

For any other events, perhaps ones with unusual names, or ones you wish not to be delegated there are the `on` namespace events. This simply adds an event listener verbatim.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

These are custom directives. In a sense this is just syntax sugar over ref but allows us to easily attach multiple directives to a single element. A directive is simply a function with the following signature:

```ts
function directive(element: Element, accessor: () => any): void;
```

Directive functions are called at render time but before being added to the DOM. You can do whatever you'd like in them including create signals, effects, register clean-up etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

To register with TypeScript extend the JSX namespace.

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      model: [() => any, (v: any) => any];
    }
  }
}
```

## `prop:___`

Forces the prop to be treated as a property instead of an attribute.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Forces the prop to be treated as a attribute instead of an property. Useful for Web Components where you want to set attributes.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid's compiler uses a simple heuristic for reactive wrapping and lazy evaluation of JSX expressions. Does it contain a function call, a property access, or JSX? If yes we wrap it in a getter when passed to components or in an effect if passed to native elements.

Knowing this we can reduce overhead of things we know will never change simply by accessing them outside of the JSX. A simple variable will never be wrapped. We can also tell the compiler not to wrap them by starting the expression with a comment decorator `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

This also works on children.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
