import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  X, 
  Save,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2
} from "lucide-react";

interface ProjectNote {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  tags: string[];
}

interface ProjectNotebook {
  isVisible: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  activeProject: string;
  projects: Record<string, ProjectNote[]>;
}

export function ProjectNotebook() {
  const [notebook, setNotebook] = useState<ProjectNotebook>({
    isVisible: false,
    isMinimized: false,
    position: { x: 20, y: 100 },
    activeProject: "projekt-1",
    projects: {
      "projekt-1": [
        {
          id: "note-1",
          title: "Projektplanung",
          content: "Erste Notizen zur Projektstruktur...",
          lastModified: "2025-08-20 10:30",
          tags: ["planung", "struktur"]
        }
      ],
      "projekt-2": [
        {
          id: "note-2", 
          title: "Research Notes",
          content: "Wichtige Erkenntnisse aus der Recherche...",
          lastModified: "2025-08-20 09:15",
          tags: ["research", "insights"]
        }
      ]
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Save notebook state to localStorage
  useEffect(() => {
    localStorage.setItem("projectNotebook", JSON.stringify(notebook));
  }, [notebook]);

  // Load notebook state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("projectNotebook");
    if (saved) {
      try {
        const parsedNotebook = JSON.parse(saved);
        setNotebook(prev => ({ ...prev, ...parsedNotebook }));
      } catch (error) {
        console.error("Error loading notebook:", error);
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - notebook.position.x,
      y: e.clientY - notebook.position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setNotebook(prev => ({
        ...prev,
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const addNewNote = () => {
    if (!newNoteTitle.trim()) return;

    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      lastModified: new Date().toLocaleString("de-DE"),
      tags: []
    };

    setNotebook(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [prev.activeProject]: [
          ...(prev.projects[prev.activeProject] || []),
          newNote
        ]
      }
    }));

    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const updateNote = (noteId: string, updates: Partial<ProjectNote>) => {
    setNotebook(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [prev.activeProject]: prev.projects[prev.activeProject].map(note =>
          note.id === noteId ? { ...note, ...updates, lastModified: new Date().toLocaleString("de-DE") } : note
        )
      }
    }));
  };

  const deleteNote = (noteId: string) => {
    setNotebook(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [prev.activeProject]: prev.projects[prev.activeProject].filter(note => note.id !== noteId)
      }
    }));
  };

  const projectTabs = Object.keys(notebook.projects);
  const currentNotes = notebook.projects[notebook.activeProject] || [];

  if (!notebook.isVisible) {
    return (
      <Button
        onClick={() => setNotebook(prev => ({ ...prev, isVisible: true }))}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        data-testid="button-open-notebook"
      >
        <BookOpen className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed z-50 w-96 shadow-xl border-2"
      style={{
        left: notebook.position.x,
        top: notebook.position.y,
        height: notebook.isMinimized ? "auto" : "500px"
      }}
      data-testid="project-notebook"
    >
      <CardHeader
        className="pb-2 cursor-move bg-blue-50 border-b"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Projekt Notizbuch
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNotebook(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
              className="p-1 h-6 w-6"
            >
              {notebook.isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNotebook(prev => ({ ...prev, isVisible: false }))}
              className="p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!notebook.isMinimized && (
        <CardContent className="p-4 h-full overflow-hidden flex flex-col">
          <Tabs
            value={notebook.activeProject}
            onValueChange={(value) => setNotebook(prev => ({ ...prev, activeProject: value }))}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              {projectTabs.map(projectId => (
                <TabsTrigger key={projectId} value={projectId} className="text-xs">
                  {projectId.replace("projekt-", "Projekt ")}
                </TabsTrigger>
              ))}
            </TabsList>

            {projectTabs.map(projectId => (
              <TabsContent key={projectId} value={projectId} className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {notebook.projects[projectId]?.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{note.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingNote(editingNote === note.id ? null : note.id)}
                            className="p-1 h-6 w-6"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote(note.id)}
                            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingNote === note.id ? (
                        <div className="space-y-2">
                          <Input
                            value={note.title}
                            onChange={(e) => updateNote(note.id, { title: e.target.value })}
                            className="text-xs"
                          />
                          <Textarea
                            value={note.content}
                            onChange={(e) => updateNote(note.id, { content: e.target.value })}
                            className="text-xs h-20 resize-none"
                          />
                          <Button
                            size="sm"
                            onClick={() => setEditingNote(null)}
                            className="text-xs h-6"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Speichern
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">{note.content}</p>
                          <div className="text-xs text-gray-400">
                            Geändert: {note.lastModified}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Note */}
                <div className="border-t pt-3 space-y-2">
                  <Input
                    placeholder="Notiz Titel..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="text-xs"
                    data-testid="input-note-title"
                  />
                  <Textarea
                    placeholder="Notiz Inhalt..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="text-xs h-16 resize-none"
                    data-testid="textarea-note-content"
                  />
                  <Button
                    onClick={addNewNote}
                    size="sm"
                    className="w-full text-xs h-7"
                    data-testid="button-add-note"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Notiz hinzufügen
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}