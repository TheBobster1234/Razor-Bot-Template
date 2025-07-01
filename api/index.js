import Auth from "./src/Auth.js";
import Cosmetics from "./src/Cosmetics.js";
import MCP from "./src/MCP.js";
import Playlist from "./src/Playlist.js";

class Main {
    constructor(options) {
        this.auth = new Auth();
        this.cosmetics = new Cosmetics();
        this.mcp = new MCP();
        this.playlist = new Playlist();
        //this.stats = new Stats(options.apiKey); - will add later dont need it rn
    };
    
    async login(clientId, clientSecret, options) {
        return await this.auth.authenticate(clientId, clientSecret, options);
    };

    async waitForDeviceCodeFlowComplete(data, overrideExpiresInMs) {
        return await this.auth.waitForDeviceCodeFlowComplete(data, overrideExpiresInMs);
    };

    async createDeviceAuth(credentials) {
        return await this.auth.createDeviceAuth(credentials);
    };

    async generateExchangeCode(credentials) {
        return await this.auth.generateExchangeCode(credentials);
    };

    async cosmeticLookup(name, backendType) {
        return await this.cosmetics.lookup(name, backendType);
    };
    
    async profileOperation(accountId, profileId, operation, token, payload) {
        return await this.mcp.operation(accountId, profileId, operation, token, payload);
    };

    async addFavoritePlaylist(accountId, playlistId, token) {
        return await this.playlist.addFavorite(accountId, playlistId, token);
    };

    async friendsOperation(accountId, operation, token, payload) {
        return await this.mcp.friendsRequest(accountId, operation, token, payload);
    };

    async addFriendsOperation(accountId, operation, token, payload) {
        return await this.mcp.sendFriendRequest(accountId, operation, friendId, token, payload);
    };

    async userStatsOperation(operation, token) {
        return await this.mcp.userStats(operation, token);
    };

    async managePartyOperation(accountId, token) {
        return await this.mcp.manageParty(accountId, token);
    };

    async accountDataOperation(accountId, token, payload) {
        return await this.mcp.accountData(accountId, token, payload);
    };

    async realPlayersOperation(accountId, token, payload) {
        return await this.mcp.realPlayers(accountId, token, payload);
    };
    
};

export default Main;