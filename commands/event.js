import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getCurrentEvents, getUpcomingEvents, getNextEventOccurrence, formatDuration, EVENT_TYPES } from '../utils/events.js';
import { fetchCurrentMayor } from '../services/hypixel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Check SkyBlock events')
    .addSubcommand(subcommand =>
      subcommand
        .setName('current')
        .setDescription('Shows currently active events'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('upcoming')
        .setDescription('Shows upcoming events'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('lookup')
        .setDescription('Look up when a specific event will happen'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('mayorvotes')
        .setDescription('Shows current mayor election votes')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'current') {
      await handleCurrent(interaction);
    } else if (subcommand === 'upcoming') {
      await handleUpcoming(interaction);
    } else if (subcommand === 'lookup') {
      await handleLookup(interaction);
    } else if (subcommand === 'mayorvotes') {
      await handleMayorVotes(interaction);
    }
  },

  async handleSelectMenu(interaction) {
    const eventId = interaction.values[0];
    const eventData = getNextEventOccurrence(eventId);

    if (!eventData) {
      await interaction.reply({ content: 'Could not find that event.', ephemeral: true });
      return;
    }

    const now = Date.now();
    const timeUntilStart = eventData.startsAt - now;
    const isActive = timeUntilStart <= 0;

    const embed = new EmbedBuilder()
      .setTitle(`📅 ${eventData.name}`)
      .setDescription(eventData.description)
      .setColor(isActive ? 0x00ff00 : 0x3498db)
      .addFields(
        { 
          name: isActive ? '⏰ Ends In' : '⏰ Starts In', 
          value: isActive 
            ? formatDuration(eventData.endsAt - now)
            : formatDuration(timeUntilStart), 
          inline: true 
        },
        { 
          name: '📆 Time', 
          value: isActive
            ? `<t:${Math.floor(eventData.endsAt / 1000)}:R>`
            : `<t:${Math.floor(eventData.startsAt / 1000)}:R>`, 
          inline: true 
        }
      )
      .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
  }
};

async function handleCurrent(interaction) {
  const events = getCurrentEvents();

  if (events.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle('📅 Current Events')
      .setDescription('No events are currently active.')
      .setColor(0x95a5a6)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('📅 Current Events')
    .setColor(0x00ff00)
    .setTimestamp();

  for (const event of events) {
    const timeRemaining = event.endsAt - Date.now();
    embed.addFields({
      name: `✨ ${event.name}`,
      value: `${event.description}\nEnds <t:${Math.floor(event.endsAt / 1000)}:R> (${formatDuration(timeRemaining)})`
    });
  }

  await interaction.reply({ embeds: [embed] });
}

async function handleUpcoming(interaction) {
  const events = getUpcomingEvents().slice(0, 5);

  const embed = new EmbedBuilder()
    .setTitle('📅 Upcoming Events')
    .setColor(0x3498db)
    .setTimestamp();

  for (const event of events) {
    const timeUntil = event.startsAt - Date.now();
    embed.addFields({
      name: `✨ ${event.name}`,
      value: `${event.description}\nStarts <t:${Math.floor(event.startsAt / 1000)}:R> (${formatDuration(timeUntil)})`
    });
  }

  await interaction.reply({ embeds: [embed] });
}

async function handleLookup(interaction) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('event_lookup')
    .setPlaceholder('Select an event')
    .addOptions(
      Object.values(EVENT_TYPES).map(event => ({
        label: event.name,
        description: event.description.substring(0, 100),
        value: event.id
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: 'Select an event to look up:',
    components: [row],
    ephemeral: true
  });
}

async function handleMayorVotes(interaction) {
  await interaction.deferReply();

  try {
    const data = await fetchCurrentMayor();

    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const embed = new EmbedBuilder()
      .setTitle('🗳️ Mayor Election')
      .setColor(0xe74c3c)
      .setTimestamp();

    if (data.mayor && data.mayor.election) {
      const { year, candidates } = data.mayor.election;
      
      embed.setDescription(`Election Year ${year}`);

      const sortedCandidates = candidates.sort((a, b) => b.votes - a.votes);

      for (const candidate of sortedCandidates.slice(0, 5)) {
        const perks = candidate.perks ? candidate.perks.map(p => `• ${p.name}`).join('\n') : 'No perks listed';
        embed.addFields({
          name: `${candidate.name} - ${candidate.votes.toLocaleString()} votes`,
          value: perks.substring(0, 200)
        });
      }
    } else if (data.current) {
      const mayor = data.current;
      embed.setDescription(`Current Mayor: **${mayor.name}**`);
      
      if (mayor.perks && mayor.perks.length > 0) {
        const perks = mayor.perks.map(p => `• ${p.name}`).join('\n');
        embed.addFields({
          name: 'Active Perks',
          value: perks
        });
      }

      if (mayor.election) {
        embed.addFields({
          name: 'Term',
          value: `Year ${mayor.election.year}`,
          inline: true
        });
      }
    } else {
      embed.setDescription('No election data available at this time.');
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching mayor data:', error);
    await interaction.editReply({ 
      content: 'Failed to fetch mayor election data. Please try again later.',
      ephemeral: true 
    });
  }
}
