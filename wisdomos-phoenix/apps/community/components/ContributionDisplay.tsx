'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Plus, 
  Type, 
  Image, 
  Palette, 
  Share2, 
  MessageCircle,
  Save,
  Trash2,
  Move
} from 'lucide-react';
import { CONTRIBUTION_PROMPTS } from '@wisdomos/contrib';

interface ContributionItem {
  id: string;
  type: 'text' | 'image' | 'icon' | 'media';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

export function ContributionDisplay() {
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentPrompt = CONTRIBUTION_PROMPTS[currentPromptIndex];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newItem: ContributionItem = {
          id: crypto.randomUUID(),
          type: 'image',
          content: reader.result as string,
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          size: { width: 200, height: 200 },
        };
        setItems((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    noClick: true,
  });

  const addTextItem = () => {
    const newItem: ContributionItem = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Click to edit',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItemPosition = (id: string, position: { x: number; y: number }) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, position } : item))
    );
  };

  const updateItemContent = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItem(null);
  };

  const handlePromptAnswer = (answer: string) => {
    setPromptAnswers((prev) => ({
      ...prev,
      [currentPrompt.id]: answer,
    }));
    
    // Add answer as a text item to canvas
    const newItem: ContributionItem = {
      id: crypto.randomUUID(),
      type: 'text',
      content: answer,
      position: { 
        x: 50 + currentPromptIndex * 100, 
        y: 50 + currentPromptIndex * 50 
      },
    };
    setItems((prev) => [...prev, newItem]);

    if (currentPromptIndex < CONTRIBUTION_PROMPTS.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contribution Display</h1>
        <p className="text-gray-600">Visualize and sustain your natural contribution</p>
      </div>

      {/* Guided Prompts */}
      {currentPromptIndex < CONTRIBUTION_PROMPTS.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-2">{currentPrompt.question}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {currentPrompt.helpText}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="Type your answer..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handlePromptAnswer(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={() => setCurrentPromptIndex(CONTRIBUTION_PROMPTS.length)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip prompts
            </button>
          </div>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex gap-4 items-center">
        <button
          onClick={addTextItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Type size={18} />
          Add Text
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
        >
          <Image size={18} />
          Add Image
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
        >
          <Palette size={18} />
          Add Icon
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg ${
              isEditMode ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
          >
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Share2 size={18} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <Save size={18} />
            Save
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        {...getRootProps()}
        className={`contribution-canvas ${isDragActive ? 'border-primary' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <p className="text-2xl font-semibold text-primary">Drop images here</p>
          </div>
        )}

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              drag={isEditMode}
              dragMomentum={false}
              onDragEnd={(e, info) => {
                updateItemPosition(item.id, {
                  x: item.position.x + info.offset.x,
                  y: item.position.y + info.offset.y,
                });
              }}
              className={`contribution-item ${
                selectedItem === item.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{
                left: item.position.x,
                top: item.position.y,
                width: item.size?.width,
                height: item.size?.height,
              }}
              onClick={() => setSelectedItem(item.id)}
            >
              {item.type === 'text' && (
                <div
                  contentEditable={isEditMode && selectedItem === item.id}
                  suppressContentEditableWarning
                  onBlur={(e) => updateItemContent(item.id, e.currentTarget.textContent || '')}
                  className="outline-none"
                >
                  {item.content}
                </div>
              )}
              {item.type === 'image' && (
                <img
                  src={item.content}
                  alt="Contribution"
                  className="w-full h-full object-cover rounded"
                />
              )}
              {isEditMode && selectedItem === item.id && (
                <div className="absolute -top-8 right-0 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feedback Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Peer Feedback</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Add your feedback..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}