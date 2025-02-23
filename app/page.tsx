'use client'
import { useState, ChangeEvent } from 'react';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'bot';
  message: string;
}

const ChatBox: React.FC = () => {
  const [query, setQuery] = useState<string>(''); // State for user input
  const [codeQuery, setCodeQuery] = useState<string>(''); // State for code query input
  const [messages, setMessages] = useState<Message[]>([]); // To hold chat history
  const [loading, setLoading] = useState<boolean>(false); // To handle loading state
  const [codeLoading, setCodeLoading] = useState<boolean>(false); // To handle code query loading state

  // Function to handle regular query submission
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
      // Send query to Flask backend
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

  // Function to handle code query submission
  const handleCodeQuerySubmit = async () => {
    if (!codeQuery) return;

    // Add user message to chat history for code query
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', message: codeQuery },
    ]);

    // Set loading state for code query
    setCodeLoading(true);

    try {
      // Send code query to Flask backend
      const res = await fetch(`https://tarix.vercel.app/api/database?query=${encodeURIComponent(codeQuery)}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch response from Flask');
      }

      const data = await res.json();
      console.log(data);

      // Add bot's response to the chat history for code query
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', message: data.result || 'No result found for code query' },
      ]);
      
    } catch (error) {
      console.error(error);
      // Add error message to chat history for code query
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', message: 'Error fetching data from backend' },
      ]);
    } finally {
      // Hide loading state for code query
      setCodeLoading(false);
    }

    // Clear the code query input field
    setCodeQuery('');
  };

  // Handle change in the regular input field
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  // Handle change in the code input field
  const handleCodeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCodeQuery(e.target.value);
  };

  return (
    <div className="flex flex-col items-center mt-4">
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
        
        {/* Code Query Section */}
        <div className="mt-6">
          <input
            className="w-full p-2 border rounded-lg text-black"
            type="text"
            placeholder="Query code here"
            value={codeQuery}
            onChange={handleCodeInputChange}
          />
          <button
            onClick={handleCodeQuerySubmit}
            className="mt-2 bg-green-500 text-white p-2 rounded-lg w-full"
            disabled={codeLoading}
          >
            {codeLoading ? 'Loading...' : 'Send Code Query'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
