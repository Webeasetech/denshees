import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/ui/sonner";
import AmplitudeProvider from "@/components/analytics/amplitude-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Denshees | Email automation",
  description: "Email that work while you play",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased font-sans`}>
        <AmplitudeProvider />
        {children}
        <Toast />
      </body>
    </html>
  );
}
