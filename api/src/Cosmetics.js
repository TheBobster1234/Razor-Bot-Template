import { request } from "undici";

class Cosmetics {
    cosmeticCache = [];

    async setupCache() {
        const { body } = await request("https://fortnite-api.com/v2/cosmetics/br");
        const { data } = await body.json();
        this.cosmeticCache = data;
    };

    async lookup(name, backendType) {
        const cachedLookupResult = lookupCached(name, backendType);
        if (!cachedLookupResult) {
            const uncachedLookupResult = this.lookupUncached(name, backendType);
            if (uncachedLookupResult) {
                this.setupCache(); // update stale cache
            }

            return uncachedLookupResult;
        }

        return cachedLookupResult;
    };

    async lookupById(id, backendType) {
        const cachedLookupResult = lookupByIdCached(id, backendType);
        if (!cachedLookupResult) {
            const uncachedLookupResult = this.lookupByIdUncached(id, backendType);
            if (uncachedLookupResult) {
                this.setupCache(); // update stale cache
            }

            return uncachedLookupResult;
        }

        return cachedLookupResult;
    };

    lookupCached(name, backendType) {
        if (backendType) {
            return this.cosmeticCache.find(cosmetic =>
                cosmetic.name.toLowerCase() === name.toLowerCase() && cosmetic.type.backendValue.toLowerCase() === backendType.toLowerCase())?.id?.toLowerCase();
        };

        return this.cosmeticCache.find(cosmetic =>
            cosmetic.name.toLowerCase() === name.toLowerCase())?.id?.toLowerCase();
    };

    lookupByIdCached(id, backendType) {
        if (backendType) {
            return this.cosmeticCache.find(cosmetic =>
                cosmetic.id.toLowerCase() === id.toLowerCase() && cosmetic.type.backendValue.toLowerCase() === backendType.toLowerCase())
        };

        return this.cosmeticCache.find(cosmetic =>
            cosmetic.id.toLowerCase() === id.toLowerCase());
    };

    async lookupUncached(name, backendType) {
        const url = new URL("https://fortnite-api.com/v2/cosmetics/br/search");
        url.searchParams.append("name", name);
        url.searchParams.append("backendType", backendType);

        const { body } = await request(url);
        const data = await body.json();

        if (data.error) throw new Error(JSON.stringify(data.error));

        return data.data.id.toLowerCase();
    };

    async lookupByIdUncached(id, backendType) {
        const url = new URL("https://fortnite-api.com/v2/cosmetics/br/search");
        url.searchParams.append("id", id);
        url.searchParams.append("backendType", backendType);

        const { body } = await request(url);
        const data = await body.json();

        if (data.error) throw new Error(JSON.stringify(data.error));

        return data.data.id.toLowerCase();
    };

    async fetchItemShop() {
        const { body } = await request("https://fortnite-api.com/v2/shop/br/combined");
        const { data } = await body.json();

        return data;
    };
};

export default Cosmetics;
