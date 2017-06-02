/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import * as PDFKit from "pdfkit";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import * as jsYaml from "js-yaml";
import {readFile} from "sb-fs";
import yipt from "../../lib/index";

chai.should();
chai.use(sinonChai);

describe("complex", () => {
    it("should render text on offset position.", async () => {
        const doc = new PDFKit({margin: 0});
        const vars = jsYaml.safeLoad(await readFile(`${__dirname}/params.yml`));
        await yipt.render(doc, __dirname + "/template.yml", vars);
    });

});
