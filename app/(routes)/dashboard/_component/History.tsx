"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button';

function History() {
  // Placeholder for history, replace with actual data source as needed
  const [userHistory, setUserHistory] = useState([]);
  return (
    <div className='mt-5 p-5 border rounded-xl'>
      <h2 className='font-bold text-lg'>Previous History</h2>
      <p>What you previously worked on, you can find here</p>
      {userHistory.length === 0 &&
        <div className="flex flex-col items-center justify-center mt-5 gap-3">
          <Image src={'/idea.png'} alt='bulb' width={50} height={50} />
          <h2 className="text-base font-medium text-gray-700">You do not have any history</h2>
          <Button className="w-full max-w-xs">Explore AI tools</Button>
        </div>
      }
    </div>
  )
}

export default History
