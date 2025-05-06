module BracketAst 

  /// A very simple AST: either a leaf (identifier or constant)
  /// or a node with a label and child ASTs
    type Ast =
        | Leaf of string
        | Node of string * Ast list

    /// Tokenize on brackets and whitespace
    let tokenize (input:string) =
        input
        |> Seq.fold (fun (tokens, buf) c ->
            match c with
            | '[' | ']' ->
                let tokens = if buf <> "" then tokens @ [buf] else tokens
                (tokens @ [string c], "")
            | ch when System.Char.IsWhiteSpace ch ->
                if buf = "" then (tokens, "") else (tokens @ [buf], "")
            | ch ->
                (tokens, buf + string ch)
        ) ([], "")
        |> fun (tokens, buf) ->
            if buf = "" then tokens else tokens @ [buf]

    /// Parse tokens into an AST. Returns (ast, remainingTokens).
    let rec parseAst tokens =
        match tokens with
        | "[" :: label :: rest ->
            // parse children until matching ]
            let rec loop acc ts =
                match ts with
                | "]" :: tail -> (List.rev acc, tail)
                | _ ->
                    let (child, after) = parseAst ts
                    loop (child::acc) after
            let (children, afterChildren) = loop [] rest
            (Node(label, children), afterChildren)
        | token :: rest ->
            (Leaf token, rest)
        | [] ->
            failwith "Unexpected end of tokens"

    /// Top-level parse: consumes all tokens, expects exactly one AST
    let parse input =
        let tokens = tokenize input
        let (ast, rem) = parseAst tokens
        if rem <> [] then failwithf "Unparsed tokens: %A" rem
        else ast

    /// Render the AST as nested <div> elements with CSS-based boxes and connectors
    let rec renderHtml ast =
        match ast with
        | Leaf value ->
            $"<div class=\"leaf\">{System.Net.WebUtility.HtmlEncode value}</div>"
        | Node(label, children) ->
            let kidsHtml =
                children
                |> List.map renderHtml
                |> String.concat ""
            $"""
            <div class="node">
            <div class="label">{System.Net.WebUtility.HtmlEncode label}</div>
            <div class="children">{kidsHtml}</div>
            </div>
            """

    /// Wrap in an outer div and include the CSS needed for boxes & arrows
    let astToDiv input =
        let css = """
        <style>
        #ast {
            text-aling: center;
            font-family: sans-serif;
            line-height: 1.4;
        }
        .node, .leaf {
            position: relative;
            margin: 0.5em 0 0.5em 1em;
        }
        .node::before {
            content: '';
            position: absolute;
            top: 1em;    /* halfway down this box */
            left: -1em;  /* reach back to parent connector */
            width: 1em;
            height: 0;
            border-top: 1px solid #333;
        }
        .children {
            border-left: 1px solid #333;
            margin-left: 1em;
            padding-left: 0.5em;
        }
        .label, .leaf {
            display: inline-block;
            border: 1px solid #666;
            border-radius: 4px;
            padding: 0.2em 0.5em;
            background: #eef;
        }
        .leaf {
            background: #efe;
        }
        </style>
        """
        let astHtml = parse input |> renderHtml
        $"""
        <div id="ast">
        {css}
        {astHtml}
        </div>
        """