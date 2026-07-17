import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import GenerateEmail from './pages/GenerateEmail'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Protected from './components/Protected'
import NotFound from './components/NotFound'
import LandingPage from './landing/Landing'
import EmailHistory from './pages/EmailHistory'
import EmailOutputPage from './pages/EmailOutputPage'
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
