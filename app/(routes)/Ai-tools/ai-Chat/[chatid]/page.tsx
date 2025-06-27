"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState, useRef, useEffect } from 'react'
import { Send, User, Bot } from 'lucide-react'
import EmptyState from '../_component/emptyState'
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

function Chat() {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { chatid } = useParams()
  console.log(chatid)

  const getMessage = async () => {
    try {
      console.log('Fetching messages for chatId:', chatid);
      const result = await axios.get(`/api/history?recordId=${chatid}`);
      console.log('Fetched messages:', result.data);
      
      if (result.data.success && result.data.data?.content) {
        setMessages(result.data.data.content);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // If no history found, start with empty messages (this is normal for new chats)
    }
  }

  useEffect(() => {
    if (chatid) {
      getMessage();
    }
  }, [chatid]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const updateMessage = async (messagesToUpdate: Message[]) => {
    try {
      console.log('Updating history with messages:', messagesToUpdate);
      const result = await axios.put('/api/history', {
        content: messagesToUpdate,
        recordId: chatid
      });
      console.log('History update result:', result.data);
    } catch (error) {
      console.error('Error updating history:', error);
    }
  }

  const onSend = async () => {
    if (!userInput.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);
    try {
      const result = await axios.post('/api/Ai-chat-Agent', { userInput });
      const updatedMessages = [
        ...newMessages,
        { role: 'ai' as const, content: typeof result.data === 'string' ? result.data : JSON.stringify(result.data) }
      ];
      setMessages(updatedMessages);
      // Update history after successful AI response
      await updateMessage(updatedMessages);
    } catch (e: any) {
      const errorMessages = [
        ...newMessages,
        { role: 'ai' as const, content: e?.response?.data?.error || 'Something went wrong.' }
      ];
      setMessages(errorMessages);
      // Update history even if AI response failed
      await updateMessage(errorMessages);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Card-like header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b-2 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">AI Career Q/A Chat</h2>
          <p className="text-gray-600 text-sm">Smarter career decisions start here — get tailored advice, real-time market insights</p>
        </div>
        <Button variant="outline" onClick={() => setMessages([])}>New Chat</Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          {messages.length === 0 && !loading ? (
            <EmptyState selectedQuestion={(question: string) => setUserInput(question)} />
          ) : (
            <>
              <div className="flex flex-col gap-6 overflow-y-auto flex-1 py-6 px-2 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl border border-blue-100 shadow-inner" style={{ minHeight: 200, height: '100%' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="flex flex-col items-center mr-2">
                        <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow"><Bot size={20} /></div>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-5 py-3 max-w-[70%] whitespace-pre-line shadow-md text-base
                        ${msg.role === 'user'
                          ? 'bg-blue-600 text-white self-end rounded-br-md border-2 border-blue-300'
                          : 'bg-white text-blue-900 self-start border border-blue-200 rounded-bl-md'}
                      `}
                    >
                      {msg.role === 'ai' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex flex-col items-center ml-2">
                        <div className="bg-blue-600 text-white rounded-full p-2 shadow"><User size={20} /></div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow"><Bot size={20} /></div>
                    <div className="rounded-2xl px-5 py-3 max-w-[70%] bg-gray-100 text-blue-700 shadow-md text-base border border-blue-100 animate-pulse">
                      AI is typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className='flex-1'></div>
            </>
          )}
        </div>
      </div>
      {/* Always show input area */}
      <div className='flex justify-between items-center gap-4 p-4 border-t bg-white shadow-inner sticky bottom-0'>
        <Input
          placeholder='Type Here'
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          className="flex-1"
          onKeyDown={e => { if (e.key === 'Enter' && !loading) onSend(); }}
          disabled={loading}
        />
        <Button className="shrink-0" size="lg" onClick={onSend} disabled={loading || !userInput.trim()}><Send /></Button>
      </div>
    </div>
  );
}

export default Chat;
