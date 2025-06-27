"use client"
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import RoadmapCanvas from '../_components/RoadmapCanvas'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function RoadmapGenrator() {
  const { roadmapid } = useParams();
  const [roadmapData, setRoadmapData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showError, setShowError] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Polling function
  const pollForRoadmap = async () => {
    try {
      const result = await axios.get(`/api/history?recordId=${roadmapid}`);
      if (result.data.success && result.data.data?.content) {
        setRoadmapData(result.data.data.content);
        setLoading(false);
        setGenerating(false);
        setError(null);
        setShowError(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`roadmap-generating-${roadmapid}`);
        }
        return;
      } else {
        // Not found, keep polling
        if (!showError) {
          pollingRef.current = setTimeout(pollForRoadmap, 1500);
        }
      }
    } catch (e: any) {
      // Only set error if 23s has passed
      if (showError) {
        setError('Failed to fetch roadmap.');
        setLoading(false);
        setGenerating(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`roadmap-generating-${roadmapid}`);
        }
      } else {
        // Keep polling
        pollingRef.current = setTimeout(pollForRoadmap, 1500);
      }
    }
  };

  useEffect(() => {
    // Show error only after 23 seconds
    if (!showError && (loading || generating)) {
      timeoutRef.current = setTimeout(() => setShowError(true), 23000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, generating, showError]);

  useEffect(() => {
    // Check if the roadmap is being generated (flag in localStorage)
    if (typeof window !== 'undefined' && roadmapid) {
      if (localStorage.getItem(`roadmap-generating-${roadmapid}`)) {
        setGenerating(true);
      }
    }
    setLoading(true);
    setError(null);
    setShowError(false);
    setRoadmapData(undefined);
    startTimeRef.current = Date.now();
    pollForRoadmap();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [roadmapid]);

  if ((loading || generating) && (!showError || !error)) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center border border-blue-200 animate-pulse max-w-md">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Generating your personalized roadmap...</h2>
          <p className="text-gray-500 text-center mb-4">We're crafting a step-by-step learning journey for you. This may take a few moments.<br/>Stay motivated—your career path is on its way!</p>
          <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
            <div className="h-2 bg-blue-400 animate-pulse w-3/4 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400">Powered by AI</span>
        </div>
      </div>
    );
  }

  if (error && showError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
        <span className="text-lg font-semibold text-red-600 mb-2">{error}</span>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
      <div className='border rounded-xl p-5 md:col-span-1'>
        <h2 className='font-bold text-2xl'>{roadmapData?.roadmapTitle}</h2>
        <p className='mt-3 text-gray-500'><strong>Description:</strong><br />{roadmapData?.description}</p>
        <h2 className='mt-5 font-medium text-blue-600'>Duration: {roadmapData?.duration}</h2>
      </div>
      <div className='md:col-span-3 w-full h-[80vh]'>
        <RoadmapCanvas initialNodes={roadmapData?.initialNodes} initialEdges={roadmapData?.initialEdges}/>
      </div>
    </div>
  );
}

export default RoadmapGenrator
