'use client';

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import React from 'react';
import { BackgroundLines } from '@/components/ui/background-lines';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { WorldMap } from "@/components/ui/world-map";
import { motion } from 'framer-motion';
import { BentoGrid, BentoGridItem } from '../components/ui/bento-grid';  // Import BentoGrid components
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from '@tabler/icons-react';

// Interfaces for the messages and code query results
interface Message {
  sender: 'user' | 'bot';
  message: string;
}

interface CodeResult {
  htsnumber: string;
  description: string;
  generalrateofduty: string;
}

const ChatBox: React.FC = () => {
  const [query, setQuery] = useState<string>(''); // User input state
  const [messages, setMessages] = useState<Message[]>([]); // Chat history state
  const [loading, setLoading] = useState<boolean>(false); // Loading state for queries

  // State for code query handling
  const [codeQuery, setCodeQuery] = useState<string>(''); 
  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);

  // Handle submitting the query for the main chat
  const handleQuerySubmit = async () => {
    if (!query) return;

    // Add user message to the chat history
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: 'user', message: query },
    ]);

    setLoading(true);

    try {
      const res = await fetch(
        `https://tarix.vercel.app/api/python?query=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch response from Flask');
      }

      const data = await res.json();
      console.log(data);

      // Add bot's response
      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: 'bot',
          message: `${data.response || ''} ${
            data.sources
              ? `<a href="${data.sources}" target="_blank" rel="noopener noreferrer" class="text-blue-500">${data.sources}</a>`
              : 'No result found'
          }`,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', message: 'Error fetching data from backend' },
      ]);
    } finally {
      setLoading(false);
    }

    setQuery('');
  };

  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
  );

  const items = [
    {
      title: "What are Tariffs?",
      description: "Tariffs are taxes imposed on imported goods to protect domestic industries, generate revenue, and regulate trade.",
      icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Types of Tariffs",
      description: "Ad valorem, specific, and compound tariffs are the most common forms used by countries to regulate imports.",
      icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Tariffs and Global Trade",
      description: "Tariffs can lead to trade wars and retaliatory measures, impacting global supply chains and international partnerships.",
      icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "How Tariffs Affect Prices",
      description:
        "Tariffs affect prices primarily by increasing the cost of imported goods. When a country imposes a tariff on foreign products, those goods become more expensive, and this price increase is typically passed on to consumers. For example, a 10% tariff on imported electronics means consumers will pay more for those products. Additionally, tariffs can indirectly raise the price of domestically produced goods. As foreign goods become more expensive, local producers may take the opportunity to raise their prices as well, knowing that consumers have fewer affordable alternatives.",
      icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Free Trade Agreements",
      description: "FTAs help reduce or eliminate tariffs between participating countries, fostering economic growth and trade.",
      icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
    },
  ];

  // Handle input changes for the main chat
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  // Handle submitting code query
  const handleCodeQuerySubmit = async () => {
    if (!codeQuery) return;

    try {
      const res = await fetch(
        `https://tarix.vercel.app/api/database?query=${encodeURIComponent(codeQuery)}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch response for code');
      }

      const data = await res.json();
      console.log(data);

      if (data.results) {
        // Transform results to the expected format
        const transformedResults = data.results.map((row: any[]) => ({
          htsnumber: row[0],
          description: row[2],
          generalrateofduty: row[3],
        }));
        setCodeResults(transformedResults);
      } else {
        setCodeResults([]);
      }
    } catch (error) {
      console.error(error);
      setCodeResults([]);
    }
  };

  // Handle input changes for code query
  const handleCodeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCodeQuery(e.target.value);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-3xl md:text-5xl lg:text-7xl font-sans py-4 md:py-12 relative z-20 font-bold tracking-tight flex items-center justify-center">
          Buy smarter with
          <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4 ml-2">
            Tarix.
          </span>
        </h2>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-neutral-700 dark:text-neutral-400 text-center">
          Access detailed HTS code information, including tariff rates and descriptions, instantly and for free.
        </p>
      </BackgroundLines>
  
      {/* BentoGrid Section */}
      <div className="mt-8 w-full max-w-4xl mx-auto">
        <BentoGrid className="max-w-4xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
  
      {/* Add space between Bento Grid and Query Section */}
      <div className="mt-12 w-full max-w-2xl p-4 bg-black rounded-lg shadow-lg">
        <h3 className="text-5xl font-bold text-center mb-4">Ask about Tariffs</h3>
        <div className="flex flex-col space-y-4 max-h-80 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                dangerouslySetInnerHTML={{ __html: msg.message }}
              />
            </div>
          ))}
        </div>
        <textarea
          className="w-full p-2 text-black rounded-lg bg-grey-400"
          placeholder="Type your question here"
          value={query}
          onChange={handleInputChange}
          rows={3}
        />
        <button
          onClick={handleQuerySubmit}
          className="mt-4 bg-black-500 text-white border-2 border-white p-2 rounded-lg w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Ask'}
        </button>
      </div>
  
      {/* Search HTS Code Section */}
      <div className="mt-12 w-full max-w-lg">
        <h3 className="text-2xl font-bold text-center mb-4">Search Codes</h3>
        <input
          className="w-full p-2 text-black rounded-lg bg-gray-100"
          type="text"
          value={codeQuery}
          onChange={handleCodeInputChange}
          placeholder="Enter HTS code"
        />
        <button
          onClick={handleCodeQuerySubmit}
          className="mt-4 border-2 border-white text-white p-2 rounded-lg w-full"
        >
          Search Code
        </button>
  
        <div className="mt-4">
          {codeResults.length > 0 ? (
            <div>
              {codeResults.map((result, idx) => (
                <div key={idx} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-800 text-white">
                  <p><strong>HTS Number:</strong> {result.htsnumber}</p>
                  <p><strong>Description:</strong> {result.description}</p>
                  <p><strong>General Rate of Duty:</strong> {result.generalrateofduty}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
  
      <div className="py-40 dark:bg-black bg-white w-full">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
            Know the{" "}
            <span className="text-neutral-400">
              {"Source".split("").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </p>
          <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
            Dive deeper into the global trade system and understand where tariffs are applied.
          </p>
        </div>
        <WorldMap
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              }, // Alaska (Fairbanks)
              end: {
                lat: 34.0522,
                lng: -118.2437,
              }, // Los Angeles
            },
            {
              start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
              end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            },
            {
              start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
              end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 28.6139, lng: 77.209 }, // New Delhi
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
            },
          ]}
        />
      </div>
    </div>
  );
  
  
};

export default ChatBox;
