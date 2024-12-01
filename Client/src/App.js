import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./component/Login";
import Dashboard from "./component/Dashbord";

// Define routes
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LoginPage />,
    },
    {
      path: "/dashbord",
      element: <Dashboard />,
    },
  ],
  {
    future: {
      v7_startTransition: true, // Opt into v7's startTransition behavior
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
