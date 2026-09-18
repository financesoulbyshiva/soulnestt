export default function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-surface-2 bg-surface shadow-card ${
        hover ? 'transition-shadow hover:shadow-lift' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
