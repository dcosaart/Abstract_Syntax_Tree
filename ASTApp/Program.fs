(* File Fun/ParseAndRun.fs *)

open System
open FunLex
open FunPar
open Suave
open Suave.Filters
open Suave.Operators
open Suave.Successful
open Suave.RequestErrors
open Suave.Utils
open Newtonsoft.Json

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
            "<form method=\"post\" action=\"/parse\">" +
            "<textarea name=\"code\"></textarea><br/>" +
            "<button type=\"submit\">Parse</button>" +
            "</form>"
        layout form

    

    let app =
        choose [
            GET  >=> path "/"      >=> OK indexPage
            NOT_FOUND "Not Found"
        ]

[<EntryPoint>]
let main _ =
    let port = 8080
    printfn "Starting server on http://localhost:%d" port
    startWebServer { defaultConfig with homeFolder = None; bindings = [ HttpBinding.createSimple HTTP "0.0.0.0" port ] } WebApp.app
    0

