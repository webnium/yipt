/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import {Offset, PDFDocument, TemplateElement} from "../index";
import {Evaluators as Types} from "../evaluators";

interface ForeachElement extends TemplateElement {
    type: "foreach";
    items: any[];
}

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset: Offset, bindings: any) {
    const foreachElement = content as ForeachElement;

    const items = Types.array(foreachElement.items, vars);

    const l = items.length;
    const stack: ForeachStack = bindings.loops || [];
    const foreach = {total: l, index: undefined, count: undefined, item: undefined};

    stack.unshift(foreach);

    for (let i = 0; i < l; i++) {
        foreach.index = i;
        foreach.count = i + 1;
        foreach.item = items[i];
        await this.renderContent(doc, foreachElement.content, vars, offset, {loops: stack, foreach});
    }

    stack.shift();
};

interface Foreach {
    total: number;
    count: number;
    index: number;
    item: any;
}

type ForeachStack = Array<Foreach>;