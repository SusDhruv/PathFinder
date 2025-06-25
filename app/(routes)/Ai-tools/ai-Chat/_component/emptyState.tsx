import React from 'react'

const list =[
    'What skills are for Frontend Developer',
    'How to crack Microsoft SDE role'
]

function EmptyState( {selectedQuestion} : any ) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
      <h2 className='font-bold text-2xl text-center mb-6 text-blue-900'>Ask anything to your AI Career Agent</h2> 
      <div className="w-full flex flex-col gap-4">
        {list.map((question,index)=>(
            <div
              key={index}
              className='p-4 text-center border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900 cursor-pointer transition-colors duration-200 text-base font-medium shadow-sm' onClick={()=>selectedQuestion(question)}
              >
              {question}
            </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyState
