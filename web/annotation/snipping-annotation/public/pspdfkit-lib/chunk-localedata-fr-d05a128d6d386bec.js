/*!
 * PSPDFKit for Web 2024.3.2 (https://pspdfkit.com/web)
 *
 * Copyright (c) 2016-2024 PSPDFKit GmbH. All rights reserved.
 *
 * THIS SOURCE CODE AND ANY ACCOMPANYING DOCUMENTATION ARE PROTECTED BY INTERNATIONAL COPYRIGHT LAW
 * AND MAY NOT BE RESOLD OR REDISTRIBUTED. USAGE IS BOUND TO THE PSPDFKIT LICENSE AGREEMENT.
 * UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS SUBJECT TO CIVIL AND CRIMINAL PENALTIES.
 * This notice may not be removed from this file.
 *
 * PSPDFKit uses several open source third-party components: https://pspdfkit.com/acknowledgements/web/
 */
(self.webpackChunkPSPDFKit=self.webpackChunkPSPDFKit||[]).push([[1145],{18712:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","many","other"],ordinal:["one","other"]},fn:function(e,a){var l=String(e),t=l.split(/[ce]/),n=t[1]||0,o=String(n?Number(t[0])*Math.pow(10,n):l).split("."),r=o[0],u=!o[1],i=r.slice(-6);return a?1==e?"one":"other":e>=0&&e<2?"one":0==n&&0!=r&&0==i&&u||n<0||n>5?"many":"other"}},locale:"fr"})}}]);