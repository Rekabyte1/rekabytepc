export type Product = {
  id: string;
  title: string;
  desc: string;
  price: number;
  image: string;
  slug: string;
};

export const products: Product[] = [
  {
    id: '1',
    title: 'PC Gamer Ultra',
    desc: 'RTX 4070, Ryzen 7, 32GB RAM, 1TB NVMe.',
    price: 1200000,
    image: 'https://placehold.co/600x400',
    slug: 'pc-gamer-ultra',
  },
  {
    id: '2',
    title: 'PC Gamer Pro',
    desc: 'RTX 4060 Ti, Intel i5, 16GB RAM, 1TB NVMe.',
    price: 980000,
    image: 'https://placehold.co/600x400',
    slug: 'pc-gamer-pro',
  },
  {
    id: '3',
    title: 'PC para Creadores',
    desc: 'RTX 4070 Super, Ryzen 9, 32GB RAM, 2TB NVMe.',
    price: 1350000,
    image: 'https://placehold.co/600x400',
    slug: 'pc-creadores',
  },
];
