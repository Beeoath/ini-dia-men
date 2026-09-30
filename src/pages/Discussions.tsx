import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Pin,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Clock,
  ShieldCheck,
  Search,
  Hash,
  Paperclip,
  Smile,
  FileText,
  Info,
  Users,
  ChevronRight,
  BookOpen,
  Box,
  TrendingUp,
  Compass,
  BarChart3,
  Heart,
  Lightbulb,
  Download,
  Check,
  Share2,
  CornerDownRight,
  MoreVertical,
  Layers,
  Calculator,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { INITIAL_DISCUSSIONS, DiscussionThread } from "../lib/sigmaData";
import { useAuth, getUserDisplayName } from "../lib/auth";
import { StudentSpatialLayout } from "../components/StudentSpatialLayout";
import { useTheme } from "../lib/theme";
import { MathView, FormattedMathText } from "../components/MathView";
import { LatexInputModal } from "../components/LatexInputModal";

const DISCUSSIONS_STORAGE_KEY = "sigma_discussion_threads_v3";
const CHAT_MESSAGES_STORAGE_KEY = "sigma_chat_messages_v3";

interface ChannelItem {
  id: string;
  name: string;
  category: string;
  topicTitle: string;
  lastMessage: string;
  lastSender: string;
  lastTime: string;
  unreadCount?: number;
  icon: React.ElementType;
  color: string;
  memberCount: number;
  description: string;
  isOfficial?: boolean;
}

interface DirectContact {
  id: string;
  name: string;
  role: "teacher" | "student";
  roleLabel: string;
  avatarColor: string;
  status: "online" | "away" | "offline";
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  channelId: string;
  authorName: string;
  authorRole: "teacher" | "student";
  authorClass?: string;
  content: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
  isVerifiedSolution?: boolean;
  isPinned?: boolean;
  tags?: string[];
  repliesCount?: number;
  reactions?: {
    thumbsUp: number;
    heart: number;
    lightbulb: number;
    userReacted?: string;
  };
  attachment?: {
    name: string;
    size: string;
    type: "pdf" | "image";
  };
}

const CHANNELS: ChannelItem[] = [
  {
    id: "chan-aljabar",
    name: "Klub Aljabar & Matriks",
    category: "Aljabar",
    topicTitle: "Determinan Sarrus, Invers Matriks & Aturan Cramer",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: Box,
    color: "from-cyan-400 to-blue-500",
    memberCount: 32,
    description: "Saluran pembedahan soal-soal Aljabar Linier, Matriks nonsingular, dan SPLTV persiapan TKA 2026.",
    isOfficial: true,
  },
  {
    id: "chan-fungsi",
    name: "Fungsi, Limit & Kalkulus",
    category: "Fungsi",
    topicTitle: "Domain Alami, Invers Fungsi & Turunan Rantai",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: TrendingUp,
    color: "from-amber-400 to-orange-500",
    memberCount: 29,
    description: "Ruang diskusi pemodelan fungsi rasional, komposisi relasi bertingkat, dan limit aljabar.",
  },
  {
    id: "chan-geometri",
    name: "Geometri Ruang 3D & Vektor",
    category: "Geometri",
    topicTitle: "Jarak Titik ke Bidang & Proyeksi Vektor Ortogonal",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: Compass,
    color: "from-rose-400 to-pink-500",
    memberCount: 27,
    description: "Kupas tuntas visualisasi kubus ABCD.EFGH dan proyeksi vektor ortogonal 3D.",
  },
  {
    id: "chan-trigonometri",
    name: "Trigonometri Lanjut",
    category: "Trigonometri",
    topicTitle: "Identitas Sudut Rangkap sin 2A & Limit Tak Tentu",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: Sparkles,
    color: "from-sky-400 to-indigo-500",
    memberCount: 26,
    description: "Pembahasan identitas trigonometri, persamaan kuadrat sinus, dan nilai eksak sudut istimewa.",
  },
  {
    id: "chan-statistika",
    name: "Peluang & Statistika TKA",
    category: "Statistika",
    topicTitle: "Permutasi Siklis, Kombinasi & Kuartil Data",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: BarChart3,
    color: "from-purple-400 to-indigo-500",
    memberCount: 25,
    description: "Kaidah pencacahan permutasi, kombinasi binom, dan analisis desil kuartil data berbobot.",
  },
  {
    id: "chan-tanya-guru",
    name: "Konsultasi Tanya Guru",
    category: "Konsultasi",
    topicTitle: "Q&A Khusus Langsung ke Ust. Ahmad Fauzi, S.Pd.",
    lastMessage: "Belum ada pesan di saluran ini",
    lastSender: "",
    lastTime: "-",
    icon: GraduationCap,
    color: "from-emerald-400 to-teal-500",
    memberCount: 34,
    description: "Saluran eksklusif asistensi belajar guru pengampu matematika MA Darunnajah 9.",
    isOfficial: true,
  },
];

const DIRECT_CONTACTS: DirectContact[] = [
  {
    id: "dm-ust-fauzi",
    name: "Ust. Ahmad Fauzi, S.Pd.",
    role: "teacher",
    roleLabel: "Guru Pengampu TKA",
    avatarColor: "from-emerald-400 to-teal-600",
    status: "online",
    lastMessage: "Belum ada percakapan",
    lastTime: "-",
  },
  {
    id: "dm-sarah",
    name: "Sarah Amelia",
    role: "student",
    roleLabel: "Kelas 11",
    avatarColor: "from-purple-400 to-indigo-600",
    status: "online",
    lastMessage: "Belum ada percakapan",
    lastTime: "-",
  },
  {
    id: "dm-faris",
    name: "Faris Al-Ghifari",
    role: "student",
    roleLabel: "Kelas 11",
    avatarColor: "from-cyan-400 to-blue-600",
    status: "away",
    lastMessage: "Belum ada percakapan",
    lastTime: "-",
  },
  {
    id: "dm-rayhan",
    name: "Muhammad Rayhan",
    role: "student",
    roleLabel: "Kelas 11",
    avatarColor: "from-amber-400 to-orange-500",
    status: "offline",
    lastMessage: "Belum ada percakapan",
    lastTime: "-",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [];


export default function Discussions() {
  const { profile } = useAuth();
  const { isDark } = useTheme();

  // Selected Channel / Chat State
  const [activeTab, setActiveTab] = useState<"channels" | "dms">("channels");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("chan-aljabar");
  const [selectedDmId, setSelectedDmId] = useState<string | null>(null);

  // Search in sidebar & chat
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [filterSolvedOnly, setFilterSolvedOnly] = useState(false);

  // Chat Composer State
  const [messageInput, setMessageInput] = useState("");
  const [showFormulaPicker, setShowFormulaPicker] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexTarget, setLatexTarget] = useState<"message" | "topic">("message");

  // Threads list for legacy sync
  const [threads, setThreads] = useState<DiscussionThread[]>(() => {
    try {
      localStorage.removeItem("sigma_discussion_threads");
      const saved = localStorage.getItem(DISCUSSIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DISCUSSIONS;
  });

  // Messages list state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      localStorage.removeItem("sigma_chat_messages_v2");
      const saved = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MESSAGES;
  });

  const handleClearAllForum = () => {
    setMessages([]);
    setThreads([]);
    try {
      localStorage.removeItem(DISCUSSIONS_STORAGE_KEY);
      localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
      localStorage.removeItem("sigma_discussion_threads");
      localStorage.removeItem("sigma_chat_messages_v2");
    } catch {
      // ignore
    }
    toast.success("Seluruh pesan dan topik forum diskusi berhasil dikosongkan.");
  };

  // Modal State for New Topic
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Aljabar");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannelId, selectedDmId]);

  // Persist messages
  const saveMessages = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(newMsgs));
    } catch {
      // ignore
    }
  };

  // Find active entity
  const currentChannel = useMemo(() => {
    return CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];
  }, [selectedChannelId]);

  const currentDm = useMemo(() => {
    if (!selectedDmId) return null;
    return DIRECT_CONTACTS.find((c) => c.id === selectedDmId) || null;
  }, [selectedDmId]);

  // Active messages
  const activeRoomId = selectedDmId ? selectedDmId : selectedChannelId;
  const currentMessages = useMemo(() => {
    let list = messages.filter((m) => m.channelId === activeRoomId);

    if (filterSolvedOnly) {
      list = list.filter((m) => m.isVerifiedSolution || m.authorRole === "teacher");
    }

    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.authorName.toLowerCase().includes(q) ||
          m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [messages, activeRoomId, filterSolvedOnly, chatSearch]);

  // Filtered Channels & DMs for sidebar
  const filteredChannels = useMemo(() => {
    if (!sidebarSearch.trim()) return CHANNELS;
    const q = sidebarSearch.toLowerCase();
    return CHANNELS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.topicTitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [sidebarSearch]);

  const filteredDms = useMemo(() => {
    if (!sidebarSearch.trim()) return DIRECT_CONTACTS;
    const q = sidebarSearch.toLowerCase();
    return DIRECT_CONTACTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.roleLabel.toLowerCase().includes(q) ||
        d.lastMessage.toLowerCase().includes(q)
    );
  }, [sidebarSearch]);

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const userDisplayName = getUserDisplayName(profile, "Ahmad Rizky Pratama");
    const userRole = profile?.role === "teacher" ? "teacher" : "student";
    const userClass = profile?.class_name || "Kelas 11";

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeRoomId,
      authorName: userDisplayName,
      authorRole: userRole,
      authorClass: userClass,
      content: messageInput.trim(),
      timestamp: "Baru saja",
      upvotes: 1,
      hasUpvoted: true,
      reactions: { thumbsUp: 1, heart: 0, lightbulb: 0, userReacted: "thumbsUp" },
    };

    const updated = [...messages, newMsg];
    saveMessages(updated);
    setMessageInput("");
  };

  // Upvote message handler
  const handleUpvoteMessage = (msgId: string) => {
    const updated = messages.map((m) => {
      if (m.id === msgId) {
        const nextState = !m.hasUpvoted;
        return {
          ...m,
          hasUpvoted: nextState,
          upvotes: nextState ? m.upvotes + 1 : Math.max(0, m.upvotes - 1),
        };
      }
      return m;
    });
    saveMessages(updated);
  };

  // Reaction handler
  const handleReaction = (msgId: string, reactionType: "thumbsUp" | "heart" | "lightbulb") => {
    const updated = messages.map((m) => {
      if (m.id === msgId) {
        const reactions = m.reactions || { thumbsUp: 0, heart: 0, lightbulb: 0 };
        const current = reactions[reactionType] || 0;
        const isCurrentActive = reactions.userReacted === reactionType;

        return {
          ...m,
          reactions: {
            ...reactions,
            [reactionType]: isCurrentActive ? Math.max(0, current - 1) : current + 1,
            userReacted: isCurrentActive ? undefined : reactionType,
          },
        };
      }
      return m;
    });
    saveMessages(updated);
  };

  // Create new topic modal submit
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const userDisplayName = getUserDisplayName(profile, "Ahmad Rizky Pratama");
    const userRole = profile?.role === "teacher" ? "teacher" : "student";
    const userClass = profile?.class_name || "Kelas 11";

    // Map category to channel
    const targetChannel =
      CHANNELS.find((c) => c.category.toLowerCase() === newCategory.toLowerCase()) ||
      CHANNELS[0];

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: targetChannel.id,
      authorName: userDisplayName,
      authorRole: userRole,
      authorClass: userClass,
      content: `[Topik: ${newTitle.trim()}]\n\n${newContent.trim()}`,
      timestamp: "Baru saja",
      upvotes: 1,
      hasUpvoted: true,
      tags: [newCategory, "Pertanyaan Baru"],
      reactions: { thumbsUp: 1, heart: 0, lightbulb: 0 },
    };

    saveMessages([...messages, newMsg]);

    // Also sync to legacy threads storage
    const newThread: DiscussionThread = {
      id: `thr-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: userDisplayName,
      authorName: userDisplayName,
      authorRole: userRole,
      authorClass: userClass,
      category: newCategory,
      repliesCount: 0,
      upvotes: 1,
      isAnswered: false,
      createdAt: "Baru saja",
    };
    const updatedThreads = [newThread, ...threads];
    setThreads(updatedThreads);
    try {
      localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(updatedThreads));
    } catch {
      // ignore
    }

    // Switch to target channel
    setSelectedDmId(null);
    setSelectedChannelId(targetChannel.id);
    setActiveTab("channels");

    setNewTitle("");
    setNewContent("");
    setIsCreatingModal(false);
  };

  const quickFormulas = [
    { label: "det(A)", snippet: "det(A) = ad - bc" },
    { label: "A⁻¹", snippet: "A⁻¹ = 1/det(A) * adj(A)" },
    { label: "OBE", snippet: "R₂ → R₂ - 2R₁" },
    { label: "Sarrus", snippet: "Determinan Sarrus 3x3" },
    { label: "Cramer", snippet: "x = D_x / D" },
    { label: "sin 2A", snippet: "sin 2A = 2 sin A cos A" },
    { label: "cos 2A", snippet: "cos 2A = cos²A - sin²A" },
    { label: "P(n,k)", snippet: "P(n,k) = n! / (n-k)!" },
  ];

  return (
    <StudentSpatialLayout
      activeDockItem="discussions"
      searchQuery={sidebarSearch}
      onSearchChange={setSidebarSearch}
      searchPlaceholder="Cari topik diskusi atau nama siswa..."
    >
      <div className="space-y-4">
        {/* ================================================================== */}
        {/* 1. TOP HEADER BAR: Compact Class Discussion & Chat Header           */}
        {/* ================================================================== */}
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border backdrop-blur-2xl transition-all shadow-md ${
            isDark
              ? "border-white/10 bg-gradient-to-r from-[#0c1022]/90 via-[#101530]/85 to-[#0e122b]/90 text-white"
              : "border-slate-200 bg-white/90 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 place-items-center rounded-2xl border font-black text-cyan-400 shadow-md ${
                isDark
                  ? "bg-cyan-500/10 border-cyan-400/30"
                  : "bg-cyan-50 border-cyan-300 text-cyan-600"
              }`}
            >
              <MessageSquare size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-black tracking-tight">
                  Forum Diskusi &amp; Chat Kelas
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border border-emerald-400/40 bg-emerald-400/15 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE AKTIF
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                MA Darunnajah 9 · Saluran Interaktif Siswa &amp; Guru Pengampu TKA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Status Pill */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isDark
                  ? "bg-white/[0.04] border-white/10 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <Users size={14} className="text-cyan-400" />
              <span>34 Siswa &amp; Ust. Fauzi Online</span>
            </div>

            {/* Clear All Forum Button */}
            <button
              type="button"
              onClick={handleClearAllForum}
              className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                isDark
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-95"
                  : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 active:scale-95"
              }`}
              title="Kosongkan seluruh pesan dan topik forum diskusi"
            >
              <Trash2 size={14} />
              <span>Kosongkan Forum</span>
            </button>

            {/* New Topic Button */}
            <button
              type="button"
              onClick={() => setIsCreatingModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Topik Baru</span>
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. MAIN WORKSPACE CONTAINER: Class Discussion & Chat Template       */}
        {/* ================================================================== */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 h-[760px] lg:h-[820px] rounded-3xl border overflow-hidden backdrop-blur-2xl shadow-2xl transition-all ${
            isDark
              ? "border-white/[0.12] bg-[#0c0e18]/80 text-slate-100"
              : "border-slate-200 bg-white text-slate-900 shadow-xl"
          }`}
        >
          {/* ================================================================ */}
          {/* COLUMN A: CHANNELS & DIRECT MESSAGES (LEFT SIDEBAR - 3.5 cols)    */}
          {/* ================================================================ */}
          <aside
            className={`lg:col-span-4 xl:col-span-3.5 flex flex-col border-b lg:border-b-0 lg:border-r transition-colors ${
              isDark ? "border-white/10 bg-[#0f1120]/90" : "border-slate-200 bg-slate-50/80"
            }`}
          >
            {/* Sidebar Search Bar */}
            <div className="p-3.5 border-b border-white/10 dark:border-white/10 space-y-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Cari saluran atau nama siswa..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className={`w-full rounded-2xl pl-9 pr-3 py-2 text-xs outline-none transition-all shadow-inner ${
                    isDark
                      ? "bg-white/[0.06] border border-white/10 text-slate-200 placeholder-slate-400 focus:border-cyan-400/50"
                      : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 shadow-sm"
                  }`}
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Segmented Filter Pills */}
              <div
                className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-bold ${
                  isDark ? "bg-white/5 border-white/10" : "bg-slate-200/80 border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("channels");
                    setSelectedDmId(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "channels"
                      ? isDark
                        ? "bg-cyan-400 text-slate-950 font-black shadow-sm"
                        : "bg-white text-slate-950 font-black shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Hash size={13} />
                  <span>Saluran ({filteredChannels.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("dms");
                    if (!selectedDmId) setSelectedDmId(DIRECT_CONTACTS[0].id);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "dms"
                      ? isDark
                        ? "bg-cyan-400 text-slate-950 font-black shadow-sm"
                        : "bg-white text-slate-950 font-black shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MessageCircle size={13} />
                  <span>Pesan Pribadi</span>
                </button>
              </div>
            </div>

            {/* Scrollable Channels & DMs List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
              {activeTab === "channels" ? (
                <>
                  <div
                    className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Grup Diskusi Mata Pelajaran
                  </div>

                  {filteredChannels.map((channel) => {
                    const Icon = channel.icon;
                    const isSelected = !selectedDmId && selectedChannelId === channel.id;
                    const chMsgs = messages.filter((m) => m.channelId === channel.id);
                    const latestChMsg = chMsgs[chMsgs.length - 1];
                    const chDisplayMsg = latestChMsg
                      ? `${latestChMsg.authorName}: ${latestChMsg.content.replace(/\[Topik: .*?\]\n\n/, "").slice(0, 36)}...`
                      : "Belum ada pesan";
                    const chDisplayTime = latestChMsg ? latestChMsg.timestamp : "-";

                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          setSelectedChannelId(channel.id);
                          setSelectedDmId(null);
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer group flex items-start gap-3 relative ${
                          isSelected
                            ? isDark
                              ? "bg-white/[0.12] border border-cyan-400/40 shadow-lg text-white"
                              : "bg-white border border-cyan-500/50 shadow-md text-slate-900"
                            : isDark
                            ? "hover:bg-white/5 border border-transparent text-slate-300"
                            : "hover:bg-white/70 border border-transparent text-slate-700"
                        }`}
                      >
                        {/* Channel Icon Avatar */}
                        <div
                          className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                            isSelected
                              ? `bg-gradient-to-tr ${channel.color} text-slate-950 font-black`
                              : isDark
                              ? "bg-white/10 text-cyan-300"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        {/* Text Snippet */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs font-bold truncate flex items-center gap-1 ${
                                isSelected
                                  ? isDark
                                    ? "text-cyan-300"
                                    : "text-cyan-700"
                                  : isDark
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              #{channel.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {chDisplayTime}
                            </span>
                          </div>

                          <p
                            className={`text-[11px] truncate leading-tight ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {chDisplayMsg}
                          </p>

                          <div className="flex items-center justify-between mt-1.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                isDark
                                  ? "bg-white/5 text-slate-300"
                                  : "bg-slate-200/70 text-slate-600"
                              }`}
                            >
                              {channel.category}
                            </span>

                            {chMsgs.length > 0 && (
                              <span className="grid h-4 min-w-4 px-1 place-items-center rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black shadow-sm">
                                {chMsgs.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <div
                    className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Guru &amp; Teman Sekelas
                  </div>

                  {filteredDms.map((contact) => {
                    const isSelected = selectedDmId === contact.id;
                    const dmMsgs = messages.filter((m) => m.channelId === contact.id);
                    const latestDmMsg = dmMsgs[dmMsgs.length - 1];
                    const dmDisplayMsg = latestDmMsg
                      ? `${latestDmMsg.authorName}: ${latestDmMsg.content.slice(0, 36)}...`
                      : "Belum ada percakapan";
                    const dmDisplayTime = latestDmMsg ? latestDmMsg.timestamp : "-";

                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setSelectedDmId(contact.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer group flex items-start gap-3 relative ${
                          isSelected
                            ? isDark
                              ? "bg-white/[0.12] border border-cyan-400/40 shadow-lg text-white"
                              : "bg-white border border-cyan-500/50 shadow-md text-slate-900"
                            : isDark
                            ? "hover:bg-white/5 border border-transparent text-slate-300"
                            : "hover:bg-white/70 border border-transparent text-slate-700"
                        }`}
                      >
                        {/* Avatar with Online Dot */}
                        <div className="relative shrink-0">
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-tr ${contact.avatarColor} grid place-items-center text-xs font-black shadow-sm ${
                              contact.role === "teacher" ? "text-slate-950" : "text-white"
                            }`}
                          >
                            {contact.role === "teacher" ? (
                              <GraduationCap size={17} />
                            ) : (
                              contact.name.charAt(0)
                            )}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                              isDark ? "border-[#0f1120]" : "border-white"
                            } ${
                              contact.status === "online"
                                ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                                : contact.status === "away"
                                ? "bg-amber-400"
                                : "bg-slate-400"
                            }`}
                          />
                        </div>

                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs font-bold truncate flex items-center gap-1.5 ${
                                contact.role === "teacher" ? "text-cyan-400" : ""
                              }`}
                            >
                              {contact.name}
                              {contact.role === "teacher" && (
                                <ShieldCheck size={13} className="text-cyan-400" />
                              )}
                            </span>
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {dmDisplayTime}
                            </span>
                          </div>

                          <p
                            className={`text-[11px] truncate leading-tight ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {dmDisplayMsg}
                          </p>

                          <div className="flex items-center justify-between mt-1.5">
                            <span
                              className={`text-[10px] font-medium ${
                                isDark ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              {contact.roleLabel}
                            </span>

                            {dmMsgs.length > 0 && (
                              <span className="grid h-4 min-w-4 px-1 place-items-center rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black shadow-sm">
                                {dmMsgs.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Sidebar Bottom User Status Footer */}
            <div
              className={`p-3 border-t border-white/10 dark:border-white/10 flex items-center justify-between gap-2 ${
                isDark ? "bg-white/[0.02]" : "bg-slate-100/70"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-black grid place-items-center text-xs shadow-sm">
                    {getUserDisplayName(profile, "Ahmad Rizky").charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {getUserDisplayName(profile, "Ahmad Rizky Pratama")}
                  </p>
                  <p
                    className={`text-[10px] truncate ${
                      isDark ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    {profile?.class_name || "Kelas 11"} · Siswa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingModal(true)}
                className="grid h-7 w-7 place-items-center rounded-xl bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-colors cursor-pointer"
                title="Ajukan Pertanyaan Baru"
              >
                <Plus size={15} />
              </button>
            </div>
          </aside>

          {/* ================================================================ */}
          {/* COLUMN B: MAIN ACTIVE CHAT & DISCUSSION STREAM (CENTER - 6 cols)  */}
          {/* ================================================================ */}
          <section className="lg:col-span-8 xl:col-span-8.5 flex flex-col h-full transition-all overflow-hidden">
            {/* Active Channel / DM Header */}
            <div
              className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 backdrop-blur-md ${
                isDark ? "border-white/10 bg-[#0c0e1a]/90" : "border-slate-200 bg-white/95"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {currentDm ? (
                  <div className="relative">
                    <div
                      className={`h-9 w-9 rounded-full bg-gradient-to-tr ${currentDm.avatarColor} grid place-items-center text-xs font-black shadow-sm ${
                        currentDm.role === "teacher" ? "text-slate-950" : "text-white"
                      }`}
                    >
                      {currentDm.role === "teacher" ? (
                        <GraduationCap size={16} />
                      ) : (
                        currentDm.name.charAt(0)
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                  </div>
                ) : (
                  <div
                    className={`h-9 w-9 rounded-xl grid place-items-center text-cyan-400 font-bold border shadow-sm ${
                      isDark ? "bg-cyan-500/10 border-cyan-400/30" : "bg-cyan-50 border-cyan-300 text-cyan-700"
                    }`}
                  >
                    <Hash size={18} />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black truncate">
                      {currentDm ? currentDm.name : currentChannel.name}
                    </h2>
                    {currentDm?.role === "teacher" && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[9px] font-mono font-bold bg-cyan-400/15 text-cyan-400 border border-cyan-400/30">
                        <ShieldCheck size={10} /> Guru
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {currentDm
                      ? `${currentDm.roleLabel} · Online & Siap Menjawab`
                      : `${currentChannel.topicTitle} · ${currentChannel.memberCount} Siswa Terdaftar`}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Search In Chat */}
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Cari pesan..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className={`h-8 w-32 sm:w-40 rounded-full pl-7 pr-2.5 text-[11px] outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.06] border border-white/10 text-slate-200 placeholder-slate-400 focus:w-48"
                        : "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:w-48"
                    }`}
                  />
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* Filter Solved Only Toggle */}
                <button
                  type="button"
                  onClick={() => setFilterSolvedOnly(!filterSolvedOnly)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    filterSolvedOnly
                      ? "bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-sm"
                      : isDark
                      ? "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                  title="Tampilkan hanya jawaban guru yang terverifikasi"
                >
                  <CheckCircle2 size={13} />
                  <span className="hidden sm:inline">Solusi Guru</span>
                </button>
              </div>
            </div>

            {/* Pinned Official Banner (if active channel has an actual pinned message) */}
            {(() => {
              const pinnedMsg = currentMessages.find((m) => m.isPinned);
              if (!pinnedMsg) return null;
              return (
                <div
                  className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs ${
                    isDark
                      ? "bg-amber-500/[0.08] border-amber-500/20 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-6 w-6 place-items-center rounded-lg bg-amber-400/20 text-amber-400 shrink-0 font-bold">
                      <Pin size={12} />
                    </div>
                    <p className="truncate text-[11px] sm:text-xs">
                      <strong className="font-bold">{pinnedMsg.authorName}:</strong> {pinnedMsg.content}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono shrink-0 uppercase tracking-wider font-bold text-amber-400">
                    Pinned
                  </span>
                </div>
              );
            })()}

            {/* Chat Messages Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
              {/* Date Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`w-full border-t ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  />
                </div>
                <span
                  className={`relative px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isDark
                      ? "bg-[#131627] border border-white/10 text-slate-400"
                      : "bg-white border border-slate-200 text-slate-500 shadow-sm"
                  }`}
                >
                  Hari ini · 26 September 2026
                </span>
              </div>

              {currentMessages.length === 0 ? (
                <div className="py-20 text-center space-y-3.5 px-4">
                  <div
                    className={`grid h-16 w-16 place-items-center rounded-2xl mx-auto border shadow-sm ${
                      isDark
                        ? "bg-white/5 border-white/10 text-cyan-400"
                        : "bg-cyan-50 border-cyan-200 text-cyan-600"
                    }`}
                  >
                    <MessageSquare size={28} />
                  </div>
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Forum Diskusi Masih Kosong
                  </h3>
                  <p
                    className={`text-xs max-w-sm mx-auto leading-relaxed ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Belum ada pesan atau pertanyaan dalam saluran ini. Silakan mulai percakapan atau buat topik baru untuk berdiskusi bersama guru dan teman sekelas!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>Mulai Topik Diskusi</span>
                  </button>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isTeacher = msg.authorRole === "teacher";
                  const isCurrentUser =
                    msg.authorName.toLowerCase().includes("rizky") ||
                    msg.authorName === profile?.full_name;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 group transition-all animate-in fade-in ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 pt-0.5">
                        <div
                          className={`h-9 w-9 rounded-2xl grid place-items-center text-xs font-black shadow-md ${
                            isTeacher
                              ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 border border-amber-300"
                              : isCurrentUser
                              ? "bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-black"
                              : "bg-gradient-to-tr from-purple-400 to-indigo-600 text-white"
                          }`}
                        >
                          {isTeacher ? (
                            <GraduationCap size={16} />
                          ) : (
                            msg.authorName.charAt(0)
                          )}
                        </div>
                      </div>

                      {/* Message Body Container */}
                      <div
                        className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${
                          isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Author Header */}
                        <div
                          className={`flex items-center gap-2 text-[11px] ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`font-bold ${
                              isTeacher
                                ? "text-amber-400"
                                : isDark
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            {msg.authorName}
                          </span>

                          {isTeacher && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.2 text-[9px] font-mono font-bold">
                              <ShieldCheck size={10} /> GURU
                            </span>
                          )}

                          {msg.authorClass && !isTeacher && (
                            <span
                              className={`text-[10px] font-mono ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              ({msg.authorClass})
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-mono ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Speech Bubble Card */}
                        <div
                          className={`p-3.5 sm:p-4 rounded-3xl transition-all shadow-sm relative ${
                            msg.isVerifiedSolution
                              ? isDark
                                ? "bg-gradient-to-br from-emerald-500/15 via-[#131d22]/95 to-[#101920]/95 border-2 border-emerald-400/40 text-slate-100"
                                : "bg-emerald-50/90 border-2 border-emerald-400 text-slate-900 shadow-md"
                              : isCurrentUser
                              ? isDark
                                ? "bg-gradient-to-br from-cyan-600/90 to-blue-600/90 text-white border border-cyan-400/30 rounded-tr-none"
                                : "bg-cyan-600 text-white rounded-tr-none shadow-md"
                              : isDark
                              ? "bg-[#14172a]/95 border border-white/[0.12] text-slate-100 rounded-tl-none"
                              : "bg-slate-100/90 border border-slate-200 text-slate-900 rounded-tl-none shadow-sm"
                          }`}
                        >
                          {/* Verified Solution Badge Banner */}
                          {msg.isVerifiedSolution && (
                            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-emerald-400/30 text-emerald-400 font-bold text-xs">
                              <CheckCircle2 size={14} className="stroke-[2.5]" />
                              <span>Solusi Terverifikasi Guru Pengampu</span>
                            </div>
                          )}

                          {/* Message Text Content with KaTeX LaTeX rendering */}
                          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line select-text">
                            <FormattedMathText text={msg.content} />
                          </div>

                          {/* Attached Document Card (if any) */}
                          {msg.attachment && (
                            <div
                              className={`mt-3 p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                                isDark
                                  ? "bg-black/30 border-white/15"
                                  : "bg-white/80 border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-400/30 shrink-0">
                                  <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">
                                    {msg.attachment.name}
                                  </p>
                                  <p
                                    className={`text-[10px] font-mono ${
                                      isDark ? "text-slate-400" : "text-slate-500"
                                    }`}
                                  >
                                    {msg.attachment.size} · PDF Rangkuman TKA
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-colors cursor-pointer"
                                title="Unduh Materi"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          )}

                          {/* Tags Pills */}
                          {msg.tags && msg.tags.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {msg.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                    isCurrentUser
                                      ? "bg-white/20 text-white"
                                      : isDark
                                      ? "bg-white/10 text-cyan-300"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reactions and Interactive Action Chips */}
                        <div
                          className={`flex items-center gap-2 text-xs pt-0.5 ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* Upvote Pill */}
                          <button
                            type="button"
                            onClick={() => handleUpvoteMessage(msg.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                              msg.hasUpvoted
                                ? "bg-cyan-400 text-slate-950 shadow-sm"
                                : isDark
                                ? "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            <ThumbsUp size={11} className={msg.hasUpvoted ? "fill-current" : ""} />
                            <span>{msg.upvotes}</span>
                          </button>

                          {/* Heart Reaction */}
                          <button
                            type="button"
                            onClick={() => handleReaction(msg.id, "heart")}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${
                              msg.reactions?.userReacted === "heart"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                : isDark
                                ? "bg-white/5 text-slate-400 hover:text-rose-400"
                                : "bg-slate-200/80 text-slate-600 hover:text-rose-600"
                            }`}
                          >
                            <Heart size={11} className={msg.reactions?.userReacted === "heart" ? "fill-rose-500 text-rose-500" : ""} />
                            <span>{msg.reactions?.heart || 0}</span>
                          </button>

                          {/* Lightbulb Reaction */}
                          <button
                            type="button"
                            onClick={() => handleReaction(msg.id, "lightbulb")}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${
                              msg.reactions?.userReacted === "lightbulb"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                : isDark
                                ? "bg-white/5 text-slate-400 hover:text-amber-400"
                                : "bg-slate-200/80 text-slate-600 hover:text-amber-600"
                            }`}
                          >
                            <Lightbulb size={11} className={msg.reactions?.userReacted === "lightbulb" ? "fill-amber-400 text-amber-400" : ""} />
                            <span>{msg.reactions?.lightbulb || 0}</span>
                          </button>

                          {msg.repliesCount ? (
                            <span
                              className={`text-[10px] font-mono ml-1 ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {msg.repliesCount} balasan
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Composer */}
            <div
              className={`p-3 sm:p-4 border-t space-y-2.5 backdrop-blur-xl ${
                isDark ? "border-white/10 bg-[#0c0e1a]/95" : "border-slate-200 bg-white"
              }`}
            >
              {/* Quick Formula Insertion Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 mr-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Rumus Cepat:
                </span>
                {quickFormulas.map((qf) => (
                  <button
                    key={qf.label}
                    type="button"
                    onClick={() =>
                      setMessageInput((prev) => (prev ? `${prev} [${qf.snippet}]` : qf.snippet))
                    }
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer shrink-0 ${
                      isDark
                        ? "bg-white/5 border-white/10 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-400/40"
                        : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-cyan-50 hover:border-cyan-400"
                    }`}
                  >
                    {qf.label}
                  </button>
                ))}
              </div>

              {/* Real-time KaTeX Live Preview for In-Progress Message with LaTeX */}
              {(messageInput.includes("$") || messageInput.includes("\\")) && (
                <div
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in ${
                    isDark
                      ? "bg-[#090e1f] border-cyan-400/35 text-slate-100 shadow-md"
                      : "bg-cyan-50/90 border-cyan-300 text-slate-900 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-1.5 shrink-0 text-cyan-500 dark:text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Pratinjau KaTeX:</span>
                  </div>
                  <div className="flex-1 text-center font-bold overflow-x-auto py-0.5 select-text">
                    <FormattedMathText text={messageInput} />
                  </div>
                </div>
              )}

              {/* Chat Form Box */}
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                {/* Input LaTeX Modal Button */}
                <button
                  type="button"
                  onClick={() => {
                    setLatexTarget("message");
                    setShowLatexModal(true);
                  }}
                  className={`h-11 px-3 sm:px-3.5 rounded-2xl flex items-center gap-1.5 border font-mono text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isDark
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/25 hover:border-cyan-400 shadow-md shadow-cyan-500/10"
                      : "bg-cyan-50 border-cyan-400 text-cyan-800 hover:bg-cyan-100 shadow-sm"
                  }`}
                  title="Buka Papan Input Rumus LaTeX Visual (KaTeX)"
                >
                  <Calculator size={15} className="text-cyan-400" />
                  <span className="hidden sm:inline">Input</span>
                  <span className="font-black text-cyan-400">LaTeX</span>
                </button>

                {/* Math Symbol Quick Trigger */}
                <button
                  type="button"
                  onClick={() => setShowFormulaPicker(!showFormulaPicker)}
                  className={`h-11 w-11 rounded-2xl grid place-items-center border transition-all cursor-pointer shrink-0 font-mono text-xs font-black ${
                    showFormulaPicker
                      ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md"
                      : isDark
                      ? "bg-white/[0.06] border-white/10 text-cyan-400 hover:bg-white/10"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                  title="Karakter Simbol Cepat"
                >
                  fx
                </button>

                {/* Input Text Box */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Tulis pesan atau rumus LaTeX ($...$) di #${
                      currentDm ? currentDm.name : currentChannel.name
                    }...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className={`w-full h-11 rounded-2xl pl-4 pr-12 text-xs sm:text-sm outline-none transition-all shadow-inner ${
                      isDark
                        ? "bg-white/[0.06] border border-white/15 text-slate-100 placeholder-slate-400 focus:border-cyan-400/60 focus:bg-white/[0.09]"
                        : "bg-slate-100/90 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white"
                    }`}
                  />

                  {/* Send Button Inside Input */}
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl grid place-items-center transition-all cursor-pointer ${
                      messageInput.trim()
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md hover:scale-105 active:scale-95 font-bold"
                        : "bg-white/10 text-slate-500 cursor-not-allowed"
                    }`}
                    title="Kirim Pesan"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </form>

              {/* Math Formula Popover Panel */}
              {showFormulaPicker && (
                <div
                  className={`p-3 rounded-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-2 ${
                    isDark
                      ? "bg-[#14182e]/95 border-white/15 text-slate-200"
                      : "bg-white/95 border-slate-300 text-slate-900 shadow-xl"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-white/10">
                    <span>Sisipkan Simbol Matematika</span>
                    <button
                      type="button"
                      onClick={() => setShowFormulaPicker(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {[
                      "∑", "√x", "π", "θ", "α", "β", "λ", "∞", "≠", "≤", "≥", "±", "∫", "Δ", "A⁻¹", "det(A)", "lim", "f'(x)"
                    ].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setMessageInput((prev) => `${prev} ${sym} `)}
                        className={`h-7 px-2.5 rounded-lg border grid place-items-center font-bold transition-all ${
                          isDark
                            ? "bg-white/5 border-white/10 hover:bg-cyan-400 hover:text-slate-950"
                            : "bg-slate-100 border-slate-200 hover:bg-cyan-500 hover:text-white"
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ================================================================== */}
        {/* 3. MODAL: AJUKAN PERTANYAAN / TOPIK DISKUSI BARU                   */}
        {/* ================================================================== */}
        {isCreatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div
              className={`relative w-full max-w-xl rounded-3xl border p-6 sm:p-7 shadow-2xl backdrop-blur-2xl ${
                isDark
                  ? "border-white/20 bg-[#131627]/95 text-slate-100"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-4 mb-5 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3
                      className={`font-display text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Ajukan Topik / Pertanyaan Baru
                    </h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Pertanyaanmu akan dimoderasi dan dijawab langsung oleh guru pengampu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Kategori Materi
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: "Aljabar", label: "Aljabar & Matriks" },
                      { key: "Fungsi", label: "Fungsi & Kalkulus" },
                      { key: "Geometri", label: "Geometri 3D" },
                      { key: "Trigonometri", label: "Trigonometri" },
                      { key: "Statistika", label: "Peluang & Data" },
                      { key: "Konsultasi", label: "Tanya Guru" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setNewCategory(cat.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          newCategory === cat.key
                            ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md font-black"
                            : isDark
                            ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Judul Pertanyaan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Trik Cepat Menghitung Invers Matriks 3x3 untuk Soal TKA"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={`w-full rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none transition-all shadow-inner ${
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400"
                        : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Uraian Pertanyaan &amp; Bagian yang Belum Dipahami
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLatexTarget("topic");
                        setShowLatexModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      <Calculator size={13} />
                      <span>+ Input Rumus LaTeX</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan nomor soal, rumus terkait ($...$), atau kendala langkah perhitungan yang kamu temui..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className={`w-full rounded-2xl p-4 text-xs sm:text-sm outline-none transition-all shadow-inner resize-none ${
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-400"
                        : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
                    }`}
                  />
                  {newContent && (newContent.includes("$") || newContent.includes("\\")) && (
                    <div className="mt-2 p-2.5 rounded-xl border border-cyan-400/30 bg-black/20 text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                        Pratinjau Rumus:
                      </span>
                      <FormattedMathText text={newContent} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingModal(false)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                    <span>Terbitkan ke Saluran</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 4. MODAL BANTUAN INPUT LATEX (KaTeX Visual Composer)               */}
        {/* ================================================================== */}
        <LatexInputModal
          isOpen={showLatexModal}
          onClose={() => setShowLatexModal(false)}
          onInsert={(formattedLatex) => {
            if (latexTarget === "message") {
              setMessageInput((prev) => (prev ? `${prev} ${formattedLatex} ` : `${formattedLatex} `));
            } else {
              setNewContent((prev) => (prev ? `${prev} ${formattedLatex} ` : `${formattedLatex} `));
            }
          }}
          isDark={isDark}
          title={
            latexTarget === "message"
              ? "Input Rumus LaTeX ke Obrolan"
              : "Input Rumus LaTeX ke Topik Pertanyaan"
          }
        />
      </div>
    </StudentSpatialLayout>
  );
}
