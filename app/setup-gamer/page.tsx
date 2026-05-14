// app/setup-gamer/page.tsx
import { prisma } from "@/lib/prisma";
import SetupGamerExplorer from "@/components/SetupGamerExplorer";

export const dynamic = "force-dynamic";

export default async function SetupGamerPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: "UNIT_PRODUCT",
      setupTier: { not: null },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      shortDescription: true,
      imageUrl: true,
      priceTransfer: true,
      stock: true,
      setupTier: true,
      setupCategory: true,
    },
  });

  return <SetupGamerExplorer products={products} />;
}