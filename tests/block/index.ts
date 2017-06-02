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

describe("block", () => {
    it("should render text on offset position.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml");

        doc.text.should.have.been.calledWith("text in block.", 80, 50);
        doc.text.should.have.been.calledWith("text in block without top nor left.");
        doc.text.should.have.been.calledWith("2nd text in block without top nor left.");
    });

    it("should translate vector.", async () => {
        const doc = new PDFKit({margin: 0});

        sinon.spy(doc, "translate");
        const moveToSpy = sinon.spy(doc, "moveTo");
        sinon.spy(doc, "lineTo");
        sinon.spy(doc, "bezierCurveTo");
        const quadraticCurveToSpy = sinon.spy(doc, "quadraticCurveTo");
        const vectorSpy = sinon.spy(doc, "stroke");

        await yipt.render(doc, __dirname + "/template.yml");

        doc.translate.should.have.been.calledWith(70, 60).and.calledBefore(moveToSpy);
        doc.moveTo.should.have.been.calledWith(0, 0);
        doc.lineTo.should.have.calledWith(100, 160).and.calledAfter(moveToSpy);
        doc.quadraticCurveTo.should.have.been.calledWith(130, 200, 150, 120);
        doc.bezierCurveTo.should.have.been.calledWith(190, -40, 200, 200, 300, 150).and.calledAfter(quadraticCurveToSpy);
        doc.lineTo.should.have.calledWith(300, 180);
        doc.lineTo.should.have.calledWith(350, 180).and.calledBefore(vectorSpy);

        doc.stroke.should.calledWith();
    });

    it("should evaluate variables as top and left.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");

        doc.x = 80;
        doc.y = 50;

        await yipt.render(doc, __dirname + "/with-variables.yml");

        doc.text.should.have.been.calledWith("text in block.", 160, 100);
    });

    it("should set doc.y and doc.x like text", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");

        doc.x = 80;
        doc.y = 50;

        await yipt.render(doc, __dirname + "/doc-xy.yml");

        doc.text.should.have.been.calledWith(`x:100, y:${80 + doc.currentLineHeight(true)}`);
    });
});
