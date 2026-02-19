export const metadata = {
  title: 'JSON URL Checker',
  description: 'Check a JSON URL for syntax errors and duplicate entries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f0f12', color: '#e4e4e7', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
