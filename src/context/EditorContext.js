import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const EditorContext = createContext();

// Canvas size presets for different aspect ratios
export const CANVAS_PRESETS = [
    { id: 'portrait', name: 'Portrait', width: 1080, height: 1920, ratio: '9:16', icon: 'phone-portrait-outline' },
    { id: 'landscape', name: 'Landscape', width: 1920, height: 1080, ratio: '16:9', icon: 'phone-landscape-outline' },
    { id: 'square', name: 'Square', width: 1080, height: 1080, ratio: '1:1', icon: 'square-outline' },
    { id: 'tablet', name: 'Tablet', width: 1536, height: 2048, ratio: '3:4', icon: 'tablet-portrait-outline' },
    { id: 'desktop', name: 'Desktop', width: 2560, height: 1440, ratio: '16:9', icon: 'desktop-outline' },
    { id: '4k', name: '4K UHD', width: 2160, height: 3840, ratio: '9:16', icon: 'tv-outline' },
];

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within EditorProvider');
    }
    return context;
};

// type: 'linear', 'radial', or 'solid'
const DEFAULT_GRADIENT = {
    type: 'linear',
    colors: ['#667EEA', '#764BA2'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0.5, y: 1 },
};

export const EditorProvider = ({ children }) => {
    const [gradient, setGradient] = useState(DEFAULT_GRADIENT);
    const [history, setHistory] = useState([{ gradient: DEFAULT_GRADIENT }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1920 });
    const [currentProject, setCurrentProject] = useState(null);

    // Persist history manually to avoid dependency loops in useCallback
    const historyRef = useRef({ history: [{ gradient: DEFAULT_GRADIENT }], index: 0 });

    const saveToHistory = useCallback((newGradient) => {
        const newHistory = historyRef.current.history.slice(0, historyRef.current.index + 1);
        const updatedHistory = [...newHistory, { gradient: newGradient }];

        historyRef.current = {
            history: updatedHistory,
            index: updatedHistory.length - 1
        };

        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
    }, []);

    const updateGradient = useCallback((updates) => {
        setGradient(prev => {
            const newGradient = { ...prev, ...updates };
            saveToHistory(newGradient);
            return newGradient;
        });
    }, [saveToHistory]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const prevState = history[newIndex];
            setGradient(prevState.gradient);
            setHistoryIndex(newIndex);
            historyRef.current.index = newIndex;
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];
            setGradient(nextState.gradient);
            setHistoryIndex(newIndex);
            historyRef.current.index = newIndex;
        }
    }, [history, historyIndex]);

    const newProject = useCallback((preset = { width: 1080, height: 1920 }) => {
        setGradient(DEFAULT_GRADIENT);
        setCanvasSize(preset);
        const initialHistory = [{ gradient: DEFAULT_GRADIENT }];
        setHistory(initialHistory);
        setHistoryIndex(0);
        historyRef.current = { history: initialHistory, index: 0 };

        setCurrentProject({
            id: Date.now().toString(),
            name: 'New Gradient Project',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        });
    }, []);

    const loadProject = useCallback((project) => {
        const loadedGradient = project.gradient || DEFAULT_GRADIENT;
        setGradient(loadedGradient);
        setCanvasSize(project.canvasSize || { width: 1080, height: 1920 });
        setCurrentProject(project);

        const initialHistory = [{ gradient: loadedGradient }];
        setHistory(initialHistory);
        setHistoryIndex(0);
        historyRef.current = { history: initialHistory, index: 0 };
    }, []);

    const value = {
        gradient,
        canvasSize,
        currentProject,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        setCanvasSize,
        updateGradient,
        undo,
        redo,
        newProject,
        loadProject,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};
