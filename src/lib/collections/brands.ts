import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "@/lib/query-client";
import { listBrands, updateBrand } from "@/server/functions/brand";
import type { Brand } from "@/db/schema/brand";

function createBrandsCollection() {
  return createCollection(
    queryCollectionOptions<Brand>({
      id: "brands",
      queryKey: ["brands"],
      queryClient,
      getKey: (brand) => brand.id,
      queryFn: () => listBrands(),
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((m) =>
            updateBrand({ data: { id: m.key as number, data: m.changes } }),
          ),
        );
      },
    }),
  );
}

let cachedBrandsCollection: ReturnType<typeof createBrandsCollection> | undefined;

export function getBrandsCollection() {
  if (!cachedBrandsCollection) {
    cachedBrandsCollection = createBrandsCollection();
  }
  return cachedBrandsCollection;
}
