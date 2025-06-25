import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
interface TOOL {
    name: string;
    desc: string;
    icon: string;
    button: string;
    path: string;
}
type AIToolProps ={
    tool:TOOL
}

function ToolCard({tool}: AIToolProps) {
  const id =uuidv4();
  return (
    <div className="flex flex-col items-center p-6 border rounded-xl bg-white shadow-md h-full transition-transform hover:scale-105">
      <Image src={tool.icon} width={60} height={60} alt={tool.name} className="object-contain mb-4" />
      <h2 className='font-semibold text-lg text-center mb-1'>{tool.name}</h2>
      <p className='text-gray-500 text-center text-sm mb-4'>{tool.desc}</p>
      <Link href={tool.path+"/"+id}>
      <Button className='w-full mt-auto'>{tool.button}</Button>
      </Link>
    </div>
  )
}

export default ToolCard
