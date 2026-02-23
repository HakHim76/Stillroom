import { createContext, useContext, useState, useCallback } from "react";

const FlashContext = createContext();

export function FlashProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const removeMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const addMessage = useCallback((text, type = "info", duration = 3000) => {
    const id = Date.now();

    setMessages((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      removeMessage(id);
    }, duration);
  }, []);

  return (
    <FlashContext.Provider value={{ messages, addMessage, removeMessage }}>
      {children}
    </FlashContext.Provider>
  );
}

export function useFlashContext() {
  return useContext(FlashContext);
}
