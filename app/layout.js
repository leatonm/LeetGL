export const metadata = {
  title: 'Lauren Shuda Check This? · JSON & URL checker',
  description: 'Check a JSON URL for syntax errors and duplicates. Made for Lauren Shuda.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background: 'linear-gradient(165deg, #0c0c0f 0%, #111113 45%, #0a0a0d 100%)',
          color: '#e4e4e7',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
