
import { useState } from 'react'
import { useNotes } from './context/NotesContext'

function App() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#ffffff')
  const {
  notes,
  loading,
  error,
  createNote,
  updateNote,
  deleteNote: removeNote,
} = useNotes()
  const [editingId, setEditingId] = useState(null)

  // Create or update a note
  async function addNote(event) {
  event.preventDefault()

  const cleanTitle = title.trim()
  const cleanContent = content.trim()

  if (!cleanContent) {
    alert('Please enter note content.')
    return
  }

  if (cleanTitle.length > 100) {
    alert('Title cannot exceed 100 characters.')
    return
  }

  const duplicate = notes.some(
    note =>
      String(note.id) !== String(editingId) &&
      note.title.toLowerCase() === cleanTitle.toLowerCase() &&
      note.content.toLowerCase() === cleanContent.toLowerCase()
  )

  if (duplicate) {
    alert('This note already exists.')
    return
  }

  const now = new Date().toISOString()

  try {
    if (editingId !== null) {
      await updateNote(editingId, {
        title: cleanTitle,
        content: cleanContent,
        color,
        updatedAt: now,
      })
    } else {
      await createNote({
        title: cleanTitle,
        content: cleanContent,
        color,
        tags: [],
        archived: false,
        stock: 0,
        createdAt: now,
        updatedAt: now,
      })
    }

    resetForm()
  } catch {
    alert('Could not save note. Check whether JSON Server is running.')
  }
}

  // Clear the form
  function resetForm() {
    setTitle('')
    setContent('')
    setColor('#ffffff')
    setEditingId(null)
  }

  // Load a note into the form for editing
  function editNote(note) {
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color)
    setEditingId(note.id)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Delete a note after confirmation
  async function deleteNote(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this note?'
  )

  if (!confirmed) return

  try {
    await removeNote(id)

    if (String(editingId) === String(id)) {
      resetForm()
    }
  } catch {
    alert('Could not delete note. Please try again.')
  }
}

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-8 sm:px-8">
      {/* Header */}
      <header className="mx-auto mb-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-amber-600 sm:text-4xl">
          ✦ My Notes
        </h1>

        <p className="mt-2 text-gray-600">
          Capture your thoughts and keep your ideas organized.
        </p>
      </header>

      {/* Note form */}
      <form
        onSubmit={addNote}
        className="mx-auto mb-10 max-w-xl rounded-2xl
          border border-gray-100 bg-white p-5 shadow-lg sm:p-6"
      >
        <h2 className="mb-5 text-xl font-semibold text-gray-800">
          {editingId !== null ? 'Edit your note' : 'Create a note'}
        </h2>

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          maxLength={100}
          onChange={event => setTitle(event.target.value)}
          className="mb-1 w-full rounded-lg border border-gray-200
            px-4 py-3 outline-none focus:border-amber-500
            focus:ring-2 focus:ring-amber-100"
        />

        <p className="mb-4 text-right text-xs text-gray-500">
          {title.length}/100 characters
        </p>

        <textarea
          placeholder="Write your note here..."
          value={content}
          maxLength={5000}
          onChange={event => setContent(event.target.value)}
          className="mb-1 min-h-36 w-full resize-y rounded-lg
            border border-gray-200 px-4 py-3 outline-none
            focus:border-amber-500 focus:ring-2
            focus:ring-amber-100"
          required
        />

        <p className="mb-5 text-right text-xs text-gray-500">
          {content.length}/5000 characters
        </p>

        <div className="mb-5 flex items-center gap-3">
          <label htmlFor="note-color" className="text-sm font-medium">
            Note color
          </label>

          <input
            id="note-color"
            type="color"
            value={color}
            onChange={event => setColor(event.target.value)}
            className="h-10 w-12 cursor-pointer rounded"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-5 py-3
              font-semibold text-white transition
              hover:bg-amber-600"
          >
            {editingId !== null ? 'Update Note' : '+ Add Note'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-gray-100 px-5 py-3
                font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Notes heading */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Notes
          </h2>

          <span className="rounded-full bg-amber-100 px-3 py-1
            text-sm font-medium text-amber-800">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* Empty state */}
        {notes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed
            border-amber-200 bg-white/70 px-5 py-16 text-center">
            <div className="mb-3 text-5xl">📝</div>

            <h3 className="text-lg font-semibold text-gray-700">
              No notes yet
            </h3>

            <p className="mt-2 text-gray-500">
              Create your first note using the form above.
            </p>
          </div>
        ) : (
          /* Notes grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2
            lg:grid-cols-3 xl:grid-cols-4">
            {notes.map(note => (
              <article
                key={note.id}
                style={{ backgroundColor: note.color }}
                className="rounded-xl border border-black/10 p-5
                  shadow-sm transition duration-200
                  hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="mb-3 break-words text-lg font-bold
                  text-gray-800">
                  {note.title || 'Untitled Note'}
                </h3>

                <p className="whitespace-pre-wrap break-words
                  text-sm leading-6 text-gray-700">
                  {note.content}
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </p>

                <div className="mt-5 flex gap-2 border-t
                  border-black/10 pt-4">
                  <button
                    type="button"
                    onClick={() => editNote(note)}
                    className="flex-1 rounded-lg bg-white/80 px-3
                      py-2 text-sm font-medium text-blue-700
                      hover:bg-white"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="flex-1 rounded-lg bg-red-100 px-3
                      py-2 text-sm font-medium text-red-700
                      hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App;
