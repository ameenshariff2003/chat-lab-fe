import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useChat } from '../hooks/useChat'

/* ------------------------------------------------------------------ */
/*  Static constants (defined once, never re-created on render)        */
/* ------------------------------------------------------------------ */
import { useAuth } from '../../auth/hook/useAuth' // adjust path to where your hook lives

const LogoutIcon = () => (
  <Icon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
)
const ACCENT = '#c8ff4a'

const BG_GRID = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}
const BG_GLOW = {
  backgroundImage:
    'radial-gradient(640px circle at 0% 0%, rgba(116,150,28,0.26), transparent 60%), radial-gradient(640px circle at 100% 100%, rgba(84,52,168,0.24), transparent 60%)',
}

const SUGGESTIONS = [
  'Explain closures in JavaScript with a short example',
  'Build me a 7-day study plan for system design',
  'Compare REST and GraphQL for a small team',
  'Quiz me on React hooks, one question at a time',
]

/* ------------------------------------------------------------------ */
/*  Tiny inline icons (no icon-library dependency)                     */
/* ------------------------------------------------------------------ */

const Icon = ({ children, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

const MenuIcon = () => (
  <Icon className="h-5 w-5">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
)
const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)
const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)
const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </Icon>
)
const SendIcon = () => (
  <Icon className="h-[18px] w-[18px]">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
)
const CopyIcon = () => (
  <Icon className="h-3.5 w-3.5">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)
const CheckIcon = () => (
  <Icon className="h-3.5 w-3.5">
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

/* ------------------------------------------------------------------ */
/*  Lightweight message rendering (code fences, `inline`, **bold**)    */
/* ------------------------------------------------------------------ */

const FENCE = /```(\w*)\n?([\s\S]*?)```/g
const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g

function parseBlocks(text) {
  const out = []
  let last = 0
  let m
  FENCE.lastIndex = 0
  while ((m = FENCE.exec(text))) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) })
    out.push({ type: 'code', lang: m[1], value: m[2].replace(/\n$/, '') })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
}

const Inline = ({ text }) =>
  text.split(INLINE).map((part, i) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#dfff8f]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })

const CodeBlock = memo(function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[11px] text-zinc-500">{lang || 'code'}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 transition-colors hover:text-[#c8ff4a] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c8ff4a]"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  )
})

const AiAvatar = () => (
  <div
    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold"
    style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}1a`, color: ACCENT }}
  >
    AI
  </div>
)

const Message = memo(function Message({ role, content }) {
  const isUser = role === 'user'
  const blocks = useMemo(() => (isUser ? null : parseBlocks(content ?? '')), [content, isUser])

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[15px] leading-relaxed text-zinc-100 sm:max-w-[75%]">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <AiAvatar />
      <div className="min-w-0 flex-1 text-[15px] leading-7 text-zinc-300">
        {blocks.map((b, i) =>
          b.type === 'code' ? (
            <CodeBlock key={i} lang={b.lang} code={b.value} />
          ) : (
            <p key={i} className="whitespace-pre-wrap break-words">
              <Inline text={b.value} />
            </p>
          ),
        )}
      </div>
    </div>
  )
})

const TypingIndicator = () => (
  <div className="flex gap-3" role="status" aria-label="AI is thinking">
    <AiAvatar />
    <div className="flex items-center gap-1.5 pt-3">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c8ff4a]/70"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  </div>
)

const MessagesSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-hidden="true">
    <div className="ml-auto h-10 w-2/5 rounded-2xl bg-white/5" />
    <div className="space-y-2">
      <div className="h-3 w-full rounded bg-white/5" />
      <div className="h-3 w-11/12 rounded bg-white/5" />
      <div className="h-3 w-3/5 rounded bg-white/5" />
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Composer — owns its own text state so typing never re-renders the  */
/*  message list                                                        */
/* ------------------------------------------------------------------ */

const Corner = ({ pos }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute h-3 w-3 border-[#c8ff4a]/60 ${pos}`}
  />
)

const Composer = memo(function Composer({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const submit = async () => {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    const ok = await onSend(text)
    if (ok === false) setValue((v) => v || text) // restore text if the request failed
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#101318] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <Corner pos="-left-px -top-px rounded-tl-xl border-l-2 border-t-2" />
      <Corner pos="-right-px -top-px rounded-tr-xl border-r-2 border-t-2" />
      <Corner pos="-bottom-px -left-px rounded-bl-xl border-b-2 border-l-2" />
      <Corner pos="-bottom-px -right-px rounded-br-xl border-b-2 border-r-2" />

      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything…"
          aria-label="Message"
          className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-zinc-100 placeholder-zinc-600 outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8ff4a] text-black transition-[opacity,transform] hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8ff4a]"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
})

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const Sidebar = memo(function Sidebar({
  chatList,
  currentChatId,
  username,
  open,
  onLogout,
  onClose,
  onNew,
  onOpen,
  onDelete,
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[85%] max-w-[300px] flex-col border-r border-white/5 bg-[#0d0f12] transition-transform duration-200 lg:static lg:w-72 lg:max-w-none lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300">
            Chat Lab <span className="text-[#c8ff4a]">_</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-md p-1.5 text-zinc-400 hover:text-white lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c8ff4a]/40 bg-[#c8ff4a]/10 py-2.5 font-mono text-[12px] font-bold uppercase tracking-wider text-[#c8ff4a] transition-colors hover:bg-[#c8ff4a]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8ff4a]"
          >
            <PlusIcon /> New chat
          </button>
        </div>

        <p className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          History
        </p>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 pb-2">
          {chatList.length === 0 ? (
            <p className="px-2 py-3 text-sm text-zinc-600">
              No chats yet. Send a message to start one.
            </p>
          ) : (
            chatList.map((c) => {
              const active = c._id === currentChatId
              return (
                <div
                  key={c._id}
                  className={`group flex items-center rounded-lg border-l-2 transition-colors ${
                    active
                      ? 'border-[#c8ff4a] bg-white/[0.06]'
                      : 'border-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(c._id)}
                    className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-zinc-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c8ff4a]"
                    title={c.title}
                  >
                    {c.title || 'Untitled chat'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c._id)}
                    aria-label={`Delete chat ${c.title || ''}`}
                    className="mr-1 shrink-0 rounded-md p-1.5 text-zinc-500 transition-opacity hover:text-red-400 focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </div>
              )
            })
          )}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/5 p-3">
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase text-zinc-200">
    {username.charAt(0) || 'U'}
  </div>
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm text-zinc-200">{username}</p>
    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
      Session active
    </p>
  </div>
  <button
    type="button"
    onClick={onLogout}
    aria-label="Log out"
    title="Log out"

    className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-red-400 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c8ff4a]"
  >
    <LogoutIcon />
  </button>
</div>
      </aside>
    </>
  )
})

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

const Dashboard = () => {
  const {
    chats,
    currentChatId,
    isLoading,
    error,
    initSocketConnection,
    handelSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
    handleNewChat,
    clearError,
  } = useChat()
  const { user } = useSelector((state) => state.auth)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pending, setPending] = useState(null) // user message shown while waiting for the AI
  const [opening, setOpening] = useState(null) // id of the chat whose messages are loading
  const endRef = useRef(null)
  const prevChatId = useRef(currentChatId)

  useEffect(() => {
    initSocketConnection()
    handleGetChats()
  }, [initSocketConnection, handleGetChats])

  const username = user?.username ?? user?.user?.username ?? user?.name ?? 'user'

  const chatList = useMemo(
    () =>
      Object.values(chats ?? {}).sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0),
      ),
    [chats],
  )

  const current = currentChatId ? chats?.[currentChatId] : null
  const messages = current?.messages ?? []

  // Auto-scroll: instant when switching chats, smooth for new messages
  useEffect(() => {
    const switched = prevChatId.current !== currentChatId
    prevChatId.current = currentChatId
    endRef.current?.scrollIntoView({ behavior: switched ? 'auto' : 'smooth', block: 'end' })
  }, [currentChatId, messages.length, pending, isLoading])

  // Sends within the open chat (chatId in the URL); with no open chat the backend creates one
  const handleSend = useCallback(
    async (text) => {
      setPending(text)
      const ok = await handelSendMessage({ message: text, chatId: currentChatId })
      setPending(null)
      return ok
    },
    [handelSendMessage, currentChatId],
  )

  const openChat = useCallback(
    async (id) => {
      setSidebarOpen(false)
      if (id === currentChatId) return
      setOpening(id)
      await handleOpenChat(id)
      setOpening((o) => (o === id ? null : o))
    },
    [currentChatId, handleOpenChat],
  )

  const newChat = useCallback(() => {
    setSidebarOpen(false)
    setOpening(null)
    handleNewChat()
  }, [handleNewChat])

  const deleteChat = useCallback(
    (id) => {
      if (window.confirm('Delete this chat? This cannot be undone.')) handleDeleteChat(id)
    },
    [handleDeleteChat],
  )

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const showSkeleton = opening !== null && opening === currentChatId && messages.length === 0
  const isEmpty = messages.length === 0 && pending === null && !showSkeleton
  const busy = isLoading || opening !== null
  const { handelLogout } = useAuth()


  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#0a0b0d] text-zinc-200"
      style={{ height: '100dvh' }}
    >
      <Sidebar
        chatList={chatList}
        currentChatId={currentChatId}
        username={username}
        open={sidebarOpen}
        onLogout={handelLogout}

        onClose={closeSidebar}
        onNew={newChat}
        onOpen={openChat}
        onDelete={deleteChat}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* background */}
        <div className="pointer-events-none absolute inset-0" style={BG_GLOW} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0" style={BG_GRID} aria-hidden="true" />

        {/* header */}
        <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-white/5 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="rounded-md p-1.5 text-zinc-400 hover:text-white lg:hidden"
          >
            <MenuIcon />
          </button>
          <p className="min-w-0 truncate text-sm text-zinc-400">
            {current?.title || 'New chat'}
          </p>
        </header>

        {/* messages */}
        <div
          className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
          role="log"
          aria-live="polite"
        >
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
            {isEmpty ? (
              <div className="my-auto py-10">
                <span className="inline-block rounded-full border border-[#c8ff4a]/30 bg-[#c8ff4a]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#c8ff4a]">
                  New chat
                </span>
                <h1 className="mt-5 font-mono text-3xl font-semibold leading-tight text-zinc-100 sm:text-4xl">
                  What do you want
                  <br />
                  to work on?
                </h1>
                <p className="mt-3 max-w-md text-sm text-zinc-500">
                  Ask a question, paste code, or pick a starter below. Your chats are saved to the
                  list on the left.
                </p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busy}
                      onClick={() => handleSend(s)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:border-[#c8ff4a]/40 hover:bg-white/[0.06] disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#c8ff4a]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {showSkeleton && <MessagesSkeleton />}
                {messages.map((m, i) => (
                  <Message key={m._id ?? i} role={m.role} content={m.content} />
                ))}
                {pending !== null && <Message role="user" content={pending} />}
                {isLoading && <TypingIndicator />}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* composer */}
        <div className="relative z-10 shrink-0 px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
          <div className="mx-auto w-full max-w-3xl">
            {error && (
              <div
                role="alert"
                className="mb-2 flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                <span className="min-w-0 break-words">{String(error)}</span>
                <button
                  type="button"
                  onClick={clearError}
                  aria-label="Dismiss error"
                  className="shrink-0 text-red-300/70 hover:text-red-200"
                >
                  <CloseIcon />
                </button>
              </div>
            )}
            <Composer onSend={handleSend} disabled={busy} />
            <p className="mt-2 hidden text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600 sm:block">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard