# Awesome Nutrient

![The building blocks for digital transformation.](./resources/header.png)

[![Awesome](https://awesome.re/badge-flat.svg)](https://awesome.re)
[![Chat](https://img.shields.io/badge/chat-on_discord-7289da.svg)](https://discord.gg/Z754Pfb8bD)
[![Playground](https://img.shields.io/badge/Try-Interactive_Playground-0066FF?style=flat&logo=codesandbox&logoColor=white)](./playground/)

This repository contains examples built with [Nutrient](https://www.nutrient.io/). These examples are provided for inspiration and learning. Read [the disclaimer](./DISCLAIMER.md) or [reach out if you have questions](https://support.nutrient.io/hc/en-us/requests/new).

---

## Quick Start

**New to Nutrient?** Start with the [official getting started guide](https://www.nutrient.io/getting-started/).

**Want to try examples?** Choose your path:
- **Interactive Playground**: Try code snippets directly in your browser
- **Local Examples**: Clone and run complete projects on your machine
- **Official Catalogs**: Explore comprehensive SDK capabilities

---

## Web SDK Examples

### Official Example Catalog
The [Example Catalog](https://github.com/PSPDFKit/pspdfkit-web-examples-catalog) showcases core Web SDK capabilities. [Try them online](https://web-examples.our.services.nutrient-powered.io/).

### Framework Integration Examples
- [React](https://github.com/PSPDFKit/nutrient-web-examples/tree/main/examples/react)
- [Angular](https://github.com/PSPDFKit/nutrient-web-examples/tree/main/examples/angular)
- [Next.js](https://github.com/PSPDFKit/nutrient-web-examples/tree/main/examples/nextjs)
- [Nuxt.js](https://github.com/PSPDFKit/nutrient-web-examples/tree/main/examples/nuxtjs)

### Interactive Playground Snippets
Try these code snippets directly in your browser — [Browse All →](./playground/README.md)

| Category | Description | Link |
|----------|-------------|------|
| **Annotations** | Add, customize, and manage PDF annotations | [View Examples](./playground/web-annotations.md) |
| **Redaction** | Permanently remove sensitive content | [View Examples](./playground/web-redaction.md) |
| **Signing** | Electronic and digital signatures | [View Examples](./playground/web-signing.md) |
| **Forms** | PDF form filling and management | [View Examples](./playground/web-forms.md) |
| **Form Creator** | Create and customize PDF forms | [View Examples](./playground/web-form-creator.md) |
| **Viewer** | PDF viewing and navigation | [View Examples](./playground/web-viewer.md) |
| **Document Editor** | Page manipulation and editing | [View Examples](./playground/web-document-editor.md) |
| **Comments** | Collaborative commenting workflows | [View Examples](./playground/web-comments.md) |
| **Content Editor** | Direct PDF content editing | [View Examples](./playground/web-content-editor.md) |
| **Toolbars & Menus** | UI customization and toolbar configuration | [View Examples](./playground/web-toolbars-menus.md) |
| **Text Comparison** | Compare document versions | [View Examples](./playground/web-text-comparison.md) |

### Local Runnable Examples
Clone and run these complete examples on your machine:

| Category | Examples | Quick Access |
|----------|----------|--------------|
| **Annotations** | 9 examples including comment-annotations, redact-one-by-one, text-2-speech | [Browse →](./web/annotation/INDEX.md) |
| **Signing** | 3 examples including sign-here-upgraded, digital signatures | [Browse →](./web/signing/INDEX.md) |
| **Document Editor** | Page extraction and manipulation | [Browse →](./web/document-editor/INDEX.md) |
| **Viewer** | Multi-tab viewer | [Browse →](./web/viewer/INDEX.md) |
| **Miscellaneous** | Analytics integrations (Mixpanel) | [Browse →](./web/miscellaneous/INDEX.md) |

---

## Document Services

### Document Engine
Server-side PDF processing and manipulation:
- [AWS ECS Deployment with Terraform](./document-engine/de-aws-ecs-terraform)
- [Orbstack Kubernetes Deployment](./document-engine/de-orbstack-kubernetes)

### Document Web Services (DWS)
- [DWS and Web SDK Integration](./dws/README.md) — React-Vite app demonstrating PDF viewing and table extraction with DWS APIs

---

## Design System & UI Customization

- [Baseline UI](https://www.nutrient.io/baseline-ui/) — Customizable and accessible React components
- [Add custom button to toolbar](https://www.nutrient.io/playground?p=eyJ2IjoxLCJqcyI6ImNvbnN0e2NyZWF0ZUJsb2NrOmNyZWF0ZUJsb2NrLEludGVyZmFjZXM6SW50ZXJmYWNlcyxSZWNpcGVzOlJlY2lwZXMsQ29yZTpDb3JlfT1QU1BERktpdC5VSTtQU1BERktpdC5sb2FkKHsuLi5iYXNlT3B0aW9ucyx0aGVtZTpQU1BERktpdC5UaGVtZS5EQVJLLHVpOntcbi8vdGhpcyBjb21wbGV0ZXMgYW4gZXhhbXBsZSBkb25lIGluIHZpcnR1YWwgQlVJIHdvcmtzaG9wIHdpdGggUml0ZXNoXG5bSW50ZXJmYWNlcy5QcmltYXJ5VG9vbGJhcl06KHtwcm9wczpwcm9wc30pPT4oe2NvbnRlbnQ6Y3JlYXRlQmxvY2soUmVjaXBlcy5QcmltYXJ5VG9vbGJhcixwcm9wcywoKHt1aTp1aX0pPT57Y29uc3QgY3VzdG9tQnV0dG9uPWNyZWF0ZUJsb2NrKENvcmUuQWN0aW9uQnV0dG9uLHtsYWJlbDonY3VzdG9tLWJ1dHRvbicsdmFyaWFudDondG9vbGJhcid9KTtyZXR1cm4gdWkuaW5zZXJ0QWZ0ZXIoJ3BhbicsY3VzdG9tQnV0dG9uKSx1aS5jcmVhdGVDb21wb25lbnQoKX0pKS5jcmVhdGVDb21wb25lbnQoKX0pfX0pLnRoZW4oKGluc3RhbmNlPT57Y29uc29sZS5sb2coJ1BTUERGS2l0IGxvYWRlZCEnKSxjb25zb2xlLmxvZygnQVBJIGRvY3M6IGh0dHBzOi8vcHNwZGZraXQuY29tL2FwaS93ZWIvJyksY29uc29sZS5sb2coJ0d1aWRlczogaHR0cHM6Ly9wc3BkZmtpdC5jb20vZ3VpZGVzL3dlYi8nKX0pKTsifQ%253D%253D)
- [Customize toolbar dropdown items](https://www.nutrient.io/playground?p=eyJ2IjoxLCJjc3MiOiIvKiBBZGQgeW91ciBDU1MgaGVyZSAqL1xuIiwic2V0dGluZ3MiOnsiZmlsZU5hbWUiOiJiYXNpYy5wZGYifSwianMiOiJQU1BERktpdC5sb2FkKHtcbiAgLi4uYmFzZU9wdGlvbnMsXG4gIHRoZW1lOiBQU1BERktpdC5UaGVtZS5EQVJLLFxuICB0b29sYmFySXRlbXM6IFt7IHR5cGU6IFwibGluZVwiLCBkcm9wZG93bkdyb3VwOiBcInR3b1wiICB9LCB7dHlwZTogXCJhcnJvd1wiLCBkcm9wZG93bkdyb3VwOiBcIm9uZVwiIH1dXG59KS50aGVuKChpbnN0YW5jZSkgPT4ge1xufSk7XG4ifQ%253D%253D)
- [Change thumbnails sidebar labels](https://www.nutrient.io/playground?p=eyJ2IjoxLCJqcyI6ImNvbnN0e2NyZWF0ZUJsb2NrOmNyZWF0ZUJsb2NrLEludGVyZmFjZXM6SW50ZXJmYWNlcyxSZWNpcGVzOlJlY2lwZXMsQ29yZTpDb3JlfT1QU1BERktpdC5VSTtQU1BERktpdC5sb2FkKHsuLi5iYXNlT3B0aW9ucyx0aGVtZTpQU1BERktpdC5UaGVtZS5EQVJLLHVpOntcbi8vdGhpcyBjb21wbGV0ZXMgYW4gZXhhbXBsZSBkb25lIGluIHZpcnR1YWwgQlVJIHdvcmtzaG9wIHdpdGggUml0ZXNoXG5bSW50ZXJmYWNlcy5UaHVtYm5haWxzXTooe3Byb3BzOnByb3BzfSk9Pih7Y29udGVudDpjcmVhdGVCbG9jayhSZWNpcGVzLlRodW1ibmFpbHMscHJvcHMsKCh7dWk6dWl9KT0%252Be2NvbnN0IHRodW1ibmFpbHM9dWkuZ2V0QmxvY2tCeUlkKCdib2R5Jykse3Byb3BzOnByb3BzfT10aHVtYm5haWxzLHVwZGF0ZWRJdGVtcz1wcm9wcy5pdGVtcy5tYXAoKGl0ZW09Pih7Li4uaXRlbSxsYWJlbDpgUGFnZTogJHtpdGVtLmxhYmVsfWB9KSkpO3JldHVybiB0aHVtYm5haWxzLnNldFByb3AoJ2l0ZW1zJyx1cGRhdGVkSXRlbXMpLHVpLmNyZWF0ZUNvbXBvbmVudCgpfSkpLmNyZWF0ZUNvbXBvbmVudCgpfSl9fSkudGhlbigoaW5zdGFuY2U9Pntjb25zb2xlLmxvZygnUFNQREZLaXQgbG9hZGVkIScpLGNvbnNvbGUubG9nKCdBUEkgZG9jczogaHR0cHM6Ly9wc3BkZmtpdC5jb20vYXBpL3dlYi8nKSxjb25zb2xlLmxvZygnR3VpZGVzOiBodHRwczovL3BzcGRma2l0LmNvbS9ndWlkZXMvd2ViLycpfSkpOyJ9)
- [Customize Document Editor modal buttons](https://www.nutrient.io/playground?p=eyJ2IjoxLCJqcyI6ImNvbnN0e2NyZWF0ZUJsb2NrOmNyZWF0ZUJsb2NrLEludGVyZmFjZXM6SW50ZXJmYWNlcyxSZWNpcGVzOlJlY2lwZXMsQ29yZTpDb3JlfT1QU1BERktpdC5VSTtQU1BERktpdC5sb2FkKHsuLi5iYXNlT3B0aW9ucyx0aGVtZTpQU1BERktpdC5UaGVtZS5EQVJLLHVpOntcbi8vdGhpcyBjb21wbGV0ZXMgYW4gZXhhbXBsZSBkb25lIGluIHZpcnR1YWwgQlVJIHdvcmtzaG9wIHdpdGggUml0ZXNoXG5bSW50ZXJmYWNlcy5Eb2N1bWVudEVkaXRvcl06KHtwcm9wczpwcm9wc30pPT4oe2NvbnRlbnQ6Y3JlYXRlQmxvY2soUmVjaXBlcy5Eb2N1bWVudEVkaXRvcixwcm9wcywoKHt1aTp1aX0pPT4odWkuZ2V0QmxvY2tCeUlkKCdjYW5jZWwnKS5zZXRQcm9wKCd2YXJpYW50JywnZXJyb3InKSx1aS5jcmVhdGVDb21wb25lbnQoKSkpKS5jcmVhdGVDb21wb25lbnQoKX0pfX0pLnRoZW4oKGluc3RhbmNlPT57Y29uc29sZS5sb2coJ1BTUERGS2l0IGxvYWRlZCEnKSxjb25zb2xlLmxvZygnQVBJIGRvY3M6IGh0dHBzOi8vcHNwZGZraXQuY29tL2FwaS93ZWIvJyksY29uc29sZS5sb2coJ0d1aWRlczogaHR0cHM6Ly9wc3BkZmtpdC5jb20vZ3VpZGVzL3dlYi8nKX0pKTsifQ%253D%253D)
- [Custom state in signature modal](https://www.nutrient.io/playground?p=eyJ2IjoxLCJqcyI6ImxldCBjb3VudD0wO2Z1bmN0aW9uIGNvdW50ZXIoKXtjb3VudCsrfWNvbnN0e2NyZWF0ZUJsb2NrOmNyZWF0ZUJsb2NrLEludGVyZmFjZXM6SW50ZXJmYWNlcyxSZWNpcGVzOlJlY2lwZXMsQ29yZTpDb3JlfT1QU1BERktpdC5VSTtQU1BERktpdC5sb2FkKHsuLi5iYXNlT3B0aW9ucyx0aGVtZTpQU1BERktpdC5UaGVtZS5EQVJLLHVpOntbSW50ZXJmYWNlcy5DcmVhdGVTaWduYXR1cmVdOih7cHJvcHM6cHJvcHN9KT0%252BKHtjb250ZW50OmNyZWF0ZUJsb2NrKFJlY2lwZXMuQ3JlYXRlU2lnbmF0dXJlLHByb3BzLCgoe3VpOnVpLHN0YXRlOnN0YXRlfSk9Pihcbi8vIEN1c3RvbWlzYXRpb24gY29kZSBnb2VzIGhlcmVcbnVpLmluc2VydEFmdGVyKCd0aXRsZScsY3JlYXRlQmxvY2soQ29yZS5BY3Rpb25CdXR0b24se2xhYmVsOnN0YXRlLmdldCgnY2xpY2tDb3VudCcpPz9jb3VudCx2YXJpYW50OidzdWNjZXNzJ30pKSx1aS5pbnNlcnRBZnRlcigndGl0bGUnLGNyZWF0ZUJsb2NrKENvcmUuQWN0aW9uQnV0dG9uLHtsYWJlbDonSW5jcmVtZW50JyxvblByZXNzOigpPT57Y291bnRlcigpLC8vIEluY3JlbWVudCBhbmQgbG9nIHRoZSBjb3VudGVyXG5zdGF0ZS5zZXQoJ2NsaWNrQ291bnQnLGNvdW50KX0sdmFyaWFudDonc2Vjb25kYXJ5JywnYXJpYS1sYWJlbCc6J0luY3JlbWVudCd9KSksdWkuY3JlYXRlQ29tcG9uZW50KCkpKSkuY3JlYXRlQ29tcG9uZW50KCl9KX19KS50aGVuKChpbnN0YW5jZT0%252Be2NvbnNvbGUubG9nKCdQU1BERktpdCBsb2FkZWQhJyksY29uc29sZS5sb2coJ0FQSSBkb2NzOiBodHRwczovL3BzcGRma2l0LmNvbS9hcGkvd2ViLycpLGNvbnNvbGUubG9nKCdHdWlkZXM6IGh0dHBzOi8vcHNwZGZraXQuY29tL2d1aWRlcy93ZWIvJyl9KSk7In0%253D)

---

## AI & Document Generation

- [AI Document Assistant](https://github.com/PSPDFKit/ai-document-assistant-demo) — Natural language PDF interaction with AI
- [Document Generator (Vanilla JS)](./web/document-generator-vanillajs/) — Step-by-step PDF generation with Document Authoring SDK

---

## Mobile SDKs

### iOS
[iOS Catalog](https://github.com/PSPDFKit/pspdfkit-ios-catalog) — Comprehensive iOS SDK examples

### Android
[Android Catalog](https://github.com/PSPDFKit/pspdfkit-android-catalog) — Comprehensive Android SDK examples

---

## Desktop SDKs

### Windows
[WinUI3 Integration](./windows/pspdfkit-with-winui3) — Using Web SDK in WinUI3 apps with WebView2

---

## Cross-Platform SDKs

| Platform | Example Repository | Description |
|----------|-------------------|-------------|
| **React Native** | [Catalog](https://github.com/PSPDFKit/react-native/tree/master/samples/Catalog) | Cross-platform mobile development |
| **MAUI** | [Catalog](https://github.com/PSPDFKit/pspdfkit-maui-catalog) | .NET Multi-platform App UI |
| **Flutter** | [Sample](https://github.com/PSPDFKit/pspdfkit-flutter/tree/master/example) | Flutter SDK integration |
| **.NET Android** | [Samples](https://github.com/PSPDFKit/dotnet-pdf-library-for-android/tree/main/samples) | C# bindings for Android |
| **.NET iOS** | [Samples](https://github.com/PSPDFKit/dotnet-pdf-library-for-ios/tree/main/Samples) | C# bindings for iOS |

---

## Additional Resources

- [Nutrient Documentation](https://www.nutrient.io/guides/)
- [Web SDK API Reference](https://www.nutrient.io/api/web/)
- [Support Portal](https://support.nutrient.io/hc/en-us/requests/new)
- [Discord Community](https://discord.gg/Z754Pfb8bD)

---

## License & Disclaimer

Examples in this repository are provided for inspiration and are **not officially supported**.
See [DISCLAIMER.md](./DISCLAIMER.md) for details.

For production support, contact [Nutrient Support](https://support.nutrient.io/hc/en-us/requests/new).
