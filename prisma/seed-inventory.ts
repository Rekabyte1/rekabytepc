import fs from "node:fs";
import path from "node:path";
import { PrismaClient, ProductCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    throw new Error(`No existe archivo .env en: ${envPath}`);
  }

  const content = fs.readFileSync(envPath, "utf8");

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");

    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();

    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en .env");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

type CsvRow = {
  productSku?: string;
  productSlug?: string;
  internalSku?: string;
  supplierName?: string;
  purchaseDate?: string;
  currentStock?: string;
  unitNetCost?: string;
  taxRate?: string;
  unitCostWithTax?: string;
  invoiceNumber?: string;
  notes?: string;
};

const CSV_PATH = path.join(process.cwd(), "prisma", "inventory.csv");

function parseMoney(value: string | undefined): number {
  if (!value) return 0;

  const cleaned = String(value)
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parsePercent(value: string | undefined): number {
  if (!value) return 0.19;

  const cleaned = String(value)
    .replace("%", "")
    .replace(",", ".")
    .trim();

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) return 0.19;

  if (parsed > 1) {
    return parsed / 100;
  }

  return parsed;
}

function parseIntSafe(value: string | undefined): number {
  if (!value) return 0;

  const parsed = Number(
    String(value)
      .replace(/\./g, "")
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function parseDate(value: string | undefined): Date {
  if (!value) return new Date();

  const raw = String(value).trim();

  const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;

    return new Date(
      `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T12:00:00-04:00`
    );
  }

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return new Date();
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row as CsvRow;
  });
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No existe el archivo CSV: ${CSV_PATH}`);
  }

  const content = fs.readFileSync(CSV_PATH, "utf8");

  const rows = parseCsv(content);

  console.log(`Importando inventario desde ${CSV_PATH}`);
  console.log(`Filas detectadas: ${rows.length}`);

  let createdSuppliers = 0;
  let upsertedItems = 0;
  let createdPurchases = 0;
  let notFoundProducts = 0;
  let skippedRows = 0;

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;

    const productSku = String(row.productSku ?? "").trim();
    const productSlug = String(row.productSlug ?? "").trim();

    const supplierName = String(row.supplierName ?? "").trim();

    const internalSku = String(
      row.internalSku ?? productSku ?? productSlug
    ).trim();

    if (!productSku && !productSlug) {
      console.warn(
        `Fila ${rowNumber}: sin productSku/productSlug. Saltada.`
      );

      skippedRows += 1;

      continue;
    }

    if (!supplierName) {
      console.warn(`Fila ${rowNumber}: sin supplierName. Saltada.`);

      skippedRows += 1;

      continue;
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          productSku ? { sku: productSku } : undefined,
          productSlug ? { slug: productSlug } : undefined,
        ].filter(Boolean) as any,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        category: true,
        brand: true,
        stock: true,
        priceTransfer: true,
        priceCard: true,
      },
    });

    if (!product) {
      console.warn(
        `Fila ${rowNumber}: producto no encontrado. productSku="${productSku}" productSlug="${productSlug}"`
      );

      notFoundProducts += 1;

      continue;
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        name: supplierName,
      },
      select: {
        id: true,
      },
    });

    const supplier = await prisma.supplier.upsert({
      where: {
        name: supplierName,
      },
      update: {},
      create: {
        name: supplierName,
      },
    });

    if (!existingSupplier) {
      createdSuppliers += 1;
    }

    const unitNetCost = parseMoney(row.unitNetCost);

    const taxRate = parsePercent(row.taxRate);

    const unitCostWithTax =
      parseMoney(row.unitCostWithTax) ||
      Math.round(unitNetCost * (1 + taxRate));

    const currentStock = parseIntSafe(row.currentStock);

    const purchaseDate = parseDate(row.purchaseDate);

    const quantity =
      currentStock > 0
        ? currentStock
        : product.stock ?? 0;

    const totalCost = unitCostWithTax * quantity;

    const transferPrice = product.priceTransfer ?? 0;

    const cardPrice = product.priceCard ?? 0;

    const marginTransferPercent =
      transferPrice > 0 && unitCostWithTax > 0
        ? ((transferPrice - unitCostWithTax) / transferPrice) * 100
        : 0;

    const marginCardPercent =
      cardPrice > 0 && unitCostWithTax > 0
        ? ((cardPrice - unitCostWithTax) / cardPrice) * 100
        : 0;

    const inventoryItem = await prisma.inventoryItem.upsert({
      where: {
        internalSku,
      },
      update: {
        productId: product.id,
        category: product.category as ProductCategory,
        brand: product.brand,
        model: product.name,
        currentStock,
        lastNetCost: unitNetCost,
        lastTaxRate: taxRate,
        lastCostWithTax: unitCostWithTax,
        currentTransferPrice: transferPrice,
        currentCardPrice: cardPrice,
        notes: row.notes?.trim() || null,
      },
      create: {
        productId: product.id,
        internalSku,
        category: product.category as ProductCategory,
        brand: product.brand,
        model: product.name,
        currentStock,
        minStock: 0,
        targetStock: 0,
        lastNetCost: unitNetCost,
        lastTaxRate: taxRate,
        lastCostWithTax: unitCostWithTax,
        currentTransferPrice: transferPrice,
        currentCardPrice: cardPrice,
        notes: row.notes?.trim() || null,
      },
    });

    upsertedItems += 1;

    await prisma.inventoryPurchase.create({
      data: {
        inventoryItemId: inventoryItem.id,
        supplierId: supplier.id,
        purchaseDate,
        quantity,
        unitNetCost,
        taxRate,
        unitCostWithTax,
        totalCost,
        suggestedTransferPrice: transferPrice,
        suggestedCardPrice: cardPrice,
        marginTransferPercent,
        marginCardPercent,
        invoiceNumber: row.invoiceNumber?.trim() || null,
        notes: row.notes?.trim() || null,
      },
    });

    createdPurchases += 1;

    console.log(
      `OK fila ${rowNumber}: ${product.name} conectado con ${supplier.name}`
    );
  }

  console.log("");
  console.log("Importación terminada:");
  console.log(`Proveedores creados: ${createdSuppliers}`);
  console.log(`InventoryItem creados/actualizados: ${upsertedItems}`);
  console.log(`Compras creadas: ${createdPurchases}`);
  console.log(`Productos no encontrados: ${notFoundProducts}`);
  console.log(`Filas saltadas: ${skippedRows}`);
}

main()
  .catch((error) => {
    console.error("Error importando inventario:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });