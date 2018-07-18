"use strict"

import * as PDFKit from "pdfkit";
import * as sinon from "sinon";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import yipt from "../../lib/index";

chai.should();
chai.use(sinonChai);

describe("list-with-options", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit({margin: 0});
        const list = sinon.spy(doc, "list");
        await yipt.render(doc, __dirname + "/template.yml");
        
        list.should.have.been.calledWith(["item 1", "item 2", "item 3"], 20, 10, {
            width: 200,
            indent: 10,
            bulletRadius: 2,
            textIndent: 20
        })
    })
})