/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import * as PDFKit from "pdfkit";
import * as jsYaml from "js-yaml";
import {readFile} from "sb-fs";
import * as requireGlob from "require-glob";
import {TemplateFileError} from "./errors/TemplateFileError";
import {satisfies} from "semver";

const pkg = require("../package.json");

export type PDFDocument = typeof PDFKit;
export class Yipt {
    readonly elementHandlers: ElementHandlerHash;

    constructor() {
        this.elementHandlers = requireGlob.sync(__dirname + "/elements/*.js");
    }

    async render(doc: PDFDocument, templateFile: string, vars?: any, offset?: Offset) {
        const template = await this.loadTemplate(templateFile);

        await this.renderContents(doc, template.yipt.content, vars || {}, offset || {top: doc.y, left: doc.x}, {});
    }

    private async renderContents(doc: PDFDocument, contents: TemplateElement[], vars: any, offset: Offset, bindings: any) {
        const l = contents.length;
        doc.x = offset.left;
        doc.y = offset.top;

        let maxY = doc.y;
        for (let i = 0; i < l; i++) {
            await this.renderContent(doc, contents[i], vars, offset, bindings);

            maxY = Math.max(maxY, doc.y);
        }

        doc.x = offset.left;
        doc.y = maxY;
    }

    private async renderContent(doc: PDFDocument, content: Content, vars: any, offset: Offset, bindings: any) {
        // syntax sugar.
        if (typeof content === "string") {
            content = {
                type: "text",
                content: content
            };
        }

        if (!this.elementHandlers[content.type]) {
            throw new Error(`Unknown element type: "${content.type}"`);
        }

        await this.elementHandlers[content.type].call(this, doc, content, vars, offset, bindings);
    }

    private async loadTemplate(path: string): Promise<Template> {
        let template: any;
        try {
            template = jsYaml.safeLoad(await readFile(path));
        } catch (error) {
            throw new TemplateFileError(error, path);
        }

        if (typeof template.yipt === "undefined") {
            throw new TemplateFileError("file is not a yipt template.", path);
        }

        if (!satisfies(template.yipt.version + ".0", "~" + pkg.version)) {
            throw new TemplateFileError("yipt template version is incompatible.", path);
        }

        return template;
    }
}

export interface TemplateElement {
    type: string;
    top?: number | string;
    left?: number | string;
    content?: Content | Content[];
}

export type Content = TemplateElement | string;

export type ElementHandler = (doc: PDFDocument, content: TemplateElement, vars: {}, offset: Offset) => Promise<void>;

export interface Template {
    yipt: {
        version: "string";
        content: TemplateElement[];
    };
}

export interface ElementHandlerHash {
    [name: string]: ElementHandler;
}

export interface Offset {
    top: number;
    left: number;
}

export default new Yipt();
