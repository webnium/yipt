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

describe("text-with-options-using-variables", () => {
    it("should evaluate variables in options.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");

        const options = {
            lineBreak: true,
            width: 500,
            height: 700,
            align: "justify",
            ellipsis: "――",
            columns: 2,
            columnGap: 16,
            indent: 10,
            paragraphGap: 16,
            lineGap: 11,
            wordSpacing: 30,
            characterSpacing: 3,
            fill: false,
            stroke: true,
            link: "https://example.com/",
            underline: false,
            strike: false,
            continued: false,
            features: ["foo"]
        };

        await yipt.render(doc, __dirname + "/template.yml",
            {
                top: 10,
                left: 20,
                text: options
            }
        );

        doc.text.should.have.been.calledWith("text with top, left and options.", 20, 10,
            options
        );
    });

    it("should evaluate array of expression.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");

        await yipt.render(doc, __dirname + "/features-as-array-of-expression.yml",
            {
                top: 10,
                left: 20,
                feature: "foo",
                some: {
                    tags: ["tag"]
                }
            }
        );

        doc.text.should.have.been.calledWith("text with top, left and options.", 20, 10, {features: ["foo", "tag", "bar"]});
    });
});
