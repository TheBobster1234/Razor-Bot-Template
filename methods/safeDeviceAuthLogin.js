import Api from "../api/index.js";
import defs from "../api/defs.js";

const api = new Api();

export async function safeDeviceAuthLogin(deviceAuth) {
    const auth = await api.login(defs.ANDROID_CLIENT, defs.ANDROID_SECRET, {
        grant_type: "device_auth",
        account_id: deviceAuth.accountId,
        device_id: deviceAuth.deviceId,
        secret: deviceAuth.secret,
    });
    return auth;
    // try {
    //     const auth = await api.login({ method: "device", value: deviceAuth });
    //     return auth;
    // } catch (err) {
    //     const error = tryParseJson(err.message);

    //     if (error.errorCode === "errors.com.epicgames.account.invalid_account_credentials") {
    //         const { error } = await supabase.from(config.database.table).delete().match({ discordId: user });
    //         if (error) throw new Error(error);
    //     };

    //     throw err;
    // };
};