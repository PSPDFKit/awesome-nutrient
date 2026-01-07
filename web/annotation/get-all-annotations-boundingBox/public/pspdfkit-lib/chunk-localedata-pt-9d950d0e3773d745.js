/*!
 * PSPDFKit for Web 2024.3.1 (https://pspdfkit.com/web)
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
(self.webpackChunkPSPDFKit=self.webpackChunkPSPDFKit||[]).push([[4932],{67822:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","many","other"],ordinal:["other"]},fn:function(a,e){var l=String(a),t=l.split(/[ce]/),n=t[1]||0,r=String(n?Number(t[0])*Math.pow(10,n):l).split("."),o=r[0],u=!r[1],i=o.slice(-6);return e?"other":0==o||1==o?"one":0==n&&0!=o&&0==i&&u||n<0||n>5?"many":"other"}},locale:"pt"})}}]);