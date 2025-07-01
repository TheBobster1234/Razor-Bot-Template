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

    async friendsRequest(accountId, operation, token, payload) {
        const { body } = await request(`https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${accountId}/${operation}`, {
            method: "GET",
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

    async sendFriendRequest(accountId, operation, friendId, token, payload) {
        const { body } = await request(`https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${accountId}/${operation}/${friendId}`, {
            method: "GET",
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

    async userStats(operation, token, payload) {
        const { body } = await request(`https://account-public-service-prod03.ol.epicgames.com/account/api/public/account/${operation}`, { //+ operation.map(id => `accountId=${id}`).join('&'), {
            method: "GET",
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

    async manageParty(accountId, token) {
        const { body } = await request(`https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/user/${accountId}`, { //+ operation.map(id => `accountId=${id}`).join('&'), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            //body: JSON.stringify(payload)
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    }; 
    
    /*async managePowerlevel(accountId, token) {
        const { body } = await request(`https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/parties/${partyId}/members/self/meta`, { 
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            //body: JSON.stringify(payload)
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    }; */

    async accountData(accountId, token, payload) { // Used to get display name
        const { body } = await request(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${accountId}`, { 
            method: "GET",
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

    async realPlayers(accountId, token, payload) { // Used to get display name
        const { body } = await request(`https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/matchmaking/session/findPlayer/${accountId}`, { 
            method: "GET",
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