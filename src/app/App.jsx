import { RouterProvider } from "react-router-dom";
import { router } from "../app/app.router";
import { useAuth } from "../features/auth/hook/useAuth";
import { useEffect } from "react";

function App() {

  const auth = useAuth()

  useEffect(()=>{
    auth.handelGetMe()
  },[])

  return ( 
  <RouterProvider router={router} />

) 
  
 
  
}

export default App;