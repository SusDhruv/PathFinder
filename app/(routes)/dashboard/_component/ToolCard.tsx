"use client"
import React, { useState } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ResumeUpload from './ResumeUpload';
import { useUser } from "@clerk/nextjs";

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
  const id = uuidv4();
  const [openResumeUpload,setopenResumeUpload] = useState(false)
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const onClickButton = async () => {
    if(tool.name==='AI Resume Analyzer'){
       setopenResumeUpload(true);
       return;
    }
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
  }

  return (
    <div className="flex flex-col items-center p-6 border rounded-xl bg-white shadow-md h-full transition-transform hover:scale-105">
      <Image src={tool.icon} width={60} height={60} alt={tool.name} className="object-contain mb-4" />
      <h2 className='font-semibold text-lg text-center mb-1'>{tool.name}</h2>
      <p className='text-gray-500 text-center text-sm mb-4'>{tool.desc}</p>
      <Button className='w-full mt-auto' onClick={onClickButton}>{tool.button}</Button>
      <ResumeUpload openResumeUpload={openResumeUpload} setOpenResumeDialog={setopenResumeUpload}/>
    </div>
  )
}

export default ToolCard
