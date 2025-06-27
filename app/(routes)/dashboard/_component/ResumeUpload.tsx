import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { File, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function ResumeUpload({openResumeUpload, setOpenResumeDialog}: any) {
    const [file, setFile] = useState<File | undefined>();
    const [uploading, setUploading] = useState(false);
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFile(file);
            console.log(file.name);
        }
    }
    const router = useRouter();
    const onUpload = async () => {
        if (!file) return;
        setUploading(true);
        const recordId = uuidv4();
        const formData = new FormData();
        formData.append('recordId', recordId);
        formData.append('resumeFile', file);
        formData.append('aiAgentType', 'AiResumeAnalyzerAgent');
        try {
            await axios.post('/api/ai-Resume-Agent', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setOpenResumeDialog(false);
            router.push(`/Ai-tools/ai-resume-analyzer/${recordId}`);
            setUploading(false);
        }
    }

    return (
        <Dialog open={openResumeUpload} onOpenChange={setOpenResumeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload your resume</DialogTitle>
                    <DialogDescription>
                        <div>
                            <label htmlFor='resumeUpload' className='flex items-center flex-col justify-center p-7 border border-dashed rounded-lg hover:bg-slate-100 hover:cursor-pointer'>
                                <File className='h-10 w-10'/>
                                <h2 className='mt-3'>Click here to upload PDF file</h2>
                            </label>
                            <input type='file' id = 'resumeUpload' accept="application/pdf" className='hidden' onChange={onFileChange}/>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                {file && <div className="mt-2 text-sm text-gray-600">Selected file: {file.name}</div>}
                <DialogFooter>
                    <Button
                        className={file ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        variant={file ? 'default' : 'outline'}
                        disabled={!file || uploading}
                        onClick={onUpload}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button variant={'outline'} onClick={() => setOpenResumeDialog(false)} disabled={uploading}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ResumeUpload
