/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ExternalMenuModel } from "./components/onto-navbar/external-menu-model";
import { NavbarToggledEvent } from "./components/onto-navbar/navbar-toggled-event";
import { TranslationParameter } from "./models/translation/translation-parameter";
export { ExternalMenuModel } from "./components/onto-navbar/external-menu-model";
export { NavbarToggledEvent } from "./components/onto-navbar/navbar-toggled-event";
export { TranslationParameter } from "./models/translation/translation-parameter";
export namespace Components {
    interface OntoFooter {
    }
    interface OntoHeader {
    }
    interface OntoLayout {
    }
    interface OntoNavbar {
        /**
          * Configuration for the menu items model. This is the external model that is used to build the internal model.
         */
        "menuItems": ExternalMenuModel;
        /**
          * Configuration whether the navbar should be collapsed.
         */
        "navbarCollapsed": boolean;
        /**
          * The selected menu item.
         */
        "selectedMenu": string;
    }
    /**
     * The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
     * but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
     * and re-translates the passed language and translation parameters.
     * Example of usage:
     * <code>
     *    <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
     *    <translate-label labelKey="example.label></translate-label>
     * </code>
     */
    interface TranslateLabel {
        "labelKey": string;
        "translationParameters": TranslationParameter[];
    }
}
export interface OntoNavbarCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLOntoNavbarElement;
}
declare global {
    interface HTMLOntoFooterElement extends Components.OntoFooter, HTMLStencilElement {
    }
    var HTMLOntoFooterElement: {
        prototype: HTMLOntoFooterElement;
        new (): HTMLOntoFooterElement;
    };
    interface HTMLOntoHeaderElement extends Components.OntoHeader, HTMLStencilElement {
    }
    var HTMLOntoHeaderElement: {
        prototype: HTMLOntoHeaderElement;
        new (): HTMLOntoHeaderElement;
    };
    interface HTMLOntoLayoutElement extends Components.OntoLayout, HTMLStencilElement {
    }
    var HTMLOntoLayoutElement: {
        prototype: HTMLOntoLayoutElement;
        new (): HTMLOntoLayoutElement;
    };
    interface HTMLOntoNavbarElementEventMap {
        "navbarToggled": NavbarToggledEvent;
    }
    interface HTMLOntoNavbarElement extends Components.OntoNavbar, HTMLStencilElement {
        addEventListener<K extends keyof HTMLOntoNavbarElementEventMap>(type: K, listener: (this: HTMLOntoNavbarElement, ev: OntoNavbarCustomEvent<HTMLOntoNavbarElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLOntoNavbarElementEventMap>(type: K, listener: (this: HTMLOntoNavbarElement, ev: OntoNavbarCustomEvent<HTMLOntoNavbarElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLOntoNavbarElement: {
        prototype: HTMLOntoNavbarElement;
        new (): HTMLOntoNavbarElement;
    };
    /**
     * The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
     * but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
     * and re-translates the passed language and translation parameters.
     * Example of usage:
     * <code>
     *    <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
     *    <translate-label labelKey="example.label></translate-label>
     * </code>
     */
    interface HTMLTranslateLabelElement extends Components.TranslateLabel, HTMLStencilElement {
    }
    var HTMLTranslateLabelElement: {
        prototype: HTMLTranslateLabelElement;
        new (): HTMLTranslateLabelElement;
    };
    interface HTMLElementTagNameMap {
        "onto-footer": HTMLOntoFooterElement;
        "onto-header": HTMLOntoHeaderElement;
        "onto-layout": HTMLOntoLayoutElement;
        "onto-navbar": HTMLOntoNavbarElement;
        "translate-label": HTMLTranslateLabelElement;
    }
}
declare namespace LocalJSX {
    interface OntoFooter {
    }
    interface OntoHeader {
    }
    interface OntoLayout {
    }
    interface OntoNavbar {
        /**
          * Configuration for the menu items model. This is the external model that is used to build the internal model.
         */
        "menuItems"?: ExternalMenuModel;
        /**
          * Configuration whether the navbar should be collapsed.
         */
        "navbarCollapsed"?: boolean;
        /**
          * Event fired when the navbar is toggled.
         */
        "onNavbarToggled"?: (event: OntoNavbarCustomEvent<NavbarToggledEvent>) => void;
        /**
          * The selected menu item.
         */
        "selectedMenu"?: string;
    }
    /**
     * The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
     * but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
     * and re-translates the passed language and translation parameters.
     * Example of usage:
     * <code>
     *    <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
     *    <translate-label labelKey="example.label></translate-label>
     * </code>
     */
    interface TranslateLabel {
        "labelKey"?: string;
        "translationParameters"?: TranslationParameter[];
    }
    interface IntrinsicElements {
        "onto-footer": OntoFooter;
        "onto-header": OntoHeader;
        "onto-layout": OntoLayout;
        "onto-navbar": OntoNavbar;
        "translate-label": TranslateLabel;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "onto-footer": LocalJSX.OntoFooter & JSXBase.HTMLAttributes<HTMLOntoFooterElement>;
            "onto-header": LocalJSX.OntoHeader & JSXBase.HTMLAttributes<HTMLOntoHeaderElement>;
            "onto-layout": LocalJSX.OntoLayout & JSXBase.HTMLAttributes<HTMLOntoLayoutElement>;
            "onto-navbar": LocalJSX.OntoNavbar & JSXBase.HTMLAttributes<HTMLOntoNavbarElement>;
            /**
             * The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
             * but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
             * and re-translates the passed language and translation parameters.
             * Example of usage:
             * <code>
             *    <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
             *    <translate-label labelKey="example.label></translate-label>
             * </code>
             */
            "translate-label": LocalJSX.TranslateLabel & JSXBase.HTMLAttributes<HTMLTranslateLabelElement>;
        }
    }
}
