import singleSpaHtml from 'single-spa-html';
import template from './navbar.html';
import styles from './navbar.css';

const htmlLifecycles = singleSpaHtml({
    template: template,
});

export const mount = async (props) => {
    await htmlLifecycles.mount(props); // wait for single-spa to mount the application

    function buildMenu() {
        const menuPlugins = PluginRegistry.get('main.menu');
        console.log(`menus`, menuPlugins);
        const menu = document.querySelector('.workbench-navbar .menu');
        menu.innerHTML = '';
        menuPlugins.forEach((plugin) => {
            const item = document.createElement('li');
            item.innerHTML = plugin.label;
            menu.appendChild(item);
        });
    }

    let opened = true;
    function toggleNavigation() {
        const navbar = document.querySelector('.wb-navbar');
        const workbenchApp = document.getElementById('workbench-app');

        if (opened) {
            navbar.style.width = '50px';
            workbenchApp.style.flexGrow = '1';
            opened = false;
        } else {
            navbar.style.width = '200px';
            workbenchApp.style.flexGrow = '0';
            opened = true;
        }
    }

    document.querySelector('.wb-navbar .toggle-menu').addEventListener('click', toggleNavigation);
};

export const bootstrap = htmlLifecycles.bootstrap;
// export const mount = htmlLifecycles.mount;
export const unmount = htmlLifecycles.unmount;
