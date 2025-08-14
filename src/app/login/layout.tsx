import FullScreenLayout from "@/components/layouts/full-screen-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FullScreenLayout>{children}</FullScreenLayout>
  )
}
