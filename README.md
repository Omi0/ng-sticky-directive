# Angular 6 Sticky Directive

This Directive allows you to stick elements to top as you scroll. The main differentce betweeen similar directives. Is that this one supports multiple DOM elements. As soon as sonsequent sticky element stuck, the previous unstuck.


## System Requirements

* Angular 6

## How To Use

1. Import the module and put it into Import section of NgModule
```
import { StickyModule } from 'sticky.module.ts'
```

Simply add sticky decorator to the element. Additionally you can specify element config

```
<div sticky [stickyConfig]="{stuckClass: 'custom-sticky-style', useDefaultStyle: false}"></div>
```
