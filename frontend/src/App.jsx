import { useState } from 'react'
import './index.css'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <RootLayout>
      <HomePage />
    </RootLayout>
    // <>
    //   <div>
    //     <h1 className='text-3xl font-bold underline text-red-500'>Ώρα για πτυχιακή frontend baby!</h1>
    //   </div>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //   </div>
    //   <p>Hello there!</p>
    // </>
  )
}

