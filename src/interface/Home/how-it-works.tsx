'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3 } from 'lucide-react';
import { useState } from 'react';
import {
  LuDatabase as Database,
  LuFileText as FileText,
  LuMessageSquare as MessageSquare,
  LuSend as Send,
} from 'react-icons/lu';

export function HowItWorks() {
  return (
    <section className='max-w-6xl p-4 mx-auto'>
      <div className='grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_450px]'>
        <div className='flex flex-col justify-center space-y-4 md:justify-start'>
          <div className='flex flex-col items-center space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>How It Works</h2>
            <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center'>
              Unlock deep insights from your databases with natural language conversations. Here&apos;s how you can get
              started:
            </p>
          </div>
          <div className='py-10 m-auto space-y-6 w-fit'>
            {steps.map((step, index) => (
              <div key={index} className='flex items-center space-x-4'>
                <div className='flex items-center justify-center w-12 h-12 text-white rounded-full bg-primary'>
                  {step.icon}
                </div>
                <div className='space-y-1'>
                  <h3 className='text-xl font-bold'>{step.title}</h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ExampleChat />
      </div>
    </section>
  );
}

function ExampleChat() {
  const [messages, setMessages] = useState(conversation);
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }]);
      setInput('');
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: "I'm analyzing your request. Please allow me a moment to process the data and generate insights.",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className='flex flex-col justify-center max-w-md mx-auto'>
      <div className='border rounded-lg shadow-xs bg-background'>
        <div className='flex flex-col space-y-1.5 p-6'>
          <h3 className='text-2xl font-semibold leading-none tracking-tight'>Example Conversation</h3>
          <p className='text-sm text-muted-foreground'>Ask questions and get insights from your data</p>
        </div>
        <div className='p-6 pt-0'>
          <div className='space-y-4'>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  <p className='text-sm'>{message.content}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className='flex items-center mt-4 space-x-2'>
            <Input placeholder='Type your question...' value={input} onChange={(e) => setInput(e.target.value)} />
            <Button type='submit'>
              <Send className='w-4 h-4' />
              <span className='sr-only'>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    icon: <Database className='w-6 h-6' />,
    title: '1. Connect Your Data',
    description: 'Securely connect your database(s) to our platform with ease.',
  },
  {
    icon: <MessageSquare className='w-6 h-6' />,
    title: '2. Ask Questions',
    description: 'Interact with our AI using natural language to query your data.',
  },
  {
    icon: <BarChart3 className='w-6 h-6' />,
    title: '3. AI Analysis',
    description: 'Our advanced AI analyzes your data and generates valuable insights.',
  },
  {
    icon: <FileText className='w-6 h-6' />,
    title: '4. Receive Insights',
    description: 'Get detailed reports, visualizations, and actionable recommendations.',
  },
];

const conversation = [
  {
    role: 'user',
    content: 'What were our top-selling products last quarter?',
  },
  {
    role: 'ai',
    content:
      'Based on the sales data from Q3, your top 3 products were: 1. Product A: $1.2M in revenue 2. Product B: $950K in revenue 3. Product C: $780K in revenue Would you like to see a breakdown by month or compare to previous quarters?',
  },
  {
    role: 'user',
    content: 'Yes, please show me a monthly trend for these products.',
  },
  {
    role: 'ai',
    content:
      "Certainly! I've generated a line chart showing the monthly sales trend for Products A, B, and C over the last quarter. The chart indicates that Product A had a significant spike in August, while Products B and C showed steady growth throughout the quarter.",
  },
];
