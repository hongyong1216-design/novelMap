import './EditorContent.css'

export default function EditorContent({ novelTitle, chapterTitle, content, onChange, fontSize, fontFamily }) {
  return (
    <div className="editor-content-wrapper">
      <div className="editor-content">
        <div className="document-header">
          <h1 className="document-title">{novelTitle}</h1>
          <h2 className="document-chapter">{chapterTitle}</h2>
        </div>
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="在此开始写作..."
          style={{ fontSize, fontFamily }}
        />
      </div>
    </div>
  )
}
