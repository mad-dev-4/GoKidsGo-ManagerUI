import { Injectable, isDevMode } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Logger } from '../providers/logger';

/**
 * A simple key/value pairs storage class with persistence.
 */
@Injectable()
export class LTCache { 
	private _className = "LTCache";
	private STORAGE_KEY: string = '_Cache_KeyG';

	// Some default keys stored in the cache
	public KEY_DEFAULT_PROVINCE = 'ProvincePreference';
	public KEY_HEADER_TOKEN = 'token';
	public KEY_USER_LOGIN_EMAIL = 'email';
	public KEY_USER_LOGIN_ID = 'userId';
	public KEY_LOGIN_REMEMBERME = 'Login_RememberMe';
	public RECENT_VIEWS = "RecentViews";
	
	_defaults: any = { init: 'init'};
	_nvpStorage: any;
	_readyPromise: Promise<any>;

	constructor(public storage: Storage, public logger: Logger) {
	}



	/**
	 * Loads all values from local storage given the STORAGE_KEY and merges default values
	 **/
	load() {
		this.logger.entry(this._className, 'load()', "loading from storage");
		this.storage.create();

		return this.storage.get(this.STORAGE_KEY).then((value) => {
			if(value) {
				this._nvpStorage = value;
			}else {
				this.setAll(this._defaults).then((val) => {
					this._nvpStorage = val;
				})
			}
			
			if (isDevMode()) {
				this.logger.trace(this._className, 'load()', 'Dumping all LTCache data:');
				let str = JSON.stringify(this._nvpStorage);
				str = JSON.stringify(this._nvpStorage, null, 4); // (Optional) beautiful indented output.
				console.log(str);
			}
		});
	}

	/**
	 * Private method
	 * Merges any keys that may exist with new ones.  Called on load() when some stored values need to be merged with existing defaults.
	 * @param defaults: default values
	 * @return null (for all intensive purposes)
	 **/
	_mergeDefaults(defaults: any) {
		for(let k in defaults) {
			if(!(k in this._nvpStorage)) {
				this._nvpStorage[k] = defaults[k];
			}
		}
		return this.setAll(this._nvpStorage);
	}

	/**
	 * Private
	 **/
	merge(_nvpStorage: any) {
		for(let k in _nvpStorage) {
			this._nvpStorage[k] = _nvpStorage[k];
		}
		return this.save();
	}

	/**
	 * Private
	 **/
	save() {
		return this.setAll(this._nvpStorage);
	}

	/**
	 * Private
	 **/	
	setAll(value: any) {
		return this.storage.set(this.STORAGE_KEY, value);
	}


	

	




	/**
	 * Returns true if the specified key is in cache
	 * @param key: key to search for
	 **/
	contains(key: string) {
		return this._nvpStorage != null && (key in this._nvpStorage);
	}
	/**
	 * Removes a key/value from storage
	 * @param key: key to removeAttribute
	 * @return Promise<any> 
	 **/
	removeKey(key: string) {
		delete this._nvpStorage[key]; 
		return this.storage.set(this.STORAGE_KEY, this._nvpStorage);
	}
	
	/**
	 * Gets a specific value from storage given a key.
	 * @param key: the unique key
	 * @return value or null if not found
	 **/
	getValue(key: string) {
		return this.contains(key) ? this._nvpStorage[key] : null;
	}

	/**
	 * Sets a specific key/value pair and saves it in storage.
	 * @param key: the unique key
	 * @param value: the value assigned to the key
	 * @return: Promise<any> 
	 **/
	async setValue(key: string, value: any) {
		this._nvpStorage[key] = value;
		return this.storage.set(this.STORAGE_KEY, this._nvpStorage);
	}

	/**
	 * Adds a recent view element view to memory
	 * @param name, name of the object
	 * @param uniqueId, the unique Id to view details of this object
	 * @param type, displayable name like Venue, Location, etc
	 * @param routeName, name of the route to link to
	 */
	addRecentView(name, uniqueId, type, routeName) {
		this.logger.entry(this._className, 'addRecentView()');
		var savedList = this.getValue(this.RECENT_VIEWS);
		if (savedList == null) {
			savedList = []; 
		}

		// make sure the item isn't in memory already
		let contains = false;
		for(var i=0; i < savedList.length;i++) {
			if (savedList[i].id == uniqueId) {
				contains = true;

				// update name incase it changed
				if (savedList[i].name !== name) {
					savedList[i].name = name;
					this.setValue(this.RECENT_VIEWS,savedList);
				}
				break;
			}
		}
		if (!contains) {
			savedList.push(
				{
					id: uniqueId,
					name: name,
					type: type,
					route: routeName
				}
			);
			if (savedList.length > 15) {
				savedList.shift();
			}
			this.setValue(this.RECENT_VIEWS,savedList);
		}
		this.logger.trace(this._className, 'addRecentView()', 'end');
	}

	/**
	 * @returns Returns an array of recently viewed objects from memory
	 */
	getRecentViews() {
		var venueList = this.getValue(this.RECENT_VIEWS);
		if (venueList == null) {
			venueList = []; 
		}
		return venueList;
	}

	/**
	 * Removes recent views from memory
	 */
	clearRecentViews() {
		this.setValue(this.RECENT_VIEWS,[]);
	}
}
