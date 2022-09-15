import { createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import html from "solid-js/html";

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

  return html`
    <div>
      <h3>Simple Todos Example</h3>
      <input
        type="text"
        placeholder="enter todo and click +"
        value=${() => state.newTitle}
        oninput=${(e) => setState({ newTitle: e.target.value })}
      />
      <button
        onclick=${() =>
          setState({
            idCounter: state.idCounter + 1,
            todos: [
              ...state.todos,
              {
                id: state.idCounter,
                title: state.newTitle,
                done: false
              }
            ],
            newTitle: ""
          })}
      >
        +
      </button>
      <${For} each=${() => state.todos}
        >${(todo) =>
          html`
            <div>
              <input
                type="checkbox"
                checked=${todo.done}
                onchange=${(e) => {
                  const idx = state.todos.findIndex((t) => t.id === todo.id);
                  setState("todos", idx, { done: e.target.checked });
                }}
              />
              <input
                type="text"
                value=${todo.title}
                onchange=${(e) => {
                  const idx = state.todos.findIndex((t) => t.id === todo.id);
                  setState("todos", idx, { title: e.target.value });
                }}
              />
              <button
                onclick=${() =>
                  setState("todos", (t) => t.filter((t) => t.id !== todo.id))}
              >
                x
              </button>
            </div>
          `}
      <//>
    </div>
  `;
};

render(App, document.getElementById("app"));