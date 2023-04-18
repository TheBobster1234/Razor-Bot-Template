import { request } from "undici";

class Cosmetics {
    async lookup(name, backendType) {     
        const url = new URL("https://fortnite-api.com/v2/cosmetics/br/search");
        url.searchParams.append("name", name);
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
