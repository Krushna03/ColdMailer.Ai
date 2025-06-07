import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './context/store.js'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { SidebarContextProvider } from "./context/SidebarContextProvider"

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
        <Provider store={store}>
            <SidebarContextProvider>
                <App />
            </SidebarContextProvider>
        </Provider>
    </GoogleOAuthProvider>
)
