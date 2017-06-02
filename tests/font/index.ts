/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import * as PDFKit from "pdfkit";
import * as sinon from "sinon";
import * as chai from "chai";
import yipt from "../../lib/index";

chai.should();

describe("font", () => {
    it("should call font methods.", async () => {
        const doc = new PDFKit();
        const font = sinon.stub(doc, "font");
        const registerFont = sinon.spy(doc, "registerFont");
        const fontSize = sinon.spy(doc, "fontSize");

        await yipt.render(doc, __dirname + "/template.yml");

        registerFont.getCall(0).should.calledWith("my-font-with-family", "/path/to/my-font.ttc", "my-family");
        registerFont.getCall(1).should.calledWith("my-font-without-family", "/path/to/my-font.ttf");

        font.getCall(0).should.calledWith("/path/to/my-font.ttc", "my-family");
        font.getCall(1).should.calledWith("/path/to/my-font.ttf");

        font.getCall(2).should.calledWith("/path/to/my-font.ttc", "my-family");

        fontSize.getCall(0).should.calledWith(13)
            .and.calledBefore(font.getCall(3) as typeof fontSize)
            .and.calledAfter(font.getCall(2) as typeof fontSize);

        font.getCall(3).should.calledWith("/path/to/my-font.ttf");

        fontSize.getCall(1).should.calledWith(14)
            .and.calledBefore(font.getCall(4) as typeof fontSize)
            .and.calledAfter(font.getCall(3) as typeof fontSize);

        font.getCall(4).should.calledWith("Times-Roman");

        fontSize.getCall(2).should.calledWith(15)
            .and.calledAfter(font.getCall(4) as typeof fontSize);

        fontSize.getCall(3).should.calledWith(10);

        font.should.have.been.calledWith("my-font-set-on-register");
        font.should.have.been.calledWith("my-font-register-with-size");
        font.getCalls().should.be.lengthOf(8);
    });
});
