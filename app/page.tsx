'use client'
import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";


interface Message {
  sender: 'user' | 'bot';
  message: string;
}

// Interface for the code query result
interface CodeResult {
  htsnumber: string;
  description: string;
  generalrateofduty: string;
}

const ChatBox: React.FC = () => {
  const [query, setQuery] = useState<string>(''); // State for user input
  const [messages, setMessages] = useState<Message[]>([]); // To hold chat history
  const [loading, setLoading] = useState<boolean>(false); // To handle loading state

  // State for the code query box
  const [codeQuery, setCodeQuery] = useState<string>(''); // For code query
  const [codeResults, setCodeResults] = useState<CodeResult[]>([]); // To hold code query results

  // Function to handle query submission (for main chat)
  const handleQuerySubmit = async () => {
    if (!query) return;

    // Add user message to chat history
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', message: query },
    ]);

    // Set loading state
    setLoading(true);

    try {
      // Send query to Flask backend for general query
      const res = await fetch(`https://tarix.vercel.app/api/python?query=${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch response from Flask');
      }

      const data = await res.json();
      console.log(data);

      // Add bot's response to the chat history
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          message: `${data.response || ''} ${data.sources ? `<a href="${data.sources}" target="_blank" rel="noopener noreferrer" class="text-blue-500">${data.sources}</a>` : 'No result found'}`,
        },
      ]);
      
    } catch (error) {
      console.error(error);
      // Add error message to chat history
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', message: 'Error fetching data from backend' },
      ]);
    } finally {
      // Hide loading state
      setLoading(false);
    }

    // Clear the query input field
    setQuery('');
  };

  // Handle change in the input field (for main chat)
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  // Function to handle code query submission
  const handleCodeQuerySubmit = async () => {
    if (!codeQuery) return;

    try {
      // Send query to Flask backend for code query
      const res = await fetch(`https://tarix.vercel.app/api/database?query=${encodeURIComponent(codeQuery)}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch response for code');
      }

      const data = await res.json();
      console.log(data);

      if (data.results) {
        // Transform results to match the expected format
        const transformedResults = data.results.map((row: any[]) => ({
          htsnumber: row[0],
          description: row[2],  // Assuming description is at index 2
          generalrateofduty: row[3],  // Assuming general rate of duty is at index 3
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

  // Handle change in the code query input field
  const handleCodeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCodeQuery(e.target.value);
  };

  return (
    
    <div className="flex flex-col items-center mt-4">
          <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
          <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight flex items-center justify-center">
      Buy smarter with
      <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4 ml-2">
        Tarix.
      </span>
    </h2>

      <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
      Access detailed HTS code information, including tariff rates and descriptions, instantly and for free.
      </p>
    </BackgroundLines>
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Get started by editing&nbsp;
        <Link href="/api/python">
          <code className="font-mono font-bold">api/index.py</code>
        </Link>
      </p>

      <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-col space-y-4 max-h-80 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                key={idx}
                className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                dangerouslySetInnerHTML={{ __html: msg.message }}
              />
            </div>
          ))}
        </div>

        <textarea
          className="w-full p-2 border rounded-lg text-black"
          placeholder="Type your query here"
          value={query}
          onChange={handleInputChange}
          rows={3}
        />

        <button
          onClick={handleQuerySubmit}
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send Query'}
        </button>

      </div>
      <div className="mt-8 w-full max-w-lg">
          <input
            className="w-full p-2 border rounded-lg text-black"
            type="text"
            value={codeQuery}
            onChange={handleCodeInputChange}
            placeholder="Enter HTS code"
          />
          <button
            onClick={handleCodeQuerySubmit}
            className="mt-4 bg-green-500 text-white p-2 rounded-lg w-full"
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
    </div>
  );
};

export default ChatBox;
