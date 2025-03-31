import {SingleSpa} from './src/models/single-spa/single-spa';

declare global {
  interface Window {
    singleSpa: SingleSpa;
  }
}

export {};
