import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import eventCommand from './commands/event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
client.commands.set(eventCommand.data.name, eventCommand);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errorResponse = { content: 'Something went wrong while executing that command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorResponse);
      } else {
        await interaction.reply(errorResponse);
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    const command = client.commands.get('event');
    if (command && command.handleSelectMenu) {
      try {
        await command.handleSelectMenu(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
});

client.login(config.token);
