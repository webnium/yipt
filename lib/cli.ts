#!/usr/bin/env node
/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import {Command} from "commander";
import * as PDFKit from "pdfkit";
import * as jsYaml from "js-yaml";
import {readFile} from "sb-fs";
import yipt from "./index";
import {createWriteStream} from "fs";
import WritableStream = NodeJS.WritableStream;

const pkg = require("../package.json");

const commander = new Command(pkg.name);
commander.version(pkg.version)
    .option("-p, --params <file>", "A json or yaml file includes template parameters.")
    .arguments("<input> [output]")
    .action(main)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
}

async function main(input: string, output?: string) {
    const options = commander as any as Options;
    await print(input, output, options);
}

async function print(input: string, output: string, options: Options) {
    const vars = options.params && jsYaml.safeLoad(await readFile(options.params));
    const doc = new PDFKit();
    const outputStream = createOutputStream(output);

    doc.pipe(outputStream);
    outputStream.on("close", () => process.exit());
    outputStream.on("error", error => console.error(error.message) && process.exit(11));
    await yipt.render(doc, input, vars);
    doc.end();
}

function createOutputStream(output): WritableStream {
    if (!output || output === "-") {
        return process.stdout;
    }

    try {
        return createWriteStream(output);
    } catch (error) {
        console.error(`Cannot open output file "${output}".`);
        process.exit(2);
    }
}

interface Options {
    params: string;
}