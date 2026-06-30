import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "@/lib/query-client";
import { listAdverts, updateAdvert } from "@/server/functions/advert";
import type { Advert } from "@/db/schema/advert";

function createAdvertsCollection(brandId: number) {
  return createCollection(
    queryCollectionOptions<Advert>({
      id: `adverts-${brandId}`,
      queryKey: ["adverts", brandId],
      queryClient,
      getKey: (advert) => advert.id,
      queryFn: () => listAdverts({ data: brandId }),
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map((m) =>
            updateAdvert({ data: { id: m.key as number, data: m.changes } }),
          ),
        );
      },
    }),
  );
}

const advertCollectionCache = new Map<
  number,
  ReturnType<typeof createAdvertsCollection>
>();

export function getAdvertsCollection(brandId: number) {
  let collection = advertCollectionCache.get(brandId);
  if (!collection) {
    collection = createAdvertsCollection(brandId);
    advertCollectionCache.set(brandId, collection);
  }
  return collection;
}
