import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gray-100">
        <Navbar/>
        <main className="container mx-auto px-4 py-8">
          <Outlet/>
        </main>
        <Chatbot />
      </div>
    </>
  )
}

export default App
