"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import axios from 'axios';

const toolList = [
  {
    name: 'AI Career Q&A Chat',
    icon: '/chatbot.png',
    path: '/Ai-tools/ai-Chat',
  },
  {
    name: 'AI Resume Analyzer',
    icon: '/resume.png',
    path: '/Ai-tools/ai-Resume',
  },
  {
    name: 'Career Roadmap Generator',
    icon: '/roadmap.png',
    path: '/Ai-tools/ai-Roadmap',
  },
];

function History() {
  const [userHistory, setUserHistory] = useState<any[]>([]);

  const GetHistory = async () => {
    try {
      const result = await axios.get('/api/history');
      if (result.data.success && Array.isArray(result.data.data)) {
        setUserHistory(result.data.data);
        console.log('Fetched user history:', result.data.data);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  useEffect(() => {
    GetHistory();
  }, []);

  // Map aiAgentType to toolList path for friendly display
  const usedAgentPaths = Array.from(new Set(userHistory.map(item => item.aiAgentType)));
  const usedAgents = toolList.filter(tool => usedAgentPaths.includes(tool.path));

  return (
    <div className="mt-5 p-5 border rounded-xl">
      {usedAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-5 gap-3">
          <Image src={'/idea.png'} alt='bulb' width={50} height={50} />
          <h2 className="text-base font-medium text-gray-700">You do not have any history</h2>
          <Button className="w-full max-w-xs">Explore AI tools</Button>
        </div>
      ) : (
        <>
          <h2 className='font-bold text-lg'>Previous History</h2>
          <p>What you previously worked on, you can find here</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {usedAgents.map((agent, idx) => (
              <div key={agent.path} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <Image src={agent.icon} alt={agent.name} width={40} height={40} />
                <span className="font-semibold text-blue-700 text-lg">{agent.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default History
