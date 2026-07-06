import type {
  EditorialProviderAdapter,
  EditorialProviderMetadata,
} from "@/src/lib/editorial/providers/provider-types";

const providers = new Map<string, EditorialProviderAdapter>();

export function registerProvider(provider: EditorialProviderAdapter) {
  providers.set(provider.provider.id, provider);
  return provider.provider;
}

export function removeProvider(providerId: string) {
  return providers.delete(providerId);
}

export function listProviders() {
  return [...providers.values()].sort((a, b) => a.provider.priority - b.provider.priority);
}

export function listProviderMetadata(): EditorialProviderMetadata[] {
  return listProviders().map((provider) => provider.provider);
}

export function clearProvidersForTest() {
  providers.clear();
}
