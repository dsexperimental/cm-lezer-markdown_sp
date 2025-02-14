import { Tree } from "@lezer/common";
const abbrev = {
    __proto__: null,
    CB: "CodeBlock",
    FC: "FencedCode",
    Q: "Blockquote",
    HR: "HorizontalRule",
    BL: "BulletList",
    OL: "OrderedList",
    LI: "ListItem",
    H1: "ATXHeading1",
    H2: "ATXHeading2",
    H3: "ATXHeading3",
    H4: "ATXHeading4",
    H5: "ATXHeading5",
    H6: "ATXHeading6",
    SH1: "SetextHeading1",
    SH2: "SetextHeading2",
    HB: "HTMLBlock",
    PI: "ProcessingInstructionBlock",
    CMB: "CommentBlock",
    LR: "LinkReference",
    P: "Paragraph",
    Esc: "Escape",
    Ent: "Entity",
    BR: "HardBreak",
    Em: "Emphasis",
    St: "StrongEmphasis",
    Ln: "Link",
    Im: "Image",
    C: "InlineCode",
    HT: "HTMLTag",
    CM: "Comment",
    Pi: "ProcessingInstruction",
    h: "HeaderMark",
    q: "QuoteMark",
    l: "ListMark",
    L: "LinkMark",
    e: "EmphasisMark",
    c: "CodeMark",
    cI: "CodeInfo",
    cT: "CodeText",
    LT: "LinkTitle",
    LL: "LinkLabel"
};
export class SpecParser {
    constructor(parser, localAbbrev) {
        this.parser = parser;
        this.localAbbrev = localAbbrev;
    }
    type(name) {
        var _a;
        name = (this.localAbbrev && this.localAbbrev[name]) || abbrev[name] || name;
        return (_a = this.parser.nodeSet.types.find(t => t.name == name)) === null || _a === void 0 ? void 0 : _a.id;
    }
    parse(spec, specName) {
        let doc = "", buffer = [], stack = [];
        for (let pos = 0; pos < spec.length; pos++) {
            let ch = spec[pos];
            if (ch == "{") {
                let name = /^(\w+):/.exec(spec.slice(pos + 1)), tag = name && this.type(name[1]);
                if (tag == null)
                    throw new Error(`Invalid node opening mark at ${pos} in ${specName}`);
                pos += name[0].length;
                stack.push(tag, doc.length, buffer.length);
            }
            else if (ch == "}") {
                if (!stack.length)
                    throw new Error(`Mismatched node close mark at ${pos} in ${specName}`);
                let bufStart = stack.pop(), from = stack.pop(), type = stack.pop();
                buffer.push(type, from, doc.length, 4 + buffer.length - bufStart);
            }
            else {
                doc += ch;
            }
        }
        if (stack.length)
            throw new Error(`Unclosed node in ${specName}`);
        return { tree: Tree.build({ buffer, nodeSet: this.parser.nodeSet, topID: this.type("Document"), length: doc.length }), doc };
    }
}
