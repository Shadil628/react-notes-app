
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/notes";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchNotes() {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch {
      setError("Could not load notes. Check JSON Server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function createNote(note) {
    setError(null);

    try {
      const response = await axios.post(API_URL, {
        ...note,
        tags: note.tags ?? [],
        archived: note.archived ?? false,
        stock: note.stock ?? 0,
      });

      setNotes((previous) => [...previous, response.data]);
      return response.data;
    } catch (err) {
      setError("Could not create note.");
      throw err;
    }
  }

  async function updateNote(id, updates) {
    setError(null);

    try {
      const response = await axios.patch(
        `${API_URL}/${id}`,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );

      setNotes((previous) =>
        previous.map((note) =>
          String(note.id) === String(id)
            ? response.data
            : note
        )
      );

      return response.data;
    } catch (err) {
      setError("Could not update note.");
      throw err;
    }
  }

  async function deleteNote(id) {
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`);

      setNotes((previous) =>
        previous.filter(
          (note) => String(note.id) !== String(id)
        )
      );
    } catch (err) {
      setError("Could not delete note.");
      throw err;
    }
  }

  async function toggleArchive(id) {
    const note = notes.find(
      (item) => String(item.id) === String(id)
    );

    if (!note) return;

    return updateNote(id, {
      archived: !note.archived,
    });
  }

  function searchNotes(query) {
    const search = query.trim().toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search)
    );
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        toggleArchive,
        searchNotes,
        fetchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error(
      "useNotes must be used inside NotesProvider"
    );
  }

  return context;
}
