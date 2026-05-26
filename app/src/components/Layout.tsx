import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0e17]">
      <Navbar />
      <div
        className="transition-all duration-300 ease-[var(--ease-default)]"
        style={{ marginLeft: 72 }}
      >
        <main className="min-h-[100dvh] flex flex-col">
          <div className="flex-1"><Outlet /></div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
