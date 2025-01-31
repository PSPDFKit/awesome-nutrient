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
   - [Nutrient Playground](https://playground.pspdfkit.com/?p=eyJ2IjoxLCJqcyI6Ii8vIERldGVjdGluZyBXaGVuIHRoZSBQU1BERktpdCBVSSBMb2Fkc1xuXG5sZXQgZ2xvYmFsSW5zdGFuY2U7XG5cblBTUERGS2l0LmxvYWQoe1xuICAuLi5iYXNlT3B0aW9ucyxcbiAgdGhlbWU6IFBTUERGS2l0LlRoZW1lLkRBUkssXG5cbiAgLy8gQ2FsbGJhY2sgdGhhdCBydW5zIHdoZW4gZWFjaCBwYWdlIGlzIHJlbmRlcmVkXG4gIHJlbmRlclBhZ2VDYWxsYmFjazogZnVuY3Rpb24gKGN0eCwgcGFnZUluZGV4LCBwYWdlU2l6ZSkge1xuICAgIC8vIFNob3cgYWxlcnQgd2hlbiBmaXJzdCBwYWdlIGlzIHJlbmRlcmVkXG4gICAgaWYgKHBhZ2VJbmRleCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coXCJGaXJzdCBwYWdlIGxvYWRlZFwiKTtcbiAgICB9XG5cbiAgICAvLyBTaG93IGFsZXJ0IHdoZW4gbGFzdCBwYWdlIGlzIHJlbmRlcmVkXG4gICAgaWYgKHBhZ2VJbmRleCA9PT0gZ2xvYmFsSW5zdGFuY2UudG90YWxQYWdlQ291bnQgLSAxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkxhc3QgcGFnZSBsb2FkZWRcIik7XG4gICAgfVxuICB9LFxufSkudGhlbigoaW5zdGFuY2UpID0%252BIHtcbiAgLy8gU3RvcmUgaW5zdGFuY2UgcmVmZXJlbmNlIGdsb2JhbGx5XG4gIGdsb2JhbEluc3RhbmNlID0gaW5zdGFuY2U7XG5cbiAgLy8gTG9nIHN1Y2Nlc3MgbWVzc2FnZVxuICBjb25zb2xlLmxvZyhcIk51dHJpZW50IGxvYWRlZCFcIik7XG59KTsiLCJzZXR0aW5ncyI6eyJmaWxlTmFtZSI6InNjaWVudGlmaWMucGRmIn0sImNzcyI6Ii8qIEFkZCB5b3VyIENTUyBoZXJlICovXG4iLCJtb2RlIjoic3RhbmRhbG9uZSJ9) using renderPageCallback().


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

