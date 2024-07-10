import singleSpaHtml from 'single-spa-html';
import template from './header.html';
import styles from './header.css';

const htmlLifecycles = singleSpaHtml({
    template: template,
});

export const bootstrap = htmlLifecycles.bootstrap;
export const mount = htmlLifecycles.mount;
export const unmount = htmlLifecycles.unmount;
