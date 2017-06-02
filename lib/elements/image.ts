/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {Offset, PDFDocument, TemplateElement} from "../index";
import Types, {bind} from "../evaluators";
import {isNumber} from "util";

interface ImageElement extends TemplateElement {
    type: "image";
    src: string;
    options?: any;
}

const OPTIONS = {
    width: Types.number,
    height: Types.number,
    scale: Types.number,
    fit: Types.numberArray
};

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset: Offset, _bindings: any) {
    const element = content as ImageElement;
    const bindings = bind(doc, _bindings, offset);
    const src = Types.text(element.src, vars);

    const options = Types.object(OPTIONS)(element.options, vars, bindings);
    const top = Types.number(element.top, vars, bindings);
    const left = Types.number(element.left, vars, bindings);

    if (isNumber(top) && isNumber(left)) {
        doc.image(src, left + offset.left, top + offset.top, options);
    } else if (isNumber(top)) {
        doc.image(src, undefined, top + offset.top, options);
    } else if (isNumber(left)) {
        doc.image(src, left + offset.left, undefined, options);
    } else if (options !== undefined) {
        doc.image(src, options);
    } else {
        doc.image(src);
    }

};
