import { useState } from 'react'
import './App.css'
import CameraComponent from './components/CameraComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CameraComponent />
    </>
  )
}

export default App
