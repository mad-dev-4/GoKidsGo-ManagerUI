import { Pipe, PipeTransform } from '@angular/core';

/**
 * Allows sorting a JSON array based on a specific attribute.  Example is a json array of members.
 *  
 * [
 *	{"ID":1,"GroupId":1,"EmailAddress":"steve@lotterytracker.ca","Captain":0,"Sequence":1.0},
 *  {"ID":2,"GroupId":1,"EmailAddress":"dave@lotterytracker.ca","Captain":0,"Sequence":2.0},
 * ]
 * 
 *
 * <ion-card *ngFor="let mbr of activeMembers | orderByPipe:'Sequence' ; let last = last">
 **/
@Pipe({name: 'orderByPipe'})
export class OrderByPipe implements PipeTransform {
	transform(array: Array<string>, sortField: string): Array<string> {
		array.sort((a: any, b: any) => {
			if (a[sortField] < b[sortField]) {
				return 0;
			} else if (a[sortField] > b[sortField]) {
				return 1;
			} else {
				return 0;
			}
		});
		return array;
	}
}

