import React from 'react'
import { MovingDots } from '../components/moving-dots'
import { EmailOutput } from '../components/email-output'
import { Header } from '../components/Header'

const GeneratedEmail = () => {
  
  
  return (
    <div className="h-screen overflow-y-hidden flex flex-col bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(121,120,240,0.5),rgba(255,255,255,0))]">
      <MovingDots />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        <EmailOutput />
      </main>
    </div>
  )
}

export default GeneratedEmail