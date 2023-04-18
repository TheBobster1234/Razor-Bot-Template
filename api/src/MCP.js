import { request } from "undici";

class MCP {
    async operation(accountId, profileId, operation, token, payload) {
        const { body } = await request(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/client/${operation}?profileId=${profileId}&rvn=-1`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    };
};

export default MCP;