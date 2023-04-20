const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Web3 = require('web3');

const app = express();
const web3 = new Web3('https://mainnet.infura.io/v3/3e2069a4b6454b729d57e2d37401d2f5'); // Replace YOUR-PROJECT-ID with your Infura project ID

mongoose.connect('mongodb://127.0.0.1:27017/tutorial', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB:', error);
  });

// Define the schema for the valid private keys
const validKeySchema = new mongoose.Schema({
  privateKey: String,
  address: String,
  balance: Number
});

// Define the model for the valid private keys
const ValidKey = mongoose.model('ValidKey', validKeySchema);

async function generateAndSaveKeys(numKeys) {
    let count = 0;
    while (count < numKeys) {
      const privateKey = crypto.randomBytes(32).toString('hex'); // Generate a random private key
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const balance = await web3.eth.getBalance(account.address);
      console.log(`Checked key ${count + 1}`);
      if (balance > 0) {
        const balanceInEther = web3.utils.fromWei(balance, 'ether');
        const validKey = new ValidKey({
          privateKey,
          address: account.address,
          balance: balanceInEther,
        });
        console.log('Valid private key found:', privateKey);
        console.log('Balance:', balanceInEther, 'ETH');
        // Save the valid private key to the MongoDB database
        validKey.save()
          .then(() => {
            console.log('Key saved successfully');
          })
          .catch((error) => {
            console.log('Error saving key:', error);
          });
      } else {
        console.log(`Key ${count + 1} has 0 ETH balance`);
      }
      count++;
    }
    console.log(`Checked ${numKeys} keys`);
  }
  
  app.get('/generate', (req, res) => {
    const numKeys = 1000000;
    generateAndSaveKeys(numKeys);
    res.send(`Generating ${numKeys} new private keys...`);
  });

app.listen(3300, () => {
  console.log('App is running');
});
