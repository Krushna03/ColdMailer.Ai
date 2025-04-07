import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './context/store.js'
import { GoogleOAuthProvider } from "@react-oauth/google"

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={'296248819606-0bule3v4ta7cqqbvmdcen5a70ammpepv.apps.googleusercontent.com'}>
        <Provider store={store}>
            <App />
        </Provider>
    </GoogleOAuthProvider>
)
