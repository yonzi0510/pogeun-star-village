import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '포근별 마을',
  description: '칭찬 토큰으로 귀여운 주민들과 마을을 키우는 가족용 힐링 게임',
  openGraph: { title: '포근별 마을', description: '칭찬이 별빛이 되어 자라나는 우리 가족의 마을', images: [{ url: '/og.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: '포근별 마을', description: '칭찬이 별빛이 되어 자라나는 우리 가족의 마을', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
