/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Institute extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async addUser(ctx, rollno, designation, department) {
        console.info('============= START : Create User ===========');

        const user = {
            docType: 'user',
            designation,
            department,
        };
        await ctx.stub.putState(rollno, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User ===========');
    }

    async modifyUser(ctx, rollno, newdesignation, newdepartment){
        console.info('============= START : Modify User ===========');
        const userAsBytes = await ctx.stub.getState(rollno);
        if(!userAsBytes||userAsBytes.length==0){
            throw new Error(`${rollno} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.designation = newdesignation;
        user.department = newdepartment;
        await ctx.stub.putState(rollno, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Modify User ===========');
    }
    
    async addSubRule(ctx, ruleno, designation, department){
        console.info('============= START : Create Rule ===========');

        const rule = {
            docType: 'rule',
            designation,
            department,
        };

        await ctx.stub.putState(ruleno, Buffer.from(JSON.stringify(rule)));
        console.info('============= END : Create Rule===========');
    }

    async modifySubRule(ctx, ruleno, newdesignation, newdepartment){
        console.info('============= START : Modify User ===========');
        let ruleAsBytes = await ctx.stub.getState(ruleno);
        if(!ruleAsBytes||ruleAsBytes.length==0){
            throw new Error(`${ruleno} does not exist`);
        }
        const rule = JSON.parse(ruleAsBytes.toString());
        rule.designation = newdesignation;
        rule.department = newdepartment;
        await ctx.stub.putState(ruleno, Buffer.from(JSON.stringify(rule)));
        console.info('============= END : Modify User ===========');
    }

    async accessrequest(ctx,rollno){
        const result=[];
        console.info('=========== START : Get User Attributes with given rollno ==========')
        const userAsBytes = await ctx.stub.getState(rollno);
        if(!userAsBytes||userAsBytes.length==0){
            throw new  Error(`${rollno} does not exist`);
        }
        const user=JSON.parse(userAsBytes.toString());
        let i=0;
        while(true){
            let ruleAsBytes = await ctx.stub.getState('Rule'+i);
            if(!ruleAsBytes||ruleAsBytes.length==0){
                break;
            }
            let rule = JSON.parse(ruleAsBytes.toString());
            if(user.designation==rule.designation&&user.department==rule.department){
                result.push("yes");
            }else{
                result.push("no");
            }
            i++;
        }
        console.info('=========== END : Get User Attributes with given rollno ==========');
        return JSON.stringify(result);
    }
}

module.exports.Institute = Institute;

