import { useEffect, useState } from "react";

export default function RouteTransition({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // trigger fade-in on mount
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className={show ? "sr-fade sr-fade--in" : "sr-fade"}>{children}</div>
  );
}
