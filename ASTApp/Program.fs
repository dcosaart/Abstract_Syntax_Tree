(* File Fun/ParseAndRun.fs *)

open System
open Suave
open Suave.Filters
open Suave.Operators
open Suave.Successful
open Suave.RequestErrors
open Suave.Utils


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

    let indexPage =
        let form =
            "<h1>Enter MicroML function</h1>" +
            "<form method=\"post\" action=\"/print\">" +
            "<textarea name=\"code\"></textarea><br/>" +
            "<button type=\"submit\">Parse</button>" +
            "</form>"
        layout form

    

    let app =
        choose [
            GET  >=> path "/"      >=> OK indexPage

            POST >=> path "/print" >=> request (fun req ->
                match req.formData "code" with
                | Choice1Of2 codeStr ->
                    try
                        let expr : Absyn.expr = fromString codeStr
                        let resultStr = print expr
                        printfn "Parsed expression: %s" resultStr
                        OK (sprintf "<pre>%s</pre>" resultStr)
                    with ex ->
                        BAD_REQUEST (sprintf "Parsing error: %s" ex.Message)
                | Choice2Of2 err ->
                    BAD_REQUEST (sprintf "Form error: %s" err)
            )
    
        ]

[<EntryPoint>]
let main _ =
    let port = 8080
    printfn "Starting server on http://localhost:%d" port
    startWebServer { defaultConfig with homeFolder = None; bindings = [ HttpBinding.createSimple HTTP "0.0.0.0" port ] } WebApp.app
    0

