(* File Fun/ParseAndRun.fs *)

open System
open System.IO
open Suave
open Suave.Filters
open Suave.Operators
open Suave.Successful
open Suave.RequestErrors
open Suave.Files
open Suave.Utils
open System.Text.Json
open Jint
open Jint.Native
open Jint.Native.Function


open Parsing
open Fun

module WebApp =
    let layout (content:string) =
        sprintf """
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
            <meta charset=\"UTF-8\"> 
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>JS AST Parser</title>
            <link rel=\"stylesheet\" type=\"text/css\" href=\"/default.css\" />
            <script src=\"/syntaxtree.js\ async"></script>
            <style>
            body { font-family: sans-serif; margin: 2em; }
            textarea { width: 100%%; height: 200px; }
            pre { background: #f4f4f4; padding: 1em; }
            </style>
        </head>
        <body>
            %s
        </body>
        </html>""" content


    let mutable result = ""
    let mutable bracketNotation = ""

    let mutable AST = ""
    let indexPage () =
        let jsonData = JsonSerializer.Serialize(bracketNotation)
        let inlineScript =
            sprintf "<script>const syntaxTreeData = %s;</script>" jsonData
        let form =
            "<style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 2em;
                    background-color: #f9f9f9;
                }
                h1 {
                    color: #333;
                }
                form {
                    margin-top: 1em;
                    margin-bottom: 2em;
                }
                textarea {
                    width: 100%;
                    height: 150px;
                    font-family: monospace;
                    font-size: 1em;
                    padding: 0.5em;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-sizing: border-box;
                    background-color: #fff;
                }
                button {
                    padding: 0.5em 1em;
                    font-size: 1em;
                    border: none;
                    background-color: #4CAF50;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
                #parse-error {
                    color: red;
                    font-weight: bold;
                }
                #tree {
                    margin-top: 2em;
                    padding: 1em;
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    white-space: pre-wrap;
                    font-family: monospace;
                }
                </style>" +
            "<h1>Enter MicroML function</h1>" +
            "<form method=\"post\" action=\"/\">" +
            "<textarea id=\"code\" name =\"code\"></textarea><br/>" +
            "<div><span id=\"parse-error\"></span></div>" +
            "<button type=\"submit\">Parse</button>" +
            "</form>" + $"<p>{result}</p>" +
            $"<p>{bracketNotation}</p>" +
            inlineScript +
            $"<div id=\"tree\">{AST}</div>"
            
        layout form

    
    // TODO: use the js syntax tree code to display the AST tree into the webpage, you can delete the result and bracket notation output
    let app =
        choose [
            //GET >=> browseHome
            GET >=> path "/default.css" >=> browseFileHome "default.css"
            GET >=> path "/index.html" >=> browseFileHome "index.html"
            GET >=> path "/syntaxtree.js" >=> browseFileHome "syntaxtree.js"
            GET >=> path "/tree.js"       >=> browseFileHome "tree.js"
            GET >=> path "/tip.js"        >=> browseFileHome "tip.js"
            GET >=> path "/parser.js"     >=> browseFileHome "parser.js"
            GET >=> path "/tokenizer.js"  >=> browseFileHome "tokenizer.js"
            GET >=> path "/canvas.js"  >=> browseFileHome "canvas.js"
            GET >=> path "/syntaxtree.bundle.js" >=> browseFileHome "syntaxtree.bundle.js"
            GET  >=> path "/"      >=> OK (indexPage ())
            POST >=> path "/" >=> request (fun req ->
                match req.formData "code" with
                | Choice1Of2 codeStr ->
                    try
                        let expr : Absyn.expr = fromString codeStr
                        let brackNot = print expr
                        let res = run(expr)

                        let treeHtml = BracketAst.astToDiv brackNot 
                        bracketNotation <- brackNot  // Store for display on index
                        result <- $"Result: {res}"
                        AST <- treeHtml
                        OK (indexPage ())  // Redirect to index page
                    with ex ->
                        BAD_REQUEST (sprintf "Parsing error: %s" ex.Message)
                | Choice2Of2 err ->
                    BAD_REQUEST (sprintf "Form error: %s" err)
            )
            NOT_FOUND "Not Found"
    
        ]

[<EntryPoint>]
let main _ =
    let port = 8080
    printfn "Starting server on http://localhost:%d" port
    printfn "Browse home directory: %A" browseHome
    startWebServer { defaultConfig with homeFolder = Some "wwwroot"; bindings = [ HttpBinding.createSimple HTTP "0.0.0.0" port ] } WebApp.app
    0

