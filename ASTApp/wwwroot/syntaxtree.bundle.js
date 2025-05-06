"use strict";
var syntaxtree = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ASTApp/wwwroot/syntaxtree.js
  var syntaxtree_exports = {};
  __export(syntaxtree_exports, {
    fetchTreeHtml: () => fetchTreeHtml
  });

  // ASTApp/wwwroot/canvas.js
  var Canvas = class {
    constructor(c) {
      this.canvas = c;
      this.font = "sans-serif";
      this.fontsize = 16;
      this.context = c.getContext("2d");
    }
    resize(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.clear();
    }
    textWidth(t) {
      this.context.font = this.fontsize + "px " + this.font;
      return this.context.measureText(t).width;
    }
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      console.log();
      this.context.textAlign = "center";
      this.context.textBaseline = "top";
    }
    translate(x, y) {
      this.context.translate(x, y);
    }
    text(t, x, y) {
      this.context.font = this.fontsize + "px " + this.font;
      this.context.fillText(t, x, y);
    }
    setFont(f) {
      this.font = f;
    }
    setFontSize(s2) {
      this.fontsize = s2;
    }
    setFillStyle(s2) {
      this.context.fillStyle = s2;
    }
    setStrokeStyle(s2) {
      this.context.strokeStyle = s2;
    }
    setLineWidth(w) {
      this.context.lineWidth = w;
    }
    line(x1, y1, x2, y2) {
      const ctx = this.context;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    triangle(x1, y1, x2, y2, x3, y3, fill = false) {
      const ctx = this.context;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x1, y1);
      if (fill) ctx.fill();
      ctx.stroke();
    }
    rect(x, y, w, h) {
      const ctx = this.context;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();
    }
    curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2) {
      const ctx = this.context;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.stroke();
    }
    download(fn) {
      const image = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement("a");
      link.setAttribute("href", image);
      link.setAttribute("download", fn);
      link.click();
      link.remove();
    }
  };

  // ASTApp/wwwroot/tokenizer.js
  var TokenType = {
    BRACKET_OPEN: "BRACKET_OPEN",
    BRACKET_CLOSE: "BRACKET_CLOSE",
    STRING: "STRING",
    NUMBER: "NUMBER",
    QUOTED_STRING: "QUOTED_STRING",
    SUBSCRIPT_PREFIX: "SUBSCRIPT_PREFIX",
    SUPERSCRIPT_PREFIX: "SUPERSCRIPT_PREFIX",
    ARROW_TO: "ARROW_TO",
    ARROW_FROM: "ARROW_FROM",
    ARROW_BOTH: "ARROW_BOTH"
  };
  var Token = class {
    constructor(type, value = null) {
      this.type = type;
      this.value = value;
    }
  };
  function tokenize(input) {
    const parsers = [
      skipWhitespace,
      parseControlCharacters,
      parseArrows,
      parseNumber,
      parseString,
      parseQuotedString
    ];
    const tokens = [];
    let offset = 0;
    while (offset < input.length) {
      const now_serving = offset;
      for (const parse_fn of parsers) {
        const [token, consumed] = parse_fn(input.substring(offset));
        offset += consumed;
        if (token != null) tokens.push(token);
        if (offset >= input.length) break;
      }
      if (offset == now_serving)
        throw "Unable to parse [" + s.substring(offset) + "] ...";
    }
    return tokens;
  }
  function isWhitespace(ch) {
    const whitespace = [" ", "\b", "\f", "\n", "\r", "	", "\v"];
    return whitespace.includes(ch);
  }
  function isControlCharacter(ch) {
    const control_chars = ["[", "]", "^", "_", '"'];
    return control_chars.includes(ch);
  }
  function isNumber(ch) {
    return ch >= "0" && ch <= "9";
  }
  function skipWhitespace(input) {
    let consumed = 0;
    while (isWhitespace(input.charAt(consumed))) ++consumed;
    return [null, consumed];
  }
  function parseControlCharacters(input) {
    if (input.charAt(0) == "_") return [new Token(TokenType.SUBSCRIPT_PREFIX), 1];
    if (input.charAt(0) == "^") return [new Token(TokenType.SUPERSCRIPT_PREFIX), 1];
    if (input.charAt(0) == "[") return [new Token(TokenType.BRACKET_OPEN), 1];
    if (input.charAt(0) == "]") return [new Token(TokenType.BRACKET_CLOSE), 1];
    return [null, 0];
  }
  function parseArrows(input) {
    if (input.length > 1) {
      if (input.startsWith("->")) return [new Token(TokenType.ARROW_TO), 2];
      if (input.startsWith("<-")) return [new Token(TokenType.ARROW_FROM), 2];
      if (input.startsWith("<>")) return [new Token(TokenType.ARROW_BOTH), 2];
    }
    return [null, 0];
  }
  function parseNumber(input) {
    let consumed = 0;
    while (consumed < input.length && isNumber(input.charAt(consumed)))
      ++consumed;
    if (consumed > 0) {
      return [
        new Token(TokenType.NUMBER, parseInt(input.substring(0, consumed))),
        consumed
      ];
    } else {
      return [null, 0];
    }
  }
  function parseString(input) {
    let consumed = 0;
    while (consumed < input.length && !isWhitespace(input.charAt(consumed)) && !isControlCharacter(input.charAt(consumed)))
      ++consumed;
    if (consumed > 0) {
      return [
        new Token(TokenType.STRING, input.substring(0, consumed)),
        consumed
      ];
    } else {
      return [null, 0];
    }
  }
  function parseQuotedString(input) {
    if (input.charAt(0) != '"') return [null, 0];
    let consumed = 1;
    while (consumed < input.length && input.charAt(consumed) != '"') ++consumed;
    if (input.charAt(consumed) != '"')
      throw 'Unterminated quoted string. Missing " after [' + input + "]";
    return [
      new Token(TokenType.QUOTED_STRING, input.substring(1, consumed)),
      consumed + 1
    ];
  }

  // ASTApp/wwwroot/parser.js
  var NodeType = {
    ROOT: "ROOT",
    NODE: "NODE",
    VALUE: "VALUE"
  };
  function parse(tokens) {
    const root = { type: NodeType.ROOT, label: "__ROOT__", values: [] };
    let node = null;
    let current = 0;
    while (current < tokens.length) {
      [current, node] = parseToken(tokens, current);
      root.values.push(node);
    }
    return root;
  }
  function parseNode(tokens, current) {
    const node = { type: NodeType.NODE, label: null, subscript: null, superscript: null, values: [] };
    if (current > tokens.length - 2) throw "Missing label after [";
    const label_token = tokens[++current];
    if (label_token.type != TokenType.STRING && label_token.type != TokenType.QUOTED_STRING)
      throw "Expected label string after [";
    node.label = tokens[current++].value;
    if (current < tokens.length - 1 && (tokens[current].type == TokenType.SUBSCRIPT_PREFIX || tokens[current].type == TokenType.SUPERSCRIPT_PREFIX)) {
      let is_super = tokens[current].type == TokenType.SUPERSCRIPT_PREFIX;
      const subscript_token = tokens[++current];
      if (subscript_token.type != TokenType.STRING && subscript_token.type != TokenType.QUOTED_STRING)
        throw current + ": Expected subscript string after _";
      if (is_super)
        node.superscript = tokens[current++].value;
      else
        node.subscript = tokens[current++].value;
    }
    while (current < tokens.length && tokens[current].type != TokenType.BRACKET_CLOSE) {
      let value = null;
      [current, value] = parseToken(tokens, current);
      if (value) node.values.push(value);
    }
    if (current >= tokens.length)
      throw current - 1 + ": Missing closing bracket ] ...";
    return [current + 1, node];
  }
  function parseValue(tokens, current) {
    let label = null;
    if (tokens[current].type == TokenType.STRING) {
      const values = [];
      while (current < tokens.length && tokens[current].type == TokenType.STRING)
        values.push(tokens[current++].value);
      label = values.join(" ");
    } else {
      label = tokens[current++].value;
    }
    let subscript = null;
    let superscript = null;
    if (current < tokens.length - 1 && (tokens[current].type == TokenType.SUBSCRIPT_PREFIX || tokens[current].type == TokenType.SUPERSCRIPT_PREFIX)) {
      let is_super = tokens[current].type == TokenType.SUPERSCRIPT_PREFIX;
      const subscript_token = tokens[++current];
      if (subscript_token.type != TokenType.STRING && subscript_token.type != TokenType.QUOTED_STRING)
        throw current + ": Expected subscript string after _/^";
      if (is_super)
        superscript = tokens[current++].value;
      else
        subscript = tokens[current++].value;
    }
    let arrow = null;
    if (current < tokens.length - 1 && (tokens[current].type == TokenType.ARROW_TO || tokens[current].type == TokenType.ARROW_FROM || tokens[current].type == TokenType.ARROW_BOTH)) {
      const ends = {
        to: tokens[current].type == TokenType.ARROW_TO || tokens[current].type == TokenType.ARROW_BOTH,
        from: tokens[current].type == TokenType.ARROW_FROM || tokens[current].type == TokenType.ARROW_BOTH
      };
      tokens[current].type == TokenType.ARROW_BOTH;
      const target_token = tokens[++current];
      if (target_token.type != TokenType.NUMBER)
        throw current + ": Expected column number after -> or <>";
      arrow = { ends, target: tokens[current++].value };
    }
    return [
      current,
      { type: NodeType.VALUE, label, subscript, superscript, arrow }
    ];
  }
  function parseToken(tokens, current) {
    switch (tokens[current].type) {
      case TokenType.BRACKET_OPEN:
        return parseNode(tokens, current);
      case TokenType.STRING:
      case TokenType.QUOTED_STRING:
        return parseValue(tokens, current);
      default:
        throw "Unexpected " + tokens[current].type + " at idx " + current;
    }
  }

  // ASTApp/wwwroot/tree.js
  var NODE_PADDING = 20;
  var Tree = class {
    constructor(canvas2) {
      this.nodecolor = true;
      this.fontsize = 16;
      this.triangles = true;
      this.subscript = true;
      this.alignment = 0;
      this.canvas = null;
      this.vscaler = 1;
    }
    resizeCanvas(w, h) {
      this.canvas.resize(w, h);
      this.canvas.translate(0, canvas.fontsize / 2);
    }
    draw(syntax_tree) {
      if (this.canvas == null)
        throw "Canvas must be set first.";
      const drawables = drawableFromNode(this.canvas, syntax_tree);
      const max_depth = getMaxDepth(drawables);
      if (this.alignment > 0)
        moveLeafsToBottom(drawables, max_depth);
      if (this.alignment > 1)
        moveParentsDown(drawables);
      if (this.subscript)
        calculateAutoSubscript(drawables);
      const has_arrow = calculateDrawablePositions(this.canvas, drawables, this.vscaler);
      const arrowSet = makeArrowSet(drawables, this.fontsize);
      const arrowScaler = Math.pow(Math.sqrt(arrowSet.maxBottom) / arrowSet.maxBottom, 1 / 50);
      this.resizeCanvas(
        drawables.width + 1,
        Math.max(
          (max_depth + 1) * (this.fontsize * this.vscaler * 3),
          has_arrow ? arrowSet.maxBottom * arrowScaler : 0
        )
      );
      drawables.children.forEach((child) => this.drawNode(child));
      this.drawArrows(arrowSet.arrows);
    }
    drawNode(drawable) {
      this.drawLabel(drawable);
      this.drawSubscript(drawable);
      drawable.children.forEach((child) => {
        this.drawNode(child);
        this.drawConnector(drawable, child);
      });
    }
    drawLabel(drawable) {
      this.canvas.setFontSize(this.fontsize);
      if (this.nodecolor) {
        this.canvas.setFillStyle(drawable.is_leaf ? "#CC0000" : "#0000CC");
      } else {
        this.canvas.setFillStyle("black");
      }
      this.canvas.text(
        drawable.label,
        getDrawableCenter(drawable),
        drawable.top + 2
      );
    }
    drawSubscript(drawable) {
      if (!drawable.subscript && !drawable.superscript)
        return;
      let offset = 1 + getDrawableCenter(drawable) + this.canvas.textWidth(drawable.label) / 2;
      this.canvas.setFontSize(this.fontsize * 3 / 4);
      if (drawable.subscript) {
        offset += this.canvas.textWidth(drawable.subscript) / 2;
        this.canvas.text(
          drawable.subscript,
          offset,
          drawable.top + this.fontsize / 2
        );
      } else {
        offset += this.canvas.textWidth(drawable.superscript) / 2;
        this.canvas.text(drawable.superscript, offset, drawable.top);
      }
      this.canvas.setFontSize(this.fontsize);
    }
    drawConnector(parent, child) {
      if (this.triangles && child.is_leaf && child.label.includes(" ")) {
        const text_width = this.canvas.textWidth(child.label);
        this.canvas.triangle(
          getDrawableCenter(parent),
          parent.top + this.fontsize + 2,
          getDrawableCenter(child) + text_width / 2 - 4,
          child.top - 3,
          getDrawableCenter(child) - text_width / 2 + 4,
          child.top - 3
        );
      } else {
        this.canvas.line(
          getDrawableCenter(parent),
          parent.top + this.fontsize + 2,
          getDrawableCenter(child),
          child.top - 3
        );
      }
    }
    drawArrows(arrows) {
      const arrow_color = this.nodecolor ? "#909" : "#999";
      this.canvas.setFillStyle(arrow_color);
      this.canvas.setStrokeStyle(arrow_color);
      this.canvas.setLineWidth(2);
      for (const arrow of arrows) {
        this.canvas.curve(
          arrow.from_x,
          arrow.from_y,
          arrow.to_x,
          arrow.to_y,
          arrow.from_x,
          arrow.bottom,
          arrow.to_x,
          arrow.bottom
        );
        if (arrow.ends_to)
          this.drawArrowHead(arrow.to_x, arrow.to_y);
        if (arrow.ends_from)
          this.drawArrowHead(arrow.from_x, arrow.from_y);
      }
    }
    drawArrowHead(x, y) {
      const cx = this.fontsize / 4;
      const cy = this.fontsize / 2;
      this.canvas.triangle(x, y, x - cx, y + cy, x + cx, y + cy, true);
    }
    setCanvas(c) {
      this.canvas = new Canvas(c);
    }
    setColor(e) {
      this.nodecolor = e;
    }
    setFont(f) {
      this.canvas.setFont(f);
    }
    setFontsize(s2) {
      this.fontsize = parseInt(s2, 10);
      this.canvas.setFontSize(this.fontsize);
    }
    setTriangles(t) {
      this.triangles = t;
    }
    setSubscript(s2) {
      this.subscript = s2;
    }
    setAlignment(a) {
      this.alignment = a;
    }
    setSpacing(s2) {
      this.vscaler = s2;
    }
    download() {
      this.canvas.download("syntax_tree.png");
    }
  };
  var Arrow = class {
    constructor(from_x, from_y, to_x, to_y, bottom, ends_to, ends_from) {
      this.from_x = from_x;
      this.from_y = from_y;
      this.to_x = to_x;
      this.to_y = to_y;
      this.bottom = bottom;
      this.ends_to = ends_to;
      this.ends_from = ends_from;
    }
  };
  var ArrowSet = class {
    constructor() {
      this.arrows = [];
      this.maxBottom = 0;
    }
    add(arrow) {
      this.arrows.push(arrow);
      this.maxBottom = Math.max(this.maxBottom, arrow.bottom);
    }
    concatenate(arrowSet) {
      this.arrows = this.arrows.concat(arrowSet.arrows);
      this.maxBottom = Math.max(this.maxBottom, arrowSet.maxBottom);
    }
  };
  function drawableFromNode(canvas2, node, depth = -1) {
    const drawable = {
      label: node.label,
      subscript: node.subscript,
      superscript: node.superscript,
      width: getNodeWidth(canvas2, node),
      depth,
      is_leaf: node.type == NodeType.VALUE,
      arrow: "arrow" in node ? node.arrow : null,
      children: []
    };
    if (node.type != NodeType.VALUE) {
      node.values.forEach((child) => {
        drawable.children.push(drawableFromNode(canvas2, child, depth + 1));
      });
    }
    return drawable;
  }
  function getNodeWidth(canvas2, node) {
    let label_width = node.type != NodeType.ROOT ? canvas2.textWidth(node.label) + NODE_PADDING : 0;
    if (node.subscript)
      label_width += canvas2.textWidth(node.subscript) * 3 / 4 * 2;
    else if (node.superscript)
      label_width += canvas2.textWidth(node.superscript) * 3 / 4 * 2;
    if (node.type != NodeType.VALUE) {
      return Math.max(label_width, getChildWidth(canvas2, node));
    } else {
      return label_width;
    }
  }
  function calculateDrawablePositions(canvas2, drawable, vscaler, parent_offset = 0) {
    let offset = 0;
    let scale = 1;
    let hasArrow = drawable.arrow;
    if (drawable.depth >= 0) {
      const child_width = getDrawableChildWidth(canvas2, drawable);
      if (drawable.width > child_width)
        scale = drawable.width / child_width;
    }
    drawable.children.forEach((child) => {
      child.top = child.depth * (canvas2.fontsize * 3 * vscaler) + NODE_PADDING / 2;
      child.left = offset + parent_offset;
      child.width *= scale;
      const child_has_arrow = calculateDrawablePositions(canvas2, child, vscaler, child.left);
      if (child_has_arrow)
        hasArrow = true;
      offset += child.width;
    });
    return hasArrow;
  }
  function getChildWidth(canvas2, node) {
    if (node.type == NodeType.VALUE)
      return 0;
    let child_width = 0;
    node.values.forEach((child) => {
      child_width += getNodeWidth(canvas2, child);
    });
    return child_width;
  }
  function getDrawableChildWidth(canvas2, drawable) {
    if (drawable.children.length == 0)
      return drawable.width;
    let child_width = 0;
    drawable.children.forEach((child) => {
      child_width += child.width;
    });
    return child_width;
  }
  function getMaxDepth(drawable) {
    let max_depth = drawable.depth;
    drawable.children.forEach((child) => {
      const child_depth = getMaxDepth(child);
      if (child_depth > max_depth)
        max_depth = child_depth;
    });
    return max_depth;
  }
  function moveLeafsToBottom(drawable, bottom) {
    if (drawable.is_leaf)
      drawable.depth = bottom;
    drawable.children.forEach((child) => moveLeafsToBottom(child, bottom));
  }
  function moveParentsDown(drawable) {
    if (drawable.is_leaf)
      return;
    drawable.children.forEach((child) => moveParentsDown(child));
    if (drawable.depth != 0) {
      let depth = 999999;
      for (let child of drawable.children) {
        if (child.depth - 1 < depth)
          depth = child.depth - 1;
      }
      drawable.depth = depth;
    }
  }
  function calculateAutoSubscript(drawables) {
    const map = countNodes(drawables);
    map.forEach((value, key, map2) => {
      if (value === 1)
        map2.delete(key);
    });
    assignSubscripts(drawables, Array.from(map.keys()), /* @__PURE__ */ new Map());
  }
  function assignSubscripts(drawable, keys, tally) {
    if (!drawable.is_leaf && !drawable.subscript && !drawable.superscript && keys.includes(drawable.label)) {
      mapInc(tally, drawable.label);
      drawable.subscript = "" + tally.get(drawable.label);
    }
    drawable.children.forEach((child) => assignSubscripts(child, keys, tally));
  }
  function countNodes(drawable) {
    let map = /* @__PURE__ */ new Map();
    if (drawable.is_leaf)
      return map;
    if (!drawable.subscript)
      mapInc(map, drawable.label);
    drawable.children.forEach((child) => {
      const child_map = countNodes(child);
      map = mapMerge(map, child_map);
    });
    return map;
  }
  function findTarget(drawable, arrow_idx) {
    const [count, target] = findTargetLeaf(drawable, arrow_idx, 0);
    return target;
  }
  function findTargetLeaf(drawable, arrow_idx, count) {
    if (drawable.is_leaf && ++count == arrow_idx)
      return [count, drawable];
    for (const child of drawable.children) {
      let target = null;
      [count, target] = findTargetLeaf(child, arrow_idx, count);
      if (target != null)
        return [count, target];
    }
    return [count, null];
  }
  function mapInc(map, key) {
    if (!map.has(key))
      map.set(key, 1);
    else
      map.set(key, map.get(key) + 1);
  }
  function mapMerge(one, two) {
    two.forEach((value, key) => {
      if (one.has(key))
        one.set(key, one.get(key) + value);
      else
        one.set(key, value);
    });
    return one;
  }
  function getDrawableCenter(drawable) {
    return drawable.left + drawable.width / 2;
  }
  function findMaxDepthBetween(drawable, left, right, max_y = 0) {
    drawable.children.forEach((child) => {
      const child_low = findMaxDepthBetween(child, left, right, max_y);
      max_y = Math.max(child_low, max_y);
    });
    if (drawable.is_leaf && drawable.left >= left && drawable.left <= right) {
      max_y = Math.max(drawable.top, max_y);
    }
    return max_y;
  }
  function makeArrowSet(root, fontsize) {
    return makeArrowSetOn(root, root, fontsize);
  }
  function makeArrowSetOn(root, drawable, fontsize) {
    const arrowSet = new ArrowSet();
    drawable.children.forEach((child) => {
      arrowSet.concatenate(makeArrowSetOn(root, child, fontsize));
    });
    if (!drawable.is_leaf || !drawable.arrow)
      return arrowSet;
    const target = findTarget(root, drawable.arrow.target);
    if (!target)
      return arrowSet;
    const from = {
      x: getDrawableCenter(drawable),
      y: drawable.top + fontsize * 1.2
    };
    const to = { x: getDrawableCenter(target), y: target.top + fontsize * 1.2 };
    const bottom = 1.4 * findMaxDepthBetween(
      root,
      Math.min(drawable.left, target.left),
      Math.max(drawable.left, target.left)
    );
    const ends_to = drawable.arrow.ends.to;
    const ends_from = drawable.arrow.ends.from;
    arrowSet.add(
      new Arrow(from.x, from.y, to.x, to.y, bottom, ends_to, ends_from)
    );
    return arrowSet;
  }

  // ASTApp/wwwroot/tip.js
  var tips = [
    "Click on the syntax tree image to download a copy.",
    "jsSyntaxTree works offline, instantly updates and handles unicode fonts.",
    "You can right-click the image and copy &amp; paste the graph into your document editor.",
    "The graph will update automatically once a matching number of brackets is detected.",
    'Add manual subscripts to nodes using an underscore character.<br />Example: <a href="?[N_s%20Dogs]">[N_s Dogs]</a>',
    'Add manual superscript to nodes using the ^ character.<br />Example: <a href="?[N^s%20Cats]">[N^s Cats]</a>',
    'You can add spaces to nodes by putting them inside double quotes.<br />Example: <a href="?[&quot;Main%20clause&quot;%20[S][V][O]]">[&quot;Main clause&quot; [S][V][O]]</a>',
    'Add arrows to a node by using an -&gt;, &lt- or &lt;&gt; arrow followed by column number.<br />Example: <a href="?[A%20[B%20C][D%20E][F%20G%20->1]]">[A [B C][D E][F G ->1]]</a>'
  ];
  var tip_idx = Math.floor(Math.random() * tips.length);

  // ASTApp/wwwroot/syntaxtree.js
  var tree = new Tree();
  function fetchTreeHtml(canvas2, codeString) {
    try {
      tree.setCanvas(canvas2);
      const tokens = tokenize(codeString);
      validateTokens(tokens);
      const syntax_tree = parse(tokens);
      tree.draw(syntax_tree);
      const canvasHTML = `<canvas width="${canvas2.width}" height="${canvas2.height}"></canvas>`;
      return `<div id="tree">${canvasHTML}</div>`;
    } catch (err) {
      return `Error: ${err}`;
    }
  }
  function validateTokens(tokens) {
    if (tokens.length < 3) throw "Phrase too short";
    if (tokens[0].type != TokenType.BRACKET_OPEN || tokens[tokens.length - 1].type != TokenType.BRACKET_CLOSE)
      throw "Phrase must start with [ and end with ]";
    const brackets = countOpenBrackets(tokens);
    if (brackets > 0) throw brackets + " bracket(s) open [";
    if (brackets < 0) throw Math.abs(brackets) + " too many closed bracket(s) ]";
    return null;
  }
  function countOpenBrackets(tokens) {
    let o = 0;
    for (const token of tokens) {
      if (token.type == TokenType.BRACKET_OPEN) ++o;
      if (token.type == TokenType.BRACKET_CLOSE) --o;
    }
    return o;
  }
  return __toCommonJS(syntaxtree_exports);
})();
