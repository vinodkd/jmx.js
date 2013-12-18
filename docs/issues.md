issues
======

| Issue # | Type | Description | Status | Assigned to |
|---------|:----:|-------------|:------:|-------------|
| 1 | bug | jmx.js:toggleAttrs() assumes that the div with jmxelement (ie the one with ref to model) is 3 levels up. This is true for the default templates, but need not be true for templates in the future. This logic needs to be made generic as noted in the journal of Nov 26 | Wont fix for v 1.0 | vinodkd |
| 2 | feature request | Autosave files as they're edited | Not started | |
| 3 | feature request | when loading the jmx file, if responsexml is null, try to read responseText and parse it as xml | Not started | |
| 4 | task | change the code in jmx.js from a nested function style to a flat style to avoid a performance hit | Not started | |
| 5 | task | Add exception handling and improve error handling in general | Not started | |
| 6 | task | Put correct values in ThreaGroup.tmpl | Not started | |
| 7 | feature request | Move the toggles out of the templates and make the template only denote the location of the toggle, not its look and feel  | Not started | |
