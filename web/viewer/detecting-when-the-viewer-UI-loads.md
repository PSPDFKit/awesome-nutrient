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
   - [Nutrient Playground](https://playground.pspdfkit.com/?p=eyJ2IjoxLCJqcyI6Ii8vIERldGVjdGluZyBXaGVuIHRoZSBQU1BERktpdCBVSSBMb2Fkc1xuXG4vKipcbiAqIEluaXRpYWxpemVzIFBTUERGS2l0IHdpdGggcGFnZSByZW5kZXJpbmcgbm90aWZpY2F0aW9ucyBmb3IgZmlyc3QgYW5kIGxhc3QgcGFnZXMsXG4gKiBpbmNsdWRpbmcgc3RhY2sgdHJhY2UgaW5mb3JtYXRpb24gdG8gdHJhY2sgY2FsbCBzb3VyY2VzXG4gKi9cblxuLy8gR2xvYmFsIHZhcmlhYmxlIHRvIHN0b3JlIFBTUERGS2l0IGluc3RhbmNlXG5sZXQgZ2xvYmFsSW5zdGFuY2U7XG5cblBTUERGS2l0LmxvYWQoe1xuICAuLi5iYXNlT3B0aW9ucyxcbiAgdGhlbWU6IFBTUERGS2l0LlRoZW1lLkRBUkssXG5cbiAgLy8gQ2FsbGJhY2sgdGhhdCBydW5zIHdoZW4gZWFjaCBwYWdlIGlzIHJlbmRlcmVkXG4gIHJlbmRlclBhZ2VDYWxsYmFjazogZnVuY3Rpb24gKGN0eCwgcGFnZUluZGV4LCBwYWdlU2l6ZSkge1xuICAgIC8vIEdldCB0aGUgY2FsbGluZyBmdW5jdGlvbiBuYW1lIHVzaW5nIEVycm9yIHN0YWNrXG4gICAgY29uc3QgZ2V0Q2FsbGVyRnVuY3Rpb24gPSAoKSA9PiB7XG4gICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGNvbnN0IGNhbGxlckxpbmUgPSBlcnIuc3RhY2suc3BsaXQoXCJcXG5cIilbM107IC8vIFNraXAgY3VycmVudCBmdW5jdGlvbiBhbmQgcmVuZGVyUGFnZUNhbGxiYWNrXG4gICAgICBjb25zdCBjYWxsZXJGdW5jdGlvbiA9IGNhbGxlckxpbmUgPyBjYWxsZXJMaW5lLnRyaW0oKSA6IFwiVW5rbm93biBjYWxsZXJcIjtcbiAgICAgIHJldHVybiBjYWxsZXJGdW5jdGlvbjtcbiAgICB9O1xuXG4gICAgLy8gU2hvdyBhbGVydCB3aXRoIGNhbGxlciBpbmZvIHdoZW4gZmlyc3QgcGFnZSBpcyByZW5kZXJlZFxuICAgIGlmIChwYWdlSW5kZXggPT09IDApIHtcbiAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckZ1bmN0aW9uKCk7XG4gICAgICBhbGVydChgRmlyc3QgcGFnZSBsb2FkZWRcXG5DYWxsZWQgYnk6ICR7Y2FsbGVyfWApO1xuICAgIH1cblxuICAgIC8vIFNob3cgYWxlcnQgd2l0aCBjYWxsZXIgaW5mbyB3aGVuIGxhc3QgcGFnZSBpcyByZW5kZXJlZFxuICAgIGlmIChwYWdlSW5kZXggPT09IGdsb2JhbEluc3RhbmNlLnRvdGFsUGFnZUNvdW50IC0gMSkge1xuICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyRnVuY3Rpb24oKTtcbiAgICAgIGFsZXJ0KGBMYXN0IHBhZ2UgbG9hZGVkXFxuQ2FsbGVkIGJ5OiAke2NhbGxlcn1gKTtcbiAgICB9XG4gIH0sXG59KS50aGVuKChpbnN0YW5jZSkgPT4ge1xuICAvLyBTdG9yZSBpbnN0YW5jZSByZWZlcmVuY2UgZ2xvYmFsbHlcbiAgZ2xvYmFsSW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuICAvLyBMb2cgc3VjY2VzcyBtZXNzYWdlXG4gIGNvbnNvbGUubG9nKFwiTnV0cmllbnQgbG9hZGVkIVwiKTtcbn0pO1xuIiwic2V0dGluZ3MiOnsiZmlsZU5hbWUiOiJzY2llbnRpZmljLnBkZiIsImp3dCI6eyJwZXJtaXNzaW9ucyI6WyJyZWFkLWRvY3VtZW50Iiwid3JpdGUiXSwidXNlcklkIjoicmFuZG9tYkpveWtJWHlXUCIsImxheWVyIjoicmFuZG9tZmtCR3J4SWNUUyJ9fSwiY3NzIjoiLyogQWRkIHlvdXIgQ1NTIGhlcmUgKi9cbiIsIm1vZGUiOiJzdGFuZGFsb25lIn0%253D) using renderPageCallback().

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

