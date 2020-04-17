import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="#">Navbar</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown"> 
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">Link1</a> 
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Link2</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Link3</a>
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
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>            
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical-split">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
              Card Title
              </div>
              <div class="card-body">
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a className="card-link" href="#">Card link</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;