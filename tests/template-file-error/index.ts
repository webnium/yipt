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

describe("template file error", () => {
    it("should throw TemplateFileError when template file is broken.", async () => {
        const doc = new PDFKit({margin: 0});
        const text = sinon.spy(doc, "text");

        try {
            await yipt.render(doc, __dirname + "/template.yml");
        } catch (error) {
            error.name.should.eql("TemplateFileError");
            error.parent.name.should.eql("YAMLException");

            return;
        }

        throw new Error("Exception should be thrown.");
    });

    it("should throw TemplateFileError when template file version is incompatible.", async () => {
        const doc = new PDFKit({margin: 0});
        const text = sinon.spy(doc, "text");

        try {
            await yipt.render(doc, __dirname + "/incompatible-version.yml");
        } catch (error) {
            error.name.should.eql("TemplateFileError");
            error.message.should.match(/incompatible/);
            return;
        }

        throw new Error("Exception should be thrown.");
    });

});
