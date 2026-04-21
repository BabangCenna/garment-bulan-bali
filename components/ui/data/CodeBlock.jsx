'use client'
import { useState } from 'react'

const CodeBlock = ({
  code,
  language = '',
  filename,
  showLineNumbers = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split('\n')

  return (
    <div className={['code-block', className].filter(Boolean).join(' ')}>
      <div className="code-block-header">
        <div className="code-block-header-left">
          {filename && <span className="code-block-filename">{filename}</span>}
          {language && <span className="code-block-lang">{language}</span>}
        </div>
        <button type="button" className="code-block-copy" onClick={copy}>
          <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <div className="code-block-body">
        <pre className="code-block-pre">
          {showLineNumbers && (
            <div className="code-block-lines">
              {lines.map((_, i) => <span key={i}>{i + 1}</span>)}
            </div>
          )}
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock