# Detecting When the PSPDFKit UI Loads

## Introduction

When working with Nutrient Web SDK, you may need to detect when the UI has fully loaded to determine setting some configurations in your application accordingly.


## Proposed Workaround

While we don't have a specific event for UI loading completion, there are two effective approaches to detect when the UI has loaded:

1. Using [renderPageCallback](https://www.nutrient.io/api/web/PSPDFKit.Configuration.html#renderPageCallback):

   ```javascript
   let globalInstance;
   PSPDFKit.load({
     ...baseOptions,
     renderPageCallback: function (ctx, pageIndex, pageSize) {
       if (pageIndex === globalInstance.totalPageCount - 1) {
         alert("last page loaded");
       }
     }
   }).then((instance) => {
     globalInstance = instance;
   });
   ```

   - This method allows you to know when each page has been rendered.

2. Using a MutationObserver:

   ```javascript
    function attachPageLoadObserver() {
        const pageClassSelector = 'PSPDFKit-Page'

    // Select the entire DOM for observing:
    const target = document.querySelector('body');

    // Create a new observer instance:
    const observer = new MutationObserver(function() {
        if (document.getElementsByClassName(pageClassSelector)) {
            console.log("Page loaded!");
             // Do something ...
            observer.disconnect();
        }
     });

    // Start the observer
        observer.observe(target, { childList: true });
    }
    …
    attachPageLoadObserver()
    …
   ```

- This approach listens for changes in the DOM, specifically for the addition of elements with the `PSPDFKit-Page` class.
- It's a more general method that doesn't rely on Nutrient-specific APIs.

## Choosing the Right Approach

- Use `renderPageCallback` if you need to know when specific pages are rendered or if you prefer using Nutrient's built-in APIs.
- Use the `MutationObserver` approach if you want a more general solution that doesn't depend on Nutrient-specific callbacks.


## Summary

While PSPDFKit Web SDK doesn't provide a direct event for UI loading completion, you can use either the `renderPageCallback` or a `MutationObserver` to detect when the UI has loaded. Choose the method that best fits your specific use case and application architecture.

