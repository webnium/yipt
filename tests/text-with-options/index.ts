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

describe("text-with-options", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml");

        doc.text.should.have.been.calledWith("text with top, left and options.", 20, 10, {
            width: 500,
            align: "justify"
        });
        doc.text.should.have.been.calledWith(
            "Long text for gap testing. This text is enough long to test gap settings.\n" +
            "And this has multiple lines.\n\n" +
            "Is this enough long?",
            {
                width: 200,
                columns: 2,
                columnGap: 16,
                indent: 10,
                paragraphGap: 16
            }
        );
    });
});
