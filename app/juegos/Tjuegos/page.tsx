// app/juegos/Tjuegos/page.tsx
import dynamic from 'next/dynamic';

const JuegosClient = dynamic(() => import('./JuegosClient'), { ssr: false });

export default function Page() {
  return <JuegosClient />;
}

// export const dynamic = 'force-dynamic';
