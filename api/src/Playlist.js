import { request } from "undici";

class Playlist {
    async addFavorite(accountId, playlistId, token) {
        const { statusCode } = await request(`https://fn-service-discovery-live-public.ogs.live.on.epicgames.com/api/v1/links/favorites/${accountId}/${playlistId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        
        if (statusCode !== 204) throw new Error("The playlist id you provided is invalid.");
    };
};

export default Playlist;