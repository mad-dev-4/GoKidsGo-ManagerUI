import { Injectable, isDevMode } from '@angular/core';

/**
 * This module is to be injected into a component to write to logs.
 * It provides a specific application logging mechanism.
 */
@Injectable()
export class Logger {
  
	constructor() {
	}

	/**
	 * Pass in a response object from a http request, and this method will pretty print it to the console.
	 * @param classname: the name of the current class
	 * @param methodname: the name of the current method
	 * @param resp: http response object
	 **/
	public logJsonObj(classname: string, methodname: string, resp: any) {
		if (isDevMode()) {
			let str = JSON.stringify(resp);
			str = JSON.stringify(resp, null, 4); // (Optional) beautiful indented output.
			this.trace(classname, methodname, str); // Logs output to dev tools console.
		}
	}
	
	/**
	 * Logs a trace to the users console in debug mode only
	 * @param classname: the name of the current class
	 * @param methodname: the name of the current method
	 * @param text: any additional string you want written to the console
	 **/
	public trace(classname: string, methodname: string, text?: string | number) {
		if (isDevMode()) {
			console.log("TRACE: " + classname + "." + methodname + "-" + text);
		}
	}

	/**
	 * Logs a entry trace to the users console in debug mode only
	 * @param classname: the name of the current class
	 * @param methodname: the name of the current method
	 * @param text: any additional string you want written to the console
	 **/
	public entry(classname: string, methodname: string, text?: string | number) {
		if (isDevMode()) {
			if (text) {
				console.log("ENTRY: " + classname + "." + methodname + "-" + text);
			} else {
				console.log("ENTRY: " + classname + "." + methodname);
			}
		}
	}
	
}