export default function ReflectionModal({ sessionId, onDone }) {
  const [mood, setMood] = useState("");
  const [reflection, setReflection] = useState("");

  const submitReflection = async () => {
    await fetch("/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId, mood, reflection }),
    });

    onDone();
  };

  return (
    <>
      <select onChange={(e) => setMood(e.target.value)}>
        <option value="calm">Calm</option>
        <option value="neutral">Neutral</option>
        <option value="stressed">Stressed</option>
      </select>

      <textarea
        placeholder="One sentence reflection"
        maxLength={120}
        onChange={(e) => setReflection(e.target.value)}
      />

      <button onClick={submitReflection}>Finish Session</button>
    </>
  );
}
