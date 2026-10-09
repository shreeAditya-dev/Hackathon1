import { createBrowserRouter, RouterProvider } from "react-router";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SowingAnalysis from "./pages/SowingAnalysis";
import History from "./pages/History";
import About from "./pages/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/analysis",
    element: <SowingAnalysis />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "/about",
    element: <About />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;