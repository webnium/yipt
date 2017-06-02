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

describe("foreach", () => {
    const items = ["foo", "bar", "buzz"];
    const items2 = [100, 20, 300];

    it(`should render text in foreach loop.`, async () => {
        const doc = new PDFKit();
        const textSpy = sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml", {items});

        textSpy.should.calledThrice;
        textSpy.getCall(0).should.have.been.calledWith("[0] 1/3 - foo");
        textSpy.getCall(1).should.have.been.calledWith("[1] 2/3 - bar");
        textSpy.getCall(2).should.have.been.calledWith("[2] 3/3 - buzz");
    });

    it("should provides variables of outer loop.", async () => {
        const doc = new PDFKit();
        const textSpy = sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/nested.yml", {items, items2});

        textSpy.getCalls().should.have.lengthOf(9);
        textSpy.getCall(0).should.have.been.calledWith("1-1 foo 100");
        textSpy.getCall(1).should.have.been.calledWith("1-2 foo 20");
        textSpy.getCall(2).should.have.been.calledWith("1-3 foo 300");
        textSpy.getCall(3).should.have.been.calledWith("2-1 bar 100");
        textSpy.getCall(4).should.have.been.calledWith("2-2 bar 20");
        textSpy.getCall(5).should.have.been.calledWith("2-3 bar 300");
        textSpy.getCall(6).should.have.been.calledWith("3-1 buzz 100");
        textSpy.getCall(7).should.have.been.calledWith("3-2 buzz 20");
        textSpy.getCall(8).should.have.been.calledWith("3-3 buzz 300");
    });
});
