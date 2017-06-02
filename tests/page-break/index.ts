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

describe("page-break", () => {
    it("should add page.", async () => {
        const doc = new PDFKit({margin: 72});
        sinon.spy(doc, "addPage");
        await yipt.render(doc, __dirname + "/template.yml");

        doc.addPage.should.have.been.calledWith();
        doc.addPage.should.have.been.calledWith({layout: "landscape", size: "A4", margin: 50});
    });

    it("should set offset and doc position.", async () => {
        const doc = new PDFKit({margin: 72});
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/doc-pos.yml");

        doc.text.should.have.been.calledWith("add page in block, x: 132, y: 72");
        doc.text.should.have.been.calledWith("add page in root, x: 72, y: 72");
    });
});
