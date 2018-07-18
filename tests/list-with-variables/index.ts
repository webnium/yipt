"use strict";

import * as PDFKit from "pdfkit";
import * as sinon from "sinon";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import yipt from "../../lib/index";

chai.should();
chai.use(sinonChai);

describe("list with variables", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit();
        const list = sinon.spy(doc, "list");
        const data = {
            name: "data",
            items: ["item 1", "item 2", "item 3"]
        };

        await yipt.render(doc, __dirname + "/template-simple.yml", data);

        list.should.have.been.calledWith(data.items);
    })
})

describe("List of objects", () => {
    it("should render pdf.", async () => {
        const doc = new PDFKit();
        const list = sinon.spy(doc, "list");
        const data = {
            name: "data",
            items: [{
                name: "item 1",
                item: {
                    name: "fizz"
                }
            }, {
                name: "item 2",
                item: {
                    name: "buzz"
                }
            }, {
                name: "item 3",
                item: {
                    name: "fizzbuzz"
                }
            }]
        }

        await yipt.render(doc, __dirname + "/template-complex.yml", data);
        list.should.have.been.calledWith(["item 1 fizz", "item 2 buzz", "item 3 fizzbuzz"])
    })
})