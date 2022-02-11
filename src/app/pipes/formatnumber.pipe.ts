import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe is specific to formatting a number with commas for display purposes.
 *
 *
 * <p> {{ aNumber | formatNumber}}  </p>
 **/
@Pipe({name: 'formatNumberPipe'})
export class FormatNumberPipe implements PipeTransform {
	transform(value: number): any {
		var lstReplace = value != null ? 
			value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
		return lstReplace;
	}
}

