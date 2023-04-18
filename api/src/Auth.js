import defs from "../defs.js";
import { request } from "undici";

class Auth {
    async authenticate(auth, client) {
        let payload;

        switch(auth.method) {
            case "code":
                payload = `grant_type=authorization_code&code=${auth.value}&token_type=eg1`;
                break;
            case "exchange":
                payload = `grant_type=exchange_code&exchange_code=${auth.value}&token_type=eg1`;
                break;
            case "device":
                payload = `grant_type=device_auth&device_id=${auth.value.deviceId}&account_id=${auth.value.accountId}&secret=${auth.value.secret}&token_type=eg1`;
                break;
            case "refresh":
                payload = `grant_type=refresh_token&refresh_token=${auth.value}&token_type=eg1`;
                break;
        };

        const { body } = await request("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${client ? defs[client + "_TOKEN"] : "MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE="}`
            },
            body: payload
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    };

    async createDeviceAuth(credentials) {
        const { body } = await request(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${credentials.account_id}/deviceAuth`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${credentials.access_token}`
            }
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    };

    async generateExchangeCode(credentials) {
        const { body } = await request("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange", {
            headers: {
                "Authorization": `Bearer ${credentials.access_token}`
            }
        });
        const data = await body.json();
        
        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    };
};

export default Auth;