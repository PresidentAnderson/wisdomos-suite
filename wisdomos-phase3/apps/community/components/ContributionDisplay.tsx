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

// Local constants instead of workspace import
const CONTRIBUTION_PROMPTS = [
  {
    id: 'acknowledgment',
    question: 'What do others acknowledge you for?',
    helpText: 'Think about compliments, recognition, or feedback you often receive',
  },
  {
    id: 'natural',
    question: 'What do you naturally contribute?',
    helpText: 'Consider what you do effortlessly that benefits others',
  },
  {
    id: 'energy',
    question: 'What activities give you energy?',
    helpText: 'Identify what you could do all day without feeling drained',
  },
  {
    id: 'unique',
    question: 'What unique perspective do you bring?',
    helpText: 'Think about your distinctive viewpoint or approach',
  },
];

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
        <h1 className="text-3xl font-bold mb-2">Contribution Display Demo</h1>
        <p className="text-black">Visualize and sustain your natural contribution</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Interactive Contribution Canvas</h2>
          <p className="text-black mb-6">
            This demonstrates the WisdomOS Contribution Display feature. Try the guided prompts 
            or add text and images to create your unique contribution visualization.
          </p>
        </div>
      </div>

      {/* Guided Prompts */}
      {currentPromptIndex < CONTRIBUTION_PROMPTS.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-purple-50 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-2">{currentPrompt.question}</h3>
          <p className="text-sm text-black mb-4">
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
              className="px-4 py-2 text-black hover:text-black"
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600"
        >
          <Type size={18} />
          Add Text
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300">
          <Image size={18} />
          Add Image
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg ${
              isEditMode ? 'bg-green-500 text-black' : 'bg-gray-200'
            }`}
          >
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        {...getRootProps()}
        className={`relative w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        {items.length === 0 && !isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center text-black">
            <div className="text-center">
              <Palette size={48} className="mx-auto mb-4 opacity-50" />
              <p>Drop images here or use the buttons above to create your contribution display</p>
            </div>
          </div>
        )}

        {isDragActive && (
          <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
            <p className="text-2xl font-semibold text-black">Drop images here</p>
          </div>
        )}

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute bg-white rounded-lg shadow-md p-3 cursor-move hover:shadow-lg transition-shadow ${
                selectedItem === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: item.position.x,
                top: item.position.y,
                width: item.size?.width || 'auto',
                height: item.size?.height || 'auto',
                maxWidth: '200px',
              }}
              onClick={() => setSelectedItem(item.id)}
            >
              {item.type === 'text' && (
                <div
                  contentEditable={isEditMode && selectedItem === item.id}
                  suppressContentEditableWarning
                  className="outline-none min-w-20"
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems(prev => prev.filter(i => i.id !== item.id));
                    setSelectedItem(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-black rounded-full hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Demo Features */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Full WisdomOS Features Include:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded">
            <strong>Peer Feedback</strong><br />
            Get comments and insights from your circles
          </div>
          <div className="bg-white p-3 rounded">
            <strong>Circle Sharing</strong><br />
            Share with specific wisdom circles
          </div>
          <div className="bg-white p-3 rounded">
            <strong>Media Upload</strong><br />
            Add images, videos, and documents
          </div>
          <div className="bg-white p-3 rounded">
            <strong>Revision Reminders</strong><br />
            Regular prompts to update your display
          </div>
        </div>
      </div>
    </div>
  );
}