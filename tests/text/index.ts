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

describe("text", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit({margin: 0});
        const text = sinon.spy(doc, "text");
        await yipt.render(doc, __dirname + "/template.yml");

        text.getCall(0).should.have.been.calledWith("blablabla", 20, 10);
        text.getCall(1).should.have.been.calledWith("blablabla");
        text.getCall(2).should.have.been.calledWith("blablabla", undefined, 20);
        text.getCall(3).should.have.been.calledWith("blablabla", 20);
        text.getCall(4).should.have.been.calledWith("syntax sugar");
        text.getCall(5).should.have.been.calledWith("escape { and \\}");
    });
});
