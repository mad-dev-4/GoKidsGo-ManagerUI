import { NgModule } from '@angular/core';
import { OrderByPipe } from './orderby.pipe';
import { MapToIterablePipe } from './maptoiterable.pipe';
import { FormatLottoBoardPipe } from './formatdatetime.pipe';
import { FormatCurrencyPipe } from './formatcurrency.pipe';
import { FormatNumberPipe } from './formatnumber.pipe'; 

@NgModule({
    declarations: [OrderByPipe,
        MapToIterablePipe,
        FormatLottoBoardPipe,
        FormatNumberPipe,
        FormatCurrencyPipe],
    imports: [],
    exports: [OrderByPipe,
        MapToIterablePipe,
        FormatLottoBoardPipe,
        FormatNumberPipe,
        FormatCurrencyPipe]
})
export class PipesModule { }
