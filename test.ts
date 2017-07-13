import { login, Model } from "./src/";
import config from "./src/config";

async function test() {
    config.useLocal();
    await login("ben.hernandez@corp.riglet.io", "Z3nB@rnH3n");
    const toBeDeleted = await Model.instance("http://localhost:3000/v2/models/WRAPPER%20TEST");
    try {
        await toBeDeleted.remove();
    } catch (error) {
        console.log("error?", error);
    }
}

test();
