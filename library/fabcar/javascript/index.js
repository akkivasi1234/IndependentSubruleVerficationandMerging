const express=require("express");
const bodyParser=require("body-parser");
const fetch=require("node-fetch");
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app=express();
const jsonparser=bodyParser.json();
const urlencodedparser=bodyParser.urlencoded({extended:false});
console.log(__dirname);
app.use(express.static(__dirname));

var i=0;
app.post("/file",urlencodedparser,(req,res)=>{
    async function main() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.    
            const network=await gateway.getNetwork('mychannel');
            // Get the contract from the network.
            const library = network.getContract('library');
            await library.submitTransaction('addFile', req.body.filename, req.body.filetype, req.body.sensitivity);
            console.log(req.body.filename+' has been added');
            // Disconnect from the gateway.
            await gateway.disconnect();
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
    }
    main();
    console.log(req.body);
    res.redirect("/");
});
app.post("/rule",urlencodedparser,(req,res)=>{
    async function main() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network=await gateway.getNetwork('mychannel');
    
            // Get the contract from the network.
            const library = network.getContract('library');
    
            await library.submitTransaction('addSubRule', 'Rule'+i, req.body.operation, req.body.filetype, req.body.sensitivity);
            console.log('Rule'+i+' has been added');
            // Disconnect from the gateway.
            await gateway.disconnect();
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
        i++;
    }
    main();
    console.log(req.body);
    res.redirect("/");
});
app.post("/access",urlencodedparser,async (req,res)=>{
    console.log(req.body);
    let result1;
    const sentdata={
        rollno:req.body.rollno,
    };
    try{
       let {success, data} = await getDataFromServer2(sentdata);
       result1=data;
    }catch(e){
        console.log("Error");
    }
    function getDataFromServer2(data){
        const jsondata=JSON.stringify(data);
        return fetch('http://35.224.73.166:8000/access', { 
            method: 'post',
            body:    jsondata,
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json())
          .then((response)=>{
            return {
             success: true,
             data: response
            }
          }).catch((error) => {
            throw new Error("unable to fetch the roles ")
          })
    }
    async function main() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('appUser');
            if (!identity) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const library = network.getContract('library');
            let result2 = await library.evaluateTransaction('accessrequest', req.body.operation, req.body.filename);
            result2=result2.toString('utf-8');
            console.log(result1);
            console.log(result2);
            // result1=JSON.parse(result1);
            result2=JSON.parse(result2);
            // console.log(result2);
            let len1=result1.length;
            let len2=result2.length;
            console.log(len1);
            console.log(len2);
            let j;
            for(j=0;j<len1;j++){
                if(result1[j]=="yes"&&result2[j]=="yes"){
                    console.log("Access Granted");
                    break;
                }
            }
            if(j==len1){
                console.log("Access Denied");
            }
            // Disconnect from the gateway.
            await gateway.disconnect();
            
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            process.exit(1);
        }
    }
    main();
    res.redirect("/");
});
app.listen(8000,()=>{
    console.log("listening the port at 8000");
});
