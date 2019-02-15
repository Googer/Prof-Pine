const commando = require('discord.js-commando'),
  Discord = require('discord.js'),
  Region = require('../app/region');

class FindGymType extends commando.ArgumentType {
	constructor(client) {
		super(client, 'findgym');
	}

	validate(value, message, arg) {
		var that = this;
		return new Promise(
			async function(resolve, reject) {

				var gym;
				if (that.getValue(value) > -1) {
					gym = await Region.getGym(that.getValue(value)).catch(error => message.say(error));
				} else {
					gym = await Region.findGym(message.channel.id, value).catch(error => message.say(error));
				}

				if (gym != undefined && gym["name"]) {
					Region.showGymDetail(message, gym, `Gym found with term "${value}"`, null,false).then((message) => {
						gym.message = message;
						that.gym_info = gym;
						resolve(true);
					}).catch(err => console.log(err));
				} else {
					resolve("No gym found");
				}
			});
	}

	parse(value, message, arg) {
		return (this.gym_info != null) ? this.gym_info : value;
	}

	getValue(value) {
		const first = value.substring(0, 1)
		if (first === "#") {
			console.log("starts with pound")
			const integer = value.substring(1, value.length)
			console.log(integer)
			console.log(Number(integer))
			if (Number(integer)) {
				return Number(integer)
			}
		}

		return -1
	}
}

module.exports = FindGymType;
