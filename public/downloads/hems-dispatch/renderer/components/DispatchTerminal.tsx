'use client';

import { useState } from 'react';

interface Message {
    sender: 'user' | 'dispatch';
    text: string;
}

export const DispatchTerminal = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);

        try {
            const res = await fetch('http://localhost:3001/api/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            if (res.ok) {
                const { response } = await res.json();
                const dispatchMessage: Message = { sender: 'dispatch', text: response };
                setMessages(prev => [...prev, dispatchMessage]);
            }
        } catch (error) {
            console.error("Failed to send message to dispatch:", error);
            const errorMessage: Message = { sender: 'dispatch', text: '// COMS ERROR: BRIDGE CONNECTION FAILED //' };
            setMessages(prev => [...prev, errorMessage]);
        }

        setInput('');
    };

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-bold mb-2 border-b border-gray-700 pb-2">Dispatch Comms</h2>
            <div className="flex-grow overflow-y-auto mb-4 pr-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 text-sm ${msg.sender === 'user' ? 'text-green-400' : 'text-cyan-400'}`}>
                        <span className="font-bold uppercase">{msg.sender === 'user' ? '> FLIGHT:' : '> DISPATCH:'}</span> {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Type message..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-r-md"
                >
                    Send
                </button>
            </div>
        </div>
    );
};