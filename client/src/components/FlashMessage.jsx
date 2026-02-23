import { useFlashContext } from "../context/FlashContext";
import "../styles/flash.css";

export default function FlashMessage() {
  const { messages, removeMessage } = useFlashContext();

  if (!messages.length) return null;

  return (
    <div className="flash-wrapper" aria-live="polite" aria-atomic="true">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flash ${m.type}`}
          role="status"
          onClick={() => removeMessage(m.id)}
          title="Click to dismiss"
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
