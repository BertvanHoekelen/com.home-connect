'use strict';

const EventSource = require('eventsource');
const { OAuth2Client } = require('homey-oauth2app');

module.exports = class HomeConnectOAuth2Client extends OAuth2Client {
  
  onInit() {
		this._eventsource = {};
  }
  
  async onRequestHeaders({ headers }) {
    return {
      ...await super.onRequestHeaders({ headers }),
			'Accept': 'application/vnd.bsh.sdk.v1+json',
			'Content-Type': 'application/vnd.bsh.sdk.v1+json',
    }
  }
  
  async onHandleResponse({ response }) {
    const {
      ok,
      status,
      statusText,
    } = response;
    
    if(!ok) {
      if( status !== 500 ) {
        const { error } = await response.json();
        if(error)
          throw new Error(error.description || error.key || `Unknown Remote Error (${status})`);
      }
          
      throw new Error(statusText || `Unknown Remote Error (${status})`);
    }
      
    if( status === 204 )
      return;
    
    const { data } = await response.json();
    return data;
  }

	async enableEvents({ haId }) {
		if( this._eventsource[ haId ] ) return;
		
		if( typeof this._token !== 'object' )
			throw new Error('Missing token');
				
		const es = this._eventsource[ haId ] = new EventSource(`${this._apiUrl}/homeappliances/${haId}/events`, {
			headers: {
				'Accept-Language': 'en-US',
				'Authorization': `Bearer ${this._token.access_token}`
			}
		});
		
		[ 'status', 'event', 'notify' ].forEach( eventType => {
			es.on(eventType.toUpperCase(), e => {								
				try {
					let data = JSON.parse(e.data);
					this.emit(`${haId}:${eventType}`, data.items);
				} catch( err ) {}
			})
		})
		
		return new Promise((resolve, reject) => {
			es.onopen = ( e ) => {
				if( e.type === 'open' )
					return resolve();
				return reject( new Error('Invalid response') );
			};

			es.onerror = ( err ) => {
				if( err && err.status )
					return reject( new Error(`Invalid status code, got: ${err.status}`) );
				reject( err )
			};
		});
	}

	async disableEvents({ haId }) {
		if( typeof this._eventsource[ haId ] === 'undefined' ) return;

		this._eventsource[ haId ].close();
		this._eventsource[ haId ] = null;
	}
	
	async getHomeAppliances() {
		return this.get({
  		path: '/homeappliances',
    });
	}

	async getStatus({ haId }) {
		return this.get({
  		path: `/homeappliances/${haId}/status`,
  });
	}

	async getSettings({ haId }) {
		return this.get({
  		path: `/homeappliances/${haId}/settings`,
    });
	}

	async setSetting({ haId, key, value }) {
		return this.put({
  		path: `/homeappliances/${haId}/settings/${key}`,
			json: {
  			data: {
			    key: key,
			    value: value
        },
			}
		});
	}
	
	async setProgram({ haId, programId, options }) {
  	//console.log({ haId, programId, options });
		return this.put({
  		path: `/homeappliances/${haId}/programs/active`,
			json: {
  			data: {
    			options,
          key: programId,
        }
			}
		});
	}
	
	async stopProgram({ haId }) {
		return this.delete({
  		path: `/homeappliances/${haId}/programs/active`,
    });
	}
  
}