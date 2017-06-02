/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import * as PDFKit from "pdfkit";
import * as sinon from "sinon";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import yipt from "../../lib/index";

chai.should();
chai.use(sinonChai);

describe("case with sugar syntax for text", () => {
    const cases = [
        {
            vars: {foo: 2},
            expected: "foo is larger than 0."
        },
        {
            vars: {bar: {isTrue: true}},
            expected: "bar.isTrue is true."
        },
        {
            vars: {foo: 0, bar: {isTrue: true}},
            expected: "bar.isTrue is true."
        },
        {
            vars: {},
            expected: "It doesn't match to any case."
        }
    ];

    cases.forEach(cond =>
        it(`should render text "${cond.expected}" in case`, async () => {
            const doc = new PDFKit();
            sinon.spy(doc, "text");
            await yipt.render(doc, __dirname + "/template.yml", cond.vars);

            doc.text.should.calledWith(cond.expected);
        })
    );
});
