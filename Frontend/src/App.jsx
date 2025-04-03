import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import GenerateEmail from './page/Generate-email'
import LoginPage from './page/Login'
import RegisterPage from './page/Register'
import Protected from './components/Protected'
import NotFound from './components/NotFound'
import GeneratedEmail from './page/Generated-email'
import LandingPage from './Landing/Landing'

function App() {
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />
    },
    {
      path: "/sign-in",
      element: <LoginPage />
    },
    {
      path: "/sign-up",
      element: <RegisterPage />
    },
    {
      path: "*",
      element: <NotFound />
    },
    {
      path: "/generate-email",
      element: (
        <Protected>
            <GenerateEmail />
        </Protected>
      ) 
    },
    {
      path: "/generated-email",
      element: (
        <Protected>
          <GeneratedEmail />
        </Protected>
      )
    },
  ]) 

  return <RouterProvider router={router} />
}

export default App
