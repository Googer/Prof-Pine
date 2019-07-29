"use strict";

const log = require('loglevel').getLogger('TrainFinishedCommand'),
  {MessageEmbed} = require('discord.js'),
  Commando = require('discord.js-commando'),
  {CommandGroup, PartyStatus, PartyType} = require('../../app/constants'),
  Helper = require('../../app/helper'),
  settings = require('../../data/settings'),
  PartyManager = require('../../app/party-manager');

class TrainFinishedCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'train-finished',
      group: CommandGroup.TRAIN,
      memberName: 'train-finished',
      aliases: ['train-completed', 'complete-route', 'route-complete', 'route-completed',
        'completed-route', 'finish-train', 'train-finish', 'train-complete', 'complete-train'],
      description: 'Marks the train as completed (skips any remaining route stops).\n',
      details: 'Use this command to mark the train as completed and skip any remaining route stops.',
      examples: ['\t!train-finished'],
      guildOnly: true
    });

    client.dispatcher.addInhibitor(message => {
      if (!!message.command && message.command.name === 'train-finished' &&
        !PartyManager.validParty(message.channel.id, PartyType.RAID_TRAIN)) {
        return ['invalid-channel', message.reply('You can only mark a raid train as finished within a train channel!')];
      }
      return false;
    });
  }

  async run(message) {
    const party = PartyManager.getParty(message.channel.id);

    if (party.conductor && party.conductor.username !== message.author.username) {
      message.react(Helper.getEmoji(settings.emoji.thumbsDown) || '👎')
        .catch(err => log.error(err));

      message.channel.send(`${message.author}, you must be this train's conductor to mark this train as finished.`)
        .catch(err => log.error(err));
    } else {
      let info = await party.finishRoute(message.author);

      if (info && info.error) {
        message.reply(info.error)
          .then(errorMessage => {
            setTimeout(() => {
              errorMessage.delete();
            }, 30000);
          })
          .catch(err => log.error(err));
        return;
      }

      message.react(Helper.getEmoji(settings.emoji.thumbsUp) || '👍')
        .catch(err => log.error(err));

      party.refreshStatusMessages();
    }
  }
}

module.exports = TrainFinishedCommand;