import { map } from 'ramda';
import { Exp, isBoolExp, isNumExp, isStrExp, isLitExp, Program, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isLetExp, isDefineExp, isProgram, ProcExp, LitExp, VarDecl, AppExp, DefineExp, IfExp } from '../imp/L3-ast';
import { isEmptySExp, valueToString } from '../imp/L3-value';
import { Result, makeFailure, makeOk, mapResult, safe2, bind, safe3 } from '../shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isBoolExp(exp) ? (exp.val ? makeOk('True') : makeOk('False')) :
    isNumExp(exp) ? makeOk(valueToString(exp.val)) :
    isStrExp(exp) ? makeOk(valueToString(exp.val)) :
    isVarRef(exp) ? makeOk(exp.var) :
    isProcExp(exp) ? unparseProcExp(exp) :
    isIfExp(exp) ? unparseIfExp(exp) :
    isAppExp(exp) ? unparseAppExp(exp) :
    isPrimOp(exp) ? unparsePrimOp(exp.op) :
    isDefineExp(exp) ? unparseDefineExp(exp) :
    isProgram(exp) ? unparseProgram(exp.exps) :
    makeFailure("Invalid L2 program or Expression")

/*
Purpose: Transform ProcExp to python lambda string
Signature: unparseProcExp(exp)
Type: [ProcExp] => Result<string>
*/
const unparseProcExp = (exp: ProcExp): Result<string> =>
    bind(mapResult(l2ToPython, exp.body), body => makeOk(`(lambda ${map((b: VarDecl) => b.var,exp.args).join(",")} : ${(body[0])})`))

/*
Purpose: Transform AppExp to python expression string
Signature: unparseAppExp(exp)
Type: [AppExp] => Result<string>
*/
const unparseAppExp = (exp: AppExp): Result<string> =>
    isPrimOp(exp.rator) && exp.rator.op === "not" ? bind(mapResult(l2ToPython, exp.rands), rands => makeOk(`(not ${rands[0]})`)) :
    isPrimOp(exp.rator) ? (
        ["number?","boolean?","string?"].includes(exp.rator.op) ?
            safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands[0]})`))
                (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)) :
        ["eq?","=", "and", "or", ">", "<"].includes(exp.rator.op) ?
            safe2((rator: string, rands: string[]) => makeOk(`(${rands[0]} ${rator} ${rands[1]})`))
                (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)) :
            safe2((rator: string, rands: string[]) => makeOk(`(${rands.join(` ${rator} `)})`))
                (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)) 
    ):
    safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(",")})`))
        (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands));

/*
Purpose: Transform DefineExp to python assignment expression string
Signature: unparseDefineExp(exp)
Type: [DefineExp] => Result<string>
*/
const unparseDefineExp = (exp: DefineExp): Result<string> =>
    bind(l2ToPython(exp.val), val => makeOk(`${exp.var.var} = ${val}`)) 
        
/*
Purpose: Transform primOp to python primitive operation string
Signature: unparsePrimOp(op)
Type: [string] => Result<string>
*/
const unparsePrimOp = (op: string): Result<string> =>
    op === "=" ? makeOk("==") :
    op === "eq?" ? makeOk("=="):
    op === "not" ? makeOk("not") :
    op === "or" ? makeOk("or") :
    op === "and" ? makeOk("and") :
    op === "number?" ? makeOk("(lambda x : (type(x) == int) or (type(x) == float))") :
    op === "boolean?" ? makeOk("(lambda x : (typeof(x) == bool))") :
    op === "string?" ? makeOk("(lambda x : (type(x) == str))") :
    makeOk(op);

/*
Purpose: Transform Program to python string
Signature: unparseProgram(exp)
Type: [Exp[]] => Result<string>
*/
const unparseProgram = (exps: Exp[]): Result<string> =>
    bind(mapResult(l2ToPython, exps), exps => makeOk(`${exps.join("\n")}`));

/*
Purpose: Transform IfExp to python if-statement string
Signature: unparseIfExp(exp)
Type: [IfExp] => Result<string>
*/
const unparseIfExp = (exp: IfExp): Result<string> =>
    safe3((test: string, then: string, alt: string) => makeOk(`(${then} if ${test} else ${alt})`))
            (l2ToPython(exp.test), l2ToPython(exp.then), l2ToPython(exp.alt))
