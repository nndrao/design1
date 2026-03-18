import { Header } from './components/layout/Header'
import { FITradingApp } from './components/trading/fi/FITradingApp'

export function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <FITradingApp />
      </div>
    </div>
  )
}
