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
            GET  >=> path "/"      >=> OK (indexPage ())
            POST >=> request (fun req ->
                match req.formData "code" with
                | Choice1Of2 codeStr ->
                    try
                        let expr : Absyn.expr = fromString codeStr
                        let brackNot = print expr
                        let res = run(expr)
                        let jsCode = File.ReadAllText(Path.Combine(__SOURCE_DIRECTORY__, "wwwroot", "syntaxtree.js"))
  
                        // Create a single Jint Engine instance and load the module code
                        let mutable engine =
                            new Engine()
                        engine <- engine.SetValue("console", {| log = fun (s: obj) -> () |}).Execute(jsCode)        
                            
                        let renderTreeHtml (brackNot: string) : string =
                            engine.Invoke("renderTreeHtml", brackNot).AsString()

                        let treeHtml = renderTreeHtml brackNot

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

