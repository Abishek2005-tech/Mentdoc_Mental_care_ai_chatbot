// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Configuration
const config = {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.0-flash',
    apiKey: 'AIzaSyC9YAEtzH2DmFlCoVmb__QYb4ONmzjyWDE',
    generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    }
};

// Conversation history
const conversationHistory = [
    { 
        role: "user", 
        parts: [{ 
            text: "input: You are a mental care chatbot named MentDoc. Your role is to provide compassionate, non-judgmental support to users. Your goal is to help users feel heard and emotionally supported through thoughtful questions and empathetic responses. Always maintain a warm, professional tone and avoid giving medical advice. If serious concerns arise, suggest professional help." 
        }] 
    },
    { 
        role: "model", 
        parts: [{ 
            text: "output: Hello, I'm MentDoc, your mental health companion. I'm here to listen and support you. How are you feeling today?" 
        }] 
    }
];

// Combined event listener for both click and keypress
document.addEventListener('DOMContentLoaded', () => {
    addBotMessage("Hello, I'm MentDoc, your mental health companion. I'm here to listen and support you. How are you feeling today?");
    
    // Single event listener that handles both click and Enter key
    const handleSend = () => {
        const message = userInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        
        conversationHistory.push({ 
            role: "user", 
            parts: [{ text: `input: ${message}` }] 
        });

        fetchResponse();
    };

    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
});

async function fetchResponse() {
    try {
        const response = await fetch(`${config.apiEndpoint}/${config.model}:generateContent?key=${config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: conversationHistory,
                generationConfig: config.generationConfig
            }),
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        hideTypingIndicator();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addBotMessage(botResponse);
            conversationHistory.push({ 
                role: "model", 
                parts: [{ text: `output: ${botResponse}` }] 
            });
        } else {
            addBotMessage("I'm having trouble processing that. Could you try rephrasing?");
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addBotMessage("Sorry, I'm having technical difficulties. Please try again later.");
    }
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        ${message}
        <span class="message-time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        ${message}
        <span class="message-time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}