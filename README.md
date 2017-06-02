# Yipt: Yipt is PDF Template

Yipt is a YAML based template engine generates PDF document.

Yipt uses [PDFKit](http://pdfkit.org/) for PDF generation and [JSONata](http://jsonata.org/) for template variables.
## Install

```bash
npm i yipt
```

## Usage

### CLI

```bash
yipt [options] <template> [output]
```

#### options

<dl>
<dt>-p, --prams &lt;file&gt;</dt>
<dd>A json or yaml file includes template variables.</dd>
</dl>

#### args

<dl>
<dt>template</dt>
<dd>Path to template file.</dd>
<dt>output</dt>
<dd>Path to output file. STDOUT will be used when "-" is supplied or ommitted.
</dl>

#### Example

```bash
yipt -p params.yml my-template.yml out.pdf
```

### in JavaScript or TypeScript

```typescript
import yipt from "yipt";
import * as PDFKit from "pdfkit";

const doc = new PDFKit();
const templateVariables = { foo: "template variables" };

yipt.render(doc, "/path/to/template.yml", templateVariables);
// yipt.render returns Promise<void>
```

It's also possible to create new Yipt instance.

```typescript
import { Yipt } from "yipt";

const yipt = new Yipt();
```

## Template

### Absatract
Yipt template is a YAML file whose root object has `yipt` property, which is a Yipt object.
And Yipt object has `content` property, which is an array of Element object or string.
If element of `content` is a string, it is treated as TextElement.

Yipt renders Elements in order of array.

Element object is one of:

Element name|Description
---|---
TextElement| Renders text.
ImageElement| Renders JPEG/PNG image.
VectorElement| Renders vector graphics.
FontElement| Setup font for text.
PageBreakElement|Insert page break.
BlockElement|Groups elements and control offset.
CaseElement|Logical flow control in similar way to SQL's CASE syntax.
ForeachElement|Loop flow control.

### Variable evaluation
Yipt supports template variables.
Many of parameters in template are evaluated with template variables using [JSONata](http://jsonata.org/).

Values in template other than text value such as content property of TextElement, are evaluated as a JSONata expression.
Of course, you can also specify raw values instead of JSONata expressions for properties.
Types of properties documented in this doc, are types of evaluated value.

On the other hand, in text, JSONata expression is wrapped with `"{"` and `"}"`.
For escape `"\"` is available.

#### Example

template:
```yaml
yipt:
  version: "1.0"
  content:
    - type: text
      top: myVariableForTop
      left: myObject.left
      content: This text placed on (myObject.left, myVariableForTop).
```
variables:
```yaml
{
  myVariableForTop: 10,
  myObject: { left: 20 },
}   
```
Then, "This text placed on (myObject.left, myVariableForTop)." is rendered at (20, 10).

template:
```yaml
yipt:
  version: "1.0"
  content:
    - |
    Hello {foo.bar}! You can also use JSONata expression a + 1 = {a + 1}.
    \{but this never evaluted} because \{ is escaped.
    Then "\\\{" and "\\\\" is rendered as "\{" and "\\".
```
variables:
```yaml
{
  foo: { bar: "world" },
  a = 2
}
```

output:
```
    Hello world! You can also use JSONata expression a + 1 = 3.
    {but this never evaluted} because { is escaped.
    Then "\{" and "\\" is rendered as "{" and "\".
```

### Spec

#### Yipt Object

Property| Type | Description
---|:---:|---
version|string|fixed `"1.0"`. Version of template format.
content|Content[]| List of content.

##### Content
`Content` is one of `Element` or `string`.

#### TextElement

Property| Type | Description
---|:---:|---
content|string|The text to print with variable reference.
top|number|The position in y axis.
left|number|The position in x axis.
options|TextOptions|Options for text rendering.

##### TextOptions

See [Text in PDFKit](http://pdfkit.org/docs/text.html) for more detail.

#### ImageElement

Property| Type | Description
---|:---:|---
src|string|Path to image(JPEG/PNG) file.
top|number|The position in y axis.
left|number|The position in x axis.
options|ImageOptions|Options for text rendering.

##### ImageOptions

See [Images in PDFKit](http://pdfkit.org/docs/images.html) for more detail.

#### VectorElement

Property| Type | Description
---|:---:|---
paths|VectorPath[]|Ordered array of vector paths.
top|number|The position in y axis.
left|number|The position in x axis.
render|"stroke" &VerticalLine; "fill" &VerticalLine; "fillAndStroke"| How render the path.
lineWidth|number|Line width. lineWidth 0 means hair line.
cap|"butt" &VerticalLine; "round" &VerticalLine; "square"|Line cap.
join|"miter" &VerticalLine; "round" &VerticalLine; "bevel"|Line join.
dash|DashParameter|Line dash style.
color|string|Line color. It allows a hex color string, or use any of the named CSS colors.
fillColor|string|Fill color. It allows a hex color string, or use any of the named CSS colors.
windingRule|"even-odd" &VerticalLine; "non-zero"|Winding rules define how a path is filled.
opacity|number|Opacity of vector graphic. It value could be 0 to 1.

##### VectorPath

Type property of VectorPath could be one of:
- line
- verticalLine
- horizontalLine
- quadraticCurve
- bezierCurve
- move
- rect
- roundedRect
- ellipse
- circle
- polygon

The first 5 types(lines and curves) use end point of previous path as start point.(this means they connect previous path).
Use `move` for change start point of them if you want.
(0, 0) is used as start position if one of them placed in the first of paths array.
Please note that end points of the last 5 types(shapes) is undefined.

VectorPath object has additional properties for each types.

`doc.y` is set to maximum y of graphics after rendering vector. 

###### line

Property|Type|Description
---|:---:|---
to|[number, number]|Line end point in [x, y].

###### verticalLine & horizontalLine

Property|Type|Description
---|:---:|---
length|number|Line length.

###### quadraticCurve

Property|Type|Description
---|:---:|---
to|[number, number]|Curve end point in [x, y].
anchor|[number, number]|Anchor point in [x, y].

###### bezierCurve

Property|Type|Description
---|:---:|---
to|[number, number]|Curve end point in [x, y].
anchors|[number, number, number, number]|Anchor points in [x1, y1, x2, y2].

###### move
Property|Type|Description
---|:---:|---
to|[number, number]|Move to [x, y].

###### rect
Property|Type|Description
---|:---:|---
pos|[number, number]|Position of rectangle in [left, top].


###### roundedRect

Property|Type|Description
---|:---:|---
pos|[number, number]|Position of rectangle in [left, top].
cornerRadius|number|Radius of rounded corner.

###### ellipse
Property|Type|Description
---|:---:|---
center|[number, number]|Center coordinate in [x, y].
radiusX|number|Radius of x axis.
radiusY|number|Radius of y axis.

###### circle
Property|Type|Description
---|:---:|---
center|[number, number]|Center coordinate in [x, y].

###### polygon
Property|Type|Description
---|:---:|---
vertices|number[]|Coordinates of vertices in [x1, y1, x2, y2, ...]

#### FontElement
You can set or register founts using FontElement.
Once fount is configured, it affects all text rendering (even where out of BlockElement) until another FontElement configures font.

Property| Type | Description
---|:---:|---
size|number|Set font size.
name|string|Font name to be used. Standard font name or registered font name.
src|string|Path to font file for register or temporally use.
family|string|Font family for TrueType Collection or Datafork TrueType font file. This property is only used with `src` property.
registerAs|string|Register font as this value name. This property requires `src` property.
setOnRegister|boolean|Whether setting font on register or not. This property is only used with `registerAs`.
 Default is `false` unless `size` property is set together.

#### PageBreakElement
Property| Type | Description
---|:---:|---
options|PageOptions|Options for new page after page break.

NOTE: PageOptions is never evaluated with variables.

##### PageOptions
Property| Type | Description
---|:---:|---
size|[number, number] &VerticalLine; string|Page size in [width, height] or string such as "A4".
layout|"portrait" &VerticalLine; "landscape"|Page layout. Default is "portrait".
margins|Margins|Margins of the new page.
margin|number|Syntax sugar for margins if all margins is the same.

###### Margins

Property| Type | Description
---|:---:|---
top|number|The top margin.
left|number|The left margin.
bottom|number|The bottom margin.
right|number|The right margin.


#### BlockElement

Property| Type | Description
---|:---:|---
top|number|Top position of the block.
left|number|Left position of the block.
content|Content[]| List of content.

#### CaseElement
Property| Type | Description
---|:---:|---
conditions|CaseCondition[]|Ordered list of conditions.
else|Content|This content will be rendered when any conditions isn't satisfied.

##### CaseCondition
Property| Type | Description
---|:---:|---
when|boolean|The condition to be satisfied. Usually this is JSONata condition expression.
content|Content|This content will be rendered if condition is satisfied.

#### ForeachElement
Property| Type | Description
---|:---:|---
items|any[]|Items to be iterate.
content|Content|This will be rendered foreach loop.

In the loop, special variables are available.

##### Loop variables
Accessor|Type|Description
---|:---:|---
$foreach|Foreach|Current loop.
$foreach.total|number|Total number of loop items.
$foreach.index|number|Current item index.
$foreach.count|number|The loop count.
$foreach.item|any|Current item.
$loops|Foreach[]|`$loops[0]` is the same as `$foreach`. `$loops[1]` is one outer loop.

## Example

You can see example in [tests directory](tests/).
