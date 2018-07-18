/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {Offset, PDFDocument, TemplateElement} from "../index";
import Types, {bind} from "../evaluators";
import {isNumber} from "util";

interface ListElement extends TemplateElement {
    type: "list";
    items: any[];
    content: string;
    options?: any;
}

const OPTIONS = {
    lineBreak: Types.boolean,
    width: Types.number,
    height: Types.number,
    align: Types.enum(["justify", "left", "center", "right"]),
    ellipsis: Types.string,
    columns: Types.number,
    columnGap: Types.number,
    indent: Types.number,
    paragraphGap: Types.number,
    lineGap: Types.number,
    wordSpacing: Types.number,
    characterSpacing: Types.number,
    fill: Types.boolean,
    stroke: Types.boolean,
    link: Types.string,
    underline: Types.boolean,
    strike: Types.boolean,
    continued: Types.boolean,
    features: Types.stringArray,
    bulletRadius: Types.number,
    textIndent: Types.number,
    bulletIndent: Types.number,
    listType: Types.string
};

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset: Offset, _bindings: any) {
    const element = content as ListElement;
    const bindings = bind(doc, _bindings, offset);
    const text = Types.array(element.content, vars);

    const options = Types.object(OPTIONS)(element.options, vars, bindings);
    const top = Types.number(element.top, vars, bindings);
    const left = Types.number(element.left, vars, bindings);

    if (isNumber(top) && isNumber(left)) {
        doc.list(text, left + offset.left, top + offset.top, options);
    } else if (isNumber(top)) {
        doc.list(text, undefined, top + offset.top, options);
    } else if (isNumber(left)) {
        doc.list(text, left + offset.left, undefined, options);
    } else if (options !== undefined) {
        doc.list(text, options);
    } else {
        doc.list(text);
    }

};
