import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO } from 'date-fns';

/**
 * This pipe is specific to formatting a data and time field.
 *
 * <p> {{ dataList.createdDate | formatDateTime}}  </p>
 **/
@Pipe({name: 'formatDateTime'})
export class FormatLottoBoardPipe implements PipeTransform {
	transform(value: string): any {
		if (value == null || value == '') {
			return '';
		}
		return format(parseISO(value), 'MMM d, yyyy - HH:mm aaa');
	}
}