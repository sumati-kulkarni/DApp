import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'
import Token from '../abis/Token.json'

class App extends Component {
  // react lifecycle function
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    // setup web3
    // fetch smart contracts and accounts and everything

    // connect to blockchain
    const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545')
    const network = await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    const accounts = await web3.eth.getAccounts()
    // console.log("networkId", networkId)

    // import token
    // we need 2 things, Json Interface and address. This is available in abi's JSON file
    // Json Interface - tells us how the token works, what the functions and its arguments are, what are the properties of smart contract are
    // address tells us where it is on blockchain
    // const abi = Token.abi
    // const networks = Token.networks
    // console.log("networks", networks)

    // if networkId is NULL, the following statement blows out
    // console.log("address", Token.networks[networkId].address)

    // this gives web3 contract, with which we can call smart contract functions, read/write smart contract
    const token = web3.eth.Contract(Token.abi, Token.networks[networkId].address)

    // call methods read information from smart contract
    // for writing data we use send()
    const totalSupply = await token.methods.totalSupply().call()
    console.log(totalSupply)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="/#">Navbar</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="/#navbarNavDropdown" >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown"> 
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/#">Link1</a> 
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link2</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link3</a>
              </li>
            </ul>
          </div>
        </nav>
        <div className="content">
          <div className="vertical-split">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>            
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical-split">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="/#">Card link</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;