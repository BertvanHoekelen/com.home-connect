'use strict';

const HomeConnectDriver = require('../../lib/HomeConnectDriver');
const HomeConnectApi = require('../../lib/HomeConnectApi');

class HomeConnectDriverOven extends HomeConnectDriver {

	async _onPairListDevices( token ) {

		let homeConnectApi = new HomeConnectApi();
			homeConnectApi.setToken(token);

		return homeConnectApi.getHomeAppliances()
			.then( result => {

				if( !Array.isArray(result.homeappliances) )
					throw new Error('Invalid response');

				let devices = [];
				result.homeappliances.forEach( homeAppliance => {
					devices.push({
						data: {
							haId: homeAppliance.haId
						},
						name: homeAppliance.name,
						store: {
							token: token
						}
					});
				});

				return devices;

			})
			.catch( err => {
				this.error(err);
				throw err;
			})
	}

}

module.exports = HomeConnectDriverOven;