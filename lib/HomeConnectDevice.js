'use strict';

const Homey = require('homey');
const {
  OAuth2Device,
  OAuth2Token,
  OAuth2Util,
} = require('homey-oauth2app');

const DEBUG = process.env.DEBUG === '1';

module.exports = class HomeConnectDevice extends OAuth2Device {
  
  onOAuth2Migrate() {
    const store = this.getStore();
    if( store.token ) {
      const token = new OAuth2Token(store.token);
      const sessionId = OAuth2Util.getRandomId();
      const configId = this.getDriver().getOAuth2ConfigId();
      
      return {
        sessionId,
        configId,
        token,
      }      
    }
  }
  
  onOAuth2MigrateSuccess() {
    this.unsetStoreValue('token');    
  }

	onOAuth2Init() {

		const { haId } = this.getData();
		this.haId = haId;
		
		this.driver = this.getDriver();

		let store = this.getStore();
		this.oAuth2Client.on(`${haId}:status`, this._onStatus.bind(this))
		this.oAuth2Client.on(`${haId}:notify`, this._onNotify.bind(this))
		this.oAuth2Client.on(`${haId}:event`, this._onEvent.bind(this))

		this.log('onInit', haId);

		this.sync()
			.then(() => {
  			this.log('Synchronized');
  			
				this.oAuth2Client.enableEvents({ haId }).then(() => {
  				this.log('Subscribed to live events');
  			}).catch(this.error);
			})
			.catch( err => {
				this.setUnavailable(err);
				this.error( err );
			});
			
		if( this.hasCapability('onoff') )
		  this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
	}
	
	onOAuth2Deleted() {
  	const { haId } = this;
		this.oAuth2Client.disableEvents({ haId });
	}
	
	async onCapabilityOnoff( value ) {
  	return this._setSetting('BSH.Common.Setting.PowerState', value
  	 ? 'BSH.Common.EnumType.PowerState.On'
  	 : 'BSH.Common.EnumType.PowerState.Off'
    );
	}

	async sync() {
  	const { haId } = this;
		return this.oAuth2Client.getStatus({ haId })
			.then( result => {
				if( !Array.isArray(result.status) )
					throw new Error('Invalid response');

				result.status.forEach(statusObj => {
					this._parseStatus({
						key: statusObj.key,
						value: statusObj.value,
						event: false,
					}).catch( this.error )
				});
				
				return this.oAuth2Client.getSettings({ haId }).catch( err => {
					return { settings: [] };
				})
			})
			.then( result => {
				if( !Array.isArray(result.settings) )
					throw new Error('Invalid response');

				result.settings.forEach(settingObj => {
					this._parseSetting( settingObj.key, settingObj.value ).catch( this.error )
				});

			})

		
	}

	// extend this method in device.js
	async _parseStatus({ key, value, event }) {
		DEBUG && this.log('_parseStatus', key, value, event);	
		
		if( event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Open' )
			return this.driver.triggerFlowDoorOpened( this );
		
		if( event && key === 'BSH.Common.Status.DoorState' && value === 'BSH.Common.EnumType.DoorState.Closed' )
			return this.driver.triggerFlowDoorClosed( this );
		
	}

	// extend this method in device.js
	async _parseSetting( key, value ) {
		DEBUG && this.log('_parseSetting', key, value);	
		
    if( key === 'BSH.Common.Setting.PowerState' ) {
      if( this.hasCapability('onoff') ) {
        this.setCapabilityValue('onoff', value === 'BSH.Common.EnumType.PowerState.On').catch(this.error);
      }
    }
	}

	// extend this method in device.js	
	async _parseEvent({ key, value }) {
		DEBUG && this.log('_parseEvent', key, value);
			
		if( key === 'BSH.Common.Event.ProgramFinished' )
			this.driver.triggerFlowProgramFinished( this ).catch(this.error);
	}

	// extend this method in device.js	
	async _parseNotify({ key, value }) {
		DEBUG && this.log('_parseNotify', key, value);	
		
		if( key === 'BSH.Common.Option.ProgramProgress' ) {
  		if( this.hasCapability('bshc_string.progress') ) {
    		this.setCapabilityValue('bshc_string.progress', `${value}%`);
  		}
		}
		
		if( key === 'BSH.Common.Option.RemainingProgramTime' ) {
  		if( this.hasCapability('bshc_string.remaining_time') ) {
    		this.setCapabilityValue('bshc_string.remaining_time', fmtMSS(value));
  		}
		}
	}

	async _setSetting( key, value ) {
  	const { haId } = this;
		return this.oAuth2Client.setSetting({ haId, key, value });
	}
	
	async _setProgram( programId, options ) {
  	const { haId } = this;
		return this.oAuth2Client.setProgram({ haId, programId, options });
	}
	
	async startProgram() {
		throw new Error('Not implemented');
	}
	
	async stopProgram() {
  	const { haId } = this;
		return this.oAuth2Client.stopProgram({ haId });
	}

	_onStatus( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseStatus({
				key: item.key,
				value: item.value,
				event: true
			}).catch( this.error );
		})
	}
	
	_onNotify( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseNotify({
				key: item.key,
				value: item.value,
				event: true,
			}).catch( this.error )
		})
		
	}
	
	_onEvent( items ) {
		Array.isArray(items) && items.forEach( item => {
			this._parseEvent({
				key: item.key,
				value: item.value,
				event: true
			}).catch( this.error )
		})
	}
}

function fmtMSS(s){   // accepts seconds as Number or String. Returns m:ss
  return( s -         // take value s and subtract (will try to convert String to Number)
          ( s %= 60 ) // the new value of s, now holding the remainder of s divided by 60 
                      // (will also try to convert String to Number)
        ) / 60 + (    // and divide the resulting Number by 60 
                      // (can never result in a fractional value = no need for rounding)
                      // to which we concatenate a String (converts the Number to String)
                      // who's reference is chosen by the conditional operator:
          9 < s       // if    seconds is larger than 9
          ? ':'       // then  we don't need to prepend a zero
          : ':0'      // else  we do need to prepend a zero
        ) + s ;       // and we add Number s to the string (converting it to String as well)
}