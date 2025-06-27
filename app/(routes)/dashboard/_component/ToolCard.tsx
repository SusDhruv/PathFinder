"use client"
import React, { useState } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ResumeUpload from './ResumeUpload';
import { useUser } from "@clerk/nextjs";
import RoadmapDialog from './RoadmapDialog';

interface TOOL {
    name: string;
    desc: string;
    icon: string;
    button: string;
    path: string;
}

type AIToolProps = {
    tool: TOOL
}

function ToolCard({ tool }: AIToolProps) {
  const router = useRouter();
  const [openResumeUpload,setopenResumeUpload] = useState(false)
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [openRoadmapGenrator,setopenRoadMapGenrator] = useState(false)
  const [loading, setLoading] = useState(false);
  const onClickButton = async () => {
    const id = uuidv4();
    if(tool.name==='AI Resume Analyzer'){
       setopenResumeUpload(true);
       return;
    }
    if(tool.name==='Career Roadmap Generator'){
      setopenRoadMapGenrator(true);
      return;
   }
    setLoading(true);
    try {
      const result = await axios.post('/api/history', {
        recordId: id,
        content: [],
        aiAgentType: tool.path,
        userEmail
      });
      console.log(result);
      router.push(tool.path + '/' + id);
    } catch (error) {
      console.error('Error saving history:', error);
      // Still navigate even if history save fails
      router.push(tool.path + '/' + id);
    }
    // setLoading(false); // Don't unset here, let navigation handle it
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl border border-blue-200">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-lg font-semibold text-blue-600">Loading chat...</span>
          </div>
        </div>
      )}
      <div className="relative flex flex-col items-center p-7 border rounded-2xl bg-white/70 backdrop-blur-md shadow-xl h-full transition-transform hover:scale-105 hover:shadow-2xl duration-200 group">
        {/* Badge for popular tool */}
        {tool.name === 'Career Roadmap Generator' && (
          <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">Popular</span>
        )}
        <Image src={tool.icon} width={64} height={64} alt={tool.name} className="object-contain mb-5 drop-shadow-lg" />
        <h2 className='font-bold text-xl text-center mb-2 text-blue-900 group-hover:text-purple-700 transition-colors'>{tool.name}</h2>
        <p className='text-gray-500 text-center text-base mb-5 font-light'>{tool.desc}</p>
        <Button className='w-full mt-auto py-2 rounded-lg font-semibold text-base bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-purple-500 hover:to-blue-500 transition' onClick={onClickButton}>
          {tool.button}
        </Button>
        <ResumeUpload openResumeUpload={openResumeUpload} setOpenResumeDialog={setopenResumeUpload}/>
        <RoadmapDialog 
          openDialog={openRoadmapGenrator}
          setOpenDialog={() => setopenRoadMapGenrator(false)}
        />
      </div>
    </>
  )
}

export default ToolCard
