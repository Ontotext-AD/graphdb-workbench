import {AppProps} from 'single-spa';
import {signal} from '@angular/core';

export const singleSpaProps = signal<SingleSpaProps | null>(null);

// Add any custom single-spa props you have to this type def
// https://single-spa.js.org/docs/building-applications.html#custom-props
export type SingleSpaProps = AppProps & {};
