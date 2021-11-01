Solid поддерживает и `class` и `className` для добавления класса на элемент. Этого может быть достаточно, но иногда нам нужна возможность добавлять классы в зависимости от условия. По этой причине в Solid существует `classList` атрибут, который принимает объект, в котором ключ это имя класса, а его значение это `boolean`. Когда значение равно true, класс будет добавлен, когда значение false класс будет удален.

Например, мы можем заменить:

```jsx
<button
  class={current() === 'foo' ? 'selected' : ''}
  onClick={() => setCurrent('foo')}
>foo</button>
```

на:

```jsx
<button
  classList={{selected: current() === 'foo'}}
  onClick={() => setCurrent('foo')}
>foo</button>
```

Для тех, кто использует CSS модули вам будет необходимо использовать это следующим образом:

```jsx
import { active } from "./style.module.css"

<div classList={{ [active]: isActive() }} />
```
