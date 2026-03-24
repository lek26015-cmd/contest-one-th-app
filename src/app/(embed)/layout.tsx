export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-transparent">{children}</div>;
}
