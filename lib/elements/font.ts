/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {PDFDocument, TemplateElement} from "../index";
import {isNullOrUndefined} from "util";

interface FontElement extends TemplateElement {
    type: "font";
    size?: number;
    registerAs?: string;
    family?: string;
    src?: string;
    name?: string;
    setOnRegister?: boolean;
}

export = async function (doc: PDFDocument, content: TemplateElement) {
    const font = content as FontElement;

    if (font.name) {
        doc.font(font.name);
    } else if (font.registerAs) {
        doc.registerFont(font.registerAs, font.src, font.family);

        if (!font.setOnRegister && isNullOrUndefined(font.size)) {
            return;
        }

        doc.font(font.registerAs);
    } else if (font.src) {
        doc.font(font.src, font.family);
    }

    if (font.size) {
        doc.fontSize(font.size);
    }
};
