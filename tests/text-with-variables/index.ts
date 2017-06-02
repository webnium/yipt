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

describe("text with variables", () => {
    it("should render default value when vars is no supplied.", async () => {
        const doc = new PDFKit();
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml");

        doc.text.should.have.been.calledWith("Hello world!");
    });

    it("should render name when vars.name is supplied.", async () => {
        const doc = new PDFKit();
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml", {name: "John"});

        doc.text.should.have.been.calledWith("Hello John!");
    });

    it("should handle dateFormat function.", async () => {
        const doc = new PDFKit();
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/dateformat-function.yml", {
            date: "2017-05-25T12:23:25",
            timestamp: Date.parse("2017-05-24T05:11:43")
        });

        doc.text.should.have.been.calledWith("2017-05-25 21:23:25 and 2017-05-24 14:11:43");
    });

    it("should provides binding variables.", async () => {
        const doc = new PDFKit();
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml", {name: "John"});

        doc.text.should.have.been.calledWith(`doc.x: 72`);
        doc.text.should.have.been.calledWith(`doc.y: ${doc.currentLineHeight(true) * 2 + 72}`);
        doc.text.should.have.been.calledWith(`doc.currentLineHeight(): ${doc.currentLineHeight()}`);
        doc.text.should.have.been.calledWith(`doc.currentLineHeight(true): ${doc.currentLineHeight(true)}`);
        doc.text.should.have.been.calledWith(`block.x: 0`);
        doc.text.should.have.been.calledWith(`block.y: ${doc.currentLineHeight(true) * 4}`);
        doc.text.should.have.been.calledWith(`offset.left: 72`);
        doc.text.should.have.been.calledWith(`offset.top: 72`);
        doc.text.should.have.been.calledWith(`page.top: ${doc.page.margins.top}`);
        doc.text.should.have.been.calledWith(`page.left: ${doc.page.margins.left}`);
        doc.text.should.have.been.calledWith(`page.right: ${doc.page.width - doc.page.margins.right}`);
        doc.text.should.have.been.calledWith(`page.bottom: ${doc.page.maxY()}`);
    });
});
