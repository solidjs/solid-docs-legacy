import { createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import h from "solid-js/h";

function createLocalStore(initState) {
  const [state, setState] = createStore(initState);
  if (localStorage.todos) setState(JSON.parse(localStorage.todos));
  createEffect(() => (localStorage.todos = JSON.stringify(state)));
  return [state, setState];
}

const App = () => {
  const [state, setState] = createLocalStore({
    todos: [],
    newTitle: "",
    idCounter: 0
  });
  return [
    h("h3", "Simple Todos Example"),
    h("input", {
      type: "text",
      placeholder: "enter todo and click +",
      value: () => state.newTitle,
      onInput: (e) => setState("newTitle", e.target.value)
    }),
    h(
      "button",
      {
        onClick: () =>
          setState((s) => ({
            idCounter: s.idCounter + 1,
            todos: [
              ...s.todos,
              {
                id: state.idCounter,
                title: state.newTitle,
                done: false
              }
            ],
            newTitle: ""
          }))
      },
      "+"
    ),
    h(For, { each: () => state.todos }, (todo) =>
      h(
        "div",
        h("input", {
          type: "checkbox",
          checked: todo.done,
          onChange: (e) =>
            setState(
              "todos",
              state.todos.findIndex((t) => t.id === todo.id),
              {
                done: e.target.checked
              }
            )
        }),
        h("input", {
          type: "text",
          value: todo.title,
          onChange: (e) =>
            setState(
              "todos",
              state.todos.findIndex((t) => t.id === todo.id),
              {
                title: e.target.value
              }
            )
        }),
        h(
          "button",
          {
            onClick: () =>
              setState("todos", (t) => t.filter((t) => t.id !== todo.id))
          },
          "x"
        )
      )
    )
  ];
};

render(App, document.getElementById("app"));