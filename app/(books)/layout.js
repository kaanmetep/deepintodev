export default function BooksLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950">
      {children}
    </div>
  );
}
