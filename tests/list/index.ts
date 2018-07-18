"use strict";

import * as PDFKit from "pdfkit";
import * as sinon from "sinon";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import yipt from "../../lib/index";

chai.should();
chai.use(sinonChai);

describe("list", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit({margin:0});
        const list = sinon.spy(doc, "list");
        await yipt.render(doc, __dirname + "/template.yml");

        list.getCall(0).should.have.been.calledWith(["Hello", "World", "!"])
    })
})