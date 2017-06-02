/*
 * This file is a part of yipt
 * Copyright (C) 2017 Webnium (https://webnium.co.jp/)
 * License under MIT license https://opensource.org/licenses/MIT
 */

"use strict";
import {PDFDocument, TemplateElement} from "../index";
import Types, {bind} from "../evaluators";
import {isNullOrUndefined} from "util";
import * as _ from "lodash";

interface StrokeElement extends TemplateElement {
    type: "vector";
    render?: "stroke" | "fill" | "fillAndStroke";
    lineWidth?: number;
    cap?: "butt" | "round" | "square";
    join?: "miter" | "round" | "bevel";
    dash?: {
        length: number;
        space?: number;
        phase?: number;
    };
    color?: string;
    fillColor?: string;
    windingRule?: "even-odd" | "non-zero";
    opacity?: number;
    paths: Path[];
}

interface Path {
    type: string;
}

export = async function (doc: PDFDocument, content: TemplateElement, vars: any, offset, _bindings: any) {
    const element = content as StrokeElement;
    const bindings = bind(doc, _bindings, offset);

    doc.save();

    const left = offset.left + (Types.number(element.left, vars, bind(doc, bindings, offset)) || 0);
    const top = !isNullOrUndefined(element.top) ? offset.top + (Types.number(element.top, vars, bindings) || 0) : doc.y;
    if (left || top) {
        doc.translate(left, top);
    }

    let pos = [0, 0];
    let maxY = 0;

    if (["line", "quadraticCurve", "bezierCurve", "verticalLine", "horizontalLine"].includes(element.paths[0].type)) {
        doc.moveTo(0, 0);
    }

    element.paths.forEach(drawLine());

    !isNullOrUndefined(element.lineWidth) && doc.lineWidth(Types.number(element.lineWidth, vars));
    element.cap && doc.lineCap(Types.enum(["butt", "round", "square"])(element.cap, vars));
    element.join && doc.lineJoin(Types.enum(["miter", "round", "bevel"])(element.join, vars));
    element.dash && doc.dash(
        Types.number(element.dash.length, vars),
        {space: Types.number(element.dash.space, vars), phase: Types.number(element.dash.phase, vars)});
    !isNullOrUndefined(element.opacity) && doc.opacity(Types.number(element.opacity, vars));

    const color = element.color && Types.string(element.color, vars);
    const fillColor = element.fillColor && Types.string(element.fillColor, vars);
    switch (element.render) {
        case "fill":
            doc.fill(fillColor, element.windingRule);
            break;
        case "fillAndStroke":
            doc.fillAndStroke(color, fillColor, element.windingRule);
            break;
        case "stroke":
        default:
            doc.stroke(color);
            break;
    }
    doc.restore();
    doc.y = top + maxY;
    doc.x = left || doc.x;

    function drawLine() {
        return path => {
            switch (path.type) {
                case "line":
                    pos = Types.numberArray(path.to, vars, bindings) as [number, number];
                    maxY = Math.max(maxY, pos[1]);
                    doc.lineTo.apply(doc, pos);
                    break;
                case "quadraticCurve": {
                    const to = Types.numberArray(path.to, vars, bindings) as [number, number];
                    const anchor = Types.numberArray(path.anchor, vars, bindings);
                    maxY = Math.max(maxY, quadraticCurveMax(to[1], anchor[1], pos[1]));
                    pos = to;
                    doc.quadraticCurveTo.apply(doc, anchor.concat(pos));
                    break;
                }
                case "bezierCurve": {
                    const to = Types.numberArray(path.to, vars, bindings) as [number, number];
                    const anchors = Types.numberArray(path.anchors, vars, bindings);
                    maxY = Math.max(maxY, bezierCurveMax(pos[1], anchors[1], anchors[3], to[1]));
                    pos = to;
                    doc.bezierCurveTo.apply(doc, anchors.concat(pos));
                    break;
                }
                case "verticalLine":
                    pos[1] += Types.number(path.length, vars, bindings);
                    maxY = Math.max(maxY, pos[1]);
                    doc.lineTo(pos[0], pos[1]);
                    break;
                case "horizontalLine":
                    pos[0] += Types.number(path.length, vars, bindings);
                    doc.lineTo(pos[0], pos[1]);
                    break;
                case "move":
                    pos = Types.numberArray(path.to, vars, bindings) as [number, number];
                    maxY = Math.max(maxY, pos[1]);
                    doc.moveTo(pos[0], pos[1]);
                    break;
                case "rect": {

                    pos = Types.numberArray(path.pos, vars, bindings) as [number, number];
                    const height = Types.number(path.height, vars, bindings);
                    maxY = Math.max(maxY, pos[1] + height);
                    doc.rect(pos[0], pos[1], Types.number(path.width, vars, bindings), height);
                    break;
                }
                case "roundedRect": {
                    pos = Types.numberArray(path.pos, vars, bindings) as [number, number];
                    const height = Types.number(path.height, vars, bindings);
                    maxY = Math.max(maxY, pos[1] + height);
                    doc.roundedRect(pos[0], pos[1],
                        Types.number(path.width, vars, bindings), height,
                        Types.number(path.cornerRadius, vars, bindings));
                    break;
                }
                case "ellipse":
                    pos = Types.numberArray(path.center, vars, bindings) as [number, number];
                    const radiusY = Types.number(path.radiusY, vars, bindings);
                    maxY = Math.max(maxY, pos[1] + radiusY);
                    doc.ellipse(pos[0], pos[1],
                        Types.number(path.radiusX, vars, bindings), radiusY);
                    break;
                case "circle":
                    pos = Types.numberArray(path.center, vars, bindings) as [number, number];
                    const radius = Types.number(path.radius, vars, bindings);
                    maxY = Math.max(maxY, pos[1] + radius);
                    doc.circle(pos[0], pos[1], radius);
                    break;
                case "polygon":
                    const vertices = _.chunk(Types.numberArray(path.vertices, vars, bindings), 2);
                    pos = vertices[0];
                    maxY = vertices.reduce((maxY, vertex) => Math.max(maxY, vertex[1]), maxY);
                    doc.polygon(...vertices);
            }
        };
    }

};

function quadraticCurveMax(p1, p2, p3) {
    const t = (p1 - p2) / ( p1 + p3 - 2 * p2);

    if (t < 0 || t > 1) {
        return Math.max(p1, p3);
    }

    const tp = 1 - t;
    const pt = tp * tp * p1 + 2 * tp * t * p2 + t * t * p3;

    return Math.max(p1, p3, pt);
}

function bezierCurveMax(p1, p2, p3, p4) {
    const a = p4 - p1 - 3 * (p3 - p2);
    const b = 3 * (p3 + p1 - 2 * p2);
    const c = 3 * (p2 - p1);
    const d = b * b - 3 * a * c;

    if (d <= 0) {
        return Math.max(p1, p4);
    }

    const t = (-b - Math.sqrt(d)) / (3 * a);

    if (t < 0 || t > 1) {
        return Math.max(p1, p2);
    }

    const tp = 1 - t;
    const pt = tp * tp * tp * p1 + 3 * tp * tp * t * p2 + 3 * tp * t * t * p3 + t * t * t * p4;

    return Math.max(p1, p4, pt);
}

