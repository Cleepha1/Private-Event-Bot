import { REST, Routes } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import eventCommand from './commands/event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

const commands = [
  eventCommand.data.toJSON()
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    console.log('Successfully registered slash commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
