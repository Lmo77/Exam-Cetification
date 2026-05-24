import "./globals.css";

export const metadata = {
  title: "AI ESL Writing Assessment",
  description: "Teacher-controlled writing activity builder with AI-assisted grading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}