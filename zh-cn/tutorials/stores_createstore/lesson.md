Store 是 Solid 处理嵌套响应式给出回答。Store 是代理对象，其属性可以被跟踪，并且可以包含其他对象，这些对象会自动包装在代理中，等等。

为了让事情变得简单，Solid 只为在跟踪范围内访问的属性创建底层 Signal。因此，Store 中的所有 Signal 都是根据要求延迟创建的。

`createStore` 函数接收一个初始值并返回一个类似于 Signal 的读/写元组。第一个元素是只读的 store 代理，第二个元素是 setter 函数。

最基础的 setter 函数用法会接收一个对象，该对象的属性将与当前状态合并。setter 函数还支持路径语法，以便我们进行嵌套更新。通过这种方式，我们仍然可以保持对响应性的控制，以及精确定位更新。

> Solid 的路径语法支持多种形式，包括一些强大的语法来进行迭代和范围。有关完整的参考，请参阅 API 文档。

让我们看看使用 Store 实现嵌套响应性有多容易。我们可以用这个替换我们组件的初始化代码：

```js
const [store, setStore] = createStore({ todos: [] });
const addTodo = (text) => {
  setStore('todos', (todos) => [...todos, { id: ++todoId, text, completed: false }]);
};
const toggleTodo = (id) => {
  setStore('todos', (t) => t.id === id, 'completed', (completed) => !completed);
};
```

可以将 setter 函数配合 Store 的路径语法一起使用，setter 函数接收先前的状态并返回嵌套值的新状态。

就是这样。模板的其余部分就能做出了精细的响应（在单击复选框时检查控制台）。
