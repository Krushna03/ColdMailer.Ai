import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import GenerateEmail from './page/Generate-email'
import LoginPage from './page/Login'
import RegisterPage from './page/Register'
import Protected from './components/Protected'
import NotFound from './components/NotFound'
import LandingPage from './Landing/Landing'
import EmailHistory from './page/EmailHistory'
import EmailOutputPage from './page/EmailOutputPage'
import PaymentComponent from './components/Payment'


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
      path: "/email/:id",
      element: (
        <Protected>
            <EmailOutputPage />
        </Protected>
      ) 
    },
    {
      path: "/email/history/:id",
      element: (
        <Protected>
            <EmailHistory />
        </Protected>
      ) 
    },
    {
      path: "/payment",
      element: (
        <Protected>
          <PaymentComponent />
        </Protected>
      ) 
    },
  ]) 

  return <RouterProvider router={router} />
}

export default App
