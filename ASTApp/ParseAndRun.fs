module ParseAndRun.fs

open System
open Fun
let fromString = Parse.fromString
//2
let res3 = run(fromString "let pow x = if x = 0 then 1 else 3 * pow (x-1) in pow 8 end")
//1
let res4 = run( fromString "let sum n = if n=1 then 1 else n + sum (n-1) in sum 1000 end")
//3
let res5 = run (fromString "
    let pow x = if x = 0 then 1 else 3 * pow (x-1) in
        let q3 n = if n = 0 then pow 0 else pow n + q3 (n - 1) in 
            q3 11 
        end
    end")
let res6 = run (fromString "
    let pow8 x = (x*x*x*x*x*x*x*x) in
        let q4 n = if n = 11 then 0 else pow8 n + q4 (n + 1) in 
            q4 1
        end
    end")
printfn "Result one: %i; Result two: %i; Result three: %i; Result four: %i" res4 res3 res5 res6
