import React, { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split content into code blocks and normal text
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3.5 text-sm sm:text-base leading-relaxed text-white/90 font-sans">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const firstLineEnd = part.indexOf('\n')
          const language = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() || 'code' : 'code'
          const codeContent = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3)

          return (
            <div
              key={index}
              className="my-4 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl backdrop-blur-md"
            >
              {/* Code block header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.08] text-xs text-white/60">
                <div className="flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Terminal size={14} className="text-violet-400" />
                  <span>{language}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={13} className="text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code content */}
              <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-violet-100/90 leading-relaxed bg-gradient-to-br from-black/80 to-violet-950/20">
                <pre>
                  <code>{codeContent}</code>
                </pre>
              </div>
            </div>
          )
        }

        // Render standard markdown formatting (headings, bold, lists, inline code)
        const lines = part.split('\n')
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={lIdx} className="h-2" />

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-lg font-semibold text-white mt-4 mb-2 flex items-center gap-2 font-serif tracking-wide">
                    {trimmed.replace('### ', '')}
                  </h3>
                )
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-base font-semibold text-violet-300 mt-3 mb-1">
                    {trimmed.replace('#### ', '')}
                  </h4>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-xl font-bold text-white mt-5 mb-2.5 border-b border-white/10 pb-1">
                    {trimmed.replace('## ', '')}
                  </h2>
                )
              }

              // Bullet lists
              if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const listContent = trimmed.slice(2)
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                    <span
                      className="text-white/80"
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listContent) }}
                    />
                  </div>
                )
              }

              // Numbered lists
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.)\s(.*)/)
                if (match) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 pl-2 py-0.5">
                      <span className="font-mono font-bold text-violet-400 text-xs mt-1 flex-shrink-0">
                        {match[1]}
                      </span>
                      <span
                        className="text-white/80"
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match[2]) }}
                      />
                    </div>
                  )
                }
              }

              // Regular paragraph
              return (
                <p
                  key={lIdx}
                  className="text-white/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Simple regex formatting for bold, italic, and inline code
function formatInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 font-mono text-xs text-violet-300">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-white/90">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors">$1</a>')
}
