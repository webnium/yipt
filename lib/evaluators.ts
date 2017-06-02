/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";

import * as jsonata from "jsonata";
import {Offset, PDFDocument} from "./index";
import * as deepAssign from "deep-assign";
import * as _dateFormat from "dateformat";
import {isNullOrUndefined} from "util";

export const Evaluators = {
    numberArray: function numberArray(array: NumberArrayExpression, vars, bindings = defaultBindings): number[] {
        if (typeof array === "string") {
            const ret = jsonata(array).evaluate(vars, bindings);

            if (typeof ret === "undefined") {
                return [];
            }

            if (!Array.isArray(ret)) {
                throw new Error(`Evaluated value should be an array of string. Expression: "${array}", Value: ${ret}, Vars: ${JSON.stringify(vars)}`);
            }

            for (const value of ret) {
                if (typeof value !== "number") {
                    throw new Error(`Evaluated value should be an array of number. Expression: "${array}", Value: ${ret}, Vars: "${JSON.stringify(vars)}"`);
                }
            }

            return ret;
        }

        return array.map(value => Evaluators.number(value, vars, bindings)).filter(value => !isNullOrUndefined(value));
    },

    stringArray: function stringArray(array: StringArrayExpression, vars, bindings = defaultBindings): string[] {
        if (typeof array === "string") {
            const ret = jsonata(array).evaluate(vars, bindings);

            if (typeof ret === "undefined") {
                return [];
            }

            if (!Array.isArray(ret)) {
                throw new Error(`Evaluated value should be an array of string. Expression: "${array}", Value: ${ret}, Vars: ${JSON.stringify(vars)}`);
            }

            for (const value of ret) {
                if (typeof value !== "string") {
                    throw new Error(`Evaluated value should be an array of string. Expression: "${array}", Value: ${ret}, Vars: "${JSON.stringify(vars)}"`);
                }
            }

            return ret;
        }

        if (!Array.isArray(array)) {
            throw new Error("Argument 1 should be an array or JSONata expression.");
        }

        return array.map(value => Evaluators.string(value, vars, bindings));
    },

    array: function array<T>(value: T[] | string, vars: any, bindings = defaultBindings): T[] {
        return Array.isArray(value) ? value : jsonata(value).evaluate(vars, bindings);
    },

    enum: function createEnum(candidates: string[]) {
        return function (value, vars, bindings = defaultBindings): string {
            if (candidates.indexOf(value) !== -1) {
                return value;
            }

            return String(jsonata(value).evaluate(vars, bindings));
        };
    },

    number: function number(value: number | string, vars, bindings = defaultBindings) {
        if (typeof value !== "string") {
            return value;
        }

        const evaluated = jsonata(value).evaluate(vars, bindings);

        if (typeof evaluated === "undefined") {
            return;
        }

        if (typeof evaluated !== "number") {
            throw new Error(`Evaluated value should be an number. Expression: "${value}", Value: ${evaluated}, Vars: "${JSON.stringify(vars)}"`);
        }

        return evaluated;
    },

    text: function text(value: string, vars, bindings = defaultBindings) {
        return value ? value.replace(
            /\\([{\\])|{([^}]+)}/g,
            (matches, escaped, expression) => {
                if (escaped) {
                    return escaped;
                }

                return jsonata(expression).evaluate(vars, bindings) + "";
            }
        ) : undefined;
    },

    boolean: function boolean(value: boolean | string, vars, bindings = defaultBindings) {
        return Boolean(typeof value === "string" ? jsonata(value).evaluate(vars, bindings) : value);
    },

    string: function string(value: string, vars, bindings = defaultBindings) {
        try {
            const ret = jsonata(value).evaluate(vars, bindings);
            return String(typeof ret === "undefined" ? value : ret);
        } catch (error) {
            return value;
        }
    },

    object: function object(definition: ObjectDefinition) {
        return function (value: any = {}, vars, bindings) {
            const ret = {};

            for (const option of Object.keys(definition)) {
                if (value.hasOwnProperty(option)) {
                    const evaluated = definition[option](value[option], vars, bindings);
                    if (!isNullOrUndefined(evaluated) && !(Array.isArray(evaluated) && evaluated.length === 0)) {
                        ret[option] = evaluated;
                    }
                }
            }

            return ret;
        };
    }
};

export type Evaluator = (value: any, vars: any, bindings: any) => any;

export interface ObjectDefinition {
    [property: string]: Evaluator;
}

export function bind(doc: PDFDocument, params: {} = {}, offset: Offset) {
    return deepAssign(
        defaultBindings,
        {
            offset: {
                top: offset.top,
                left: offset.left
            },
            doc: {
                x: doc.x,
                y: doc.y,
                currentLineHeight: (includeGap?: boolean) => doc.currentLineHeight(includeGap)
            },
            block: {
                x: doc.x - offset.left,
                y: doc.y - offset.top
            },
            page: {
                top: doc.page.margins.top,
                left: doc.page.margins.left,
                right: doc.page.width - doc.page.margins.right,
                bottom: doc.page.height - doc.page.margins.bottom
            }
        },
        params
    );
}

export const defaultBindings = {
    dateFormat
};

export default Evaluators;

function dateFormat(timestamp, format) {
    if (typeof timestamp === "undefined") {
        return;
    }

    const date = new Date(timestamp);

    return _dateFormat(date, format);
}

type NumberArrayExpression = (string | number)[] | string;
type StringArrayExpression = string[] | string;
