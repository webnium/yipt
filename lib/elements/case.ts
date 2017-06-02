/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import {Content, PDFDocument, TemplateElement} from "../index";
import * as jsonata from "jsonata";

interface CaseElement extends TemplateElement {
    type: "case";
    conditions: CaseCondition[];
    else?: Content;
}

interface CaseCondition {
    when: string;
    content: Content;
}

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, bindings: any) {
    const caseElement = content as CaseElement;

    const conditions = caseElement.conditions;
    const l = conditions.length;
    for (let i = 0; i < l; i++) {
        const condition = conditions[i];
        if (jsonata(condition.when).evaluate(vars)) {
            await this.renderContent(doc, condition.content, vars, bindings);
            return;
        }
    }

    if (caseElement.else) {
        await this.renderContent(doc, caseElement.else, vars, bindings);
    }
};
