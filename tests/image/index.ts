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

describe("image", () => {
    it("should render image.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.stub(doc, "image");
        await yipt.render(doc, __dirname + "/template.yml");

        doc.image.should.have.been.calledWith("/path/to/image.jpg");
        doc.image.should.have.been.calledWith("/path/to/image.png", 10, 20);
        doc.image.should.have.been.calledWith("/path/to/other-image.jpg", {width: 100, height: 200});
        doc.image.should.have.been.calledWith("/path/to/other-image.jpg", 20, 30, {scale: 0.25});
        doc.image.should.have.been.calledWith("/path/to/other-image.jpg", 20, 40, {fit: [100, 200]});
    });

    context("with variables", () => {
        [
            {
                width: 100,
                height: 200
            },
            {
                scale: 0.25
            },
            {
                fit: [100, 200]
            }
        ].forEach((options, i) =>
            it("should evaluate variables. #" + i, async () => {

                const doc = new PDFKit({margin: 0});
                sinon.stub(doc, "image");

                await yipt.render(doc, __dirname + "/with-variables.yml", {
                    options
                });

                doc.image.should.have.been.calledWith("/path/to/image.jpg", 160, 100, options);
            })
        );
    });
});
