import { /*ClassExp, ProcExp, */ Binding, CExp, ClassExp, Exp, IfExp, isAppExp, isAtomicExp, isCExp, isClassExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp, isProcExp, isProgram, makeAppExp, makeBinding, makeBoolExp, makeDefineExp, makeIfExp, makeLetExp, makeLitExp, makePrimOp, makeProcExp, makeProgram, makeVarDecl, makeVarRef, ProcExp, Program } from "./L31-ast";
import { Result, makeFailure, makeOk, bind, mapResult, safe2, safe3 } from "../shared/result";
import { map, zipWith } from "ramda";
import { first, isEmpty, rest } from "../shared/list";

/*
Purpose: Transform the methods of a class special-form to single IfExp
Signature: makeIfExpsForClass(methods)
Type: Binding[] => IfExp
*/
export const makeIfExpsForClass = (methods: Binding[]): IfExp => {
    return isEmpty(rest(methods)) ?
        makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp("'"+first(methods).var.var)]), makeAppExp(first(methods).val,[]), makeBoolExp(false)) :
        makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp("'"+first(methods).var.var)]), makeAppExp(first(methods).val,[]), makeIfExpsForClass(rest(methods)));
}

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => 
    makeProcExp(exp.fields, [makeProcExp([makeVarDecl("msg")], [makeIfExpsForClass(exp.methods)])])

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp) ? rewriteAllClassExp(exp) :
    isProgram(exp) ? bind(mapResult(rewriteAllClassExp, exp.exps), (exps: Exp[]) => makeOk(makeProgram(exps))) :
    exp;

/*
Purpose: re-write all class expressions in a given expression
Signature: rewriteAllClassExp(exp)
Type: [Exp] => Result<Exp>
*/
const rewriteAllClassExp = (exp: Exp): Result<Exp> =>
    isCExp(exp) ? rewriteAllClassCExp(exp) :
    isDefineExp(exp) ? bind(rewriteAllClassCExp(exp.val), (val: CExp) => makeOk(makeDefineExp(exp.var, val))) :
    exp;

/*
Purpose: re-write all class expressions in a given CExp
Signature: rewriteAllClassCExp(exp)
Type: [CExp] => Result<CExp>
*/
const rewriteAllClassCExp = (exp: CExp): Result<CExp> =>
    isAtomicExp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp) :
    isIfExp(exp) ? safe3((test: CExp, then: CExp, alt: CExp) => makeOk(makeIfExp(test, then, alt)))
                        (rewriteAllClassCExp(exp.test), rewriteAllClassCExp(exp.then), rewriteAllClassCExp(exp.alt)) :
    isAppExp(exp) ? safe2((rator: CExp, rands: CExp[]) => makeOk(makeAppExp(rator, rands)))
                        (rewriteAllClassCExp(exp.rator), mapResult(rewriteAllClassCExp, exp.rands)) :
    isProcExp(exp) ? bind(mapResult(rewriteAllClassCExp, exp.body), (body: CExp[]) => makeOk(makeProcExp(exp.args, body))) :
    isLetExp(exp) ? safe2((bindings: Binding[],body: CExp[]) => makeOk(makeLetExp(bindings, body)))
                    (bind(mapResult(rewriteAllClassCExp,map(b=>b.val,exp.bindings)),(vals: CExp[])=> makeOk(zipWith(makeBinding,map(b=>b.var.var,exp.bindings),vals))), mapResult(rewriteAllClassCExp,exp.body)) :
    isClassExp(exp) ? makeOk(class2proc(exp)) :
    makeFailure(`Unexpected CExp: ${exp}`);