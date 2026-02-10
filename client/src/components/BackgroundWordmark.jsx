export default function BackgroundWordmark({ text }) {
  return (
    <div className="sr-wordmark" aria-hidden="true">
      {text}
    </div>
  );
}
