"use client"
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Report from '../_components/Report'
import { Loader2 } from 'lucide-react'

function AiResumeAnalyzer() {
    const { recordid } = useParams();
    interface ResumeData {
        fileUrl?: string;
        [key: string]: any;
    }
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | undefined>();
    const [aiReport, setAiReport] = useState<any>();

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const result = await axios.get(`/api/history?recordId=${recordid}`);
                if (result.data.success && result.data.data?.content) {
                    setResumeData(result.data.data.content);
                } else {
                    setError('No data found');
                }
            } catch (err) {
                setError('Error fetching resume data');
            } finally {
                setLoading(false);
            }
        };
        if (recordid) fetchResumeData();
    }, [recordid]);

    useEffect(() => {
        if (resumeData) {
            console.log('Resume Data:', resumeData);
            setPdfUrl(resumeData.fileUrl);
            setAiReport(resumeData);
        }
    }, [resumeData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[80vh] w-full">
            <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center border border-green-200 animate-pulse max-w-md">
                <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">Analyzing your resume...</h2>
                <p className="text-gray-500 text-center mb-4">Our AI is reviewing your resume and preparing a detailed analysis. This may take a few moments.<br/>Stay tuned for personalized insights!</p>
                <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden mb-2">
                    <div className="h-2 bg-green-400 animate-pulse w-3/4 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-400">Powered by AI</span>
            </div>
        </div>
    );
    if (error) return <div>{error}</div>;

    return (
        <div className="w-full">
            <Report aiReport={aiReport} />
        </div>
    );
}

export default AiResumeAnalyzer
