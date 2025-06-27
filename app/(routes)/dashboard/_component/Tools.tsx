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
        path: '/Ai-tools/ai-Resume'
        
    },
    {
        name : 'Career Roadmap Generator',
        desc: 'Build your roadmap',
        icon : '/roadmap.png',
        button: 'Generate Now',
        path: '/Ai-tools/ai-Roadmap'
        
    },
]

function Tools() {
  return (
    <div id="tools-section" className='mt-10 p-8 rounded-2xl bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg'>
      <h2 className='font-extrabold text-3xl mb-2 text-blue-900 text-center tracking-tight'>Available AI Tools</h2>
      <p className='mb-8 text-center text-gray-500 text-lg font-light'>Start building and shape your career with these exclusive AI tools</p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[200px]'>
        {toolList.map((tool, index) => (
          <ToolCard tool={tool} key={index} />
        ))}
      </div>
    </div>
  )
}

export default Tools
