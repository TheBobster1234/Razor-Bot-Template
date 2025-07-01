import defs from "../defs.js";
import { request } from "undici";

class Auth {
    /**
     * Authenticates with Epic Games Account Service using OAuth 2.0
     * @param {string} clientId - The OAuth client ID
     * @param {string} clientSecret - The OAuth client secret
     * @param {Object} options - Authentication options object
     * @param {"authorization_code"|"client_credentials"|"continuation_token"|"device_auth"|"device_code"|"exchange_code"|"external_auth"|"otp"|"password"|"refresh_token"|"token_to_token"} options.grant_type - The OAuth grant type
     * @param {boolean} [options.eg1] - Sets the token_type to eg1
     * @param {string} [options.code] - Authorization code (required for authorization_code grant)
     * @param {string} [options.code_verifier] - Code verifier for PKCE (optional for authorization_code and exchange_code grants)
     * @param {string} [options.continuation_token] - Continuation token (required for continuation_token grant)
     * @param {string} [options.account_id] - Account ID (required for device_auth grant)
     * @param {string} [options.device_id] - Device ID (required for device_auth grant)
     * @param {string} [options.secret] - Device secret (required for device_auth grant)
     * @param {string} [options.device_code] - Device code (required for device_code grant)
     * @param {string} [options.exchange_code] - Exchange code (required for exchange_code grant)
     * @param {string} [options.external_auth_token] - External auth token (required for external_auth grant)
     * @param {string} [options.otp] - One-time password (required for otp grant)
     * @param {string} [options.challenge] - Challenge value (required for otp grant)
     * @param {string} [options.username] - Username (required for password grant)
     * @param {string} [options.password] - Password (required for password grant)
     * @param {string} [options.refresh_token] - Refresh token (required for refresh_token grant)
     * @param {string} [options.access_token] - Access token (required for token_to_token grant)
     * @returns {Promise<Object>} Authentication response object
     * @returns {string} returns.access_token - The access token
     * @returns {number} returns.expires_in - Token expiration time in seconds
     * @returns {string} returns.expires_at - Token expiration timestamp
     * @returns {string} returns.token_type - The token type
     * @returns {string} returns.client_id - The client ID
     * @returns {boolean} [returns.internal_client] - Whether this is an internal client
     * @returns {string} [returns.client_service] - The client service
     * @returns {string} [returns.product_id] - The product ID
     * @returns {string} [returns.application_id] - The application ID
     * @returns {string} [returns.refresh_token] - The refresh token (for user credentials)
     * @returns {number} [returns.refresh_expires] - Refresh token expiration time in seconds
     * @returns {string} [returns.refresh_expires_at] - Refresh token expiration timestamp
     * @returns {string} [returns.account_id] - The account ID (for user credentials)
     * @returns {string[]} [returns.scope] - Token scope array
     * @returns {string} [returns.displayName] - User display name
     * @returns {string} [returns.app] - App identifier
     * @returns {string} [returns.in_app_id] - In-app ID
     * @returns {string} [returns.acr] - Authentication context class reference
     * @returns {string} [returns.auth_time] - Authentication time
     * @throws {Error} When authentication fails
     */
    async authenticate(clientId, clientSecret, options) {
        const params = new URLSearchParams();

        console.log(clientId, clientSecret, options);

        params.append("grant_type", options.grant_type);
        if (options.eg1) params.append("token_type", "eg1");

        switch (options.grant_type) {
            case "authorization_code":
                params.append("code", options.code);
                if (options.code_verifier) params.append("code_verifier", options.code_verifier);
                break;
            case "client_credentials":
                // No additional params needed
                break;
            case "continuation_token":
                params.append("continuation_token", options.continuation_token);
                break;
            case "device_auth":
                params.append("account_id", options.account_id);
                params.append("device_id", options.device_id);
                params.append("secret", options.secret);
                break;
            case "device_code":
                params.append("device_code", options.device_code);
                break;
            case "exchange_code":
                params.append("exchange_code", options.exchange_code);
                if (options.code_verifier) params.append("code_verifier", options.code_verifier);
                break;
            case "external_auth":
                params.append("external_auth_token", options.external_auth_token);
                break;
            case "otp":
                params.append("otp", options.otp);
                params.append("challenge", options.challenge);
                break;
            case "password":
                params.append("username", options.username);
                params.append("password", options.password);
                break;
            case "refresh_token":
                params.append("refresh_token", options.refresh_token);
                break;
            case "token_to_token":
                params.append("access_token", options.access_token);
                break;
        }

        const credentials = btoa(`${clientId}:${clientSecret}`);
        const response = await fetch("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`,
            },
            body: params,
        });
        const body = await response.json();

        if (!response.ok) {
            throw new Error(body);
        };

        return body;
    }

    async startDeviceAuthorizationFlow(clientCredentials) {
        const params = new URLSearchParams();
        params.append("prompt", "login");
        // params.append("client_id", ac.clientId);

        const res = await fetch("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/deviceAuthorization", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${clientCredentials.access_token}`,
            },
            body: params,
        });

        const data = await res.json();

        if (data.errorMessage) throw new Error(JSON.stringify(data));
        return data;
    };

    async waitForDeviceCodeFlowComplete(data, overrideExpiresInMs) {
        console.log(`Begin device code waiting for ${overrideExpiresInMs || data.expires_in * 1000}ms`);
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const credentials = await this.authenticate(defs.PS4_US_CLIENT, defs.PS4_US_SECRET, {
                        grant_type: "device_code",
                        device_code: data.device_code,
                        eg1: true
                    });

                    if (credentials.access_token) {
                        clearInterval(interval);
                        clearTimeout(timeout);
                        resolve(credentials);
                    } else {
                        console.info("Waiting for device code to complete...");
                    };
                } catch (err) {
                    console.log(err);
                };
            }, data.interval * 1000);

            const timeout = setTimeout(() => {
                clearInterval(interval);
                reject(new Error("errors.com.epicgames.account.oauth.timed_out"));
            }, overrideExpiresInMs || data.expires_in * 1000);
        });
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