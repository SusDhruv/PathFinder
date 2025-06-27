import { Button } from '@/components/ui/button'
import React from 'react'
import { Sparkle } from 'lucide-react'

function WelcomeBanner() {
  return (
    <div className='relative p-8 bg-gradient-to-r from-[#BE575F] via-[#A338E3] to-[#AC7626] rounded-2xl shadow-xl flex flex-col items-center justify-center overflow-hidden mb-8'>
      {/* Decorative Icon */}
      <div className="absolute top-4 right-6 opacity-30 text-white text-7xl pointer-events-none select-none">
        <Sparkle size={64} />
      </div>
      <h2 className='font-extrabold text-4xl text-white mb-3 drop-shadow-lg text-center'>AI Career Coach Agent</h2>
      <p className='text-white text-lg mb-6 text-center max-w-2xl drop-shadow'>Smarter career decisions start here — get tailored advice, real-time market insights, and a roadmap built just for you with the power of AI.</p>
      <Button variant={'default'} className='mt-2 rounded-xl px-8 py-3 text-lg font-semibold shadow-lg bg-white text-[#A338E3] hover:bg-[#A338E3] hover:text-white transition'>
        <Sparkle className="mr-2 h-5 w-5" /> Let's Get Started
      </Button>
    </div>
  )
}

export default WelcomeBanner
