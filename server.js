const server = require("server");
const axios = require("axios");
const YAML = require("js-yaml");

const { get, error } = server.router;
const { header, json, status } = server.reply;

const cors = [
  ctx => header("Access-Control-Allow-Origin", "*"),
];

server({ port: process.env.PORT, session: false, security: { csrf: false } }, cors, [
    get('/:channel', async ({ params: { channel }}) => {
        const { data } = await axios.get(`https://discord.com/api/v8/channels/${channel}/messages?limit=50`, {
            headers: { "Authorization": `Bot ${process.env.BOT}` }
        });
        if(!(Array.isArray(data) && data.length > 0)) throw Error("No messages");

        let out = [];
        for(let { content } of data) {
            const chunks = (content || "").split("```");
            if(chunks.length !== 3) continue;
            try {
                const yamlData = YAML.load(chunks[1]);
                if(!Array.isArray(yamlData)) continue;
                yamlData.forEach(v => out.push(v))
            } catch(err) {}
        }
        return json(out);
    }),
    error((ctx) => {
        console.warn(ctx.error);
        return status(500).send(ctx.error.message);
    }),
]);
