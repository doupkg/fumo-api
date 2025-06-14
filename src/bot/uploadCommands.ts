import { Routes } from 'discord-api-types/v10'
import Commands from './commands'
import { Logger } from '@/lib'

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_TOKEN, DISCORD_GUILD_ID } = process.env

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_TOKEN || !DISCORD_GUILD_ID) {
    throw new Error('DISCORD_CLIENT_ID, DISCORD_CLIENT_TOKEN, and DISCORD_GUILD_ID environment variables are missing')
}

const apiUrl = 'https://discord.com/api/v10' + Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)

fetch(apiUrl, {
    headers: {
        Authorization: `Bot ${DISCORD_CLIENT_TOKEN}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(Commands.map(({ execute, ...rest }) => rest)),
    method: 'PUT',
}).then(async (res) => {
    Logger.assert('Commands were succesfully deployed to Discord API')
    Logger.info(await res.json())
})
