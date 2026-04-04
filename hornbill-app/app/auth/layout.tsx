interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-1/2 items-center justify-center">{children}</div>
      <div className="flex w-1/2 bg-gray-900"></div>
    </div>
  );
}
