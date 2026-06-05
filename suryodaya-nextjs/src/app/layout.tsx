import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { LoginModal } from '@/components/auth/LoginModal';
import CustomModal from '@/components/CustomModal';

export const metadata: Metadata = {
  title: 'Suryodaya Farms | Luxury Restorative Organic Farm Produce',
  description: 'Experience premium organic foods, fresh farm veggies, restorative grains, and natural oils delivered directly from our soil-first farms to your doorstep.',
  icons: {
    icon: 'https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-[#F6F3ED] text-[#1E1E1E]">
        <AuthProvider>
          {/* Main App content wrapper */}
          <div className="min-h-screen flex flex-col justify-between">
            {children}
          </div>
          
          {/* Global Premium Mobile OTP Authentication Modal */}
          <LoginModal />

          {/* Global Promise-based Custom Modal Alert/Confirm */}
          <CustomModal />
        </AuthProvider>
      </body>
    </html>
  );
}
