import AppRouter from './router/AppRouter'
import { AuthProvider } from '../contexts/AuthContext'
import WebSocketNotification from '../shared/components/WebSocketNotification'
import GlobalToast from '../shared/components/GlobalToast'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <WebSocketNotification />
      <GlobalToast />
    </AuthProvider>
  )
}

export default App