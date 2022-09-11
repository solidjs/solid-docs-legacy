import { createSignal } from "solid-js";
import { render } from "solid-js/web";

function Button() {
  const [isLoggedIn, login] = createSignal(false);
  return (
    <>
      <button className="button" onClick={() => login(!isLoggedIn())}>
        {isLoggedIn() ? "Log Out" : "Log In"}
      </button>
      <style jsx dynamic>
        {`
          .button {
            background-color: ${isLoggedIn() ? "blue" : "green"};
            color: white;
            padding: 20px;
            margin: 10px;
          }
        `}
      </style>
    </>
  );
}

render(
  () => (
    <>
      <Button />
      <Button />
    </>
  ),
  document.getElementById("app")
);