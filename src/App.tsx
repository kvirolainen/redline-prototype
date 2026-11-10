import { BrowserRouter, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <main className="mx-auto max-w-[1080px] px-4 py-16">
      <h1 className="text-[40px] leading-[50px] font-bold text-ink">Redline</h1>
      <p className="mt-2 text-muted">Clutch buys trade-ins from dealerships. Prototype.</p>
      <button className="bg-cta mt-8 h-12 rounded-pill px-8 font-medium text-white">Get started</button>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
