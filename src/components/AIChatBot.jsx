import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { formatDateTime } from '../utils/formatters';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  Users, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function AIChatBot() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I'm your AI Campus Event Assistant. How can I help you today? You can ask me about upcoming hackathons, how team invite codes work, PCDP prerequisites, or your registered events.`,
      timestamp: new Date(),
      chips: ['Upcoming Events', 'My Registrations', 'How to Join Squad', 'PCDP Criteria', 'Venue OTP Check-in'],
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Knowledge-based AI response generator
  const generateBotResponse = async (query) => {
    const q = query.toLowerCase().trim();
    const allEvents = await eventService.getEvents();

    // 1. Check user registrations
    if (q.includes('my registration') || q.includes('my event') || q.includes('am i registered') || q.includes('what did i register')) {
      if (!user) {
        return {
          text: `You aren't signed in yet. Please log in with your Google or campus credentials to see your registered events.`,
          action: { label: 'Go to Sign In', path: '/login' },
          chips: ['Upcoming Events', 'How to Register']
        };
      }
      const userRegs = await registrationService.getUserRegistrations(user.id);
      const confirmed = userRegs.filter(r => r.status === 'confirmed');
      if (confirmed.length === 0) {
        return {
          text: `Hi ${user.display_name}! You do not have any confirmed event registrations yet. Would you like to explore upcoming hackathons and workshops?`,
          action: { label: 'Explore Events', path: '/events' },
          chips: ['Upcoming Hackathons', 'Workshops This Month']
        };
      }
      const list = confirmed.map(r => `• **${r.event?.title || 'Campus Event'}** (ID: \`${r.public_registration_id}\` at ${r.event?.venue || 'Venue'})`).join('\n');
      return {
        text: `Here are your confirmed event registrations, ${user.display_name}:\n\n${list}\n\nRemember to bring your Registration ID or enter the live Venue OTP when you arrive!`,
        action: { label: 'View My Registrations', path: '/student/registrations' },
        chips: ['Venue OTP Help', 'Explore More Events']
      };
    }

    // 2. Cancellation query
    if (q.includes('cancel') || q.includes('drop') || q.includes('refund')) {
      return {
        text: `**Campus Registration Policy**: Once confirmed, event registrations are permanent and cannot be cancelled. This policy ensures fair allocation of limited hardware kits, catering, and venue seats for campus participants.`,
        chips: ['Check My Registrations', 'Venue OTP Check-in']
      };
    }

    // 3. Squad / Team invite code queries
    if (q.includes('squad') || q.includes('team') || q.includes('invite code') || q.includes('join code') || q.includes('nk-7782')) {
      return {
        text: `**How Squad Registration Works**:\n\n1. **Create Squad**: The team captain registers and selects 'Create Squad', generating a unique 7-character invite code (e.g. \`NK-7782\`).\n2. **Share Code**: The captain shares the code with teammates.\n3. **Join Squad**: Teammates can enter the code either in **My Teams** or directly on the event details page to be automatically enrolled into the squad and event roster!`,
        action: { label: 'Go to Squad Hub', path: '/student/teams' },
        chips: ['Explore Hackathons', 'PCDP Criteria']
      };
    }

    // 4. PCDP Portal prerequisites
    if (q.includes('pcdp') || q.includes('skill') || q.includes('level') || q.includes('prerequisite') || q.includes('eligibility')) {
      return {
        text: `**PCDP Portal Verification**:\n\nCertain flagship hackathons (like HACKSPACE 2026) require clearance of specific skill tracks (such as **C Programming Level 2**) on the BIT Sathy PCDP Portal (**ps.bitsathy.ac.in**).\n\nWhen registering, our system verifies your PCDP level in real-time. If you haven't taken the assessment yet, you can take it at ps.bitsathy.ac.in!`,
        action: { label: 'Check Events Directory', path: '/events' },
        chips: ['Upcoming Hackathons', 'How Squads Work']
      };
    }

    // 5. Venue OTP attendance check-in
    if (q.includes('otp') || q.includes('attendance') || q.includes('check in') || q.includes('check-in') || q.includes('present')) {
      return {
        text: `**Venue OTP Attendance Process**:\n\n1. Arrive at the designated venue on event day.\n2. Organizers display a live 6-digit Venue OTP on the hall screen.\n3. Open **My Registrations**, click **Enter Venue OTP**, and enter the code to be marked **Present** instantly!`,
        action: { label: 'Open My Registrations', path: '/student/registrations' },
        chips: ['Upcoming Events', 'How to Join Squad']
      };
    }

    // 6. Specific event queries (HACKSPACE, Cloud, CodeCraft, Futsal, etc.)
    if (q.includes('hackspace') || q.includes('hackathon')) {
      const hackspace = allEvents.find(e => e.title.toLowerCase().includes('hackspace')) || allEvents.find(e => e.category === 'Hackathon');
      if (hackspace) {
        const remaining = Math.max(0, hackspace.capacity - (hackspace.registered_count || 0));
        return {
          text: `**${hackspace.title}**\n\n• **Format**: ${hackspace.event_format.toUpperCase()} (${hackspace.minimum_team_size}-${hackspace.maximum_team_size} members per squad)\n• **Venue**: ${hackspace.venue}\n• **Seats**: ${remaining} spots remaining out of ${hackspace.capacity}\n• **Schedule**: ${formatDateTime(hackspace.start_at)}\n• **Prerequisite**: ${hackspace.required_skill ? `${hackspace.required_skill} Level ${hackspace.required_skill_level}` : 'Open FCFS Entry'}`,
          action: { label: 'View Hackathon Details', path: `/events/${hackspace.slug}` },
          chips: ['How to Join Squad', 'PCDP Criteria']
        };
      }
    }

    if (q.includes('workshop') || q.includes('cloud') || q.includes('kubernetes')) {
      const workshop = allEvents.find(e => e.category === 'Technical Workshop');
      if (workshop) {
        return {
          text: `**${workshop.title}**\n\n• **Category**: Technical Workshop\n• **Venue**: ${workshop.venue}\n• **Starts**: ${formatDateTime(workshop.start_at)}\n• **Format**: ${workshop.event_format.toUpperCase()}\n• Hands-on developer cloud sandbox included.`,
          action: { label: 'View Workshop', path: `/events/${workshop.slug}` },
          chips: ['Upcoming Events', 'How to Register']
        };
      }
    }

    // 7. General upcoming events query
    if (q.includes('upcoming') || q.includes('events') || q.includes('list') || q.includes('schedule') || q.includes('what is happening')) {
      const top3 = allEvents.slice(0, 3);
      const list = top3.map(e => `• **${e.title}** — ${e.category} at ${e.venue} (${formatDateTime(e.start_at)})`).join('\n');
      return {
        text: `Here are the top upcoming campus events:\n\n${list}\n\nWhich one would you like to know more about?`,
        action: { label: 'Browse Full Calendar', path: '/events' },
        chips: ['HACKSPACE Hackathon', 'Cloud Workshop', 'CodeCraft 2026']
      };
    }

    // 8. Admin / Faculty query
    if (q.includes('admin') || q.includes('faculty') || q.includes('sarah') || q.includes('organizer') || q.includes('staff')) {
      return {
        text: `Campus events are organized by university faculty and department leads, such as **Dr. Sarah Jenkins** (Faculty Admin). Faculty members can create events, set PCDP skill gates, and manage venue OTP codes through the Faculty Console.`,
        action: { label: 'Faculty Login', path: '/login' },
        chips: ['Upcoming Events', 'How Squads Work']
      };
    }

    // Default Fallback
    return {
      text: `I'm here to assist with campus events! You can ask me:\n• *"What hackathons are upcoming?"*\n• *"How do I join a squad with a code?"*\n• *"What are the PCDP prerequisites?"*\n• *"How does attendance check-in work?"*`,
      chips: ['Upcoming Events', 'My Registrations', 'How to Join Squad', 'PCDP Criteria']
    };
  };

  const handleSend = async (textToSend = null) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await generateBotResponse(messageText);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: response.text,
            action: response.action,
            chips: response.chips,
            timestamp: new Date(),
          }
        ]);
        setIsTyping(false);
      }, 450);
    } catch {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer group border border-blue-500/30"
            aria-label="Open AI Event Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-tight">AI Event Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[390px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-blue-600 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">Campus AI Assistant</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-blue-100 font-medium">Real-Time Event Guide</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Inline Action Button */}
                  {msg.action && (
                    <button
                      onClick={() => {
                        navigate(msg.action.path);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition flex items-center justify-center space-x-1.5 border border-blue-200"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Suggested Quick Chips */}
                {msg.chips && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[10px] font-medium transition shadow-xs"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 p-2 bg-white rounded-xl border border-slate-200 w-fit">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about events, squads, OTP check-in..."
                className="flex-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-xs cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>Campus Event Intelligence</span>
              <span>Vision Builders AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
