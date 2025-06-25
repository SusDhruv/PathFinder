import React from 'react'
import { PricingTable } from '@clerk/nextjs'

function Billing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-200 py-10 px-2">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-gray-200">
        <h2 className='font-extrabold text-4xl text-center mb-2 text-black'>Select Your Subscription</h2>
        <p className='text-md text-center text-gray-800 mb-8'>Unlock the full suite of AI career tools with a plan that fits your needs. Enjoy unlimited access and premium features designed to accelerate your career journey.</p>
        <div className="w-full flex justify-center">
          <PricingTable/>
        </div>
      </div>
    </div>
  )
}

export default Billing
