import singleSpaHtml from 'single-spa-html';
import template from './footer.html';
import styles from './footer.css';

const htmlLifecycles = singleSpaHtml({
    template: template,
});

export const bootstrap = htmlLifecycles.bootstrap;
export const mount = htmlLifecycles.mount;
export const unmount = htmlLifecycles.unmount;
