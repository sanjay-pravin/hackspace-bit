import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { pcdpService } from '../services/pcdpService';
import { formatDateTime, formatDate, formatTime } from '../utils/formatters';
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
  AlertCircle,
  HelpCircle,
  Trophy,
  Award
} from 'lucide-react';

export default function AIChatBot() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I'm your AI Campus Event Assistant. I can answer any question about campus events, schedules, venues, rules, team codes, PCDP prerequisites, or your registrations.`,
      timestamp: new Date(),
      chips: ['Upcoming Events', 'HACKSPACE 2026', 'My Registrations', 'How to Join Squad', 'PCDP Criteria', 'Venue OTP Check-in'],
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

  // Intelligent Multi-Factor Event Matching & Attribute Extraction Engine
  const answerEventQuestion = async (query) => {
    const q = query.toLowerCase().trim();
    const allEvents = await eventService.getEvents();

    // Helper: find event matching query
    const findTargetEvent = () => {
      // 1. Direct name/slug keywords
      const keywords = [
        { terms: ['hackspace', 'autonomous', 'hackathon'], slug: 'hackspace-2026-hackathon' },
        { terms: ['cloud', 'kubernetes', 'k8s', 'microservices', 'masterclass'], slug: 'advanced-cloud-kubernetes-masterclass' },
        { terms: ['codecraft', 'speed algo', 'algorithm', 'competitive programming', 'acm'], slug: 'codecraft-2026-speed-algo' },
        { terms: ['ethics', 'dean seminar', 'nextgen ai', 'regulatory'], slug: 'nextgen-ai-ethics-deans-seminar' },
        { terms: ['vibrance', 'cultural', 'gala', 'dance', 'music', 'amphitheatre'], slug: 'vibrance-2026-cultural-gala' },
        { terms: ['titan cup', 'futsal', 'soccer', 'football', 'sports tournament'], slug: 'titan-cup-futsal-tournament' },
        { terms: ['cleantech', 'sustainability', 'green campus', 'seed funding', 'carbon'], slug: 'cleantech-sustainability-challenge-2026' },
      ];

      for (const k of keywords) {
        if (k.terms.some(t => q.includes(t))) {
          const match = allEvents.find(e => e.slug === k.slug || e.title.toLowerCase().includes(k.slug));
          if (match) return match;
        }
      }

      // 2. Exact or substring match in titles
      for (const e of allEvents) {
        const titleLower = e.title.toLowerCase();
        if (q.includes(titleLower)) return e;
        const words = titleLower.split(/[\s:,-]+/).filter(w => w.length > 3);
        const matchCount = words.filter(w => q.includes(w)).length;
        if (matchCount >= 2) return e;
      }

      return null;
    };

    const targetEvent = findTargetEvent();

    // Check Question Intent
    const isTiming = /when|date|time|start|end|duration|hours|schedule|calendar|timing|days/.test(q);
    const isLocation = /where|location|venue|room|lab|hall|place|arena|building|address|in-person|hybrid|virtual/.test(q);
    const isCapacity = /seat|seats|capacity|spot|spots|slots|available|remaining|full|how many|registered/.test(q);
    const isDeadline = /deadline|last date|last day|closing|when to register|due date/.test(q);
    const isRules = /rule|rules|guideline|guidelines|laptop|hardware|bring|dress code|proctor|plagiarism|allowed|kit/.test(q);
    const isEligibility = /eligible|eligibility|prerequisite|pcdp|skill|who can|level|requirement|qualify|allowed to join/.test(q);
    const isTeam = /team|squad|solo|alone|individual|group|member|members|captain|leader|size|how many members/.test(q);
    const isOrganizer = /who is organizing|who organize|organizer|club|department|hosted by|conducted by/.test(q);
    const isOtp = /otp|check in|check-in|attendance|present|code/.test(q);
    const isCancel = /cancel|cancellation|withdraw|drop|refund/.test(q);
    const isConflict = /conflict|overlap|two events|same time|simultaneous/.test(q);
    const isPrize = /prize|award|cash|money|certificate|funding|trophy|reward/.test(q);

    // ==========================================
    // 1. SPECIFIC EVENT INQUIRIES
    // ==========================================
    if (targetEvent) {
      const remaining = Math.max(0, targetEvent.capacity - (targetEvent.registered_count || 0));
      const isPastDeadline = new Date(targetEvent.registration_deadline) < new Date();
      const isFull = (targetEvent.registered_count || 0) >= targetEvent.capacity;

      // 1.1 Timing Question for Specific Event
      if (isTiming) {
        const start = new Date(targetEvent.start_at);
        const end = new Date(targetEvent.end_at);
        const durationHours = Math.round((end - start) / (1000 * 3600));
        return {
          text: `**Schedule for ${targetEvent.title}**:\n\n• **Starts**: ${formatDateTime(targetEvent.start_at)}\n• **Ends**: ${formatDateTime(targetEvent.end_at)}\n• **Total Duration**: Approximately ${durationHours} hours\n• **Registration Deadline**: ${formatDateTime(targetEvent.registration_deadline)}\n\nMake sure to arrive 15 minutes before start time at **${targetEvent.venue}** to check in with the Venue OTP!`,
          action: { label: 'View Event Details', path: `/events/${targetEvent.slug}` },
          chips: [`Where is ${targetEvent.title.split(':')[0]}?`, `Rules for ${targetEvent.title.split(':')[0]}`, 'Registration Deadline']
        };
      }

      // 1.2 Location / Venue Question for Specific Event
      if (isLocation) {
        return {
          text: `**Venue & Location for ${targetEvent.title}**:\n\n• **Mapped Venue**: ${targetEvent.venue}\n• **Format**: ${targetEvent.event_format.toUpperCase()} (${targetEvent.event_format === 'in-person' ? 'On-Campus Attendance' : targetEvent.event_format === 'hybrid' ? 'Both On-Campus & Streamed' : 'Online Platform'})\n• **Organized by**: ${targetEvent.organizer_name}\n\nWhen you arrive at ${targetEvent.venue}, look for the registration check-in screen displaying the live Venue OTP!`,
          action: { label: 'View Event Location', path: `/events/${targetEvent.slug}` },
          chips: [`When does it start?`, `Seats available`, `Team size for this`]
        };
      }

      // 1.3 Capacity / Seat Availability Question for Specific Event
      if (isCapacity) {
        const pct = Math.round(((targetEvent.registered_count || 0) / targetEvent.capacity) * 100);
        return {
          text: `**Seat & Capacity Status for ${targetEvent.title}**:\n\n• **Total Capacity**: ${targetEvent.capacity} seats\n• **Registered Participants**: ${targetEvent.registered_count} seats filled (${pct}%)\n• **Remaining Spots**: **${remaining} spots available**\n• **Status**: ${isFull ? '🔴 Event Full' : isPastDeadline ? '🔴 Registration Closed' : '🟢 Open for Registration'}`,
          action: { label: remaining > 0 ? 'Register Now' : 'Explore Other Events', path: `/events/${targetEvent.slug}` },
          chips: ['Who is eligible?', 'How to register as squad', 'Upcoming Events']
        };
      }

      // 1.4 Deadline Question for Specific Event
      if (isDeadline) {
        const deadlineDate = new Date(targetEvent.registration_deadline);
        const hoursLeft = Math.max(0, Math.round((deadlineDate - new Date()) / (1000 * 3600)));
        const daysLeft = Math.floor(hoursLeft / 24);
        return {
          text: `**Registration Deadline for ${targetEvent.title}**:\n\n• **Deadline**: **${formatDateTime(targetEvent.registration_deadline)}**\n• **Time Remaining**: ${isPastDeadline ? 'Registration is now closed.' : `${daysLeft > 0 ? `${daysLeft} days and ` : ''}${hoursLeft % 24} hours remaining`}\n\nWe recommend registering early to secure seat allocation and hardware provisions!`,
          action: { label: 'Register Before Deadline', path: `/events/${targetEvent.slug}` },
          chips: ['Prerequisite requirements', 'Team size', 'Venue location']
        };
      }

      // 1.5 Rules / What to Bring for Specific Event
      if (isRules) {
        return {
          text: `**Rules & Guidelines for ${targetEvent.title}**:\n\n${targetEvent.event_rules || 'Standard college academic conduct applies.'}\n\n**General Guidelines**:\n• Bring valid student credentials.\n• Arrive on time for venue check-in.\n• Pre-built solutions are strictly audited.`,
          action: { label: 'Read Full Event Overview', path: `/events/${targetEvent.slug}` },
          chips: ['Eligibility Criteria', 'Venue Location', 'Team Size']
        };
      }

      // 1.6 Eligibility / PCDP Prerequisite for Specific Event
      if (isEligibility) {
        let userStatusNote = '';
        if (user && targetEvent.eligibility_type === 'pcdp_skill') {
          const elig = pcdpService.checkEventEligibility(targetEvent, user);
          userStatusNote = elig.eligible
            ? `\n\n🟢 **Your Status**: You (${user.display_name}) have cleared ${targetEvent.required_skill} Level ${elig.currentLevel} and are **eligible to register**!`
            : `\n\n🔴 **Your Status**: You currently have ${targetEvent.required_skill} Level ${elig.currentLevel || 0}. You need Level ${targetEvent.required_skill_level} to participate. You can take the assessment at **ps.bitsathy.ac.in**.`;
        }

        return {
          text: `**Participation Eligibility for ${targetEvent.title}**:\n\n• **Entry Type**: ${targetEvent.eligibility_type === 'pcdp_skill' ? 'PCDP Skill Prerequisite' : 'Open FCFS Entry'}\n• **Required Skill**: ${targetEvent.required_skill ? `**${targetEvent.required_skill} Level ${targetEvent.required_skill_level}**` : 'None (Open to all students)'}\n• **Criteria Details**: ${targetEvent.eligibility_rules}${userStatusNote}`,
          action: { label: 'Check Event & Register', path: `/events/${targetEvent.slug}` },
          chips: ['How to Join Squad', 'PCDP Portal Help', 'Venue Details']
        };
      }

      // 1.7 Team Size / Solo / Squad Question for Specific Event
      if (isTeam) {
        return {
          text: `**Team & Participation Format for ${targetEvent.title}**:\n\n• **Team Allowed**: ${targetEvent.maximum_team_size > 1 ? 'Yes, squad participation supported!' : 'Individual participation only'}\n• **Squad Size**: **${targetEvent.minimum_team_size} to ${targetEvent.maximum_team_size} members per team**\n\n**How to participate as a team**:\n1. Your team captain registers and selects 'Create Squad', receiving a 6-character code (e.g. \`NK-7782\`).\n2. Teammates can enter the code on the event page or under **My Teams** to join automatically!`,
          action: { label: 'Register Squad', path: `/events/${targetEvent.slug}` },
          chips: ['Invite Code Guide', 'Upcoming Hackathons']
        };
      }

      // 1.8 Organizer Question for Specific Event
      if (isOrganizer) {
        return {
          text: `**Organizer Information for ${targetEvent.title}**:\n\n• **Organized by**: **${targetEvent.organizer_name}**\n• **Faculty Lead / Supervisor**: Dr. Sarah Jenkins (Faculty Admin)\n• **Campus Venue**: ${targetEvent.venue}\n\nFaculty organizers supervise on-site judging, hardware tracks, and Venue OTP attendance validation.`,
          action: { label: 'View Event Page', path: `/events/${targetEvent.slug}` },
          chips: ['Event Schedule', 'Event Rules', 'PCDP Criteria']
        };
      }

      // 1.9 Prizes / Rewards for Specific Event
      if (isPrize) {
        return {
          text: `**Awards & Recognition for ${targetEvent.title}**:\n\n• **Certificates**: All verified participants (checked in via Venue OTP) receive an official campus participation certificate.\n• **Competition Awards**: Winners receive official merit citations, rolling trophies (e.g., Titan Cup), and project seed grants (e.g., CleanTech $5,000 funding).\n• **Hardware & Labs**: On-site computing resources, hardware sensor kits, and cloud credits provided by campus sponsors.`,
          action: { label: 'View Event Details', path: `/events/${targetEvent.slug}` },
          chips: ['Event Schedule', 'Venue Location', 'How to Register']
        };
      }

      // 1.10 General Briefing for Specific Event
      return {
        text: `**${targetEvent.title}**\n\n${targetEvent.description}\n\n• **Category**: ${targetEvent.category} (${targetEvent.event_format.toUpperCase()})\n• **Venue**: ${targetEvent.venue}\n• **Date**: ${formatDateTime(targetEvent.start_at)}\n• **Team Size**: ${targetEvent.minimum_team_size === 1 && targetEvent.maximum_team_size === 1 ? 'Individual only' : `${targetEvent.minimum_team_size}-${targetEvent.maximum_team_size} members`}\n• **Availability**: ${remaining} spots left out of ${targetEvent.capacity}\n• **Prerequisite**: ${targetEvent.required_skill ? `${targetEvent.required_skill} Level ${targetEvent.required_skill_level}` : 'Open Entry'}`,
        action: { label: 'Register for this Event', path: `/events/${targetEvent.slug}` },
        chips: [`When does it start?`, `Where is ${targetEvent.title.split(':')[0]}?`, `Rules & Guidelines`]
      };
    }

    // ==========================================
    // 2. USER-SPECIFIC REGISTRATIONS & TEAMS
    // ==========================================
    if (q.includes('my registration') || q.includes('my event') || q.includes('what did i register') || q.includes('am i registered')) {
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
          text: `Hi ${user.display_name}! You do not have any confirmed event registrations yet. Would you like to check out upcoming hackathons or workshops?`,
          action: { label: 'Explore Events', path: '/events' },
          chips: ['Upcoming Hackathons', 'Technical Workshops', 'Sports Events']
        };
      }
      const list = confirmed.map(r => `• **${r.event?.title || 'Campus Event'}**\n  - Assigned ID: \`${r.public_registration_id}\`\n  - Venue: ${r.event?.venue || 'Campus Venue'}\n  - Schedule: ${formatDateTime(r.event?.start_at)}`).join('\n\n');
      return {
        text: `Here are your confirmed event registrations, **${user.display_name}**:\n\n${list}\n\nWhen you arrive at the hall, present your Registration ID and enter the live Venue OTP to mark your attendance!`,
        action: { label: 'Open My Registrations', path: '/student/registrations' },
        chips: ['Venue OTP Guide', 'Squads I am In', 'Explore More Events']
      };
    }

    // User's squads
    if (q.includes('my squad') || q.includes('my team') || q.includes('teams i am in')) {
      if (!user) {
        return {
          text: `Please sign in to view your hackathon squads and team codes.`,
          action: { label: 'Sign In', path: '/login' },
          chips: ['How to Join Squad', 'Upcoming Hackathons']
        };
      }
      return {
        text: `You can view all the squads you lead or have joined in the **Squad Hub**. You'll find each team's roster, captain information, and your 6-character team invite code.`,
        action: { label: 'Open Squad Hub', path: '/student/teams' },
        chips: ['How to Join Squad with Code', 'My Registrations']
      };
    }

    // ==========================================
    // 3. CATEGORY & THEMATIC FILTER QUERIES
    // ==========================================
    if (q.includes('hackathon') || q.includes('hackathons')) {
      const hackathons = allEvents.filter(e => e.category === 'Hackathon');
      const list = hackathons.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} at ${e.venue})`).join('\n');
      return {
        text: `**Upcoming Campus Hackathons**:\n\n${list}\n\nHackathons support squad participation of 2 to 4 members. You can register individually or create a squad with an invite code!`,
        action: { label: 'Browse Hackathons', path: '/events?category=Hackathons' },
        chips: ['HACKSPACE 2026', 'How to Join Squad', 'PCDP Criteria']
      };
    }

    if (q.includes('workshop') || q.includes('workshops')) {
      const workshops = allEvents.filter(e => e.category === 'Technical Workshop');
      const list = workshops.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} at ${e.venue})`).join('\n');
      return {
        text: `**Upcoming Technical Workshops**:\n\n${list}\n\nWorkshops offer hands-on developer training, cloud sandbox credits, and technical certification.`,
        action: { label: 'Explore Workshops', path: '/events?category=Technical+Workshops' },
        chips: ['Cloud Kubernetes Masterclass', 'How to Register']
      };
    }

    if (q.includes('competition') || q.includes('coding competition') || q.includes('codecraft') || q.includes('algorithm')) {
      const comps = allEvents.filter(e => e.category === 'Coding Competition');
      const list = comps.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} on ${e.venue})`).join('\n');
      return {
        text: `**Competitive Coding Events**:\n\n${list}\n\nTimed algorithm contests feature automated online judge testing with strict anti-plagiarism checks.`,
        action: { label: 'View Competitions', path: '/events?category=Coding+Competitions' },
        chips: ['CodeCraft 2026', 'Rules for CodeCraft']
      };
    }

    if (q.includes('sport') || q.includes('sports') || q.includes('futsal') || q.includes('football') || q.includes('tournament')) {
      const sports = allEvents.filter(e => e.category === 'Sports Event');
      const list = sports.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} at ${e.venue})`).join('\n');
      return {
        text: `**Campus Sports Tournaments**:\n\n${list}\n\nInter-departmental leagues follow official FIFA / federation rules with team jerseys compulsory.`,
        action: { label: 'View Sports Tournaments', path: '/events?category=Sports+Events' },
        chips: ['Titan Cup Futsal', 'Team Size for Titan Cup']
      };
    }

    if (q.includes('cultural') || q.includes('music') || q.includes('dance') || q.includes('vibrance') || q.includes('gala')) {
      const culturals = allEvents.filter(e => e.category === 'Cultural Event');
      const list = culturals.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} at ${e.venue})`).join('\n');
      return {
        text: `**Campus Cultural & Arts Events**:\n\n${list}\n\nFeatures live musical concerts, choreography battles, stage theatre, and inter-college showcases.`,
        action: { label: 'Explore Cultural Events', path: '/events?category=Cultural+Events' },
        chips: ['Vibrance 2026 Gala', 'Venue Location']
      };
    }

    if (q.includes('seminar') || q.includes('seminars') || q.includes('keynote') || q.includes('dean')) {
      const seminars = allEvents.filter(e => e.category === 'Seminar');
      const list = seminars.map(e => `• **${e.title}** (${formatDateTime(e.start_at)} at ${e.venue})`).join('\n');
      return {
        text: `**Distinguished Faculty Seminars**:\n\n${list}\n\nFeaturing prominent industry keynote speakers, research fellows, and live Q&A panel sessions.`,
        action: { label: 'View Seminars', path: '/events?category=Seminars' },
        chips: ['Dean Leadership Seminar', 'How to Register']
      };
    }

    // ==========================================
    // 4. PLATFORM POLICIES & HOW-TO GUIDES
    // ==========================================
    // Cancellation policy
    if (isCancel) {
      return {
        text: `**Permanent Registration Policy**:\n\nOnce confirmed, event registrations **cannot be cancelled**. This policy ensures that limited physical venue capacity, catering headcount, and hardware kits are responsibly committed and prevents last-minute no-shows.`,
        chips: ['Check My Registrations', 'Venue OTP Check-in', 'Explore Events']
      };
    }

    // Schedule conflict policy
    if (isConflict) {
      return {
        text: `**Time-Collision Protection**:\n\nStudents cannot register for two events taking place during the same time window. If you are registered for Event A, other events conflicting with Event A's schedule are **automatically hidden from your directory** and direct registration is blocked.`,
        chips: ['My Registrations', 'Explore Directory']
      };
    }

    // Squad & invite code guide
    if (isTeam || q.includes('invite code') || q.includes('squad code') || q.includes('join squad') || q.includes('team code')) {
      return {
        text: `**How Squad Registration & Team Codes Work**:\n\n1. **Create Squad**: The team captain registers for a team event and clicks **Create Squad**, generating an invite code (e.g. \`NK-7782\`).\n2. **Share Code**: The captain shares this code with friends.\n3. **Join Squad**: Teammates can enter the code either in **My Teams** or directly in the **Join Squad** tab on the event page.\n\nAll teammates are automatically enrolled into the roster and receive an individual registration ID for venue attendance!`,
        action: { label: 'Open Squad Hub', path: '/student/teams' },
        chips: ['HACKSPACE 2026', 'Upcoming Hackathons', 'My Registrations']
      };
    }

    // PCDP portal guide
    if (isEligibility || q.includes('pcdp') || q.includes('ps.bitsathy') || q.includes('slot test')) {
      return {
        text: `**BIT Sathy PCDP Portal Integration**:\n\nCertain competitive events (like HACKSPACE 2026) require cleared skill benchmarks on the college PCDP Portal (**ps.bitsathy.ac.in**).\n\n• For HACKSPACE 2026: **C Programming Level 2** is required.\n• To clear or upgrade your skill slot, log in to **ps.bitsathy.ac.in** and take your slot assessment.\n• Our platform verifies your skill level in real time when you click Register!`,
        chips: ['HACKSPACE Requirements', 'Check Other Events', 'How to Join Squad']
      };
    }

    // Venue OTP check-in guide
    if (isOtp || q.includes('how to mark attendance') || q.includes('present')) {
      return {
        text: `**Venue OTP Attendance Guide**:\n\n1. **Arrive at Venue**: Proceed to the event hall or lab indicated on your registration.\n2. **View Live OTP**: Event organizers display a 6-digit live code (e.g. \`849201\`) on the hall presentation screen.\n3. **Enter OTP**: Go to **My Registrations**, click **Enter Venue OTP**, type the 6 digits, and your attendance is marked **Present** instantly!`,
        action: { label: 'Go to My Registrations', path: '/student/registrations' },
        chips: ['Check My Registrations', 'Upcoming Events']
      };
    }

    // General upcoming events
    if (q.includes('upcoming') || q.includes('list') || q.includes('calendar') || q.includes('what events') || q.includes('all events') || q.includes('schedule')) {
      const top4 = allEvents.slice(0, 4);
      const list = top4.map(e => `• **${e.title}** (${e.category})\n  Venue: ${e.venue} | Starts: ${formatDateTime(e.start_at)}`).join('\n\n');
      return {
        text: `**Upcoming Campus Events**:\n\n${list}\n\nAsk me about any specific event (e.g., *"Where is HACKSPACE?"* or *"What are the rules for CodeCraft?"*) to learn more!`,
        action: { label: 'Browse Full Calendar', path: '/events' },
        chips: ['HACKSPACE 2026', 'Cloud Workshop', 'Titan Cup Futsal', 'CodeCraft 2026']
      };
    }

    // What is HACKSPACE
    if (q.includes('what is hackspace') || q.includes('about hackspace')) {
      return {
        text: `**HACKSPACE 2026** is the university's flagship 36-hour hackathon. Teams of 2 to 4 student developers build autonomous AI systems and smart hardware prototypes. Requires **C Programming Level 2** on the PCDP Portal. Mentors from top tech firms will be present on-site in the Grand Arena!`,
        action: { label: 'View HACKSPACE Details', path: '/events/hackspace-2026-hackathon' },
        chips: ['When does HACKSPACE start?', 'Seats available in HACKSPACE', 'Rules for HACKSPACE']
      };
    }

    // Semantic Search across all event descriptions
    const searchWords = q.split(/[\s,?.!]+/).filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'about', 'there', 'please', 'tell'].includes(w));
    if (searchWords.length > 0) {
      const matched = allEvents.filter(e => {
        const text = `${e.title} ${e.description} ${e.category} ${e.venue} ${e.organizer_name} ${e.event_rules || ''} ${e.eligibility_rules || ''}`.toLowerCase();
        return searchWords.some(w => text.includes(w));
      });

      if (matched.length > 0) {
        const list = matched.slice(0, 3).map(e => `• **${e.title}** (${e.category} at ${e.venue})`).join('\n');
        return {
          text: `I found ${matched.length} event${matched.length > 1 ? 's' : ''} matching your inquiry:\n\n${list}\n\nWould you like more details on any of these?`,
          action: { label: 'Browse Search Results', path: `/events?search=${encodeURIComponent(searchWords[0])}` },
          chips: matched.slice(0, 3).map(e => e.title.split(':')[0])
        };
      }
    }

    // Universal Fallback with Contextual Assistance
    return {
      text: `I'm your AI Campus Event Guide! You can ask me anything about:\n\n• **Specific Events**: *"Where is HACKSPACE?"*, *"What time does Cloud workshop start?"*, *"Rules for Titan Cup"*\n• **Availability & Seats**: *"How many spots left in CleanTech?"*, *"Is registration still open?"*\n• **Squads & Codes**: *"How do I join a squad with code NK-7782?"*\n• **PCDP Requirements**: *"What skill level is needed for hackathons?"*\n• **Your Status**: *"What events am I registered for?"*`,
      action: { label: 'Explore Events Catalog', path: '/events' },
      chips: ['Upcoming Events', 'HACKSPACE 2026', 'My Registrations', 'How to Join Squad', 'Venue OTP Help']
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
      const response = await answerEventQuestion(messageText);
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
      }, 350);
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
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[410px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
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
                  <span className="text-[10px] text-blue-100 font-medium">Any-Event Knowledge Engine</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
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
                      className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition flex items-center justify-center space-x-1.5 border border-blue-200 cursor-pointer"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Suggested Quick Chips */}
                {msg.chips && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[10px] font-medium transition shadow-xs cursor-pointer"
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
                placeholder="Ask anything about events, venues, rules, squads..."
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
              <span>Ask in natural language</span>
              <span>Vision Builders AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
