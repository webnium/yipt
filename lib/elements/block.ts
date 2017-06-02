/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {Content, PDFDocument, TemplateElement} from "../index";
import Types, {bind} from "../evaluators";
import deepAssign = require("deep-assign");

interface BlockElement extends TemplateElement {
    type: "block";
    content: Content[];
}

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset, bindings: any) {
    const element = content as BlockElement;
    const contents = element.content;

    const contentOffset = {
        top: element.top ? offset.top + (Types.number(element.top, vars, bind(doc, bindings, offset)) || 0) : doc.y,
        left: offset.left + (Types.number(element.left, vars, bind(doc, bindings, offset)) || 0)
    };

    await this.renderContents(doc, contents, vars, contentOffset, bindings);
};
