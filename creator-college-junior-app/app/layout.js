import './styles.css';

export const metadata = {
  title: 'Creator College Junior — Open House',
  description: 'Learn to Create in an AI World.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
