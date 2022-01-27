/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Library extends Contract{
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }
    async addFile(ctx, filename, filetype, sensitivity) {
        console.info('============= START : Create File ===========');

        const file = {
            docType: 'file',
            filetype,
            sensitivity,
        };

        await ctx.stub.putState(filename, Buffer.from(JSON.stringify(file)));
        console.info('============= END : Create File ===========');
    }

    async modifyFile(ctx, filename, newfiletype, newsensitivity){
        console.info('============= START : Modify User ===========');
        const fileAsBytes = await ctx.stub.getState(filename);
        if(!fileAsBytes||fileAsBytes.length==0){
            throw new Error(`${filename} does not exist`);
        }
        const file = JSON.parse(fileAsBytes.toString());
        file.filetype = newfiletype;
        file.sensitivity = newsensitivity;
        await ctx.stub.putState(filename, Buffer.from(JSON.stringify(file)));
        console.info('============= END : Modify User ===========');
    }
   
    async addSubRule(ctx, ruleno, operation, filetype, sensitivity) {
        console.info('============= START : Create Rule ===========');
        const rule = {
            docType: 'rule',
            operation,
            filetype,
            sensitivity,
        };
        await ctx.stub.putState(ruleno, Buffer.from(JSON.stringify(rule)));
        console.info('============= END : Create Rule ===========');
    }

    async modifySubRule(ctx, ruleno, newoperation, newfiletype, newsensitivity){
        console.info('============= START : Modify Rule ===========');
        const ruleAsBytes = await ctx.stub.getState(ruleno);
        if(!ruleAsBytes||ruleAsBytes.length==0){
            throw new Error(`${ruleno} does not exist`);
        }
        const rule = JSON.parse(ruleAsBytes.toString());
        rule.operation = newoperation;
        rule.filetype = newfiletype;
        rule.sensitivity = newsensitivity;
        await ctx.stub.putState(ruleno, Buffer.from(JSON.stringify(rule)));
        console.info('============= END : Modify Rule ===========');
    }

    async accessrequest(ctx, operation, filename){
        const result=[];
        const fileAsBytes = await ctx.stub.getState(filename);
        if(!fileAsBytes||fileAsBytes.length==0){
            throw new Error(`${filename} does not exist`);
        }
        const file = JSON.parse(fileAsBytes.toString());
        const filetype = file.filetype;
        const sensitivity = file.sensitivity;

        let i=0;
        while(true){
            let ruleAsBytes = await ctx.stub.getState('Rule'+i);
            if(!ruleAsBytes||ruleAsBytes.length==0){
                break;
            }
            let rule = JSON.parse(ruleAsBytes.toString());
            if(operation==rule.operation&&filetype==rule.filetype&&sensitivity<=rule.sensitivity){
                result.push("yes");
            }else{
                result.push("no");
            }
            i++;
        }
        return JSON.stringify(result);
    }
    
}
module.exports.Library = Library;