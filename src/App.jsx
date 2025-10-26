import { BrowserRouter } from "react-router-dom";
// @ts-ignore
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;




