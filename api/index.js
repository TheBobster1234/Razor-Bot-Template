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
    
    async login(auth, client) {
        return await this.auth.authenticate(auth, client);
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
};

export default Main;