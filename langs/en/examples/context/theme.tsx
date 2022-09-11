import { createContext, useContext, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";

export type ThemeContextState = {
  readonly color: string;
  readonly title: string;
};
export type ThemeContextValue = [
  state: ThemeContextState,
  actions: {
    changeColor: (color: string) => void;
    changeTitle: (title: string) => void;
  }
];

const defaultState = {
  color: "#66e6ac",
  title: "Fallback Title",
};

const ThemeContext = createContext<ThemeContextValue>([
  defaultState,
  {
    changeColor: () => undefined,
    changeTitle: () => undefined,
  },
]);

export const ThemeProvider: ParentComponent<{
  color?: string;
  title?: string;
}> = (props) => {
  const [state, setState] = createStore({
    color: props.color ?? defaultState.color,
    title: props.title ?? defaultState.title,
  });

  const changeColor = (color: string) => setState("color", color);
  const changeTitle = (title: string) => setState("title", title);

  return (
    <ThemeContext.Provider value={[state, { changeColor, changeTitle }]}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
