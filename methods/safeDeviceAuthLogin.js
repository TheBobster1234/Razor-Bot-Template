import Api from "../api/index.js";

const api = new Api();

export async function safeDeviceAuthLogin(deviceAuth) {
    const auth = await api.login({ method: "device", value: deviceAuth });
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