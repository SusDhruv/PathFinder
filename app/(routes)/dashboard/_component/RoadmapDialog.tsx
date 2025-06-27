import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sparkle, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import TurboNode from '../../Ai-tools/ai-Roadmap/_components/TurboNode'

function RoadmapDialog({openDialog,setOpenDialog}:any) {
  const router = useRouter();
  const [userInput,setUserInput] = useState<string>();
  const [loading,setLoading] = useState(false);
  const nodeTypes={
    turbo:TurboNode

  }
  const GenerateRoadmap = async () => {
    if (!userInput?.trim()) return;
    setLoading(true);
    const roadmapId = uuidv4();
    try {
      // Set a flag in localStorage to indicate generation is in progress
      if (typeof window !== 'undefined') {
        localStorage.setItem(`roadmap-generating-${roadmapId}`, 'true');
      }
      // Fire and forget the request
      axios.post('/api/ai-roadmap-agent', {
        roadmapId: roadmapId,
        userInput: userInput
      });
      // Immediately route to the roadmap page
      router.push('/Ai-tools/ai-Roadmap/' + roadmapId)
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Enter Position/Skill to Generate Roadmap</DialogTitle>
      <DialogDescription className='mt-2'>
        <Input 
          placeholder ="e.g Full Stack Developer" 
          onChange={(event)=>setUserInput(event?.target.value)}
          disabled={loading}
        />
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <Button variant={'outline'} disabled={loading}>Cancel</Button>
        <Button 
          onClick={GenerateRoadmap} 
          disabled={loading || !userInput?.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkle className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default RoadmapDialog
