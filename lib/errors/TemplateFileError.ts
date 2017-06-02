/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

export class TemplateFileError extends Error {
    readonly parent;

    constructor(error: string | Error, readonly file: string) {
        super(
            `Cannot load template file "${file}".\n` +
            (
                typeof error === "string" ?
                    error as string :
                    (error as Error).message
            )
        );

        this.name = "TemplateFileError";
        if (error instanceof Error) {
            this.parent = error;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}