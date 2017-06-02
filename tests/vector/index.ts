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

describe("vector", () => {
    it("should render vector.", async () => {
        const doc = new PDFKit({margin: 0});

        const translateSpy = sinon.spy(doc, "translate");
        const moveToSpy = sinon.spy(doc, "moveTo");
        sinon.spy(doc, "lineTo");
        sinon.spy(doc, "bezierCurveTo");
        const quadraticCurveToSpy = sinon.spy(doc, "quadraticCurveTo");
        sinon.spy(doc, "lineWidth");
        sinon.spy(doc, "lineCap");
        sinon.spy(doc, "lineJoin");
        sinon.spy(doc, "dash");
        sinon.spy(doc, "opacity");
        const vectorSpy = sinon.spy(doc, "stroke");

        await yipt.render(doc, __dirname + "/template.yml");

        doc.moveTo.should.have.been.calledWith(0, 20);
        doc.lineTo.should.have.calledWith(100, 160).and.calledAfter(moveToSpy);
        doc.quadraticCurveTo.should.have.been.calledWith(130, 200, 150, 120);
        doc.bezierCurveTo.should.have.been.calledWith(190, -40, 200, 200, 300, 150).and.calledAfter(quadraticCurveToSpy);
        doc.lineTo.should.have.calledWith(300, 180);
        doc.lineTo.should.have.calledWith(350, 180).and.calledBefore(vectorSpy);

        doc.lineWidth.should.have.been.calledWith(1).and.calledBefore(vectorSpy);
        doc.lineCap.should.have.been.calledWith("round").and.calledBefore(vectorSpy);
        doc.lineJoin.should.have.been.calledWith("bevel").and.calledBefore(vectorSpy);
        doc.dash.should.have.been.calledWith(5, {space: 10, phase: 1}).and.calledBefore(vectorSpy);
        doc.opacity.should.have.been.calledWith(0.9).and.calledBefore(vectorSpy);

        doc.stroke.should.calledWith("red");

        translateSpy.notCalled.should.be.true;
    });

    it("should not call configure methods without options.", async () => {
        const doc = new PDFKit();

        const lineWidthSpy = sinon.spy(doc, "lineWidth");
        const lineCapSpy = sinon.spy(doc, "lineCap");
        const lineJoinSpy = sinon.spy(doc, "lineJoin");
        const dashSpy = sinon.spy(doc, "dash");
        const opacitySpy = sinon.spy(doc, "opacity");
        const vectorSpy = sinon.spy(doc, "stroke");

        await yipt.render(doc, __dirname + "/without-options.yml");

        chai.assert(lineWidthSpy.notCalled, "lineWidth method should never be called.");
        chai.assert(lineCapSpy.notCalled, "lineCap method should never be called.");
        chai.assert(lineJoinSpy.notCalled, "lineJoin method should never be called.");
        chai.assert(dashSpy.notCalled, "dash method should never be called.");
        chai.assert(opacitySpy.notCalled, "opacity method should never be called.");
        chai.assert(vectorSpy.neverCalledWithMatch(sinon.match.number.or(sinon.match.string)), "vector method should never be called with argument.");
    });

    it("should call save and restore.", async () => {
        const doc = new PDFKit();

        const lineWidthSpy = sinon.spy(doc, "lineWidth");
        const lineCapSpy = sinon.spy(doc, "lineCap");
        const lineJoinSpy = sinon.spy(doc, "lineJoin");
        const dashSpy = sinon.spy(doc, "dash");
        const opacitySpy = sinon.spy(doc, "opacity");
        const vectorSpy = sinon.spy(doc, "stroke");
        const saveSpy = sinon.spy(doc, "save");
        const restoreSpy = sinon.spy(doc, "restore");

        await yipt.render(doc, __dirname + "/template.yml");

        saveSpy.should.have.been.calledBefore(lineWidthSpy);
        saveSpy.should.have.been.calledBefore(lineCapSpy);
        saveSpy.should.have.been.calledBefore(lineJoinSpy);
        saveSpy.should.have.been.calledBefore(dashSpy);
        saveSpy.should.have.been.calledBefore(opacitySpy);
        saveSpy.should.have.been.calledBefore(vectorSpy);

        restoreSpy.should.have.been.calledAfter(lineWidthSpy);
        restoreSpy.should.have.been.calledAfter(lineCapSpy);
        restoreSpy.should.have.been.calledAfter(lineJoinSpy);
        restoreSpy.should.have.been.calledAfter(dashSpy);
        restoreSpy.should.have.been.calledAfter(opacitySpy);
        restoreSpy.should.have.been.calledAfter(vectorSpy);
    });

    it("should render vector using variables.", async () => {
        const doc = new PDFKit();
        doc.y = 8;
        const vars = {
            left: 0,
            lineWidth: 1,
            cap: "round",
            join: "bevel",
            dash: {
                length: 5,
                space: 10,
                phase: 1
            },
            color: "red",
            opacity: 0.9,
            lineTo: [100, 160],
            quadraticTo: [150, 120],
            quadraticAnchor: [130, 200],
            bezierTo: [300, 150],
            bezierAnchor: [190, -40, 200, 200],
            verticalLineLength: 30,
            horizontalLineLength: 50
        };

        sinon.spy(doc, "moveTo");
        sinon.spy(doc, "lineTo");
        sinon.spy(doc, "bezierCurveTo");
        sinon.spy(doc, "quadraticCurveTo");
        sinon.spy(doc, "lineWidth");
        sinon.spy(doc, "lineCap");
        sinon.spy(doc, "lineJoin");
        sinon.spy(doc, "dash");
        sinon.spy(doc, "opacity");
        sinon.spy(doc, "stroke");

        await yipt.render(doc, __dirname + "/with-variables.yml", vars);

        doc.moveTo.should.have.been.calledWith(0, 20); // y = doc.y + 12
        doc.lineTo.should.have.calledWith(100, 160);
        doc.quadraticCurveTo.should.have.been.calledWith(130, 200, 150, 120);
        doc.bezierCurveTo.should.have.been.calledWith(190, -40, 200, 200, 300, 150);
        doc.lineTo.should.have.calledWith(300, 180);
        doc.lineTo.should.have.calledWith(350, 180);

        doc.lineWidth.should.have.been.calledWith(1);
        doc.lineCap.should.have.been.calledWith("round");
        doc.lineJoin.should.have.been.calledWith("bevel");
        doc.dash.should.have.been.calledWith(5, {space: 10, phase: 1});
        doc.opacity.should.have.been.calledWith(0.9);

        doc.stroke.should.calledWith("red");
    });

    it("should fill the path.", async () => {
        const doc = new PDFKit();

        sinon.spy(doc, "lineTo");
        sinon.spy(doc, "stroke");
        const fillSpy = sinon.spy(doc, "fill");

        await yipt.render(doc, __dirname + "/fill.yml", {fillColor: "pink"});

        doc.stroke.should.not.have.been.calledWith(sinon.match.any);
        fillSpy.should.have.been.calledWith(undefined);
        fillSpy.should.have.been.calledWith("red");
        fillSpy.should.have.been.calledWith("pink", "even-odd");
    });

    it("should fill and stroke the path.", async () => {
        const doc = new PDFKit();

        sinon.spy(doc, "lineTo");
        sinon.spy(doc, "stroke");
        const fillAndStrokeSpy = sinon.spy(doc, "fillAndStroke");

        await yipt.render(doc, __dirname + "/fill-and-stroke.yml", {fillColor: "yellow", color: "pink"});

        doc.stroke.should.not.have.been.calledWith(sinon.match.any);
        fillAndStrokeSpy.should.have.been.calledWith();
        fillAndStrokeSpy.should.have.been.calledWith("blue", "red");
        fillAndStrokeSpy.should.have.been.calledWith("pink", "yellow");
        fillAndStrokeSpy.should.have.been.calledWith(undefined, "red", "even-odd");
    });

    it("should render shapes", async () => {
        const doc = new PDFKit();

        sinon.spy(doc, "rect");
        sinon.spy(doc, "roundedRect");
        sinon.spy(doc, "ellipse");
        sinon.spy(doc, "circle");
        sinon.spy(doc, "polygon");

        await yipt.render(doc, __dirname + "/shapes.yml");

        doc.rect.should.have.been.calledWith(0, 5, 10, 30);
        doc.roundedRect.should.have.been.calledWith(0, 40, 50, 100, 10);
        doc.ellipse.should.have.been.calledWith(0, 200, 60, 40);
        doc.circle.should.have.been.calledWith(0, 300, 40);
        doc.polygon.should.have.been.calledWith([0, 350], [100, 350], [50, 400]);
    });

    it("should set doc.x and doc.y like text.", async () => {
        const doc = new PDFKit({margin: 0});
        sinon.spy(doc, "text");

        doc.x = 80;
        doc.y = 50;

        await yipt.render(doc, __dirname + "/doc-pos.yml");

        doc.text.should.have.been.calledWith(`line, x: 90, y: 215`);
        doc.text.should.have.been.calledWith(`quadraticCurve, x: 80, y: 192.85714285714286`);
        doc.text.should.have.been.calledWith(`bezierCurve, x: 80, y: 206.8869599770845`);
        doc.text.should.have.been.calledWith(`verticalLine, x: 80, y: 80`);
        doc.text.should.have.been.calledWith(`horizontalLine, x: 80, y: 50`);
        doc.text.should.have.been.calledWith(`rect, x: 80, y: 85`);
        doc.text.should.have.been.calledWith(`roundedRect, x: 80, y: 250`);
        doc.text.should.have.been.calledWith(`ellipse, x: 80, y: 90`);
        doc.text.should.have.been.calledWith(`circle, x: 80, y: 390`);
        doc.text.should.have.been.calledWith(`polygon, x: 80, y: 450`);
        doc.text.should.have.been.calledWith(`move, x: 80, y: 100`);
        doc.text.should.have.been.calledWith(`complex, x: 80, y: 230`);
    });
});
