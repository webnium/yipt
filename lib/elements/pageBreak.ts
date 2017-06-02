/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {PDFDocument, TemplateElement} from "../index";
import deepAssign = require("deep-assign");

interface AddPageElement extends TemplateElement {
    type: "add-page";
    options: PageOptions;
}

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset, bindings: any) {
    const addPageElement = content as AddPageElement;
    doc.addPage(addPageElement.options);

    offset.top = doc.y;
    doc.x = offset.left;
};

interface PageOptions {
    size?: [number, number] | string;
    layout?: "portrait" | "landscape";
    margin?: number;
    margins?: { top: number, left: number; bottom: number; right: number; };
}
