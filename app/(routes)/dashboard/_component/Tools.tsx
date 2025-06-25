import React from 'react'
import ToolCard from './ToolCard'

const toolList = [
    {
        name : 'AI Career Q&A Chat',
        desc: 'Ask career questions',
        icon : '/chatbot.png',
        button: 'Lets Chat',
        path: '/Ai-tools/ai-Chat'
        
    },
    {
        name : 'AI Resume Analyzer',
        desc: 'Improve your resume',
        icon : '/resume.png',
        button: 'Analyze Now',
        path: '/ai-resume-analyzer'
        
    },
    {
        name : 'Career Roadmap Generator',
        desc: 'Build your roadmap',
        icon : '/roadmap.png',
        button: 'Generate Now',
        path: '/career-roadmap-generator'
        
    },
    {
        name : 'Cover Letter Generator',
        desc: 'Write a cover letter',
        icon : '/cover.png',
        button: 'Create Now',
        path: '/cover-letter-generator'
        
    },
    
]


function Tools() {
  return (
    <div className='mt-7 p-5 bg-white border rounded-xl'>
      <h2 className='font-bold text-lg mb-1'>Available AI Tools</h2>
      <p className='mb-6'>Start Building and Shape Your Career with this exclusive AI Tools</p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px] bg-gray-50 p-4 rounded-lg'>
        {toolList.map((tool, index) => (
          <ToolCard tool={tool} key={index} />
        ))}
      </div>
    </div>
  )
}

export default Tools
