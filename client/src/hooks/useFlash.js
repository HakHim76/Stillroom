import { useFlashContext } from "../context/FlashContext";

export default function useFlash() {
  const { addMessage } = useFlashContext();

  return {
    success: (msg) => addMessage(msg, "success"),
    error: (msg) => addMessage(msg, "error"),
    info: (msg) => addMessage(msg, "info"),
    warn: (msg) => addMessage(msg, "warn"),
  };
}
