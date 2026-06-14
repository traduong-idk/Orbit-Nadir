import "./globals.css";

export const metadata = {
  title: "Orbit Nadir",
  description: "Internal sourcing and procurement tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
