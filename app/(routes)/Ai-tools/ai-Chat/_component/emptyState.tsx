import React from 'react'
import { MessageCircle } from 'lucide-react'

const list =[
    'What skills are for Frontend Developer',
    'How to crack Microsoft SDE role'
]

function EmptyState( {selectedQuestion} : any ) {
  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-200 rounded-2xl shadow-2xl p-10 flex flex-col items-center animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="text-blue-600" size={32} />
        <h2 className='font-extrabold text-3xl text-center bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow'>Start a Conversation with Your AI Career Coach</h2>
      </div>
      <p className="text-gray-500 text-center mb-8 text-lg">Get instant, personalized career advice. Try one of these questions:</p>
      <div className="w-full flex flex-col gap-4">
        {list.map((question,index)=>(
            <div
              key={index}
              className='p-4 text-center border border-gray-200 rounded-lg bg-white hover:border-blue-500 hover:bg-blue-100 hover:text-blue-900 cursor-pointer transition-all duration-200 text-base font-semibold shadow-sm transform hover:scale-105'
              onClick={()=>selectedQuestion(question)}
              >
              {question}
            </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyState
