import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe is specific to formatting a currency value for display purposes.
 *  
 * <p> {{ aNumber | formatCurrency}}  </p>
 **/
@Pipe({name: 'formatCurrencyPipe'})
export class FormatCurrencyPipe implements PipeTransform {
	transform(value: number): any {
		var lstReplace = value != null ? 
			value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') :
			"0";
		return "$" + lstReplace;
	}
}

