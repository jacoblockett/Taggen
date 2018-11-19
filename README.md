# Nodulator

This is a quick, modular and chainable way to create tag reliant files such as html or xml.

```shell
npm install nodulator
```

# How to use

### Table of Contents:
* [Initializing](#initializing)
* [Making Your First Parent Node](#making-your-first-parent-node)
* [Adding Attributes](#adding-attributes)
* [Setting Inner Text](#setting-inner-text)
* [Making a family](#making-a-family)
  * [Children](#children)
  * [Siblings](#siblings)
* [What in the world did I just make?](#what-in-the-world-did-i-just-make?)
* [Committing](#committing)
* [Writing a File](#writing-a-file)
* [Caveats/Pitfalls](#caveats/pitfalls)
* [Examples](#examples)
* [Possible Feature Updates](#possible-feature-updates)
* [Feature Requests](#feature-requests)


## Initializing

In order to use Nodulator, you'll have to initialize it first:

```javascript
const Nodulator = require('nodulator')

const nodulator = new Nodulator([type <string>])
```

Currently accepted types are `'html'` and `xml`. If you don't wish to use either of these, simply leave it blank.

## Making Your First Parent Node

#### Syntax

```javascript
nodulator.parent(name <string>)
```

Name is anything you want to call the parent tag. There are no restrictions other than it needs to be a string value.

#### Input

```javascript
const nodulator = new Nodulator()

nodulator.parent('Parent')
```

#### Output

```xml
<Parent></Parent>
```

## Adding Attributes

#### Syntax

```javascript
nodulator.attr(key <string>, value <string>)
```

Attributes take two strings, the key which will be evaluated as the left-hand assignment, and the value as the right-hand assignment.

#### Input

```javascript
const nodulator = new Nodulator()

nodulator
  .parent('Parent')
  .attr('key', 'value')
```

#### Output

```xml
<Parent key="value"></Parent>
```

## Setting Inner Text

#### Syntax

```javascript
nodulator.inner(text <string>)
```

The inner function takes a text value. This can be anything as long as it's a string value.

#### Input

```javascript
const nodulator = new Nodulator()

nodulator
  .parent('Parent')
  .inner('Some inner text')
```

#### Output

```xml
<Parent>Some inner text</Parent>
```

## Making a family

### Children:
___

#### Syntax

```javascript
nodulator.child(name <string>)
```

Same as tags created by the .parent() function, this function accepts a string value for however you'd like to name the child.

#### Input

```javascript
const nodulator = new Nodulator()

nodulator.child('Child')
```

#### Output

```xml
<Child></Child>
```

### Siblings:
___

#### Syntax

```javascript
nodulator.sibling(name <string>[, id <number>])
```

Same as tags created by the .parent() function, this function accepts a string value for however you'd like to name the sibling.

The special thing about siblings is they accept an `id` argument. If this argument is provided, the sibling will be attached to whichever tag is associated to that unique `id`. On top of that, the current node depth will be changed to match the recently created sibling's depth.

#### Input

```javascript
const nodulator = new Nodulator()

nodulator
  .sibling('Sibling1')
  .sibling('Sibling2', 5)
```

#### Output

```xml
<Sibling1></Sibling1>
<Sibling2></Sibling2> <!--This will be attached to the tag with a unique id value of 5-->
```

## What in the world did I just make?

#### Syntax

```javascript
nodulator.preview()
```

If you're ever lost and confused on the structure that you've created, you need to know the unique id for a specific tag, or you're just plain curious, all you have to do is call the `.preview()` method. It will print an object with some current running information wherever you decide to run it.

## Committing

#### Syntax

```javascript
nodulator.commit()
```

When you're satisfied with what you've created and you'd like to generate a readable structure that can be appended to a file, simply call the `.commit()` method. This method is required before you attempt to write to a file.

## Writing a File

#### Syntax

```javascript
nodulator.write(path <string>)
```

This function takes a path string argument and will asynchronously write your created data to a file of your choosing. Be sure to `.commit()` before attempting to write to a file, otherwise an error will be thrown.

## Caveats/Pitfalls

Still working on this section - standby for an update.

* Siblings cannot be created on a parent tag. Parents are the highest level, and simply calling `.parent()` will create a sibling at the parent level.

## Examples

Here's an example of a simple HTML template:

#### Input

```javascript
const nodulator = new Nodulator('html')

nodulator
  .parent('html')
  .child('head')
  .child('script')
  .sibling('style')
  .sibling('body', 1)
  .child('div')
  .attr('id', 'container')
  .attr('class', 'one')
  .child('xmp')
  .inner(`I'm the first <p> tag`)
  .sibling('div', 5)
  .attr('id', 'container2')
  .attr('class', 'two')
  .child('xmp')
  .inner(`I'm the second <p> tag`)
```

#### Output

```html
<!DOCTYPE html>
<html>
  <head>
    <script></script>
    <style></style>
  </head>
  <body>
    <div id="container" class="one">
      <xmp>I'm the first <p> tag</xmp>
    </div>
    <div id="container2" class="two">
      <xmp>I'm the second <p> tag</xmp>
    </div>
  </body>
</html>
```

## Possible Feature Updates

* `.attr()` - Adding the ability to pass in an iterable or object rather than two string values

* Creating pre-defined templates such as an HTML template or an XML template through `.html()`, etc.

## Feature Requests

Go here - https://goo.gl/forms/1fpZ6RYw0V4qbHBB3 - to submit a feature request!
