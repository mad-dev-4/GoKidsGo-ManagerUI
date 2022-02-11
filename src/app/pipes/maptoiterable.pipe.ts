import { Pipe, PipeTransform } from '@angular/core';

/**
 * Allows iterating through a JSON object, versus an array.  Should be an object of string & value.  Example is a json lotto board.  The 
 * NumberPicks object should be piped to this transform.
 *  
 *  "LottoBoard":[
 * 	   {
 * 		  "NumberPicks":{
 * 			 "25":"1",
 * 			 "26":"",
 * 			 "27":"",
 * 			 "28":"1",
 * 			 "29":"",
 * 			 "38":""
 * 		  }
 * 	   }
 * 	],
 **/
@Pipe({name: 'mapToIterable'})
export class MapToIterablePipe implements PipeTransform {
  transform(value: any, args: string[]): any {
	let result = [];
	  
    if (value) {
		if(value.entries) {
			value.forEach((key, value) => {
				result.push({key, value});
			});
		} else {
			for(let key in value) {
				if(value.hasOwnProperty(key)) {
					result.push({key, value: value[key]});
				}
			}
		}
	}
	return result;
  }
}