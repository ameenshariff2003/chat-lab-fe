import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Signup from "../features/auth/pages/Signup";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/component/Protected";
import VerifyTkn from "../features/auth/pages/VerifyTkn";

export const router = createBrowserRouter([
  {
    path:"/",
    element:<Protected><Dashboard/></Protected> 
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path:"/signup",
    element:<Signup/>
  },
  {
    path:"/verify",
    element:<VerifyTkn/>
  }
]);